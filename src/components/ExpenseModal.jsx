import { useState } from 'react';
import { X } from 'lucide-react';
import db from '../db/database';

export const EXPENSE_CATEGORIES = {
  magaza_alim: 'Mağaza Alımı (Ürün/Stok)',
  kira: 'Kira',
  fatura: 'Fatura (Elektrik/Su/İnternet)',
  personel: 'Personel',
  kargo: 'Kargo / Nakliye',
  diger: 'Diğer'
};

export default function ExpenseModal({ expense, onClose, onSave }) {
  const [formData, setFormData] = useState({
    tarih: expense?.tarih || new Date().toISOString().split('T')[0],
    aciklama: expense?.aciklama || '',
    kategori: expense?.kategori || 'magaza_alim',
    tutar: expense?.tutar || '',
    odeme_turu: expense?.odeme_turu || 'nakit'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tutar = parseFloat(formData.tutar) || 0;
    if (tutar <= 0) return alert('Tutar 0’dan büyük olmalı');
    if (!formData.aciklama.trim()) return alert('Açıklama girin (ör. "Mustang çerçeve alımı")');
    try {
      const payload = { ...formData, tutar };
      if (expense) {
        await db.expenses.update(expense.id, payload);
      } else {
        await db.expenses.add({ ...payload, olusturma_tarihi: new Date().toISOString() });
      }
      onSave();
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{expense ? 'Gider Düzenle' : 'Yeni Gider (Mağaza Gideri)'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Açıklama *</label>
            <input type="text" value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              className="input" placeholder="ör. Mustang çerçeve alımı, kira ödemesi..." autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kategori</label>
              <select value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} className="input">
                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tarih</label>
              <input type="date" value={formData.tarih} onChange={(e) => setFormData({ ...formData, tarih: e.target.value })} className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tutar ₺ *</label>
              <input type="number" step="0.01" value={formData.tutar}
                onChange={(e) => setFormData({ ...formData, tutar: e.target.value })} className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Ödeme Şekli</label>
              <select value={formData.odeme_turu} onChange={(e) => setFormData({ ...formData, odeme_turu: e.target.value })} className="input">
                <option value="nakit">💵 Nakit</option>
                <option value="kredi_karti">💳 Kredi Kartı</option>
                <option value="havale">🏦 Havale/EFT</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{expense ? 'Güncelle' : 'Gideri Kaydet'}</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
