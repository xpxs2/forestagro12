'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/use-auth';
import SignOutButton from './SignOutButton';

export default function NavBar() {
  const { user } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">ForestAgro</Link>
        <div>
          {user && (
            <>
              <Link href="/farmers/profile" className="mr-4">Farmer Profile</Link>
              <Link href="/rangers/profile" className="mr-4">Ranger Profile</Link>
              <Link href="/merchants/profile" className="mr-4">Merchant Profile</Link>
              <SignOutButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
