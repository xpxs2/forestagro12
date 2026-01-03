
import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin'; // CORRECT: Import the default export
import type { User } from '@/app/api/types';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

const db = admin.firestore(); // CORRECT: Access firestore from the admin object

/**
 * GET a single user by their ID.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const userDocRef = db.collection('users').doc(id);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ message: `User with ID ${id} not found` }, { status: 404 });
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;
    return NextResponse.json(user);

  } catch (error) {
    console.error(`API GET Error for user ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
