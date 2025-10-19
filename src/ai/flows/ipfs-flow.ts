'use server';
/**
 * @fileOverview A server-only flow for interacting with IPFS via Pinata.
 */
import { ai } from '@/ai/genkit';
import { AddToIpfsInputSchema, AddToIpfsOutputSchema, GetFromIpfsInputSchema, GetFromIpfsOutputSchema } from './ipfs-types';
import type { AddToIpfsInput, GetFromIpfsInput } from './ipfs-types';
import PinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

// Initialize the Pinata SDK once at the module level.
let pinata: PinataSDK | null = null;
const getPinata = () => {
    if (!pinata) {
        const jwt = process.env.PINATA_JWT;
        if (!jwt) {
            console.error("Pinata JWT is not set in environment variables.");
            throw new Error('IPFS service is not configured. Missing PINATA_JWT.');
        }
        pinata = new PinataSDK({ pinataJWTKey: jwt });
    }
    return pinata;
};

const addToIpfsFlow = ai.defineFlow(
  {
    name: 'addToIpfsFlow',
    inputSchema: AddToIpfsInputSchema,
    outputSchema: AddToIpfsOutputSchema,
  },
  async ({ content }) => {
    try {
        const pinata = getPinata();
        const stream = Readable.from(content);
        const result = await pinata.pinFileToIPFS(stream, {
            pinataMetadata: { name: `CipherSafeShare-${Date.now()}` }
        });
        return result.IpfsHash;
    } catch (error: any) {
      console.error("Error pinning to Pinata:", error);
      // Provide a user-friendly error message
      if (error.message.includes('permission')) {
          throw new Error('Could not upload to IPFS. Please check your Pinata JWT permissions.');
      }
      throw new Error('Could not upload credential fragment to IPFS.');
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
        // Using a public gateway does not require the SDK.
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        
        const response = await fetch(gatewayUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch from IPFS gateway. Status: ${response.status}`);
        }

        return await response.text();
    } catch (error: any) {
        console.error("Error retrieving from Pinata gateway:", error);
        throw new Error(`Could not retrieve data for CID ${cid} from IPFS.`);
    }
  }
);

export async function getFromIpfs(input: GetFromIpfsInput): Promise<string> {
    return await getFromIpfsFlow(input);
}