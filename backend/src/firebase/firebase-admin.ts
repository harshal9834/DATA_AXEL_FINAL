import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!getApps().length) {
  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else if (projectId) {
    console.log(`Initializing Firebase Admin with projectId: ${projectId} for token verification.`);
    initializeApp({ projectId });
  } else {
    console.warn("Firebase Admin environment variables missing. Using default initialization (may fail if not deployed with ADC).");
    initializeApp();
  }
}

export const adminAuth = getAuth();
