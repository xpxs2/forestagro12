
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    PlusIcon, WrenchScrewdriverIcon, TrophyIcon, SparklesIcon,
    BuildingStorefrontIcon, DocumentChartBarIcon, UserCircleIcon, NewspaperIcon, FireIcon,
    MapPinIcon, GlobeAltIcon, SunIcon, CloudIcon, BeakerIcon, ChevronRightIcon,
    BookOpenIcon, PencilSquareIcon, CpuChipIcon
} from '@heroicons/react/24/outline';
import { Plot } from '@/app/api/types';
import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useFirebase } from '@/lib/FirebaseProvider';

// --- DATA STRUCTURES ---
interface PlotDashboardData {
    id: string;
    nickname: string;
    isSample?: boolean;
    area: number;
    province: string;
    village: string;
    gpsCoordinates: string;
    uniquePlotId: string;
    slope: string;
    elevation: number;
    soilType: string;
    waterSource: string;
    primaryCrop: string;
    totalPracticesLogged: number;
    lastPracticeDate: string;
    composting: 'Active' | 'None';
    tillage: 'No-Till' | 'Conventional';
    irrigation: 'Drip' | 'Rain-fed' | 'N/A';
    lastFertilizer: string;
}

// --- DATA TRANSFORMATION ---
const transformPlotToDashboardData = (plot: Plot): PlotDashboardData => ({
    id: plot.id,
    nickname: plot.nickname || 'Unnamed Plot',
    isSample: plot.isSample,
    area: plot.area || 0,
    province: plot.linkages?.province || 'N/A',
    village: plot.linkages?.village || 'N/A',
    gpsCoordinates: plot.gpsCoordinates ? `${plot.gpsCoordinates.lat.toFixed(4)}, ${plot.gpsCoordinates.lon.toFixed(4)}` : 'N/A',
    uniquePlotId: plot.id,
    slope: plot.slopeClass || 'N/A',
    elevation: plot.elevation || 0,
    soilType: plot.soilType || 'N/A',
    waterSource: plot.proximity?.water || 'N/A',
    primaryCrop: plot.crops && plot.crops.length > 0 ? plot.crops[0].name : 'N/A',
    totalPracticesLogged: 0,
    lastPracticeDate: 'N/A',
    composting: 'None',
    tillage: 'No-Till',
    irrigation: 'N/A',
    lastFertilizer: 'N/A',
});

// --- UI COMPONENTS ---

const PlaceholderPanel = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
    <div className="bg-dark-khaki/30 border-2 border-dashed border-olive-drab/50 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <Icon className="mx-auto h-12 w-12 text-olive-drab/80" />
        <h3 className="mt-4 text-xl font-bold text-hunter-green">{title}</h3>
        <p className="mt-1 text-saddle-brown">Content coming soon</p>
    </div>
);

const InfoItem = ({ icon: Icon, label, value, unit = '' }: { icon: React.ElementType, label: string, value: string | number, unit?: string }) => {
    const isPlaceholder = value === 'N/A' || !value;
    const displayValue = isPlaceholder ? 'N/A' : `${value}${unit}`;

    return (
        <div className="flex items-start gap-2">
            <Icon className={`h-5 w-5 mt-0 shrink-0 ${isPlaceholder ? 'text-current/50' : 'text-current'}`} />
            <div className="flex flex-col">
                <p className="font-semibold text-sm leading-tight">{label}</p>
                <p className={`text-sm leading-tight ${isPlaceholder ? 'text-current/60 italic' : ''}`}>{displayValue}</p>
            </div>
        </div>
    );
};

const SectionBox = ({ href, title, notes, children, bgColor, titleColor, textColor }: { href: string, title: string, notes: string[], children: React.ReactNode, bgColor: string, titleColor: string, textColor: string }) => (
    <Link href={href} className={`block ${bgColor} ${textColor} border border-black/5 rounded-xl shadow-sm hover:shadow-md hover:border-black/10 transition-all p-3 group`}>
        <div className="flex justify-between items-center">
            <h4 className={`text-lg font-bold ${titleColor}`}>{title}</h4>
            <ChevronRightIcon className="h-6 w-6 text-black/30 group-hover:text-current transition-colors" />
        </div>
        <ul className="mt-1.5 mb-2 space-y-1 list-disc list-inside text-xs text-saddle-brown pl-1">
            {notes.map((note, index) => <li key={index}>{note}</li>)}
        </ul>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 border-t border-black/5 pt-2.5">
            {children}
        </div>
    </Link>
);

