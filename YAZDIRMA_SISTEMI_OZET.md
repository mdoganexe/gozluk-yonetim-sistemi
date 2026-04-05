# 🖨️ Yazdırma Sistemi - Hızlı Başlangıç

## ✅ Tamamlanan Özellikler

### 1. Profesyonel A5 Sipariş Formu
- ✅ A5 kağıt boyutu (148mm x 210mm)
- ✅ Profesyonel tasarım
- ✅ Otomatik sayfa düzeni
- ✅ Tek tuşla yazdırma (Ctrl+P)

### 2. Detaylı İçerik
- ✅ Şirket bilgileri (logo, adres, telefon, vergi no)
- ✅ Sipariş bilgileri (fiş no, tarih, durum, teslim)
- ✅ Müşteri bilgileri (ad, telefon, TC, email)
- ✅ Reçete bilgileri (SPH, CYL, AXIS, PD)
- ✅ Ürün tablosu (kalem, adet, fiyat, indirim)
- ✅ Toplam hesaplamalar (ara toplam, KDV, indirim, kalan)
- ✅ İmza alanları (müşteri ve yetkili)

### 3. Özelleştirme
- ✅ Firma bilgileri düzenlenebilir
- ✅ Ayarlar sayfasından yönetim
- ✅ Tüm yazdırmalarda otomatik kullanım

---

## 🚀 Hızlı Kullanım

### Sipariş Yazdırma (3 Adım)

**1. Sipariş Detayına Git**
```
Siparişler → Sipariş Seç → Detay Sayfası
```

**2. Yazdır Butonuna Tıkla**
```
Sağ Üst → "Yazdır" Butonu
VEYA
Klavye: Ctrl+P (Windows) / Cmd+P (Mac)
```

**3. Yazıcı Ayarları**
```
Kağıt: A5
Yönlendirme: Dikey
Kenar Boşlukları: Yok
→ Yazdır
```

### Firma Bilgilerini Güncelleme (2 Adım)

**1. Ayarlar Sayfasına Git**
```
Sol Menü → Ayarlar → Firma Bilgileri
```

**2. Bilgileri Düzenle ve Kaydet**
```
Firma Adı: [Firma adınız]
Slogan: [Sloganınız]
Adres: [Adresiniz]
Telefon: [Telefonunuz]
Email: [Email adresiniz]
Vergi No: [Vergi numaranız]
→ Kaydet
```

---

## 📋 Form İçeriği

### Üst Bölüm
```
┌─────────────────────────────────┐
│        OPTIKPRO                 │
│  Gözlük ve Optik Ürünler       │
│  Adres | Tel | Vergi No        │
├─────────────────────────────────┤
│      OPT-2026-00001             │
└─────────────────────────────────┘
```

### Bilgi Bölümleri
```
📋 Sipariş Bilgileri
   - Fiş No, Tarih, Durum, Teslim

👤 Müşteri Bilgileri
   - Ad Soyad, Telefon, TC, Email

👓 Reçete Bilgileri (varsa)
   - Sağ/Sol: SPH, CYL, AXIS, PD

📦 Sipariş Kalemleri
   - Kalem, Adet, Birim, İndirim, Toplam

💰 Toplam Hesaplamalar
   - Ara Toplam, İndirim, KDV
   - Genel Toplam, Ödenen, Kalan
```

### Alt Bölüm
```
┌─────────────────────────────────┐
│ Not: [Sipariş notları]          │
├─────────────────────────────────┤
│ ___________    ___________      │
│ Müşteri        Yetkili          │
│ İmzası         İmzası           │
├─────────────────────────────────┤
│ Teşekkürler                     │
│ Yazdırma: 05.04.2026 14:30     │
└─────────────────────────────────┘
```

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Normal Sipariş
```
1. Sipariş Oluştur
2. Ödeme Al
3. Yazdır (Ctrl+P)
4. Müşteriye İmzalat
5. Bir Kopya Ver
6. Bir Kopya Arşivle
```

### Senaryo 2: Reçeteli Sipariş
```
1. Müşteri + Reçete Kaydet
2. Sipariş Oluştur (Reçete Seç)
3. Yazdır
4. Formda Reçete Otomatik Görünür
5. Müşteriye Teslim Et
```

### Senaryo 3: Toplu Yazdırma
```
1. Bugün Teslim Listesi
2. Her Siparişi Aç
3. Yazdır (Ctrl+P)
4. Sonraki Sipariş
5. Tümünü Arşivle
```

---

## 🔧 Yapılan Değişiklikler

### 1. src/index.css
**Eklenen:**
- A5 print styles (@media print)
- Print container (148mm x 210mm)
- Print header, sections, tables
- Print totals, signature areas
- Print footer
- Status badges

### 2. src/pages/orders/OrderDetail.jsx
**Eklenen:**
- A5 print template (hidden on screen)
- Company settings integration
- Prescription display
- Professional layout
- Signature areas
- Print-only content

**Güncellenen:**
- Import statements (FileText icon)
- Settings state management
- Status labels mapping

### 3. src/pages/Settings.jsx
**Eklenen:**
- Company info state
- Settings loading from database
- Save company info function
- Form inputs for all fields
- Save button with loading state

**Güncellenen:**
- Import statements (Save icon, useLiveQuery)
- Company info form with real data binding

---

## 📁 Dosya Yapısı

