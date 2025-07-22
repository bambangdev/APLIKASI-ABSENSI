// ========================================================================
// FILE BARU: src/pages/ProfilePage.jsx
// FUNGSI: Halaman baru untuk semua pengguna (Staff & Admin)
// mengubah nama dan password mereka.
// ========================================================================

import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function ProfilePage({ user, userData }) {
  const [name, setName] = useState(userData.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (name !== userData.name) {
      try {
        // Update di Firebase Authentication
        await updateProfile(auth.currentUser, { displayName: name });
        // Update di Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { name: name });
        setSuccessMessage('Nama berhasil diperbarui!');
      } catch (error) {
        setErrorMessage('Gagal memperbarui nama.');
        console.error(error);
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Password baru tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password baru minimal harus 6 karakter.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      // Re-autentikasi pengguna sebelum mengubah password
      await reauthenticateWithCredential(user, credential);
      // Jika berhasil, ubah password
      await updatePassword(user, newPassword);
      setSuccessMessage('Password berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage('Gagal mengubah password. Pastikan password lama Anda benar.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      {successMessage && <div className="p-4 text-green-800 bg-green-100 rounded-md">{successMessage}</div>}
      {errorMessage && <div className="p-4 text-red-800 bg-red-100 rounded-md">{errorMessage}</div>}
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">Ubah Data Diri</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nama Lengkap</label>
            <input type="text" className="w-full p-2 border rounded-md bg-slate-50" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input type="email" className="w-full p-2 border rounded-md bg-slate-200" value={user.email} disabled />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan Perubahan</button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">Ubah Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password Lama</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full p-2 border rounded-md bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password Baru</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded-md bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Konfirmasi Password Baru</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded-md bg-slate-50" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Ubah Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}
