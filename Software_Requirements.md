
# CipherSafe - Software Requirements

This document outlines the software and services required to develop, run, and use the CipherSafe application.

---

## 1. Development Environment

These are the requirements for developers who want to modify or contribute to the project.

- **Node.js**: A JavaScript runtime environment.
  - **Recommended Version**: `v20.x` or later (Long Term Support - LTS).
  - The project is configured to work with modern Node.js features.

- **Package Manager**: A tool to manage project dependencies.
  - **Recommended**: `npm` (version 9.x or later), which comes bundled with Node.js.
  - `yarn` or `pnpm` can also be used.

- **Operating System**: The project is cross-platform and can be developed on:
  - Windows
  - macOS
  - Linux

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

---

## 3. Required Backend Services

These cloud services are essential for the application to function correctly.

- **Firebase Project**: A Google Firebase project is required to provide the following services:
  - **Firebase Authentication**: For user sign-up and login (currently configured for Email & Password).
  - **Firestore**: A NoSQL database used to store user profiles and encrypted credential metadata.

- **IPFS (Simulated)**:
  - The current implementation **simulates** IPFS and does **not** require an external service or API key. If this were to be changed to a real IPFS pinning service (like `web3.storage`), an API token and account would be required.

---

## 4. End-User Requirements

These are the requirements for an end-user to use the deployed web application.

- **Modern Web Browser**: The application is designed to run on the latest versions of major web browsers.
  - Google Chrome
  - Mozilla Firefox
  - Apple Safari
  - Microsoft Edge
- **Internet Connection**: Required to connect to Firebase services for authentication and data storage.
