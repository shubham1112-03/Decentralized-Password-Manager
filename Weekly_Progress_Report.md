
# CipherSafe - Weekly Progress Report (SEM-VII)

This document outlines the 12-week progress for the development of the CipherSafe project.

---

| Week No | Date (Placeholder) | Description of Ongoing Work/Completed Activity/Task Assigned | Attendees Sign | Guide Sign |
| :------ | :----------------- | :----------------------------------------------------------- | :------------- | :--------- |
| **1**   | Week 1             | **Project Initiation and Research:** Finalized project topic: "CipherSafe - A Decentralized, Zero-Knowledge Password Vault". Conducted literature review on existing password managers, IPFS, and cryptographic principles (AES, Argon2, Shamir's Secret Sharing). Defined problem statement and objectives. |                |            |
| **2**   | Week 2             | **System Architecture and Tech Stack:** Designed the high-level system architecture (Client, Orchestration Layer, Backend Services). Selected technology stack: Next.js, Genkit, Firebase, and Pinata (IPFS). Set up the initial project repository and development environment. |                |            |
| **3**   | Week 3             | **Firebase Setup and UI/UX Prototyping:** Set up the Firebase project with Authentication and Firestore. Designed initial UI/UX mockups for the login, registration, and password dashboard screens. Created basic Next.js components for the layout. |                |            |
| **4**   | Week 4             | **User Authentication Flow:** Implemented user registration and login functionality using Firebase Authentication. Developed the client-side forms for sign-up and login. Created the initial logic for handling authenticated user states. |                |            |
| **5**   | Week 5             | **Master Password and Cryptographic Core:** Implemented the "Create Master Password" flow. Developed the core cryptographic library (`crypto.ts`) using `argon2` for key derivation from the master password. Created the initial `hashPassword` Genkit flow. |                |            |
| **6**   | Week 6             | **Core Credential Encryption Logic:** Developed the `addCredentialFlow`. Implemented AES-256-GCM encryption for service passwords and Shamir's Secret Sharing to split the ciphertext into fragments. This completed the "Encrypt -> Split" part of the security model. |                |            |
| **7**   | Week 7             | **IPFS Integration:** Implemented the IPFS interaction layer using the Pinata SDK. Created `addToIpfsFlow` and `getFromIpfsFlow` to upload and retrieve the secret shares. Integrated this into the `addCredentialFlow` to complete the "Distribute" step. |                |            |
| **8**   | Week 8             | **End-to-End Credential Management:** Developed the "Add New Password" dialog and connected it to the backend flows. Implemented the logic to store credential metadata (service name, username, IPFS CIDs) in Firestore after successful encryption and upload. |                |            |
| **9**   | Week 9             | **Credential Retrieval and Decryption:** Developed the `revealCredentialFlow`. Implemented the logic to fetch shares from IPFS, reconstruct the encrypted secret, and decrypt it using the user's master password. Built the UI for the password card, including the "Reveal" button. |                |            |
| **10**  | Week 10            | **Dashboard and UI Polish:** Developed the main password dashboard to display all saved credentials in a grid. Implemented the delete credential functionality. Refined the overall UI/UX, adding loading states, error handling (toasts), and improving responsiveness. |                |            |
| **11**  | Week 11            | **Testing and Debugging:** Conducted end-to-end testing of all user flows. Fixed bugs related to cryptographic key lengths, data serialization between server/client, and IPFS configuration. Switched to a dummy IPFS implementation for robust testing. |                |            |
| **12**  | Week 12            | **Final Documentation and Presentation:** Completed all project documentation, including the `README.md`, `Software_Requirements.md`, and the final IEEE paper. Prepared the presentation slides and content. Conducted a final code review and cleanup. |                |            |

