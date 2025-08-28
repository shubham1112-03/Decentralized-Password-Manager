# **App Name**: CipherSafe

## Core Features:

- Master Password: Master password generation using Argon2 hashing.
- AES-256 Encryption: AES-256 encryption of stored passwords using the master password.
- Secret Sharing and IPFS: Securely distributes encrypted password using Shamir Secret Sharing and IPFS for decentralized storage.
- Zero-Knowledge Proofs: Implements Zero-Knowledge Proofs using Circom or Zokrates to confirm password ownership without revealing the actual password.
- Password Input: Input field to securely enter master password to unlock encrypted data.
- Password Decryption Display: Displays decrypted password in plaintext, visible only after correct master password verification.

## Style Guidelines:

- Primary color: Dark indigo (#4B0082) to evoke a sense of security and trust.
- Background color: Very dark grayish-blue (#242526) to create a secure and focused environment.
- Accent color: Electric purple (#BF00FF) to highlight interactive elements and reinforce the tech-forward nature of the app.
- Font: 'Inter', a sans-serif font, for clear and modern readability. Note: currently only Google Fonts are supported.
- Clean, minimalist layout with clear visual hierarchy to prioritize ease of use and security.
- Subtle animations to confirm decryption and reveal passwords, providing user feedback.