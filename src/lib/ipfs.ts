/**
 * This service handles interaction with the IPFS network via Pinata.
 * It requires a Pinata JWT.
 */

/**
 * Checks if Pinata is configured.
 * @returns true if the token is present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    const key = process.env.PINATA_API_KEY;
    const secret = process.env.PINATA_API_SECRET;
    return !!(key && secret && key !== 'YOUR_PINATA_API_KEY' && secret !== 'YOUR_PINATA_API_SECRET');
}
