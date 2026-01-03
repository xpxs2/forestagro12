
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { savePlot } from '@/lib/actions';
import { Plot } from '@/app/api/types';
import admin from '@/lib/firebase-admin';

const db = admin.firestore();

// GET a specific plot by ID
export async function GET(request: NextRequest, { params }: { params: { plotId: string } }) {
    try {
        const plotRef = db.collection('plots').doc(params.plotId);
        const doc = await plotRef.get();

        if (!doc.exists) {
            return new NextResponse(JSON.stringify({ message: 'Plot not found' }), { status: 404 });
        }

        const plot = { id: doc.id, ...doc.data() };
        return NextResponse.json(plot);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Error fetching plot ${params.plotId}:`, errorMessage);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), { status: 500 });
    }
}

// UPDATE a specific plot by ID
export async function PUT(request: NextRequest, { params }: { params: { plotId: string } }) {
    const plotId = params.plotId;
    let plotToUpdate: Plot;

    try {
        plotToUpdate = await request.json();
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: 'Invalid JSON body' }), { status: 400 });
    }

    // Basic validation
    if (!plotToUpdate || typeof plotToUpdate !== 'object') {
        return new NextResponse(JSON.stringify({ message: 'Invalid plot data provided' }), { status: 400 });
    }

    try {
        // Extract the token from the Authorization header.
        const authorization = request.headers.get('Authorization');
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return new NextResponse(JSON.stringify({ message: 'Unauthorized: Missing or invalid token' }), { status: 401 });
        }
        const token = authorization.substring(7);

        // Use the centralized, secure server action to perform the update.
        const savedPlot = await savePlot(plotToUpdate, token);
        
        return NextResponse.json(savedPlot);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Error updating plot ${plotId}:`, errorMessage);

        if (errorMessage.includes('permission_denied')) {
             return new NextResponse(JSON.stringify({ message: 'Permission Denied', error: errorMessage }), { status: 403 });
        }

        return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), { status: 500 });
    }
}
