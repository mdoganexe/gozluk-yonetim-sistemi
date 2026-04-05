# 📋 Sipariş Fişi Sistemi (Lab İçin)

## Genel Bakış

Cam laboratuvarına götürülmek üzere özel olarak tasarlanmış sipariş fişi sistemi. Müşteri formu ile karıştırılmadan, sadece laboratuvar için gerekli bilgileri içerir.

---

## 🎯 Özellikler

### 1. Ayrı Sipariş Fişi Sayfası
- ✅ Müşteri formundan bağımsız
- ✅ Sadece lab için gerekli bilgiler
- ✅ Yeni sekmede açılır
- ✅ Otomatik yazdırma dialogu

### 2. Lab Odaklı İçerik
- ✅ Büyük ve net reçete bilgileri
- ✅ Sipariş detayları (cam tipi, adet)
- ✅ Lab notları alanı
- ✅ Teslim eden/alan imza alanları

### 3. Kolay Kullanım
- ✅ Tek tıkla açılır
- ✅ Otomatik yazdırma
- ✅ A5 kağıda optimize
- ✅ Müşteri bilgileri minimal

---

## 📋 Kullanım

### Sipariş Fişi Yazdırma

**Adım 1: Sipariş Detayına Git**
```
Siparişler → Sipariş Seç → Detay Sayfası
```

**Adım 2: Sipariş Fişi Butonuna Tıkla**
```
Sağ Üst → "Sipariş Fişi" Butonu
```

**Adım 3: Otomatik Yazdırma**
```
→ Yeni sekme açılır
→ Yazdırma dialogu otomatik açılır
→ Yazıcı ayarlarını kontrol et
→ Yazdır
```

**Adım 4: Lab'a Götür**
```
→ Fişi cam ile birlikte lab'a götür
→ Lab personeline teslim et
→ İmza karşılığı teslim al
```

---

## 🎨 Fiş İçeriği

### Sipariş Fişi Şablonu

```
┌─────────────────────────────────────────┐
│           OPTIKPRO                      │
│     Gözlük ve Optik Ürünler            │
│  Adres | Tel: 0XXX XXX XX XX           │
├─────────────────────────────────────────┤
│                                         │
│        SİPARİŞ FİŞİ                    │
│        OPT-2026-00001                   │
│                                         │
├─────────────────────────────────────────┤
│ Tarih: 05.04.2026                      │
│ Teslim: 12.04.2026                     │
├─────────────────────────────────────────┤
│ MÜŞTERİ BİLGİLERİ                      │
├─────────────────────────────────────────┤
│ Ad Soyad: Ahmet Yılmaz                  │
│ Telefon: 0532 123 45 67                 │
├─────────────────────────────────────────┤
│ ╔═══════════════════════════════════╗  │
│ ║   REÇETE BİLGİLERİ                ║  │
│ ╠═══════════════════════════════════╣  │
│ ║     │ SPH  │ CYL  │ AXIS │ PD   ║  │
│ ║ SAĞ │-2.00 │-0.50 │  90  │ 32   ║  │
│ ║ SOL │-2.25 │-0.75 │  85  │ 31   ║  │
│ ╚═══════════════════════════════════╝  │
│ Not: Anti-reflektif kaplama            │
├─────────────────────────────────────────┤
│ SİPARİŞ DETAYLARI                      │
├─────────────────────────────────────────┤
│ Kalem      │Adet│ Açıklama             │
│ CAM SAĞ    │ 1  │ Varilux 1.67         │
│ CAM SOL    │ 1  │ Varilux 1.67         │
│ ÇERÇEVE    │ 1  │ Ray-Ban RB2140       │
├─────────────────────────────────────────┤
│ Özel Notlar: Hızlı teslimat            │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ LAB NOTLARI:                        │ │
│ │ □ Reçete kontrol edildi             │ │
│ │ □ Cam tipi onaylandı                │ │
│ │ □ Özel işlem var mı? _________      │ │
│ │ □ Teslim tarihi: 12.04.2026         │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│ _______________    _______________      │
│ Teslim Eden        Teslim Alan (Lab)   │
│                                         │
├─────────────────────────────────────────┤
│ Bu fiş cam laboratuvarı için           │
│ hazırlanmıştır. Müşteri nüshası        │
│ değildir.                               │
│ Yazdırma: 05.04.2026 14:30             │
└─────────────────────────────────────────┘
```

---

## 🔄 İş Akışı

### Tam Süreç

**1. Sipariş Oluşturma**
```
→ Müşteri gelir
→ Reçete alınır
→ Çerçeve seçilir
→ Cam tipi belirlenir
→ Sipariş oluşturulur
```

