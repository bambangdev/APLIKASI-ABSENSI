import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- 1. IMPORT INI

const firebaseConfig = {
  // SALIN-TEMPEL KUNCI ANDA DI SINI
  apiKey: "AIzaSyBfsnnIWjLOh_xKAD96ZmNsEWpTA03Ft9Q",
  authDomain: "aplikasi-absensi-70d55.firebaseapp.com",
  projectId: "aplikasi-absensi-70d55",
  storageBucket: "aplikasi-absensi-70d55.firebasestorage.app",
  messagingSenderId: "98967998651",
  appId: "1:98967998651:web:d7f852db269c088238599e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- 2. EKSPOR INI