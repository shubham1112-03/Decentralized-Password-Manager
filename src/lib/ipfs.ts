/**
 * This service handles interaction with the IPFS network via Infura.
 * It requires an Infura Project ID and Project Secret.
 */

/**
 * Checks if Infura is configured.
 * @returns true if the credentials are present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    const projectId = process.env.INFURA_IPFS_PROJECT_ID;
    const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
    return !!(projectId && projectSecret && projectId !== 'YOUR_PROJECT_ID' && projectSecret !== 'YOUR_PROJECT_SECRET');
}
