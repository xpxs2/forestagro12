'use client';

import { useState } from 'react';
import Link from 'next/link';
import DetailPageLayout from '@/app/components/DetailPageLayout';
import { mrvItems } from '@/app/data/mrv';

export default function MRVPage() {
    const [selectedItem, setSelectedItem] = useState(mrvItems[0]);

    return (
        <DetailPageLayout title="MRV Hub">
            <div className="flex justify-end mb-4">
                <Link
                    href={`/farmers/dashboard`}
                    className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
                >
                    Back to Dashboard
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-secondary p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">MRV Areas</h2>
                        <ul className="space-y-2">
                            {mrvItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setSelectedItem(item)}
                                        className={`w-full text-left p-2 rounded-md ${
                                            selectedItem.id === item.id
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
                        <h3 className="text-2xl font-bold mb-4">{selectedItem.title}</h3>
                        <p className="text-gray-300 mb-6">{selectedItem.description}</p>
                        <div>
                            <h4 className="font-semibold text-lg mb-2">Activities:</h4>
                            <ul className="list-disc list-inside space-y-2 text-gray-400">
                                {selectedItem.activities.map((activity, index) => (
                                    <li key={index}>{activity}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DetailPageLayout>
    );
}
