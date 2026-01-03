'use client';

import { useState } from 'react';
import { useFirebase } from '@/lib/FirebaseProvider';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { auth, db } = useFirebase();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!auth || !db) {
      setError("Firebase services are not available.");
      return;
    }

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create the user document in Firestore with the 'farmer' role
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: 'farmer',
        name: 'New Farmer', // Default name
        country: '' // Default country
      });

      // 3. Redirect to the farmer's dashboard
      router.push('/farmers/dashboard');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label htmlFor="email-signup" className="sr-only">Email</label>
        <input
          id="email-signup"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label htmlFor="password-signup" className="sr-only">Password</label>
        <input
          id="password-signup"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
        Sign Up
      </button>
    </form>
  );
}
