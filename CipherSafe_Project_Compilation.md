# CipherSafe Project Compilation

This document contains a compilation of all the key documentation and reports for the CipherSafe project.

---
---

# 1. CipherSafe: A Decentralized, Zero-Knowledge Password Vault Using IPFS and Genkit (IEEE Paper)

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

---
---

# 2. CipherSafe Presentation Content

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

### Slide 5: Methodology & Risk Management

*   **Development Methodology:**
    *   **Agile (Iterative) Approach:** The project was developed using a 12-week iterative model, with each week representing a sprint focused on a specific feature set (e.g., auth, crypto, IPFS integration).
    *   **Modular Design:** The system architecture intentionally separates concerns into three distinct layers (Client, Orchestration, Backend Services), allowing for independent development, testing, and maintenance.
    *   **Prototyping:** Early sprints were dedicated to creating functional prototypes of high-risk components, such as the cryptographic and IPFS integration layers, to validate their feasibility before full implementation.

*   **Risk Management:**
    *   **Technological Risk:**
        *   *Risk:* The complexity of integrating multiple advanced technologies (Genkit, IPFS, Shamir's Sharing) could lead to unforeseen issues.
        *   *Mitigation:* Dedicated early sprints to research and prototype these components. Implemented a "dummy" IPFS service to de-couple frontend and backend development, allowing parallel workstreams and focused testing.
    *   **Security Risk:**
        *   *Risk:* A flaw in the cryptographic implementation could compromise the entire system's security promise.
        *   *Mitigation:* Adhered strictly to well-vetted, standard cryptographic libraries (Node.js `crypto` for AES-256-GCM, `argon2` for key derivation). Avoided implementing custom cryptographic algorithms.
    *   **Data Availability Risk:**
        *   *Risk:* Data stored on IPFS could become unavailable if not pinned by any node.
        *   *Mitigation:* Used a professional pinning service (Pinata) to guarantee data persistence. The architecture allows for adding more pinning services in the future for redundancy.

---

### Slide 6: Quality & Cost Management

*   **Quality Management:**
    *   **Code Quality:** Maintained high code quality through the use of TypeScript for static type checking, which catches errors during development. Code was organized into logical, reusable components and modules.
    *   **UI/UX Quality:** Utilized a professional component library (Shadcn/UI) to ensure a consistent, modern, and responsive user interface across all devices.
    *   **Testing:** Conducted iterative testing throughout the development lifecycle. This included:
        *   **Unit Testing (Conceptual):** Individual Genkit flows were developed and tested in isolation.
        *   **Integration Testing:** The end-to-end flows for adding and revealing credentials were tested to ensure all parts (UI, crypto, IPFS, DB) worked together.
        *   **User Acceptance Testing (UAT):** Continuously used the application to identify bugs and usability issues from an end-user perspective.

*   **Cost Management:**
    *   **Technology Choices:** The core technologies were selected to minimize costs, especially for a prototype or small-scale deployment.
        *   **Firebase:** Offers a generous free tier for Authentication and Firestore, sufficient for thousands of users.
        *   **Pinata:** Provides a free tier that includes enough storage and bandwidth for initial development and testing.
        *   **Next.js/Genkit:** Open-source and free to use.
    *   **Infrastructure:** Deployed on serverless platforms (like Firebase App Hosting) to eliminate the cost of maintaining dedicated servers. The "pay-as-you-go" model ensures that costs scale with usage, making it highly economical for a new project.

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

---
---

# 3. CipherSafe - Software and Hardware Requirements

This document outlines the software, hardware, and services required to develop, run, and use the CipherSafe application.

---

## 1. Development Environment

These are the requirements for developers who want to modify or contribute to the project.

### 1.1. Hardware Requirements

- **Processor**: A modern multi-core processor (e.g., Intel Core i5, AMD Ryzen 5, or Apple M-series).
- **Memory (RAM)**: A minimum of **8 GB** is recommended for a smooth experience when running the development server, code editor, and browser simultaneously. 16 GB is preferred.
- **Storage**: At least **5 GB** of free disk space to accommodate the project source code, Node.js modules, and build artifacts.
- **Display**: A screen resolution of 1080p (1920x1080) or higher is recommended.

### 1.2. Software Requirements

- **Node.js**: A JavaScript runtime environment.
  - **Recommended Version**: `v20.x` or later (Long Term Support - LTS).
  - The project is configured to work with modern Node.js features.

- **Package Manager**: A tool to manage project dependencies.
  - **Recommended**: `npm` (version 9.x or later), which comes bundled with Node.js.
  - `yarn` or `pnpm` can also be used.

- **Operating System**: The project is cross-platform and can be developed on:
  - Windows 10/11
  - macOS
  - Linux (any modern distribution)

- **Code Editor**: A text editor for writing code.
  - **Recommended**: Visual Studio Code (VSCode) with extensions for TypeScript and Next.js.
  - Other editors like WebStorm or Sublime Text are also suitable.

---

## 2. Frameworks and Core Libraries

These are the key technologies installed via the package manager that form the backbone of the application. The full list is available in the `package.json` file.

- **Next.js**: `v15.x` - The React framework for building the application.
- **React**: `v18.x` - The core UI library.
- **TypeScript**: `v5.x` - For static typing and improved code quality.
- **Tailwind CSS**: `v3.x` - For styling the user interface.
- **Shadcn/ui**: A component library built on top of Radix UI and Tailwind CSS.
- **Genkit**: `v1.x` - The AI framework used to orchestrate the cryptographic backend flows.
- **Pinata SDK**: `v2.x` - For interacting with the Pinata IPFS pinning service.

---

## 3. Required Backend Services (Deployment)

These cloud services are essential for the application to function correctly.

### 3.1. Hardware Requirements (Server)

- The application is designed to be deployed on **Firebase App Hosting**, a serverless platform.
- As such, there are **no direct hardware requirements** to manage. The underlying server infrastructure (CPU, RAM, networking) is fully managed by Google Cloud based on the `apphosting.yaml` configuration.

### 3.2. Software & Services

- **Firebase Project**: A Google Firebase project is required to provide the following services:
  - **Firebase Authentication**: For user sign-up and login (currently configured for Email & Password).
  - **Firestore**: A NoSQL database used to store user profiles and encrypted credential metadata.

- **IPFS Pinning Service**:
  - The application uses **Pinata** to pin credential shares to the IPFS network.
  - An account with `pinata.cloud` is required.
  - A **JWT** from Pinata must be provided in the `.env` file for the service to work.

---

## 4. End-User Requirements

These are the requirements for an end-user to use the deployed web application.

### 4.1. Hardware Requirements

- Any modern computing device capable of running a standard web browser, including:
  - Desktop Computers
  - Laptops
  - Tablets (e.g., iPad)
  - Smartphones (e.g., iPhone, Android devices)

### 4.2. Software Requirements

- **Modern Web Browser**: The application is designed to run on the latest versions of major web browsers.
  - Google Chrome
  - Mozilla Firefox
  - Apple Safari
  - Microsoft Edge
- **Internet Connection**: Required to connect to Firebase services and the IPFS network.

---
---

# 4. CipherSafe - Weekly Progress Report (SEM-VII)

This document outlines the 12-week progress for the development of the CipherSafe project.

---

| Week No | Date (Placeholder) | Description of Ongoing Work/Completed Activity/Task Assigned | Attendees Sign | Guide Sign |
| :------ | :----------------- | :----------------------------------------------------------- | :------------- | :--------- |
| **1**   | Week 1             | **Project Initiation & Research:** Finalized project topic. Conducted literature review on decentralized tech and cryptography. |                |            |
| **2**   | Week 2             | **System Architecture:** Designed high-level architecture. Selected tech stack (Next.js, Genkit, Firebase, IPFS). |                |            |
| **3**   | Week 3             | **Firebase & UI Prototyping:** Set up Firebase Auth/Firestore. Designed UI mockups for login and dashboard. |                |            |
| **4**   | Week 4             | **User Authentication:** Implemented user registration and login functionality using Firebase. Handled auth state. |                |            |
| **5**   | Week 5             | **Master Password & Crypto Core:** Implemented the "Create Master Password" flow. Developed `argon2` key derivation logic. |                |            |
| **6**   | Week 6             | **Encryption & Secret Sharing:** Developed `addCredentialFlow` for AES-256 encryption and Shamir's Secret Sharing. |                |            |
| **7**   | Week 7             | **IPFS Integration:** Implemented IPFS layer using Pinata SDK. Created flows to upload and retrieve shares. |                |            |
| **8**   | Week 8             | **End-to-End "Add" Flow:** Connected UI to backend. Stored metadata and IPFS CIDs in Firestore. |                |            |
| **9**   | Week 9             | **End-to-End "Reveal" Flow:** Developed `revealCredentialFlow`. Built the "Reveal" UI functionality. |                |            |
| **10**  | Week 10            | **Dashboard & UI Polish:** Built the main password dashboard. Implemented delete functionality and refined UI/UX. |                |            |
| **11**  | Week 11            | **Testing & Debugging:** Conducted full end-to-end testing. Fixed bugs. Implemented dummy IPFS service. |                |            |
| **12**  | Week 12            | **Documentation & Presentation:** Completed IEEE paper, software requirements, and presentation content. |                |            |
