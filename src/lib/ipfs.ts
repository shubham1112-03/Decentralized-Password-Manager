/**
 * This service handles interaction with the IPFS network via Pinata.
 * It requires a Pinata JWT.
 */

/**
 * Checks if Pinata is configured.
 * This check is performed on the client, so it only checks for the public key part of the JWT.
 * A full JWT is not required on the client.
 * @returns true if the credentials are present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    // Client-side check only needs to know if the env var is likely set.
    // We check for NEXT_PUBLIC_PINATA_GATEWAY_TOKEN, but the real secret is PINATA_JWT on the server.
    // This is a proxy to know if the developer has configured IPFS.
    const key = process.env.NEXT_PUBLIC_PINATA_DUMMY_KEY || process.env.PINATA_JWT;
    return !!key;
}
