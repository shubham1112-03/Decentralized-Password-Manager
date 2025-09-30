/**
 * This service handles interaction with the IPFS network via Pinata.
 * It requires a Pinata API Key and API Secret.
 */

/**
 * Checks if Pinata is configured.
 * This check is performed on the client, so it only checks for the public key.
 * @returns true if the credentials are present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    const key = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    // We don't check for the secret on the client for security reasons.
    // The presence of the public key is enough to assume configuration.
    return !!(key && key !== 'YOUR_PINATA_API_KEY');
}
