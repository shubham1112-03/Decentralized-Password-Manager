# CipherSafe: Implementation Details

This document provides an overview of the implementation environment, detailing the technologies and methodologies used to build and test the CipherSafe application.

### Frontend Environment

The frontend was developed using Next.js 14 and React 18, providing a modern, performant, and server-component-first architecture. TypeScript was utilized for robust type safety, which is crucial in a security-focused application to prevent common runtime errors and ensure data integrity across components. For the user interface, ShadCN/UI and Tailwind CSS were chosen to rapidly build a responsive, accessible, and aesthetically pleasing design system. This stack enabled the creation of a seamless user experience, from initial authentication to managing credentials in the vault. The frontend is responsible for gathering user input and orchestrating calls to the backend, but it purposefully offloads all cryptographic heavy lifting to the server to maintain a secure and lightweight client.

### Backend Environment

The backend logic is orchestrated through Genkit, Google's generative AI framework, running on a Node.js environment. This choice was pivotal for abstracting complex, multi-step operations into secure, serverless flows. The core cryptographic pipeline—including key derivation with the memory-hard `argon2` algorithm, credential encryption using Node's native `crypto` module for AES-256-GCM, and secret fragmentation via the `shamirs-secret-sharing-ts` library—is encapsulated within these flows. This server-side approach ensures that the master password and sensitive cryptographic materials are handled in a more controlled environment, minimizing client-side exposure. The backend also manages all interactions with the IPFS network through the Pinata SDK, acting as the secure bridge between the user's intent and the decentralized storage layer.

### Database Implementation

Firebase Firestore, a NoSQL cloud database, was implemented to manage user-related data in a secure and scalable manner. Its role is strictly limited to storing non-sensitive metadata, which is a cornerstone of the project's zero-knowledge architecture. For each user, a profile document stores the Argon2 hash of their master password, used only for verification. For each credential, Firestore holds only pointers: the service name, username, an array of IPFS Content Identifiers (CIDs) for the fragmented shares, and the simulated Zero-Knowledge Proof. Critically, no encrypted vaults, password shares, or sensitive data are ever stored in the database, thereby eliminating it as a high-value target for mass data exfiltration.

### Deployment Environment

The application is designed for a modern, serverless deployment environment. The Next.js frontend and Genkit backend flows are hosted on Firebase App Hosting, which provides a scalable, managed infrastructure that automatically handles traffic and compute resources. This simplifies deployment and maintenance, allowing focus to remain on application logic. A critical component of the deployment is the IPFS pinning service, Pinata, which is configured via environment variables. This service ensures that the fragmented credential shares, which are pinned to the IPFS network, remain available and are not garbage-collected. The combination of Firebase and Pinata creates a hybrid cloud-decentralized architecture that is both robust and efficient.

### Testing and Simulation

To validate the system's design and performance, testing focused on the end-to-end latency of the core cryptographic operations. The key metrics measured were `addCredential` latency (time from submission to IPFS confirmation) and `revealCredential` latency (time from request to decryption). These were tested by varying the Shamir's Secret Sharing parameters, such as the total number of shares and the required threshold. The Zero-Knowledge Proof (ZKP) component was simulated using a placeholder string and an artificial delay, as integrating a full ZKP framework like Circom was outside the scope of this implementation. This simulation serves as a functional placeholder to prove the architectural concept and measure the potential performance impact of a real ZKP system.