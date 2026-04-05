# 🖨️ Sipariş Formu Yazdırma Sistemi

## Genel Bakış

Profesyonel A5 boyutunda sipariş formu yazdırma sistemi. Müşteriye teslim edilebilecek, imza alanları olan, tüm sipariş detaylarını içeren profesyonel bir çıktı sağlar.

---

## 🎯 Özellikler

### 1. Profesyonel Tasarım
- ✅ A5 kağıt boyutu (148mm x 210mm)
- ✅ Optimize edilmiş yazı boyutları
- ✅ Şirket logosu ve bilgileri
- ✅ Barkod/Fiş numarası
- ✅ Profesyonel tablo düzeni

### 2. Detaylı Bilgiler
- ✅ Sipariş bilgileri (fiş no, tarih, durum, teslim tarihi)
- ✅ Müşteri bilgileri (ad, telefon, TC kimlik, email)
- ✅ Reçete bilgileri (varsa - SPH, CYL, AXIS, PD)
- ✅ Sipariş kalemleri (ürün, adet, fiyat, indirim)
- ✅ Toplam hesaplamalar (ara toplam, KDV, indirim, kalan)

### 3. Yasal Gereklilikler
- ✅ Firma bilgileri (ad, adres, telefon, vergi no)
- ✅ İmza alanları (müşteri ve yetkili)
- ✅ Yazdırma tarihi
- ✅ Fiş numarası

### 4. Kullanıcı Dostu
- ✅ Tek tuşla yazdırma (Ctrl+P veya Yazdır butonu)
- ✅ Otomatik sayfa düzeni
- ✅ Özelleştirilebilir firma bilgileri
- ✅ Ekranda gizli, yazdırmada görünür

---

## 📋 Kullanım

### Sipariş Formu Yazdırma

**Adım 1: Sipariş Detayına Git**
1. Siparişler sayfasına git
2. Yazdırmak istediğin siparişe tıkla
3. Sipariş detay sayfası açılır

**Adım 2: Yazdır**
1. Sağ üstteki "Yazdır" butonuna tıkla
2. VEYA klavyeden `Ctrl+P` (Windows) / `Cmd+P` (Mac) tuşlarına bas
3. Yazıcı ayarlarını kontrol et:
   - Kağıt boyutu: A5
   - Yönlendirme: Dikey (Portrait)
   - Kenar boşlukları: Yok (None)
4. "Yazdır" butonuna tıkla

**Adım 3: Müşteriye Teslim Et**
1. Formu müşteriye göster
2. İmza alanını imzalat
3. Bir kopyasını müşteriye ver
4. Bir kopyasını arşivle

---

## 🎨 Form Düzeni

### A5 Sipariş Formu Şablonu

```
┌─────────────────────────────────────────┐
│           OPTIKPRO                      │
│     Gözlük ve Optik Ürünler            │
│  Adres | Tel: 0XXX XXX XX XX           │
│     Vergi No: XXXXXXXXXX                │
├─────────────────────────────────────────┤
│                                         │
│        OPT-2026-00001                   │
│                                         │
├─────────────────────────────────────────┤
│ SİPARİŞ BİLGİLERİ                      │
├─────────────────────────────────────────┤
│ Fiş No: OPT-2026-00001  Durum: Onaylandı│
│ Tarih: 05.04.2026       Teslim: 12.04.26│
├─────────────────────────────────────────┤
│ MÜŞTERİ BİLGİLERİ                      │
├─────────────────────────────────────────┤
│ Ad Soyad: Ahmet Yılmaz                  │
│ Telefon: 0532 123 45 67                 │
│ TC Kimlik: 12345678901                  │
│ Email: ahmet@example.com                │
├─────────────────────────────────────────┤
│ REÇETE BİLGİLERİ                       │
├─────────────────────────────────────────┤
│     │ SPH  │ CYL  │ AXIS │ PD          │
│ SAĞ │ -2.00│ -0.50│  90  │ 32          │
│ SOL │ -2.25│ -0.75│  85  │ 31          │
├─────────────────────────────────────────┤
│ SİPARİŞ KALEMLERİ                      │
├─────────────────────────────────────────┤
│ Kalem      │Adet│Birim │İnd.│Toplam    │
│ Çerçeve    │ 1  │ 500₺ │ 0₺ │ 500₺     │
│ Ray-Ban RB2140                          │
│ Cam Sağ    │ 1  │ 300₺ │ 0₺ │ 300₺     │
│ Varilux                                 │
│ Cam Sol    │ 1  │ 300₺ │ 0₺ │ 300₺     │
│ Varilux                                 │
├─────────────────────────────────────────┤
│ TOPLAM                                  │
├─────────────────────────────────────────┤
│ Ara Toplam:              1,100.00₺      │
│ İndirim:                    -50.00₺     │
│ KDV (%20):                  210.00₺     │
│ ═══════════════════════════════════     │
│ GENEL TOPLAM:            1,260.00₺      │
│ Ödenen:                    500.00₺      │
│ Kalan:                     760.00₺      │
├─────────────────────────────────────────┤
│ Not: Teslim tarihinde gelmeniz rica     │
│ olunur.                                 │
├─────────────────────────────────────────┤
│                                         │
│ _______________    _______________      │
│ Müşteri İmzası     Yetkili İmzası      │
│                                         │
├─────────────────────────────────────────┤
│ Bizi tercih ettiğiniz için teşekkürler │
│ Bu belge elektronik ortamda oluşturuldu │
│ Yazdırma: 05.04.2026 14:30             │
└─────────────────────────────────────────┘
```

