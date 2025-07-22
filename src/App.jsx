// ========================================================================
// FILE LAMA (UPDATE): src/App.jsx
// FUNGSI: Menambahkan halaman Profil ke dalam logika navigasi.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// ... (semua import halaman lain tetap sama)
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage.jsx';
import AdminEmployeesPage from './pages/AdminEmployeesPage.jsx';
import UserRequestsPage from './pages/UserRequestsPage.jsx';
import AdminRequestsPage from './pages/AdminRequestsPage.jsx';
import UserHistoryPage from './pages/UserHistoryPage.jsx';
import AdminReportsPage from './pages/AdminReportsPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx'; // <-- IMPORT HALAMAN BARU
import MainLayout from './components/MainLayout.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authPage, setAuthPage] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData({ uid: currentUser.uid, ...userDoc.data() });
        } else {
          setUserData(null);
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) { return <div className="flex items-center justify-center min-h-screen">Memuat aplikasi...</div>; }

  const navigateAuth = (page) => setAuthPage(page);
  const navigateApp = (page) => setCurrentPage(page);

  const renderAppContent = () => {
    let pageComponent;
    let activeNavPage = currentPage;

    if (currentPage === 'dashboard') {
      if (userData.role === 'SuperAdmin') activeNavPage = 'superadmin-dashboard';
      else if (userData.role === 'Staff' && userData.team === 'Admin') activeNavPage = 'admin-dashboard';
      else activeNavPage = 'user-dashboard';
    }

    const pageMap = {
      'superadmin-dashboard': <SuperAdminDashboardPage onNavigate={navigateApp} />,
      'admin-employees': <AdminEmployeesPage />,
      'admin-requests': <AdminRequestsPage />,
      'admin-reports': <AdminReportsPage />,
      'superadmin-settings': <AdminSettingsPage />,
      'admin-profile': <ProfilePage user={user} userData={userData} />,
      'admin-dashboard': <AdminDashboardPage onNavigate={navigateApp} />,
      'user-dashboard': <UserDashboardPage />,
      'user-requests': <UserRequestsPage userData={userData} />,
      'user-history': <UserHistoryPage />,
      'user-profile': <ProfilePage user={user} userData={userData} />,
    };

    pageComponent = pageMap[activeNavPage] || (userData.role === 'SuperAdmin' ? <SuperAdminDashboardPage onNavigate={navigateApp} /> : <UserDashboardPage />);

    return <MainLayout user={userData} activePage={activeNavPage} onNavigate={navigateApp}>{pageComponent}</MainLayout>;
  };

  return <div>{user && userData ? renderAppContent() : (authPage === 'login' ? <LoginPage onNavigate={navigateAuth} /> : <RegisterPage onNavigate={navigateAuth} />)}</div>;
}
