
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/lib/FirebaseProvider';

const RequestSAAReviewButton = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const { db } = useFirebase();
    const plotId = params.plotId as string;
    const farmerId = searchParams.get('userId');

    const [status, setStatus] = useState('idle'); // idle -> submitting -> submitted -> error
    const [errorMessage, setErrorMessage] = useState('');

    const handleRequestReview = async () => {
        if (!farmerId || !plotId) {
            setErrorMessage('Missing Farmer or Plot ID. Cannot submit request.');
            setStatus('error');
            return;
        }

        if (!db) {
            setErrorMessage('Database connection not available.');
            setStatus('error');
            return;
        }

        setStatus('submitting');
        try {
            await addDoc(collection(db, 'saa_reports'), {
                farmerId,
                plotId,
                status: 'requested', // This status will trigger the backend Cloud Function
                requestedAt: serverTimestamp(),
            });
            setStatus('submitted');
            alert('Request for SAA review submitted successfully. You will be notified when the analysis is complete.');
        } catch (error) {
            console.error("Error submitting SAA request:", error);
            setErrorMessage('An unexpected error occurred. Please try again later.');
            setStatus('error');
        }
    };

    const getButtonText = () => {
        switch (status) {
            case 'submitting':
                return 'Submitting...';
            case 'submitted':
                return 'Request Submitted';
            case 'error':
                return 'Submission Failed';
            default:
                return 'Request SAA Review';
        }
    };

    return (
        <div className="relative group w-full h-full">
            <button
                onClick={handleRequestReview}
                disabled={status === 'submitting' || status === 'submitted'}
                className="bg-secondary text-primary font-bold p-6 rounded-xl shadow-lg hover:bg-primary/20 transition-all transform hover:scale-105 flex flex-col items-center justify-center text-center h-full w-full disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            >
                <CheckBadgeIcon className="h-12 w-12 mb-2" />
                <span className="text-xl">{getButtonText()}</span>
                <span className="text-sm font-normal text-primary/80 mt-1">
                    {status === 'submitted' ? 'We are processing your data.' : 'Get professional feedback on your practices.'}
                </span>
            </button>
            {status !== 'error' && (
                 <div 
                    className="absolute top-full right-0 mt-2 w-72 p-3 bg-textDark text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                    role="tooltip"
                >
                    <p className="font-bold">SAA: Smart Agro Analyst</p>
                    <p className="mt-1">Our digital advisor compares your logged practices to a database of proven techniques. It then provides a simple, actionable insight to help you increase the value of your farm.</p>
                </div>
            )}
            {status === 'error' && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
        </div>
    );
};

const Section = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-3xl font-bold text-textDark border-b-2 border-accent pb-2 mb-4">{title}</h2>
        <p className="text-textDark/70 mb-6">{description}</p>
        <div className="space-y-4">{children}</div>
    </div>
);

const PracticeCard = ({ title, details }: { title: string, details: string[] }) => (
    <div className="bg-lightAccent/50 p-4 rounded-lg border border-accent/20">
        <h3 className="text-xl font-bold text-accent">{title}</h3>
        <ul className="list-disc list-inside mt-2 space-y-1 text-textDark/80">
            {details.map((detail, index) => <li key={index}>{detail}</li>)}
        </ul>
    </div>
);

export default function PlotPracticesPage() {
    const params = useParams();
    const { plotId } = params;

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-start gap-8 mb-8">
                    {/* Left Box: Title */}
                    <div className="flex-grow">
                        <h1 className="text-5xl font-bold text-accent">Practices & Management</h1>
                        <p className="mt-2 text-lg text-textDark/70">For Plot ID: <span className="font-mono bg-black/10 px-2 py-1 rounded">{plotId}</span></p>
                        <p className="mt-1 text-textDark/60">Sustainable strategies for a changing climate and a lasting livelihood.</p>
                    </div>

                    {/* Right Box: Button */}
                     <div className="w-1/3 flex-shrink-0">
                        <Link
                            href={`/farmers/dashboard`}
                            className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
                        >
                            Back to Dashboard
                        </Link>
                        <RequestSAAReviewButton />
                    </div>
                </div>

                <div>
                    <Section 
                        title="A) Land Preparation & Soil Management"
                        description="The foundation of a resilient farm. These strategies build healthy soil, prevent erosion, and conserve water."
                    >
                        <PracticeCard title="Tillage & Land Shaping" details={["Implement contour plowing to follow the land's natural shape.", "Use terracing on steep slopes to create flat planting areas.", "Practice minimum or no-till farming to reduce soil disturbance."]} />
                        <PracticeCard title="Soil Health & Erosion Control" details={["Apply mulching to cover the soil, retain moisture, and suppress weeds.", "Plant cover crops like legumes to enrich soil with nitrogen.", "Leave crop residue on the field after harvest to protect the soil."]} />
                    </Section>

                    <Section 
                        title="B) Input Use & Resource Management"
                        description="Efficient and responsible use of inputs is key to long-term sustainability and profitability."
                    >
                        <PracticeCard title="Fertilizers & Amendments" details={["Prioritize organic amendments like compost and manure.", "Conduct soil tests to determine exact fertilizer needs (type, rate, timing).", "Use lime or gypsum to correct soil pH based on analysis."]} />
                        <PracticeCard title="Water & Mechanization" details={["Utilize drip irrigation to deliver water directly to plant roots.", "Schedule irrigation based on weather and crop needs, avoiding waste.", "Choose mechanization levels appropriate for the farm scale to save labor."]} />
                         <PracticeCard title="Pest & Weed Control" details={["Use Integrated Pest Management (IPM) to reduce chemical use.", "Identify the specific active ingredient and frequency needed for any required pesticides/herbicides."]} />
                    </Section>

                    <Section 
                        title="C) Tree & Crop Management"
                        description="Active management of your plants and trees ensures a healthy, productive, and diverse agroforestry system."
                    >
                        <PracticeCard title="Planting & Spacing" details={["Record planting dates to track growth and plan harvests.", "Use optimal spacing to ensure adequate sunlight and airflow for all plants.", "Practice intercropping by planting different crops together."]} />
                        <PracticeCard title="Long-Term Tree Care" details={["Develop a pruning regime to improve tree health and fruit production.", "Use thinning and coppicing to manage forest density and harvest wood.", "Manage shade levels to create ideal microclimates for understory crops."]} />
                        <PracticeCard title="Fire & Regeneration" details={["Establish and maintain firebreaks to protect your land.", "Use assisted natural regeneration to encourage native species growth.", "Replant and fill gaps to maintain a full and productive canopy."]} />
                    </Section>
                </div>
            </div>
        </div>
    );
}
