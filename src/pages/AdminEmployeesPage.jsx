// ========================================================================
// FILE (UPDATE BESAR): src/pages/AdminEmployeesPage.jsx
// FUNGSI: Halaman ini sekarang memiliki modal (pop-up) fungsional untuk
// menambah dan mengedit data staff.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Komponen Modal yang bisa digunakan ulang untuk Tambah dan Edit
const StaffModal = ({ isOpen, onClose, staffData, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('Host');
  const isEditing = !!staffData; // Tentukan apakah ini mode edit

  useEffect(() => {
    if (isOpen && staffData) {
      // Jika mode edit, isi form dengan data staff
      setName(staffData.name);
      setEmail(staffData.email);
      setTeam(staffData.team);
    } else if (isOpen && !staffData) {
      // Jika mode tambah, kosongkan form
      setName('');
      setEmail('');
      setTeam('Host');
    }
  }, [isOpen, staffData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, email, team });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Staff' : 'Tambah Staff Baru'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md" required disabled={isEditing} />
            {isEditing && <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Tim</label>
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md">
              <option value="Host">Host</option>
              <option value="Treatment">Treatment</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
           {!isEditing && <p className="text-xs text-gray-500 mt-1">Catatan: Password sementara akan sama dengan email. Staff dapat mengubahnya nanti.</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
            <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md">{isEditing ? 'Simpan Perubahan' : 'Simpan Staff'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function AdminEmployeesPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // null untuk mode tambah, object untuk mode edit

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "Staff"));
      
      const querySnapshot = await getDocs(q);
      const staff = [];
      querySnapshot.forEach((doc) => {
        staff.push({ id: doc.id, ...doc.data() });
      });
      
      setStaffList(staff);
    } catch (error) {
      console.error("Error mengambil data staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSaveStaff = async (staffData) => {
    if (editingStaff) {
      // Logika untuk UPDATE staff yang ada
      const staffDocRef = doc(db, "users", editingStaff.id);
      await updateDoc(staffDocRef, {
        name: staffData.name,
        team: staffData.team,
      });
    } else {
      // Logika untuk CREATE staff baru
      // PENTING: Di aplikasi nyata, membuat user (Authentication) dari sisi admin
      // memerlukan Firebase Admin SDK di server. Untuk prototipe ini, kita hanya
      // menambahkan data ke Firestore. Akun Authentication harus dibuat manual
      // atau melalui halaman registrasi.
      await addDoc(collection(db, "users"), {
        name: staffData.name,
        email: staffData.email,
        team: staffData.team,
        role: "Staff",
        company: 'infinithree',
        createdAt: serverTimestamp(),
      });
    }
    fetchStaff(); // Ambil ulang data terbaru dari Firestore
    handleCloseModal();
  };

  if (loading) {
    return <div>Memuat data staff...</div>;
  }

  return (
    <div>
      <StaffModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        staffData={editingStaff}
        onSave={handleSaveStaff}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Staff</h2>
        <button onClick={handleOpenAddModal} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          + Tambah Staff Baru
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-lg shadow-md">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 font-semibold">Nama</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Tim</th>
              <th className="p-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length > 0 ? (
              staffList.map((staff) => (
                <tr key={staff.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{staff.name}</td>
                  <td className="p-4">{staff.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full">
                      {staff.team}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleOpenEditModal(staff)} className="font-medium text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Belum ada data staff. Silakan tambah staff baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
