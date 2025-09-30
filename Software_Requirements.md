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
- **React**: `v18.x` - The core UI library.
- **TypeScript**: `v5.x` - For static typing and improved code quality.
- **Tailwind CSS**: `v3.x` - For styling the user interface.
- **Shadcn/ui**: A component library built on top of Radix UI and Tailwind CSS.
- **Genkit**: `v1.x` - The AI framework used to orchestrate the cryptographic backend flows.

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
  - The application uses **web3.storage** to pin credential shares to the IPFS network.
  - An account with `web3.storage` is required.
  - An **API Token** from `web3.storage` must be provided in the `.env` file for the service to work.

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
