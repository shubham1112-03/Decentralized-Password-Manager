import { z } from 'genkit';

// == HASH PASSWORD FLOW ==
export const HashPasswordInputSchema = z.object({
    password: z.string().describe("The plaintext password to hash."),
});
export type HashPasswordInput = z.infer<typeof HashPasswordInputSchema>;

export const HashPasswordOutputSchema = z.object({
    hashedPassword: z.string().describe("The resulting Argon2 hash."),
});


// == VERIFY PASSWORD FLOW ==
export const VerifyPasswordInputSchema = z.object({
    hashedPassword: z.string().describe("The stored password hash."),
    password: z.string().describe("The plaintext password to verify."),
});
export type VerifyPasswordInput = z.infer<typeof VerifyPasswordInputSchema>;

export const VerifyPasswordOutputSchema = z.object({
    isVerified: z.boolean().describe("Whether the password matches the hash."),
});
