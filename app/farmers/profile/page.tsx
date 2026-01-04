'use client';

import { useUser } from '@/app/context/UserContext';
import { useEffect, useState, ChangeEvent } from 'react';
import { doc, setDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/lib/FirebaseProvider';
import type { User } from '@/app/api/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SignOutButton from '@/app/components/SignOutButton';
import Notification from '@/app/components/Notification';

export default function ProfilePage() {
    const { user, loading: userLoading, error: userError } = useUser();
    const { db, storage } = useFirebase();
    const router = useRouter();
    const [farmer, setFarmer] = useState<Partial<User> | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (user) {
            setFarmer(user);
        }
    }, [user]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImageFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFarmer(prevFarmer => {
            if (!prevFarmer) return null;

            const newFarmer = { ...prevFarmer };

            if (name.startsWith('address.')) {
                const field = name.split('.')[1] as keyof User['address'];
                
                const newAddress: User['address'] = {
                    ...(prevFarmer.address || { village: '', commune: '', district: '', province: '', country: '' }),
                    [field]: value
                };
                
                newFarmer.address = newAddress;

            } else if (name === 'memberships' || name === 'mainIncomeSources') {
                (newFarmer as any)[name] = value.split(',').map(s => s.trim());
            } else {
                (newFarmer as any)[name] = value;
            }
            return newFarmer;
        });
    };

    const handleSaveProfile = async () => {
        if (!user || !farmer || !db || !storage) return;
        setSaving(true);
        setNotification(null);

        try {
            const userDocRef = doc(db, 'users', user.id);
            let photoDownloadURL = farmer.photoUrl;

            if (profileImageFile) {
                const storageRef = ref(storage, `profile_photos/${user.id}/${profileImageFile.name}`);
                const uploadResult = await uploadBytes(storageRef, profileImageFile);
                photoDownloadURL = await getDownloadURL(uploadResult.ref);
            }
            
            const dataToUpdate = {
                ...farmer,
                photoUrl: photoDownloadURL || null,
                profileUpdateCount: increment(1),
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
        : farmer?.photoUrl || 'https://via.placeholder.com/150';

    if (userLoading) {
        return <div className="text-center mt-10">Loading Profile...</div>;
    }

    if (!user) {
        return <div className="text-center mt-10">Please log in to view your profile.</div>;
    }
    
    if (userError || !farmer) {
        return <div className="text-center mt-10 text-red-500">{userError || 'Could not load farmer profile.'}</div>;
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Farmer Profile & Household</h1>
            <p className="text-gray-600 mb-8">Please fill out your profile. Providing accurate information helps us connect you with the right resources. You can update this up to 20 times.</p>
            
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Farmer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center text-center">
                         <Image src={imagePreviewUrl} alt={farmer.name || 'Farmer'} width={160} height={160} className="w-40 h-40 rounded-full object-cover mb-4 shadow-lg" />
                        <label htmlFor="photo-upload" className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md text-sm">
                            Select Photo
                        </label>
                        <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        <p className="text-lg font-bold mt-4">{farmer.name}</p>
                        <p className="text-sm text-gray-500">{farmer.farmerId || 'FARM-ID-PENDING'}</p>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" value={farmer.name || ''} onChange={handleInputChange} placeholder="e.g., Juan dela Cruz" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile/WhatsApp</label>
                            <input type="text" name="phone" value={farmer.phone || ''} onChange={handleInputChange} placeholder="e.g., +639171234567" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">National ID (Last 4 Digits)</label>
                            <input type="text" name="nationalId" value={farmer.nationalId || ''} onChange={handleInputChange} placeholder="e.g., 1234" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Village / Barangay</label>
                            <input type="text" name="address.village" value={farmer.address?.village || ''} onChange={handleInputChange} placeholder="e.g., Barangay San Jose" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Commune / Municipality</label>
                             <input type="text" name="address.commune" value={farmer.address?.commune || ''} onChange={handleInputChange} placeholder="e.g., Antipolo City" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Province</label>
                            <input type="text" name="address.province" value={farmer.address?.province || ''} onChange={handleInputChange} placeholder="e.g., Rizal" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Household Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Household Size</label>
                        <input type="number" name="householdSize" value={farmer.householdSize || ''} onChange={handleInputChange} placeholder="e.g., 5" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Dependency Ratio</label>
                        <input type="number" step="0.1" name="dependencyRatio" value={farmer.dependencyRatio || ''} onChange={handleInputChange} placeholder="e.g., 0.6" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        <p className="mt-1 text-xs text-gray-500">Number of non-working members divided by working members.</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                         <label className="block text-sm font-medium text-gray-700">Group Memberships</label>
                        <input type="text" name="memberships" value={Array.isArray(farmer.memberships) ? farmer.memberships.join(', ') : ''} onChange={handleInputChange} placeholder="e.g., Rizal Organic Farmers" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                         <p className="mt-1 text-xs text-gray-500">Separate with commas.</p>
                    </div>
                     <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Main Income Sources</label>
                        <input type="text" name="mainIncomeSources" value={Array.isArray(farmer.mainIncomeSources) ? farmer.mainIncomeSources.join(', ') : ''} onChange={handleInputChange} placeholder="e.g., Agriculture, Tourism" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        <p className="mt-1 text-xs text-gray-500">Separate with commas.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Community Role</label>
                        <input type="text" name="communityRole" value={farmer.communityRole || ''} onChange={handleInputChange} placeholder="e.g., Forest Committee Member" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end items-center space-x-4">
                <SignOutButton />
                <button onClick={handleSaveProfile} disabled={saving} className="bg-green-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 disabled:bg-gray-400 transition-colors">
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
                <button onClick={() => router.push('/farmers/dashboard')} className="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">
                    Go to Dashboard
                 </button>
            </div>
        </div>
    );
}
