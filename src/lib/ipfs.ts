import { createHelia } from 'helia';
import { strings } from '@helia/strings';

// A single, shared Helia instance
let helia: any; 

async function getHelia() {
    if (!helia) {
        helia = await createHelia();
    }
    return helia;
}

/**
 * Adds a string to IPFS.
 * @param content The string content to add.
 * @returns The IPFS CID as a string.
 */
export async function addToIpfs(content: string): Promise<string> {
    const heliaNode = await getHelia();
    const s = strings(heliaNode);
    const cid = await s.add(content);
    return cid.toString();
}

/**
 * Retrieves a string from IPFS using its CID.
 * @param cid The IPFS CID string.
 * @returns The string content.
 */
export async function getFromIpfs(cid: string): Promise<string> {
    const heliaNode = await getHelia();
    const s = strings(heliaNode);
    // The CID might be passed as a string, so we ensure it's a CID object for Helia
    const { CID } = await import('multiformats/cid');
    const content = await s.get(CID.parse(cid));
    return content;
}
