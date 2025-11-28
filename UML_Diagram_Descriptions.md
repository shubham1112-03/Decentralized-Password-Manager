# UML Diagram Descriptions for CipherSafe

This document provides detailed descriptions for various UML diagrams that model the CipherSafe application. This content is derived from the existing codebase and can be used to generate formal diagrams in a UML modeling tool.

---

### 1. Class Diagram

The Class Diagram models the static structure of the system, including its classes, their attributes, methods, and the relationships between them.

- **User (Firebase Auth)**
  - **Description:** Represents an authenticated user account managed by Firebase.
  - **Attributes:**
    - `uid: string`
    - `email: string`
  - **Relationships:** A User `has one` Profile and `has many` Credentials.

- **Profile (Firestore Document)**
  - **Description:** Stores user-specific metadata in Firestore.
  - **Attributes:**
    - `uid: string`
    - `master_password_hash: string`
  - **Relationships:** `Belongs to one` User.

- **Credential (Data Entity)**
  - **Description:** Represents a single password entry in the user's vault.
  - **Attributes:**
    - `id: string` (Document ID in Firestore)
    - `user_id: string`
    - `service: string`
    - `username: string`
    - `sharesCids: string[]`
    - `zkProof: string`

- **Auth (React Component: `auth.tsx`)**
  - **Description:** Manages the user's authentication lifecycle, from login to vault access.
  - **Methods:**
    - `handleLogin(email, password)`
    - `handleSignup(email, password)`
    - `handleSetMasterPassword(masterPassword)`
    - `handleUnlock(masterPassword)`
    - `handleLogout()`

- **PasswordDashboard (React Component: `password-dashboard.tsx`)**
  - **Description:** The main view for displaying and managing a user's credentials.
  - **Methods:**
    - `fetchCredentials()`
    - `addCredentialToState(credential)`
    - `deleteCredential(id)`
  - **Relationships:** `Composes` multiple PasswordCard components.

- **`addCredential` (Genkit Flow)**
  - **Description:** A server-side flow that orchestrates the cryptographic process of adding a new password.
  - **Inputs:** `masterPassword`, `service`, `username`, `password`
  - **Outputs:** `sharesCids`, `zkProof`
  - **Relationships:** `Uses` CryptoLib and IPFSFlow.

- **`revealCredential` (Genkit Flow)**
  - **Description:** A server-side flow that securely reconstructs and decrypts a password.
  - **Inputs:** `masterPassword`, `sharesCids`, `zkProof`
  - **Outputs:** `plaintextPassword`
  - **Relationships:** `Uses` CryptoLib and IPFSFlow.

- **CryptoLib (`/lib/crypto.ts`)**
  - **Description:** A utility module providing cryptographic functions.
  - **Methods (static):**
    - `getKey(password): Promise<Buffer>`
    - `encrypt(text, key): string`
    - `decrypt(encryptedText, key): string`

- **IPFSFlow (`/ai/flows/ipfs-flow.ts`)**
  - **Description:** A server-side flow for interacting with the IPFS network via Pinata.
  - **Methods (static):**
    - `addToIpfs(content): Promise<string>`
    - `getFromIpfs(cid): Promise<string>`

---

### 2. Use Case Diagram

The Use Case Diagram models the interactions between the primary actor (the User) and the CipherSafe system.

- **Actor:** User

- **Use Cases:**
  1.  **Create Account:**
      - The user provides an email and account password to register.
  2.  **Log In:**
      - The user signs in with their existing email and account password.
  3.  **Set Master Password:**
      - A new user creates their unique master password, which is then hashed and stored. This is a one-time setup.
  4.  **Unlock Vault:**
      - The user enters their master password to decrypt the session and gain access to their credentials.
  5.  **Add New Credential:**
      - The user submits a service name, username, and password. The system encrypts it, fragments it, and stores the fragments on IPFS.
  6.  **View Credential:**
      - The user initiates a "reveal" action for a specific credential.
  7.  **Copy Credential:**
      - After a credential has been revealed, the user copies the plaintext password to their clipboard.
  8.  **Delete Credential:**
      - The user permanently removes a credential record from Firestore.
  9.  **Lock Vault:**
      - The user manually locks the vault, requiring them to re-enter the master password for access.
  10. **Log Out:**
      - The user signs out of their account completely.

---

### 3. Sequence Diagram

Sequence Diagrams model the interactions between objects in a time-ordered sequence.

#### Sequence: Add New Credential

