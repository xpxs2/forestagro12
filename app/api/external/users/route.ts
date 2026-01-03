import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { authenticateServiceAccount } from '@/lib/service-account-auth';

/**
 * API route for the external staff app (agro-vista20) to fetch user data.
 * Supports filtering by country.
 * This endpoint is protected and requires authentication via a service account JWT.
 */
export async function GET(request: Request) {
    // Authenticate the request
    const authResult = await authenticateServiceAccount(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json({ error: 'The \'country\' query parameter is required.' }, { status: 400 });
    }

    try {
        // Query the 'users' collection
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('country', '==', country));

        const querySnapshot = await getDocs(q);
        
        const users = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(users, { status: 200 });

    } catch (error) {
        console.error('Error fetching users by country:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