**2. Sipariş Fişi Yazdırma**
```
→ Sipariş detayına git
→ "Sipariş Fişi" butonuna tıkla
→ Otomatik yazdırma dialogu açılır
→ Fişi yazdır
```

**3. Lab'a Gönderme**
```
→ Çerçeveyi hazırla
→ Sipariş fişini çerçeve ile birlikte koy
→ Lab personeline teslim et
→ İmza karşılığı teslim al
```

**4. Lab'dan Alma**
```
→ Lab hazır olduğunda bildirir
→ Sipariş fişi ile git
→ Gözlüğü kontrol et
→ İmza karşılığı teslim al
```

**5. Müşteriye Teslim**
```
→ Müşteri formu yazdır (ayrı)
→ Gözlüğü kontrol ettir
→ Ödeme al
→ Müşteri formunu imzalat
→ Teslim et
```

---

## 📊 Fark: Sipariş Fişi vs Müşteri Formu

### Sipariş Fişi (Lab İçin)

**Amaç:** Lab'a cam siparişi vermek

**İçerik:**
- ✅ Reçete bilgileri (BÜYÜK ve NET)
- ✅ Cam tipi ve özellikleri
- ✅ Lab notları alanı
- ✅ Teslim eden/alan imzaları
- ✅ Minimal müşteri bilgisi

**Kullanım:**
- Lab'a götürülür
- Cam ile birlikte gider
- Lab'dan geri gelir
- Arşivlenir

**Yazdırma:**
- "Sipariş Fişi" butonu
- Yeni sekmede açılır
- Otomatik yazdırma

### Müşteri Formu (Müşteri İçin)

**Amaç:** Müşteriye teslim belgesi

**İçerik:**
- ✅ Detaylı müşteri bilgileri
- ✅ Tüm sipariş kalemleri
- ✅ Fiyat bilgileri
- ✅ Ödeme bilgileri
- ✅ Müşteri/Yetkili imzaları

**Kullanım:**
- Müşteriye verilir
- Ödeme makbuzu
- Garanti belgesi
- Arşivlenir

**Yazdırma:**
- "Müşteri Formu" butonu
- Aynı sayfada yazdırma
- Ctrl+P ile de yazdırılabilir

---

## 💡 Kullanım Senaryoları

### Senaryo 1: Normal Cam Siparişi

**Durum:**
- Müşteri: Ahmet Yılmaz
- Reçete: Var
- Çerçeve: Ray-Ban
- Cam: Varilux 1.67

**İşlem:**
1. Sipariş oluştur
2. "Sipariş Fişi" butonuna tıkla
3. Fiş otomatik yazdırılır
4. Çerçeve ile birlikte lab'a götür
5. Lab personeline teslim et
6. İmza al

**Lab'dan Geldiğinde:**
1. Lab'dan gözlüğü al
2. Kontrol et
3. Müşteriye haber ver
4. Müşteri geldiğinde "Müşteri Formu" yazdır
5. Ödeme al
6. Teslim et

### Senaryo 2: Acil Sipariş

**Durum:**
- Müşteri: Ayşe Demir
- Acil teslimat
- Özel kaplama

**İşlem:**
1. Sipariş oluştur
2. Notlar kısmına "ACİL" yaz
3. "Sipariş Fişi" yazdır
4. Fişe elle "ACİL" damgası vur
5. Lab'a götür ve acil olduğunu belirt
6. Lab notları kısmına özel işlem yaz

### Senaryo 3: Toplu Sipariş

**Durum:**
- 5 farklı müşteri
- Aynı gün lab'a gidecek

**İşlem:**
1. Her sipariş için ayrı fiş yazdır
2. Fişleri numaralandır (1/5, 2/5, ...)
3. Çerçeveleri etiketle
4. Hepsini birlikte lab'a götür
5. Toplu teslim tutanağı tut
6. İmza al

### Senaryo 4: Reçete Değişikliği

**Durum:**
- Lab'a gönderildi
- Müşteri reçete değiştirmek istiyor

**İşlem:**
1. Lab'ı ara, işlemi durdur
2. Yeni reçete ile sipariş güncelle
3. Yeni "Sipariş Fişi" yazdır
4. Lab'a götür
5. Eski fişi iptal et
6. Yeni fişle devam et

---

## 🎯 Lab Notları Kullanımı

### Kontrol Listesi

**Reçete Kontrol:**
```
□ SPH değerleri doğru
□ CYL değerleri doğru
□ AXIS değerleri doğru
□ PD değerleri doğru
□ Sağ/Sol karışmamış
```

**Cam Tipi:**
```
□ İndeks doğru (1.50, 1.60, 1.67, 1.74)
□ Kaplama belirtilmiş (AR, HC, UV)
□ Renk var mı? (Photochromic, Polarize)
□ Özel işlem? (Drill, Groove)
```

