/**
 * This service handles interaction with the IPFS network via Pinata.
 * It requires a Pinata JWT.
 */

/**
 * Checks if Pinata is configured on the server by looking for a public flag.
 * This check is performed on the client. The actual JWT is only ever accessed on the server.
 * @returns true if the configuration flag is set, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    // Client-side check only looks for a public flag.
    // The real secret PINATA_JWT is only used on the server.
    return process.env.NEXT_PUBLIC_IPFS_CONFIGURED === 'true';
}
