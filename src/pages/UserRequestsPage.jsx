// ========================================================================
// FILE BARU: src/pages/UserRequestsPage.jsx
// FUNGSI: Halaman untuk Staff (Host/Treatment) membuat dan melihat
// riwayat pengajuan izin atau cuti mereka sendiri.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const RequestModal = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState('Izin Sakit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type, startDate, endDate, reason });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Buat Pengajuan Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Pengajuan</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md">
              <option>Izin Sakit</option>
              <option>Cuti Tahunan</option>
              <option>Izin Pribadi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alasan</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" className="w-full px-3 py-2 mt-1 border rounded-md" required></textarea>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
            <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md">Kirim Pengajuan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function UserRequestsPage({ userData }) { // Terima userData sebagai props
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = auth.currentUser;

  const fetchRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const requestsRef = collection(db, "requests");
      const q = query(requestsRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const userRequests = [];
      querySnapshot.forEach((doc) => {
        userRequests.push({ id: doc.id, ...doc.data() });
      });
      // Urutkan berdasarkan tanggal pembuatan terbaru
      userRequests.sort((a, b) => b.createdAt - a.createdAt);
      setRequests(userRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const handleSaveRequest = async (requestData) => {
    try {
      await addDoc(collection(db, "requests"), {
        ...requestData,
        userId: currentUser.uid,
        userName: userData.name, // <-- PERBAIKAN: Gunakan nama dari userData
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      fetchRequests(); // Refresh list
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding request:", error);
    }
  };
  
  const getStatusChip = (status) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Approved': return 'bg-green-100 text-green-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Memuat data pengajuan...</div>;
  }

  return (
    <div>
      <RequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRequest}
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pengajuan Saya</h2>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          + Buat Pengajuan
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-lg shadow-md">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 font-semibold">Jenis</th>
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{req.type}</td>
                  <td className="p-4">{req.startDate} s/d {req.endDate}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(req.status)}`}>
                        {req.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  Anda belum memiliki pengajuan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}