1.  **User** -> **AddPasswordDialog:** Enters service details, password, and clicks "Save".
2.  **AddPasswordDialog** -> **addCredential Flow (Backend):** Invokes the flow with `masterPassword` and form data.
3.  **addCredential Flow** -> **CryptoLib:** Calls `getKey(masterPassword)` to derive the encryption key.
4.  **CryptoLib** -> **addCredential Flow:** Returns the derived key.
5.  **addCredential Flow** -> **CryptoLib:** Calls `encrypt(password, key)` to encrypt the credential.
6.  **CryptoLib** -> **addCredential Flow:** Returns the encrypted string.
7.  **addCredential Flow** -> **Shamir's Secret Sharing Lib:** Splits the encrypted string into shares.
8.  **addCredential Flow** -> **IPFSFlow:** Loops through each share and calls `addToIpfs(share)`.
9.  **IPFSFlow** -> **Pinata SDK:** Pins the share to IPFS.
10. **Pinata SDK** -> **IPFSFlow:** Returns the CID.
11. **IPFSFlow** -> **addCredential Flow:** Returns the CID. (Repeated for all shares).
12. **addCredential Flow** -> **Firestore:** `addDoc()` to save a new document with metadata and the `sharesCids`.
13. **Firestore** -> **addCredential Flow:** Confirms the write and returns the new document ID.
14. **addCredential Flow** -> **AddPasswordDialog:** Returns success.
15. **AddPasswordDialog** -> **PasswordDashboard:** Calls `onAddCredential` to update the UI.

---

### 4. Activity Diagram

The Activity Diagram models the flow of control from one activity to another.

#### Activity: User Authentication and Vault Access

1.  **Start.**
2.  **Check Auth State:** System checks if a user is logged in via Firebase.
3.  **[User Not Logged In]** -> **Show Login/Signup Form:** The user is presented with options to log in or create a new account. Activity ends until the user authenticates.
4.  **[User Logged In]** -> **Fetch User Profile from Firestore.**
5.  **Decision: Does Profile have `master_password_hash`?**
    - **[No]** -> **Show "Create Master Password" Form:** The user must set their master password for the first time.
    - **[Yes]** -> **Show "Unlock Vault" Form:** The user must enter their master password to proceed.
6.  **User Enters Master Password.**
7.  **System Hashes Entered Password** and **Verifies** it against the stored hash.
8.  **Decision: Is Verification Successful?**
    - **[No]** -> **Show Error Message.** Flow returns to "Unlock Vault" form.
    - **[Yes]** -> **Load Password Dashboard:** The user's credentials are fetched from Firestore and displayed. The `rawMasterPassword` is stored in the component state for the session.
9.  **End.**

---

### 5. Component Diagram

The Component Diagram models the organization and dependencies among the software components.

- **CipherSafe UI (React/Next.js)**
  - **Provided Interface:** Web Interface for password management.
  - **Components:**
    - `Auth.tsx`
    - `PasswordDashboard.tsx`
    - `PasswordCard.tsx`
    - `AddPasswordDialog.tsx`
    - `UnlockForm.tsx`
  - **Dependencies:** `CipherSafe Backend`, `Firebase Auth SDK`, `Firestore SDK`.

- **CipherSafe Backend (Genkit Flows)**
  - **Provided Interface:** API for `addCredential` and `revealCredential`.
  - **Components:**
    - `credential-flow.ts`
    - `crypto-flow.ts`
    - `ipfs-flow.ts`
  - **Dependencies:** `Pinata SDK`, `shamirs-secret-sharing-ts` library, `argon2` library.

- **Firebase (External Service)**
  - **Provided Interface:** Authentication, Firestore Database.
  - **Components:**
    - `Firebase Authentication`
    - `Firestore`

- **Pinata (External Service)**
  - **Provided Interface:** IPFS Pinning Service.
  - **Components:**
    - `Pinata API`

---

### 6. Deployment Diagram

The Deployment Diagram models the physical deployment of artifacts on nodes.

- **Node: User's Device (Browser)**
  - **Artifact:** `CipherSafe Next.js/React App` (JavaScript, HTML, CSS)
  - **Description:** The client-side application that the user interacts with. It renders the UI and communicates with backend services.

- **Node: Firebase App Hosting / Cloud Functions**
  - **Artifact:** `Genkit Flows` (Node.js Serverless Functions)
  - **Description:** The serverless environment that executes the backend logic for cryptographic operations and interactions with Pinata.

- **Node: Google Cloud Platform**
  - **Artifacts:**
    - `Firebase Authentication Service`
    - `Firestore Database`
  - **Description:** The managed cloud infrastructure providing authentication and database services.

- **Node: IPFS Network**
  - **Artifacts:** `Encrypted Credential Shares` (Files)
  - **Description:** A distributed network of nodes storing the fragmented data. The `Pinata Service` acts as a specialized node ensuring these files remain available (pinned).
