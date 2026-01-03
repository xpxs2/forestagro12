import 'server-only';

import { Plot, User } from '@/app/api/types';
import admin from './firebase-admin'; // CORRECT: Import the default export

const db = admin.firestore(); // CORRECT: Access firestore from the admin object

async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const snapshot = await db.collection(collectionName).get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw new Error(`Failed to fetch data from ${collectionName}.`);
  }
}

export async function getAllPlots(): Promise<Plot[]> {
  return fetchCollection<Plot>('plots');
}

export async function getAllUsers(): Promise<User[]> {
  return fetchCollection<User>('users');
}

export async function getPlotById(plotId: string): Promise<Plot | null> {
    try {
        const docRef = db.collection('plots').doc(plotId);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.warn(`Plot with ID "${plotId}" not found.`);
            return null;
        }

        return { id: doc.id, ...doc.data() } as Plot;

    } catch (error) {
        console.error(`Error fetching plot by ID "${plotId}":`, error);
        return null; // Return null to indicate not found or an error
    }
}

export async function getPlotsByFarmerId(farmerId: string): Promise<Plot[]> {
    try {
        const plotsRef = db.collection('plots');
        const snapshot = await plotsRef.where('farmerId', '==', farmerId).get();

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plot));

    } catch (error) {
        console.error(`Error fetching plots for farmer ID "${farmerId}":`, error);
        return []; // Return empty array on error to prevent crashes
    }
}
