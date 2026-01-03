
'use client';

import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthTabs from '@/app/components/AuthTabs';

export default function LandingPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/farmers/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="text-center p-10 bg-white-smoke min-h-screen text-hunter-green">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Welcome to ForestAgro</h1>
        <p className="mt-4 text-lg text-gray-600">Your digital partner in sustainable agroforestry.</p>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <AuthTabs />
      </div>
    </div>
  );
}
