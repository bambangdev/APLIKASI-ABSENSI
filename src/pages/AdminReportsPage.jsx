// ========================================================================
// FILE LAMA (UPDATE): src/pages/AdminReportsPage.jsx
// FUNGSI: Mengisi logika penuh untuk Laporan Harian & Bulanan.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const formatMinutesToTime = (totalMinutes) => {
    if (totalMinutes === 0) return '0m';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let result = '';
    if (hours > 0) result += `${hours}j `;
    if (minutes > 0) result += `${minutes}m`;
    return result.trim();
};

export default function AdminReportsPage() {
    const [reportType, setReportType] = useState('monthly');
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [dailyDetails, setDailyDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "Staff")));
            setAllUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchUsers();
    }, []);

    const handleGenerateReport = async () => {
        setLoading(true);
        if (reportType === 'monthly') {
            const [year, month] = selectedMonth.split('-');
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);
            
            const allAttendance = [];
            for (const user of allUsers) {
                const attendanceRef = collection(db, 'users', user.id, 'attendance');
                const q = query(attendanceRef, where('clockIn', '>=', startDate), where('clockIn', '<', endDate));
                const attendanceSnap = await getDocs(q);
                attendanceSnap.forEach(doc => allAttendance.push({ userId: user.id, name: user.name, ...doc.data() }));
            }

            const summary = allUsers.map(user => {
                const userRecords = allAttendance.filter(rec => rec.userId === user.id);
                let totalHadir = 0, totalTerlambat = 0, totalWorkMinutes = 0, totalOvertimeMinutes = 0;
                userRecords.forEach(rec => {
                    if (rec.clockIn && rec.clockOut) {
                        totalHadir++;
                        if (rec.status === 'Terlambat') totalTerlambat++;
                        const workDuration = (rec.clockOut.toDate() - rec.clockIn.toDate()) / 60000;
                        totalWorkMinutes += workDuration;
                        totalOvertimeMinutes += Math.max(0, workDuration - 480);
                    }
                });
                return { id: user.id, name: user.name, totalHadir, totalTerlambat, totalJamKerja: formatMinutesToTime(Math.round(totalWorkMinutes)), totalLembur: formatMinutesToTime(Math.round(totalOvertimeMinutes)) };
            });
            setMonthlySummary(summary);
        } else { // Daily report
            const startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(selectedDate);
            endDate.setHours(23, 59, 59, 999);

            const allAttendance = [];
            for (const user of allUsers) {
                const attendanceRef = collection(db, 'users', user.id, 'attendance');
                const q = query(attendanceRef, where('clockIn', '>=', startDate), where('clockIn', '<=', endDate));
                const attendanceSnap = await getDocs(q);
                if (!attendanceSnap.empty) {
                    attendanceSnap.forEach(doc => allAttendance.push({ name: user.name, ...doc.data() }));
                }
            }
            setDailyDetails(allAttendance);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex border-b mb-6">
                <button onClick={() => setReportType('monthly')} className={`px-4 py-2 font-semibold ${reportType === 'monthly' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>Laporan Bulanan</button>
                <button onClick={() => setReportType('daily')} className={`px-4 py-2 font-semibold ${reportType === 'daily' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>Laporan Harian</button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-slate-50 mb-6">
                {reportType === 'monthly' ? (
                    <div className="flex-1"><label className="block text-sm font-medium text-slate-600 mb-1">Pilih Bulan</label><input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                ) : (
                    <div className="flex-1"><label className="block text-sm font-medium text-slate-600 mb-1">Pilih Tanggal</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                )}
                <div className="flex items-end"><button onClick={handleGenerateReport} disabled={loading} className="w-full md:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">{loading ? 'Memproses...' : 'Buat Laporan'}</button></div>
            </div>

            {reportType === 'monthly' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b"><th className="p-2">Nama</th><th className="p-2">Hadir</th><th className="p-2">Terlambat</th><th className="p-2">Jam Kerja</th><th className="p-2">Lembur</th></tr></thead>
                        <tbody>{monthlySummary.map(s => <tr key={s.id} className="border-b"><td className="p-2">{s.name}</td><td className="p-2">{s.totalHadir}</td><td className="p-2">{s.totalTerlambat}</td><td className="p-2">{s.totalJamKerja}</td><td className="p-2">{s.totalLembur}</td></tr>)}</tbody>
                    </table>
                </div>
            )}
            {reportType === 'daily' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b"><th className="p-2">Nama</th><th className="p-2">Jam Masuk</th><th className="p-2">Jam Pulang</th><th className="p-2">Status</th></tr></thead>
                        <tbody>{dailyDetails.map((d, i) => <tr key={i} className="border-b"><td className="p-2">{d.name}</td><td className="p-2">{d.clockIn.toDate().toLocaleTimeString()}</td><td className="p-2">{d.clockOut ? d.clockOut.toDate().toLocaleTimeString() : '-'}</td><td className="p-2">{d.status}</td></tr>)}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
