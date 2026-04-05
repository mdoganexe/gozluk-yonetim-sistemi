import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Glasses, Lock, User, Mail, UserPlus } from 'lucide-react';
import { login, createUser, hasUsers, isAuthenticated } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: ''
  });

  useEffect(() => {
    // Zaten giriş yapmışsa dashboard'a yönlendir
    if (isAuthenticated()) {
      navigate('/');
      return;
    }

    // İlk kurulum gerekli mi kontrol et
    checkSetup();
  }, [navigate]);

  const checkSetup = async () => {
    const hasUser = await hasUsers();
    if (!hasUser) {
      setNeedsSetup(true);
      setIsRegister(true);
    } else {
      setNeedsSetup(false);
      setIsRegister(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Kayıt ol
        if (!formData.fullName || !formData.email) {
          throw new Error('Lütfen tüm alanları doldurun');
        }
        await createUser(formData.username, formData.password, formData.email, formData.fullName);
        
        // Otomatik giriş yap
        await login(formData.username, formData.password);
        navigate('/');
      } else {
        // Giriş yap
        await login(formData.username, formData.password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <Glasses className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">OptikPro</h1>
          <p className="text-primary-100">Gözlük Yönetim Sistemi</p>
        </div>

        {/* Form Kartı */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {needsSetup && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>🎉 Hoş Geldiniz!</strong> Sisteme ilk kez giriş yapıyorsunuz. 
                Lütfen yönetici hesabınızı oluşturun.
              </p>
            </div>
          )}

          {!needsSetup && isRegister && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Yeni Hesap:</strong> Sisteme erişim için yeni bir hesap oluşturun.
              </p>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="label">Ad Soyad *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input pl-10"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input pl-10"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="label">Kullanıcı Adı *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input pl-10"
                  placeholder="kullaniciadi"
                />
              </div>
            </div>

            <div>
              <label className="label">Şifre *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              {isRegister && (
                <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Lütfen bekleyin...' : (isRegister ? 'Hesap Oluştur' : 'Giriş Yap')}
            </button>
          </form>

          {!needsSetup && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setFormData({
                    username: '',
                    password: '',
                    email: '',
                    fullName: ''
                  });
                }}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
              </button>
            </div>
          )}

          {needsSetup && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                İlk kurulum tamamlandıktan sonra giriş yapabileceksiniz.
              </p>
            </div>
          )}

          {!needsSetup && !isRegister && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center mb-2">
                <strong>💡 İpucu:</strong> Veritabanını yeni sıfırladıysanız, yeni bir hesap oluşturmanız gerekir.
              </p>
              <button
                onClick={() => setIsRegister(true)}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Yeni Hesap Oluştur →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-primary-100 text-sm">
          <p>© 2026 OptikPro. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
