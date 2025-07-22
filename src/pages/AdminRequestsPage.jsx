// ========================================================================
// FILE BARU: src/pages/AdminRequestsPage.jsx
// FUNGSI: Halaman untuk Admin Tim dan Super Admin untuk melihat dan
// memproses semua pengajuan dari staff.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const requestsRef = collection(db, "requests");
      const q = query(requestsRef, orderBy("createdAt", "desc")); // Urutkan
      const querySnapshot = await getDocs(q);
      const allRequests = [];
      querySnapshot.forEach((doc) => {
        allRequests.push({ id: doc.id, ...doc.data() });
      });
      setRequests(allRequests);
    } catch (error) {
      console.error("Error fetching all requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleUpdateRequest = async (id, newStatus) => {
    const requestDocRef = doc(db, "requests", id);
    try {
      await updateDoc(requestDocRef, { status: newStatus });
      fetchAllRequests(); // Refresh list
    } catch (error) {
      console.error("Error updating request:", error);
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
    return <div>Memuat semua data pengajuan...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manajemen Pengajuan Staff</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-lg shadow-md">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 font-semibold">Nama Staff</th>
              <th className="p-4 font-semibold">Jenis</th>
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{req.userName || req.userId}</td>
                  <td className="p-4">{req.type}</td>
                  <td className="p-4">{req.startDate} s/d {req.endDate}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {req.status === 'Pending' ? (
                      <div className="flex justify-center space-x-4">
                        <button onClick={() => handleUpdateRequest(req.id, 'Approved')} className="font-medium text-green-600 hover:text-green-800">Setujui</button>
                        <button onClick={() => handleUpdateRequest(req.id, 'Rejected')} className="font-medium text-red-600 hover:text-red-800">Tolak</button>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Tidak ada pengajuan yang masuk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}