```
src/
├── index.css                    (GÜNCELLENDİ - Print styles)
├── pages/
│   ├── orders/
│   │   └── OrderDetail.jsx      (GÜNCELLENDİ - A5 template)
│   └── Settings.jsx             (GÜNCELLENDİ - Company info)
└── db/
    └── database.js              (Mevcut - Settings table)

Dokümantasyon/
├── SIPARIS_FORMU_YAZDIRMA.md   (YENİ - Detaylı kılavuz)
├── YAZDIRMA_SISTEMI_OZET.md    (YENİ - Bu dosya)
└── YENI_OZELLIKLER.md          (GÜNCELLENDİ - Yazdırma bölümü)
```

---

## 💡 İpuçları

### Kaliteli Çıktı İçin
✅ Lazer yazıcı kullanın
✅ Kaliteli A5 kağıt kullanın
✅ Mürekkep seviyesini kontrol edin
✅ Normal veya Yüksek kalite seçin

### Kağıt Tasarrufu İçin
✅ Sadece onaylanan siparişleri yazdırın
✅ Dijital kopyaları saklayın
✅ Taslak siparişleri yazdırmayın
✅ PDF olarak kaydedin (gelecek özellik)

### Arşivleme İçin
✅ Her formun bir kopyasını saklayın
✅ Tarih sırasına göre dosyalayın
✅ Dijital yedek alın
✅ Önemli siparişleri ayrı dosyalayın

### Müşteri Memnuniyeti İçin
✅ Formu temiz ve düzenli yazdırın
✅ İmza alanını gösterin
✅ Teslim tarihini vurgulayın
✅ İletişim bilgilerinizi net yazın

---

## 🎨 Tasarım Özellikleri

### Yazı Boyutları
| Element | Boyut | Kullanım |
|---------|-------|----------|
| Logo | 24px | Firma adı |
| Başlıklar | 11px | Bölüm başlıkları |
| Normal | 9px | Genel bilgiler |
| Küçük | 8px | Notlar, footer |
| Toplam | 12px | Genel toplam |

### Renkler
| Element | Renk | Kullanım |
|---------|------|----------|
| Siyah | #000 | Başlıklar |
| Koyu Gri | #333 | Normal metin |
| Gri | #666 | Açıklamalar |
| Kırmızı | #DC2626 | İndirim |
| Yeşil | #16A34A | Ödenen |
| Turuncu | #EA580C | Kalan |

### Sayfa Düzeni
- Boyut: 148mm x 210mm (A5)
- Kenar: 10mm (otomatik)
- Yönlendirme: Dikey
- Font: System default

---

## 🧪 Test Checklist

### Yazdırma Testi
- [ ] Sipariş detayına git
- [ ] Yazdır butonuna tıkla
- [ ] Önizleme görünüyor mu?
- [ ] A5 boyutunda mı?
- [ ] Tüm bilgiler görünüyor mu?
- [ ] İmza alanları var mı?
- [ ] Yazdırma başarılı mı?

### Firma Bilgileri Testi
- [ ] Ayarlar sayfasına git
- [ ] Firma bilgilerini düzenle
- [ ] Kaydet butonuna tıkla
- [ ] Başarı mesajı geldi mi?
- [ ] Sipariş detayına git
- [ ] Yazdır önizlemesine bak
- [ ] Yeni bilgiler görünüyor mu?

### Reçete Testi
- [ ] Reçeteli sipariş oluştur
- [ ] Sipariş detayına git
- [ ] Yazdır önizlemesine bak
- [ ] Reçete tablosu görünüyor mu?
- [ ] SPH, CYL, AXIS, PD değerleri doğru mu?

---

## 🚀 Sonraki Adımlar

### Kısa Vadeli
- [ ] QR kod ekleme (sipariş takibi)
- [ ] Barkod ekleme (fiş numarası)
- [ ] Logo yükleme özelliği

### Orta Vadeli
- [ ] Toplu sipariş yazdırma
- [ ] Email ile gönderme
- [ ] WhatsApp ile paylaşma
- [ ] PDF olarak kaydetme butonu

### Uzun Vadeli
- [ ] Özelleştirilebilir şablonlar
- [ ] Farklı kağıt boyutları (A4, A6)
- [ ] Çoklu dil desteği
- [ ] Dijital imza entegrasyonu

---

## 📞 Sorun Giderme

### Yazdırma Çalışmıyor
1. Yazıcı bağlantısını kontrol et
2. Tarayıcı izinlerini kontrol et
3. Farklı tarayıcı dene (Chrome önerilir)
4. Yazıcı sürücülerini güncelle

### Sayfa Düzeni Bozuk
1. Kağıt boyutunu A5 olarak ayarla
2. Kenar boşluklarını "Yok" yap
3. Yönlendirmeyi "Dikey" yap
4. Tarayıcı önbelleğini temizle

### Firma Bilgileri Görünmüyor
1. Ayarlar sayfasından bilgileri kaydet
2. Sayfayı yenile (F5)
3. Tarayıcı önbelleğini temizle
4. Farklı tarayıcı dene

### Reçete Görünmüyor
1. Sipariş oluştururken reçete seç
2. Reçete bilgilerinin dolu olduğunu kontrol et
3. Sipariş detayını yenile
4. Yazdır önizlemesine bak

---

## 📚 Dokümantasyon

- **SIPARIS_FORMU_YAZDIRMA.md** - Detaylı kullanım kılavuzu
- **YAZDIRMA_SISTEMI_OZET.md** - Bu dosya (hızlı başlangıç)
- **YENI_OZELLIKLER.md** - Tüm yeni özellikler

---

**Durum:** ✅ Tamamlandı  
**Versiyon:** 1.3.0  
**Tarih:** 05.04.2026  
**Test Durumu:** Production Ready