const PlotDashboard = ({ plot, isSample, userId }: { plot: PlotDashboardData; isSample?: boolean; userId: string; }) => {
    const basePath = isSample ? '/farmers/plots/plot-sample-01' : `/farmers/plots/${plot.id}`;
    const queryString = `?userId=${userId}`;
    const needsAttention = isSample || plot.nickname === 'Unnamed Plot';

    return (
        <div className={`bg-white border rounded-2xl shadow-md p-4 flex flex-col gap-4 h-full ${needsAttention ? 'border-4 border-forest-green' : 'border-black/10'}`}>
            <div className="text-center border-b border-black/10 pb-3">
                <h3 className="text-2xl font-bold text-hunter-green">{plot.nickname}</h3>
            </div>

            <div className="flex flex-col gap-4">
                <SectionBox
                    href={`${basePath}${queryString}`}
                    title="Plot Details"
                    bgColor="bg-fern-green/10"
                    titleColor="text-hunter-green"
                    textColor="text-hunter-green/90"
                    notes={[
                        "The foundational registration of your plot.",
                        "This is the basis for all activities.",
                        "All data is securely stored and verifiable.",
                    ]}
                >
                    <InfoItem icon={MapPinIcon} label="Village" value={plot.village} />
                    <InfoItem icon={GlobeAltIcon} label="Province" value={plot.province} />
                    <InfoItem icon={SunIcon} label="Area" value={plot.area} unit=" ha" />
                    <InfoItem icon={CpuChipIcon} label="Plot ID" value={plot.uniquePlotId.substring(0, 8)} />
                </SectionBox>

                <SectionBox
                    href={`${basePath}/land-use${queryString}`}
                    title="Land Use Profile"
                    bgColor="bg-earth-yellow/20"
                    titleColor="text-saddle-brown"
                    textColor="text-saddle-brown/90"
                    notes={[
                        "Describes your farm's ecological foundation.",
                        "Helps tailor recommendations for your plot.",
                        "This data is essential for sustainability.",
                    ]}
                >
                    <InfoItem icon={MapPinIcon} label="Slope" value={plot.slope} />
                    <InfoItem icon={SparklesIcon} label="Elevation" value={plot.elevation} unit=" m" />
                    <InfoItem icon={BeakerIcon} label="Soil Type" value={plot.soilType} />
                    <InfoItem icon={CloudIcon} label="Water Source" value={plot.waterSource} />
                </SectionBox>

                <SectionBox
                    href={`${basePath}/practices${queryString}`}
                    title="Practices & Manage"
                    bgColor="bg-sky-blue/20"
                    titleColor="text-hunter-green"
                    textColor="text-hunter-green/90"
                    notes={[
                        "Log inputs like fertilizer & compost for certification.",
                        "Conduct soil tests to determine exact nutrient needs.",
                        "Use techniques like no-till to reduce soil disturbance.",
                        "Implement a pruning regime for better crop health.",
                        "Manage shade levels for an ideal microclimate.",
                    ]}
                >
                    <InfoItem icon={PlusIcon} label="Total Logs" value={plot.totalPracticesLogged} />
                    <InfoItem icon={PencilSquareIcon} label="Last Log" value={plot.lastPracticeDate} />
                    <InfoItem icon={FireIcon} label="Composting" value={plot.composting} />
                    <InfoItem icon={WrenchScrewdriverIcon} label="Tillage" value={plot.tillage} />
                    <InfoItem icon={SparklesIcon} label="Irrigation" value={plot.irrigation} />
                    <InfoItem icon={BeakerIcon} label="Last Fertilizer" value={plot.lastFertilizer} />
                </SectionBox>
            </div>
        </div>
    );
};

const AddNewPlotPanel = ({ userId }: { userId?: string }) => {
    const router = useRouter();
    const handleClick = () => userId ? router.push(`/farmers/plot/new-plot/edit?userId=${userId}`) : alert("User ID not loaded.");
    return (
        <div onClick={handleClick} className="cursor-pointer bg-fern-green/20 border-4 border-dashed border-forest-green rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center hover:bg-forest-green/30 hover:border-forest-green transition-colors group">
            <PlusIcon className="mx-auto h-12 w-12 text-forest-green/80 group-hover:text-forest-green" />
            <h3 className="mt-4 text-xl font-bold text-forest-green group-hover:text-forest-green/90">Add a New Plot</h3>
            <p className="mt-1 text-forest-green/90 group-hover:text-forest-green">Expand your farmer&apos;s digital portfolio.</p>
        </div>
    );
};


