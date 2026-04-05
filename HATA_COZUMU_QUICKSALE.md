# 🔧 Hızlı Satış Hatası Çözümü

## ❌ Hata

```
Uncaught DexieError2
The above error occurred in the <OrderNew> component
```

## 🎯 Sebep

Veritabanı versiyonu güncellendi ama tarayıcıdaki eski veritabanı yeni şemayla uyumsuz.

## ⚡ HIZLI ÇÖZÜM (30 saniye)

### Yöntem 1: Reset Sayfası (ÖNERİLEN)

1. **Tarayıcınızda şu adresi açın:**
   ```
   http://localhost:3000/reset-db.html
   ```

2. **"Veritabanını Sıfırla"** butonuna tıklayın

3. **Onaylayın**

4. Sayfa otomatik yenilenecek

5. **Login ekranı açılacak** - Yeni hesap oluşturun

### Yöntem 2: Tarayıcı Konsolu (15 saniye)

1. **F12** tuşuna basın

2. **Console** sekmesine gidin

3. Şu komutu yapıştırın ve **Enter**:
   ```javascript
   indexedDB.deleteDatabase('GozlukYonetimDB'); localStorage.clear(); location.reload();
   ```

4. Sayfa yenilenecek

## ✅ Çözüm Sonrası

1. Login ekranı açılacak
2. Yeni hesap oluşturun
3. Sistemi kullanmaya başlayın
4. Hızlı satış özelliği çalışacak

## 🧪 Test

Çözüm sonrası test edin:

1. **Yeni müşteri ekleyin**
2. **Hızlı satış modal'ı açılmalı**
3. **Gözlük veya Lens seçin**
4. **Otomatik yönlendirme çalışmalı**

## 🆘 Hala Çalışmıyor mu?

### Tarayıcı Önbelleğini Temizle

1. **Ctrl + Shift + Delete**
2. "Önbelleği temizle" seçin
3. "Tüm zamanlar" seçin
4. Temizle
5. Sayfayı yenileyin

### Hard Refresh

1. **Ctrl + F5** (Windows)
2. **Cmd + Shift + R** (Mac)

### Farklı Tarayıcı

- Chrome çalışmıyorsa Firefox deneyin
- Edge çalışmıyorsa Chrome deneyin

## 📝 Neden Oluyor?

Sisteme yeni özellikler ekledik:
- ✅ Login sistemi
- ✅ TC Kimlik
- ✅ Referans sistemi
- ✅ Hızlı satış akışı

Bu özellikler veritabanı şemasını değiştirdi. Tarayıcınızdaki eski veritabanı yeni şemayla uyumsuz.

## 🔄 Gelecekte Önlemek

### Geliştirme Ortamında

Her güncelleme sonrası:
1. Veritabanını sıfırlayın
2. Yeni hesap oluşturun
3. Test verisi ekleyin

### Production Ortamında

- Migration stratejisi kullanılacak
- Otomatik güncelleme yapılacak
- Veri kaybı olmayacak

---

**Önemli:** Bu sadece geliştirme aşamasında oluyor. Production'da sorun olmayacak.
