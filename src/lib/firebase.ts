// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: This is a public configuration and is safe to expose.
// Security is handled by Firebase Security Rules.
const firebaseConfig = {
  "projectId": "ciphersafe-eeuf7",
  "appId": "1:316294904458:web:4d510574a9e2167a588b73",
  "storageBucket": "ciphersafe-eeuf7.firebasestorage.app",
  "apiKey": "AIzaSyCVKNQO1KZi2n0A8TKQFStczRVmoaJ2GIE",
  "authDomain": "ciphersafe-eeuf7.firebaseapp.com",
  "messagingSenderId": "316294904458"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
