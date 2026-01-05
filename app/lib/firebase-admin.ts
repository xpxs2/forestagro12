import admin from 'firebase-admin';

// The service account key is expected to be in a JSON string format
// in the environment variable GOOGLE_APPLICATION_CREDENTIALS.
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!admin.apps.length) {
  if (!serviceAccount) {
    // In a local development environment, you might not have the service account key.
    // The emulator or a default credential will be used in such cases.
    console.warn(
      'Firebase Admin SDK not initialized. Missing GOOGLE_APPLICATION_CREDENTIALS. Using default credentials for local development or emulators.'
    );
    admin.initializeApp();
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw new Error(
        'Could not initialize Firebase Admin SDK. Please check your GOOGLE_APPLICATION_CREDENTIALS.'
      );
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
