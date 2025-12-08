
import React, { useState, useRef } from 'react';
import { LABS } from '../constants';
import { Beaker, Scissors, Binary, Upload, Check, X, Image as ImageIcon, ChevronDown, RefreshCw, Loader2, User as UserIcon, Truck, FileText, Briefcase } from 'lucide-react';
import { DataService } from '../services/database';
import { RequestStatus, User, TestRequest } from '../types';

// Definisi Jenis Pengujian per Lab
const LAB_TEST_TYPES: Record<number, string[]> = {
  1: ['Pengujian Nomor Benang', 'Pengujian Jenis Anyaman', 'Pengujian Tetal Benang'],
  2: ['Pengujian Kadar Air', 'Pengujian Kadar Abu'],
  3: ['Pemeriksaan Komputer', 'Pemeriksaan Handphone']
};

interface NewRequestProps {
  user: User;
}

export const NewRequest: React.FC<NewRequestProps> = ({ user }) => {
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLab, setSelectedLab] = useState<number | null>(null);

  // --- FORM STATE (BAGIAN A - E) ---
  
  // Bagian A: Pendaftaran Permohonan
  const [applicant, setApplicant] = useState({
    email: user.email,
    name: user.name,
    company: '',
    phone: '',
    address: ''
  });

  // Bagian B: Keperluan & Layanan
  const [service, setService] = useState({
    testType: '',
    purpose: [] as string[],
    purposeDetail: ''
  });

  // Bagian C: Data Sampel
  const [sample, setSample] = useState({
    name: '',
    count: 1,
    packaging: '',
    description: '',
    estimatedDelivery: '',
    priority: 'Reguler' as 'Reguler' | 'Mendesak',
    notes: ''
  });

  // Bagian D: Logistik
  const [logistics, setLogistics] = useState({
    deliveryMethod: 'Antar Langsung' as 'Antar Langsung' | 'Ekspedisi',
    specialHandling: [] as string[],
    returnPolicy: 'Dikembalikan' as 'Dikembalikan' | 'Dimusnahkan' | 'Tidak Perlu'
  });

  // Bagian E: Persetujuan
  const [agreements, setAgreements] = useState({
    dataTruth: false,
    understanding: false
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleLabSelect = (id: number) => {
    setSelectedLab(id);
    setService(prev => ({ ...prev, testType: '' }));
    setFormStep(2); // Masuk ke Wizard Form Detail
  };

  const generateSampleCode = (testType: string) => {
    if (!testType) return '';
    const initials = testType.split(' ').map(w => w[0]).join('').toUpperCase();
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    return `${initials}-${dateStr}-${randomSeq}`;
  };

  const handleTestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setService(prev => ({ ...prev, testType: type }));
    setSample(prev => ({ ...prev, name: generateSampleCode(type) }));
  };

  const handleCheckboxChange = (category: 'purpose' | 'specialHandling', value: string) => {
    if (category === 'purpose') {
      setService(prev => {
         const newPurpose = prev.purpose.includes(value) 
            ? prev.purpose.filter(p => p !== value)
            : [...prev.purpose, value];
         return { ...prev, purpose: newPurpose };
      });
    } else {
      setLogistics(prev => {
         const newHandling = prev.specialHandling.includes(value)
            ? prev.specialHandling.filter(h => h !== value)
            : [...prev.specialHandling, value];
         return { ...prev, specialHandling: newHandling };
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };
  
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return alert('File harus gambar');
    if (file.size > 5 * 1024 * 1024) return alert('Max 5MB');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Akhir
    if (!agreements.dataTruth || !agreements.understanding) {
        alert("Mohon setujui semua pernyataan pada Bagian E.");
        return;
    }

    setIsSubmitting(true);
    const reqId = `REQ-${new Date().getFullYear()}${new Date().getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
    const labName = LABS.find(l => l.id === selectedLab)?.name || '';

    const newRequest: TestRequest = {
      id: reqId,
      userId: user.id,
      labId: selectedLab!,
      labName: labName,
      customerName: applicant.name || user.name,
      testType: service.testType,
      dateSubmitted: new Date().toISOString().slice(0, 10),
      status: RequestStatus.PENDING,
      applicationData: {
        applicant,
        service,
        sample: { ...sample, photoUrl: previewUrl || undefined }, // Simpan URL preview sebagai dummy url
        logistics,
        agreements
      }
    };

    try {
      await DataService.addRequest(newRequest);
      setSubmitted(true);
    } catch (error) {
      alert('Gagal mengirim permintaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormStep(1);
    setSelectedLab(null);
    setService({ testType: '', purpose: [], purposeDetail: '' });
    setSample({ name: '', count: 1, packaging: '', description: '', estimatedDelivery: '', priority: 'Reguler', notes: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // --- RENDER HELPERS ---
  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      <div className="text-uii-blue">{icon}</div>
      <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
    </div>
  );

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Permintaan Berhasil Dikirim!</h2>
        <p className="text-slate-500 mb-6">Kode Sampel: <span className="font-mono font-bold text-slate-900">{sample.name}</span></p>
        <button onClick={resetForm} className="px-6 py-2 bg-uii-blue text-white rounded-lg">Buat Permintaan Baru</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Buat Permintaan Uji Baru</h1>
        <p className="text-slate-500">Isi formulir prosedur pengujian di bawah ini dengan lengkap.</p>
      </div>

      {formStep === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LABS.map((lab) => {
            const Icon = lab.iconName === 'Scissors' ? Scissors : lab.iconName === 'Binary' ? Binary : Beaker;
            return (
              <button key={lab.id} onClick={() => handleLabSelect(lab.id)} className="group p-6 bg-white rounded-xl border hover:border-uii-blue shadow-sm hover:shadow-lg transition-all text-left">
                <div className="w-14 h-14 bg-blue-50 text-uii-blue rounded-xl flex items-center justify-center mb-4 group-hover:bg-uii-blue group-hover:text-white transition-colors">
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{lab.name}</h3>
                <p className="text-slate-500 text-sm mt-2">{lab.services.join(', ')}</p>
              </button>
            );
          })}
        </div>
      )}

      {formStep === 2 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* BAGIAN A: Pendaftaran Permohonan */}
          <div className="p-6 md:p-8 bg-slate-50/50">
             {renderSectionHeader('Bagian A: Identitas Pemohon', <UserIcon size={20} />)}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                   <input type="text" required value={applicant.name} onChange={e => setApplicant({...applicant, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Email</label>
                   <input type="email" required value={applicant.email} onChange={e => setApplicant({...applicant, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Perusahaan / Instansi</label>
                   <input type="text" required value={applicant.company} onChange={e => setApplicant({...applicant, company: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">No. HP / WhatsApp</label>
                   <input type="text" required value={applicant.phone} onChange={e => setApplicant({...applicant, phone: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                   <textarea rows={2} required value={applicant.address} onChange={e => setApplicant({...applicant, address: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500" />
                </div>
             </div>
          </div>

          <div className="h-1 bg-gray-100"></div>

          {/* BAGIAN B: Keperluan & Layanan */}
          <div className="p-6 md:p-8">
             {renderSectionHeader('Bagian B: Keperluan & Layanan', <Briefcase size={20} />)}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium mb-1">Jenis Layanan <span className="text-red-500">*</span></label>
                   <select required value={service.testType} onChange={handleTestTypeChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg">
                      <option value="" disabled>Pilih layanan...</option>
                      {selectedLab && LAB_TEST_TYPES[selectedLab].map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-2">Tujuan Pengujian</label>
                   <div className="space-y-2">
                      {['Kesesuaian Standar SNI/ISO', 'Internal QA/QC', 'Sertifikasi/Perizinan', 'Penelitian'].map(p => (
                         <label key={p} className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={service.purpose.includes(p)} onChange={() => handleCheckboxChange('purpose', p)} className="rounded text-uii-blue" />
                            {p}
                         </label>
                      ))}
                      <div className="flex items-center gap-2">
                         <input type="checkbox" checked={service.purpose.includes('Lainnya')} onChange={() => handleCheckboxChange('purpose', 'Lainnya')} className="rounded text-uii-blue" />
                         <span className="text-sm text-slate-700">Lainnya:</span>
                         <input type="text" className="flex-1 px-2 py-1 text-sm border-b border-gray-300 outline-none" placeholder="Isi detail..." value={service.purposeDetail} onChange={e => setService({...service, purposeDetail: e.target.value})} disabled={!service.purpose.includes('Lainnya')} />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="h-1 bg-gray-100"></div>

          {/* BAGIAN C: Data Sampel */}
          <div className="p-6 md:p-8 bg-slate-50/50">
             {renderSectionHeader('Bagian C: Data Sampel', <Beaker size={20} />)}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Nama/Kode Sampel (Auto)</label>
                   <input type="text" readOnly value={sample.name} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-slate-500 cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">Jumlah Unit</label>
                        <input type="number" min="1" required value={sample.count} onChange={e => setSample({...sample, count: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Jenis Kemasan</label>
                        <input type="text" placeholder="Box/Plastik" required value={sample.packaging} onChange={e => setSample({...sample, packaging: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg" />
                    </div>
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium mb-1">Deskripsi Singkat Sampel</label>
                   <textarea rows={2} required value={sample.description} onChange={e => setSample({...sample, description: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg" placeholder="Warna, tekstur, kondisi fisik..." />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Perkiraan Tgl Kirim</label>
                   <input type="date" required value={sample.estimatedDelivery} onChange={e => setSample({...sample, estimatedDelivery: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Prioritas Layanan</label>
                   <select value={sample.priority} onChange={e => setSample({...sample, priority: e.target.value as any})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg">
                      <option value="Reguler">Reguler (Standard TAT)</option>
                      <option value="Mendesak">Mendesak (Express Charge +50%)</option>
                   </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Foto Sampel</label>
                    {previewUrl ? (
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
                            <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                            <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={16}/></button>
                        </div>
                    ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
                            <Upload className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload foto sampel</span>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                    )}
                </div>
             </div>
          </div>

          <div className="h-1 bg-gray-100"></div>

          {/* BAGIAN D: Logistik */}
          <div className="p-6 md:p-8">
             {renderSectionHeader('Bagian D: Logistik & Penanganan', <Truck size={20} />)}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Cara Pengiriman Sampel</label>
                    <div className="flex gap-4">
                        {['Antar Langsung', 'Ekspedisi'].map(m => (
                            <label key={m} className="flex items-center gap-2 text-sm">
                                <input type="radio" name="delivery" checked={logistics.deliveryMethod === m} onChange={() => setLogistics({...logistics, deliveryMethod: m as any})} className="text-uii-blue" /> {m}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Pengembalian Sisa Sampel</label>
                    <select value={logistics.returnPolicy} onChange={e => setLogistics({...logistics, returnPolicy: e.target.value as any})} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg">
                        <option value="Dikembalikan">Dikembalikan ke Pelanggan</option>
                        <option value="Dimusnahkan">Dimusnahkan oleh Lab</option>
                        <option value="Tidak Perlu">Tidak ada sisa (habis uji)</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Perlakuan Khusus</label>
                    <div className="flex gap-4">
                         {['Butuh Pendingin', 'Fragile/Mudah Pecah', 'Bahan Berbahaya'].map(h => (
                            <label key={h} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={logistics.specialHandling.includes(h)} onChange={() => handleCheckboxChange('specialHandling', h)} className="rounded text-uii-blue" /> {h}
                            </label>
                         ))}
                    </div>
                </div>
             </div>
          </div>

          <div className="h-1 bg-gray-100"></div>

          {/* BAGIAN E: Pernyataan */}
          <div className="p-6 md:p-8 bg-yellow-50">
             {renderSectionHeader('Bagian E: Pernyataan & Persetujuan', <FileText size={20} />)}
             <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm text-slate-800 cursor-pointer">
                    <input type="checkbox" required checked={agreements.dataTruth} onChange={e => setAgreements({...agreements, dataTruth: e.target.checked})} className="mt-1 rounded text-uii-blue focus:ring-uii-blue" />
                    <span>Saya menyatakan bahwa data yang diisi adalah benar dan sampel yang dikirimkan sesuai dengan deskripsi di atas.</span>
                </label>
                <label className="flex items-start gap-3 text-sm text-slate-800 cursor-pointer">
                    <input type="checkbox" required checked={agreements.understanding} onChange={e => setAgreements({...agreements, understanding: e.target.checked})} className="mt-1 rounded text-uii-blue focus:ring-uii-blue" />
                    <span>Saya memahami prosedur, perkiraan waktu (TAT), dan biaya yang akan dikonfirmasi setelah sampel diverifikasi oleh Lab.</span>
                </label>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 flex justify-between">
             <button type="button" onClick={() => setFormStep(1)} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Kembali</button>
             <button type="submit" disabled={isSubmitting} className="px-8 py-2 bg-uii-blue text-white font-bold rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Kirim Permohonan'}
             </button>
          </div>

        </form>
      )}
    </div>
  );
};
