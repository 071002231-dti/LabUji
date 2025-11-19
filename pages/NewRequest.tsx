import React, { useState, useRef } from 'react';
import { LABS } from '../constants';
import { Beaker, Scissors, Binary, Upload, Check, X, Image as ImageIcon, ChevronDown } from 'lucide-react';

// Definisi 7 Jenis Pengujian sesuai Lab untuk Dropdown
const LAB_TEST_TYPES: Record<number, string[]> = {
  1: [ // Lab Tekstil
    'Pengujian Nomor Benang',
    'Pengujian Jenis Anyaman',
    'Pengujian Tetal Benang'
  ],
  2: [ // Lab Kimia
    'Pengujian Kadar Air',
    'Pengujian Kadar Abu'
  ],
  3: [ // Lab Forensik
    'Pemeriksaan Komputer',
    'Pemeriksaan Handphone'
  ]
};

export const NewRequest: React.FC = () => {
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
  // Form State
  const [sampleName, setSampleName] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');
  const [description, setDescription] = useState('');

  // State untuk file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLabSelect = (id: number) => {
    setSelectedLab(id);
    setSelectedTestType(''); // Reset jenis uji saat ganti lab
    setFormStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleName || !selectedTestType) {
      alert('Mohon lengkapi nama sampel dan jenis pengujian.');
      return;
    }
    setFormStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulasi pengiriman data ke backend
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormStep(1);
    setSelectedLab(null);
    setSampleName('');
    setSelectedTestType('');
    setDescription('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Handle pemilihan file via input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      processFile(event.target.files[0]);
    }
  };

  // Handle drag over
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Handle drop file
  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      processFile(event.dataTransfer.files[0]);
    }
  };

  // Proses file (validasi & preview)
  const processFile = (file: File) => {
    // Validasi tipe file (harus gambar)
    if (!file.type.startsWith('image/')) {
      alert('Mohon upload file gambar (JPG/PNG)');
      return;
    }

    // Validasi ukuran (contoh max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar (Max 5MB)');
      return;
    }

    setSelectedFile(file);
    
    // Buat preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah trigger klik pada parent jika ada
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Permintaan Berhasil Dikirim!</h2>
        <p className="text-slate-500 mb-8">Nomor tiket Anda: <span className="font-mono font-bold text-slate-900">REQ-202511-099</span>. Tim kami akan segera memverifikasi sampel Anda.</p>
        <button 
          onClick={resetForm}
          className="px-6 py-2 bg-uii-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buat Permintaan Baru
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Buat Permintaan Uji Baru</h1>
        <p className="text-slate-500">Silakan pilih laboratorium dan isi detail sampel.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8 max-w-2xl">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${formStep >= 1 ? 'bg-uii-blue text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
        <div className={`flex-1 h-1 mx-2 ${formStep >= 2 ? 'bg-uii-blue' : 'bg-slate-200'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${formStep >= 2 ? 'bg-uii-blue text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
        <div className={`flex-1 h-1 mx-2 ${formStep >= 3 ? 'bg-uii-blue' : 'bg-slate-200'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${formStep >= 3 ? 'bg-uii-blue text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
      </div>

      {formStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LABS.map((lab) => {
            const Icon = lab.iconName === 'Scissors' ? Scissors : lab.iconName === 'Binary' ? Binary : Beaker;
            return (
              <button
                key={lab.id}
                onClick={() => handleLabSelect(lab.id)}
                className="group relative flex flex-col items-start p-6 bg-white rounded-xl border-2 border-transparent hover:border-uii-blue shadow-sm hover:shadow-lg transition-all text-left h-full"
              >
                <div className="w-14 h-14 bg-blue-50 text-uii-blue rounded-xl flex items-center justify-center mb-4 group-hover:bg-uii-blue group-hover:text-white transition-colors">
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-slate-800 mb-3 text-lg group-hover:text-uii-blue leading-tight">{lab.name}</h3>
                
                {/* Menampilkan list services sesuai gambar referensi */}
                <div className="text-slate-500 text-sm leading-relaxed">
                   {lab.services.join(', ')}.
                </div>
              </button>
            );
          })}
        </div>
      )}

      {formStep === 2 && (
        <form onSubmit={handleStep2Submit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Detail Sampel - {LABS.find(l => l.id === selectedLab)?.name}
            </h3>
            <p className="text-sm text-slate-500">Isi informasi sampel yang akan diuji.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            
            {/* Kiri: Input Nama & Deskripsi */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama/Kode Sampel <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={sampleName}
                  onChange={(e) => setSampleName(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-slate-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400" 
                  placeholder="Contoh: Kain Cotton Combed 30s" 
                />
              </div>

              {/* Dropdown Jenis Pengujian (Dikembalikan ke Dropdown) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Jenis Pengujian <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    required
                    value={selectedTestType}
                    onChange={(e) => setSelectedTestType(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-slate-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Pilih jenis pengujian...</option>
                    {selectedLab && LAB_TEST_TYPES[selectedLab].map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Kanan: Deskripsi */}
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Deskripsi Tambahan</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-slate-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-40 resize-none placeholder-slate-400" 
                  placeholder="Jelaskan kondisi sampel, instruksi khusus, atau detail lainnya..."
                ></textarea>
              </div>

          </div>

          <div className="flex justify-between pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setFormStep(1)}
              className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              Kembali
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 bg-uii-blue text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Lanjut ke Upload
            </button>
          </div>
        </form>
      )}

      {formStep === 3 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
           <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Upload Foto Sampel</h3>
            <p className="text-sm text-slate-500">Unggah foto kondisi awal sampel untuk dokumentasi.</p>
          </div>

          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-8 group bg-slate-50 max-w-md mx-auto">
              <img src={previewUrl} alt="Preview" className="w-full h-64 object-contain bg-gray-800" />
              
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={removeFile}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={18} /> Hapus Foto
                </button>
              </div>
              
              {/* File info footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 text-sm text-slate-700 border-t border-gray-200 flex items-center gap-3">
                 <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                    <ImageIcon size={16} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile?.name}</p>
                    <p className="text-xs text-slate-500">
                        {(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0)} MB
                    </p>
                 </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDrop={onDrop}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center mb-8 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <p className="text-slate-700 font-medium mb-1">Klik untuk upload atau drag & drop</p>
              <p className="text-xs text-slate-400">JPG, PNG (Max 5MB)</p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setFormStep(2)}
              className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              Kembali
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!selectedFile}
              className={`px-6 py-2 font-medium rounded-lg transition-colors shadow-lg ${
                selectedFile 
                  ? 'bg-uii-blue text-white hover:bg-blue-700 shadow-blue-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              Kirim Permintaan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};