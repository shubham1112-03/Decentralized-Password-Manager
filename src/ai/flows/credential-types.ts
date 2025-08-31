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
});


// == REVEAL CREDENTIAL FLOW ==

export const RevealCredentialInputSchema = z.object({
    masterPassword: z.string().describe("The user's master password."),
    encryptedPassword: z.string().describe("The encrypted password blob from storage."),
});
export type RevealCredentialInput = z.infer<typeof RevealCredentialInputSchema>;


export const RevealCredentialStreamSchema = z.object({
    step: z.string().describe("The current step in the reveal process."),
});

export const RevealCredentialOutputSchema = z.object({
    plaintextPassword: z.string().describe("The decrypted password."),
});
