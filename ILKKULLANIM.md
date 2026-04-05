# 🎯 İlk Kullanım Rehberi

## Neden Hesap Oluşturma Ekranı Açılıyor?

Sistem şu durumlarda otomatik olarak "İlk Kurulum" moduna geçer:

1. **İlk kez çalıştırıldığında** - Hiç kullanıcı yok
2. **Veritabanı sıfırlandığında** - Tüm veriler temizlendi
3. **Tarayıcı önbelleği temizlendiğinde** - Kullanıcı bilgileri silindi

Bu **güvenlik özelliğidir** - Sisteme erişmek için mutlaka bir hesap gerekir.

## 🚀 İlk Kurulum Adımları

### 1. Yönetici Hesabı Oluşturun

Karşınıza gelen formda:

```
Ad Soyad: Mehmet Doğan
Email: mehmet@optikpro.com
Kullanıcı Adı: admin
Şifre: admin123 (veya güçlü bir şifre)
```

### 2. Hesap Oluştur Butonuna Tıklayın

- Hesap otomatik oluşturulur
- Otomatik giriş yapılır
- Dashboard açılır

### 3. Sistemi Kullanmaya Başlayın

Artık tüm özelliklere erişebilirsiniz!

## 🔄 Sonraki Girişler

İlk kurulumdan sonra:

1. Tarayıcıyı açın: http://localhost:3000
2. **Giriş Yap** ekranı açılır (artık kayıt değil!)
3. Kullanıcı adı ve şifrenizi girin
4. Giriş yapın

## 🎭 Giriş vs Kayıt Ekranı

### İlk Kurulum (Hiç Kullanıcı Yok)
```
┌─────────────────────────────┐
│ 🎉 Hoş Geldiniz!            │
│ İlk kurulum yapılıyor       │
│                             │
│ [Hesap Oluşturma Formu]     │
│ - Ad Soyad                  │
│ - Email                     │
│ - Kullanıcı Adı             │
│ - Şifre                     │
│                             │
│ [Hesap Oluştur]             │
└─────────────────────────────┘
```

### Normal Giriş (Kullanıcı Var)
```
┌─────────────────────────────┐
│ Giriş Yap                   │
│                             │
│ [Giriş Formu]               │
│ - Kullanıcı Adı             │
│ - Şifre                     │
│                             │
│ [Giriş Yap]                 │
│                             │
│ Hesabınız yok mu?           │
│ [Kayıt Olun]                │
└─────────────────────────────┘
```

## 🔐 Güvenlik Özellikleri

### Şifre Gereksinimleri
- Minimum 6 karakter
- Büyük/küçük harf önerilir
- Sayı ve özel karakter önerilir

### Oturum Yönetimi
- Giriş yaptıktan sonra oturum açık kalır
- Tarayıcı kapatılsa bile oturum devam eder
- Çıkış yapmak için: Sidebar → Çıkış Yap

### Güvenli Şifre Örnekleri
```
❌ Zayıf: 123456, admin, password
✅ Güçlü: Admin@2026, Optik!Pro123, Gozluk#2026
```

## 🆘 Sık Sorulan Sorular

### S: Neden sürekli hesap oluşturma ekranı açılıyor?

**C:** İki sebep olabilir:

1. **Veritabanı temizlendi:**
   - Tarayıcı önbelleği temizlendi
   - IndexedDB silindi
   - Gizli mod kullanılıyor

2. **Çözüm:**
   - Normal modda açın (gizli mod değil)
   - Hesap oluşturun
   - Bir daha açılmayacak

### S: Şifremi unuttum, ne yapmalıyım?

**C:** Şu anda şifre sıfırlama özelliği yok. İki seçenek:

1. **Veritabanını sıfırlayın:**
   - http://localhost:3000/reset-db.html
   - Yeni hesap oluşturun
   - ⚠️ Tüm veriler silinir!

2. **Yedekten geri yükleyin:**
   - Önce yedek aldıysanız
   - Veritabanını sıfırlayın
   - Yeni hesap oluşturun
   - Yedekten verileri geri yükleyin

### S: Birden fazla kullanıcı oluşturabilir miyim?

**C:** Evet! 

1. Giriş yaptıktan sonra
2. Çıkış yapın
3. Login ekranında "Kayıt Olun" tıklayın
4. Yeni hesap oluşturun

### S: Kullanıcı silme özelliği var mı?

**C:** Şu anda yok. Gelecek versiyonda eklenecek.

## 📊 Kullanıcı Durumları

```
Durum 1: İlk Kurulum
├── Veritabanı: Boş
├── Kullanıcı: Yok
└── Ekran: Hesap Oluşturma (zorunlu)

Durum 2: Normal Kullanım
├── Veritabanı: Dolu
├── Kullanıcı: Var
├── Oturum: Kapalı
└── Ekran: Giriş Yap

Durum 3: Aktif Oturum
├── Veritabanı: Dolu
├── Kullanıcı: Var
├── Oturum: Açık
└── Ekran: Dashboard (otomatik yönlendirme)
```

## 🎯 Önerilen İlk Adımlar

Hesap oluşturduktan sonra:

1. **Firma Bilgilerini Girin**
   - Ayarlar → Firma Bilgileri
   - Fiş başlığında görünecek

2. **İlk Müşteriyi Ekleyin**
   - Müşteriler → Yeni Müşteri
   - Test verisi oluşturun

3. **İlk Ürünü Ekleyin**
   - Stok → Yeni Ürün
   - Örnek çerçeve ekleyin

4. **İlk Siparişi Oluşturun**
   - Siparişler → Yeni Sipariş
   - Sistemi test edin

5. **Yedek Alın**
   - Ayarlar → Verileri Dışa Aktar
   - Güvenli bir yere kaydedin

## 💡 İpuçları

### Geliştirme Ortamında
- Her veritabanı sıfırlamada yeni hesap gerekir
- Test için hızlı şifre kullanın: `admin123`
- Yedek almayı unutmayın

### Production Ortamında
- Güçlü şifre kullanın
- Email adresini doğru girin
- Şifreyi güvenli yerde saklayın
- Düzenli yedek alın

## 🔄 Veritabanı Sıfırlama Sonrası

Veritabanını sıfırladıysanız:

```
1. Login ekranı açılır
2. "İlk Kurulum" mesajı görünür
3. Yeni hesap oluşturun
4. Otomatik giriş yapılır
5. Eski verileri geri yükleyin (varsa)
```

## ✅ Başarı Kontrolü

Sistem düzgün çalışıyorsa:

- ✅ İlk açılışta hesap oluşturma ekranı
- ✅ Hesap oluşturulabiliyor
- ✅ Otomatik giriş yapılıyor
- ✅ Dashboard açılıyor
- ✅ Çıkış yapılabiliyor
- ✅ Tekrar giriş yapılabiliyor

---

**Önemli:** Bu davranış normal ve güvenlik için gereklidir. 
Sisteme erişmek için mutlaka bir kullanıcı hesabı olmalıdır.
