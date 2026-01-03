'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { savePlot } from '@/lib/actions';
import type { Plot, Crop } from '@/app/api/types';
import { useFirebase } from '@/lib/FirebaseProvider';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type CropFormData = Omit<Crop, 'id'>;

function CropEditForm({ plotId, userId, cropId }: { plotId: string, userId: string, cropId?: string }) {
    const router = useRouter();
    const isNew = !cropId;
    const { auth } = useFirebase();

    const { data: plot, error: fetchError, mutate } = useSWR<Plot>(`/api/plots/${plotId}`, fetcher);
    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<CropFormData>();

    useEffect(() => {
        if (!isNew && plot) {
            const cropToEdit = plot.crops?.find(c => c.id === cropId);
            if (cropToEdit) {
                setValue('name', cropToEdit.name);
                setValue('variety', cropToEdit.variety);
                setValue('plantingDate', cropToEdit.plantingDate);
                setValue('expectedHarvestDate', cropToEdit.expectedHarvestDate);
            }
        }
    }, [plot, isNew, cropId, setValue]);

    const onSubmit = async (data: CropFormData) => {
        if (!plot) {
            alert("Error: Plot data is not loaded yet.");
            return;
        }

        if (!auth || !auth.currentUser) {
            alert("Authentication error: Please sign in.");
            return;
        }

        let updatedCrops: Crop[];
        const existingCrops = plot.crops || [];

        if (isNew) {
            const newCrop: Crop = { ...data, id: `crop_${Date.now()}` };
            updatedCrops = [...existingCrops, newCrop];
        } else {
            updatedCrops = existingCrops.map(c => c.id === cropId ? { ...c, ...data } : c);
        }

        const plotToSave: Plot = { ...plot, crops: updatedCrops };

        try {
            const token = await auth.currentUser.getIdToken();
            await savePlot(plotToSave, token);
            alert(`Crop "${data.name}" saved successfully!`);
            mutate();
            router.push(`/farmers/plots/${plotId}?userId=${userId}`);
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            console.error("Failed to save crop:", error);
            alert(`Failed to save crop: ${errorMessage}`);
        }
    };

    if (fetchError) return <div className="text-center p-8 text-red-500">Failed to load plot data.</div>;
    if (!plot) return <div className="text-center p-8">Loading...</div>;

    const pageTitle = isNew ? `Add New Crop to ${plot.name}` : `Edit ${plot.crops?.find(c => c.id === cropId)?.name || 'Crop'}`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-secondary p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-6">{pageTitle}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold mb-1 text-primary">Crop Name</label>
                    <input {...register('name', { required: 'Crop name is required' })} className="w-full p-2 rounded-md bg-background-light border border-gray-600" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1 text-primary">Variety</label>
                    <input {...register('variety')} className="w-full p-2 rounded-md bg-background-light border border-gray-600" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold mb-1 text-primary">Planting Date</label>
                    <input type="date" {...register('plantingDate', { required: 'Planting date is required' })} className="w-full p-2 rounded-md bg-background-light border border-gray-600" />
                    {errors.plantingDate && <p className="text-red-500 text-xs mt-1">{errors.plantingDate.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1 text-primary">Expected Harvest Date</label>
                    <input type="date" {...register('expectedHarvestDate')} className="w-full p-2 rounded-md bg-background-light border border-gray-600" />
                </div>
            </div>

            <div className="flex justify-between items-center pt-6">
                 <button type="button" onClick={() => router.back()} className="bg-gray-700 hover:bg-gray-600 text-textLight font-bold py-2 px-6 rounded-md shadow-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-lightAccent text-textDark font-bold py-2 px-8 rounded-md shadow-lg disabled:bg-gray-500">
                    {isSubmitting ? 'Saving...' : (isNew ? 'Add Crop' : 'Update Crop')}
                </button>
            </div>
        </form>
    );
}

export default function CropPageWrapper() {
    const params = useParams();
    const searchParams = useSearchParams();
    
    const plotId = params.plotId as string;
    const userId = searchParams.get('userId');
    const cropId = searchParams.get('cropId') || undefined;

    if (!userId || !plotId) {
        return <div className="text-center p-8 text-red-500">Error: Missing required parameters.</div>;
    }

    return (
        <div className="min-h-screen bg-background text-textLight p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                    <CropEditForm plotId={plotId} userId={userId} cropId={cropId} />
                </Suspense>
            </div>
        </div>
    );
}
