# 🔧 Veritabanı Hatası Çözümü

## Hata Mesajı

```
Failed to execute 'transaction' on 'IDBDatabase': 
One of the specified object stores was not found.
```

## Neden Oluyor?

Bu hata, veritabanı şeması güncellendiğinde ama tarayıcınızdaki eski veritabanı yeni şemayla uyumsuz olduğunda ortaya çıkar.

Sistemimize yeni özellikler ekledik:
- ✅ Login sistemi (users tablosu)
- ✅ TC Kimlik alanı (customers tablosuna)
- ✅ Referans sistemi (parent_id alanı)

## 🚀 Hızlı Çözüm (3 Yöntem)

### Yöntem 1: Veritabanı Sıfırlama Sayfası (ÖNERİLEN)

1. Tarayıcınızda şu adresi açın:
   ```
   http://localhost:3000/reset-db.html
   ```

2. "Veritabanını Sıfırla" butonuna tıklayın

3. Onaylayın

4. Sayfa otomatik olarak yenilenecek

5. Login ekranı açılacak - yeni hesap oluşturun

### Yöntem 2: Tarayıcı Geliştirici Araçları

1. **F12** tuşuna basın (Geliştirici Araçları)

2. **Application** (veya Uygulama) sekmesine gidin

3. Sol menüden **IndexedDB** → **GozlukYonetimDB** bulun

4. Sağ tıklayın → **Delete database**

5. Sayfayı yenileyin (**F5**)

6. Login ekranı açılacak

### Yöntem 3: Tarayıcı Konsolundan

1. **F12** tuşuna basın

2. **Console** sekmesine gidin

3. Şu komutu yapıştırın ve Enter'a basın:
   ```javascript
   indexedDB.deleteDatabase('GozlukYonetimDB');
   localStorage.clear();
   location.reload();
   ```

4. Sayfa yenilenecek

## 📋 Adım Adım Görsel Rehber

### Chrome/Edge için:

```
1. F12 → Application
2. Storage → IndexedDB
3. GozlukYonetimDB → Sağ tık → Delete database
4. F5 (Yenile)
```

### Firefox için:

```
1. F12 → Storage
2. IndexedDB → GozlukYonetimDB
3. Sağ tık → Delete All
4. F5 (Yenile)
```

## ⚠️ Önemli Notlar

### Verilerinizi Kaybetmemek İçin

Eğer sistemde önemli verileriniz varsa:

1. **Önce yedek alın:**
   - Ayarlar → Verileri Dışa Aktar
   - JSON dosyasını kaydedin

2. **Veritabanını sıfırlayın** (yukarıdaki yöntemlerden biri)

3. **Giriş yapın** (yeni hesap oluşturun)

4. **Verileri geri yükleyin:**
   - Ayarlar → Verileri İçe Aktar
   - JSON dosyasını seçin

### İlk Kurulum Sonrası

Veritabanını sıfırladıktan sonra:

1. Login ekranı açılacak
2. "İlk Kurulum" mesajı göreceksiniz
3. Yönetici hesabınızı oluşturun:
   - Ad Soyad: [İsminiz]
   - Email: [Email'iniz]
   - Kullanıcı Adı: admin
   - Şifre: [Güçlü bir şifre]
4. Otomatik giriş yapılacak

## 🔄 Gelecekte Bu Hatayı Önlemek

### Otomatik Yedekleme

Her gün sonunda:
1. Ayarlar → Verileri Dışa Aktar
2. Dosyayı tarih ile kaydedin: `gozluk-yedek-2026-04-05.json`
3. Bulut depolamaya yükleyin (Google Drive, Dropbox)

### Güncelleme Öncesi

Sistem güncellemesi yapılacaksa:
1. Mutlaka yedek alın
2. Güncellemeyi yapın
3. Sorun çıkarsa yedekten geri yükleyin

## 🆘 Hala Çalışmıyor mu?

### Tarayıcı Önbelleğini Temizle

1. **Ctrl + Shift + Delete** (Windows)
2. "Önbelleği temizle" seçin
3. "Tüm zamanlar" seçin
4. Temizle

### Farklı Tarayıcı Dene

- Chrome çalışmıyorsa Firefox deneyin
- Edge çalışmıyorsa Chrome deneyin

### Gizli Mod Dene

1. **Ctrl + Shift + N** (Chrome/Edge)
2. **Ctrl + Shift + P** (Firefox)
3. Sistemi gizli modda açın
4. Test edin

## 📞 Destek

Hala sorun yaşıyorsanız:

1. Tarayıcı konsolu hatalarını kontrol edin (F12 → Console)
2. Hata mesajını kopyalayın
3. Destek ekibiyle paylaşın

## ✅ Başarı Kontrolü

Sistem düzgün çalışıyorsa:

- ✅ Login ekranı açılıyor
- ✅ Hesap oluşturabiliyorsunuz
- ✅ Giriş yapabiliyorsunuz
- ✅ Dashboard açılıyor
- ✅ Müşteri ekleyebiliyorsunuz
- ✅ TC Kimlik alanı görünüyor
- ✅ Referans seçebiliyorsunuz

## 🎉 Tamamlandı!

Artık sistemi kullanmaya hazırsınız!

---

**Not:** Bu hata sadece geliştirme aşamasında, veritabanı şeması değiştiğinde ortaya çıkar. 
Production ortamında migration stratejisi kullanılmalıdır.
