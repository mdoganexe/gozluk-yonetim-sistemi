import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import db from '../db/database';

export const APPOINTMENT_TYPES = {
  muayene: 'Göz Muayenesi',
  teslim: 'Gözlük Teslim',
  hatirlatma: 'Hatırlatma',
  kontrol: 'Kontrol',
  diger: 'Diğer'
};

export default function AppointmentModal({ appointment, defaultCustomerId, onClose, onSave }) {
  const customers = useLiveQuery(() => db.customers.orderBy('ad').toArray());

  const [formData, setFormData] = useState({
    musteri_id: appointment?.musteri_id || defaultCustomerId || '',
    tarih: appointment?.tarih || '',
    saat: appointment?.saat || '',
    tip: appointment?.tip || 'muayene',
    aciklama: appointment?.aciklama || '',
    durum: appointment?.durum || 'bekliyor'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tarih) {
      alert('Lütfen tarih seçin');
      return;
    }
    try {
      const payload = {
        musteri_id: formData.musteri_id ? parseInt(formData.musteri_id) : null,
        tarih: formData.tarih,
        saat: formData.saat || '',
        tip: formData.tip,
        aciklama: formData.aciklama || '',
        durum: formData.durum
      };
      if (appointment) {
        await db.appointments.update(appointment.id, payload);
      } else {
        await db.appointments.add({ ...payload, olusturma_tarihi: new Date().toISOString() });
      }
      onSave();
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {appointment ? 'Randevu Düzenle' : 'Yeni Randevu / Hatırlatma'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Müşteri</label>
            <select
              value={formData.musteri_id}
              onChange={(e) => setFormData({ ...formData, musteri_id: e.target.value })}
              className="input"
            >
              <option value="">Müşteri yok (genel hatırlatma)</option>
              {customers?.map(c => (
                <option key={c.id} value={c.id}>
                  {c.ad} {c.soyad} - {c.telefon}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="label">Saat</label>
              <input
                type="time"
                value={formData.saat}
                onChange={(e) => setFormData({ ...formData, saat: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Tip *</label>
            <select
              value={formData.tip}
              onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
              className="input"
            >
              {Object.entries(APPOINTMENT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Açıklama</label>
            <textarea
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              className="input"
              rows="2"
              placeholder="Not / detay..."
            />
          </div>

          {appointment && (
            <div>
              <label className="label">Durum</label>
              <select
                value={formData.durum}
                onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                className="input"
              >
                <option value="bekliyor">Bekliyor</option>
                <option value="tamamlandi">Tamamlandı</option>
                <option value="iptal">İptal</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {appointment ? 'Güncelle' : 'Kaydet'}
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
