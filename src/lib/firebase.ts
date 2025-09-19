
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isFirebaseConfigured() {
    return firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY';
}

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    console.warn(`
    ****************************************************************
    ** FIREBASE IS NOT CONFIGURED!                                **
    **------------------------------------------------------------**
    ** To get started, you'll need to create a Firebase project   **
    ** and add your configuration to a .env.local file.           **
    **                                                            **
    ** NEXT_PUBLIC_FIREBASE_API_KEY=...                           **
    ** NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...                       **
    ** NEXT_PUBLIC_FIREBASE_PROJECT_ID=...                        **
    ** NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...                    **
    ** NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...               **
    ** NEXT_PUBLIC_FIREBASE_APP_ID=...                            **
    ****************************************************************
    `);
}


export { app, auth, db, isFirebaseConfigured };
