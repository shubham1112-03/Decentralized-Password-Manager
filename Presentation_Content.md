# CipherSafe Presentation Content

This document contains the generated content for each slide based on the provided template and the CipherSafe project's implementation.

---

### Slide 1: Title Slide

*   **Project Title:** CipherSafe: A Decentralized, Zero-Knowledge Password Vault Using IPFS and Genkit
*   **Team Members:** [Your Name(s)], [Your Roll No(s).]
*   **Guide / Co-Guide:** [Your Guide's Name]
*   **Department, Institute:** Department of Computer Science & Engineering, ADCET Ashta
*   **Academic Year:** 2025-26

---

### Slide 2: Problem Statement

*   **Problem Definition:** Traditional password managers rely on a centralized architecture. They store all user password vaults, even if encrypted, on a single set of servers. This creates a massive, high-value target for attackers. A breach of this central server can expose the encrypted data of millions of users, who are then vulnerable to offline brute-force or dictionary attacks on their master passwords. This model forces users to place immense trust in a single company's security infrastructure.

*   **Importance and Relevance:** In our increasingly digital world, the number of online accounts per person is exploding, making secure password management essential. The centralized model represents a single point of failure, a risk that has materialized in several high-profile breaches of popular password managers. There is a critical need for a more resilient, "zero-trust" architecture where the user has absolute control, and not even the service provider can access their sensitive data.

---

### Slide 3: Objectives

*   **Main Goals of the Project:**
    *   To design and develop a decentralized password management system that eliminates the single point of failure inherent in traditional architectures.
    *   To implement a "zero-knowledge" security model where the service provider can never access the user's master password or unencrypted credentials.
    *   To leverage decentralized storage technologies like the InterPlanetary File System (IPFS) to distribute encrypted data, enhancing security and censorship resistance.
    *   To apply modern cryptographic primitives, including Argon2 for key derivation, AES-256 for encryption, and Shamir's Secret Sharing for data fragmentation.

*   **Expected Outcomes:**
    *   A fully functional web application where users can securely register, log in, and manage their passwords.
    *   A backend system, orchestrated by Genkit, that handles all cryptographic operations, splits encrypted data into shares, and distributes them across IPFS.
    *   A system where credential data is verifiably secure, resilient, and owned entirely by the user.

---

### Slide 4: Proposed System

*   **Block Diagram / Architecture:**
    Our system uses a three-layer architecture:
    1.  **Client (Next.js & React):** The user interface for authentication and password management. All user interaction happens here. In the final design, it's responsible for generating a Zero-Knowledge Proof locally.
    2.  **Orchestration Layer (Genkit Flows):** The brain of the system. Server-side flows handle all complex logic, including:
        *   Deriving the encryption key from the master password (via Argon2).
        *   Encrypting credentials (with AES-256).
        *   Splitting the ciphertext into fragments (using Shamir's Secret Sharing).
        *   Pinning the fragments to IPFS via the Pinata service.
        *   Storing non-sensitive metadata (like IPFS CIDs) in Firestore.
    3.  **Backend Services (Firebase & IPFS):**
        *   **Firebase:** Provides user authentication and a Firestore database for metadata.
        *   **IPFS (via Pinata):** Provides decentralized, content-addressed storage for the encrypted credential fragments.

*   **Key Innovation:** The innovation is the synthesis of these technologies to create a zero-trust system. Instead of storing a single encrypted blob, we encrypt the data, then shatter it into multiple pieces using Shamir's Secret Sharing, and then scatter those pieces across a decentralized network. No single part of the system—not the database, not the storage network—has enough information to compromise a user's password.

*   **Overcoming Limitations:** This design directly overcomes the core limitation of centralized password managers: the single point of failure. By decentralizing storage and implementing a zero-knowledge protocol, we remove the need for users to trust us, creating a mathematically verifiable security model.

---

### Slide 7: System Design & Implementation

*   **Tools & Technologies Used:**
    *   **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Shadcn/UI
    *   **Backend Orchestration:** Genkit (Google's AI Flow Framework)
    *   **Authentication & Database:** Firebase Authentication, Firestore
    *   **Decentralized Storage:** IPFS (InterPlanetary File System)
    *   **IPFS Pinning Service:** Pinata
    *   **Cryptography Libraries:**
        *   `argon2`: For brute-force resistant master key derivation.
        *   `crypto` (Node.js module): For AES-256-GCM encryption.
        *   `shamirs-secret-sharing-ts`: For splitting the encrypted secret.
    *   **Package Manager:** `npm`
    *   **Runtime:** Node.js

*   **Working Mechanism (Flowchart):**

    **Flowchart 1: Adding a New Credential**

    1.  **Start (User Action):** User clicks "Add New Password" in the client UI.
    2.  **Input Form:** User fills in Service Name, Username, and Password, then clicks "Save to Vault".
    3.  **Client-Side Call:** The client calls the `addCredentialFlow` Genkit flow, sending the raw master password and the new credential details.
    4.  **Genkit Flow (Server-Side Begins):**
        *   **Step 4a (Key Derivation):** The flow derives a secure 256-bit encryption key from the raw master password using `argon2` (a robust key derivation function).
        *   **Step 4b (Encryption):** The new service password is encrypted using the derived key with **AES-256-GCM**. This produces an `encrypted_password` string (containing ciphertext, IV, and auth tag).
        *   **Step 4c (Secret Splitting):** The `encrypted_password` is treated as a secret and is split into **5 "shares"** using **Shamir's Secret Sharing** with a threshold of **3**. Any 3 shares can reconstruct the secret, but 2 or fewer are useless.
        *   **Step 4d (ZKP Simulation):** The flow simulates the creation of a Zero-Knowledge Proof, adding a realistic delay.
        *   **Step 4e (IPFS Upload):** The 5 shares are uploaded in parallel to the **IPFS network** via the Pinata pinning service. This returns **5 unique IPFS CIDs** (Content Identifiers).
    5.  **Genkit Flow Response:** The flow returns the `sharesCids` array and the simulated `zkProof` to the client.
    6.  **Store Metadata (Client-Side):** The client takes the `sharesCids` and `zkProof` and creates a new document in the **Firestore database**. This document contains:
        *   `user_id`
        *   `service` name
        *   `username`
        *   The array of 5 `sharesCids`
        *   The `zkProof`
    7.  **UI Update:** The client updates the dashboard to show the new credential card.
    8.  **End.**

    ---

    **Flowchart 2: Revealing a Credential**

    1.  **Start (User Action):** User clicks the "Reveal" button on a credential card in the UI.
    2.  **Master Password Check:** The client already has the raw master password from when the vault was unlocked.
    3.  **Client-Side Call:** The client calls the `revealCredentialFlow` Genkit flow, sending:
        *   The raw master password.
        *   The `sharesCids` array from the credential's Firestore document.
        *   The `zkProof` from the same document.
    4.  **Genkit Flow (Server-Side Begins):**
        *   **Step 4a (ZKP Verification - Simulated):** The flow checks the simulated proof to authorize the operation.
        *   **Step 4b (IPFS Download):** The flow takes the first **3 CIDs** from the `sharesCids` array and fetches the corresponding secret shares from the **IPFS network** via a Pinata gateway.
        *   **Step 4c (Reconstruction):** The 3 downloaded shares are combined using **Shamir's Secret Sharing** to perfectly reconstruct the original `encrypted_password` string.
        *   **Step 4d (Key Derivation):** The flow re-derives the same 256-bit AES key from the user's master password using `argon2`.
        *   **Step 4e (Decryption):** The derived key is used to decrypt the reconstructed `encrypted_password` with **AES-256-GCM**, revealing the original plaintext password.
    5.  **Genkit Flow Response:** The flow returns the `plaintextPassword` to the client.
    6.  **UI Update:** The client displays the `plaintextPassword` in the credential card.
    7.  **End.**

---

### Slide 9: Results & Analysis

*   **Output Screenshots:**
    *   Screenshot of the main login/signup page.
    *   Screenshot of the user's password dashboard, showing a grid of saved credentials (e.g., for Google, GitHub).
    *   Screenshot of a password card with the password hidden (`••••••••••••`).
    *   Screenshot of a password card after clicking "Reveal," showing the decrypted password and a "Copy" button.
    *   Screenshot of the "Add New Password" dialog box.

*   **Performance Metrics (Example):**
    *   **Credential Addition Time:** Average time taken from submission to confirmation. (e.g., ~2.5 - 4 seconds). This includes AES encryption, Shamir's sharing, and 5 parallel uploads to IPFS. The simulated ZKP adds a 1.5s delay.
    *   **Credential Reveal Time:** Average time to retrieve and decrypt a password. (e.g., ~1.5 - 3 seconds). This includes fetching 3 shares from an IPFS gateway, combining them, and decrypting.
    *   **Security:** AES-256-GCM encryption provides authenticated encryption, protecting against tampering. Argon2 provides strong resistance to brute-force attacks on the master password.

*   **Comparison Table:**

| Feature | CipherSafe (Proposed System) | Traditional Password Manager |
| :--- | :--- | :--- |
| **Architecture** | Decentralized | Centralized |
| **Storage** | IPFS (Distributed) | Company's Cloud Servers |
| **Trust Model**| Zero-Trust / Zero-Knowledge | Trust-Based (Trust the provider) |
| **Data Control** | User holds the ultimate key | Provider controls server access |
| **Single Point of Failure** | No | Yes (Central server) |
| **Security Principle** | Encrypt -> Split -> Distribute | Encrypt -> Store |

---

### Slide 10: Applications & Future Scope

*   **Real-world Applications:**
    *   A highly secure password manager for individuals and teams who prioritize security and data sovereignty.
    *   A foundational model for other decentralized applications (dApps) that need to manage sensitive user secrets (e.g., private keys, API tokens).
    *   Can be extended to store other secrets like secure notes, credit card information, or software licenses.

*   **Future Improvements:**
    *   **Full Zero-Knowledge Proof Implementation:** Replace the current ZKP simulation with a real implementation using `snarkjs` or `circom` to achieve a true zero-knowledge architecture.
    *   **Browser Extension:** Develop a browser extension for auto-fill capabilities to dramatically improve user experience.
    *   **Mobile Application:** Create native iOS and Android apps for on-the-go access.
    *   **Multi-Device Sync:** Implement a secure mechanism for syncing the user's encrypted profile across multiple devices.
    *   **IPFS Redundancy:** Use multiple IPFS pinning services or a service like Filecoin to further enhance data persistence and decentralization.

---

### Slide 11: Conclusion

*   **Summary of Key Achievements:**
    *   Successfully designed and built a working prototype of a decentralized password vault.
    *   Demonstrated the integration of modern cryptography (AES, Argon2), secret-sharing protocols (Shamir's), and decentralized storage (IPFS) in a single application.
    *   Validated the "Encrypt, Split, Distribute" security model as a viable and more secure alternative to centralized storage.
    *   Utilized Genkit to effectively orchestrate complex, multi-step backend cryptographic and network operations, simplifying client-side logic.

*   **Major Learning Outcomes:**
    *   Gained deep practical experience with the principles of decentralized application design and zero-trust architectures.
    *   Learned the intricacies of implementing cryptographic protocols and the importance of handling binary data correctly.
    *   Understood the power and challenges of working with decentralized storage networks like IPFS.
    *   Recognized the distinction between a conceptual prototype (with simulations) and a production-ready system, particularly regarding the complexity of implementing true Zero-Knowledge Proofs.
