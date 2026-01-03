
import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';
import { Farmer } from '@/lib/staff-types'; // <-- Import the new interface

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.split(' ')[1];

  if (apiKey !== process.env.STAFF_API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminApp = await initAdmin();
    const db = getFirestore(adminApp);

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('role', '==', 'farmer').get();

    if (snapshot.empty) {
      return NextResponse.json({ farmers: [] });
    }

    // Map the Firestore documents to the clean Farmer interface
    const farmers: Farmer[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        role: 'farmer',
        name: data.name,
        phone: data.phone,
        nationalId: data.nationalId,
        address: data.address,
        farmerId: data.farmerId,
      };
    });

    return NextResponse.json({ farmers });

  } catch (error) {
    console.error("Error fetching farmer data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
