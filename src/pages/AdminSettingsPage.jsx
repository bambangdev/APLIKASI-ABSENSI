// ========================================================================
// FILE LAMA (UPDATE BESAR): src/pages/AdminSettingsPage.jsx
// FUNGSI: Menambahkan bagian untuk mengelola Perusahaan dan Role.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function AdminSettingsPage() {
  // State untuk Shift
  const [morningShift, setMorningShift] = useState({ start: '08:00', end: '16:00' });
  const [afternoonShift, setAfternoonShift] = useState({ start: '16:00', end: '20:00' });

  // State untuk Perusahaan & Role
  const [companyName, setCompanyName] = useState('infinithree');
  const [roles, setRoles] = useState(['Host', 'Treatment', 'Admin']);
  const [newRole, setNewRole] = useState('');

  // State umum
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Ambil semua data pengaturan dari Firestore saat halaman dimuat
  useEffect(() => {
    const fetchSettings = async () => {
      const shiftSettingsRef = doc(db, "settings", "shifts");
      const companySettingsRef = doc(db, "settings", "company");
      
      try {
        // Ambil data shift
        const shiftSnap = await getDoc(shiftSettingsRef);
        if (shiftSnap.exists()) {
          const data = shiftSnap.data();
          setMorningShift(data.morning);
          setAfternoonShift(data.afternoon);
        }
        
        // Ambil data perusahaan
        const companySnap = await getDoc(companySettingsRef);
        if (companySnap.exists()) {
          const data = companySnap.data();
          setCompanyName(data.name);
          setRoles(data.roles);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveShifts = async () => {
    const settingsDocRef = doc(db, "settings", "shifts");
    try {
      await setDoc(settingsDocRef, {
        morning: morningShift,
        afternoon: afternoonShift,
      });
      setSuccessMessage('Pengaturan shift berhasil disimpan!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error saving shift settings:", error);
    }
  };

  const handleSaveCompany = async () => {
    const settingsDocRef = doc(db, "settings", "company");
    try {
      await updateDoc(settingsDocRef, { name: companyName });
      setSuccessMessage('Pengaturan perusahaan berhasil disimpan!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error saving company settings:", error);
    }
  };

  const handleAddRole = async () => {
    if (newRole.trim() === '' || roles.includes(newRole.trim())) return;
    const settingsDocRef = doc(db, "settings", "company");
    try {
      await updateDoc(settingsDocRef, {
        roles: arrayUnion(newRole.trim())
      });
      setRoles([...roles, newRole.trim()]);
      setNewRole('');
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  const handleRemoveRole = async (roleToRemove) => {
    const settingsDocRef = doc(db, "settings", "company");
    try {
      await updateDoc(settingsDocRef, {
        roles: arrayRemove(roleToRemove)
      });
      setRoles(roles.filter(role => role !== roleToRemove));
    } catch (error) {
      console.error("Error removing role:", error);
    }
  };
  
  if (loading) {
    return <div>Memuat pengaturan...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Pengaturan</h2>
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Pengaturan Shift */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Pengaturan Waktu Shift</h3>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-600">Shift Pagi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jam Masuk</label>
                <input type="time" className="w-full p-2 border rounded-md bg-gray-50" value={morningShift.start} onChange={(e) => setMorningShift({...morningShift, start: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jam Pulang</label>
                <input type="time" className="w-full p-2 border rounded-md bg-gray-50" value={morningShift.end} onChange={(e) => setMorningShift({...morningShift, end: e.target.value})} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2 text-gray-600">Shift Siang</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jam Masuk</label>
                <input type="time" className="w-full p-2 border rounded-md bg-gray-50" value={afternoonShift.start} onChange={(e) => setAfternoonShift({...afternoonShift, start: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jam Pulang</label>
                <input type="time" className="w-full p-2 border rounded-md bg-gray-50" value={afternoonShift.end} onChange={(e) => setAfternoonShift({...afternoonShift, end: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleSaveShifts} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Simpan Pengaturan Shift</button>
          </div>
        </div>

        {/* Pengaturan Perusahaan & Role */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Pengaturan Perusahaan & Tim</h3>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">Nama Perusahaan</label>
            <input type="text" className="w-full p-2 border rounded-md bg-gray-50" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-600">Tim / Role Staff</h4>
            <div className="space-y-2">
              {roles.map(role => (
                <div key={role} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                  <span>{role}</span>
                  <button onClick={() => handleRemoveRole(role)} className="text-red-500 hover:text-red-700">Hapus</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tambah Tim Baru</label>
            <div className="flex space-x-2">
              <input type="text" className="flex-1 p-2 border rounded-md bg-gray-50" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Nama Tim Baru" />
              <button onClick={handleAddRole} className="px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">Tambah</button>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleSaveCompany} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Simpan Pengaturan Perusahaan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
