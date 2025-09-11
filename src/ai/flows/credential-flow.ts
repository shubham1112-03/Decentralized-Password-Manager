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
import { addToIpfs, getFromIpfs } from '@/lib/ipfs';
import { generateProof, verifyProof } from './zkp-flow';

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
    const sharesCids = await Promise.all(
        shares.map(s => addToIpfs(s.toString('hex')))
    );
    
    // 5. Generate a Zero-Knowledge Proof of password ownership
    const { proof } = await generateProof({ privateInput: input.masterPassword });

    return {
      encryptedPassword,
      sharesCids,
      zkProof: proof,
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
        // 1. Verify master key proof (ZKP)
        const { isVerified } = await verifyProof({ proof: input.zkProof });
        if (!isVerified) {
            throw new Error("ZKP verification failed. You are not the owner of this credential.");
        }

        // 2. Fetching secret shares from IPFS
        const sharesAsHex = await Promise.all(
            input.sharesCids.map(cid => getFromIpfs(cid))
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
