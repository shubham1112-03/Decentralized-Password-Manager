
// This is a simulated IPFS service.
// In a real-world application, this would be replaced with a
// functional IPFS client like Helia or Kubo.

const FAKE_IPFS_DELAY = 100; // ms

// A simple in-memory map to act as our fake IPFS node
// We attach it to the global object to persist it across hot reloads in development
declare const global: {
  fakeIpfsStore: Map<string, string>
};
let fakeIpfsStore: Map<string, string>;

if (process.env.NODE_ENV === 'production') {
  fakeIpfsStore = new Map<string, string>();
} else {
  if (!global.fakeIpfsStore) {
    global.fakeIpfsStore = new Map<string, string>();
  }
  fakeIpfsStore = global.fakeIpfsStore;
}


/**
 * Simulates adding a string to IPFS.
 * @param content The string content to add.
 * @returns A fake IPFS CID as a string.
 */
export async function addToIpfs(content: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, FAKE_IPFS_DELAY));
    // Generate a "CID-like" string. In a real scenario, this would be a cryptographic hash.
    const fakeCid = `sim-cid-${Math.random().toString(36).substring(2, 15)}`;
    fakeIpfsStore.set(fakeCid, content);
    console.log(`Simulated IPFS: Added content with CID: ${fakeCid}`);
    return fakeCid;
}

/**
 * Simulates retrieving a string from IPFS using its CID.
 * @param cid The fake IPFS CID string.
 * @returns The string content.
 */
export async function getFromIpfs(cid: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, FAKE_IPFS_DELAY));
    const content = fakeIpfsStore.get(cid);
    if (!content) {
        throw new Error(`Simulated IPFS: CID not found: ${cid}`);
    }
    console.log(`Simulated IPFS: Retrieved content for CID: ${cid}`);
    return content;
}
