
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Initialize the app using Application Default Credentials
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
