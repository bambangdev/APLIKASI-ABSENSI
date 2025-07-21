// ========================================================================
// FILE: src/App.jsx
// FUNGSI: File utama yang mengatur halaman mana yang harus ditampilkan.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    // Listener ini akan berjalan setiap kali status login pengguna berubah
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup listener saat komponen tidak lagi digunakan
    return () => unsubscribe();
  }, []);

  // Tampilkan pesan loading saat aplikasi sedang memeriksa status login
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Memuat aplikasi...</div>;
  }

  // Fungsi untuk berpindah antara halaman login dan register
  const navigateAuth = (page) => {
    setAuthPage(page);
  };

  return (
    <div>
      {user ? (
        // Jika pengguna sudah login, tampilkan Dasbor
        <DashboardPage />
      ) : (
        // Jika belum login, tampilkan halaman login atau register
        authPage === 'login' ? (
          <LoginPage onNavigate={navigateAuth} />
        ) : (
          <RegisterPage onNavigate={navigateAuth} />
        )
      )}
    </div>
  );
}