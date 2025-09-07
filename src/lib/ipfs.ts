import { create } from 'kubo-rpc-client';
import { Buffer } from 'buffer';

// In a real-world scenario, you would run your own IPFS node or use a dedicated pinning service.
// For this example, we'll use a public gateway. This is not recommended for production
// as public gateways have rate limits and no guarantees of data persistence.
const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' });


/**
 * Uploads an array of Shamir's secret shares to IPFS.
 * @param shares The shares to upload, as an array of Buffers.
 * @returns An array of IPFS Content Identifiers (CIDs) as strings.
 */
export async function addSharesToIpfs(shares: Buffer[]): Promise<string[]> {
    const results = await Promise.all(shares.map(share => client.add(share)));
    return results.map(result => result.cid.toString());
}


/**
 * Fetches an array of Shamir's secret shares from IPFS using their CIDs.
 * @param cids The array of CIDs to fetch.
 * @returns An array of shares as Buffers.
 */
export async function getSharesFromIpfs(cids: string[]): Promise<Buffer[]> {
    const shares: Buffer[] = [];

    for (const cid of cids) {
        const chunks = [];
        for await (const chunk of client.cat(cid)) {
            chunks.push(chunk);
        }
        shares.push(Buffer.concat(chunks));
    }
    
    return shares;
}
