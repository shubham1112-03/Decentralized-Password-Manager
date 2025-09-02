import { z } from 'genkit';

// == ADD CREDENTIAL FLOW ==

export const AddCredentialInputSchema = z.object({
  masterPassword: z.string().describe("The user's master password."),
  service: z.string().describe('The service name for the credential (e.g., GitHub).'),
  username: z.string().describe('The username for the service.'),
  password: z.string().describe('The password for the service.'),
});
export type AddCredentialInput = z.infer<typeof AddCredentialInputSchema>;

export const AddCredentialStreamSchema = z.object({
  step: z.string().describe("The current step in the process."),
});

export const AddCredentialOutputSchema = z.object({
    encryptedPassword: z.string().describe("The AES-256 encrypted password, including IV and auth tag."),
    shares: z.array(z.string()).describe("The Shamir's secret shares of the encrypted password."),
    zkProof: z.string().describe("The Zero-Knowledge Proof of master password ownership."),
    publicSignals: z.string().describe("The public signals for the ZK-Proof."),
});


// == REVEAL CREDENTIAL FLOW ==

export const RevealCredentialInputSchema = z.object({
    masterPassword: z.string().describe("The user's master password."),
    encryptedPassword: z.string().describe("The encrypted password blob from storage."),
    shares: z.array(z.string()).describe("The Shamir's secret shares to reconstruct the secret."),
    zkProof: z.string().describe("The ZK-Proof to verify."),
    publicSignals: z.string().describe("The public signals for the ZK-Proof."),
});
export type RevealCredentialInput = z.infer<typeof RevealCredentialInputSchema>;


export const RevealCredentialStreamSchema = z.object({
    step: z.string().describe("The current step in the reveal process."),
});

export const RevealCredentialOutputSchema = z.object({
    plaintextPassword: z.string().describe("The decrypted password."),
});
