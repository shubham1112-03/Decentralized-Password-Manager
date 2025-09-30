'use server';
/**
 * @fileOverview A server-only flow for interacting with IPFS via web3.storage.
 */
import { ai } from '@/ai/genkit';
import { AddToIpfsInputSchema, AddToIpfsOutputSchema, GetFromIpfsInputSchema, GetFromIpfsOutputSchema } from './ipfs-types';
import type { AddToIpfsInput, GetFromIpfsInput } from './ipfs-types';
import { Web3Storage } from 'web3.storage';

function getWeb3StorageClient(): Web3Storage {
    const token = process.env.WEB3_STORAGE_TOKEN;
    if (!token) {
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
      const file = new File([content], 'secret.txt', { type: 'text/plain' });
      const cid = await client.put([file], { wrapWithDirectory: false });
      
      if (!cid) {
        throw new Error('web3.storage did not return a CID.');
      }
      
      return cid;
    } catch (error: any) {
      console.error("Error uploading to web3.storage:", error);
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
            throw new Error(`Failed to fetch from web3.storage. Status: ${res.status}`);
        }
        
        const files = await res.files();
        if (files.length === 0) {
            throw new Error('No files found for the given CID.');
        }

        const content = await files[0].text();
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
