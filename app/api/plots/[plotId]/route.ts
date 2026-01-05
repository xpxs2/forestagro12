
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

interface PlotData {
  id: string;
  farmerId: string;
  name: string;
  area: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

async function getDecodedToken(request: NextRequest) {
    const idToken = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) {
        return null;
    }
    try {
        return await getAuth().verifyIdToken(idToken);
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

export async function POST(request: NextRequest, { params }: { params: { plotId: string } }) {
    const decodedToken = await getDecodedToken(request);
    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plotId } = params;
    const isNew = plotId === 'new-plot';

    try {
        const plotData: PlotData = await request.json();

        // Security Check: Ensure the user is editing their own plot
        if (decodedToken.uid !== plotData.farmerId) {
             return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const plotRef = doc(db, 'plots', isNew ? doc(db, 'plots').id : plotId);
        
        if (isNew) {
            plotData.id = plotRef.id;
            await setDoc(plotRef, plotData);
        } else {
            await updateDoc(plotRef, plotData);
        }

        return NextResponse.json(plotData, { status: 200 });

    } catch (error) {
        console.error('Error saving plot:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to save plot: ${errorMessage}` }, { status: 500 });
    }
}
