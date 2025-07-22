// ========================================================================
// FILE LAMA (UPDATE): src/pages/AdminDashboardPage.jsx
// FUNGSI: Menambahkan kembali scoreboard statistik & daftar pengajuan.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

// Komponen Kartu Statistik
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-surface p-6 rounded-xl shadow-md flex items-center space-x-4 transition-all hover:shadow-lg hover:scale-105">
    <div className={`p-3 rounded-full bg-${color}-100`}>
      <i className={`fas ${icon} text-3xl text-${color}-500`}></i>
    </div>
    <div>
      <p className="text-subtle">{label}</p>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
    </div>
  </div>
);

export default function AdminDashboardPage({ onNavigate }) {
  const [stats, setStats] = useState({ total: 0, present: 0, onLeave: 0, pending: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil statistik
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(query(usersRef, where("role", "==", "Staff")));
        
        const requestsRef = collection(db, "requests");
        const pendingSnap = await getDocs(query(requestsRef, where("status", "==", "Pending")));
        
        setStats({ total: usersSnap.size, pending: pendingSnap.size, present: 30, onLeave: 2 }); // present & onLeave are static for now

        // Ambil pengajuan terbaru
        const recentRequestsQuery = query(requestsRef, where("status", "==", "Pending"), orderBy("createdAt", "desc"), limit(5));
        const recentRequestsSnap = await getDocs(recentRequestsQuery);
        const requests = [];
        recentRequestsSnap.forEach(doc => requests.push({id: doc.id, ...doc.data()}));
        setRecentRequests(requests);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon="fa-users" label="Total Staff" value={stats.total} color="primary" />
        <StatCard icon="fa-user-check" label="Hadir Hari Ini" value={stats.present} color="green" />
        <StatCard icon="fa-user-clock" label="Izin / Sakit" value={stats.onLeave} color="orange" />
        <StatCard icon="fa-inbox" label="Pengajuan Baru" value={stats.pending} color="yellow" />
      </div>

      {/* Daftar Pengajuan Terbaru */}
      <div className="bg-surface p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-on-surface">Pengajuan Terbaru</h3>
            <a href="#" onClick={() => onNavigate('admin-requests')} className="text-sm text-primary-600 font-semibold hover:underline">
              Lihat Semua
            </a>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-subtle">Memuat pengajuan...</p>
          ) : recentRequests.length > 0 ? (
            recentRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-bold text-on-surface">{req.userName}</p>
                  <p className="text-sm text-subtle">{req.type} &middot; {req.startDate}</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {req.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-subtle text-center py-4">Tidak ada pengajuan baru.</p>
          )}
        </div>
      </div>
    </div>
  );
}