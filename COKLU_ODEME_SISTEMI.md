# 💳 Çoklu Ödeme Yöntemi Sistemi

## Genel Bakış

Tek bir sipariş için birden fazla ödeme yöntemi ile ödeme alabilme sistemi. Müşteriler nakit, kredi kartı, havale ve veresiye gibi farklı yöntemleri aynı anda kullanabilir.

---

## 🎯 Özellikler

### 1. Çoklu Ödeme Yöntemi
- ✅ Tek siparişte birden fazla ödeme yöntemi
- ✅ Nakit + Kredi Kartı kombinasyonu
- ✅ Kısmi ödemeler
- ✅ Dinamik ödeme ekleme/çıkarma

### 2. Ödeme Türleri
- 💵 **Nakit** - Peşin nakit ödeme
- 💳 **Kredi Kartı** - Banka kartı ile ödeme
- 🏦 **Havale/EFT** - Banka transferi
- 📝 **Veresiye** - Vadeli ödeme

### 3. Akıllı Hesaplama
- ✅ Otomatik toplam hesaplama
- ✅ Kalan tutar gösterimi
- ✅ Fark hesaplama (fazla/eksik)
- ✅ Para üstü uyarısı

### 4. Detaylı Ödeme Geçmişi
- ✅ Tüm ödemelerin listesi
- ✅ Ödeme türüne göre ikonlar
- ✅ Tarih ve saat bilgisi
- ✅ Ödeme türü bazında özet

---

## 📋 Kullanım

### Tek Ödeme Yöntemi ile Ödeme

**Senaryo: Müşteri tamamını nakit ödüyor**

1. Sipariş detayına git
2. "Ödeme Al" butonuna tıkla
3. Ödeme bilgilerini gir:
   - Ödeme Türü: Nakit
   - Tutar: 1,500₺
   - Açıklama: "Tam ödeme"
4. "Ödeme Al" butonuna tıkla

**Sonuç:**
```
✓ 1,500₺ nakit ödeme alındı
✓ Sipariş ödemesi tamamlandı
✓ Kalan: 0₺
```

### Çoklu Ödeme Yöntemi ile Ödeme

**Senaryo: Müşteri kısmen nakit, kısmen kredi kartı ödüyor**

1. Sipariş detayına git
2. "Ödeme Al" butonuna tıkla
3. İlk ödeme yöntemini gir:
   - Ödeme Türü: Nakit
   - Tutar: 500₺
   - Açıklama: "Nakit kısım"
4. "Başka Ödeme Yöntemi Ekle" butonuna tıkla
5. İkinci ödeme yöntemini gir:
   - Ödeme Türü: Kredi Kartı
   - Tutar: 1,000₺
   - Açıklama: "Kart ile kalan"
6. "Ödeme Al (2 Yöntem)" butonuna tıkla

**Sonuç:**
```
✓ 500₺ nakit ödeme alındı
✓ 1,000₺ kredi kartı ile ödeme alındı
✓ Toplam: 1,500₺
✓ Sipariş ödemesi tamamlandı
```

### Kısmi Ödeme (Kapora)

**Senaryo: Müşteri kapora veriyor, kalanı sonra ödeyecek**

1. Sipariş detayına git (Toplam: 2,000₺)
2. "Ödeme Al" butonuna tıkla
3. Ödeme bilgilerini gir:
   - Ödeme Türü: Nakit
   - Tutar: 500₺
   - Açıklama: "Kapora"
4. "Ödeme Al" butonuna tıkla

**Sonuç:**
```
✓ 500₺ kapora alındı
⚠️ Kalan: 1,500₺
⚠️ Ödeme tamamlanmadı
```

**Kalan Ödemeyi Alma:**
1. Aynı sipariş detayına git
2. "Ödeme Al" butonuna tıkla (Kalan: 1,500₺)
3. Ödeme bilgilerini gir:
   - Ödeme Türü: Kredi Kartı
   - Tutar: 1,500₺
   - Açıklama: "Kalan ödeme"
4. "Ödeme Al" butonuna tıkla

**Sonuç:**
```
✓ 1,500₺ kalan ödeme alındı
✓ Toplam ödenen: 2,000₺
✓ Sipariş ödemesi tamamlandı
```

