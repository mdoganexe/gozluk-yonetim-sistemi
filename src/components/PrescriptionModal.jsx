import { useState } from 'react';
import { X } from 'lucide-react';
import db from '../db/database';

export default function PrescriptionModal({ customerId, prescription, onClose, onSave }) {
  const [formData, setFormData] = useState({
    tarih: prescription?.tarih || new Date().toISOString().split('T')[0],
    doktor_adi: prescription?.doktor_adi || '',
    hastane: prescription?.hastane || '',
    sag_sfera: prescription?.sag_sfera || '',
    sag_silindir: prescription?.sag_silindir || '',
    sag_aks: prescription?.sag_aks || '',
    sag_add: prescription?.sag_add || '',
    sag_prizma: prescription?.sag_prizma || '',
    sag_prizma_yon: prescription?.sag_prizma_yon || '',
    sol_sfera: prescription?.sol_sfera || '',
    sol_silindir: prescription?.sol_silindir || '',
    sol_aks: prescription?.sol_aks || '',
    sol_add: prescription?.sol_add || '',
    sol_prizma: prescription?.sol_prizma || '',
    sol_prizma_yon: prescription?.sol_prizma_yon || '',
    pd_uzak_sag: prescription?.pd_uzak_sag || '',
    pd_uzak_sol: prescription?.pd_uzak_sol || '',
    pd_yakin_sag: prescription?.pd_yakin_sag || '',
    pd_yakin_sol: prescription?.pd_yakin_sol || '',
    aktif: prescription?.aktif ?? true,
    notlar: prescription?.notlar || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.aktif) {
        await db.prescriptions
          .where('musteri_id')
          .equals(customerId)
          .modify({ aktif: false });
      }

      if (prescription) {
        await db.prescriptions.update(prescription.id, formData);
      } else {
        await db.prescriptions.add({
          ...formData,
          musteri_id: customerId
        });
      }
      onSave();
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {prescription ? 'Reçete Düzenle' : 'Yeni Reçete'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Genel Bilgiler */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Tarih *</label>
              <input
                type="date"
                required
                value={formData.tarih}
                onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Doktor Adı</label>
              <input
                type="text"
                value={formData.doktor_adi}
                onChange={(e) => setFormData({ ...formData, doktor_adi: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Hastane</label>
              <input
                type="text"
                value={formData.hastane}
                onChange={(e) => setFormData({ ...formData, hastane: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {/* Sağ Göz */}
          <div className="border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">SAĞ GÖZ</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="label">Sfera</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.sag_sfera}
                  onChange={(e) => setFormData({ ...formData, sag_sfera: e.target.value })}
                  className="input"
                  placeholder="+/-"
                />
              </div>
              <div>
                <label className="label">Silindir</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.sag_silindir}
                  onChange={(e) => setFormData({ ...formData, sag_silindir: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Aks (0-180)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={formData.sag_aks}
                  onChange={(e) => setFormData({ ...formData, sag_aks: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Add</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.sag_add}
                  onChange={(e) => setFormData({ ...formData, sag_add: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Sol Göz */}
          <div className="border-2 border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-green-700">SOL GÖZ</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="label">Sfera</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.sol_sfera}
                  onChange={(e) => setFormData({ ...formData, sol_sfera: e.target.value })}
                  className="input"
                  placeholder="+/-"
                />
              </div>
              <div>
                <label className="label">Silindir</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.sol_silindir}
                  onChange={(e) => setFormData({ ...formData, sol_silindir: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Aks (0-180)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={formData.sol_aks}
                  onChange={(e) => setFormData({ ...formData, sol_aks: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Add</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.sol_add}
                  onChange={(e) => setFormData({ ...formData, sol_add: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* PD Mesafeleri */}
          <div className="border-2 border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-purple-700">Pupil Mesafeleri (PD)</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="label">Uzak Sağ</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.pd_uzak_sag}
                  onChange={(e) => setFormData({ ...formData, pd_uzak_sag: e.target.value })}
                  className="input"
                  placeholder="mm"
                />
              </div>
              <div>
                <label className="label">Uzak Sol</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.pd_uzak_sol}
                  onChange={(e) => setFormData({ ...formData, pd_uzak_sol: e.target.value })}
                  className="input"
                  placeholder="mm"
                />
              </div>
              <div>
                <label className="label">Yakın Sağ</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.pd_yakin_sag}
                  onChange={(e) => setFormData({ ...formData, pd_yakin_sag: e.target.value })}
                  className="input"
                  placeholder="mm"
                />
              </div>
              <div>
                <label className="label">Yakın Sol</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.pd_yakin_sol}
                  onChange={(e) => setFormData({ ...formData, pd_yakin_sol: e.target.value })}
                  className="input"
                  placeholder="mm"
                />
              </div>
            </div>
          </div>

          {/* Notlar ve Aktif */}
          <div className="space-y-4">
            <div>
              <label className="label">Notlar</label>
              <textarea
                value={formData.notlar}
                onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
                className="input"
                rows="2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aktif"
                checked={formData.aktif}
                onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="aktif" className="text-sm font-medium">
                Bu reçeteyi aktif reçete olarak işaretle
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {prescription ? 'Güncelle' : 'Kaydet'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
