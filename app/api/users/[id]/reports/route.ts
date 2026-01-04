
import { NextResponse } from 'next/server';
import { firestore } from 'firebase-admin';
import { db } from '@/lib/firebase-admin';
import { authenticateServiceAccount } from '@/lib/service-account-auth';

/**
 * API route to add a detailed report to a user's record.
 * This is used by the agro-vista20 staff app to submit generated reports from 
 * their analysis, including weather, satellite data, etc.
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
        const { staff_id, title, summary, data } = body;

        // Validate request body
        if (!staff_id || !title || !summary || !data) {
            return NextResponse.json({ error: 'Missing required fields: staff_id, title, summary, and data' }, { status: 400 });
        }

        // Reference to the 'reports' sub-collection
        const reportsCollectionRef = db.collection('users').doc(userId).collection('reports');

        // Prepare the new report document
        const newReportDoc = {
            staff_id,
            title,
            summary,
            data, // The rich data object containing all report details
            generatedAt: firestore.FieldValue.serverTimestamp(),
            source: 'agro-vista20',
        };

        // Add the new document
        const docRef = await reportsCollectionRef.add(newReportDoc);

        return NextResponse.json({ message: 'Report added successfully', reportId: docRef.id }, { status: 201 });

    } catch (error) {
        console.error('Error adding report:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
