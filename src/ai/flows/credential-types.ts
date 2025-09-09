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
    shares: z.array(z.string()).describe("The Shamir's secret shares as hex strings."),
    zkProof: z.string().describe("The Zero-Knowledge Proof of master password ownership."),
    publicSignals: z.string().describe("The public signals for the ZK-Proof."),
});
export type AddCredentialOutput = z.infer<typeof AddCredentialOutputSchema>;


// == REVEAL CREDENTIAL FLOW ==

export const RevealCredentialInputSchema = z.object({
    masterPassword: z.string().describe("The user's master password."),
    shares: z.array(z.string()).describe("The Shamir's secret shares as hex strings."),
    zkProof: z.string().describe("The ZK-Proof to verify."),
    publicSignals: z.string().describe("The public signals for the ZK-Proof."),
});
export type RevealCredentialInput = z.infer<typeof RevealCredentialInputSchema>;


export const RevealCredentialOutputSchema = z.object({
    plaintextPassword: z.string().describe("The decrypted password."),
});
export type RevealCredentialOutput = z.infer<typeof RevealCredentialOutputSchema>;
