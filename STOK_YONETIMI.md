# 📦 Stok Yönetim Sistemi

## Genel Bakış

Gözlük Yönetim Sistemi, kapsamlı bir stok yönetim sistemi ile donatılmıştır. Bu sistem, tüm ürün tiplerinde (çerçeve, cam, aksesuar) otomatik stok takibi, düşük stok uyarıları ve stok hareket geçmişi sağlar.

---

## 🎯 Ana Özellikler

### 1. Otomatik Stok Yönetimi
- ✅ Sipariş oluşturulduğunda otomatik stok düşürme
- ✅ Sipariş iptal edildiğinde otomatik stok iadesi
- ✅ Tüm ürün tipleri için stok takibi
- ✅ Stok hareket geçmişi

### 2. Stok Kontrolleri
- ✅ Sipariş öncesi stok kontrolü
- ✅ Yetersiz stok uyarıları
- ✅ Düşük stok uyarıları
- ✅ Gerçek zamanlı stok gösterimi

### 3. Görsel Göstergeler
- ✅ Stok durumu ikonları (✓, ⚠️, ❌)
- ✅ Renkli uyarılar (yeşil, turuncu, kırmızı)
- ✅ Dashboard stok kartları
- ✅ Ürün seçiminde stok bilgisi

---

## 📊 Stok Durumu Göstergeleri

### Sipariş Formunda

```
┌─────────────────────────────────────────┐
│ Ürün Seçimi                             │
├─────────────────────────────────────────┤
│ Ray-Ban RB2140 - Stok: 15 ✓            │
│ Oakley Frogskins - Stok: 3 ⚠️ DÜŞÜK    │
│ Prada PR01OS - Stok: 0 ❌ STOK YOK     │
└─────────────────────────────────────────┘
```

### Gösterge Anlamları

| Gösterge | Durum | Açıklama |
|----------|-------|----------|
| ✓ Yeşil | Yeterli | Stok minimum seviyenin üzerinde |
| ⚠️ Turuncu | Düşük | Stok minimum seviyede veya altında |
| ❌ Kırmızı | Yok | Stok tükendi, seçilemez |

---

## 🔄 Stok İşlemleri

### 1. Sipariş Oluşturma

**Adımlar:**
1. Yeni sipariş sayfasına git
2. Müşteri seç
3. Ürün ekle
4. Stok durumunu kontrol et
5. Sipariş oluştur

**Stok Kontrolü:**
```javascript
// Sipariş oluşturulmadan önce
✓ Tüm ürünlerin stok durumu kontrol edilir
✓ Yetersiz stok varsa uyarı verilir
✓ Sipariş oluşturulamaz

// Sipariş oluşturulduğunda
✓ Her ürün için stok düşürülür
✓ Stok hareketi kaydedilir
✓ Sipariş detayına yönlendirilir
```

**Örnek:**
```
Ürün: Ray-Ban Aviator
Mevcut Stok: 10
Sipariş Miktarı: 2

İşlem Sonrası:
Yeni Stok: 8
Hareket: "Sipariş: OPT-2026-00001 - çerçeve"
```

### 2. Sipariş İptali

**Adımlar:**
1. Sipariş detayına git
2. Durum: "İptal" seç
3. Onay ver
4. Stok otomatik iade edilir

**Stok İadesi:**
```javascript
// İptal edildiğinde
✓ Tüm ürünlerin stoku geri eklenir
✓ Stok hareketi kaydedilir
✓ Bildirim gösterilir
✓ Durum değişikliği engellenir
```

**Örnek:**
```
Ürün: Ray-Ban Aviator
İptal Öncesi Stok: 8
İptal Edilen Miktar: 2

İşlem Sonrası:
Yeni Stok: 10
Hareket: "İptal: OPT-2026-00001 - çerçeve (Stok İadesi)"
```

### 3. Manuel Stok Güncelleme

**Ürün Detayında:**
1. Ürün detayına git
2. "Stok Ekle" veya "Stok Çıkar" butonuna tıkla
3. Miktar gir
4. Açıklama yaz
5. Kaydet

**Stok Hareketi:**
```javascript
{
  hareket_tipi: 'giris' veya 'cikis',
  miktar: number,
  aciklama: string,
  tarih: datetime
}
```

---

## 🚨 Düşük Stok Uyarıları

### Dashboard'da

```
┌─────────────────────────────────┐
│ ⚠️ Düşük Stok Uyarıları         │
├─────────────────────────────────┤
│ Ray-Ban Aviator                 │
│ Çerçeve          Stok: 3/10     │
│                                 │
│ Essilor Varilux                 │
│ Lens             Stok: 2/5      │
│                                 │
│ Temizlik Bezi                   │
│ Aksesuar         Stok: 1/20     │
└─────────────────────────────────┘
```

### Minimum Stok Seviyesi

Her ürün için minimum stok seviyesi belirlenebilir:

**Varsayılan:** 5 adet

**Özelleştirme:**
1. Ürün detayına git
2. "Düzenle" butonuna tıkla
3. "Minimum Stok Uyarı" alanını doldur
4. Kaydet

