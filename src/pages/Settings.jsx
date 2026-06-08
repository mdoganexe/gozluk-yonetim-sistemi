import { useState, useEffect } from 'react';
import { Download, Upload, Database, Save, Users, UserPlus, Trash2, KeyRound } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { exportData, importData } from '../db/database';
import { createUser, deleteUser, updatePassword, getCurrentUser } from '../utils/auth';

export default function Settings() {
  const [importing, setImporting] = useState(false);
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const usersRaw = useLiveQuery(() => db.users.toArray());
  const [newUser, setNewUser] = useState({ username: '', fullName: '', password: '', role: 'personel' });

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser.username, newUser.password, '', newUser.fullName, newUser.role);
      setNewUser({ username: '', fullName: '', password: '', role: 'personel' });
      alert('Kullanıcı eklendi');
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Bu kullanıcı silinsin mi?')) return;
    try { await deleteUser(id); } catch (err) { alert('Hata: ' + err.message); }
  };

  const handleResetPassword = async (id, username) => {
    const np = prompt(`"${username}" için yeni şifre (en az 4 karakter):`);
    if (!np) return;
    try { await updatePassword(id, np); alert('Şifre güncellendi'); } catch (err) { alert('Hata: ' + err.message); }
  };
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'OptikPro',
    companySlogan: 'Gözlük ve Optik Ürünler',
    companyPhone: '0XXX XXX XX XX',
    companyAddress: 'Adres Bilgisi',
    companyTaxNo: 'XXXXXXXXXX',
    companyEmail: 'info@optikpro.com',
    kdvOrani: 20
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
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="label">Varsayılan KDV Oranı (%)</label>
              <select
                className="input"
                value={companyInfo.kdvOrani}
                onChange={(e) => setCompanyInfo({ ...companyInfo, kdvOrani: parseFloat(e.target.value) })}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="8">8</option>
                <option value="10">10</option>
                <option value="18">18</option>
                <option value="20">20</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Yeni siparişlerde uygulanacak KDV oranı.</p>
            </div>
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
            <h3 className="font-medium mb-2 text-orange-600">Yedekleme Önerisi</h3>
            <p className="text-sm text-gray-600">
              Tüm veriler sunucudaki <code className="font-mono">optikpro-data.json</code> dosyasında tutulur
              (OptikPro.exe ile aynı klasörde). Düzenli olarak "Dışa Aktar" ile yedek alın veya bu dosyayı
              güvenli bir yere (bulut/harici disk) kopyalayın.
            </p>
          </div>
        </div>
      </div>

      {/* Kullanıcı Yönetimi */}
      {isAdmin && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" /> Kullanıcı Yönetimi
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Personel hesapları ekleyin; bu kullanıcılar kendi kullanıcı adı/şifresiyle giriş yapar.
          </p>

          {/* Mevcut kullanıcılar */}
          <div className="space-y-2 mb-6">
            {usersRaw?.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{u.fullName || u.username}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">{u.role}</span>
                  </p>
                  <p className="text-sm text-gray-600">@{u.username}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleResetPassword(u.id, u.username)} title="Şifre sıfırla"
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                    <KeyRound className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteUser(u.id)} title="Sil"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {(!usersRaw || usersRaw.length === 0) && (
              <p className="text-sm text-gray-500">Henüz kullanıcı yok</p>
            )}
          </div>

          {/* Yeni kullanıcı */}
          <form onSubmit={handleAddUser} className="border-t pt-4">
            <h3 className="font-medium mb-3 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Yeni Kullanıcı</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Ad Soyad</label>
                <input type="text" className="input" value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} placeholder="Ahmet Yılmaz" />
              </div>
              <div>
                <label className="label">Kullanıcı Adı *</label>
                <input type="text" className="input" value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} placeholder="ahmet" autoComplete="off" />
              </div>
              <div>
                <label className="label">Şifre * (en az 4)</label>
                <input type="text" className="input" value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••" autoComplete="off" />
              </div>
              <div>
                <label className="label">Rol</label>
                <select className="input" value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="personel">Personel</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2 mt-4">
              <UserPlus className="w-5 h-5" /> Kullanıcı Ekle
            </button>
          </form>
        </div>
      )}

      {/* Sistem Bilgisi */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Sistem Bilgisi</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Versiyon:</span>
            <span className="font-medium">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Veritabanı:</span>
            <span className="font-medium">Ortak Sunucu (JSON)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Erişim:</span>
            <span className="font-medium">Ağ üzerinden çok cihaz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
