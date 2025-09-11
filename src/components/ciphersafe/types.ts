export type Credential = {
  id: string;
  uid?: string; // Owner of the credential
  service: string;
  username: string;
  encryptedPassword: string;
  sharesCids: string[];
  zkProof: string;
};
