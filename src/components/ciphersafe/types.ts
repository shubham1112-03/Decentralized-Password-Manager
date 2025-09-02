export type Credential = {
  id: string;
  service: string;
  username: string;
  encryptedPassword: string;
  plaintextPassword?: string; // No longer used for storage, only reveal
  shares: string[];
  zkProof: string;
  publicSignals: string;
};