---

## ⚙️ Firma Bilgilerini Özelleştirme

### Ayarlar Sayfasından

**Adım 1: Ayarlar Sayfasına Git**
1. Sol menüden "Ayarlar" seçeneğine tıkla
2. "Firma Bilgileri" bölümünü bul

**Adım 2: Bilgileri Düzenle**
```
Firma Adı:    OptikPro
Slogan:       Gözlük ve Optik Ürünler
Adres:        Atatürk Cad. No:123 Kadıköy/İstanbul
Telefon:      0216 XXX XX XX
Email:        info@optikpro.com
Vergi No:     1234567890
```

**Adım 3: Kaydet**
1. "Kaydet" butonuna tıkla
2. Bilgiler kaydedildi mesajını bekle
3. Artık tüm yazdırmalarda yeni bilgiler görünecek

---

## 🖨️ Yazıcı Ayarları

### Önerilen Ayarlar

**Kağıt Boyutu:**
- A5 (148mm x 210mm)
- Eğer A5 seçeneği yoksa: A4'ü yarıya böl

**Yönlendirme:**
- Dikey (Portrait)

**Kenar Boşlukları:**
- Yok (None) veya Minimum
- Sistem otomatik 10mm boşluk bırakır

**Renk:**
- Siyah-Beyaz (önerilir)
- Renkli (opsiyonel)

**Kalite:**
- Normal veya Yüksek
- Taslak kalite önerilmez

### Yazıcı Türleri

**1. Lazer Yazıcı (Önerilir)**
- Hızlı ve ekonomik
- Net çıktı
- Uzun ömürlü

**2. Inkjet Yazıcı**
- Renkli çıktı için uygun
- Daha yavaş
- Mürekkep maliyeti yüksek

**3. Termal Yazıcı**
- Çok hızlı
- Sessiz
- Özel kağıt gerektirir
- Uzun süre saklanamaz

---

## 📱 Mobil Yazdırma

### Tablet/Telefon'dan Yazdırma

**Adım 1: Sipariş Detayını Aç**
1. Tarayıcıdan sisteme giriş yap
2. Siparişi aç

**Adım 2: Yazdır**
1. Tarayıcı menüsünden "Yazdır" seçeneğini bul
2. Veya "Paylaş" → "Yazdır"
3. Yazıcıyı seç (WiFi yazıcı gerekli)
4. Yazdır

**Alternatif: PDF Olarak Kaydet**
1. Yazdır menüsünden "PDF olarak kaydet" seç
2. PDF'i kaydet
3. PDF'i email veya WhatsApp ile gönder
4. Bilgisayardan yazdır

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Normal Sipariş

**Durum:**
- Müşteri: Ahmet Yılmaz
- Sipariş: Çerçeve + 2 Cam
- Toplam: 1,260₺
- Ödenen: 500₺

**İşlem:**
1. Sipariş oluştur
2. Ödeme al (500₺)
3. Sipariş detayına git
4. "Yazdır" butonuna tıkla
5. Formu yazdır
6. Müşteriye imzalat
7. Bir kopyasını müşteriye ver

### Senaryo 2: Reçeteli Sipariş

**Durum:**
- Müşteri: Ayşe Demir
- Reçete: Var (SPH, CYL, AXIS, PD)
- Sipariş: Çerçeve + 2 Cam
- Toplam: 1,500₺

**İşlem:**
1. Müşteri kaydı oluştur
2. Reçete ekle
3. Sipariş oluştur (reçete seç)
4. Yazdır
5. Formda reçete bilgileri otomatik görünür
6. Müşteriye teslim et

### Senaryo 3: Toplu Yazdırma

**Durum:**
- Bugün teslim edilecek 10 sipariş var
- Hepsini yazdırmak gerekiyor

**İşlem:**
1. Dashboard'dan "Bugün Teslim" listesine git
2. Her siparişi sırayla aç
3. Yazdır (Ctrl+P)
4. Sonraki siparişe geç
5. Tüm formları arşivle

### Senaryo 4: Arşiv Kopyası

**Durum:**
- Eski sipariş formunu tekrar yazdırmak gerekiyor
- Müşteri kopyasını kaybetmiş

**İşlem:**
1. Siparişler sayfasına git
2. Arama ile siparişi bul (fiş no veya müşteri adı)
3. Sipariş detayına git
4. Yazdır
5. "Kopya" damgası vur (opsiyonel)
6. Müşteriye ver

