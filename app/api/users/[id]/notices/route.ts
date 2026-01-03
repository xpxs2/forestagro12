import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { authenticateServiceAccount } from '@/lib/service-account-auth';

/**
 * API route to add a notice to a user's record.
 * This is used by the agro-vista20 staff app to send knowledge-base articles,
 * reminders, or other persuasive information.
 * This endpoint is protected and requires authentication via a service account JWT.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { id: userId } = params;

    // Authenticate the request
    const authResult = await authenticateServiceAccount(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const body = await request.json();
        const { staff_id, title, body: noticeBody, link } = body;

        // Validate request body
        if (!staff_id || !title || !noticeBody) {
            return NextResponse.json({ error: 'Missing required fields: staff_id, title, and body' }, { status: 400 });
        }

        // Reference to the 'notices' sub-collection
        const noticesCollectionRef = collection(db, 'users', userId, 'notices');

        // Prepare the new notice document
        const newNoticeDoc = {
            staff_id,
            title,
            body: noticeBody,
            link: link || '', // Optional link to a KB article
            status: 'delivered', // Initial status
            createdAt: serverTimestamp(),
            source: 'agro-vista20',
        };

        // Add the new document
        const docRef = await addDoc(noticesCollectionRef, newNoticeDoc);

        return NextResponse.json({ message: 'Notice added successfully', noticeId: docRef.id }, { status: 201 });

    } catch (error) {
        console.error('Error adding notice:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
