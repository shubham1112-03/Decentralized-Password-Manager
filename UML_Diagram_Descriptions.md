# UML Diagram Descriptions for CipherSafe

This document provides detailed descriptions for various UML diagrams that model the CipherSafe application. This content is derived from the existing codebase and can be used to generate formal diagrams in a UML modeling tool. Each section provides an in-depth explanation of the diagram's purpose and how it maps to the components of the CipherSafe project.

---

### 1. Class Diagram

**Explanation:**
The Class Diagram models the static structure of the system, providing a blueprint of its main components. It visualizes the key classes, their attributes (data fields), methods (functions), and the relationships between them. This diagram is essential for understanding how data entities (like `User` and `Credential`) relate to the application's logic (like `PasswordDashboard` and Genkit flows). Stereotypes such as `<<React Component>>` or `<<Genkit Flow>>` are used to clarify the nature of each class.

- **`User` (Firebase Auth)**
  - **Description:** Represents an authenticated user account managed by Firebase Authentication. This class abstracts the core identity of a user within the system.
  - **Attributes:**
    - `uid: string` (The unique ID assigned by Firebase, serving as the primary key across the system).
    - `email: string` (The user's login email).
  - **Relationships:** A `User` is the central actor who `has one` `Profile` (for storing metadata) and can `have many` `Credential` entries.

- **`Profile` (Firestore Document)**
  - **Description:** Stores user-specific, non-sensitive metadata in a Firestore document. Its primary role is to hold the hashed master password, which is used to verify the user before allowing access to the vault.
  - **Attributes:**
    - `uid: string` (Foreign key linking back to the `User`).
    - `master_password_hash: string` (The Argon2 hash of the user's master password).
  - **Relationships:** `Belongs to one` `User`.

- **`Credential` (Data Entity & Firestore Document)**
  - **Description:** Represents a single password entry in the user's vault. This class defines the structure of the data stored in Firestore for each credential.
  - **Attributes:**
    - `id: string` (The unique document ID in Firestore).
    - `user_id: string` (Foreign key linking to the `User`).
    - `service: string` (e.g., "Google", "GitHub").
    - `username: string` (The username for the service).
    - `sharesCids: string[]` (An array of IPFS Content Identifiers pointing to the Shamir's secret shares).
    - `zkProof: string` (The simulated Zero-Knowledge Proof).

- **`Auth` (`<<React Component>>`)**
  - **Description:** A top-level component that orchestrates the entire user authentication lifecycle, from initial login to unlocking the vault. It acts as a state machine, rendering different UI views based on the user's auth status.
  - **Methods:**
    - `handleLogin(email, password)`
    - `handleSignup(email, password)`
    - `handleSetMasterPassword(masterPassword)`
    - `handleUnlock(masterPassword)`
    - `handleLogout()`

- **`PasswordDashboard` (`<<React Component>>`)**
  - **Description:** The main user interface for displaying and managing credentials once the vault is unlocked. It is responsible for fetching and rendering the list of `PasswordCard` components.
  - **Methods:**
    - `fetchCredentials()` (Loads all credential metadata from Firestore for the current user).
    - `addCredentialToState(credential)` (Updates the UI when a new credential is created).
    - `deleteCredential(id)` (Removes a credential from the UI and Firestore).
  - **Relationships:** It `composes` multiple `PasswordCard` components, one for each credential.

- **`addCredential` (`<<Genkit Flow>>`)**
  - **Description:** A server-side flow that orchestrates the complex cryptographic process of adding a new password. It encapsulates all security-critical logic to keep it off the client.
  - **Inputs:** `masterPassword`, `service`, `username`, `password`
  - **Outputs:** `sharesCids`, `zkProof`
  - **Relationships:** It `Uses` the `CryptoLib` for encryption and the `IPFSFlow` to store the resulting shares.

- **`revealCredential` (`<<Genkit Flow>>`)**
  - **Description:** A server-side flow that securely reconstructs and decrypts a password. It fetches the distributed shares, combines them, and decrypts the result.
  - **Inputs:** `masterPassword`, `sharesCids`, `zkProof`
  - **Outputs:** `plaintextPassword`
  - **Relationships:** It `Uses` the `CryptoLib` for decryption and `IPFSFlow` to retrieve the shares.

- **`CryptoLib` (`<<Utility Module>>`)**
  - **Description:** A stateless utility module that provides the core cryptographic primitives for the application.
  - **Methods (static):**
    - `getKey(password): Promise<Buffer>` (Derives a key from the master password using Argon2).
    - `encrypt(text, key): string` (Encrypts data using AES-256-GCM).
    - `decrypt(encryptedText, key): string` (Decrypts data).

- **`IPFSFlow` (`<<Genkit Flow>>`)**
  - **Description:** A dedicated server-side flow for abstracting all interactions with the IPFS network via the Pinata pinning service.
  - **Methods (static):**
    - `addToIpfs(content): Promise<string>` (Pins content to IPFS and returns the CID).
    - `getFromIpfs(cid): Promise<string>` (Retrieves content from the IPFS gateway using its CID).

---

### 2. Use Case Diagram

**Explanation:**
The Use Case Diagram models the high-level functional requirements of the system from the perspective of an external actor—in this case, the "User." It describes *what* the system does without detailing *how* it does it. This diagram is invaluable for defining the scope of the project and ensuring all user-facing functionality is accounted for.

- **Actor:** User (any individual interacting with the CipherSafe application).

- **Use Cases:**
  1.  **Create Account:** The user registers for a new CipherSafe account by providing an email and a primary account password. The system creates a new user record in Firebase Authentication.
  2.  **Log In:** An existing user signs in with their email and account password to authenticate their session with Firebase.
  3.  **Set Master Password:** A first-time user, after creating an account, defines their master password. This is a critical one-time setup where the system hashes the password with Argon2 and stores the hash in the user's Firestore profile.
  4.  **Unlock Vault:** After logging in, the user must enter their master password. The system verifies this password against the stored hash to decrypt the session's master key and grant access to the credential dashboard.
  5.  **Add New Credential:** The user saves a new password for a service (e.g., Google). The system initiates the full cryptographic pipeline: encrypt, split into shares via Shamir's Secret Sharing, and distribute the shares to IPFS.
  6.  **View Credential:** The user requests to see a stored password. The system triggers the reverse pipeline: fetch shares from IPFS, combine them, and decrypt the secret using the master password.
  7.  **Copy Credential:** After a password has been revealed, the user copies the plaintext password to their device's clipboard for convenience.
  8.  **Delete Credential:** The user permanently removes a credential record. This action deletes the metadata from Firestore (making the IPFS shares undiscoverable).
  9.  **Lock Vault:** The user manually locks the vault, which clears the session's raw master password. This forces re-entry of the master password for any subsequent sensitive operations.
  10. **Log Out:** The user signs out completely, terminating their Firebase Authentication session and locking the vault.

---

### 3. Sequence Diagram

**Explanation:**
Sequence Diagrams model the dynamic interactions between objects over time. They are essential for understanding how different parts of the system collaborate to accomplish a specific task. They show the exact sequence of messages, function calls, and data transfers that occur in response to an event.

#### Sequence: Add New Credential

This sequence details the step-by-step process when a user saves a new password, highlighting the collaboration between the frontend, backend flows, and external services.

1.  **User** -> **`AddPasswordDialog` (UI):** User fills in the form (service, username, password) and clicks "Save".
2.  **`AddPasswordDialog`** -> **`addCredential` (Genkit Flow):** The UI invokes the backend flow, passing the `masterPassword` (from the session state) and the new credential data.
3.  **`addCredential` Flow** -> **`CryptoLib`:** Calls `getKey(masterPassword)` to derive the unique 256-bit encryption key using Argon2.
4.  **`CryptoLib`** -> **`addCredential` Flow:** Returns the derived key (`Buffer`).
5.  **`addCredential` Flow** -> **`CryptoLib`:** Calls `encrypt(password, key)` to encrypt the new credential's password with AES-256-GCM.
6.  **`CryptoLib`** -> **`addCredential` Flow:** Returns the `encryptedPassword` string (containing iv:authtag:ciphertext).
7.  **`addCredential` Flow** -> **`shamirs-secret-sharing-ts` library:** Calls the `split()` function on the `encryptedPassword` to generate an array of cryptographic shares.
8.  **`addCredential` Flow** -> **`IPFSFlow`:** For each share in the array, it asynchronously calls `addToIpfs(share)`.
9.  **`IPFSFlow`** -> **Pinata SDK:** Interacts with the Pinata API to pin the content of the share to the IPFS network.
10. **Pinata SDK** -> **`IPFSFlow`:** Returns the unique Content Identifier (CID) for that share.
11. **`IPFSFlow`** -> **`addCredential` Flow:** Returns the CID. (This loop continues until all shares are pinned).
12. **`addCredential` Flow** -> **Firestore:** After collecting all CIDs, it executes an `addDoc()` operation to create a new document in the `credentials` collection, saving only the non-sensitive metadata and the array of `sharesCids`.
13. **Firestore** -> **`addCredential` Flow:** Confirms the successful database write.
14. **`addCredential` Flow** -> **`AddPasswordDialog` (UI):** The flow completes and returns the result (or an error).
15. **`AddPasswordDialog`** -> **`PasswordDashboard` (UI):** The dialog closes and calls the `onAddCredential` callback to update the application's state and display the new credential in the list without a page reload.

---

### 4. Activity Diagram

**Explanation:**
The Activity Diagram models the dynamic aspects of the system by showing the flow of control from one activity to another. It is excellent for representing business logic and operational workflows, including decisions, concurrent actions, and loops.

#### Activity: User Authentication and Vault Access

This diagram illustrates the user's journey from opening the application to gaining access to their password dashboard.

1.  **Start.** The user opens the CipherSafe web application.
2.  **Check Auth State:** The system's root component (`Auth.tsx`) uses a `useEffect` hook to check the current authentication state with the Firebase SDK.
3.  **Decision: Is User Logged In?**
    - **[No]** -> **Show Login/Signup UI:** The system renders the login and signup tabs, waiting for user interaction. The flow pauses here until the user successfully authenticates.
    - **[Yes]** -> **Fetch User Profile:** The system proceeds to the next step.
4.  **Activity: Fetch Profile from Firestore.** Using the authenticated user's `uid`, the application queries the `profiles` collection in Firestore to retrieve the user's metadata document.
5.  **Decision: Does Profile have `master_password_hash`?**
    - **[No]** -> **Show "Create Master Password" Form:** The user is identified as new (or has not completed setup). They are prompted to create their master password. The workflow proceeds to step 6 after they submit.
    - **[Yes]** -> **Show "Unlock Vault" Form:** The user has already set a master password, so they are prompted to enter it to unlock the vault.
6.  **User Submits Master Password.** The user enters their master password, either for creation or for unlocking.
7.  **System Hashes and Verifies Password.**
    - If creating, the system calls the `hashPassword` flow.
    - If unlocking, it calls the `verifyPassword` flow, comparing the input against the stored hash.
8.  **Decision: Is Verification Successful?**
    - **[No]** -> **Show Error Message.** A toast notification appears, and the flow returns to the "Unlock Vault" form, allowing the user to try again.
    - **[Yes]** -> **Load Password Dashboard.** The raw master password is now stored in the application's memory state for the duration of the session. The system renders the `PasswordDashboard` component, which then fetches and displays the user's credentials.
9.  **End.** The user is now in the main application view.

---

### 5. Component Diagram

**Explanation:**
The Component Diagram provides a high-level, physical view of the system's architecture. It models the organization of and dependencies among the software components, showing how different parts (like the UI, backend services, and external APIs) are wired together.

- **Component: `CipherSafe UI` (React/Next.js)**
  - **Description:** The client-side application that runs in the user's browser. It is responsible for all rendering and user interaction.
  - **Provided Interface:** Web Interface for password management.
  - **Sub-components:**
    - `Auth.tsx` (manages auth state)
    - `PasswordDashboard.tsx` (main vault view)
    - `AddPasswordDialog.tsx` (form for new credentials)
  - **Dependencies:** It makes calls to the `CipherSafe Backend` for complex operations and directly uses the `Firebase Auth SDK` for login/logout and the `Firestore SDK` for data fetching.

- **Component: `CipherSafe Backend` (Genkit Flows)**
  - **Description:** A set of serverless functions that encapsulate the core business logic and security-critical operations.
  - **Provided Interface:** An API for `addCredential` and `revealCredential`.
  - **Sub-components:**
    - `credential-flow.ts` (orchestrates credential logic)
    - `crypto-flow.ts` (handles hashing/verification)
    - `ipfs-flow.ts` (manages IPFS interactions)
  - **Dependencies:** It depends on the `Pinata SDK`, the `shamirs-secret-sharing-ts` library, and the `argon2` library to perform its functions.

- **Component: `Firebase` (External Service)**
  - **Description:** A third-party service from Google providing critical backend infrastructure.
  - **Provided Interfaces:** Authentication API, Firestore Database API.
  - **Sub-components:**
    - `Firebase Authentication`
    - `Firestore`

- **Component: `Pinata` (External Service)**
  - **Description:** A third-party IPFS pinning service.
  - **Provided Interface:** An API for pinning files to the IPFS network.

---

### 6. Deployment Diagram

**Explanation:**
The Deployment Diagram models the physical deployment of the application's software artifacts (like code files, functions, and databases) onto hardware nodes (like a user's device or cloud servers). It provides a static view of the runtime configuration of the system, showing where each piece of software physically runs and how the nodes communicate.

- **Node: User's Device (Browser)**
  - **Description:** Represents the end-user's computer, phone, or tablet.
  - **Artifact:** `CipherSafe Next.js/React App` (Compiled JavaScript, HTML, CSS).
  - **Communication:** Communicates with `Firebase App Hosting` and `Google Cloud` services over HTTPS for authentication, data, and backend logic.

- **Node: Firebase App Hosting / Cloud Functions**
  - **Description:** The serverless environment provided by Google Cloud that executes the application's backend logic.
  - **Artifact:** `Genkit Flows` (Deployed as Node.js serverless functions).
  - **Communication:** Receives requests from the user's browser. It makes outbound API calls to `Pinata` over HTTPS and communicates with `Firestore` via the internal Google Cloud network.

- **Node: Google Cloud Platform (GCP)**
  - **Description:** The managed cloud infrastructure that hosts Firebase services.
  - **Artifacts:**
    - `Firebase Authentication Service`
    - `Firestore Database`
  - **Communication:** Interacts with the user's browser and the Genkit backend functions.

- **Node: IPFS Network**
  - **Description:** A globally distributed, peer-to-peer network of nodes. It is not a single server but a collection of computers.
  - **Artifacts:** `Encrypted Credential Shares` (Stored as files).
  - **Specialized Node:** The `Pinata Service` runs specialized nodes within this network to ensure the credential shares remain available ("pinned") and are not garbage-collected. The Genkit backend communicates with Pinata's API node to manage these pins.
