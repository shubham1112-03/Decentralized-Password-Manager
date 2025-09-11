'use server';
/**
 * @fileOverview A flow for handling Zero-Knowledge Proof generation and verification using o1js.
 * This abstracts away the ZKP circuit logic and provides simple functions for other flows.
 */

import "reflect-metadata"; // Required for o1js
import { ai } from '@/ai/genkit';
import { Field, ZkProgram, verify, Provable, Character, Poseidon } from 'o1js';
import { GenerateProofInputSchema, GenerateProofOutputSchema, VerifyProofInputSchema, VerifyProofOutputSchema } from './zkp-types';
import type { GenerateProofInput, GenerateProofOutput, VerifyProofInput, VerifyProofOutput } from './zkp-types';

// == ZKP Circuit Definition using o1js ==

/**
 * A simple ZKP circuit to prove knowledge of a secret string
 * that hashes to a public value.
 * We use a simple circuit for demonstration; a real password circuit would be more complex.
 */
export const PasswordProof = ZkProgram({
  name: "PasswordProof",
  publicInput: Provable.Array(Field, 2), // Public hash [part1, part2]

  methods: {
    proveKnowledge: {
      privateInputs: [Provable.Array(Character, 32)],

      method(publicInput: Field[], privateInput: Character[]) {
        // Hash the private input (the password)
        const privateHash = Poseidon.hash(privateInput.map(c => c.toField()));
        
        // This is a simplified check. A real implementation should be more robust.
        // We split the hash into two fields for the public input.
        // This is just a way to represent the hash publicly.
        const hashFields = Poseidon.hash(privateHash.toFields());

        // Assert that the computed hash from the private input matches the public input
        publicInput[0].assertEquals(hashFields.toFields()[0]);
        publicInput[1].assertEquals(hashFields.toFields()[1]);
      },
    },
  },
});

// A small helper to compile the ZKP, memoized for efficiency
let isCompiled = false;
async function compileZkp() {
    if (!isCompiled) {
        await PasswordProof.compile();
        isCompiled = true;
    }
}

// == FLOW DEFINITIONS ==

/**
 * Hashes a string to be used as the public input for the ZKP.
 * @param input The string to hash.
 * @returns Two Fields representing the hash.
 */
function getPublicInput(input: string): [Field, Field] {
    const chars = Character.fromString(input.padEnd(32, ' '));
    const privateHash = Poseidon.hash(chars.map(c => c.toField()));
    const hashFields = Poseidon.hash(privateHash.toFields());
    return [hashFields.toFields()[0], hashFields.toFields()[1]];
}

const generateProofFlow = ai.defineFlow(
    {
        name: 'generateProofFlow',
        inputSchema: GenerateProofInputSchema,
        outputSchema: GenerateProofOutputSchema,
    },
    async (input): Promise<GenerateProofOutput> => {
        await compileZkp();
        
        const publicInput = getPublicInput(input.privateInput);
        const privateInput = Character.fromString(input.privateInput.padEnd(32, ' '));

        const proof = await PasswordProof.proveKnowledge(publicInput, privateInput);
        
        return { proof: JSON.stringify(proof.toJSON()) };
    }
);

export async function generateProof(input: GenerateProofInput): Promise<GenerateProofOutput> {
    return generateProofFlow(input);
}


const verifyProofFlow = ai.defineFlow(
    {
        name: 'verifyProofFlow',
        inputSchema: VerifyProofInputSchema,
        outputSchema: VerifyProofOutputSchema,
    },
    async (input): Promise<VerifyProofOutput> => {
        await compileZkp();

        const { ZkProgram: { Proof } } = await import('o1js');
        const proof = Proof.fromJSON(JSON.parse(input.proof));

        // @ts-ignore - The types for proof subclasses are tricky
        const isVerified = await verify(proof.toJSON(), PasswordProof.verificationKey);

        return { isVerified };
    }
);

export async function verifyProof(input: VerifyProofInput): Promise<VerifyProofOutput> {
    return verifyProofFlow(input);
}
