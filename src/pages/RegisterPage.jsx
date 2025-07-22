import React, { useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [team, setTeam] = useState('Host');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // <-- STATE LOADING BARU

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
        setError('Semua kolom harus diisi.');
        return;
    }
    setLoading(true); // <-- MULAI LOADING
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: "Staff",
        team: team,
        company: 'infinithree',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      setError('Gagal mendaftar. Pastikan email valid dan password lebih dari 6 karakter.');
      console.error('Error saat mendaftar:', err.message);
    } finally {
      setLoading(false); // <-- SELESAI LOADING
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Buat Akun Staff Baru</h1>
        {error && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Nama Anda"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading} // <-- Tambahkan disabled
            />
          </div>
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
              placeholder="Minimal 6 karakter"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading} // <-- Tambahkan disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Tim</label>
            <select 
              value={team} 
              onChange={(e) => setTeam(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading} // <-- Tambahkan disabled
            >
              <option value="Host">Host</option>
              <option value="Treatment">Treatment</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={loading} // <-- Tambahkan disabled
          >
            {loading ? 'Mendaftarkan akun...' : 'Daftar'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <button onClick={() => onNavigate('login')} className="font-medium text-blue-600 hover:underline">
            Login di sini
          </button>
        </p>
      </div>
    </div>
  );
}