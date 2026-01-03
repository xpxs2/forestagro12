
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFirebase } from '@/lib/FirebaseProvider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/app/api/types';

interface UserContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { auth, db } = useFirebase();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure Firebase services are initialized before proceeding
    if (!auth || !db) {
      // If not initialized, keep loading and wait for them to become available.
      // The useFirebase hook will re-trigger this effect when they are ready.
      setLoading(true);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            const newUser: Partial<User> = {
                id: fbUser.uid,
                email: fbUser.email || '',
                role: 'farmer',
                name: fbUser.displayName || '',
            };
            await setDoc(docRef, newUser);
            setUser(newUser as User);
          }
        } catch (e) {
          setError('Failed to fetch or create user profile.');
          console.error(e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  return (
    <UserContext.Provider value={{ user, firebaseUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