### Fazla Ödeme (Para Üstü)

**Senaryo: Müşteri 2,000₺ veriyor, sipariş 1,800₺**

1. Sipariş detayına git (Toplam: 1,800₺)
2. "Ödeme Al" butonuna tıkla
3. Ödeme bilgilerini gir:
   - Ödeme Türü: Nakit
   - Tutar: 2,000₺
   - Açıklama: "Nakit ödeme"
4. Uyarı görünür: "Ödeme tutarı kalan tutardan 200₺ fazla"
5. "Tamam" ile onayla
6. "Ödeme Al" butonuna tıkla

**Sonuç:**
```
✓ 2,000₺ nakit ödeme alındı
⚠️ Para üstü: 200₺
✓ Sipariş ödemesi tamamlandı
```

### Karışık Ödeme (3 Farklı Yöntem)

**Senaryo: Müşteri nakit + kart + havale ile ödüyor**

1. Sipariş detayına git (Toplam: 3,000₺)
2. "Ödeme Al" butonuna tıkla
3. İlk ödeme:
   - Ödeme Türü: Nakit
   - Tutar: 1,000₺
4. "Başka Ödeme Yöntemi Ekle"
5. İkinci ödeme:
   - Ödeme Türü: Kredi Kartı
   - Tutar: 1,500₺
6. "Başka Ödeme Yöntemi Ekle"
7. Üçüncü ödeme:
   - Ödeme Türü: Havale/EFT
   - Tutar: 500₺
8. "Ödeme Al (3 Yöntem)" butonuna tıkla

**Sonuç:**
```
✓ 1,000₺ nakit
✓ 1,500₺ kredi kartı
✓ 500₺ havale
✓ Toplam: 3,000₺
✓ Sipariş ödemesi tamamlandı
```

---

## 🎨 Arayüz Özellikleri

### Ödeme Modal Penceresi

```
┌─────────────────────────────────────────┐
│ Ödeme Al                          [X]   │
│ Kalan: 1,500.00₺                        │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💵 Ödeme Yöntemi 1          [🗑️]   │ │
│ ├─────────────────────────────────────┤ │
│ │ Ödeme Türü: [💵 Nakit ▼]           │ │
│ │ Tutar: [500.00]                     │ │
│ │ Açıklama: [Nakit kısım]            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💳 Ödeme Yöntemi 2          [🗑️]   │ │
│ ├─────────────────────────────────────┤ │
│ │ Ödeme Türü: [💳 Kredi Kartı ▼]    │ │
│ │ Tutar: [1,000.00]                   │ │
│ │ Açıklama: [Kart ile kalan]         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Başka Ödeme Yöntemi Ekle]          │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Kalan Tutar:        1,500.00₺      │ │
│ │ Toplam Ödeme:       1,500.00₺      │ │
│ │ ─────────────────────────────────  │ │
│ │ Fark:                   0.00₺ ✓    │ │
│ │ ✓ Ödeme tam olarak kalan tutara    │ │
│ │   eşit.                             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Ödeme Al (2 Yöntem)]  [İptal]        │
└─────────────────────────────────────────┘
```

### Ödeme Geçmişi

```
┌─────────────────────────────────────────┐
│ Ödeme Geçmişi                           │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 💵 Nakit              500.00₺       │ │
│ │    05.04.2026 14:30                 │ │
│ │    Nakit kısım                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💳 Kredi Kartı      1,000.00₺       │ │
│ │    05.04.2026 14:31                 │ │
│ │    Kart ile kalan                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ─────────────────────────────────────  │
│ Toplam Ödeme Sayısı:      2 işlem      │
│ Nakit:                    500.00₺      │
│ Kredi Kartı:            1,000.00₺      │
│ Havale/EFT:                 0.00₺      │
└─────────────────────────────────────────┘
```

---

## 💡 Kullanım Senaryoları

### Senaryo 1: Restoran Tarzı Ödeme

**Durum:**
- Sipariş: 2,500₺
- Müşteri 1: 1,000₺ nakit verecek
- Müşteri 2: 1,500₺ kart ile ödeyecek

**İşlem:**
```
1. Ödeme Al
2. Ödeme 1: Nakit - 1,000₺ (Müşteri 1)
3. Ödeme Ekle
4. Ödeme 2: Kredi Kartı - 1,500₺ (Müşteri 2)
5. Ödeme Al (2 Yöntem)
```