---

## 🔧 Teknik Detaylar

### CSS Print Styles

**Dosya:** `src/index.css`

```css
@media print {
  @page {
    size: A5;
    margin: 0;
  }
  
  .print-container {
    width: 148mm;
    height: 210mm;
    padding: 10mm;
  }
  
  .no-print {
    display: none !important;
  }
}
```

### React Component

**Dosya:** `src/pages/orders/OrderDetail.jsx`

```jsx
// Ekranda gizli, yazdırmada görünür
<div className="hidden print:block print-container">
  {/* A5 Form İçeriği */}
</div>

// Ekranda görünür, yazdırmada gizli
<div className="no-print">
  {/* Normal Sayfa İçeriği */}
</div>
```

### Yazı Boyutları

| Element | Boyut | Kullanım |
|---------|-------|----------|
| Logo | 24px | Firma adı |
| Başlıklar | 11px | Bölüm başlıkları |
| Normal Metin | 9px | Genel bilgiler |
| Küçük Metin | 8px | Notlar, footer |
| Toplam | 12px | Genel toplam |

### Renkler

| Element | Renk | Hex |
|---------|------|-----|
| Başlıklar | Siyah | #000000 |
| Normal Metin | Koyu Gri | #333333 |
| Açıklama | Gri | #666666 |
| Kenarlıklar | Açık Gri | #DDDDDD |
| İndirim | Kırmızı | #DC2626 |
| Ödenen | Yeşil | #16A34A |
| Kalan | Turuncu | #EA580C |

---

## 📊 Form Bölümleri

### 1. Header (Üst Bilgi)
- Firma logosu/adı
- Slogan
- İletişim bilgileri
- Vergi numarası

### 2. Barcode Area (Barkod Alanı)
- Fiş numarası (büyük font)
- Gelecekte barkod eklenebilir

### 3. Order Info (Sipariş Bilgileri)
- Fiş numarası
- Sipariş tarihi
- Teslim tarihi
- Sipariş durumu

### 4. Customer Info (Müşteri Bilgileri)
- Ad soyad
- Telefon
- TC kimlik (varsa)
- Email (varsa)

### 5. Prescription Info (Reçete Bilgileri)
- Sadece reçete varsa gösterilir
- Sağ göz: SPH, CYL, AXIS, PD
- Sol göz: SPH, CYL, AXIS, PD

### 6. Items Table (Ürün Tablosu)
- Kalem tipi
- Ürün açıklaması
- Adet
- Birim fiyat
- İndirim
- Toplam

### 7. Totals (Toplam Hesaplamalar)
- Ara toplam
- İndirim
- KDV
- Genel toplam
- Ödenen
- Kalan

### 8. Notes (Notlar)
- Sipariş notları (varsa)

### 9. Signature Area (İmza Alanı)
- Müşteri imzası
- Yetkili imzası

### 10. Footer (Alt Bilgi)
- Teşekkür mesajı
- Yazdırma tarihi
- Yasal uyarılar

---

## 🚀 Gelecek Geliştirmeler

### v1.3 (Planlanan)
- [ ] QR kod ekleme (sipariş takibi için)
- [ ] Barkod ekleme (fiş numarası)
- [ ] Logo yükleme özelliği
- [ ] Farklı şablon seçenekleri
- [ ] Renkli/Siyah-beyaz seçimi

### v1.4 (Planlanan)
- [ ] Toplu yazdırma (birden fazla sipariş)
- [ ] Email ile gönderme
- [ ] WhatsApp ile paylaşma
- [ ] PDF olarak kaydetme butonu

### v2.0 (Planlanan)
- [ ] Özelleştirilebilir şablonlar
- [ ] Farklı kağıt boyutları (A4, A6)
- [ ] Çoklu dil desteği
- [ ] Dijital imza entegrasyonu

---

## 💡 İpuçları

### Kağıt Tasarrufu
- Taslak siparişleri yazdırmayın
- Sadece onaylanan siparişleri yazdırın
- Dijital kopyaları saklayın

### Kalite
- Lazer yazıcı kullanın
- Kaliteli A5 kağıt kullanın
- Mürekkep seviyesini kontrol edin

### Arşivleme
- Her formun bir kopyasını saklayın
- Tarih sırasına göre dosyalayın
- Dijital yedek alın (PDF)

### Müşteri Memnuniyeti
- Formu temiz ve düzenli yazdırın
- İmza alanını gösterin
- Teslim tarihini vurgulayın
- İletişim bilgilerinizi net yazın

---

## 📞 Destek

Yazdırma ile ilgili sorunlar için:
1. Yazıcı ayarlarını kontrol edin
2. Kağıt boyutunu A5 olarak ayarlayın
3. Tarayıcı önbelleğini temizleyin
4. Farklı tarayıcı deneyin (Chrome önerilir)

---

**Versiyon:** 1.2.0  
**Son Güncelleme:** 05.04.2026  
**Durum:** Production Ready ✅
