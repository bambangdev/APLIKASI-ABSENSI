// ========================================================================
// FILE LAMA (UPDATE): src/pages/UserDashboardPage.jsx
// FUNGSI: Menambahkan kembali scoreboard ringkasan kehadiran & sisa cuti.
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
    switch (attendanceStatus) {
      case 'loading': return <button disabled className="mt-6 w-full max-w-xs font-bold py-4 px-6 rounded-full text-lg transition-all shadow-md bg-gray-400 cursor-not-allowed">Memuat...</button>;
      case 'not_clocked_in': return <button onClick={handleClockIn} className="mt-6 w-full max-w-xs font-bold py-4 px-6 rounded-full text-lg transition-all shadow-md bg-green-500 hover:bg-green-600">Absen Masuk</button>;
      case 'clocked_in': return <button onClick={handleClockOut} className="mt-6 w-full max-w-xs font-bold py-4 px-6 rounded-full text-lg transition-all shadow-md bg-red-500 hover:bg-red-600">Absen Pulang</button>;
      case 'clocked_out': return <button disabled className="mt-6 w-full max-w-xs font-bold py-4 px-6 rounded-full text-lg transition-all shadow-md bg-blue-700 cursor-not-allowed">Sudah Absen</button>;
      default: return null;
    }
  };

  return (
    <div>
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg mb-6 flex flex-col items-center text-center">
        <p className="font-light">{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h2 className="text-5xl font-bold my-2">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</h2>
        {renderButton()}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Ringkasan Kehadiran</h3>
          <div className="flex justify-around text-center">
            <div><p className="text-3xl font-bold text-green-500">20</p><p className="text-sm text-slate-500">Hadir</p></div>
            <div><p className="text-3xl font-bold text-orange-500">1</p><p className="text-sm text-slate-500">Terlambat</p></div>
            <div><p className="text-3xl font-bold text-red-500">0</p><p className="text-sm text-slate-500">Absen</p></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Sisa Cuti</h3>
          <div className="flex items-center justify-center space-x-4"><p className="text-5xl font-bold text-blue-600">8</p><p className="text-slate-500">Hari<br/>tersisa</p></div>
        </div>
      </div>
    </div>
  );
}
