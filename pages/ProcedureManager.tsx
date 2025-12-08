
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/database';
import { ProcedureTemplate, ProcedureStep, UserRole } from '../types';
import { Plus, Trash2, Save, Edit, ArrowLeft, PlusCircle, LayoutList, Clock, User, FileText } from 'lucide-react';

export const ProcedureManager: React.FC = () => {
  const [templates, setTemplates] = useState<ProcedureTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<ProcedureTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await DataService.getTemplates();
    setTemplates(data);
  };

  const handleCreateNew = () => {
    const newTemplate: ProcedureTemplate = {
      id: `SOP-NEW-${Date.now()}`,
      serviceName: '',
      version: '1.0',
      steps: []
    };
    setCurrentTemplate(newTemplate);
    setIsEditing(true);
  };

  const handleEdit = (template: ProcedureTemplate) => {
    setCurrentTemplate(JSON.parse(JSON.stringify(template))); // Deep copy
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin hapus SOP ini?')) {
        await DataService.deleteTemplate(id);
        loadTemplates();
    }
  };

  const handleSave = async () => {
    if (!currentTemplate) return;
    if (!currentTemplate.serviceName) return alert('Nama Layanan harus diisi');
    
    await DataService.saveTemplate(currentTemplate);
    setIsEditing(false);
    setCurrentTemplate(null);
    loadTemplates();
  };

  const handleAddStep = () => {
      if (!currentTemplate) return;
      const newStep: ProcedureStep = {
          id: Date.now(),
          title: 'Langkah Baru',
          description: '',
          role: UserRole.LABORAN,
          estimatedDuration: '10 menit'
      };
      setCurrentTemplate({
          ...currentTemplate,
          steps: [...currentTemplate.steps, newStep]
      });
  };

  const handleUpdateStep = (index: number, field: keyof ProcedureStep, value: any) => {
      if (!currentTemplate) return;
      const updatedSteps = [...currentTemplate.steps];
      updatedSteps[index] = { ...updatedSteps[index], [field]: value };
      setCurrentTemplate({ ...currentTemplate, steps: updatedSteps });
  };

  const handleRemoveStep = (index: number) => {
      if (!currentTemplate) return;
      const updatedSteps = currentTemplate.steps.filter((_, i) => i !== index);
      setCurrentTemplate({ ...currentTemplate, steps: updatedSteps });
  };

  // Class helper untuk input agar seragam
  const inputClass = "w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow";
  const smallInputClass = "w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  if (isEditing && currentTemplate) {
      return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ArrowLeft size={20}/></button>
                  <h2 className="text-xl font-bold text-slate-800">Editor SOP</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-xl border border-gray-100">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nama Layanan / Jenis Uji</label>
                      <input 
                        type="text" 
                        value={currentTemplate.serviceName} 
                        onChange={e => setCurrentTemplate({...currentTemplate, serviceName: e.target.value})} 
                        className={inputClass} 
                        placeholder="Contoh: Pengujian Kadar Air" 
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Versi Dokumen</label>
                      <input 
                        type="text" 
                        value={currentTemplate.version} 
                        onChange={e => setCurrentTemplate({...currentTemplate, version: e.target.value})} 
                        className={inputClass} 
                        placeholder="1.0" 
                      />
                  </div>
              </div>

              <div className="mb-6 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg"><LayoutList size={22} className="text-uii-blue"/> Langkah Kerja</h3>
                  <button onClick={handleAddStep} className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 font-bold flex items-center gap-2 transition-colors">
                    <PlusCircle size={18}/> Tambah Langkah
                  </button>
              </div>

              <div className="space-y-4">
                  {currentTemplate.steps.map((step, idx) => (
                      <div key={step.id} className="p-5 border border-gray-200 rounded-xl bg-slate-50/50 relative group hover:bg-white hover:shadow-md transition-all">
                          <button onClick={() => handleRemoveStep(idx)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 size={18}/></button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              {/* Numbering */}
                              <div className="md:col-span-1 flex items-start justify-center pt-1">
                                  <span className="w-8 h-8 rounded-full bg-uii-blue text-white font-bold flex items-center justify-center shadow-sm text-sm">{idx + 1}</span>
                              </div>

                              {/* Form Fields */}
                              <div className="md:col-span-11 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Judul Langkah</label>
                                        <input 
                                            type="text" 
                                            value={step.title} 
                                            onChange={e => handleUpdateStep(idx, 'title', e.target.value)} 
                                            className={inputClass}
                                            placeholder="Judul Langkah" 
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                         <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Penanggung Jawab</label>
                                            <select 
                                                value={step.role} 
                                                onChange={e => handleUpdateStep(idx, 'role', e.target.value)} 
                                                className={inputClass}
                                            >
                                                <option value={UserRole.LABORAN}>Laboran</option>
                                                <option value={UserRole.ADMIN}>Admin / Supervisor</option>
                                            </select>
                                         </div>
                                         <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Estimasi Durasi</label>
                                            <input 
                                                type="text" 
                                                value={step.estimatedDuration} 
                                                onChange={e => handleUpdateStep(idx, 'estimatedDuration', e.target.value)} 
                                                className={inputClass}
                                                placeholder="e.g. 10 menit" 
                                            />
                                         </div>
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Deskripsi Detail</label>
                                      <textarea 
                                        rows={2} 
                                        value={step.description} 
                                        onChange={e => handleUpdateStep(idx, 'description', e.target.value)} 
                                        className={inputClass}
                                        placeholder="Jelaskan instruksi kerja secara detail..." 
                                      />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                     <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Alat & Bahan</label>
                                        <input 
                                            type="text" 
                                            value={step.toolsNeeds || ''} 
                                            onChange={e => handleUpdateStep(idx, 'toolsNeeds', e.target.value)} 
                                            className={smallInputClass} 
                                            placeholder="Isi kebutuhan alat..." 
                                        />
                                     </div>
                                     <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Standar (SNI/ISO)</label>
                                        <input 
                                            type="text" 
                                            value={step.standardRef || ''} 
                                            onChange={e => handleUpdateStep(idx, 'standardRef', e.target.value)} 
                                            className={smallInputClass} 
                                            placeholder="Nomor referensi..." 
                                        />
                                     </div>
                                     <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Kriteria Lulus</label>
                                        <input 
                                            type="text" 
                                            value={step.passCriteria || ''} 
                                            onChange={e => handleUpdateStep(idx, 'passCriteria', e.target.value)} 
                                            className={smallInputClass} 
                                            placeholder="Parameter keberhasilan..." 
                                        />
                                     </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
                  {currentTemplate.steps.length === 0 && (
                      <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                          <LayoutList className="mx-auto mb-2 text-slate-400" size={32}/>
                          <p>Belum ada langkah kerja.</p>
                          <button onClick={handleAddStep} className="mt-2 text-uii-blue hover:underline text-sm font-medium">Klik untuk tambah langkah pertama</button>
                      </div>
                  )}
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white p-4 -mx-6 -mb-6 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Batal</button>
                  <button onClick={handleSave} className="px-6 py-2 bg-uii-blue text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-bold shadow-lg shadow-blue-200 transition-all"><Save size={18}/> Simpan Template</button>
              </div>
          </div>
      );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Manajemen SOP</h2>
           <p className="text-slate-500">Kelola template prosedur pengujian laboratorium.</p>
        </div>
        <button onClick={handleCreateNew} className="bg-uii-blue text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 font-bold transition-all">
           <Plus size={20} /> Buat SOP Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
              <div key={template.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all relative group cursor-pointer" onClick={() => handleEdit(template)}>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }} className="p-2 bg-white text-red-500 hover:bg-red-50 border border-gray-200 rounded-lg shadow-sm"><Trash2 size={16}/></button>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-uii-blue rounded-xl flex items-center justify-center border border-blue-100">
                          <FileText size={24}/>
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 line-clamp-2">{template.serviceName}</h3>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-gray-200">v{template.version}</span>
                      </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <LayoutList size={16} className="text-slate-400"/>
                            <span>{template.steps.length} Langkah</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                           <User size={16} className="text-slate-400"/>
                           <span>{template.steps.filter(s => s.role === UserRole.ADMIN).length > 0 ? 'Butuh Validasi Admin' : 'Full Laboran'}</span>
                      </div>
                  </div>
              </div>
          ))}
          {templates.length === 0 && (
             <div className="col-span-full py-16 text-center">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <FileText size={40} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-700 mb-2">Belum ada Template SOP</h3>
                 <p className="text-slate-500 max-w-md mx-auto mb-6">Buat prosedur standar operasional (SOP) agar pengujian berjalan konsisten dan terstandarisasi.</p>
                 <button onClick={handleCreateNew} className="text-uii-blue font-bold hover:underline">Buat Template Pertama</button>
             </div>
          )}
      </div>
    </div>
  );
};
