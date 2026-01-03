
'use client';

import { useUser } from '@/app/context/UserContext';
import { useEffect, useState, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/lib/FirebaseProvider';
import type { User } from '@/app/api/types';
import Image from 'next/image';
import SignOutButton from '@/app/components/SignOutButton';
import Notification from '@/app/components/Notification';

function ProfilePage() {
    const { user, loading: userLoading, error: userError } = useUser();
    const { db, storage } = useFirebase();
    const [merchant, setMerchant] = useState<Partial<User> | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (user) {
            setMerchant(user);
        }
    }, [user]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImageFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMerchant(prevMerchant => prevMerchant ? { ...prevMerchant, [name]: value } : null);
    };

    const handleSaveProfile = async () => {
        if (!user || !merchant || !db || !storage) return;
        setSaving(true);
        setNotification(null);

        try {
            const userDocRef = doc(db, 'users', user.id);
            let photoDownloadURL = merchant.photoUrl;

            if (profileImageFile) {
                const storageRef = ref(storage, `profile_photos/${user.id}/${profileImageFile.name}`);
                const uploadResult = await uploadBytes(storageRef, profileImageFile);
                photoDownloadURL = await getDownloadURL(uploadResult.ref);
            }
            
            const dataToUpdate = {
                ...merchant,
                photoUrl: photoDownloadURL || null,
            };

            await setDoc(userDocRef, dataToUpdate, { merge: true });

            setNotification({ message: 'Profile saved successfully!', type: 'success' });
            setProfileImageFile(null);

        } catch (err: any) {
            console.error("Save Profile Error:", err);
            setNotification({ message: `Failed to save profile. ${err.message}`, type: 'error' });
        } finally {
            setSaving(false);
        }
    };
    
    const imagePreviewUrl = profileImageFile 
        ? URL.createObjectURL(profileImageFile) 
        : merchant?.photoUrl || 'https://via.placeholder.com/150';

    if (userLoading) {
        return <div className="text-center mt-10">Loading Profile...</div>;
    }

    if (userError) {
        return <div className="text-center mt-10 text-red-500">{userError}</div>;
    }

    if (!user || !merchant) {
        return <div className="text-center mt-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Marketing Merchant Profile</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Merchant Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center">
                        <Image src={imagePreviewUrl} alt={merchant.name || 'Merchant'} width={150} height={150} className="rounded-full object-cover mb-4" />
                        <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        <label htmlFor="photo-upload" className="cursor-pointer bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600">
                            Change Photo
                        </label>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" value={merchant.name || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={merchant.email || ''} readOnly className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="text" name="phone" value={merchant.phone || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Business Name</label>
                            <input type="text" name="businessName" value={merchant.businessName || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end items-center space-x-4">
                 <SignOutButton />
                <button onClick={handleSaveProfile} disabled={saving} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </div>
    );
}

export default ProfilePage;
