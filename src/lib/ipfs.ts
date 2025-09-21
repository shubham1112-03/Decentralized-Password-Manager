/**
 * This service simulates interaction with the IPFS network.
 * It does not require an API token and does not upload to a real network.
 */

// A simple check to see if we are in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Returns true, as the simulated service is always "configured".
 */
export function isIpfsConfigured(): boolean {
    return true;
}

/**
 * Simulates uploading string content to IPFS.
 * It returns a "fake" CID that encodes the content directly.
 * @param content The string content to "upload".
 * @returns A base64-encoded string representing the content, prefixed with 'fake-cid-'.
 */
export async function addToIpfs(content: string): Promise<string> {
    if (!isBrowser) {
        // In Node.js (or during server-side rendering), use Buffer
        const encodedContent = Buffer.from(content).toString('base64');
        return `fake-cid-${encodedContent}`;
    }
    // In the browser, use btoa
    const encodedContent = btoa(content);
    return `fake-cid-${encodedContent}`;
}

/**
 * Simulates retrieving string content from IPFS.
 * It decodes the content directly from the "fake" CID.
 * @param cid The "fake" IPFS CID string.
 * @returns The original string content.
 */
export async function getFromIpfs(cid: string): Promise<string> {
    if (!cid.startsWith('fake-cid-')) {
        throw new Error('Invalid fake CID format. This service only handles simulated CIDs.');
    }
    const encodedContent = cid.substring('fake-cid-'.length);
    
    if (!isBrowser) {
        // In Node.js (or during server-side rendering), use Buffer
        return Buffer.from(encodedContent, 'base64').toString('utf8');
    }
    // In the browser, use atob
    return atob(encodedContent);
}