import { useState } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Eye, Glasses } from 'lucide-react';
import db from '../db/database';
import { CONTACT_LENS_BRANDS } from '../data/eyewearBrands';
import { fileToCompressedDataUrl } from '../utils/image';
import { useImageViewer } from './ImageViewer';

export default function PrescriptionModal({ customerId, prescription, initialType, onClose, onSave }) {
  const { openImages } = useImageViewer();
  const [tip, setTip] = useState(prescription?.recete_tipi || initialType || 'optik');
  const [uploading, setUploading] = useState(false);
  const [gorseller, setGorseller] = useState(prescription?.gorseller || []);
  const [formData, setFormData] = useState({
    tarih: prescription?.tarih || new Date().toISOString().split('T')[0],
    doktor_adi: prescription?.doktor_adi || '',
    hastane: prescription?.hastane || '',
    lens_marka: prescription?.lens_marka || '',
    sag_sfera: prescription?.sag_sfera || '',
    sag_silindir: prescription?.sag_silindir || '',
    sag_aks: prescription?.sag_aks || '',
    sag_add: prescription?.sag_add || '',
    sag_bc: prescription?.sag_bc || '',
    sag_dia: prescription?.sag_dia || '',
    sol_sfera: prescription?.sol_sfera || '',
    sol_silindir: prescription?.sol_silindir || '',
    sol_aks: prescription?.sol_aks || '',
    sol_add: prescription?.sol_add || '',
    sol_bc: prescription?.sol_bc || '',
    sol_dia: prescription?.sol_dia || '',
    pd_uzak_sag: prescription?.pd_uzak_sag || '',
    pd_uzak_sol: prescription?.pd_uzak_sol || '',
    pd_yakin_sag: prescription?.pd_yakin_sag || '',
    pd_yakin_sol: prescription?.pd_yakin_sol || '',
    aktif: prescription?.aktif ?? true,
    notlar: prescription?.notlar || ''
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const yeni = [];
      for (const file of files) {
        const dataUrl = await fileToCompressedDataUrl(file);
        yeni.push({ name: file.name, dataUrl });
      }
      setGorseller(prev => [...prev, ...yeni]);
    } catch {
      alert('Görsel yüklenemedi');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx) => setGorseller(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, recete_tipi: tip, gorseller };

      if (formData.aktif) {
        await db.prescriptions.where('musteri_id').equals(customerId).modify({ aktif: false });
      }
      if (prescription) {
        await db.prescriptions.update(prescription.id, payload);
      } else {
        await db.prescriptions.add({ ...payload, musteri_id: customerId });
      }
      onSave();
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const isLens = tip === 'lens';

  // Bir göz için alan grubu render eder
  const EyeFields = ({ side, label, color }) => (
    <div className={`border-2 ${color} rounded-lg p-4`}>
      <h3 className="font-semibold text-lg mb-3">{label}</h3>
      <div className={`grid ${isLens ? 'grid-cols-5' : 'grid-cols-4'} gap-3`}>
        <div>
          <label className="label">{isLens ? 'SPH (Numara)' : 'Sfera'}</label>
          <input type="number" step="0.25" value={formData[`${side}_sfera`]}
            onChange={(e) => set(`${side}_sfera`, e.target.value)} className="input" placeholder="+/-" />
        </div>
        <div>
          <label className="label">{isLens ? 'CYL' : 'Silindir'}</label>
          <input type="number" step="0.25" value={formData[`${side}_silindir`]}
            onChange={(e) => set(`${side}_silindir`, e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">{isLens ? 'AXIS' : 'Aks (0-180)'}</label>
          <input type="number" min="0" max="180" value={formData[`${side}_aks`]}
            onChange={(e) => set(`${side}_aks`, e.target.value)} className="input" />
        </div>
        {isLens ? (
          <>
            <div>
              <label className="label">BC (Eğrilik)</label>
              <input type="number" step="0.1" value={formData[`${side}_bc`]}
                onChange={(e) => set(`${side}_bc`, e.target.value)} className="input" placeholder="8.6" />
            </div>
            <div>
              <label className="label">DIA (Çap)</label>
              <input type="number" step="0.1" value={formData[`${side}_dia`]}
                onChange={(e) => set(`${side}_dia`, e.target.value)} className="input" placeholder="14.2" />
            </div>
          </>
        ) : (
          <div>
            <label className="label">Add</label>
            <input type="number" step="0.25" value={formData[`${side}_add`]}
              onChange={(e) => set(`${side}_add`, e.target.value)} className="input" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold">
            {prescription ? 'Reçete Düzenle' : 'Yeni Reçete'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Reçete Tipi */}
          <div>
            <label className="label">Reçete Tipi</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setTip('optik')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 font-medium transition-all ${
                  tip === 'optik' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                }`}>
                <Glasses className="w-5 h-5" /> Optik (Gözlük) Reçetesi
              </button>
              <button type="button" onClick={() => setTip('lens')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 font-medium transition-all ${
                  tip === 'lens' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'
                }`}>
                <Eye className="w-5 h-5" /> Lens (Kontakt) Reçetesi
              </button>
            </div>
          </div>

          {/* Genel Bilgiler */}
          <div className={`grid ${isLens ? 'grid-cols-4' : 'grid-cols-3'} gap-4`}>
            <div>
              <label className="label">Tarih *</label>
              <input type="date" required value={formData.tarih}
                onChange={(e) => set('tarih', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Doktor Adı</label>
              <input type="text" value={formData.doktor_adi}
                onChange={(e) => set('doktor_adi', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Hastane</label>
              <input type="text" value={formData.hastane}
                onChange={(e) => set('hastane', e.target.value)} className="input" />
            </div>
            {isLens && (
              <div>
                <label className="label">Lens Markası</label>
                <input type="text" value={formData.lens_marka} list="lens-marka-onerileri"
                  onChange={(e) => set('lens_marka', e.target.value)} className="input" placeholder="Acuvue, Biofinity..." autoComplete="off" />
                <datalist id="lens-marka-onerileri">
                  {CONTACT_LENS_BRANDS.map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
            )}
          </div>

          <EyeFields side="sag" label="SAĞ GÖZ" color="border-blue-200" />
          <EyeFields side="sol" label="SOL GÖZ" color="border-green-200" />

          {/* PD - sadece optik */}
          {!isLens && (
            <div className="border-2 border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-purple-700">Pupil Mesafeleri (PD)</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  ['pd_uzak_sag', 'Uzak Sağ'], ['pd_uzak_sol', 'Uzak Sol'],
                  ['pd_yakin_sag', 'Yakın Sağ'], ['pd_yakin_sol', 'Yakın Sol']
                ].map(([field, lbl]) => (
                  <div key={field}>
                    <label className="label">{lbl}</label>
                    <input type="number" step="0.5" value={formData[field]}
                      onChange={(e) => set(field, e.target.value)} className="input" placeholder="mm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Görseller */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-600" /> Reçete Görselleri
              </h3>
              <label className="btn-secondary text-sm flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading ? 'Yükleniyor...' : 'Görsel Ekle'}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Bilgisayardaki bir fotoğrafı veya tarayıcıdan taranmış reçete görselini ekleyebilirsiniz.
            </p>
            {gorseller.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {gorseller.map((g, idx) => (
                  <div key={idx} className="relative group">
                    <img src={g.dataUrl} alt={g.name} onClick={() => openImages(gorseller, idx)}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-zoom-in" />
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Henüz görsel eklenmedi</p>
            )}
          </div>

          {/* Notlar ve Aktif */}
          <div className="space-y-4">
            <div>
              <label className="label">Notlar</label>
              <textarea value={formData.notlar} onChange={(e) => set('notlar', e.target.value)} className="input" rows="2" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="aktif" checked={formData.aktif}
                onChange={(e) => set('aktif', e.target.checked)} className="w-4 h-4" />
              <label htmlFor="aktif" className="text-sm font-medium">
                Bu reçeteyi aktif reçete olarak işaretle
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {prescription ? 'Güncelle' : 'Kaydet'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
