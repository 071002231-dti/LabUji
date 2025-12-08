
import React, { useState, useRef, useEffect } from 'react';
import { LABS } from '../constants';
import { DataService, AuthService } from '../services/database';
import { StatusBadge } from '../components/StatusBadge';
import { RequestStatus, User, UserRole, TestRequest, ProcedureStep } from '../types';
import { Search, Filter, Download, FileSpreadsheet, FileText, ChevronDown, ChevronRight, X, Eye, Calendar, FlaskConical, Loader2, CheckCircle, Play, Send, PackageCheck, ShieldCheck, Lock, Truck, User as UserIcon, CheckSquare, Clock, Briefcase, Info } from 'lucide-react';

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
      // Re-fetch data to get any side effects (like procedure activation)
      const updatedData = await DataService.getRequests();
      const updatedReq = updatedData.find(r => r.id === selectedRequest.id);
      
      setRequests(updatedData);
      if (updatedReq) {
        setSelectedRequest(updatedReq);
        if (newStatus === RequestStatus.IN_PROGRESS) setActiveTab('procedure'); // Auto switch tab when starting
      }
      
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

  // Helper untuk menampilkan Data Info A-E dengan rapi
  const InfoSection = ({ title, icon, children }: any) => (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2 font-bold text-slate-700">
              <span className="text-uii-blue">{icon}</span> {title}
          </div>
          <div className="p-4 text-sm text-slate-600 space-y-2">
              {children}
          </div>
      </div>
  );

  const DataRow = ({ label, value, highlight = false }: any) => (
      <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-50 last:border-0 pb-1 last:pb-0 gap-1 sm:gap-4">
          <span className="text-slate-400 text-xs sm:text-sm">{label}</span>
          <span className={`font-medium ${highlight ? 'text-slate-900 font-semibold' : ''} text-right`}>{value || '-'}</span>
      </div>
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
             {/* Filter & Export Buttons */}
             <div className="relative" ref={filterDropdownRef}>
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-600">
                   <Filter size={18} />
                </button>
                {isFilterOpen && (
                   <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-10 p-2">
                      <p className="text-xs font-semibold text-slate-400 px-2 py-1">Filter Status</p>
                      <button onClick={() => { setStatusFilter('ALL'); setIsFilterOpen(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded-lg ${statusFilter === 'ALL' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>Semua</button>
                      <button onClick={() => { setStatusFilter(RequestStatus.PENDING); setIsFilterOpen(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded-lg ${statusFilter === RequestStatus.PENDING ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>Menunggu Persetujuan</button>
                      <button onClick={() => { setStatusFilter(RequestStatus.IN_PROGRESS); setIsFilterOpen(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded-lg ${statusFilter === RequestStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>Sedang Diuji</button>
                   </div>
                )}
             </div>
         </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left whitespace-nowrap">
           <thead className="bg-white text-slate-500 font-medium border-b border-gray-200">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative max-h-[95vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
               <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">Detail Permintaan <span className="text-sm font-normal font-mono bg-white px-2 border rounded shadow-sm">{selectedRequest.id}</span></h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border">{selectedRequest.labName}</span>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
               </div>
               <button onClick={() => setSelectedRequest(null)} className="p-1 rounded-full hover:bg-slate-100"><X size={20}/></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6 bg-white sticky top-0 z-10">
               <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-uii-blue text-uii-blue bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  <FileText size={16}/> Data Permohonan (A-E)
               </button>
               <button onClick={() => setActiveTab('procedure')} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'procedure' ? 'border-uii-blue text-uii-blue bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  <CheckSquare size={16}/> Prosedur Pengujian
               </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
               {activeTab === 'info' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                     {/* Kolom Kiri */}
                     <div>
                        <InfoSection title="Bagian A: Identitas Pemohon" icon={<UserIcon size={16}/>}>
                            <DataRow label="Nama" value={selectedRequest.applicationData?.applicant.name} highlight />
                            <DataRow label="Perusahaan/Instansi" value={selectedRequest.applicationData?.applicant.company} />
                            <DataRow label="Email" value={selectedRequest.applicationData?.applicant.email} />
                            <DataRow label="Kontak" value={selectedRequest.applicationData?.applicant.phone} />
                            <DataRow label="Alamat" value={selectedRequest.applicationData?.applicant.address} />
                        </InfoSection>

                        <InfoSection title="Bagian B: Layanan & Tujuan" icon={<Briefcase size={16}/>}>
                            <DataRow label="Jenis Uji" value={selectedRequest.testType} highlight />
                            <DataRow label="Tujuan" value={selectedRequest.applicationData?.service.purpose.join(', ')} />
                            {selectedRequest.applicationData?.service.purposeDetail && (
                                <DataRow label="Detail Lainnya" value={selectedRequest.applicationData.service.purposeDetail} />
                            )}
                        </InfoSection>
                     </div>

                     {/* Kolom Kanan */}
                     <div>
                        <InfoSection title="Bagian C: Data Sampel" icon={<FlaskConical size={16}/>}>
                            <DataRow label="Kode Sampel" value={selectedRequest.applicationData?.sample.name} highlight />
                            <DataRow label="Jumlah / Kemasan" value={`${selectedRequest.applicationData?.sample.count} unit (${selectedRequest.applicationData?.sample.packaging})`} />
                            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-100 text-xs">
                                <span className="font-semibold text-yellow-800 block mb-1">Deskripsi Fisik:</span>
                                {selectedRequest.applicationData?.sample.description}
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-xs text-slate-400">Prioritas:</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedRequest.applicationData?.sample.priority === 'Mendesak' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-slate-600'}`}>
                                    {selectedRequest.applicationData?.sample.priority}
                                </span>
                            </div>
                        </InfoSection>

                        <InfoSection title="Bagian D: Logistik & Penanganan" icon={<Truck size={16}/>}>
                            <DataRow label="Metode Kirim" value={selectedRequest.applicationData?.logistics.deliveryMethod} />
                            <DataRow label="Sisa Sampel" value={selectedRequest.applicationData?.logistics.returnPolicy} />
                            {selectedRequest.applicationData?.logistics.specialHandling.length > 0 && (
                                <div className="mt-2">
                                    <span className="text-xs text-slate-400 block mb-1">Perlakuan Khusus:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedRequest.applicationData.logistics.specialHandling.map(h => (
                                            <span key={h} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">{h}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </InfoSection>

                        <InfoSection title="Bagian E: Persetujuan" icon={<FileText size={16}/>}>
                             <div className="flex items-center gap-2 text-green-700 text-xs font-medium">
                                <CheckCircle size={14}/> Pernyataan Kebenaran Data
                             </div>
                             <div className="flex items-center gap-2 text-green-700 text-xs font-medium">
                                <CheckCircle size={14}/> Pemahaman Biaya & TAT
                             </div>
                        </InfoSection>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-4 animate-in fade-in">
                     {/* PROCEDURE TAB CONTENT */}
                     {selectedRequest.procedure ? (
                        <>
                           <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <div>
                                 <h4 className="font-bold text-slate-800">Checklist Langkah Pengujian (SOP)</h4>
                                 <p className="text-sm text-slate-500">{selectedRequest.testType}</p>
                              </div>
                              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">Ver: {selectedRequest.procedure.templateVersion}</span>
                           </div>

                           {/* Status Banner for Pending/Approved */}
                           {selectedRequest.status !== RequestStatus.IN_PROGRESS && selectedRequest.status !== RequestStatus.COMPLETED && selectedRequest.status !== RequestStatus.DELIVERED && (
                              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3 mb-4">
                                <Info className="text-orange-500 mt-0.5" size={18} />
                                <div>
                                  <h5 className="font-bold text-orange-800 text-sm">Prosedur Belum Aktif</h5>
                                  <p className="text-xs text-orange-700 mt-1">
                                    Daftar ceklis di bawah masih terkunci. Anda harus mengubah status permintaan menjadi 
                                    <span className="font-bold"> "Sedang Diuji"</span> terlebih dahulu untuk mulai mengisi hasil pengujian.
                                  </p>
                                </div>
                              </div>
                           )}
                           
                           <div className="space-y-3">
                              {selectedRequest.procedure.steps.map((step, idx) => {
                                 // LOGIC FIX: Determine active step with fallback if status is IN_PROGRESS but sync is missing
                                 const activeStepIndex = selectedRequest.procedure?.steps.findIndex(s => s.status === 'in_progress');
                                 // If no step is explicitly 'in_progress' but status is IN_PROGRESS, use the first 'pending' step
                                 const effectiveActiveIndex = activeStepIndex !== -1 && activeStepIndex !== undefined ? activeStepIndex : selectedRequest.procedure?.steps.findIndex(s => s.status === 'pending');

                                 const isCompleted = step.status === 'completed';
                                 // isCurrent is true if explicitly in_progress OR if we are fallback-ing to this index
                                 const isCurrent = (activeStepIndex !== -1 && step.status === 'in_progress') || (activeStepIndex === -1 && idx === effectiveActiveIndex && selectedRequest.status === RequestStatus.IN_PROGRESS);
                                 
                                 const isActive = selectedRequest.status === RequestStatus.IN_PROGRESS || selectedRequest.status === RequestStatus.COMPLETED || selectedRequest.status === RequestStatus.DELIVERED;
                                 
                                 return (
                                    <div key={step.id} className={`p-4 rounded-xl border transition-all ${isCompleted ? 'bg-green-50 border-green-100' : isCurrent ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-100' : 'bg-white border-slate-200 border-dashed'}`}>
                                       <div className="flex items-start gap-3">
                                          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-green-500 text-white border-green-500' : isCurrent ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white text-slate-300 border-slate-300'}`}>
                                             {isCompleted ? <CheckCircle size={14}/> : <span className="text-xs font-bold">{idx + 1}</span>}
                                          </div>
                                          <div className="flex-1">
                                             <div className="flex justify-between">
                                                <h5 className={`font-bold text-sm ${isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-slate-500'}`}>{step.title}</h5>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${step.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-500'}`}>{step.role === UserRole.ADMIN ? 'Validasi Admin' : 'Laboran'}</span>
                                             </div>
                                             <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                                             
                                             {/* Tools & Duration Info */}
                                             <div className="flex gap-4 mt-2 text-xs text-slate-400">
                                                {step.estimatedDuration && <span className="flex items-center gap-1"><Clock size={12}/> {step.estimatedDuration}</span>}
                                                {step.toolsNeeds && <span>Alat: {step.toolsNeeds}</span>}
                                             </div>

                                             {/* Result Area */}
                                             {isCompleted && step.resultData && (
                                                <div className="mt-3 bg-white p-3 rounded border border-green-100 text-xs text-green-800 shadow-sm">
                                                   <strong className="block mb-1">Hasil / Catatan:</strong> 
                                                   {step.resultData}
                                                   <div className="mt-2 pt-2 border-t border-green-100 text-green-600 opacity-70 flex items-center gap-1">
                                                      <CheckCircle size={10}/> Diselesaikan oleh {step.completedBy} pada {step.completedAt && new Date(step.completedAt).toLocaleString('id-ID')}
                                                   </div>
                                                </div>
                                             )}

                                             {/* Action Button for Laboran/Admin */}
                                             {isCurrent && isActive && (
                                                (user.role === UserRole.LABORAN || user.role === UserRole.ADMIN)
                                             ) && (
                                                <button onClick={() => handleStepCompletion(step.id)} className="mt-3 text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center">
                                                   <CheckSquare size={14}/> Tandai Selesai & Input Hasil
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
                        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                           <p>Prosedur standar belum tersedia untuk jenis pengujian ini.</p>
                           {user.role === UserRole.ADMIN && (
                               <p className="text-xs text-blue-600 mt-2">Silakan buat template SOP di menu Manajemen SOP.</p>
                           )}
                        </div>
                     )}
                  </div>
               )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-100 flex justify-between bg-white sticky bottom-0">
               <div>
                  {/* Action button hanya muncul di tab info utk trigger perubahan status global, 
                      kecuali status sudah IN_PROGRESS, tombol selesai ada di atas */}
                   {renderActionButtons()}
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-white border border-gray-200 text-slate-600 rounded-lg hover:bg-gray-50">Tutup</button>
                  {(selectedRequest.status === RequestStatus.COMPLETED || selectedRequest.status === RequestStatus.DELIVERED) && (
                     <button onClick={handleDownloadPDF} disabled={isDownloading} className="px-4 py-2 bg-uii-blue text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm">
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
