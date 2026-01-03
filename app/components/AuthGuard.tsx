
'use client';

import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="text-center p-10 bg-white-smoke min-h-screen text-hunter-green">Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthGuard;
