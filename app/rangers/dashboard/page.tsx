
'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import type { User, Plot } from '@/app/api/types';
import { countries } from '@/app/data/countries';
import { getSampleLandUse } from '@/app/lib/sample-data';
import withAuth from '@/app/components/withAuth'; // CORRECTED: Using alias
import { useAuth } from '@/lib/use-auth'; // CORRECTED: Using alias
import { useRouter } from 'next/navigation';

// --- Reusable Components (for consistency) ---

const ItemCard = ({ title, details }: { title: string, details: { [key: string]: string | number } }) => (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600">
        <h4 className="text-lg font-bold text-green-300">{title}</h4>
        <div className="grid grid-cols-2 gap-x-4 mt-2 text-sm">
            {Object.entries(details).map(([key, value]) => (
                <div key={key}>
                    <p className="font-medium text-gray-400 capitalize">{key}</p>
                    <p className="font-semibold text-gray-200">{value}</p>
                </div>
            ))}
        </div>
    </div>
);

// --- Main Dashboard Components ---

function RangerDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [allPlots, setAllPlots] = useState<Plot[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/dashboard-data');
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          const data = await response.json();
          setAllPlots(data.plots);
          setAllUsers(data.users);
        } catch (e) {
          setError(`Could not load data: ${e instanceof Error ? e.message : String(e)}`);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);

  if (loading) return <div className="text-center p-10 bg-background text-textLight min-h-screen">Loading Ranger Dashboard...</div>;
  if (error) return <div className="text-center p-10 text-red-500 bg-background min-h-screen">Error: {error}</div>;
  if (!user) return <div className="text-center p-10 bg-background text-textLight min-h-screen">Redirecting to login...</div>;

  const ranger = allUsers.find(u => u.id === user.id && u.role === 'ranger');

  if (!ranger) {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center text-textLight">
            <h1 className="text-2xl font-bold text-red-500">Error: Ranger not found.</h1>
            <p className="mt-2">Could not find a ranger with the provided user ID.</p>
        </div>
    );
  }

  const plotsToShow = countryFilter
    ? allPlots.filter(plot => {
        const farmer = allUsers.find(u => u.id === plot.farmerId);
        return farmer?.address?.country === countryFilter;
      })
    : allPlots;

  const currentCountryName = countries.find(c => c.code === countryFilter)?.name || 'All';
  const sampleData = getSampleLandUse('philippines', 'palawan');

  return (
    <div className="flex flex-col min-h-screen bg-background text-textLight">
      <header className="bg-primary py-4 px-8 flex items-center justify-between shadow-md">
        <h1 className="text-2xl font-bold">Ranger Dashboard</h1>
        <div className="flex items-center gap-4"><span>{ranger.name}</span><Link href="/" className="bg-accent hover:bg-lightAccent text-textDark font-bold py-2 px-4 rounded-md shadow-sm">Log Out</Link></div>
      </header>
      
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: Plot List */}
            <div className="lg:col-span-2">
                <div className="flex justify-center items-center gap-6 mb-8">
                    <h2 className="text-3xl font-bold text-center">Registered Plots</h2>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold">Filter:</span>
                        <select 
                            className="bg-secondary border border-primary rounded-md py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-accent"
                            onChange={(e) => setCountryFilter(e.target.value || undefined)}
                            value={countryFilter || ''}
                        >
                            <option value="">All Countries</option>
                            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plotsToShow.map(plot => {
                        const farmer = allUsers.find(u => u.id === plot.farmerId);
                        return (
                        <div key={plot.id} className="bg-secondary shadow-lg rounded-xl p-6 flex flex-col">
                            <h3 className="text-xl font-bold text-primary mb-4">{plot.name}</h3>
                            <div className="space-y-2 text-sm flex-grow">
                                <p><strong>Farmer:</strong> {farmer ? farmer.name : 'N/A'} ({plot.farmerId})</p>
                                <p><strong>Location:</strong> {plot.linkages.village}, {farmer?.address?.country}</p>
                                <p><strong>Area:</strong> {plot.area} hectares</p>
                            </div>
                            <div className="mt-4">
                                <Link href={`/farmers/plot/${plot.id}?userId=${ranger.id}`} className="block text-center w-full bg-gray-700 hover:bg-gray-600 text-textLight font-bold py-2 px-3 rounded-md text-sm">
                                    View Full Details &rarr;
                                </Link>
                            </div>
                        </div>
                        );
                    })}
                </div>
                {plotsToShow.length === 0 && (
                    <div className="text-center col-span-full bg-secondary/50 rounded-lg p-12">
                        <p className="text-lg">No plots found for the selected country: <span className="font-bold">{currentCountryName}</span>.</p>
                    </div>
                )}
            </div>

            {/* Sidebar: Educational Content */}
            <aside className="lg:col-span-1 bg-secondary p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-center mb-4">Example Farmer Inventory</h3>
                <p className="text-sm text-gray-400 text-center mb-6">This is an example of the kind of data farmers will create for their plots. Use this as a reference.</p>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-xl font-semibold text-green-300 mb-3">Main Assets (Palawan, Philippines)</h4>
                        <div className="space-y-4">
                            {sampleData.assets.map(asset => (
                                <ItemCard key={asset.id} title={asset.name} details={{ Purpose: asset.purpose, Quantity: `${asset.quantity} ${asset.unit}` }} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-green-300 mb-3">Seasonal Crops</h4>
                        <div className="space-y-4">
                            {sampleData.crops.map(crop => (
                                <ItemCard key={crop.id} title={crop.name} details={{ Purpose: crop.purpose }} />
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="text-xl font-semibold text-green-300 mb-3">Livestock</h4>
                        <div className="space-y-4">
                            {sampleData.livestock.map(item => (
                                <ItemCard key={item.id} title={item.type} details={{ Purpose: item.purpose, Quantity: item.quantity }} />
                            ))}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
      </main>
    </div>
  );
}

function RangerDashboardPage() {
    return (
        <Suspense fallback={<div className="text-center p-8 text-lg bg-background text-textLight h-screen">Loading Ranger Dashboard...</div>}>
            <RangerDashboardContent />
        </Suspense>
    );
}

export default withAuth(RangerDashboardPage, ['ranger']);
