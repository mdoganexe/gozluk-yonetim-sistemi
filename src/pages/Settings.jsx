import { useState, useEffect } from 'react';
import { Download, Upload, Database, Save } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { exportData, importData } from '../db/database';

export default function Settings() {
  const [importing, setImporting] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'OptikPro',
    companySlogan: 'Gözlük ve Optik Ürünler',
    companyPhone: '0XXX XXX XX XX',
    companyAddress: 'Adres Bilgisi',
    companyTaxNo: 'XXXXXXXXXX',
    companyEmail: 'info@optikpro.com'
  });
  const [saving, setSaving] = useState(false);

  // Ayarları yükle
  const settings = useLiveQuery(() => db.settings.toArray());

  useEffect(() => {
    if (settings) {
      const settingsObj = {};
      settings.forEach(s => {
        settingsObj[s.key] = s.value;
      });
      if (Object.keys(settingsObj).length > 0) {
        setCompanyInfo(prev => ({ ...prev, ...settingsObj }));
      }
    }
  }, [settings]);

  const handleSaveCompanyInfo = async () => {
    setSaving(true);
    try {
      // Her ayarı ayrı ayrı kaydet
      for (const [key, value] of Object.entries(companyInfo)) {
        const existing = await db.settings.where('key').equals(key).first();
        if (existing) {
          await db.settings.update(existing.id, { value });
        } else {
          await db.settings.add({ key, value });
        }
      }
      alert('Firma bilgileri başarıyla kaydedildi');
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportData();
      alert('Veriler başarıyla dışa aktarıldı');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('Mevcut tüm veriler silinecek ve yedekten geri yüklenecek. Emin misiniz?')) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    try {
      await importData(file);
      alert('Veriler başarıyla içe aktarıldı');
      window.location.reload();
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>

      {/* Firma Bilgileri */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Firma Bilgileri</h2>
        <p className="text-sm text-gray-600 mb-4">
          Bu bilgiler sipariş formlarında ve yazdırma çıktılarında görünecektir.
        </p>
        <div className="space-y-4">
          <div>
            <label className="label">Firma Adı *</label>
            <input
              type="text"
              className="input"
              value={companyInfo.companyName}
              onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
              placeholder="OptikPro"
            />
          </div>
          <div>
            <label className="label">Slogan</label>
            <input
              type="text"
              className="input"
              value={companyInfo.companySlogan}
              onChange={(e) => setCompanyInfo({ ...companyInfo, companySlogan: e.target.value })}
              placeholder="Gözlük ve Optik Ürünler"
            />
          </div>
          <div>
            <label className="label">Adres *</label>
            <textarea
              className="input"
              rows="2"
              value={companyInfo.companyAddress}
              onChange={(e) => setCompanyInfo({ ...companyInfo, companyAddress: e.target.value })}
              placeholder="Firma adresi..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Telefon *</label>
              <input
                type="tel"
                className="input"
                value={companyInfo.companyPhone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyPhone: e.target.value })}
                placeholder="0XXX XXX XX XX"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={companyInfo.companyEmail}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyEmail: e.target.value })}
                placeholder="info@optikpro.com"
              />
            </div>
          </div>
          <div>
            <label className="label">Vergi No *</label>
            <input
              type="text"
              className="input"
              value={companyInfo.companyTaxNo}
              onChange={(e) => setCompanyInfo({ ...companyInfo, companyTaxNo: e.target.value })}
              placeholder="XXXXXXXXXX"
            />
          </div>
          <button
            onClick={handleSaveCompanyInfo}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Yedekleme */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="w-6 h-6" />
          Veri Yönetimi
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Yedekleme</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tüm verilerinizi JSON formatında bilgisayarınıza indirin. Bu dosyayı güvenli bir yerde saklayın.
            </p>
            <button
              onClick={handleExport}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Verileri Dışa Aktar
            </button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Geri Yükleme</h3>
            <p className="text-sm text-gray-600 mb-3">
              Daha önce aldığınız yedek dosyasını yükleyerek verilerinizi geri yükleyin.
              <span className="text-red-600 font-medium"> Dikkat: Mevcut tüm veriler silinecektir!</span>
            </p>
            <label className="btn-secondary flex items-center gap-2 cursor-pointer inline-flex">
              <Upload className="w-5 h-5" />
              {importing ? 'Yükleniyor...' : 'Verileri İçe Aktar'}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2 text-red-600">Veritabanını Sıfırla</h3>
            <p className="text-sm text-gray-600 mb-3">
              Veritabanı hatası alıyorsanız veya temiz bir başlangıç yapmak istiyorsanız bu butonu kullanın.
              <span className="text-red-600 font-medium"> Tüm veriler silinecektir!</span>
            </p>
            <a
              href="/reset-db.html"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Database className="w-5 h-5" />
              Veritabanını Sıfırla
            </a>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2 text-orange-600">Otomatik Yedekleme Önerisi</h3>
            <p className="text-sm text-gray-600">
              Verilerinizin güvenliği için her gün sonunda yedek almanızı öneririz. 
              Yedek dosyalarını bulut depolama (Google Drive, Dropbox vb.) veya harici disk gibi 
              güvenli bir yerde saklayın.
            </p>
          </div>
        </div>
      </div>

      {/* Sistem Bilgisi */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Sistem Bilgisi</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Versiyon:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Veritabanı:</span>
            <span className="font-medium">IndexedDB (Dexie.js)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tarayıcı Depolama:</span>
            <span className="font-medium">Yerel (Offline Çalışır)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
