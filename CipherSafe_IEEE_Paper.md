# CipherSafe: A Decentralized, Zero-Knowledge Password Vault Using IPFS and Genkit

**Author:** [Your Name]  
**Affiliation:** [Your Affiliation/University]  
**Location:** [Your City, Country]  
**Email:** [Your Email]

---

### Abstract

*This paper presents CipherSafe, a novel architecture for a decentralized password management system that enhances user security and control by leveraging a combination of zero-knowledge principles, distributed storage, and modern cryptographic techniques. The system uses Firebase for user authentication and metadata storage, while employing Shamir's Secret Sharing to split encrypted credentials into fragments. These fragments are then distributed across the InterPlanetary File System (IPFS) via the Pinata pinning service. All cryptographic and distributed logic is orchestrated through server-side AI flows managed by Google's Genkit framework. This approach eliminates central points of failure and ensures that not even the service provider can access user passwords, thereby offering a robust and trustless security model. The implementation utilizes a Next.js frontend, providing a responsive and secure user experience.*

**Keywords:** *password management, decentralized application, zero-knowledge proof, IPFS, Shamir's Secret Sharing, Genkit, Firebase, cryptography*

---

### I. INTRODUCTION

In an era of increasing digital dependency, secure password management has become a critical challenge for individuals and organizations. Traditional password managers, while convenient, often rely on a centralized architecture where encrypted password vaults are stored on a single company's servers. This model introduces a significant single point of failure; a breach of the central server could expose the encrypted data of millions of users, leaving them vulnerable to offline brute-force attacks.

To address these security concerns, we propose CipherSafe, a decentralized password vault designed with a "zero-trust" philosophy. The core principle of CipherSafe is that no single entity, including the service provider, should have access to user credentials or the ability to decrypt them. By distributing encrypted data across a decentralized network and leveraging modern cryptographic primitives, CipherSafe provides a more resilient and secure alternative to traditional password management solutions.

This paper details the system's architecture, cryptographic protocol, and implementation. We explore the use of Shamir's Secret Sharing for data fragmentation, IPFS for decentralized storage, and Genkit for orchestrating complex backend flows, demonstrating a practical model for building secure, decentralized applications.    

### II. SYSTEM ARCHITECTURE

The CipherSafe architecture is composed of three primary layers: the client-side user interface, a server-side orchestration layer, and a set of distributed backend services. This separation of concerns allows for a modular and secure design.

**A. Client-Side Application**

The frontend is a modern web application built with Next.js and React, utilizing TypeScript for type safety and Tailwind CSS with Shadcn/UI for the user interface. Its responsibilities include:
-   User authentication (login/signup).
-   Securely capturing the user's master password.
-   Interacting with the server-side flows to add, retrieve, and decrypt credentials.
-   Displaying the user's password dashboard.

Crucially, the raw master password never leaves the user's device. For operations requiring this password, it is used locally for a single cryptographic function and then immediately discarded from memory to prevent exposure.

**B. Server-Side Orchestration (Genkit Flows)**

The core logic of CipherSafe is encapsulated in server-side flows managed by Google's Genkit, an AI orchestration framework. These flows are responsible for:
1.  **Cryptographic Operations:** Hashing the master password with Argon2 and deriving an encryption key.
2.  **Credential Handling:** Encrypting and decrypting passwords using AES-256-GCM.
3.  **Secret Sharing:** Splitting the encrypted password into multiple shares using Shamir's Secret Sharing.
4.  **IPFS Interaction:** Communicating with the Pinata service to store and retrieve shares from the IPFS network.

**C. Backend Services**

CipherSafe relies on two external cloud services:
1.  **Google Firebase:** Used for user authentication (Firebase Auth) and for storing non-sensitive metadata, such as the user's profile, the list of services they have saved, and the IPFS Content Identifiers (CIDs) pointing to their credential shares (Firestore).
2.  **Pinata:** A pinning service that ensures the encrypted credential shares remain available on the IPFS network.

### III. CRYPTOGRAPHIC PROTOCOL AND SECURITY MODEL

The security of CipherSafe is founded on a multi-layered cryptographic protocol designed to protect data both at rest and in transit.

**A. Master Password and Key Derivation**

Upon registration, the user creates a strong master password. This password is the sole key to their vault and is never stored on any server. To create a secure encryption key, the master password is first hashed using **Argon2**, a memory-hard key derivation function designed to be resistant to brute-force attacks. The resulting hash is used as the key for all subsequent encryption operations.

**B. Credential Encryption and Fragmentation**

