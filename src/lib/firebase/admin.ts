import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

const app = getApps()[0] ?? createFirebaseAdminApp();

function createFirebaseAdminApp() {
  if (
    serviceAccount.projectId &&
    serviceAccount.clientEmail &&
    serviceAccount.privateKey
  ) {
    return initializeApp({
      credential: cert({
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  return initializeApp({
    projectId:
      process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const firebaseAdminAuth = getAuth(app);
export const firebaseAdminDb = getFirestore(app);
