/**
 * This service handles interaction with the IPFS network via Pinata.
 * It requires a Pinata JWT to upload files to the network.
 */
import pinataSDK from '@pinata/sdk';

const jwt = process.env.PINATA_JWT;
let pinata: pinataSDK | null = null;

if (jwt && jwt !== 'YOUR_PINATA_JWT') {
    pinata = new pinataSDK({ pinataJWTKey: jwt });
}

/**
 * Checks if the Pinata JWT is provided.
 * @returns true if the token is present, false otherwise.
 */
export function isIpfsConfigured(): boolean {
    return !!pinata;
}

/**
 * Uploads string content to IPFS via Pinata.
 * @param content The string content to upload.
 * @returns A real IPFS CID (Content Identifier) for the uploaded file.
 */
export async function addToIpfs(content: string): Promise<string> {
    if (!pinata) {
        throw new Error('Pinata is not configured. Please add PINATA_JWT to your .env file.');
    }
    
    try {
        const result = await pinata.pinJSONToIPFS(JSON.parse(content), {
            pinataMetadata: {
                name: `CipherSafe Share - ${new Date().toISOString()}`
            }
        });
        return result.IpfsHash;
    } catch (error: any) {
        console.error("Error uploading to Pinata:", error);
        throw new Error('Could not upload data to the IPFS network via Pinata.');
    }
}

/**
 * Retrieves string content from IPFS using a public Pinata gateway.
 * @param cid The IPFS CID string.
 * @returns The original string content.
 */
export async function getFromIpfs(cid: string): Promise<string> {
     if (!pinata) {
        throw new Error('Pinata is not configured.');
    }

    try {
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        const response = await fetch(gatewayUrl);

        if (!response.ok) {
            throw new Error(`Failed to get file with CID: ${cid}. Status: ${response.status}`);
        }
        
        const data = await response.json();
        return JSON.stringify(data);

    } catch (error: any) {
        console.error("Error fetching from Pinata Gateway:", error);
        throw new Error('Could not retrieve data from the IPFS network via Pinata.');
    }
}
