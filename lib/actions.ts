'use server';

import { revalidatePath } from 'next/cache';
import admin from './firebase-admin';
import type { Plot } from '@/app/api/types';
import { logActivity } from './logging';

const db = admin.firestore();
const auth = admin.auth();

export async function savePlot(plotData: Plot, token: string): Promise<Plot> {
    try {
        // Verify the user's token to get their UID
        const decodedToken = await auth.verifyIdToken(token);
        const loggedInUserId = decodedToken.uid;

        // Security Check: Ensure the logged-in user is the one this plot belongs to.
        // The farmerId is submitted as part of the form data.
        if (loggedInUserId !== plotData.farmerId) {
            throw new Error('Authorization Error: You can only save plots for your own account.');
        }

        const plotsCollection = db.collection('plots');
        let plotToSave: Plot;

        if (plotData.id && plotData.id !== 'new-plot') {
            // Update existing plot
            const { id, ...dataToUpdate } = plotData;
            const plotRef = plotsCollection.doc(id);
            await plotRef.update(dataToUpdate);
            plotToSave = plotData;
        } else {
            // Create new plot
            const { id, ...dataToCreate } = plotData;
            const newPlotRef = await plotsCollection.add(dataToCreate);
            plotToSave = { ...dataToCreate, id: newPlotRef.id };
        }

        // Log the activity
        await logActivity({
            userId: loggedInUserId,
            action: plotData.id && plotData.id !== 'new-plot' ? 'PLOT_UPDATED' : 'PLOT_CREATED',
            details: { plotId: plotToSave.id },
        });

        // Revalidate paths to update caches
        revalidatePath('/farmers/dashboard');
        if (plotToSave.id) {
            revalidatePath(`/farmers/plots/${plotToSave.id}/edit`);
        }

        return plotToSave;

    } catch (error) {
        console.error("Error in savePlot Server Action:", error);
        // Re-throw the error to be caught by the client-side try/catch block
        if (error instanceof Error) {
            throw new Error(`Failed to save plot. Reason: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while saving the plot.');
        }
    }
}
