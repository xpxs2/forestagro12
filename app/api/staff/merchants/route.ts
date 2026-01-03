
import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';
import { Merchant } from '@/lib/staff-types'; // <-- Import the new interface

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
    const snapshot = await usersRef.where('role', '==', 'merchant').get();

    if (snapshot.empty) {
      return NextResponse.json({ merchants: [] });
    }

    // Map the Firestore documents to the clean Merchant interface
    const merchants: Merchant[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        role: 'merchant',
        name: data.name,
        phone: data.phone,
        businessName: data.businessName,
        businessType: data.businessType,
      };
    });

    return NextResponse.json({ merchants });

  } catch (error) {
    console.error("Error fetching merchant data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
