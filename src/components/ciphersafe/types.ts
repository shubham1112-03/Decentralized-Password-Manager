export type Credential = {
  id: string;
  uid?: string; // Owner of the credential
  service: string;
  username: string;
  encryptedPassword: string;
  plaintextPassword?: string; // No longer used for storage, only reveal
  sharesCids: string[];
  zkProof: string;
  publicSignals: string;
};
