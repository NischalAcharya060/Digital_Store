import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function assertBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error("Firebase client is available only in browser runtime");
  }
}

function assertConfig(): void {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Missing NEXT_PUBLIC Firebase client env values");
  }
}

export function getFirebaseClientApp(): FirebaseApp {
  assertBrowser();
  assertConfig();

  if (app) {
    return app;
  }

  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseClientAuth(): Auth {
  if (auth) {
    return auth;
  }

  auth = getAuth(getFirebaseClientApp());
  return auth;
}

export function getFirebaseClientDb(): Firestore {
  if (db) {
    return db;
  }

  db = getFirestore(getFirebaseClientApp());
  return db;
}
