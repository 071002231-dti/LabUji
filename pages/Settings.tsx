
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/database';
import { User, UserRole } from '../types';
import { LABS } from '../constants';
import { UserPlus, Trash2, Save, X, Users, Settings as SettingsIcon, Shield } from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    labId: '' as string,
    role: UserRole.LABORAN
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await DataService.getUsers();
    // Filter hanya tampilkan Laboran dan Admin di list
    setUsers(data.filter(u => u.role === UserRole.LABORAN || u.role === UserRole.ADMIN));
    setIsLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return alert("Mohon lengkapi data");

    const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password, // In real app, this goes to backend
        role: newUser.role,
        labId: newUser.role === UserRole.LABORAN ? parseInt(newUser.labId) : undefined
    };

    await DataService.addUser(payload);
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', password: '', labId: '', role: UserRole.LABORAN });
    loadUsers();
    alert("User berhasil ditambahkan!");
  };

  const handleDeleteUser = async (id: number) => {
      if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
          await DataService.deleteUser(id);
          loadUsers();
      }
  };

  const inputClass = "w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
         <SettingsIcon size={28} className="text-slate-800"/>
         <div>
            <h1 className="text-2xl font-bold text-slate-800">Pengaturan Lab</h1>
            <p className="text-slate-500">Kelola pengguna dan konfigurasi sistem.</p>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
         <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-uii-blue text-uii-blue bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <Users size={18} /> Manajemen Pengguna
         </button>
         <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-uii-blue text-uii-blue bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <Shield size={18} /> Umum (Coming Soon)
         </button>
      </div>

      {activeTab === 'users' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/30">
               <div>
                  <h3 className="font-bold text-slate-800">Daftar Laboran & Admin</h3>
                  <p className="text-sm text-slate-500">Total {users.length} pengguna terdaftar</p>
               </div>
               <button onClick={() => setIsModalOpen(true)} className="bg-uii-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm font-medium transition-colors">
                  <UserPlus size={18} /> Tambah Laboran
               </button>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-gray-100 uppercase text-xs">
                     <tr>
                        <th className="px-6 py-4">Nama Lengkap</th>
                        <th className="px-6 py-4">Email Login</th>
                        <th className="px-6 py-4">Role / Peran</th>
                        <th className="px-6 py-4">Unit Lab</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {isLoading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
                     ) : users.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada user.</td></tr>
                     ) : (
                        users.map(user => (
                           <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                              <td className="px-6 py-4 text-slate-600">{user.email}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {user.role}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-slate-600">
                                 {user.labId ? LABS.find(l => l.id === user.labId)?.name : '-'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 {user.role !== UserRole.ADMIN && (
                                     <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Hapus User">
                                        <Trash2 size={16} />
                                     </button>
                                 )}
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* MODAL TAMBAH USER */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-lg">Tambah Laboran Baru</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               
               <form onSubmit={handleAddUser} className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                     <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className={inputClass} placeholder="Contoh: Ahmad Laboran" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Email Institusi</label>
                     <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className={inputClass} placeholder="nama@uii.ac.id" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Password Awal</label>
                     <input type="text" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className={inputClass} placeholder="Minimal 6 karakter" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Penugasan Lab</label>
                     <select required value={newUser.labId} onChange={e => setNewUser({...newUser, labId: e.target.value})} className={inputClass}>
                        <option value="" disabled>Pilih Laboratorium...</option>
                        {LABS.map(lab => (
                           <option key={lab.id} value={lab.id}>{lab.name}</option>
                        ))}
                     </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg border border-gray-200 font-medium">Batal</button>
                     <button type="submit" className="px-6 py-2 bg-uii-blue text-white rounded-lg hover:bg-blue-700 font-bold shadow-md flex items-center gap-2">
                        <Save size={18} /> Simpan Data
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
