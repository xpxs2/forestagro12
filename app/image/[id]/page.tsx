
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc, getDocs, query, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '../../../lib/FirebaseProvider';
import { useAuth } from '../../../lib/use-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ImageMetadata {
  id: string;
  name: string;
  uploader: string;
  timestamp: Date;
  status: string;
  assignee?: string;
}

interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

interface User {
  id: string;
  email: string;
}

const statuses = ['uploaded', 'in-review', 'approved', 'rejected'];

export default function ImageDetailsPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const { db, storage } = useFirebase();
  const router = useRouter();
  const [image, setImage] = useState<ImageMetadata | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && db && storage) {
      const fetchImage = async () => {
        const docRef = doc(db, 'images', params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const imageData = { id: docSnap.id, ...docSnap.data() } as ImageMetadata;
          setImage(imageData);
          setAssignee(imageData.assignee || '');
          setStatus(imageData.status);

          const imageRef = ref(storage, `images/${imageData.name}`);
          const url = await getDownloadURL(imageRef);
          setImageUrl(url);
        }
      };

      const fetchNotes = async () => {
        const q = query(collection(db, 'images', params.id, 'notes'));
        const querySnapshot = await getDocs(q);
        const notesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];
        setNotes(notesData);
      };

      const fetchUsers = async () => {
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);
      };

      fetchImage();
      fetchNotes();
      fetchUsers();
    }
  }, [params.id, user, db, storage]);

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newNote.trim() && db) {
      const docRef = await addDoc(collection(db, 'images', params.id, 'notes'), {
        text: newNote,
        timestamp: new Date(),
      });
      setNotes([...notes, { id: docRef.id, text: newNote, timestamp: new Date() }]);
      setNewNote('');
    }
  };

  const handleSaveChanges = async () => {
    if (!db) return;
    const docRef = doc(db, 'images', params.id);
    await updateDoc(docRef, { assignee, status });
    alert('Changes saved successfully!');
  };

  if (loading || !image) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // The redirect is handled in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full">
        <h1 className="text-2xl font-bold mb-6">{image.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {imageUrl && <Image src={imageUrl} alt={image.name} width={800} height={600} className="w-full rounded-lg" />}
          </div>
          <div>
            <p><span className="font-bold">Uploader:</span> {image.uploader}</p>

            <div className="mt-6">
              <label htmlFor="assignee" className="block text-gray-700 font-bold mb-2">Assign To</label>
              <select
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.email}>{user.email}</option>
                ))}
              </select>
            </div>

            <div className="mt-6">
              <label htmlFor="status" className="block text-gray-700 font-bold mb-2">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveChanges}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-6"
            >
              Save Changes
            </button>

            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Notes</h2>
              <div className="mb-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-200 p-2 rounded-lg mb-2">
                    <p>{note.text}</p>
                    <p className="text-sm text-gray-500">{new Date(note.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddNote}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="Add a note"
                ></textarea>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-2"
                >
                  Add Note
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
