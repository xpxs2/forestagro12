
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Initialize the app using Application Default Credentials
// This is the recommended approach for environments like Cloud Run (used by App Hosting)
// It automatically finds the correct service account credentials.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
}

export default admin;
