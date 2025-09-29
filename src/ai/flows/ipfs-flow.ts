'use server';
/**
 * @fileOverview A server-only flow for interacting with IPFS via Pinata.
 * This flow isolates the Pinata SDK, which is not compatible with client-side execution.
 */

import { ai } from '@/ai/genkit';
import pinataSDK from '@pinata/sdk';
import { AddToIpfsInputSchema, AddToIpfsOutputSchema, GetFromIpfsInputSchema, GetFromIpfsOutputSchema } from './ipfs-types';
import type { AddToIpfsInput, GetFromIpfsInput } from './ipfs-types';

const addToIpfsFlow = ai.defineFlow(
  {
    name: 'addToIpfsFlow',
    inputSchema: AddToIpfsInputSchema,
    outputSchema: AddToIpfsOutputSchema,
  },
  async ({ content }) => {
    const jwt = process.env.PINATA_JWT;
    if (!jwt || jwt === 'YOUR_PINATA_JWT') {
      throw new Error('Pinata is not configured. Please add PINATA_JWT to your .env file.');
    }
    const pinata = new pinataSDK({ pinataJWTKey: jwt });

    try {
      // Pinata SDK expects an object to pin, so we wrap the content.
      const result = await pinata.pinJSONToIPFS({ data: content }, {
        pinataMetadata: {
          name: `CipherSafe Share - ${new Date().toISOString()}`,
        },
      });
      return result.IpfsHash;
    } catch (error: any) {
      console.error("Error uploading to Pinata:", error);
      throw new Error('Could not upload data to the IPFS network via Pinata.');
    }
  }
);

export async function addToIpfs(input: AddToIpfsInput): Promise<string> {
    const result = await addToIpfsFlow(input);
    return result;
}

const getFromIpfsFlow = ai.defineFlow(
  {
    name: 'getFromIpfsFlow',
    inputSchema: GetFromIpfsInputSchema,
    outputSchema: GetFromIpfsOutputSchema,
  },
  async ({ cid }) => {
    try {
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
      const response = await fetch(gatewayUrl);

      if (!response.ok) {
        throw new Error(`Failed to get file with CID: ${cid}. Status: ${response.status}`);
      }

      // We need to get the nested data property from the JSON response.
      const data = await response.json();
      if (data && typeof data.data !== 'undefined') {
        return data.data;
      }
      // Handle cases where the response might not be what we expect.
      throw new Error(`Unexpected data format from IPFS for CID: ${cid}`);

    } catch (error: any) {
      console.error("Error fetching from Pinata Gateway:", error);
      throw new Error('Could not retrieve data from the IPFS network via Pinata.');
    }
  }
);

export async function getFromIpfs(input: GetFromIpfsInput): Promise<string> {
    const result = await getFromIpfsFlow(input);
    return result;
}
