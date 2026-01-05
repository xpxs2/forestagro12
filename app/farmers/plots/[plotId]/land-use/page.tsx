
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

// --- MOCK DATA & TYPES ---
interface FarmAsset {
    id: string;
    name: string;
    purpose: string;
    quantity: number;
    unit: string;
}

interface SeasonalCrop {
    id: string;
    name: string;
    purpose: string;
}

interface Livestock {
    id: string;
    type: string;
    purpose: string;
    quantity: number;
}

// --- REUSABLE COMPONENTS ---

const SectionCard = ({ title, onAdd, children }: { title: string, onAdd: () => void, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
            <button 
                onClick={onAdd}
                className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
                <PlusCircleIcon className="h-6 w-6" />
                Add New
            </button>
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

const ItemCard = ({ title, details }: { title: string, details: { [key: string]: string | number } }) => (
    <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
        <h4 className="text-lg font-bold text-green-900">{title}</h4>
        <div className="grid grid-cols-2 gap-x-4 mt-2">
            {Object.entries(details).map(([key, value]) => (
                <div key={key}>
                    <p className="text-sm font-medium text-gray-500 capitalize">{key}</p>
                    <p className="font-semibold text-gray-800">{value}</p>
                </div>
            ))}
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---

export default function LandUsePage() {
    const params = useParams();
    const plotId = params.plotId as string;

    const [assets, setAssets] = useState<FarmAsset[]>([]);
    const [crops, setCrops] = useState<SeasonalCrop[]>([]);
    const [livestock, setLivestock] = useState<Livestock[]>([]);

    const handleAdd = (category: string) => {
        alert(`This will open a form to add a new item to "${category}".`);
    };

    const isDataEmpty = assets.length === 0 && crops.length === 0 && livestock.length === 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 relative">
            {/* **FIXED**: Floating Notice Box with correct transparency */}
            {isDataEmpty && (
                 <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-lg">
                    <div className="bg-white bg-opacity-70 p-8 rounded-lg shadow-2xl text-center border-4 border-red-500 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-red-800 mb-4">Your Land-Use Inventory is Empty</h2>
                        <p className="text-gray-800 font-medium mb-6">
                            This plot has no registered assets. Please add your farm data to build a complete inventory.
                        </p>
                        <p className="text-gray-700">
                            Click the &quot;Add New&quot; button in any section below to begin.
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <p className="text-lg text-green-700 font-semibold">Plot ID: {plotId}</p>
                <h1 className="text-4xl font-bold text-gray-800">Land Use &amp; Products</h1>
                <p className="mt-2 text-gray-600">A simple inventory of your farm&apos;s assets. This helps connect you to market opportunities.</p>
                 <div className="flex justify-end mb-4">
                    <Link
                        href={`/farmers/dashboard`}
                        className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
                    >
                        Back to Dashboard
                    </Link>
                 </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                <SectionCard title="Main Assets (Trees &amp; Long-Term Crops)" onAdd={() => handleAdd('Main Assets')}>
                    {assets.length > 0 ? assets.map(asset => (
                        <ItemCard key={asset.id} title={asset.name} details={{ 
                            Purpose: asset.purpose, 
                            Quantity: `${asset.quantity} ${asset.unit}` 
                        }} />
                    )) : <p className="text-gray-500 italic">No assets registered for this plot yet.</p>}
                </SectionCard>

                <SectionCard title="Seasonal Crops (For Food &amp; Quick Sale)" onAdd={() => handleAdd('Seasonal Crops')}>
                    {crops.length > 0 ? crops.map(crop => (
                        <ItemCard key={crop.id} title={crop.name} details={{ Purpose: crop.purpose }} />
                    )) : <p className="text-gray-500 italic">No seasonal crops registered for this plot yet.</p>}
                </SectionCard>

                <SectionCard title="Livestock" onAdd={() => handleAdd('Livestock')}>
                    {livestock.length > 0 ? livestock.map(item => (
                        <ItemCard key={item.id} title={item.type} details={{ 
                            Purpose: item.purpose, 
                            Quantity: item.quantity 
                        }} />
                    )) : <p className="text-gray-500 italic">No livestock registered for this plot yet.</p>}
                </SectionCard>
            </div>
        </div>
    );
}
