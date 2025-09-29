'use server';
/**
 * @fileOverview A server-only flow for interacting with IPFS via Infura.
 * This flow isolates the IPFS client, which is not compatible with client-side execution.
 */
import { ai } from '@/ai/genkit';
import { create } from 'ipfs-http-client';
import { AddToIpfsInputSchema, AddToIpfsOutputSchema, GetFromIpfsInputSchema, GetFromIpfsOutputSchema } from './ipfs-types';
import type { AddToIpfsInput, GetFromIpfsInput } from './ipfs-types';

function getIpfsHttpClient() {
    const projectId = process.env.INFURA_IPFS_PROJECT_ID;
    const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;

    if (!projectId || !projectSecret) {
        throw new Error('Infura IPFS is not configured. Please add INFURA_IPFS_PROJECT_ID and INFURA_IPFS_PROJECT_SECRET to your .env file.');
    }
    
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
    
    return create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });
}

const addToIpfsFlow = ai.defineFlow(
  {
    name: 'addToIpfsFlow',
    inputSchema: AddToIpfsInputSchema,
    outputSchema: AddToIpfsOutputSchema,
  },
  async ({ content }) => {
    try {
      const client = getIpfsHttpClient();
      const { cid } = await client.add(content);
      return cid.toString();
    } catch (error: any) {
      console.error("Error uploading to Infura IPFS:", error);
      throw new Error('Could not upload data to the IPFS network via Infura.');
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
        // We can use the public gateway to fetch content, which doesn't require auth.
        const response = await fetch(`https://infura-ipfs.io/ipfs/${cid}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch from Infura IPFS gateway. Status: ${response.status}`);
        }
        const content = await response.text();
        return content;
    } catch (error: any) {
        console.error("Error fetching from Infura IPFS:", error);
        throw new Error('Could not retrieve data from the IPFS network via Infura.');
    }
  }
);

export async function getFromIpfs(input: GetFromIpfsInput): Promise<string> {
    return await getFromIpfsFlow(input);
}
