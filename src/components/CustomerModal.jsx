import { useState } from 'react';
import { X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/database';

export default function CustomerModal({ customer, onClose, onSave }) {
  const [formData, setFormData] = useState({
    ad: customer?.ad || '',
    soyad: customer?.soyad || '',
    tc_kimlik: customer?.tc_kimlik || '',
    telefon: customer?.telefon || '',
    email: customer?.email || '',
    adres: customer?.adres || '',
    dogum_tarihi: customer?.dogum_tarihi || '',
    meslek: customer?.meslek || '',
    parent_id: customer?.parent_id || null,
    notlar: customer?.notlar || ''
  });

  // Referans için müşteri listesi
  const allCustomers = useLiveQuery(() => 
    db.customers.toArray()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // TC Kimlik kontrolü (varsa ve değiştiyse)
      if (formData.tc_kimlik) {
        const existingCustomer = await db.customers
          .where('tc_kimlik')
          .equals(formData.tc_kimlik)
          .first();
        
        if (existingCustomer && existingCustomer.id !== customer?.id) {
          alert('Bu TC Kimlik numarası zaten kayıtlı!');
          return;
        }
      }

      let customerId;
      if (customer) {
        await db.customers.update(customer.id, {
          ...formData,
          parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
          guncelleme_tarihi: new Date().toISOString()
        });
        customerId = customer.id;
      } else {
        customerId = await db.customers.add({
          ...formData,
          parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
          olusturma_tarihi: new Date().toISOString(),
          guncelleme_tarihi: new Date().toISOString()
        });
      }
      onSave(customerId);
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ad *</label>
              <input
                type="text"
                required
                value={formData.ad}
                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Soyad *</label>
              <input
                type="text"
                required
                value={formData.soyad}
                onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">TC Kimlik No</label>
              <input
                type="text"
                value={formData.tc_kimlik}
                onChange={(e) => setFormData({ ...formData, tc_kimlik: e.target.value })}
                className="input"
                placeholder="11 haneli TC No"
                maxLength="11"
                pattern="[0-9]{11}"
              />
              <p className="text-xs text-gray-500 mt-1">11 haneli TC kimlik numarası</p>
            </div>
            <div>
              <label className="label">Telefon *</label>
              <input
                type="tel"
                required
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                className="input"
                placeholder="05XX XXX XX XX"
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Adres</label>
            <textarea
              value={formData.adres}
              onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
              className="input"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Doğum Tarihi</label>
              <input
                type="date"
                value={formData.dogum_tarihi}
                onChange={(e) => setFormData({ ...formData, dogum_tarihi: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Meslek</label>
              <input
                type="text"
                value={formData.meslek}
                onChange={(e) => setFormData({ ...formData, meslek: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Referans (Kim Getirdi?)</label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              className="input"
            >
              <option value="">Referans yok</option>
              {allCustomers?.filter(c => c.id !== customer?.id).map(c => (
                <option key={c.id} value={c.id}>
                  {c.ad} {c.soyad} - {c.telefon}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Bu müşteriyi hangi müşteri getirdi?
            </p>
          </div>

          <div>
            <label className="label">Notlar</label>
            <textarea
              value={formData.notlar}
              onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
              className="input"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {customer ? 'Güncelle' : 'Kaydet'}
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
