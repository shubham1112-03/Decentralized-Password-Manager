/**
 * This service handles interaction with the IPFS network via web3.storage.
 * It requires an API token to upload files to the real network.
 */
import { Web3Storage, File } from 'web3.storage';

const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;

function getClient() {
    if (!token || token === 'YOUR_WEB3_STORAGE_API_TOKEN') {
        throw new Error('web3.storage API token is not configured. Please add NEXT_PUBLIC_WEB3_STORAGE_TOKEN to your .env file.');
    }
    return new Web3Storage({ token });
}

/**
 * Checks if the web3.storage token is provided.
 * @returns true if the token is present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    return !!token && token !== 'YOUR_WEB3_STORAGE_API_TOKEN';
}

/**
 * Uploads string content to IPFS via web3.storage.
 * @param content The string content to upload.
 * @returns A real IPFS CID (Content Identifier) for the uploaded file.
 */
export async function addToIpfs(content: string): Promise<string> {
    try {
        const client = getClient();
        const buffer = Buffer.from(content);
        const files = [new File([buffer], 'secret.json')];
        const cid = await client.put(files, { wrapWithDirectory: false });
        return cid;
    } catch (error: any) {
        if (error.message && error.message.includes('maintenance')) {
            throw new Error('IPFS service is undergoing maintenance. Check https://status.web3.storage for updates.');
        }
        console.error("Error uploading to IPFS:", error);
        throw new Error('Could not upload data to the IPFS network.');
    }
}

/**
 * Retrieves string content from IPFS using the web3.storage gateway.
 * @param cid The IPFS CID string.
 * @returns The original string content.
 */
export async function getFromIpfs(cid: string): Promise<string> {
    try {
        const client = getClient();
        const res = await client.get(cid);

        if (!res || !res.ok) {
            throw new Error(`Failed to get file with CID: ${cid}. Status: ${res?.status}`);
        }

        const files = await res.files();
        if (!files || files.length === 0) {
            throw new Error(`No files found for CID: ${cid}`);
        }

        const file = files[0];
        return file.text();
    } catch (error: any) {
        if (error.message && error.message.includes('maintenance')) {
            throw new Error('IPFS service is undergoing maintenance. Check https://status.web3.storage for updates.');
        }
        console.error("Error fetching from IPFS:", error);
        throw new Error('Could not retrieve data from the IPFS network.');
    }
}
