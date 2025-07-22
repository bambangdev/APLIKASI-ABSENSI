// ========================================================================
// FILE LAMA (UPDATE DESAIN): src/pages/UserDashboardPage.jsx
// FUNGSI: Mendesain ulang kartu agar lebih modern dan menarik.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export default function UserDashboardPage() {
  const [time, setTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState('loading'); // loading, not_clocked_in, clocked_in, clocked_out
  const currentUser = auth.currentUser;

  const getTodayDocId = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const checkTodaysAttendance = async () => {
      if (!currentUser) return;
      const todayId = getTodayDocId();
      const attendanceDocRef = doc(db, "users", currentUser.uid, "attendance", todayId);
      try {
        const docSnap = await getDoc(attendanceDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.clockOut) setAttendanceStatus('clocked_out');
          else setAttendanceStatus('clocked_in');
        } else {
          setAttendanceStatus('not_clocked_in');
        }
      } catch (error) {
        console.error("Error checking attendance:", error);
        setAttendanceStatus('not_clocked_in');
      }
    };
    checkTodaysAttendance();
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    if (!currentUser) return;
    setAttendanceStatus('loading');
    const todayId = getTodayDocId();
    const attendanceDocRef = doc(db, "users", currentUser.uid, "attendance", todayId);
    try {
      await setDoc(attendanceDocRef, { clockIn: new Date(), clockOut: null, status: 'Tepat Waktu' });
      setAttendanceStatus('clocked_in');
    } catch (error) {
      console.error("Error clocking in:", error);
      setAttendanceStatus('not_clocked_in');
    }
  };

  const handleClockOut = async () => {
    if (!currentUser) return;
    setAttendanceStatus('loading');
    const todayId = getTodayDocId();
    const attendanceDocRef = doc(db, "users", currentUser.uid, "attendance", todayId);
    try {
      await updateDoc(attendanceDocRef, { clockOut: new Date() });
      setAttendanceStatus('clocked_out');
    } catch (error) {
      console.error("Error clocking out:", error);
      setAttendanceStatus('clocked_in');
    }
  };
  
  const renderButton = () => {
    const baseClasses = "mt-6 w-full max-w-xs font-bold py-4 px-6 rounded-full text-lg text-white transition-all shadow-lg focus:outline-none focus:ring-4";
    const statusClasses = {
      loading: "bg-gray-400 cursor-not-allowed",
      not_clocked_in: "bg-green-500 hover:bg-green-600 focus:ring-green-300",
      clocked_in: "bg-red-500 hover:bg-red-600 focus:ring-red-300",
      clocked_out: "bg-primary-700 cursor-not-allowed",
    };
    const text = {
        loading: 'Memuat...',
        not_clocked_in: 'Absen Masuk',
        clocked_in: 'Absen Pulang',
        clocked_out: 'Anda Sudah Absen'
    }

    return <button disabled={attendanceStatus === 'loading' || attendanceStatus === 'clocked_out'} onClick={attendanceStatus === 'not_clocked_in' ? handleClockIn : handleClockOut} className={`${baseClasses} ${statusClasses[attendanceStatus]}`}>{text[attendanceStatus]}</button>;
  };

  return (
    <div>
      {/* Kartu Jam & Tombol Aksi */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 md:p-8 rounded-2xl shadow-xl mb-8 flex flex-col items-center text-center">
        <p className="font-medium text-primary-200">{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h2 className="text-5xl md:text-6xl font-bold my-2 tracking-tight">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</h2>
        {renderButton()}
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg mb-4 text-on-surface">Ringkasan Bulan Ini</h3>
          <div className="flex justify-around text-center">
            <div><p className="text-3xl font-bold text-green-500">20</p><p className="text-sm text-subtle mt-1">Hadir</p></div>
            <div><p className="text-3xl font-bold text-orange-500">1</p><p className="text-sm text-subtle mt-1">Terlambat</p></div>
            <div><p className="text-3xl font-bold text-red-500">0</p><p className="text-sm text-subtle mt-1">Absen</p></div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg mb-4 text-on-surface">Sisa Cuti Tahunan</h3>
          <div className="flex items-center justify-center space-x-4 h-full">
            <p className="text-5xl font-bold text-primary-600">8</p>
            <p className="text-subtle leading-tight">Hari<br/>tersisa</p>
          </div>
        </div>
      </div>
    </div>
  );
}