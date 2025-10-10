'use server';
/**
 * @fileOverview A server-only flow for interacting with IPFS via Pinata.
 * This file is currently configured to use a DUMMY implementation for testing.
 */
import { ai } from '@/ai/genkit';
import { AddToIpfsInputSchema, AddToIpfsOutputSchema, GetFromIpfsInputSchema, GetFromIpfsOutputSchema } from './ipfs-types';
import type { AddToIpfsInput, GetFromIpfsInput } from './ipfs-types';

const DUMMY_PREFIX = 'dummy-ipfs:';

const addToIpfsFlow = ai.defineFlow(
  {
    name: 'addToIpfsFlow',
    inputSchema: AddToIpfsInputSchema,
    outputSchema: AddToIpfsOutputSchema,
  },
  async ({ content }) => {
    // DUMMY IMPLEMENTATION: Encode content into a fake CID
    try {
      const encodedContent = Buffer.from(content).toString('base64');
      return `${DUMMY_PREFIX}${encodedContent}`;
    } catch (error: any) {
      console.error("Error in dummy addToIpfs:", error);
      throw new Error('Could not create dummy IPFS data.');
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
    // DUMMY IMPLEMENTATION: Decode content from the fake CID
    try {
      if (!cid.startsWith(DUMMY_PREFIX)) {
        throw new Error('Invalid dummy CID format.');
      }
      const encodedContent = cid.substring(DUMMY_PREFIX.length);
      const decodedContent = Buffer.from(encodedContent, 'base64').toString('utf8');
      return decodedContent;
    } catch (error: any) {
        console.error("Error in dummy getFromIpfs:", error);
        throw new Error('Could not retrieve dummy IPFS data.');
    }
  }
);

export async function getFromIpfs(input: GetFromIpfsInput): Promise<string> {
    return await getFromIpfsFlow(input);
}
