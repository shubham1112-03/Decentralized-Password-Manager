# CipherSafe - Software and Hardware Requirements

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
  - **Why selected**: It was chosen for its robust full-stack capabilities, including server-side rendering (SSR), API routes, and an excellent developer experience, which is ideal for building a modern, performant web application.

- **React**: `v18.x` - The core UI library.
  - **Why selected**: As the industry standard for building dynamic user interfaces, React's component-based architecture allowed for the creation of a modular and maintainable frontend.

- **TypeScript**: `v5.x` - For static typing and improved code quality.
  - **Why selected**: TypeScript was essential for a project with complex data flows and cryptographic operations, as it reduces runtime errors and improves code clarity.

- **Tailwind CSS & Shadcn/ui**: For styling the user interface.
  - **Why selected**: This combination was chosen for rapid UI development, providing a set of beautiful, accessible, and customizable components out-of-the-box.

- **Genkit**: `v1.x` - The AI framework used to orchestrate the cryptographic backend flows.
  - **Why selected**: Genkit was selected to abstract complex, long-running backend tasks (like key derivation, encryption, and IPFS pinning) into secure, serverless flows, keeping the client lightweight and secure.

- **Pinata SDK**: `v2.x` - For interacting with the Pinata IPFS pinning service.
  - **Why selected**: Pinata provides a reliable and easy-to-use service for ensuring data persistence on the IPFS network, which is critical for the decentralized storage aspect of CipherSafe.

- **Argon2 & Shamir's Secret Sharing**: Cryptographic libraries.
  - **Why selected**: Argon2 was chosen as the key derivation function because it is a modern, memory-hard algorithm resistant to both GPU and custom hardware attacks. Shamir's Secret Sharing was selected as the ideal cryptographic primitive for splitting a secret into fragments, forming the core of the decentralized storage model.

---

## 3. Performance Analysis

To evaluate the feasibility and user experience of the cryptographic pipeline, performance analysis would focus on the latency of core user actions.

### 3.1. System Parameters Varied

The primary parameters to vary would be within the Shamir's Secret Sharing (SSS) algorithm to measure its impact on performance and resilience.

- **Number of Shares (N)**: The total number of fragments the encrypted secret is split into.
  - *Values to test*: 5, 7, 10.
- **Threshold of Shares (T)**: The minimum number of fragments required to reconstruct the secret.
  - *Values to test*: 3 (for N=5), 4 (for N=7), 5 (for N=10).

### 3.2. Metrics Measured

The following metrics would be measured end-to-end, from the user's action in the browser to the final confirmation.

- **`addCredential` Latency**:
  - **Definition**: The total time elapsed from the moment a user submits the "Save" form to the moment the application confirms that all credential shares have been successfully pinned to IPFS and the metadata has been written to Firestore.
  - **Measurement**: `T_final - T_initial`, where `T_initial` is the form submission timestamp and `T_final` is the completion of the final promise in the `addCredential` flow.

- **`revealCredential` Latency**:
  - **Definition**: The total time elapsed from the moment a user clicks the "Reveal" button to the moment the decrypted plaintext password is displayed in the UI. This includes fetching the required threshold of shares from the IPFS network gateway, combining them, and decrypting the result.
  - **Measurement**: `T_decrypted - T_request`, where `T_request` is the button click timestamp and `T_decrypted` is the timestamp when the plaintext is rendered.

---

## 4. Required Backend Services (Deployment)

These cloud services are essential for the application to function correctly.

- **Firebase Project**: A Google Firebase project is required to provide:
  - **Firebase Authentication**: For user sign-up and login.
  - **Firestore**: A NoSQL database used to store non-sensitive credential metadata (pointers to IPFS shares).

- **IPFS Pinning Service**:
  - **Pinata**: An account with `pinata.cloud` and a corresponding JWT are required to pin and persist the credential shares on the IPFS network.

