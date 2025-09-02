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
import * as snarkjs from 'snarkjs';
import { hashPassword } from './crypto-flow';
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
  },
  async (input) => {
    // 1. Deriving encryption key from master password
    const key = await getKey(input.masterPassword);

    // 2. Encrypt password with AES-256 using the derived key
    const encryptedPassword = encrypt(input.password, key);

    // 3. Generate Shamir's secret shares from the encrypted password
    const secret = Buffer.from(encryptedPassword, 'utf8');
    const shares = sss.split(secret, { shares: 5, threshold: 3 });
    const sharesAsHex = shares.map(s => s.toString('hex'));

    // 4. Distribute shares to IPFS nodes (simulation)
    await sleep(700);
    
    // 5. Generate a Zero-Knowledge Proof of password ownership
    const { wasmPath, zkeyPath } = await getZkpFiles();
    
    // snarkjs requires a hash as a BigInt. We'll hash the master password.
    // In a real scenario, you'd use a more robust pre-image.
    const { hashedPassword } = await hashPassword({ password: input.masterPassword });
    const a = BigInt("0x" + Buffer.from(input.masterPassword).toString('hex'));
    const b = BigInt("0x" + Buffer.from(hashedPassword).toString('hex'));
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { a, b }, // The witness
        wasmPath,
        zkeyPath
    );

    await sleep(500);

    return {
      encryptedPassword, // Keep this for simplicity, though it's now "in" the shares
      shares: sharesAsHex,
      zkProof: JSON.stringify(proof),
      publicSignals: JSON.stringify(publicSignals)
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
        const { verificationKey } = await getZkpFiles();
        const proof = JSON.parse(input.zkProof);
        const publicSignals = JSON.parse(input.publicSignals);
        const isProofValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);
        
        if (!isProofValid) {
            throw new Error("Zero-Knowledge Proof is invalid. Cannot proceed.");
        }

        // 2. Fetching secret shares from IPFS (simulation)
        await sleep(600);
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