**Sonuç:**
```
✓ 2 farklı ödeme yöntemi
✓ Toplam: 2,500₺
✓ Ödeme tamamlandı
```

### Senaryo 2: Taksitli Ödeme

**Durum:**
- Sipariş: 5,000₺
- 1. Taksit: 2,000₺ (bugün)
- 2. Taksit: 1,500₺ (1 hafta sonra)
- 3. Taksit: 1,500₺ (2 hafta sonra)

**İşlem 1 (Bugün):**
```
1. Ödeme Al
2. Nakit - 2,000₺ (1. Taksit)
3. Ödeme Al
```

**İşlem 2 (1 Hafta Sonra):**
```
1. Ödeme Al (Kalan: 3,000₺)
2. Kredi Kartı - 1,500₺ (2. Taksit)
3. Ödeme Al
```

**İşlem 3 (2 Hafta Sonra):**
```
1. Ödeme Al (Kalan: 1,500₺)
2. Havale - 1,500₺ (3. Taksit)
3. Ödeme Al
```

**Sonuç:**
```
✓ 3 farklı tarihte ödeme
✓ 3 farklı yöntem
✓ Toplam: 5,000₺
✓ Ödeme tamamlandı
```

### Senaryo 3: Kapora + Kalan

**Durum:**
- Sipariş: 3,000₺
- Kapora: 500₺ (bugün)
- Kalan: 2,500₺ (teslimde)

**İşlem 1 (Sipariş Anında):**
```
1. Ödeme Al
2. Nakit - 500₺ (Kapora)
3. Ödeme Al
```

**İşlem 2 (Teslim Anında):**
```
1. Ödeme Al (Kalan: 2,500₺)
2. Ödeme 1: Nakit - 1,000₺
3. Ödeme Ekle
4. Ödeme 2: Kredi Kartı - 1,500₺
5. Ödeme Al (2 Yöntem)
```

**Sonuç:**
```
✓ Toplam 3 ödeme işlemi
✓ 2 nakit, 1 kredi kartı
✓ Toplam: 3,000₺
✓ Ödeme tamamlandı
```

### Senaryo 4: Fazla Ödeme + İade

**Durum:**
- Sipariş: 1,800₺
- Müşteri: 2,000₺ nakit veriyor

**İşlem:**
```
1. Ödeme Al
2. Nakit - 2,000₺
3. Uyarı: "200₺ fazla, para üstü verilecek"
4. Onayla
5. Ödeme Al
```

**Sonuç:**
```
✓ 2,000₺ alındı
⚠️ 200₺ para üstü verildi
✓ Net ödeme: 1,800₺
✓ Ödeme tamamlandı
```

---

## 🔧 Teknik Detaylar

### Ödeme Yöntemi Yapısı

```javascript
{
  id: number,              // Benzersiz ID
  tutar: number,           // Ödeme tutarı
  odeme_turu: string,      // 'nakit', 'kredi_karti', 'havale', 'veresiye'
  aciklama: string         // Ödeme açıklaması
}
```

### Veritabanı Kaydı

```javascript
// Her ödeme yöntemi ayrı kayıt olarak eklenir
await db.payments.add({
  siparis_id: orderId,
  tarih: new Date().toISOString(),
  tutar: parseFloat(payment.tutar),
  odeme_turu: payment.odeme_turu,
  aciklama: payment.aciklama
});
```

### Sipariş Güncelleme

```javascript
// Toplam ödenen tutar güncellenir
const yeniOdenen = (order.odenen_toplam || 0) + toplamOdenen;
const odeme_tamamlandi = yeniOdenen >= order.genel_toplam;

await db.orders.update(orderId, {
  odenen_toplam: yeniOdenen,
  odeme_tamamlandi
});
```

### Hesaplama Mantığı

```javascript
// Toplam ödenen
const toplamOdenen = paymentMethods.reduce(
  (sum, p) => sum + (parseFloat(p.tutar) || 0), 
  0
);

// Fark hesaplama
const fark = toplamOdenen - kalanTutar;

// Durum kontrolü
if (fark > 0) {
  // Para üstü verilecek
} else if (fark < 0) {
  // Borç kalacak
} else {
  // Tam ödeme
}
```

