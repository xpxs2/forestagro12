'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '@/lib/use-auth';
import { useFirebase } from '@/lib/FirebaseProvider';

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && db) {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.id)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userNotifications = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Notification[];
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      });

      return () => unsubscribe();
    }
  }, [user, db]);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 00-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="px-4 py-2 text-sm text-gray-700">
                  {notification.message}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
