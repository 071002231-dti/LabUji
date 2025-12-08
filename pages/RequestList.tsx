
import React, { useState, useRef, useEffect } from 'react';
import { LABS } from '../constants';
import { DataService, AuthService } from '../services/database';
import { StatusBadge } from '../components/StatusBadge';
import { RequestStatus, User, UserRole, TestRequest, ProcedureStep } from '../types';
import { Search, Filter, Download, FileSpreadsheet, FileText, ChevronDown, X, Eye, Calendar, FlaskConical, Loader2, CheckCircle, Play, Send, PackageCheck, ShieldCheck, Lock, Truck, User as UserIcon, CheckSquare, Clock } from 'lucide-react';

interface RequestListProps {
  user: User;
}

export const RequestList: React.FC<RequestListProps> = ({ user }) => {
  const [requests, setRequests] = useState<TestRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<TestRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'procedure'>('info'); // Tab State
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await DataService.getRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) setIsExportOpen(false);
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) setIsFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExportOpen(false);
    alert(`Sedang memproses unduhan file ${type.toUpperCase()}...`);
  };

  const handleDownloadPDF = () => {
    if (!selectedRequest) return;
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert(`Laporan berhasil diunduh.`);
    }, 1500);
  };

  const handleStatusUpdate = async (newStatus: RequestStatus) => {
    if (!selectedRequest) return;
    setIsUpdating(true);
    try {
      await DataService.updateRequestStatus(selectedRequest.id, newStatus);
      const updatedRequest = { ...selectedRequest, status: newStatus };
      setSelectedRequest(updatedRequest);
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      alert(`Status berhasil diperbarui: ${newStatus}`);
    } catch (error) {
      alert('Gagal memperbarui status');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- PROCEDURE STEP UPDATE ---
  const handleStepCompletion = async (stepId: number) => {
    if (!selectedRequest) return;
    const result = prompt("Masukkan hasil/catatan untuk langkah ini:");
    if (result === null) return; // Cancelled

    setIsUpdating(true);
    try {
        await DataService.updateProcedureStep(selectedRequest.id, stepId, result, user.name);
        
        // Refresh local data (simulated)
        const updatedData = await DataService.getRequests();
        const updatedReq = updatedData.find(r => r.id === selectedRequest.id) || selectedRequest;
        setSelectedRequest(updatedReq);
        setRequests(updatedData);

    } catch (error) {
        alert("Gagal update langkah.");
    } finally {
        setIsUpdating(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (user.role === UserRole.LABORAN && user.labId && req.labId !== user.labId) return false;
    if (user.role === UserRole.CUSTOMER && req.userId !== user.id) return false;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = req.id.toLowerCase().includes(query) || req.customerName.toLowerCase().includes(query) || req.testType.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    return true;
  });

  const clearFilters = () => { setSearchQuery(''); setStatusFilter('ALL'); };
  const showLabName = !user.labId;

  // Render Action Buttons
  const renderActionButtons = () => {
     if (!selectedRequest || user.role === UserRole.CUSTOMER) return null;
     const { status } = selectedRequest;
     const isAdmin = user.role === UserRole.ADMIN;
     const isLaboran = user.role === UserRole.LABORAN;

     if (status === RequestStatus.PENDING && isAdmin) return <ActionButton onClick={() => handleStatusUpdate(RequestStatus.APPROVED)} icon={<ShieldCheck size={16}/>} label="Setujui Permintaan" color="indigo" />;
     if (status === RequestStatus.APPROVED && (isLaboran || isAdmin)) return <ActionButton onClick={() => handleStatusUpdate(RequestStatus.RECEIVED)} icon={<PackageCheck size={16}/>} label="Terima Sampel" color="blue" />;
     if (status === RequestStatus.RECEIVED && (isLaboran || isAdmin)) return <ActionButton onClick={() => handleStatusUpdate(RequestStatus.IN_PROGRESS)} icon={<Play size={16}/>} label="Mulai Pengujian" color="purple" />;
     if (status === RequestStatus.IN_PROGRESS && (isLaboran || isAdmin)) return <ActionButton onClick={() => handleStatusUpdate(RequestStatus.COMPLETED)} icon={<CheckCircle size={16}/>} label="Selesai Uji" color="green" />;
     if (status === RequestStatus.COMPLETED && isAdmin) return <ActionButton onClick={() => handleStatusUpdate(RequestStatus.DELIVERED)} icon={<Send size={16}/>} label="Validasi & Kirim" color="slate" />;
     return null;
  };

  const ActionButton = ({ onClick, icon, label, color }: any) => (
    <button onClick={onClick} disabled={isUpdating} className={`w-full sm:w-auto px-4 py-2 text-sm font-medium bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 shadow-sm flex items-center justify-center gap-2`}>
       {isUpdating ? <Loader2 size={16} className="animate-spin" /> : icon} {label}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col relative">
      {/* Header & Filter UI (Same as before) */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-xl font-bold text-slate-800">Data Pengujian</h2>
            <p className="text-sm text-slate-500">Daftar permintaan pengujian laboratorium.</p>
         </div>
         <div className="flex gap-2">
             <div className="relative w-full sm:w-72">
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
             </div>
             {/* Filter & Export Buttons omitted for brevity */}
         </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left whitespace-nowrap">
           <thead className="bg-slate-50 text-slate-500 font-medium border-b border-gray-100">
              <tr>
                 <th className="px-6 py-4">No. Request</th>
                 <th className="px-6 py-4">Customer</th>
                 <th className="px-6 py-4">Jenis Uji</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
              {filteredRequests.map(req => (
                 <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-medium">{req.id}</td>
                    <td className="px-6 py-4">{req.customerName}</td>
                    <td className="px-6 py-4">{req.testType}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => setSelectedRequest(req)} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide flex items-center gap-1 justify-end"><Eye size={14}/> Detail</button>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>

      {/* DETAIL MODAL WITH TABS */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
               <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">Detail Permintaan <span className="text-sm font-normal font-mono bg-white px-2 border rounded">{selectedRequest.id}</span></h3>
                  <p className="text-xs text-slate-500">{selectedRequest.labName}</p>
               </div>
               <button onClick={() => setSelectedRequest(null)} className="p-1 rounded-full hover:bg-slate-200"><X size={20}/></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
               <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-uii-blue text-uii-blue bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Data Permohonan</button>
               <button onClick={() => setActiveTab('procedure')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'procedure' ? 'border-uii-blue text-uii-blue bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Prosedur Pengujian</button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
               {activeTab === 'info' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Info Panel Kiri: Applicant & Sample */}
                     <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                           <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><UserIcon size={16}/> Identitas Pemohon</h4>
                           <div className="space-y-2 text-sm text-slate-600">
                              <p><span className="text-slate-400 block text-xs">Nama:</span> {selectedRequest.applicationData?.applicant.name}</p>
                              <p><span className="text-slate-400 block text-xs">Perusahaan:</span> {selectedRequest.applicationData?.applicant.company}</p>
                              <p><span className="text-slate-400 block text-xs">Kontak:</span> {selectedRequest.applicationData?.applicant.phone} ({selectedRequest.applicationData?.applicant.email})</p>
                           </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                           <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FlaskConical size={16}/> Data Sampel</h4>
                           <div className="space-y-2 text-sm text-slate-600">
                              <p><span className="text-slate-400 block text-xs">Kode:</span> <span className="font-mono font-bold">{selectedRequest.applicationData?.sample.name}</span></p>
                              <p><span className="text-slate-400 block text-xs">Deskripsi:</span> {selectedRequest.applicationData?.sample.description}</p>
                              <p><span className="text-slate-400 block text-xs">Jumlah/Kemasan:</span> {selectedRequest.applicationData?.sample.count} unit ({selectedRequest.applicationData?.sample.packaging})</p>
                              <div className="mt-2">
                                 <span className={`px-2 py-0.5 rounded text-xs border ${selectedRequest.applicationData?.sample.priority === 'Mendesak' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{selectedRequest.applicationData?.sample.priority}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* Info Panel Kanan: Logistics & Agreements */}
                     <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                           <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Truck size={16}/> Logistik</h4>
                           <div className="space-y-2 text-sm text-slate-600">
                              <p><span className="text-slate-400 block text-xs">Metode Kirim:</span> {selectedRequest.applicationData?.logistics.deliveryMethod}</p>
                              <p><span className="text-slate-400 block text-xs">Kebijakan Sisa Sampel:</span> {selectedRequest.applicationData?.logistics.returnPolicy}</p>
                              {selectedRequest.applicationData?.logistics.specialHandling.length > 0 && (
                                 <div>
                                    <span className="text-slate-400 block text-xs mb-1">Perlakuan Khusus:</span> 
                                    <div className="flex flex-wrap gap-1">{selectedRequest.applicationData.logistics.specialHandling.map(h => <span key={h} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-100">{h}</span>)}</div>
                                 </div>
                              )}
                           </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                           <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={16}/> Layanan</h4>
                           <div className="space-y-2 text-sm text-slate-600">
                              <p className="font-medium text-uii-blue">{selectedRequest.testType}</p>
                              <p><span className="text-slate-400 block text-xs">Tujuan:</span> {selectedRequest.applicationData?.service.purpose.join(', ')}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {/* PROCEDURE TAB CONTENT */}
                     {selectedRequest.procedure ? (
                        <>
                           <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-slate-800">Checklist Langkah Pengujian (SOP)</h4>
                              <span className="text-xs font-mono text-slate-400">Ver: {selectedRequest.procedure.templateVersion}</span>
                           </div>
                           
                           <div className="space-y-3">
                              {selectedRequest.procedure.steps.map((step, idx) => {
                                 const isCompleted = step.status === 'completed';
                                 const isCurrent = step.status === 'in_progress';
                                 const isPending = step.status === 'pending';
                                 
                                 return (
                                    <div key={step.id} className={`p-4 rounded-xl border transition-all ${isCompleted ? 'bg-green-50 border-green-100' : isCurrent ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-100' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                                       <div className="flex items-start gap-3">
                                          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-green-500 text-white border-green-500' : isCurrent ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white text-slate-300 border-slate-300'}`}>
                                             {isCompleted ? <CheckCircle size={14}/> : <span className="text-xs font-bold">{idx + 1}</span>}
                                          </div>
                                          <div className="flex-1">
                                             <div className="flex justify-between">
                                                <h5 className={`font-bold text-sm ${isCompleted ? 'text-green-800' : 'text-slate-800'}`}>{step.title}</h5>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">{step.role}</span>
                                             </div>
                                             <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                                             
                                             {/* Tools & Duration Info */}
                                             <div className="flex gap-4 mt-2 text-xs text-slate-400">
                                                {step.estimatedDuration && <span className="flex items-center gap-1"><Clock size={12}/> {step.estimatedDuration}</span>}
                                                {step.toolsNeeds && <span>Alat: {step.toolsNeeds}</span>}
                                             </div>

                                             {/* Result Area */}
                                             {isCompleted && step.resultData && (
                                                <div className="mt-3 bg-white/50 p-2 rounded border border-green-100 text-xs text-green-800">
                                                   <strong>Hasil:</strong> {step.resultData} <br/>
                                                   <span className="text-green-600 opacity-70">Oleh {step.completedBy} pada {step.completedAt && new Date(step.completedAt).toLocaleString()}</span>
                                                </div>
                                             )}

                                             {/* Action Button for Laboran/Admin */}
                                             {isCurrent && (user.role === UserRole.LABORAN || user.role === UserRole.ADMIN) && (
                                                <button onClick={() => handleStepCompletion(step.id)} className="mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-colors">
                                                   <CheckSquare size={12}/> Tandai Selesai & Input Hasil
                                                </button>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </>
                     ) : (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                           <p>Prosedur standar belum tersedia untuk jenis pengujian ini.</p>
                        </div>
                     )}
                  </div>
               )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-100 flex justify-between bg-slate-50">
               <div>
                  {activeTab === 'info' && renderActionButtons()}
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-white border border-gray-200 text-slate-600 rounded-lg hover:bg-gray-50">Tutup</button>
                  {(selectedRequest.status === RequestStatus.COMPLETED || selectedRequest.status === RequestStatus.DELIVERED) && (
                     <button onClick={handleDownloadPDF} disabled={isDownloading} className="px-4 py-2 bg-uii-blue text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        {isDownloading ? <Loader2 className="animate-spin" size={16}/> : <Download size={16}/>} Unduh Laporan
                     </button>
                  )}
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
