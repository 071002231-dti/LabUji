
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, Settings, LogOut, FlaskConical } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  userRole: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'bg-uii-blue text-white shadow-md' 
      : 'text-slate-600 hover:bg-blue-50 hover:text-uii-blue';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-10 transition-all duration-300">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-uii-blue rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
          <FlaskConical size={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-lg leading-tight">Lab FTI UII</h1>
          <p className="text-xs text-slate-500">Sistem Pengujian</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
          
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard')}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pengujian</p>
          
          {userRole === UserRole.CUSTOMER && (
            <Link to="/request/new" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/request/new')}`}>
              <PlusCircle size={18} />
              Buat Permintaan
            </Link>
          )}

          <Link to="/requests" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/requests')}`}>
            <List size={18} />
            Data Pengujian
          </Link>
        </div>

        {userRole === UserRole.ADMIN && (
          <div>
             <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin</p>
            <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/settings')}`}>
              <Settings size={18} />
              Pengaturan Lab
            </Link>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
};
