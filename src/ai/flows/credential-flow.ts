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
    RevealCredentialOutputSchema,
    AddCredentialStreamSchema,
    RevealCredentialStreamSchema
} from './credential-types';
import type { AddCredentialInput, RevealCredentialInput } from './credential-types';
import { encrypt, decrypt, getKey } from '@/lib/crypto';
import * as sss from 'shamirs-secret-sharing-ts';
import * as snarkjs from 'snarkjs';
import { hashPassword, verifyPassword } from './crypto-flow';
import path from 'path';
import { promises as fs } from 'fs';


// Define a helper for simulation delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


async function getZkpFiles() {
    // In Next.js, process.cwd() is the project root.
    const wasmPath = path.join(process.cwd(), 'src', 'ai', 'zkp', 'circuit.wasm');
    const zkeyPath = path.join(process.cwd(), 'src', 'ai', 'zkp', 'circuit_final.zkey');
    const vkeyPath = path.join(process.cwd(), 'src', 'ai', 'zkp', 'verification_key.json');

    const verificationKey = JSON.parse(await fs.readFile(vkeyPath, 'utf8'));

    return { wasmPath, zkeyPath, verificationKey };
}


const addCredentialFlow = ai.defineFlow(
  {
    name: 'addCredentialFlow',
    inputSchema: AddCredentialInputSchema,
    outputSchema: AddCredentialOutputSchema,
    streamSchema: AddCredentialStreamSchema,
  },
  async function* (input) {
    // 1. Deriving encryption key from master password
    yield { step: "Deriving encryption key..." };
    const key = await getKey(input.masterPassword);

    // 2. Encrypt password with AES-256 using the derived key
    yield { step: "Encrypting password with AES-256..." };
    const encryptedPassword = encrypt(input.password, key);

    // 3. Generate Shamir's secret shares from the encrypted password
    yield { step: "Generating Shamir's secret shares..." };
    const secret = Buffer.from(encryptedPassword, 'utf8');
    const shares = sss.split(secret, { shares: 5, threshold: 3 });
    const sharesAsHex = shares.map(s => s.toString('hex'));

    // 4. Distribute shares to IPFS nodes (simulation)
    await sleep(700);
    yield { step: "Distributing shares to IPFS nodes..." };
    
    // 5. Generate a Zero-Knowledge Proof of password ownership
    yield { step: "Generating ZK-Proof of ownership..." };
    const { wasmPath, zkeyPath } = await getZkpFiles();
    
    // snarkjs requires a hash as a BigInt. We'll hash the master password.
    // In a real scenario, you'd use a more robust pre-image.
    const { hashedPassword } = await hashPassword({ password: input.masterPassword });
    const a = BigInt(Buffer.from(input.masterPassword).toString('hex'));
    const b = BigInt(Buffer.from(hashedPassword).toString('hex'));

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { a, b }, // The witness
        wasmPath,
        zkeyPath
    );

    await sleep(500);
    yield { step: "Done!" };

    return {
      encryptedPassword, // Keep this for simplicity, though it's now "in" the shares
      shares: sharesAsHex,
      zkProof: JSON.stringify(proof),
      publicSignals: JSON.stringify(publicSignals)
    };
  }
);

export async function addCredential(input: AddCredentialInput) {
    const { stream, output } = await addCredentialFlow(input);
    // Note: In a real app, you might handle the stream differently
    // For this use case, we'll just wait for the final output.
    for await (const _ of stream) {
        // Consuming the stream to ensure it runs
    }
    return output();
}


const revealCredentialFlow = ai.defineFlow(
    {
        name: 'revealCredentialFlow',
        inputSchema: RevealCredentialInputSchema,
        outputSchema: RevealCredentialOutputSchema,
        streamSchema: RevealCredentialStreamSchema
    },
    async function* (input) {
        // 1. Verify master key proof (ZKP)
        yield { step: "Verifying master key proof..." };
        const { verificationKey } = await getZkpFiles();
        const proof = JSON.parse(input.zkProof);
        const publicSignals = JSON.parse(input.publicSignals);
        const isProofValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);
        
        if (!isProofValid) {
            throw new Error("Zero-Knowledge Proof is invalid. Cannot proceed.");
        }

        // 2. Fetching secret shares from IPFS (simulation)
        yield { step: "Fetching secret shares from IPFS..." };
        await sleep(600);
        const sharesAsBuffers = input.shares.map(s => Buffer.from(s, 'hex'));

        // 3. Reconstructing secret from shares
        yield { step: "Reconstructing secret..." };
        // We only need the threshold number of shares (e.g., 3 out of 5)
        const reconstructedSecretBuffer = sss.combine(sharesAsBuffers.slice(0, 3));
        const reconstructedEncryptedPassword = reconstructedSecretBuffer.toString('utf8');

        // 4. Decrypting with AES-256
        yield { step: "Deriving decryption key..." };
        const key = await getKey(input.masterPassword);

        yield { step: "Decrypting with AES-256..." };
        const plaintextPassword = decrypt(reconstructedEncryptedPassword, key);

        await sleep(500);
        yield { step: "Done!" };

        return { plaintextPassword };
    }
);

export async function revealCredential(input: RevealCredentialInput) {
    const { stream, output } = await revealCredentialFlow(input);
     // Note: In a real app, you might handle the stream differently
    // For this use case, we'll just wait for the final output.
    for await (const _ of stream) {
        // Consuming the stream to ensure it runs
    }
    return output();
}