---

## 📊 Ödeme İstatistikleri

### Sipariş Detayında

```
Ödeme Geçmişi
─────────────────────────────
Toplam Ödeme Sayısı: 5 işlem
Nakit:              2,500₺
Kredi Kartı:        3,000₺
Havale/EFT:         1,000₺
Veresiye:             500₺
─────────────────────────────
TOPLAM:             7,000₺
```

### Raporlarda (Gelecek Özellik)

```
Ödeme Yöntemi Dağılımı
─────────────────────────────
💵 Nakit:        45% (15,000₺)
💳 Kredi Kartı:  35% (12,000₺)
🏦 Havale/EFT:   15% (5,000₺)
📝 Veresiye:      5% (2,000₺)
─────────────────────────────
TOPLAM:         100% (34,000₺)
```

---

## 🎯 Avantajlar

### Müşteri İçin
✅ Ödeme esnekliği
✅ Birden fazla kart kullanabilme
✅ Kısmi ödeme yapabilme
✅ Farklı yöntemleri birleştirebilme

### İşletme İçin
✅ Daha fazla satış
✅ Müşteri memnuniyeti
✅ Detaylı ödeme takibi
✅ Nakit akışı yönetimi

### Muhasebe İçin
✅ Ödeme türü bazında raporlama
✅ Detaylı ödeme geçmişi
✅ Kolay mutabakat
✅ Vergi uyumluluğu

---

## 💡 İpuçları

### Ödeme Alırken
✅ Her ödeme yöntemine açıklama ekleyin
✅ Toplam tutarı kontrol edin
✅ Para üstü uyarılarına dikkat edin
✅ Makbuz yazdırın

### Kısmi Ödeme
✅ "Kapora" açıklaması ekleyin
✅ Kalan tutarı not edin
✅ Teslim tarihini hatırlatın
✅ Müşteriyi bilgilendirin

### Çoklu Yöntem
✅ Her yöntemi ayrı açıklayın
✅ Hangi müşterinin ödediğini belirtin
✅ Toplam tutarı doğrulayın
✅ Makbuz üzerinde gösterin

### Fazla Ödeme
✅ Para üstünü hemen verin
✅ Makbuzda belirtin
✅ Müşteriye onaylat
✅ Kasayı kontrol edin

---

## 🚀 Gelecek Geliştirmeler

### v1.4 (Planlanan)
- [ ] Ödeme planı oluşturma
- [ ] Otomatik taksit hesaplama
- [ ] SMS/Email ödeme hatırlatıcı
- [ ] QR kod ile ödeme

### v1.5 (Planlanan)
- [ ] Pos entegrasyonu
- [ ] Online ödeme (Stripe, PayPal)
- [ ] Dijital cüzdan desteği
- [ ] Kripto para ödeme

### v2.0 (Planlanan)
- [ ] Ödeme analitikleri
- [ ] Tahsilat raporları
- [ ] Müşteri bazlı ödeme geçmişi
- [ ] Otomatik fatura kesme

---

## 📞 Sorun Giderme

### Ödeme Eklenmiyor
1. Tutar alanını kontrol et (0'dan büyük olmalı)
2. Ödeme türünü seç
3. İnternet bağlantısını kontrol et
4. Tarayıcı konsolunu kontrol et

### Toplam Yanlış Hesaplanıyor
1. Her ödeme tutarını kontrol et
2. Virgül/nokta kullanımına dikkat et
3. Sayfayı yenile (F5)
4. Tarayıcı önbelleğini temizle

### Ödeme Geçmişi Görünmüyor
1. Sayfayı yenile
2. Sipariş ID'sini kontrol et
3. Veritabanı bağlantısını kontrol et
4. Tarayıcı konsolunu kontrol et

---

## 📚 Dokümantasyon

- **COKLU_ODEME_SISTEMI.md** - Bu dosya (detaylı kılavuz)
- **YENI_OZELLIKLER.md** - Tüm yeni özellikler
- **KULLANIM_KILAVUZU.md** - Genel kullanım

---

**Versiyon:** 1.3.0  
**Tarih:** 05.04.2026  
**Durum:** Production Ready ✅
