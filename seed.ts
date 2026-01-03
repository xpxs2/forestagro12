
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Check if the environment variable is set
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
  console.error('Please set it to the path of your Firebase service account key file.');
  process.exit(1);
}

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:');
  if (error instanceof Error) {
    console.error(`- Message: ${error.message}`);
    if (error.message.includes('ENOENT')) {
      console.error(`- Suggestion: Make sure the path specified in GOOGLE_APPLICATION_CREDENTIALS is correct.`);
    }
  } else {
    console.error(error);
  }
  process.exit(1);
}


const db = getFirestore();
const usersFilePath = path.join(__dirname, 'src', 'data', 'users.db.json');

async function seedDatabase() {
  try {
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);

    if (!Array.isArray(users)) {
      throw new Error('Invalid data format in users.db.json. Expected an array.');
    }

    console.log('Starting to seed the "users" collection...');

    const batch = db.batch();
    let count = 0;

    for (const user of users) {
      if (user.id) {
        const userRef = db.collection('users').doc(user.id.toUpperCase());
        batch.set(userRef, user);
        count++;
        console.log(`- Preparing to add user: ${user.id}`);
      }
    }

    await batch.commit();
    console.log(`
Successfully seeded ${count} users into the Firestore database.`);

  } catch (error) {
    console.error('Error seeding database:');
    if (error instanceof Error) {
        console.error(`- Message: ${error.message}`);
    } else {
        console.error(error);
    }
  }
}

seedDatabase();
