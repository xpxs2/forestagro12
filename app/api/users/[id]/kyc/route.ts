import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { authenticateServiceAccount } from '@/lib/service-account-auth';

/**
 * API route to add a KYC check record for a user.
 * This endpoint is protected and requires authentication via a service account JWT.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { id: userId } = params;

    // Authenticate the request to ensure it's from a trusted service account
    const authResult = await authenticateServiceAccount(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const body = await request.json();
        const { staff_id, status, notes } = body;

        // Validate the request body for required fields
        if (!staff_id || !status) {
            return NextResponse.json({ error: 'Missing required fields: staff_id and status' }, { status: 400 });
        }

        // Reference to the 'kyc_checks' sub-collection for the specified user
        const kycCollectionRef = collection(db, 'users', userId, 'kyc_checks');

        // Prepare the new KYC document
        const newKycDoc = {
            staff_id, // The ID of the staff member from agro-vista20 performing the check
            status,   // e.g., 'verified', 'pending', 'rejected'
            notes: notes || '',
            createdAt: serverTimestamp(), // Use server-side timestamp for reliability
            source: 'agro-vista20', // Tag the data source for clarity
        };

        // Add the new document to the sub-collection
        const docRef = await addDoc(kycCollectionRef, newKycDoc);

        // Return a success response
        return NextResponse.json({ message: 'KYC check added successfully', kycId: docRef.id }, { status: 201 });

    } catch (error) {
        console.error('Error adding KYC check:', error);
        // Handle potential JSON parsing errors or other unexpected issues
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
