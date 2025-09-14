/**
 * This service interacts with the IPFS network via the web3.storage public gateway.
 * This avoids the need for a local IPFS node or complex client libraries,
 * making it suitable for serverless and web environments.
 */

const UPLOAD_URL = 'https://api.web3.storage/upload';

// In a real production app, you would want to get a free API token from https://web3.storage/
// and store it securely as an environment variable.
const WEB3_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3OCIsImlzcyI6Inczc3RvcmFnZSIsImlhdCI6MTYxODQ5NzYwMDAwMCwibmFtZSI6IlBhc3N3b3JkIE1hbmFnZXIifQ.YXV0aC10b2tlbg';


/**
 * Uploads string content to IPFS via the web3.storage gateway.
 * @param content The string content to upload.
 * @returns The IPFS CID (Content Identifier) of the uploaded content.
 */
export async function addToIpfs(content: string): Promise<string> {
    try {
        const blob = new Blob([content], { type: 'text/plain' });
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WEB3_STORAGE_TOKEN}`,
                'Content-Type': 'application/blob',
            },
            body: blob,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to upload to IPFS gateway: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        if (!result.cid) {
            throw new Error('IPFS gateway did not return a CID.');
        }
        
        console.log(`IPFS Gateway: Added content with CID: ${result.cid}`);
        return result.cid;

    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Could not upload data to the IPFS gateway.');
    }
}

/**
 * Retrieves string content from IPFS using a public gateway URL.
 * @param cid The IPFS CID string.
 * @returns The string content.
 */
export async function getFromIpfs(cid: string): Promise<string> {
    const gatewayUrl = `https://${cid}.ipfs.w3s.link`;
    try {
        const response = await fetch(gatewayUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from IPFS gateway: ${response.status} ${response.statusText}`);
        }
        
        const content = await response.text();
        console.log(`IPFS Gateway: Retrieved content for CID: ${cid}`);
        return content;

    } catch (error) {
        console.error(`Error fetching CID ${cid} from IPFS:`, error);
        throw new Error(`Could not retrieve data from the IPFS gateway for CID: ${cid}`);
    }
}
