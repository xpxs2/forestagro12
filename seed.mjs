
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './src/lib/forestagro-12-credentials.json' assert { type: 'json' };

// Initialize Firebase Admin SDK
const adminApp = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(adminApp);
const auth = getAuth(adminApp);

// --- USER DATA ---
const usersToCreate = [
  { email: 'farmth01@example.com', password: '123456', displayName: 'Thai Farmer 1', role: 'farmer', country: 'TH' },
  { email: 'farmth02@example.com', password: '123456', displayName: 'Thai Farmer 2', role: 'farmer', country: 'TH' },
  { email: 'farmid01@example.com', password: '123456', displayName: 'Indonesian Farmer 1', role: 'farmer', country: 'ID' },
  { email: 'farmkh01@example.com', password: '123456', displayName: 'Cambodian Farmer 1', role: 'farmer', country: 'KH' },
  { email: 'rangerth01@example.com', password: '123456', displayName: 'Thai Ranger 1', role: 'ranger', country: 'TH' },
  { email: 'rangerid01@example.com', password: '123456', displayName: 'Indonesian Ranger 1', role: 'ranger', country: 'ID' },
  { email: 'rangerkh01@example.com', password: '123456', displayName: 'Cambodian Ranger 1', role: 'ranger', country: 'KH' },
];

const plots = [
    { id: 'plot-th-01', farmerEmail: 'farmth01@example.com', name: 'Mae Rim Grove', country: 'TH', province: 'Chiang Mai', district: 'Mae Rim', area: 5.2, landUse: 'Agroforestry', species: [{ name: 'Mango', datePlanted: '2023-04-15', fertilizerType: 'Organic Compost' }] },
    { id: 'plot-id-01', farmerEmail: 'farmid01@example.com', name: 'Bali Rice Paddy', country: 'ID', province: 'Bali', district: 'Ubud', area: 3.0, landUse: 'Paddy', species: [{ name: 'Rice', datePlanted: '2023-06-01', fertilizerType: 'Urea' }] },
    { id: 'plot-kh-01', farmerEmail: 'farmkh01@example.com', name: 'Kampot Pepper Farm', country: 'KH', province: 'Kampot', district: 'Kampot', area: 2.5, landUse: 'Plantation', species: [{ name: 'Pepper', datePlanted: '2022-12-10', fertilizerType: 'Bat Guano' }] },
];

async function deleteAllUsers() {
  let users = [];
  let pageToken;
  do {
    const listUsersResult = await auth.listUsers(1000, pageToken);
    users = users.concat(listUsersResult.users);
    pageToken = listUsersResult.pageToken;
  } while (pageToken);

  const uids = users.map(userRecord => userRecord.uid);
  if (uids.length > 0) {
    await auth.deleteUsers(uids);
    console.log(`Successfully deleted ${uids.length} users.`);
  }
}

async function clearCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.limit(500).get();
  if (snapshot.size === 0) return;

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the same collection to delete more documents
  return clearCollection(collectionPath);
}

async function seedDatabase() {
  console.log('--- Starting Database Seeding ---');

  // 1. Clear all existing Auth users and Firestore data
  console.log('Step 1: Clearing existing data...');
  await deleteAllUsers();
  await clearCollection('users');
  await clearCollection('plots');
  console.log('Data cleared successfully.');

  // 2. Create new Auth users and corresponding Firestore user documents
  console.log('Step 2: Creating new users in Auth and Firestore...');
  const userRecords = [];
  for (const userData of usersToCreate) {
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
    });
    userRecords.push(userRecord);
    
    // Create Firestore doc with the same UID
    const userDocRef = db.collection('users').doc(userRecord.uid);
    await userDocRef.set({
      email: userData.email,
      role: userData.role,
      country: userData.country,
      name: userData.displayName,
    });
  }
  console.log(`Successfully created ${userRecords.length} users.`);

  // 3. Create plot documents, linking them by the new UIDs
  console.log('Step 3: Creating new plot documents...');
  for (const plotData of plots) {
    // Find the user record we just created for the farmer's email
    const farmerAuthRecord = userRecords.find(u => u.email === plotData.farmerEmail);
    if (farmerAuthRecord) {
        const { farmerEmail, ...plotDetails } = plotData; // a little redundant, but keeps data clean
        const plotDocRef = db.collection('plots').doc(plotData.id);
        await plotDocRef.set({
            ...plotDetails,
            farmerId: farmerAuthRecord.uid, // Link plot to the new UID
        });
    } else {
        console.warn(`Could not find farmer with email ${plotData.farmerEmail} to assign plot ${plotData.id}`);
    }
  }
  console.log(`Successfully created ${plots.length} plots.`);

  console.log('--- Database Seeding Complete ---');
  process.exit(0);
}

seedDatabase().catch(error => {
  console.error('Error during database seeding:', error);
  process.exit(1);
});