**Örnek:**
```
Ürün: Ray-Ban Aviator
Minimum Stok: 10
Mevcut Stok: 8

Durum: ⚠️ Düşük Stok (Dashboard'da gösterilir)
```

---

## 📈 Stok Hareket Geçmişi

### Ürün Detayında

```
┌─────────────────────────────────────────────────┐
│ Stok Hareketleri                                │
├─────────────────────────────────────────────────┤
│ 05.04.2026 14:30                                │
│ ↓ ÇIKIŞ: 2 adet                                 │
│ Sipariş: OPT-2026-00001 - çerçeve               │
│ Önceki: 10 → Sonraki: 8                         │
├─────────────────────────────────────────────────┤
│ 04.04.2026 10:15                                │
│ ↑ GİRİŞ: 20 adet                                │
│ Tedarikçi: Luxottica - Yeni Sevkiyat            │
│ Önceki: 0 → Sonraki: 20                         │
├─────────────────────────────────────────────────┤
│ 03.04.2026 16:45                                │
│ ↑ GİRİŞ: 2 adet                                 │
│ İptal: OPT-2026-00005 (Stok İadesi)             │
│ Önceki: 8 → Sonraki: 10                         │
└─────────────────────────────────────────────────┘
```

### Hareket Tipleri

| Tip | İkon | Açıklama |
|-----|------|----------|
| Giriş | ↑ | Stok artışı (alım, iade) |
| Çıkış | ↓ | Stok azalışı (satış, fire) |

---

## 🛠️ Teknik Detaylar

### Stok Yönetim Fonksiyonları

**Dosya:** `src/utils/stockManager.js`

#### 1. decreaseStockForOrder()
```javascript
/**
 * Sipariş için stok düşür
 * @param {number} orderId - Sipariş ID
 * @param {string} fisNo - Fiş numarası
 */
await decreaseStockForOrder(orderId, fisNo);
```

**Kullanım:**
- Sipariş oluşturulduğunda otomatik çağrılır
- Tüm sipariş kalemlerini işler
- Yetersiz stok varsa hata fırlatır

#### 2. restoreStockForOrder()
```javascript
/**
 * Sipariş iptal edildiğinde stok geri ekle
 * @param {number} orderId - Sipariş ID
 * @param {string} fisNo - Fiş numarası
 */
await restoreStockForOrder(orderId, fisNo);
```

**Kullanım:**
- Sipariş iptal edildiğinde otomatik çağrılır
- Tüm sipariş kalemlerinin stokunu iade eder

#### 3. checkStockAvailability()
```javascript
/**
 * Ürün stok durumunu kontrol et
 * @param {number} productId - Ürün ID
 * @param {number} requestedAmount - İstenen miktar
 * @returns {Promise<{available, current, message}>}
 */
const check = await checkStockAvailability(productId, amount);
if (!check.available) {
  alert(check.message);
}
```

**Dönüş:**
```javascript
{
  available: boolean,
  current: number,
  message: string
}
```

#### 4. checkLowStock()
```javascript
/**
 * Düşük stok uyarısı kontrolü
 * @param {number} productId - Ürün ID
 * @returns {Promise<{isLow, current, minimum}>}
 */
const check = await checkLowStock(productId);
if (check.isLow) {
  console.log('Düşük stok uyarısı!');
}
```

**Dönüş:**
```javascript
{
  isLow: boolean,
  current: number,
  minimum: number
}
```

#### 5. bulkStockUpdate()
```javascript
/**
 * Toplu stok güncelleme
 * @param {Array} updates - Güncellemeler
 * @param {string} type - 'giris' veya 'cikis'
 * @param {string} reason - Sebep
 */
await bulkStockUpdate([
  { productId: 1, amount: 10 },
  { productId: 2, amount: 5 }
], 'giris', 'Toplu alım');
```

#### 6. performStockCount()
```javascript
/**
 * Stok sayımı yap
 * @param {Array} counts - Sayım sonuçları
 * @returns {Promise<Array>} - Farklar
 */
const results = await performStockCount([
  { productId: 1, actualStock: 15 },
  { productId: 2, actualStock: 8 }
]);
```

**Dönüş:**
```javascript
[
  {
    productId: 1,
    difference: 2,
    action: 'Eklendi'
  }
]
```

### Veritabanı Şeması

**products tablosu:**
```javascript
{
  id: number,
  barkod: string,
  sku: string,
  marka: string,
  model: string,
  kategori: string,
  stok_adedi: number,           // Mevcut stok
  min_stok_uyari: number,       // Minimum stok seviyesi
  alis_fiyati: number,
  satis_fiyati: number,
  aktif: boolean
}
```

**stock_movements tablosu:**
```javascript
{
  id: number,
  urun_id: number,              // Ürün ID
  hareket_tipi: string,         // 'giris' veya 'cikis'
  miktar: number,               // Hareket miktarı
  onceki_stok: number,          // İşlem öncesi stok
  sonraki_stok: number,         // İşlem sonrası stok
  referans_id: number,          // Sipariş ID (varsa)
  aciklama: string,             // Açıklama
  tarih: datetime               // İşlem tarihi
}
```

