import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../firebase/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Komponen Modal untuk Selfie
const SelfieModal = ({ isOpen, onClose, onCapture, loadingMessage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
          setStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          alert("Tidak bisa mengakses kamera. Pastikan Anda memberikan izin.");
          onClose();
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        onCapture(blob);
      }, 'image/jpeg');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Ambil Foto Selfie</h2>
        <div className="relative mb-4 bg-gray-200 rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        {loadingMessage ? (
          <p className="text-lg font-medium text-blue-600">{loadingMessage}</p>
        ) : (
          <div className="flex justify-center space-x-4">
            <button onClick={onClose} className="px-6 py-2 bg-gray-300 rounded-md font-semibold">Batal</button>
            <button onClick={handleCapture} className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold">Ambil Foto & Absen</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function UserDashboardPage() {
  const [time, setTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState('loading');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const currentUser = auth.currentUser;

  const getTodayDocId = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    // ========================================================================
    // PERBAIKAN: Mengembalikan logika untuk memeriksa status absensi harian
    // ========================================================================
    const checkTodaysAttendance = async () => {
      if (!currentUser) return;
      const todayId = getTodayDocId();
      const attendanceDocRef = doc(db, "users", currentUser.uid, "attendance", todayId);
      try {
        const docSnap = await getDoc(attendanceDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.clockOut) {
            setAttendanceStatus('clocked_out');
          } else {
            setAttendanceStatus('clocked_in');
          }
        } else {
          setAttendanceStatus('not_clocked_in');
        }
      } catch (error) {
        console.error("Error checking attendance:", error);
        setAttendanceStatus('not_clocked_in'); // Set ke default jika ada error
      }
    };

    checkTodaysAttendance();
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async (selfieBlob) => {
    if (!currentUser || !selfieBlob) return;
    
    const todayId = getTodayDocId();
    const attendanceDocRef = doc(db, "users", currentUser.uid, "attendance", todayId);
    
    try {
      setLoadingMessage("Mengunggah foto...");
      const storageRef = ref(storage, `selfies/${currentUser.uid}/${todayId}.jpg`);
      await uploadBytes(storageRef, selfieBlob);
      const selfieUrl = await getDownloadURL(storageRef);

      setLoadingMessage("Menyimpan data absensi...");
      await setDoc(attendanceDocRef, { 
        clockIn: new Date(), 
        clockOut: null, 
        status: 'Tepat Waktu',
        selfieUrl: selfieUrl
      });

      setAttendanceStatus('clocked_in');
    } catch (error) {
      console.error("Error clocking in:", error);
      alert("Gagal melakukan absen. Silakan coba lagi.");
      setAttendanceStatus('not_clocked_in');
    } finally {
      setLoadingMessage('');
      setIsCameraOpen(false);
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
    };

    const action = attendanceStatus === 'not_clocked_in' 
      ? () => setIsCameraOpen(true)
      : handleClockOut;

    return <button disabled={attendanceStatus === 'loading' || attendanceStatus === 'clocked_out'} onClick={action} className={`${baseClasses} ${statusClasses[attendanceStatus]}`}>{text[attendanceStatus]}</button>;
  };

  return (
    <div>
      <SelfieModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleClockIn}
        loadingMessage={loadingMessage}
      />
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 md:p-8 rounded-2xl shadow-xl mb-8 flex flex-col items-center text-center">
        <p className="font-medium text-primary-200">{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h2 className="text-5xl md:text-6xl font-bold my-2 tracking-tight">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</h2>
        {renderButton()}
      </div>
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