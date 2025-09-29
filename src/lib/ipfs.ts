/**
 * This service handles interaction with the IPFS network via Pinata.
 * It requires a Pinata JWT to upload files to the network.
 */

/**
 * Checks if the Pinata JWT is provided.
 * @returns true if the token is present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    const jwt = process.env.PINATA_JWT;
    return !!jwt && jwt !== 'YOUR_PINATA_JWT';
}
