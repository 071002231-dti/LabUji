import React from 'react';
import { DASHBOARD_STATS, MOCK_REQUESTS } from '../constants';
import { StatusBadge } from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Activity, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../types';

interface DashboardProps {
  user: User;
}

const iconMap: any = {
  'FileText': FileText,
  'Activity': Activity,
  'CheckCircle': CheckCircle,
  'AlertCircle': AlertCircle
};

const chartData = [
  { name: 'Tekstil', requests: 45, color: '#0054a6' },
  { name: 'Kimia', requests: 32, color: '#fdb913' },
  { name: 'Forensik', requests: 18, color: '#10b981' },
];

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Selamat Datang, {user.name}</h2>
          <p className="text-slate-500">Ringkasan aktivitas lab hari ini.</p>
        </div>
        <span className="text-sm text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DASHBOARD_STATS.map((stat, idx) => {
          const Icon = iconMap[stat.iconName] || FileText;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${idx === 0 ? 'bg-blue-50 text-blue-600' : idx === 1 ? 'bg-purple-50 text-purple-600' : idx === 2 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${stat.trendUp ? 'text-green-600' : 'text-orange-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Permintaan per Lab</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="requests" radius={[4, 4, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Permintaan Terbaru</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {MOCK_REQUESTS.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="bg-slate-100 p-2 rounded-full mt-1">
                  <Clock size={16} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{req.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{req.customerName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-2">{req.labName}</p>
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2">
            Lihat Semua <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};