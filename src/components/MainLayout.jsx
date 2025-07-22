// ========================================================================
// FILE LAMA (UPDATE): src/components/MainLayout.jsx
// FUNGSI: Menambahkan ikon & menu profil. Membuatnya mobile responsive.
// ========================================================================

import React from 'react';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';

export default function MainLayout({ children, user, activePage, onNavigate }) {
  const handleLogout = async () => { await signOut(auth); };

  const staffNav = [
    { id: 'user-dashboard', name: 'Dasbor', icon: 'fa-home' },
    { id: 'user-requests', name: 'Pengajuan', icon: 'fa-file-alt' },
    { id: 'user-history', name: 'Riwayat', icon: 'fa-history' },
    { id: 'user-profile', name: 'Profil', icon: 'fa-user-cog' },
  ];
  const adminTeamNav = [
    { id: 'admin-dashboard', name: 'Dasbor Tim', icon: 'fa-tachometer-alt' },
    { id: 'admin-employees', name: 'Manajemen Staff', icon: 'fa-users' },
    { id: 'admin-requests', name: 'Proses Pengajuan', icon: 'fa-inbox' },
    { id: 'admin-reports', name: 'Laporan', icon: 'fa-chart-bar' },
    { id: 'admin-profile', name: 'Profil', icon: 'fa-user-shield' },
  ];
  const superAdminNav = [
    { id: 'superadmin-dashboard', name: 'Dasbor Utama', icon: 'fa-crown' },
    { id: 'admin-employees', name: 'Manajemen Staff', icon: 'fa-users' },
    { id: 'admin-requests', name: 'Proses Pengajuan', icon: 'fa-inbox' },
    { id: 'admin-reports', name: 'Laporan', icon: 'fa-chart-bar' },
    { id: 'superadmin-settings', name: 'Pengaturan', icon: 'fa-cogs' },
    { id: 'admin-profile', name: 'Profil', icon: 'fa-user-shield' },
  ];

  let navItems;
  if (user.role === 'SuperAdmin') navItems = superAdminNav;
  else if (user.role === 'Staff' && user.team === 'Admin') navItems = adminTeamNav;
  else navItems = staffNav;

  const currentPageTitle = navItems.find(item => item.id === activePage)?.name || 'Dasbor';

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-20 border-b"><i className="fas fa-clock text-2xl text-blue-600"></i><span className="ml-3 text-xl font-bold">AbsensiApp</span></div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (<a key={item.id} href="#" onClick={() => onNavigate(item.id)} className={`flex items-center px-4 py-3 text-slate-600 rounded-lg transition-all ${activePage === item.id ? 'bg-blue-100 text-blue-600 font-bold' : 'hover:bg-slate-100'}`}><i className={`fas ${item.icon} w-6 text-center`}></i><span className="ml-4">{item.name}</span></a>))}
        </nav>
        <div className="px-4 py-6 border-t"><a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 text-red-500 rounded-lg hover:bg-red-50"><i className="fas fa-sign-out-alt w-6 text-center"></i><span className="ml-4">Logout</span></a></div>
      </aside>
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 bg-slate-100">
        <header className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold text-slate-800">{currentPageTitle}</h1><p className="text-slate-500">Halo, {user.name}!</p></div>
          <div className="flex items-center space-x-4"><i className="fas fa-bell text-xl text-slate-500 cursor-pointer"></i><div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-blue-600 text-lg">{user.name.charAt(0)}</div></div>
        </header>
        <div className="fade-in">{children}</div>
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t-lg border-t flex justify-around">
        {navItems.map(item => (<a key={item.id} href="#" onClick={() => onNavigate(item.id)} className={`flex flex-col items-center justify-center w-full py-3 transition-all ${activePage === item.id ? 'text-blue-600' : 'text-slate-500'}`}><i className={`fas ${item.icon} text-xl`}></i><span className="text-xs mt-1">{item.name}</span></a>))}
      </nav>
    </div>
  );
}
