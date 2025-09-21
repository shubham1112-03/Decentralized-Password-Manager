/**
 * This service interacts with the IPFS network via web3.storage.
 * It requires an API token from web3.storage.
 */
import { Web3Storage } from 'web3.storage';

function getAccessToken() {
    return process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
}

export function isIpfsConfigured(): boolean {
    const token = getAccessToken();
    return !!token && token !== 'YOUR_WEB3_STORAGE_TOKEN';
}

function makeStorageClient(): Web3Storage {
    return new Web3Storage({ token: getAccessToken() as string });
}

/**
 * Uploads string content to IPFS via web3.storage.
 * @param content The string content to upload.
 * @returns The IPFS CID (Content Identifier) of the uploaded content.
 */
export async function addToIpfs(content: string): Promise<string> {
    if (!isIpfsConfigured()) {
        throw new Error("web3.storage API token is not configured. Please add NEXT_PUBLIC_WEB3_STORAGE_TOKEN to your .env.local file.");
    }
    try {
        const blob = new Blob([content], { type: 'text/plain' });
        const file = new File([blob], 'secret.txt', { type: 'text/plain' });
        
        const client = makeStorageClient();
        const cid = await client.put([file], { wrapWithDirectory: false });

        if (!cid) {
            throw new Error('web3.storage did not return a CID.');
        }
        
        console.log(`web3.storage: Added content with CID: ${cid}`);
        return cid;

    } catch (error) {
        console.error('Error uploading to web3.storage:', error);
        throw new Error('Could not upload data to the IPFS gateway via web3.storage.');
    }
}

/**
 * Retrieves string content from IPFS using a web3.storage gateway URL.
 * @param cid The IPFS CID string.
 * @returns The string content.
 */
export async function getFromIpfs(cid: string): Promise<string> {
    const gatewayUrl = `https://${cid}.ipfs.w3s.link`;
    try {
        const response = await fetch(gatewayUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from web3.storage gateway: ${response.status} ${response.statusText}`);
        }
        
        const content = await response.text();
        console.log(`web3.storage: Retrieved content for CID: ${cid}`);
        return content;

    } catch (error) {
        console.error(`Error fetching CID ${cid} from IPFS:`, error);
        throw new Error(`Could not retrieve data from the IPFS gateway for CID: ${cid}`);
    }
}
