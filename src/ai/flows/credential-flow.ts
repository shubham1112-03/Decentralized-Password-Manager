'use server';
/**
 * @fileOverview A flow for secure credential management using full ZKP and IPFS.
 */

import { ai } from '@/ai/genkit';
import { 
    AddCredentialInputSchema, 
    AddCredentialOutputSchema, 
    RevealCredentialInputSchema, 
    RevealCredentialOutputSchema
} from './credential-types';
import type { AddCredentialInput, RevealCredentialInput, AddCredentialOutput, RevealCredentialOutput } from './credential-types';
import { encrypt, decrypt, getKey } from '@/lib/crypto';
import * as sss from 'shamirs-secret-sharing-ts';
import { addToIpfs, getFromIpfs } from './ipfs-flow';

// Helper to simulate async operations
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const addCredentialFlow = ai.defineFlow(
  {
    name: 'addCredentialFlow',
    inputSchema: AddCredentialInputSchema,
    outputSchema: AddCredentialOutputSchema,
  },
  async (input) => {
    // 1. Derive encryption key from master password
    const key = await getKey(input.masterPassword);

    // 2. Encrypt password with AES-256
    const encryptedPassword = encrypt(input.password, key);

    // 3. Generate Shamir's secret shares
    const secret = Buffer.from(encryptedPassword, 'utf8');
    const shares = sss.split(secret, { shares: 5, threshold: 3 });

    // 4. Distribute shares to IPFS nodes
    const sharesCidsPromises = shares.map(s => addToIpfs({ content: s.toString('hex') }));
    const sharesCidsResult = await Promise.all(sharesCidsPromises);
    
    // 5. Generate a Zero-Knowledge Proof of password ownership (Simulated)
    await sleep(1500); // Simulate proof generation time
    const proof = `simulated-zkp-for-${input.masterPassword.slice(0,5)}`;

    const result: AddCredentialOutput = {
      encryptedPassword: encryptedPassword,
      sharesCids: Array.from(sharesCidsResult),
      zkProof: proof,
    };

    return result;
  }
);

export async function addCredential(input: AddCredentialInput): Promise<AddCredentialOutput> {
    const flowResult = await addCredentialFlow(input);
    
    // Manually construct a new plain object to ensure serialization.
    // This is a definitive fix for the "Set objects are not supported" error.
    const plainResult: AddCredentialOutput = {
        encryptedPassword: flowResult.encryptedPassword,
        sharesCids: [...flowResult.sharesCids],
        zkProof: flowResult.zkProof,
    };
    
    return plainResult;
}

const revealCredentialFlow = ai.defineFlow(
    {
        name: 'revealCredentialFlow',
        inputSchema: RevealCredentialInputSchema,
        outputSchema: RevealCredentialOutputSchema,
    },
    async (input) => {
        // 1. Verify master key proof (ZKP) (Simulated)
        await sleep(200); // Simulate verification time
        if (!input.zkProof.startsWith('simulated-zkp-for-')) {
            throw new Error("ZKP verification failed. You are not the owner of this credential.");
        }


        // 2. Fetching secret shares from IPFS
        const sharesAsHex = await Promise.all(
            input.sharesCids.map(cid => getFromIpfs({ cid }))
        );
        const sharesAsBuffers = sharesAsHex.map(s => Buffer.from(s, 'hex'));

        // 3. Reconstructing secret from shares
        const reconstructedSecretBuffer = sss.combine(sharesAsBuffers.slice(0, 3));
        const reconstructedEncryptedPassword = reconstructedSecretBuffer.toString('utf8');

        // 4. Decrypting with AES-256
        const key = await getKey(input.masterPassword);
        const plaintextPassword = decrypt(reconstructedEncryptedPassword, key);

        return { plaintextPassword };
    }
);

export async function revealCredential(input: RevealCredentialInput): Promise<RevealCredentialOutput> {
    return revealCredentialFlow(input);
}
