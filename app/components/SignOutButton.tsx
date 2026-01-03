'use client';

import { useFirebase } from '@/lib/FirebaseProvider';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();
  const { auth } = useFirebase();

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/'); // Redirect to the homepage after sign-out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
    >
      Sign Out
    </button>
  );
}
