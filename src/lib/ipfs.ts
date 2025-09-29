/**
 * This service handles interaction with the IPFS network via web3.storage.
 * It requires a web3.storage API token to upload files to the network.
 */

/**
 * Checks if the web3.storage token is provided.
 * @returns true if the token is present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    const token = process.env.WEB3_STORAGE_TOKEN;
    return !!token && token !== 'YOUR_WEB3_STORAGE_TOKEN';
}