# CipherSafe - Project Log Diary

This document tracks the weekly progress of the CipherSafe project, from initial setup to feature implementation and refinement.

---

### **Week 1: Project Foundation and Core Authentication**

**Goal:** Establish the project structure and implement the primary user authentication and master password setup.

**Accomplishments:**
-   Initialized a new Next.js project with TypeScript.
-   Configured the UI layer with Tailwind CSS and ShadCN, establishing the dark theme and core styling based on the project's style guide.
-   Set up Firebase and integrated Firebase Authentication for user sign-up and login via email and password.
-   Created the initial UI components for authentication (`Auth.tsx`), including tabs for login and sign-up.
-   Implemented the "Create Master Password" flow, which appears after a user's first login.
-   Integrated the `argon2` library to securely hash the user's master password. The resulting hash is stored in a `profiles` collection in Firestore, linked to the user's UID.

**Key Technologies Used:** Next.js, React, TypeScript, Firebase Auth, Firestore, Tailwind CSS, ShadCN, Argon2.

---

### **Week 2: Credential Management and Advanced Encryption**

**Goal:** Build the core functionality for adding, encrypting, and revealing passwords within the user's vault.

**Accomplishments:**
-   Designed and built the main `PasswordDashboard` component to display user credentials.
-   Developed the `AddPasswordDialog` component, allowing users to input new service credentials.
-   Implemented the `credential-flow` Genkit flow, which orchestrates the entire credential-saving process.
-   Integrated the Node.js `crypto` library to perform AES-256-GCM encryption on passwords before they are stored.
-   Implemented Shamir's Secret Sharing (`shamirs-secret-sharing-ts`) to split the encrypted password into multiple shares for decentralized storage.
-   Set up a simulated IPFS service (`ipfs.ts`) to "store" and "retrieve" these secret shares, mimicking a decentralized storage layer.
-   Developed the "Reveal Password" functionality, which fetches shares, reconstructs the secret, and decrypts it using the master password.

**Key Technologies Used:** Genkit, AES-256 (Node.js Crypto), Shamir's Secret Sharing, Simulated IPFS.

---

### **Week 3: ZKP Simulation and UI/UX Refinement**

**Goal:** Simulate the final security feature (ZKP), improve user feedback, and polish the overall user experience.

**Accomplishments:**
-   Integrated a **simulated** Zero-Knowledge Proof (ZKP) step into the `credential-flow`. This simulates the time and process of generating and verifying a proof of password ownership without a full cryptographic implementation.
-   Enhanced all asynchronous operations (e.g., logging in, saving credentials, revealing passwords) with loading spinners (`Loader2`) and descriptive toasts to provide clear user feedback.
-   Added the "Delete Credential" functionality, including a confirmation dialog (`AlertDialog`) to prevent accidental deletion.
-   Implemented the "Lock Vault" and "Logout" features, allowing users to secure their session.
-   Refined the visual design by adding `lucide-react` icons to buttons and cards, improving the overall aesthetic and user guidance.

**Key Technologies Used:** `lucide-react`, ShadCN `Toast`, `AlertDialog`.

---

### **Week 4: Debugging, Security Hardening, and Finalization**

**Goal:** Address critical bugs, correctly implement security rules, and stabilize the application for its final state.

**Accomplishments:**
-   Diagnosed and fixed a persistent "Missing or insufficient permissions" error from Firestore. This required multiple iterations to correctly structure the `firestore.rules` to allow both listing a user's own credentials (`list` operation) and managing individual documents (`get`, `create`, `update`, `delete`).
-   Resolved a critical bug where credentials were not being fetched after a user logged in. This was fixed by correcting the dependency array in the `useEffect` hook within the `PasswordDashboard`.
-   Addressed several IPFS-related errors by moving from a failing public gateway implementation to a robust, fully simulated IPFS service, ensuring the application works reliably without external dependencies.
-   Conducted a final review of the codebase to ensure all components and flows work as intended.

**Key Focus:** Firestore Security Rules, React Hooks (`useEffect`), and robust error handling.
