import { z } from 'genkit';

// == GENERATE PROOF FLOW ==
export const GenerateProofInputSchema = z.object({
    privateInput: z.string().describe("The private value to prove knowledge of."),
});
export type GenerateProofInput = z.infer<typeof GenerateProofInputSchema>;


export const GenerateProofOutputSchema = z.object({
    proof: z.string().describe("The serialized ZK-Proof as a JSON string."),
});
export type GenerateProofOutput = z.infer<typeof GenerateProofOutputSchema>;


// == VERIFY PROOF FLOW ==
export const VerifyProofInputSchema = z.object({
    proof: z.string().describe("The serialized ZK-Proof to verify."),
});
export type VerifyProofInput = z.infer<typeof VerifyProofInputSchema>;


export const VerifyProofOutputSchema = z.object({
    isVerified: z.boolean().describe("Whether the proof is valid."),
});
export type VerifyProofOutput = z.infer<typeof VerifyProofOutputSchema>;
