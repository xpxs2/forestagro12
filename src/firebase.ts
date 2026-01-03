
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAApeRQ-AduwuIz3B2By60tWnG6rA_pa8E",
  authDomain: "forestagro-12.firebaseapp.com",
  projectId: "forestagro-12",
  storageBucket: "forestagro-12.firebasestorage.app",
  messagingSenderId: "208577304518",
  appId: "1:208577304518:web:64cc9330d22009ac0f04c7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
