// ========================================================================
// FILE: src/pages/DashboardPage.jsx
// FUNGSI: Halaman yang muncul setelah pengguna berhasil login.
// ========================================================================

import React from 'react';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';

export default function DashboardPage() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error saat logout:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Selamat Datang di Dasbor!</h1>
      {user && <p className="mt-2">Anda login sebagai: {user.email}</p>}
      <button 
        onClick={handleLogout}
        className="px-4 py-2 mt-6 font-bold text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}