**Özel İşlemler:**
```
□ Anti-reflektif kaplama
□ Sertleştirme
□ UV koruma
□ Blue light filter
□ Photochromic
□ Polarize
```

**Teslim Tarihi:**
```
□ Normal: 3-5 gün
□ Hızlı: 1-2 gün
□ Acil: Aynı gün
□ Özel: _____ gün
```

---

## 🔧 Teknik Detaylar

### Sayfa Yapısı

**Route:**
```
/orders/:id/slip
```

**Component:**
```javascript
src/pages/orders/OrderSlip.jsx
```

**Özellikler:**
- Layout olmadan açılır
- Otomatik yazdırma dialogu
- A5 kağıda optimize
- Print-only içerik

### Otomatik Yazdırma

```javascript
useEffect(() => {
  if (order && customer && items) {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }
}, [order, customer, items]);
```

### Yeni Sekmede Açma

```javascript
<button
  onClick={() => window.open(`/orders/${id}/slip`, '_blank')}
>
  Sipariş Fişi
</button>
```

---

## 📱 Mobil Kullanım

### Tablet'ten Yazdırma

**Adım 1: Sipariş Fişini Aç**
```
→ Sipariş detayına git
→ "Sipariş Fişi" butonuna tıkla
→ Yeni sekme açılır
```

**Adım 2: Yazdır**
```
→ Tarayıcı menüsü → Yazdır
→ Veya "Paylaş" → "Yazdır"
→ WiFi yazıcı seç
→ Yazdır
```

**Alternatif: PDF Kaydet**
```
→ Yazdır menüsü → "PDF olarak kaydet"
→ PDF'i kaydet
→ Email/WhatsApp ile gönder
→ Bilgisayardan yazdır
```

---

## 💡 İpuçları

### Lab'a Gönderirken
✅ Çerçeveyi temizle
✅ Fişi çerçeve ile birlikte koy
✅ Acil ise belirt
✅ Özel işlem varsa vurgula
✅ İletişim bilgilerini kontrol et

### Lab'dan Alırken
✅ Fişi yanına al
✅ Gözlüğü kontrol et
✅ Reçete ile karşılaştır
✅ Cam kalitesini kontrol et
✅ İmza karşılığı teslim al

### Arşivleme
✅ Her fişi numaralandır
✅ Tarih sırasına göre dosyala
✅ Lab'dan gelen fişleri ayrı tut
✅ Dijital kopyasını sakla

### Sorun Çıkarsa
✅ Lab'ı hemen ara
✅ Fişi kontrol et
✅ Reçete doğru mu?
✅ Cam tipi doğru mu?
✅ Gerekirse yeni fiş yazdır

---

## 🚀 Gelecek Geliştirmeler

### v1.4 (Planlanan)
- [ ] QR kod ile sipariş takibi
- [ ] Barkod ile lab entegrasyonu
- [ ] Lab durumu güncelleme
- [ ] SMS/Email bildirim

### v1.5 (Planlanan)
- [ ] Lab portal entegrasyonu
- [ ] Otomatik sipariş gönderme
- [ ] Lab fiyat karşılaştırma
- [ ] Toplu sipariş yönetimi

### v2.0 (Planlanan)
- [ ] Çoklu lab desteği
- [ ] Lab performans raporları
- [ ] Otomatik lab seçimi
- [ ] Lab stok entegrasyonu

---

## 📞 Sorun Giderme

### Fiş Yazdırılmıyor
1. Yazıcı bağlantısını kontrol et
2. Tarayıcı izinlerini kontrol et
3. Pop-up engelleyiciyi kapat
4. Farklı tarayıcı dene

### Otomatik Yazdırma Çalışmıyor
1. Tarayıcı ayarlarını kontrol et
2. Pop-up izni ver
3. Yazdırma izni ver
4. Manuel yazdır butonunu kullan

### Reçete Bilgileri Görünmüyor
1. Sipariş oluştururken reçete seç
2. Reçete bilgilerinin dolu olduğunu kontrol et
3. Sayfayı yenile
4. Sipariş detayını kontrol et

### Yeni Sekme Açılmıyor
1. Pop-up engelleyiciyi kapat
2. Tarayıcı ayarlarını kontrol et
3. Farklı tarayıcı dene
4. Manuel URL gir: /orders/[ID]/slip

---

## 📚 Dokümantasyon

- **SIPARIS_FISI_SISTEMI.md** - Bu dosya (lab fişi kılavuzu)
- **SIPARIS_FORMU_YAZDIRMA.md** - Müşteri formu kılavuzu
- **YENI_OZELLIKLER.md** - Tüm yeni özellikler

---

**Versiyon:** 1.3.0  
**Tarih:** 05.04.2026  
**Durum:** Production Ready ✅
