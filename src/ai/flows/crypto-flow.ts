'use server';
/**
 * @fileOverview A flow for handling cryptographic operations like hashing and verification.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as argon2 from 'argon2';
import { HashPasswordInputSchema, HashPasswordOutputSchema, VerifyPasswordInputSchema, VerifyPasswordOutputSchema } from './crypto-types';
import type { HashPasswordInput, VerifyPasswordInput } from './crypto-types';

const hashPasswordFlow = ai.defineFlow(
  {
    name: 'hashPasswordFlow',
    inputSchema: HashPasswordInputSchema,
    outputSchema: HashPasswordOutputSchema,
  },
  async (input) => {
    const hashedPassword = await argon2.hash(input.password);
    return { hashedPassword };
  }
);

export async function hashPassword(input: HashPasswordInput) {
    return hashPasswordFlow(input);
}

const verifyPasswordFlow = ai.defineFlow(
    {
        name: 'verifyPasswordFlow',
        inputSchema: VerifyPasswordInputSchema,
        outputSchema: VerifyPasswordOutputSchema,
    },
    async (input) => {
        const isVerified = await argon2.verify(input.hashedPassword, input.password);
        return { isVerified };
    }
);

export async function verifyPassword(input: VerifyPasswordInput) {
    return verifyPasswordFlow(input);
}
