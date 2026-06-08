import { useState } from 'react';
import { X, Sparkles, ScanLine } from 'lucide-react';
import db from '../db/database';
import { generateBarcode } from '../utils/productCode';
import BarcodeScanner from './BarcodeScanner';
import { brandsForCategory, modelsForBrand } from '../data/eyewearBrands';

export default function ProductModal({ product, onClose, onSave }) {
  const [scanning, setScanning] = useState(false);
  const [formData, setFormData] = useState({
    barkod: product?.barkod || '',
    sku: product?.sku || '',
    marka: product?.marka || '',
    model: product?.model || '',
    kategori: product?.kategori || 'çerçeve',
    alt_kategori: product?.alt_kategori || '',
    cerceve_beden_lens: product?.cerceve_beden_lens || '',
    cerceve_beden_kopru: product?.cerceve_beden_kopru || '',
    cerceve_beden_sap: product?.cerceve_beden_sap || '',
    cerceve_malzeme: product?.cerceve_malzeme || '',
    renk: product?.renk || '',
    cinsiyet: product?.cinsiyet || 'unisex',
    alis_fiyati: product?.alis_fiyati || '',
    satis_fiyati: product?.satis_fiyati || '',
    kdv_orani: product?.kdv_orani || 20,
    stok_adedi: product?.stok_adedi || 0,
    min_stok_uyari: product?.min_stok_uyari || 5,
    raf_konumu: product?.raf_konumu || '',
    aktif: product?.aktif ?? true,
    notlar: product?.notlar || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Barkod tekrar kontrolü (aynı kod başka üründe varsa uyar)
      if (formData.barkod && String(formData.barkod).trim()) {
        const code = String(formData.barkod).trim();
        const existing = await db.products.where('barkod').equals(code).first();
        if (existing && existing.id !== product?.id) {
          alert(`Bu barkod zaten kayıtlı: ${existing.marka} ${existing.model}. Farklı bir kod kullanın.`);
          return;
        }
      }

      // Sayısal alanları string olarak kaydetme (stok hesaplamaları bozulmasın)
      const payload = {
        ...formData,
        alis_fiyati: parseFloat(formData.alis_fiyati) || 0,
        satis_fiyati: parseFloat(formData.satis_fiyati) || 0,
        kdv_orani: parseFloat(formData.kdv_orani) || 0,
        stok_adedi: parseInt(formData.stok_adedi) || 0,
        min_stok_uyari: parseInt(formData.min_stok_uyari) || 0
      };
      if (product) {
        await db.products.update(product.id, payload);
      } else {
        await db.products.add(payload);
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
            {product ? 'Ürün Düzenle' : 'Yeni Ürün'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Temel Bilgiler */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Temel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Marka *</label>
                <input
                  type="text"
                  required
                  list="marka-onerileri"
                  value={formData.marka}
                  onChange={(e) => setFormData({ ...formData, marka: e.target.value })}
                  className="input"
                  placeholder="Yazın veya listeden seçin"
                  autoComplete="off"
                />
                <datalist id="marka-onerileri">
                  {brandsForCategory(formData.kategori).map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <label className="label">Model *</label>
                <input
                  type="text"
                  required
                  list="model-onerileri"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="input"
                  placeholder="Yazın veya listeden seçin"
                  autoComplete="off"
                />
                <datalist id="model-onerileri">
                  {modelsForBrand(formData.marka).map(m => <option key={m} value={m} />)}
                </datalist>
              </div>
              <div>
                <label className="label">Barkod</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.barkod}
                    onChange={(e) => setFormData({ ...formData, barkod: e.target.value })}
                    className="input"
                    placeholder="Ürünün üzerindeki kodu okutun veya yazın"
                  />
                  <button
                    type="button"
                    onClick={() => setScanning(true)}
                    title="Ürünün üzerindeki QR/barkodu okut"
                    className="btn-primary px-3 flex items-center gap-1 whitespace-nowrap"
                  >
                    <ScanLine className="w-4 h-4" /> Tara
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, barkod: generateBarcode() })}
                    title="Barkod yoksa otomatik üret"
                    className="btn-secondary px-3 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" /> Üret
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ürünün üzerindeki hazır QR/barkodu "Tara" ile okutup kaydedebilirsiniz.
                </p>
              </div>
              <div>
                <label className="label">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Kategori *</label>
                <select
                  required
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="input"
                >
                  <option value="çerçeve">Çerçeve</option>
                  <option value="güneşlik">Güneşlik</option>
                  <option value="aksesuar">Aksesuar</option>
                  <option value="cam_stok">Cam (Stok)</option>
                </select>
              </div>
              <div>
                <label className="label">Renk</label>
                <input
                  type="text"
                  value={formData.renk}
                  onChange={(e) => setFormData({ ...formData, renk: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Çerçeve Özellikleri */}
          {(formData.kategori === 'çerçeve' || formData.kategori === 'güneşlik') && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Çerçeve Özellikleri</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="label">Lens (mm)</label>
                  <input
                    type="number"
                    value={formData.cerceve_beden_lens}
                    onChange={(e) => setFormData({ ...formData, cerceve_beden_lens: e.target.value })}
                    className="input"
                    placeholder="48, 50, 52..."
                  />
                </div>
                <div>
                  <label className="label">Köprü (mm)</label>
                  <input
                    type="number"
                    value={formData.cerceve_beden_kopru}
                    onChange={(e) => setFormData({ ...formData, cerceve_beden_kopru: e.target.value })}
                    className="input"
                    placeholder="18, 20..."
                  />
                </div>
                <div>
                  <label className="label">Sap (mm)</label>
                  <input
                    type="number"
                    value={formData.cerceve_beden_sap}
                    onChange={(e) => setFormData({ ...formData, cerceve_beden_sap: e.target.value })}
                    className="input"
                    placeholder="135, 140..."
                  />
                </div>
                <div>
                  <label className="label">Cinsiyet</label>
                  <select
                    value={formData.cinsiyet}
                    onChange={(e) => setFormData({ ...formData, cinsiyet: e.target.value })}
                    className="input"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="erkek">Erkek</option>
                    <option value="kadın">Kadın</option>
                    <option value="çocuk">Çocuk</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Malzeme</label>
                <input
                  type="text"
                  value={formData.cerceve_malzeme}
                  onChange={(e) => setFormData({ ...formData, cerceve_malzeme: e.target.value })}
                  className="input"
                  placeholder="Metal, Plastik, Titanyum..."
                />
              </div>
            </div>
          )}

          {/* Fiyat ve Stok */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">Fiyat ve Stok</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Alış Fiyatı</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.alis_fiyati}
                  onChange={(e) => setFormData({ ...formData, alis_fiyati: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Satış Fiyatı *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.satis_fiyati}
                  onChange={(e) => setFormData({ ...formData, satis_fiyati: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">KDV Oranı (%)</label>
                <select
                  value={formData.kdv_orani}
                  onChange={(e) => setFormData({ ...formData, kdv_orani: e.target.value })}
                  className="input"
                >
                  <option value="0">0</option>
                  <option value="8">8</option>
                  <option value="18">18</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div>
                <label className="label">Stok Adedi *</label>
                <input
                  type="number"
                  required
                  value={formData.stok_adedi}
                  onChange={(e) => setFormData({ ...formData, stok_adedi: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Min. Stok Uyarı</label>
                <input
                  type="number"
                  value={formData.min_stok_uyari}
                  onChange={(e) => setFormData({ ...formData, min_stok_uyari: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Raf Konumu</label>
                <input
                  type="text"
                  value={formData.raf_konumu}
                  onChange={(e) => setFormData({ ...formData, raf_konumu: e.target.value })}
                  className="input"
                  placeholder="A3, B12..."
                />
              </div>
            </div>
          </div>

          {/* Notlar */}
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
              Ürün aktif
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {product ? 'Güncelle' : 'Kaydet'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              İptal
            </button>
          </div>
        </form>
      </div>

      {scanning && (
        <BarcodeScanner
          onScan={(code) => { setFormData(prev => ({ ...prev, barkod: code })); setScanning(false); }}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}
