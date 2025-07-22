import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // <-- STATE LOADING BARU

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email dan password harus diisi.');
      return;
    }
    setLoading(true); // <-- MULAI LOADING
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged di App.jsx akan menangani sisanya
    } catch (err) {
      setError('Email atau password salah.');
      console.error('Error saat login:', err.message);
    } finally {
      setLoading(false); // <-- SELESAI LOADING
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Login Akun</h1>
        
        {error && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="nama@email.com"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading} // <-- Tambahkan disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading} // <-- Tambahkan disabled
            />
          </div>
          <button 
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={loading} // <-- Tambahkan disabled
          >
            {loading ? 'Mencoba masuk...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Belum punya akun?{' '}
          <button onClick={() => onNavigate('register')} className="font-medium text-blue-600 hover:underline">
            Daftar di sini
          </button>
        </p>
      </div>
    </div>
  );
}