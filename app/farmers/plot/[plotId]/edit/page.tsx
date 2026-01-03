'use client';

import { Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { savePlot } from '@/lib/actions';
import type { Plot } from '@/app/api/types';
import { useFirebase } from '@/lib/FirebaseProvider';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function PlotEditForm({ userId }: { userId: string }) {
    const router = useRouter();
    const params = useParams();
    const { auth } = useFirebase();
    const plotId = params.plotId as string;
    const isNew = plotId === 'new-plot';

    const { data: plot, error: fetchError, mutate } = useSWR<Plot>(!isNew ? `/api/plots/${plotId}` : null, fetcher);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Plot>({
        defaultValues: { farmerId: userId, name: '', area: 0, location: { latitude: 0, longitude: 0 } },
        values: plot ? { ...plot } : undefined,
    });

    const onSubmit = async (data: Plot) => {
        if (!auth || !auth.currentUser) {
            alert('You must be logged in to save a plot.');
            return;
        }

        const plotData = { ...data, farmerId: userId };

        try {
            const token = await auth.currentUser.getIdToken();
            const savedPlot = await savePlot(plotData, token);
            alert(`Plot "${savedPlot.name}" saved successfully!`);
            mutate();
            router.push(`/farmers/dashboard?userId=${userId}`);
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            console.error('Save failed:', error);
            alert(`Failed to save plot: ${errorMessage}`);
        }
    };

    if (!isNew && fetchError) return <div className="text-center p-8 text-red-500">Error: Could not load plot data.</div>;
    if (!isNew && !plot) return <div className="text-center p-8 text-lg">Loading Form...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-secondary p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-8">{isNew ? 'Create New Plot' : `Edit ${plot?.name || 'Plot'}`}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold mb-1 text-primary">Plot Name</label>
                    <input {...register('name', { required: 'Plot Name is required.' })} className="w-full p-2 rounded-md bg-background-light border border-gray-600" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1 text-primary">Area (Hectares)</label>
                    <input type="number" step="0.1" {...register('area', { required: 'Area is required.', valueAsNumber: true })} className="w-full p-2 rounded-md bg-background-light border border-gray-600" />
                    {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
                </div>
            </div>

            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-600 p-4 rounded-md">
                <legend className="text-sm font-semibold px-2 text-primary">Location</legend>
                <div>
                    <label className="block text-sm font-semibold mb-1 text-primary">Latitude</label>
                    <input type="number" step="any" {...register('location.latitude', { required: 'Latitude is required.', valueAsNumber: true })} className="w-full p-2 rounded-md bg-background-light border border-gray-600" />
                    {errors.location?.latitude && <p className="text-red-500 text-xs mt-1">{errors.location.latitude.message}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-semibold mb-1 text-primary">Longitude</label>
                    <input type="number" step="any" {...register('location.longitude', { required: 'Longitude is required.', valueAsNumber: true })} className="w-full p-2 rounded-md bg-background-light border border-gray-600" />
                    {errors.location?.longitude && <p className="text-red-500 text-xs mt-1">{errors.location.longitude.message}</p>}
                </div>
            </fieldset>

            <div className="flex justify-between items-center pt-6">
                 <button type="button" onClick={() => router.back()} className="bg-gray-700 hover:bg-gray-600 text-textLight font-bold py-2 px-6 rounded-md shadow-sm">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-lightAccent text-textDark font-bold py-2 px-8 rounded-md shadow-lg disabled:bg-gray-500">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

export default function EditPlotPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    if (!userId) {
        return <div className="text-center p-8 text-red-500">Error: User ID is missing.</div>;
    }

    return (
        <div className="min-h-screen bg-background text-textLight p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Suspense fallback={<div className="text-center p-8 text-lg">Loading...</div>}>
                    <PlotEditForm userId={userId} />
                </Suspense>
            </div>
        </div>
    );
}