When a user adds a new password to their vault, the following process occurs, as orchestrated by the `addCredentialFlow`:
1.  **Key Derivation:** An AES-256 key is derived from the user's master password using the Argon2 hash.
2.  **Encryption:** The new service password is encrypted using **AES-256-GCM**, a standard for authenticated encryption that provides both confidentiality and integrity.
3.  **Secret Sharing:** The resulting encrypted ciphertext is treated as a secret and split into five "shares" using **Shamir's Secret Sharing (SSS)** algorithm, with a threshold of three. This means that any three of the five shares can be used to reconstruct the original encrypted password, but two or fewer shares are useless.
4.  **Decentralized Storage:** Each of the five shares is uploaded to the IPFS network via Pinata, each receiving a unique Content Identifier (CID).
5.  **Metadata Storage:** The CIDs of the shares, along with the service name and username, are stored in a Firestore document associated with the user's account. The encrypted password itself is not stored in Firestore.
6.  **Zero-Knowledge Proof (Simulated):** A simulated Zero-Knowledge Proof (ZKP) is generated. In a full implementation, this would prove knowledge of the master password without revealing it, adding another layer of authentication.

**C. Credential Retrieval and Decryption**

To reveal a password, the `revealCredentialFlow` executes the reverse process:
1.  **Re-authentication:** The user is prompted for their master password.
2.  **Share Retrieval:** At least three of the five CIDs are fetched from Firestore, and the corresponding shares are downloaded from IPFS.
3.  **Reconstruction:** The SSS algorithm combines the shares to reconstruct the original AES-encrypted ciphertext.
4.  **Decryption:** The user's master password is used to re-derive the AES key, which then decrypts the ciphertext to reveal the plaintext password.

This protocol ensures that even if an attacker gains full access to the Firebase database and the Pinata IPFS account, they would only have access to fragmented, encrypted data shares that are useless without the user's master password.    

### IV. IMPLEMENTATION DETAILS

CipherSafe is implemented as a monorepo containing both the Next.js frontend and the Genkit backend flows.

-   **Frameworks:** Next.js 15, React 18, TypeScript 5.
-   **Backend Orchestration:** Genkit 1.x.
-   **Cryptography:** Node.js `crypto` module for AES and Argon2, `shamirs-secret-sharing-ts` library for SSS.
-   **Database and Auth:** `firebase` SDK (v10).
-   **IPFS:** `@pinata/sdk` (v2) for interacting with the Pinata service.

The use of Genkit flows to abstract the complex backend logic allows the client application to make simple, declarative function calls (e.g., `addCredential(input)`), while the server handles the intricate cryptographic and network operations. This separation simplifies development and enhances security by containing all sensitive logic on the server.

### V. CONCLUSION AND FUTURE WORK

CipherSafe demonstrates a viable and secure architecture for a decentralized password manager. By combining established cryptographic primitives like AES and Argon2 with modern decentralized technologies like IPFS and Shamir's Secret Sharing, it successfully eliminates central points of failure and provides a "zero-trust" environment for users. The use of Genkit proves to be an effective way to orchestrate complex, multi-step backend processes in a clean and maintainable manner.

Future work could focus on several areas of improvement:
-   **Full ZKP Implementation:** Replacing the simulated ZKP with a true zero-knowledge proof system (e.g., using Circom/SnarkJS) would provide cryptographic verification of master password ownership.
-   **Data Redundancy:** Exploring alternative IPFS pinning services or a multi-service strategy to further decentralize storage and reduce reliance on a single provider like Pinata.
-   **Mobile Application:** Developing native mobile clients for iOS and Android to extend the platform's reach.
-   **Browser Extension:** A browser extension would provide auto-fill capabilities, greatly enhancing the user experience.

### ACKNOWLEDGMENT

The author would like to thank Google for the powerful tools and platforms, including Firebase for authentication and database services, and Genkit for AI orchestration, which were instrumental in the development of this project. Gratitude is also extended to the open-source community for providing the cryptographic libraries that form the security backbone of CipherSafe. Finally, a special thanks to [Your Professor/Mentor's Name(s)] for their guidance and support throughout this research.

### REFERENCES

[1] A. Shamir, "How to Share a Secret," *Communications of the ACM*, vol. 22, no. 11, pp. 612–613, Nov. 1979.

[2] J. Benet, "IPFS - Content Addressed, Versioned, P2P File System," *arXiv:1407.3561*, 2014. [Online]. Available: https://arxiv.org/abs/1407.3561.

[3] A. Biryukov, D. Dinu, and D. Khovratovich, "Argon2: the memory-hard functions for password hashing and other applications," in *2015 IEEE European Symposium on Security and Privacy (EuroS&P)*, 2016.

[4] Firebase Documentation, Google. [Online]. Available: https://firebase.google.com/docs.

[5] Genkit Documentation, Google. [Online]. Available: https://firebase.google.com/docs/genkit.
