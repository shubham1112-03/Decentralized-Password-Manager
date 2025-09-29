'use server';
/**
 * @fileOverview A server-only flow for interacting with IPFS via web3.storage.
 * This flow isolates the web3.storage SDK, which is not compatible with client-side execution.
 */

import { ai } from '@/ai/genkit';
import { Web3Storage, File } from 'web3.storage';
import { AddToIpfsInputSchema, AddToIpfsOutputSchema, GetFromIpfsInputSchema, GetFromIpfsOutputSchema } from './ipfs-types';
import type { AddToIpfsInput, GetFromIpfsInput } from './ipfs-types';

function getWeb3StorageClient() {
    const token = process.env.WEB3_STORAGE_TOKEN;
    if (!token || token === 'YOUR_WEB3_STORAGE_TOKEN') {
        throw new Error('web3.storage is not configured. Please add WEB3_STORAGE_TOKEN to your .env file.');
    }
    return new Web3Storage({ token });
}

const addToIpfsFlow = ai.defineFlow(
  {
    name: 'addToIpfsFlow',
    inputSchema: AddToIpfsInputSchema,
    outputSchema: AddToIpfsOutputSchema,
  },
  async ({ content }) => {
    try {
      const client = getWeb3StorageClient();
      const buffer = Buffer.from(content);
      const files = [new File([buffer], 'share.json')];
      const cid = await client.put(files, {
          name: `CipherSafe Share - ${new Date().toISOString()}`,
          wrapWithDirectory: false,
      });
      return cid;
    } catch (error: any) {
      console.error("Error uploading to web3.storage:", error);
      if (error.message && error.message.includes('maintenance')) {
        throw new Error('IPFS provider is currently undergoing maintenance. Please try again later.');
      }
      throw new Error('Could not upload data to the IPFS network via web3.storage.');
    }
  }
);

export async function addToIpfs(input: AddToIpfsInput): Promise<string> {
    return await addToIpfsFlow(input);
}

const getFromIpfsFlow = ai.defineFlow(
  {
    name: 'getFromIpfsFlow',
    inputSchema: GetFromIpfsInputSchema,
    outputSchema: GetFromIpfsOutputSchema,
  },
  async ({ cid }) => {
    try {
      const client = getWeb3StorageClient();
      const res = await client.get(cid);

      if (!res || !res.ok) {
        throw new Error(`Failed to get file with CID: ${cid}. Status: ${res.status}`);
      }

      const files = await res.files();
      if (!files || files.length === 0) {
          throw new Error(`No files found for CID: ${cid}`);
      }
      
      const file = files[0];
      const content = await file.text();
      
      // The content is a JSON file with a `data` property
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.data !== 'undefined') {
        return parsed.data;
      }
      // Or it could be the raw string if not wrapped
      return content;

    } catch (error: any) {
      console.error("Error fetching from web3.storage:", error);
      throw new Error('Could not retrieve data from the IPFS network via web3.storage.');
    }
  }
);

export async function getFromIpfs(input: GetFromIpfsInput): Promise<string> {
    return await getFromIpfsFlow(input);
}