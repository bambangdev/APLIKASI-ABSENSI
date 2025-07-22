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
    { id: 'admin-dashboard', name: 'Dasbor', icon: 'fa-tachometer-alt' },
    { id: 'admin-employees', name: 'Staff', icon: 'fa-users' },
    { id: 'admin-requests', name: 'Pengajuan', icon: 'fa-inbox' },
    { id: 'admin-reports', name: 'Laporan', icon: 'fa-chart-bar' },
    { id: 'admin-profile', name: 'Profil', icon: 'fa-user-shield' },
  ];

  const superAdminNav = [
    { id: 'superadmin-dashboard', name: 'Dasbor', icon: 'fa-crown' },
    { id: 'admin-employees', name: 'Staff', icon: 'fa-users' },
    { id: 'admin-requests', name: 'Pengajuan', icon: 'fa-inbox' },
    { id: 'admin-reports', name: 'Laporan', icon: 'fa-chart-bar' },
    { id: 'superadmin-settings', name: 'Pengaturan', icon: 'fa-cogs' },
    { id: 'admin-profile', name: 'Profil', icon: 'fa-user-shield' },
  ];

  let navItems;
  if (user.role === 'SuperAdmin') navItems = superAdminNav;
  else if (user.role === 'Staff' && user.team === 'Admin') navItems = adminTeamNav;
  else navItems = staffNav;

  const currentPageTitle = navItems.find(item => item.id.startsWith(activePage))?.name || 'Dasbor';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar untuk Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-gray-200">
        <div className="flex items-center justify-center h-20 shrink-0">
          <i className="fas fa-clock text-3xl text-primary-600"></i>
          <span className="ml-3 text-2xl font-bold text-on-surface">AbsensiApp</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <a key={item.id} href="#" onClick={() => onNavigate(item.id)}
              className={`flex items-center px-4 py-3 rounded-lg transition-all text-base font-medium ${activePage === item.id ? 'bg-primary-100 text-primary-700' : 'text-subtle hover:bg-gray-100'}`}>
              <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
              <span className="ml-4">{item.name}</span>
            </a>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-gray-200">
          <a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 text-subtle rounded-lg hover:bg-red-50 hover:text-red-600">
            <i className="fas fa-sign-out-alt w-6 text-center text-lg"></i>
            <span className="ml-4">Logout</span>
          </a>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col">
        <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between h-20 px-4 md:px-8 border-b border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface">{currentPageTitle}</h1>
            <p className="text-subtle text-sm md:text-base">Halo, {user.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <i className="fas fa-bell text-xl text-subtle cursor-pointer hover:text-primary-600"></i>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-600 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Navigasi untuk Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 grid grid-cols-5 gap-1">
        {navItems.slice(0, 4).map(item => ( // Hanya tampilkan 4 menu utama
          <a key={item.id} href="#" onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-2 transition-all rounded-md m-1 ${activePage === item.id ? 'text-primary-600 bg-primary-100' : 'text-subtle'}`}>
            <i className={`fas ${item.icon} text-xl mb-1`}></i>
            <span className="text-xs font-medium">{item.name}</span>
          </a>
        ))}
        {/* Tombol Logout untuk Mobile */}
        <a href="#" onClick={handleLogout}
          className="flex flex-col items-center justify-center py-2 text-subtle hover:bg-red-50 hover:text-red-600 rounded-md m-1">
          <i className="fas fa-sign-out-alt text-xl mb-1"></i>
          <span className="text-xs font-medium">Logout</span>
        </a>
      </nav>
    </div>
  );
}