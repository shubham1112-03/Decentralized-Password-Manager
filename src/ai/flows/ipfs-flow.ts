'use server';
/**
 * @fileOverview A server-only flow for interacting with IPFS via Pinata.
 */
import { ai } from '@/ai/genkit';
import { AddToIpfsInputSchema, AddToIpfsOutputSchema, GetFromIpfsInputSchema, GetFromIpfsOutputSchema } from './ipfs-types';
import type { AddToIpfsInput, GetFromIpfsInput } from './ipfs-types';
import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";

function getPinataClient() {
    const key = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const secret = process.env.PINATA_API_SECRET;
    
    if (!key || !secret) {
        throw new Error('Pinata is not configured. Please add NEXT_PUBLIC_PINATA_API_KEY and PINATA_API_SECRET to your .env file.');
    }
    return new pinataSDK(key, secret);
}

const addToIpfsFlow = ai.defineFlow(
  {
    name: 'addToIpfsFlow',
    inputSchema: AddToIpfsInputSchema,
    outputSchema: AddToIpfsOutputSchema,
  },
  async ({ content }) => {
    try {
      const pinata = getPinataClient();
      const stream = Readable.from(content);
      
      // The Pinata SDK v2 requires the stream to have a path property.
      // We can satisfy this by adding a path to the stream object.
      (stream as any).path = `CipherSafe-Share-${Date.now()}`;

      const options = {
        pinataMetadata: {
          name: `CipherSafe-Share-${Date.now()}`,
        },
      };

      const result = await pinata.pinFileToIPFS(stream, options);
      
      if (!result.IpfsHash) {
        throw new Error('Pinata did not return a CID (IpfsHash).');
      }
      
      return result.IpfsHash;
    } catch (error: any) {
      console.error("Error uploading to Pinata:", error);
      throw new Error('Could not upload data to the IPFS network via Pinata.');
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
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        const response = await fetch(gatewayUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch from Pinata gateway. Status: ${response.status}`);
        }
        
        const content = await response.text();
        return content;
    } catch (error: any) {
        console.error("Error fetching from Pinata:", error);
        throw new Error('Could not retrieve data from the IPFS network via Pinata.');
    }
  }
);

export async function getFromIpfs(input: GetFromIpfsInput): Promise<string> {
    return await getFromIpfsFlow(input);
}
