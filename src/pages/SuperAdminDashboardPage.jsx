// ========================================================================
// FILE BARU: src/pages/SuperAdminDashboardPage.jsx
// FUNGSI: Halaman dasbor fungsional untuk Super Admin, lengkap dengan
// scoreboard statistik.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export default function SuperAdminDashboardPage({ onNavigate }) {
  const [stats, setStats] = useState({ total: 0, present: 0, onLeave: 0, pending: 0 });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Ambil statistik
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(query(usersRef)); // Super Admin melihat semua pengguna
      
      const requestsRef = collection(db, "requests");
      const pendingSnap = await getDocs(query(requestsRef, where("status", "==", "Pending")));
      
      // Untuk prototipe, data hadir dan izin masih statis
      setStats({ total: usersSnap.size, pending: pendingSnap.size, present: 30, onLeave: 2 });

      // Ambil pengajuan terbaru
      const recentRequestsQuery = query(requestsRef, where("status", "==", "Pending"), limit(3));
      const recentRequestsSnap = await getDocs(recentRequestsQuery);
      const requests = [];
      recentRequestsSnap.forEach(doc => requests.push(doc.data()));
      setRecentRequests(requests);
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <i className="fas fa-users text-3xl text-blue-500"></i>
            <div>
                <p className="text-slate-500">Total Pengguna</p>
                <p className="text-2xl font-bold">{stats.total}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <i className="fas fa-user-check text-3xl text-green-500"></i>
            <div>
                <p className="text-slate-500">Hadir Hari Ini</p>
                <p className="text-2xl font-bold">{stats.present}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <i className="fas fa-user-clock text-3xl text-orange-500"></i>
            <div>
                <p className="text-slate-500">Izin / Sakit</p>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
            <i className="fas fa-inbox text-3xl text-yellow-500"></i>
            <div>
                <p className="text-slate-500">Pengajuan Baru</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Pengajuan Terbaru</h3>
            <a href="#" onClick={() => onNavigate('admin-requests')} className="text-sm text-blue-600 font-semibold">Lihat Semua</a>
        </div>
        <div className="space-y-4">
          {recentRequests.length > 0 ? recentRequests.map((req, index) => (
            <div key={index} className="p-3 border rounded-lg">
                <p className="font-bold">{req.userName}</p>
                <p className="text-sm text-slate-500">{req.type} ({req.startDate})</p>
            </div>
          )) : <p className="text-slate-500">Tidak ada pengajuan baru.</p>}
        </div>
      </div>
    </div>
  );
}