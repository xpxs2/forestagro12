'use client';

import { useState } from 'react';
import DetailPageLayout from '@/app/components/DetailPageLayout';
import { landUseTypes } from '@/app/data/land-use';

const landUseItems = Object.entries(landUseTypes).map(([id, data]) => ({
    id,
    ...data,
}));

export default function LandUsePage() {
    const [selectedType, setSelectedType] = useState(landUseItems[0]);

    return (
        <DetailPageLayout title="Land Use Management">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-secondary p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Categories</h2>
                        <ul className="space-y-2">
                            {landUseItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setSelectedType(item)}
                                        className={`w-full text-left p-2 rounded-md ${
                                            selectedType.id === item.id
                                                ? 'bg-accent text-textDark'
                                                : 'hover:bg-background-light'
                                        }`}
                                    >
                                        {item.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-secondary p-6 rounded-lg shadow">
                        <h3 className="text-2xl font-bold mb-4">{selectedType.title}</h3>
                        <p className="text-gray-300 mb-6">{selectedType.description}</p>
                        <div>
                            <h4 className="font-semibold text-lg mb-2">Guidelines:</h4>
                            <ul className="list-disc list-inside space-y-2 text-gray-400">
                                {selectedType.guidelines.map((guideline, index) => (
                                    <li key={index}>{guideline}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DetailPageLayout>
    );
}
