
// src/app/components/PlotDetailComponents.tsx
'use client';

import React from 'react';
import Image from 'next/image'; // CORRECT: Import next/image

// A reusable card component for sectioning details
export const DetailCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-600 pb-2">{title}</h3>
        {children}
    </div>
);

// A component to display a label-value pair in a styled box for key metrics
export const InfoPair = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="bg-green-50 p-4 rounded-lg text-center shadow-sm hover:bg-green-100 transition-colors">
        <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-green-900">{value || 'N/A'}</p>
    </div>
);

// An alternative display for non-metric or descriptive info
export const DetailPair = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="py-2">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
);

// This component now securely fetches the map image from our own API proxy.
export const MapDisplay = ({ plotId }: { plotId: string }) => {
    // The image URL now points to our secure, server-side API route.
    // The plotId is the only thing passed, no sensitive coordinates are exposed.
    const imageUrl = `/api/maps/${plotId}`;

    return (
        <div className="rounded-lg shadow-inner overflow-hidden border-4 border-white">
            <Image 
                src={imageUrl} 
                alt={`Satellite map view of plot ${plotId}`} 
                width={500} // CORRECT: Added required props
                height={300} // CORRECT: Added required props
                className="w-full h-auto" 
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.alt = 'Error loading map. There may be a server configuration issue.';
                }}
            />
        </div>
    );
};
