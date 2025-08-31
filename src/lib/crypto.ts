import { scrypt, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { promisify } from 'util';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits
const SALT = 'your-super-secret-salt-that-is-at-least-16-bytes'; // In a real app, this should be unique per user and stored with their data

const scryptAsync = promisify(scrypt);

/**
 * Derives a cryptographic key from a password using scrypt.
 * This is a slow, memory-intensive function by design to protect against brute-force attacks.
 * @param password The user's master password.
 * @returns A promise that resolves to a 32-byte (256-bit) key.
 */
export async function getKey(password: string): Promise<Buffer> {
  return (await scryptAsync(password, SALT, KEY_LENGTH)) as Buffer;
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * @param text The plaintext to encrypt.
 * @param key The 32-byte encryption key.
 * @returns A string containing the IV, auth tag, and ciphertext, separated by colons.
 */
export function encrypt(text: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine iv, authTag, and encrypted data into a single string for storage
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string that was encrypted with AES-256-GCM.
 * @param encryptedText The encrypted string (iv:authTag:ciphertext).
 * @param key The 32-byte decryption key.
 * @returns The decrypted plaintext.
 */
export function decrypt(encryptedText: string, key: Buffer): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format. Expected iv:authTag:ciphertext');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');

    if (iv.length !== IV_LENGTH) {
        throw new Error(`Invalid IV length. Expected ${IV_LENGTH} bytes.`);
    }

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error("Decryption failed:", error);
    // In a real app, you might want to throw a more generic error
    // to avoid leaking details about why the decryption failed.
    throw new Error('Decryption failed. The master password may be incorrect or the data may be corrupt.');
  }
}
