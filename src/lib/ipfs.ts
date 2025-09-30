/**
 * This service handles interaction with the IPFS network via web3.storage.
 * It requires a web3.storage API token.
 */

/**
 * Checks if web3.storage is configured.
 * @returns true if the token is present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    const token = process.env.WEB3_STORAGE_TOKEN;
    return !!(token && token !== 'YOUR_TOKEN_HERE');
}
