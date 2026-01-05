'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Plot } from '@/app/api/types';
import { DetailCard, InfoPair, DetailPair, MapDisplay } from '@/app/components/PlotDetailComponents';
import { samplePlot } from '@/app/data/sample-plot'; // Import sample data
import Note from '@/app/components/Note'; // Import Note component

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    return res.json();
});

export default function PlotProfilePage() {
    const params = useParams();
    const plotId = params.plotId as string;

    const { data: plotData, error, isLoading } = useSWR<Plot>(plotId ? `/api/plots/${plotId}` : null, fetcher);

    // Use fetched data if available and valid, otherwise fall back to samplePlot
    const plot = !error && plotData ? plotData : samplePlot;
    const isSample = error || !plotData;

    if (isLoading) {
        return <div className="text-center mt-10">Loading plot details...</div>;
    }

    return (
        <div className="relative min-h-screen bg-green-50 p-4 sm:p-8">
            {isSample && (
                <div className="mb-6">
                    <Note 
                        type="warning"
                        title="This is a Preview Plot"
                        message="The plot profile is currently being verified. The map and full details will be displayed here once the verification is complete."
                    />
                </div>
            )}
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-green-700 font-semibold">Plot Identity Profile</p>
                        <h1 className="text-4xl font-bold text-gray-800">{plot.nickname || plot.name}</h1>
                        <p className="text-gray-500">ID: {plot.id}</p>
                    </div>
                    <div className="flex space-x-4">
                        <Link 
                            href={`/farmers/plot/${plot.id}/edit?userId=${plot.farmerId}`} 
                            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
                        >
                            Edit Plot
                        </Link>
                        <Link
                            href={`/farmers/dashboard`}
                            className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <DetailCard title="Geospatial View">
                        <MapDisplay plotId={plot.id} />
                    </DetailCard>
                    <DetailCard title="Physical Characteristics">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InfoPair label="Area (ha)" value={plot.area} />
                            <InfoPair label="Elevation (m)" value={plot.elevation} />
                            <InfoPair label="Slope Class" value={plot.slopeClass} />
                            <InfoPair label="Soil Type" value={plot.soilType} />
                        </div>
                    </DetailCard>
                </div>
                <div className="space-y-8">
                    <DetailCard title="Landscape & Position">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <DetailPair label="Plot Type" value={plot.plotType} />
                            <DetailPair label="Landscape Position" value={plot.landscapePosition} />
                        </div>
                    </DetailCard>
                    <DetailCard title="Proximity Analysis">
                        <div className="space-y-3">
                            <DetailPair label="Roads" value={plot.proximity?.roads} />
                            <DetailPair label="Water Source" value={plot.proximity?.water} />
                            <DetailPair label="Protected Areas" value={plot.proximity?.protectedAreas} />
                        </div>
                    </DetailCard>
                    <DetailCard title="Administrative Links">
                        <div className="space-y-3">
                            <DetailPair label="Farmer ID" value={plot.farmerId} />
                            <DetailPair label="Village" value={plot.linkages?.village} />
                            <DetailPair label="Nearest Landmark" value={plot.linkages?.nearestLandmark} />
                            <DetailPair label="Watershed" value={plot.linkages?.watershed} />
                        </div>
                    </DetailCard>
                </div>
            </div>
        </div>
    );
}
