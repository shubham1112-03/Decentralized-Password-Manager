'use server';
/**
 * @fileOverview A flow for simulating secure credential management.
 * This flow simulates the backend processes for adding and revealing credentials
 * using advanced cryptographic and decentralized technologies.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    AddCredentialInputSchema, 
    AddCredentialOutputSchema, 
    RevealCredentialInputSchema, 
    RevealCredentialOutputSchema
} from './credential-types';
import type { AddCredentialInput, RevealCredentialInput, AddCredentialOutput, RevealCredentialOutput } from './credential-types';
import { encrypt, decrypt, getKey } from '@/lib/crypto';
import * as sss from 'shamirs-secret-sharing-ts';

// Define a helper for simulation delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const addCredentialFlow = ai.defineFlow(
  {
    name: 'addCredentialFlow',
    inputSchema: AddCredentialInputSchema,
    outputSchema: AddCredentialOutputSchema,
  },
  async (input) => {
    // 1. Deriving encryption key from master password
    const key = await getKey(input.masterPassword);

    // 2. Encrypt password with AES-256 using the derived key
    const encryptedPassword = encrypt(input.password, key);

    // 3. Generate Shamir's secret shares from the encrypted password
    const secret = Buffer.from(encryptedPassword, 'utf8');
    const shares = sss.split(secret, { shares: 5, threshold: 3 });
    const sharesAsStrings = shares.map(s => s.toString('hex'));
    
    // 4. Distribute shares to IPFS nodes (simulation)
    await sleep(700);
    
    // 5. Generate a Zero-Knowledge Proof of password ownership (simulation)
    await sleep(1200);

    return {
      encryptedPassword,
      shares: sharesAsStrings,
      zkProof: JSON.stringify({ "pi_a": ["0", "0"], "pi_b": [["0", "0"], ["0", "0"]], "pi_c": ["0", "0"], "protocol": "groth16" }),
      publicSignals: JSON.stringify(["1"])
    };
  }
);

export async function addCredential(input: AddCredentialInput): Promise<AddCredentialOutput> {
    return addCredentialFlow(input);
}

const revealCredentialFlow = ai.defineFlow(
    {
        name: 'revealCredentialFlow',
        inputSchema: RevealCredentialInputSchema,
        outputSchema: RevealCredentialOutputSchema,
    },
    async (input) => {
        // 1. Verify master key proof (ZKP) (simulation)
        await sleep(300);
        if (!input.zkProof) {
            throw new Error("Zero-Knowledge Proof is missing. Cannot proceed.");
        }
        // Dummy check
        const proof = JSON.parse(input.zkProof);
        if(proof.protocol !== "groth16"){
             throw new Error("ZKP verification failed.");
        }

        // 2. Fetching secret shares from IPFS (simulation)
        await sleep(400);
        const sharesAsBuffers = input.shares.map(s => Buffer.from(s, 'hex'));

        // 3. Reconstructing secret from shares
        // We only need the threshold number of shares (e.g., 3 out of 5)
        const reconstructedSecretBuffer = sss.combine(sharesAsBuffers.slice(0, 3));
        const reconstructedEncryptedPassword = reconstructedSecretBuffer.toString('utf8');

        // 4. Decrypting with AES-256
        const key = await getKey(input.masterPassword);
        const plaintextPassword = decrypt(reconstructedEncryptedPassword, key);

        await sleep(500);

        return { plaintextPassword };
    }
);

export async function revealCredential(input: RevealCredentialInput): Promise<RevealCredentialOutput> {
    return revealCredentialFlow(input);
}