---

## 📋 Kullanım Senaryoları

### Senaryo 1: Normal Satış İşlemi

**Durum:**
- Müşteri: Ahmet Yılmaz
- Ürün: Ray-Ban Aviator
- Mevcut Stok: 10
- Sipariş Miktarı: 2

**İşlem Adımları:**
1. Yeni sipariş oluştur
2. Müşteri seç: Ahmet Yılmaz
3. Ürün ekle: Ray-Ban Aviator (Stok: 10 ✓)
4. Miktar: 2
5. Sipariş oluştur

**Sonuç:**
```
✓ Sipariş oluşturuldu: OPT-2026-00001
✓ Stok düşürüldü: 10 → 8
✓ Hareket kaydedildi
✓ Müşteriye yönlendirildi
```

### Senaryo 2: Yetersiz Stok

**Durum:**
- Müşteri: Mehmet Demir
- Ürün: Oakley Frogskins
- Mevcut Stok: 1
- Sipariş Miktarı: 3

**İşlem Adımları:**
1. Yeni sipariş oluştur
2. Müşteri seç: Mehmet Demir
3. Ürün ekle: Oakley Frogskins (Stok: 1 ⚠️)
4. Miktar: 3
5. Sipariş oluştur

**Sonuç:**
```
❌ Hata: Oakley Frogskins için yeterli stok yok!
   Mevcut: 1, İstenen: 3
❌ Sipariş oluşturulamadı
```

### Senaryo 3: Sipariş İptali

**Durum:**
- Sipariş: OPT-2026-00001
- Ürün: Ray-Ban Aviator
- Mevcut Stok: 8
- İptal Edilen Miktar: 2

**İşlem Adımları:**
1. Sipariş detayına git
2. Durum: "İptal" seç
3. Onay ver

**Sonuç:**
```
✓ Sipariş iptal edildi
✓ Stok iade edildi: 8 → 10
✓ Hareket kaydedildi
✓ Durum değişikliği engellendi
```

### Senaryo 4: Düşük Stok Uyarısı

**Durum:**
- Ürün: Ray-Ban Aviator
- Minimum Stok: 10
- Mevcut Stok: 8

**Dashboard:**
```
⚠️ Düşük Stok Uyarıları (1)

Ray-Ban Aviator
Çerçeve          Stok: 8/10
```

**Aksiyon:**
1. Dashboard'da uyarıyı gör
2. Ürüne tıkla
3. Stok ekle veya tedarikçiye sipariş ver

### Senaryo 5: Toplu Stok Girişi

**Durum:**
- Tedarikçi: Luxottica
- Sevkiyat: 5 farklı ürün

**İşlem:**
```javascript
await bulkStockUpdate([
  { productId: 1, amount: 20 },  // Ray-Ban Aviator
  { productId: 2, amount: 15 },  // Ray-Ban Wayfarer
  { productId: 3, amount: 10 },  // Oakley Frogskins
  { productId: 4, amount: 12 },  // Prada PR01OS
  { productId: 5, amount: 8 }    // Gucci GG0061S
], 'giris', 'Luxottica - Sevkiyat #2026-04-05');
```

**Sonuç:**
```
✓ 5 ürün için stok güncellendi
✓ Toplam 65 adet eklendi
✓ Hareketler kaydedildi
```

---

## 🎓 En İyi Uygulamalar

### 1. Düzenli Stok Kontrolü
- Her gün Dashboard'u kontrol edin
- Düşük stok uyarılarını takip edin
- Minimum stok seviyelerini güncelleyin

### 2. Stok Sayımı
- Ayda bir fiziksel stok sayımı yapın
- `performStockCount()` fonksiyonunu kullanın
- Farkları analiz edin

### 3. Tedarikçi Yönetimi
- Düşük stoklu ürünler için otomatik sipariş verin
- Tedarik sürelerini takip edin
- Toplu alımlarda indirim isteyin

### 4. Raporlama
- Stok hareket raporlarını inceleyin
- En çok satan ürünleri belirleyin
- Yavaş hareket eden ürünleri tespit edin

### 5. Güvenlik
- Stok işlemlerini logla
- Yetkisiz erişimi engelleyin
- Kritik stok seviyelerinde bildirim gönderin

---

## 🔮 Gelecek Özellikler

### v1.3 (Planlanan)
- [ ] Toplu stok güncelleme UI
- [ ] Stok sayımı sayfası
- [ ] Stok rezervasyon sistemi
- [ ] Otomatik stok sipariş önerileri
- [ ] Stok rapor sayfası
- [ ] Barkod okuyucu entegrasyonu
- [ ] Tedarikçi entegrasyonu
- [ ] Stok uyarı bildirimleri

---

## 📞 Destek

Stok yönetimi ile ilgili sorularınız için:
- Dokümantasyonu inceleyin
- Örnek senaryoları deneyin
- Teknik destek ekibiyle iletişime geçin

---

**Versiyon:** 1.2.0  
**Son Güncelleme:** 05.04.2026  
**Durum:** Production Ready ✅
