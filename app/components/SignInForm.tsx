'use client';

import { useState } from 'react';
import { useFirebase } from '@/lib/FirebaseProvider';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { auth, db } = useFirebase();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!auth || !db) {
      setError("Firebase services are not available.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user's document from Firestore to get their role
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role;

        // Redirect based on the role from Firestore
        switch (role) {
          case 'farmer':
            router.push('/farmers/dashboard');
            break;
          case 'ranger':
            router.push('/rangers/dashboard');
            break;
          case 'merchant':
            router.push('/merchants/dashboard');
            break;
          default:
            router.push('/'); // Fallback to home page
            break;
        }
      } else {
        // This case might happen if a user is in Auth but not in Firestore
        setError("User profile not found. Please contact support.");
        router.push('/');
      }
    } catch (err: any) {
      // Handle authentication errors (e.g., wrong password)
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label htmlFor="email-signin" className="sr-only">Email</label>
        <input
          id="email-signin"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label htmlFor="password-signin" className="sr-only">Password</label>
        <input
          id="password-signin"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
        Sign In
      </button>
    </form>
  );
}
