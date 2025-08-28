export type Credential = {
  id: string;
  service: string;
  username: string;
  encryptedPassword: string;
  plaintextPassword: string; // For simulation purposes
};
