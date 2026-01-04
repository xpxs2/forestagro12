
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Ranger } from '@/lib/staff-types'; // <-- Import the new interface

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.split(' ')[1];

  if (apiKey !== process.env.STAFF_API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('role', '==', 'ranger').get();

    if (snapshot.empty) {
      return NextResponse.json({ rangers: [] });
    }

    // Map the Firestore documents to the clean Ranger interface
    const rangers: Ranger[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        role: 'ranger',
        name: data.name,
        phone: data.phone,
      };
    });

    return NextResponse.json({ rangers });

  } catch (error) {
    console.error("Error fetching ranger data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
