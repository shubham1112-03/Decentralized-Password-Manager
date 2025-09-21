/**
 * This service interacts with the IPFS network via a public gateway.
 * This avoids the need for a local IPFS node or API keys,
 * making it suitable for serverless and web environments.
 */

const GATEWAY_URL = 'https://ipfs-gateway.publicnode.com';


/**
 * Uploads string content to IPFS via the public gateway.
 * @param content The string content to upload.
 * @returns The IPFS CID (Content Identifier) of the uploaded content.
 */
export async function addToIpfs(content: string): Promise<string> {
    try {
        const formData = new FormData();
        const blob = new Blob([content], { type: 'text/plain' });
        formData.append('file', blob);

        // The public gateway's API expects a multipart/form-data upload
        const response = await fetch(`${GATEWAY_URL}/api/v0/add`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to upload to IPFS gateway: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        if (!result.Hash) {
            throw new Error('IPFS gateway did not return a Hash (CID).');
        }
        
        console.log(`IPFS Gateway: Added content with CID: ${result.Hash}`);
        return result.Hash;

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
    const gatewayUrl = `${GATEWAY_URL}/ipfs/${cid}`;
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