// --- Main Dashboard Page ---
function FarmerDashboard() {
    const { user, error: userError } = useUser();
    const { auth } = useFirebase();
    const router = useRouter();
    const [plots, setPlots] = useState<PlotDashboardData[]>([]);
    const [plotsLoading, setPlotsLoading] = useState(true);
    const [plotsError, setPlotsError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const fetchPlots = async () => {
                setPlotsLoading(true);
                try {
                    const response = await fetch(`/api/users/${user.id}/plots`);
                    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
                    const userPlots: Plot[] = await response.json();

                    if (userPlots.length === 0) {
                        const samplePlot: PlotDashboardData = {
                            id: "plot-sample-01", nickname: "Unnamed Plot", isSample: true,
                            area: 5.2, province: "Sample Province", village: "Sample Village", gpsCoordinates: "14.123, 121.567", uniquePlotId: "plot-sample-01",
                            slope: "Gentle (3-8%)", elevation: 1450, soilType: "Clay Loam", waterSource: "Rain-fed", primaryCrop: "Coffee",
                            totalPracticesLogged: 3, lastPracticeDate: "2024-05-10", composting: 'Active', tillage: 'No-Till', irrigation: 'Drip', lastFertilizer: "2024-04-20"
                        };
                        setPlots([samplePlot]);
                    } else {
                        setPlots(userPlots.map(transformPlotToDashboardData));
                    }
                } catch (e) {
                    setPlotsError(`Could not load farm data: ${e instanceof Error ? e.message : String(e)}`);
                } finally {
                    setPlotsLoading(false);
                }
            };
            fetchPlots();
        }
    }, [user]);

    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (plotsLoading) {
        return <div className="text-center p-10 bg-white-smoke min-h-screen text-hunter-green">Loading Your Farm Dashboard...</div>;
    }

    if (userError || plotsError) {
        return <div className="text-center p-10 text-red-600 bg-white-smoke min-h-screen">Error: {userError || plotsError}</div>;
    }
    
    if (!user) return null;

    const plotPanels = Array(2).fill(null).map((_, index) => {
        if (plots[index]) {
            const plot = plots[index];
            return <PlotDashboard key={plot.id} plot={plot} isSample={plot.isSample} userId={user.id} />;
        }
        return <AddNewPlotPanel key={`add-plot-${index}`} userId={user.id} />;
    });

    const HeaderInfo = ({ label, value }: { label: string; value?: string }) => (
        <div className="text-sm text-saddle-brown">
            <span className="font-semibold">{label}:</span>
            {value ? <span className="ml-1">{value}</span> : <span className="ml-1 italic text-gray-400">N/A</span>}
        </div>
    );

    return (
        <div className="min-h-screen bg-white-smoke p-4 sm:p-6">
            <header className="flex flex-wrap justify-between items-start gap-6 mb-8 border-b border-black/10 pb-6">
                <div className="flex items-start gap-4">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} alt="Farmer" className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
                    ) : (
                        <UserCircleIcon className="w-24 h-24 text-gray-300" />
                    )}
                    <div>
                        <h1 className="text-4xl font-bold text-hunter-green">Your Farm Dashboard</h1>
                        <div className="mt-2 space-y-1">
                            <HeaderInfo label="Farmer Name" value={user.name} />
                            <HeaderInfo label="Farmer ID" value={user.id} />
                            <HeaderInfo label="Email" value={user.email} />
                            <HeaderInfo label="Phone" value={user.phone} />
                            <HeaderInfo label="Province" value={user.address?.province} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <Link href="/farmers/profile" className="bg-white border border-olive-drab text-hunter-green px-4 py-2 rounded-lg hover:bg-fern-green/10 font-semibold flex items-center gap-2 transition-colors text-sm"><PencilSquareIcon className="h-5 w-5"/> Edit Profile</Link>
                    <button onClick={handleSignOut} className="bg-burnt-sienna text-white px-4 py-2 rounded-lg hover:bg-burnt-sienna/90 font-semibold transition-colors text-sm">Sign Out</button>
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {plotPanels.map((panel, index) => <div key={index} className="lg:col-span-1">{panel}</div>)}

                {/* Placeholder columns */}
                <div className="lg:col-span-1"><PlaceholderPanel title="Market & Merchants" icon={BuildingStorefrontIcon} /></div>
                <div className="lg:col-span-1"><PlaceholderPanel title="MRV" icon={DocumentChartBarIcon} /></div>
                <div className="lg:col-span-2"><PlaceholderPanel title="Latest Activity Log" icon={SparklesIcon} /></div>
                <div className="lg:col-span-3"><PlaceholderPanel title="General Province News" icon={NewspaperIcon} /></div>
            </main>
        </div>
    );
}

export default FarmerDashboard;
