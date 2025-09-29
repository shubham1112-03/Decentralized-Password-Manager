import { z } from 'genkit';

// == ADD TO IPFS FLOW ==

export const AddToIpfsInputSchema = z.object({
  content: z.string().describe('The string content to upload to IPFS.'),
});
export type AddToIpfsInput = z.infer<typeof AddToIpfsInputSchema>;

export const AddToIpfsOutputSchema = z.string().describe('The IPFS CID of the uploaded content.');


// == GET FROM IPFS FLOW ==

export const GetFromIpfsInputSchema = z.object({
    cid: z.string().describe("The IPFS CID to retrieve."),
});
export type GetFromIpfsInput = z.infer<typeof GetFromIpfsInputSchema>;

export const GetFromIpfsOutputSchema = z.string().describe("The string content from the CID.");
