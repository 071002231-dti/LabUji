import React, { useState, useRef, useEffect } from 'react';
import { MOCK_REQUESTS, LABS } from '../constants';
import { StatusBadge } from '../components/StatusBadge';
import { RequestStatus, User, UserRole } from '../types';
import { Search, Filter, Download, FileSpreadsheet, FileText, ChevronDown, X } from 'lucide-react';

interface RequestListProps {
  user: User;
}

export const RequestList: React.FC<RequestListProps> = ({ user }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportDropdownRef, filterDropdownRef]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExportOpen(false);
    alert(`Sedang memproses unduhan file ${type.toUpperCase()} untuk ${filteredRequests.length} data...`);
  };

  // --- Logic Pemfilteran ---
  const filteredRequests = MOCK_REQUESTS.filter((req) => {
    // 1. Filter berdasarkan Lab User (Jika user adalah Staff/Analis)
    // Jika Admin atau Customer, bisa melihat semua (atau logic customer bisa melihat miliknya sendiri)
    const isStaff = user.role === UserRole.PETUGAS_LAB || user.role === UserRole.ANALIS;
    if (isStaff && user.labId) {
      if (req.labId !== user.labId) return false;
    }

    // 2. Filter berdasarkan Search Query (No Request, Customer, atau Tipe Uji)
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      req.id.toLowerCase().includes(query) ||
      req.customerName.toLowerCase().includes(query) ||
      req.testType.toLowerCase().includes(query);
    
    if (!matchesSearch) return false;

    // 3. Filter berdasarkan Status Dropdown
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  // Helper to get Lab Name if user is admin (since filtered data might mix labs)
  const showLabName = !user.labId;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Data Pengujian</h2>
          <p className="text-sm text-slate-500">
            {user.labId 
              ? `Daftar permintaan untuk ${LABS.find(l => l.id === user.labId)?.name}`
              : 'Daftar seluruh permintaan uji lab.'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search Input - Updated Styling */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Request / Customer..." 
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 w-72 transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200/50 rounded-full p-0.5">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2.5 border rounded-lg hover:bg-gray-50 transition-colors ${
                statusFilter !== 'ALL' || isFilterOpen ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-slate-600 bg-white'
              }`}
              title="Filter Status"
            >
              <Filter size={18} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden p-2">
                <div className="text-xs font-semibold text-slate-500 px-2 py-1 mb-1">Filter Status</div>
                <button 
                  onClick={() => { setStatusFilter('ALL'); setIsFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 ${statusFilter === 'ALL' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-slate-700'}`}
                >
                  Semua Status
                </button>
                {Object.values(RequestStatus).map((status) => (
                  <button 
                    key={status}
                    onClick={() => { setStatusFilter(status); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 ${statusFilter === status ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-slate-700'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 bg-uii-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${isExportOpen ? 'ring-2 ring-blue-300' : ''}`}
            >
              <Download size={18} />
              Export
              <ChevronDown size={16} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  <button 
                    onClick={() => handleExport('excel')}
                    className="w-full px-4 py-3 text-sm text-slate-700 hover:bg-gray-50 hover:text-green-600 flex items-center gap-3 transition-colors text-left"
                  >
                    <div className="bg-green-100 p-1.5 rounded text-green-600">
                      <FileSpreadsheet size={16} />
                    </div>
                    <span>Export Excel (.xlsx)</span>
                  </button>
                  <button 
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-3 text-sm text-slate-700 hover:bg-gray-50 hover:text-red-600 flex items-center gap-3 transition-colors text-left border-t border-gray-50"
                  >
                    <div className="bg-red-100 p-1.5 rounded text-red-600">
                      <FileText size={16} />
                    </div>
                    <span>Export PDF (.pdf)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(statusFilter !== 'ALL' || searchQuery) && (
        <div className="px-6 pb-4 flex items-center gap-2 text-sm">
          <span className="text-slate-500">Filter aktif:</span>
          {searchQuery && (
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
              "{searchQuery}" <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {statusFilter !== 'ALL' && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
              Status: {statusFilter} <X size={12} className="cursor-pointer" onClick={() => setStatusFilter('ALL')} />
            </span>
          )}
          <button onClick={clearFilters} className="text-red-500 hover:underline ml-2 text-xs">Reset Filter</button>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">No. Request</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Jenis Uji {showLabName ? '& Lab' : ''}</th>
              <th className="px-6 py-4">Tanggal Masuk</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{req.id}</td>
                  <td className="px-6 py-4 text-slate-600">{req.customerName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-slate-800 font-medium">{req.testType}</span>
                      {showLabName && <span className="font-xs text-slate-500">{req.labName}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{req.dateSubmitted}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                    {req.expiryDate && (
                      <div className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                         Exp: {req.expiryDate}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide">
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>Tidak ada data yang ditemukan.</p>
                    <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-sm text-slate-500">
        <span>Menampilkan {filteredRequests.length} dari {MOCK_REQUESTS.length} data</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};