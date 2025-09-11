import { z } from 'genkit';

// == ADD CREDENTIAL FLOW ==

export const AddCredentialInputSchema = z.object({
  masterPassword: z.string().describe("The user's master password."),
  service: z.string().describe('The service name for the credential (e.g., GitHub).'),
  username: z.string().describe('The username for the service.'),
  password: z.string().describe('The password for the service.'),
});
export type AddCredentialInput = z.infer<typeof AddCredentialInputSchema>;

export const AddCredentialOutputSchema = z.object({
    encryptedPassword: z.string().describe("The AES-256 encrypted password, including IV and auth tag."),
    sharesCids: z.array(z.string()).describe("The IPFS CIDs for the Shamir's secret shares."),
    zkProof: z.string().describe("The Zero-Knowledge Proof of master password ownership."),
});
export type AddCredentialOutput = z.infer<typeof AddCredentialOutputSchema>;


// == REVEAL CREDENTIAL FLOW ==

export const RevealCredentialInputSchema = z.object({
    masterPassword: z.string().describe("The user's master password."),
    sharesCids: z.array(z.string()).describe("The IPFS CIDs for the Shamir's secret shares."),
    zkProof: z.string().describe("The ZK-Proof to verify master password ownership."),
});
export type RevealCredentialInput = z.infer<typeof RevealCredentialInputSchema>;


export const RevealCredentialOutputSchema = z.object({
    plaintextPassword: z.string().describe("The decrypted password."),
});
export type RevealCredentialOutput = z.infer<typeof RevealCredentialOutputSchema>;
