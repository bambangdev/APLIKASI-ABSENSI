// ========================================================================
// FILE LAMA (UPDATE BESAR): src/pages/UserHistoryPage.jsx
// FUNGSI: Halaman ini sekarang mengambil dan menampilkan data absensi
// nyata dari Firestore, bukan lagi data palsu.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export default function UserHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const historyRef = collection(db, "users", currentUser.uid, "attendance");
        const q = query(historyRef, orderBy("clockIn", "desc")); // Urutkan dari yang terbaru
        
        const querySnapshot = await getDocs(q);
        const userHistory = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userHistory.push({
            id: doc.id,
            date: data.clockIn.toDate(), // Gunakan waktu clockIn sebagai referensi tanggal
            clockIn: data.clockIn.toDate().toLocaleTimeString('id-ID'),
            clockOut: data.clockOut ? data.clockOut.toDate().toLocaleTimeString('id-ID') : '-',
            status: data.status,
          });
        });
        setHistory(userHistory);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);
  
  const getStatusChip = (status) => {
    switch (status) {
        case 'Tepat Waktu': return 'bg-green-100 text-green-800';
        case 'Terlambat': return 'bg-orange-100 text-orange-800';
        default: return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return <div>Memuat riwayat absensi...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Riwayat Absensi Saya</h2>
      <div className="bg-white rounded-lg shadow-md">
        <ul className="divide-y divide-gray-200">
          {history.length > 0 ? (
            history.map((item) => (
              <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-bold text-gray-800">
                    {item.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-sm text-gray-500">
                    Masuk: {item.clockIn} • Pulang: {item.clockOut}
                  </p>
                </div>
                <div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChip(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">
              Tidak ada riwayat absensi untuk ditampilkan.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
