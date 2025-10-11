
# CipherSafe - Weekly Progress Report (SEM-VII)

This document outlines the 12-week progress for the development of the CipherSafe project.

---

| Week No | Date (Placeholder) | Description of Ongoing Work/Completed Activity/Task Assigned | Attendees Sign | Guide Sign |
| :------ | :----------------- | :----------------------------------------------------------- | :------------- | :--------- |
| **1**   | Week 1             | **Project Initiation & Research:** Finalized project topic and conducted literature review on decentralized technologies and cryptography. Defined problem statement and objectives. |                |            |
| **2**   | Week 2             | **System Architecture & Tech Stack:** Designed high-level architecture. Selected tech stack: Next.js, Genkit, Firebase, and IPFS. Set up the initial project repository. |                |            |
| **3**   | Week 3             | **Firebase Setup & UI Prototyping:** Configured Firebase Authentication and Firestore. Designed UI mockups for login, registration, and dashboard screens. |                |            |
| **4**   | Week 4             | **User Authentication:** Implemented user registration and login functionality using Firebase Authentication. Handled authenticated user states in the application. |                |            |
| **5**   | Week 5             | **Master Password & Core Crypto:** Implemented the "Create Master Password" flow. Developed the core `argon2` key derivation logic in a Genkit flow. |                |            |
| **6**   | Week 6             | **Credential Encryption Logic:** Developed the `addCredentialFlow` to handle AES-256 encryption and Shamir's Secret Sharing for splitting the ciphertext. |                |            |
| **7**   | Week 7             | **IPFS Integration:** Implemented the IPFS interaction layer using the Pinata SDK. Created flows to upload and retrieve secret shares from the IPFS network. |                |            |
| **8**   | Week 8             | **End-to-End Add Credential:** Connected the "Add New Password" UI to backend flows. Stored credential metadata and IPFS CIDs in Firestore. |                |            |
| **9**   | Week 9             | **Credential Retrieval & Decryption:** Developed the `revealCredentialFlow` to fetch shares from IPFS, reconstruct the secret, and decrypt it. Built the "Reveal" UI. |                |            |
| **10**  | Week 10            | **Dashboard & UI Polish:** Built the main password dashboard to display saved credentials. Implemented delete functionality and refined the overall UI/UX. |                |            |
| **11**  | Week 11            | **Testing & Debugging:** Conducted end-to-end testing of all user flows. Fixed bugs related to cryptography and IPFS. Implemented a dummy IPFS service for testing. |                |            |
| **12**  | Week 12            | **Final Documentation & Presentation Prep:** Completed all project documentation, including the IEEE paper and software requirements. Prepared presentation content. |                |            |

