# 🆕 Yeni Özellikler

## 🔐 Login Sistemi

### Özellikler
- ✅ Kullanıcı girişi ve kayıt
- ✅ Şifre hash'leme (SHA-256)
- ✅ Oturum yönetimi (localStorage)
- ✅ Otomatik yönlendirme
- ✅ İlk kurulum sihirbazı
- ✅ Çıkış yapma

### İlk Kullanım

Sisteme ilk kez girdiğinizde:
1. Otomatik olarak kayıt ekranı açılır
2. Yönetici hesabınızı oluşturun:
   - Ad Soyad
   - Email
   - Kullanıcı Adı
   - Şifre (min 6 karakter)
3. Hesap oluşturulduktan sonra otomatik giriş yapılır

### Giriş Yapma

1. Tarayıcıda http://localhost:3000 adresini açın
2. Kullanıcı adı ve şifrenizi girin
3. "Giriş Yap" butonuna tıklayın

### Çıkış Yapma

1. Sol menüde en altta "Çıkış Yap" butonuna tıklayın
2. Onaylayın
3. Login ekranına yönlendirilirsiniz

### Güvenlik

- Şifreler SHA-256 ile hash'lenir
- Oturum bilgileri localStorage'da saklanır
- Her sayfa korumalıdır (ProtectedRoute)
- Oturum açmadan sisteme erişilemez

---

## 🆔 TC Kimlik Numarası

### Özellikler
- ✅ TC Kimlik alanı eklendi
- ✅ Unique (benzersiz) kontrol
- ✅ 11 haneli format kontrolü
- ✅ Arama özelliği

### Kullanım

**Müşteri Eklerken:**
1. Müşteri formunda "TC Kimlik No" alanını doldurun
2. 11 haneli TC kimlik numarasını girin
3. Sistem otomatik olarak benzersizlik kontrolü yapar
4. Aynı TC kimlik varsa uyarı verir

**Arama:**
- Müşteri listesinde arama kutusuna TC kimlik yazın
- Kısmi arama desteklenir (son 4 hane ile arama yapabilirsiniz)

**Müşteri Listesi:**
- TC Kimlik sütunu eklendi
- Tüm müşterilerin TC kimlikleri görüntülenir
- TC kimlik yoksa "-" gösterilir

---

## 👥 Referans (Parent) Sistemi

### Özellikler
- ✅ Müşteri referans takibi
- ✅ "Kim getirdi?" bilgisi
- ✅ Referans ağacı görüntüleme
- ✅ Çift yönlü ilişki

### Kullanım

**Yeni Müşteri Eklerken:**
1. Müşteri formunda "Referans (Kim Getirdi?)" alanını bulun
2. Dropdown'dan bu müşteriyi getiren kişiyi seçin
3. Kaydedin

**Müşteri Detayında:**

Referans bilgileri otomatik olarak gösterilir:

**1. Bu müşteriyi getiren:**
```
┌─────────────────────────────────┐
│ Bu müşteriyi getiren:           │
│ Ahmet Yılmaz - 0532 123 45 67  │
└─────────────────────────────────┘
```

**2. Bu müşterinin getirdiği müşteriler:**
```
┌─────────────────────────────────┐
│ Bu müşterinin getirdiği (3):    │
│ • Mehmet Demir - 0533 xxx       │
│ • Ayşe Kaya - 0534 xxx          │
│ • Fatma Öz - 0535 xxx           │
└─────────────────────────────────┘
```

### Faydaları

1. **Müşteri Sadakati:**
   - Hangi müşterilerin referans getirdiğini görün
   - Sadık müşterileri belirleyin
   - Özel kampanyalar planlayın

2. **Pazarlama:**
   - Referans ağını analiz edin
   - En çok referans getiren müşterileri ödüllendirin
   - Ağızdan ağıza pazarlamayı ölçün

3. **İlişki Yönetimi:**
   - Müşteri ilişkilerini görselleştirin
   - Aile/arkadaş gruplarını tanıyın
   - Toplu kampanyalar düzenleyin

### Örnek Senaryo

```
Ali Yılmaz (Ana Müşteri)
├── Veli Demir (Ali'nin getirdiği)
│   ├── Ayşe Kaya (Veli'nin getirdiği)
│   └── Mehmet Öz (Veli'nin getirdiği)
└── Fatma Arslan (Ali'nin getirdiği)
```

Bu yapıda:
- Ali Yılmaz 2 müşteri getirmiş
- Veli Demir de 2 müşteri getirmiş
- Toplam 5 kişilik bir referans ağı var

---

## 🎯 Kullanım Örnekleri

### Senaryo 1: Yeni Müşteri + Referans

1. **Ahmet Yılmaz** geldi (ilk müşteri)
   - TC: 12345678901
   - Telefon: 0532 111 11 11
   - Referans: Yok
   - Kaydet

2. **Mehmet Demir** geldi (Ahmet'in arkadaşı)
   - TC: 98765432109
   - Telefon: 0533 222 22 22
   - Referans: Ahmet Yılmaz
   - Kaydet

3. **Ayşe Kaya** geldi (Mehmet'in eşi)
   - TC: 11122233344
   - Telefon: 0534 333 33 33
   - Referans: Mehmet Demir
   - Kaydet

### Senaryo 2: TC Kimlik ile Arama

1. Müşteriler sayfasına git
2. Arama kutusuna "12345" yaz
3. TC kimliği 12345 ile başlayan müşteriler listelenir
4. Hızlı erişim sağlanır

### Senaryo 3: Referans Analizi

1. Ahmet Yılmaz'ın detayına git
2. "Referans Bilgileri" bölümünü gör
3. Ahmet'in getirdiği 2 müşteri görüntülenir
4. Her birine tıklayarak detaylarına git

---

## 🔧 Teknik Detaylar

### Veritabanı Değişiklikleri

**users tablosu (yeni):**
```javascript
{
  id: number,
  username: string (unique),
  password: string (hashed),
  email: string,
  fullName: string,
  role: string,
  createdAt: datetime,
  lastLogin: datetime
}
```

**customers tablosu (güncellendi):**
```javascript
{
  id: number,
  tc_kimlik: string (unique, nullable),  // YENİ
  parent_id: number (nullable),           // YENİ
  ad: string,
  soyad: string,
  telefon: string,
  email: string,
  adres: text,
  dogum_tarihi: date,
  meslek: string,
  notlar: text,
  olusturma_tarihi: datetime,
  guncelleme_tarihi: datetime
}
```

### Index'ler

```javascript
db.version(1).stores({
  users: '++id, &username, email',
  customers: '++id, &tc_kimlik, telefon, ad, soyad, email, parent_id, olusturma_tarihi',
  // ... diğer tablolar
});
```

- `&tc_kimlik`: Unique index (benzersiz)
- `parent_id`: Foreign key index (hızlı sorgular için)

### Auth Fonksiyonları

```javascript
// Kullanıcı oluştur
createUser(username, password, email, fullName)

// Giriş yap
login(username, password)

// Çıkış yap
logout()

// Mevcut kullanıcı
getCurrentUser()

// Oturum kontrolü
isAuthenticated()

// İlk kullanıcı var mı?
hasUsers()
```

---

## 📊 Raporlama İmkanları

### Referans Raporu (Gelecek Özellik)

```
En Çok Referans Getiren Müşteriler:
1. Ahmet Yılmaz - 5 müşteri
2. Mehmet Demir - 3 müşteri
3. Ayşe Kaya - 2 müşteri
```

### TC Kimlik Kontrolü

- Müşteri kaydı sırasında otomatik kontrol
- Duplicate (tekrar) kayıt önlenir
- Veri bütünlüğü sağlanır

---

## 📦 Gelişmiş Stok Yönetimi

### Özellikler
- ✅ Sipariş oluşturulurken otomatik stok düşürme
- ✅ Sipariş iptal edildiğinde otomatik stok iadesi
- ✅ Tüm ürün tipleri için stok takibi (çerçeve, cam, aksesuar vb.)
- ✅ Sipariş öncesi stok kontrolü
- ✅ Yetersiz stok uyarıları
- ✅ Düşük stok uyarıları (Dashboard'da)
- ✅ Ürün seçiminde gerçek zamanlı stok gösterimi
- ✅ Stok durumu göstergeleri (✓ Yeterli, ⚠️ Düşük, ❌ Yok)
- ✅ Stok hareket geçmişi

### Stok Yönetim Fonksiyonları

**stockManager.js** dosyasında bulunan yardımcı fonksiyonlar:

```javascript
// Sipariş için stok düşür
decreaseStockForOrder(orderId, fisNo)

// İptal edilen sipariş için stok iade et
restoreStockForOrder(orderId, fisNo)

// Stok durumu kontrol et
checkStockAvailability(productId, requestedAmount)

// Düşük stok kontrolü
checkLowStock(productId)

// Toplu stok güncelleme
bulkStockUpdate(updates, type, reason)

// Stok sayımı
performStockCount(counts)
```

### Kullanım

**1. Sipariş Oluşturma:**
- Ürün seçerken stok durumunu görürsünüz
- Stok göstergeleri:
  - ✓ **Yeşil**: Yeterli stok
  - ⚠️ **Turuncu**: Düşük stok (minimum seviyenin altında)
  - ❌ **Kırmızı**: Stok yok (seçilemez)
- Yetersiz stok varsa sipariş oluşturulamaz
- Sipariş oluşturulduğunda stok otomatik düşer

**2. Sipariş İptali:**
- Sipariş durumunu "İptal" olarak değiştirin
- Sistem otomatik olarak stoku geri ekler
- İptal edilen siparişte stok iadesi bildirimi gösterilir
- İptal sonrası durum değişikliği yapılamaz

**3. Dashboard Stok Uyarıları:**
- Ana sayfada "Düşük Stok Uyarıları" kartı
- Düşük stoklu ürünler listesi
- Her ürün için mevcut ve minimum stok gösterimi
- Ürün detayına hızlı erişim

**4. Stok Takibi:**
- Ürün detayında stok hareket geçmişi
- Her hareketin tarihi, tipi ve miktarı
- Referans bilgisi (hangi sipariş için)

### Stok Göstergeleri

**Sipariş Formunda:**
```
Ray-Ban RB2140 - Stok: 15 ✓
Oakley Frogskins - Stok: 3 ⚠️ DÜŞÜK
Prada PR01OS - Stok: 0 ❌ STOK YOK
```

**Dashboard'da:**
```
┌─────────────────────────────────┐
│ Düşük Stok Uyarıları            │
│                                 │
│ Ray-Ban Aviator                 │
│ Çerçeve          Stok: 3/10     │
│                                 │
│ Essilor Varilux                 │
│ Lens             Stok: 2/5      │
└─────────────────────────────────┘
```

### Örnek Senaryolar

**Senaryo 1: Normal Satış**
1. Müşteri için sipariş oluştur
2. Çerçeve seç (Stok: 10 → 9)
3. Sipariş onaylandı
4. Stok otomatik düştü
5. Stok hareketi kaydedildi

**Senaryo 2: Yetersiz Stok**
1. Müşteri için sipariş oluştur
2. Çerçeve seç (Stok: 1)
3. Adet: 2 gir
4. Sipariş oluştur butonuna tıkla
5. Hata: "Yetersiz stok! Mevcut: 1, İstenen: 2"
6. Sipariş oluşturulamaz

**Senaryo 3: Sipariş İptali**
1. Mevcut siparişi aç (Stok: 8)
2. Durum: "İptal" seç
3. Onay ver
4. Stok geri eklendi (Stok: 9)
5. Bildirim: "Stok geri eklendi"
6. Durum değiştirilemez

**Senaryo 4: Düşük Stok Uyarısı**
1. Dashboard'a git
2. "Düşük Stok Uyarıları" kartını gör
3. Düşük stoklu ürünleri listele
4. Ürüne tıkla
5. Stok ekle veya sipariş ver

### Stok Hareket Tipleri

```javascript
// Giriş (Stok Artışı)
'giris' - Yeni ürün alımı
'giris' - İptal edilen sipariş iadesi
'giris' - Stok sayımı düzeltmesi

// Çıkış (Stok Azalışı)
'cikis' - Sipariş satışı
'cikis' - Fire/Hasar
'cikis' - Stok sayımı düzeltmesi
```

### Teknik Detaylar

**Stok Güncelleme:**
```javascript
// Otomatik stok düşürme
await decreaseStockForOrder(orderId, fisNo);

// Otomatik stok iadesi
await restoreStockForOrder(orderId, fisNo);

// Manuel stok kontrolü
const check = await checkStockAvailability(productId, amount);
if (!check.available) {
  alert(check.message);
}
```

**Stok Hareket Kaydı:**
```javascript
{
  urun_id: number,
  hareket_tipi: 'giris' | 'cikis',
  miktar: number,
  onceki_stok: number,
  sonraki_stok: number,
  referans_id: number (sipariş ID),
  aciklama: string,
  tarih: datetime
}
```

### Minimum Stok Uyarı Seviyesi

Her ürün için minimum stok seviyesi belirlenebilir:
- Varsayılan: 5 adet
- Ürün detayında özelleştirilebilir
- Bu seviyenin altına düşünce uyarı verilir
- Dashboard'da otomatik listelenir

---

## 🖨️ Profesyonel A5 Sipariş Formu Yazdırma

### Özellikler
- ✅ A5 kağıt boyutu (148mm x 210mm)
- ✅ Profesyonel tasarım ve düzen
- ✅ Şirket logosu ve bilgileri
- ✅ Detaylı sipariş bilgileri
- ✅ Müşteri bilgileri
- ✅ Reçete bilgileri (varsa)
- ✅ Ürün tablosu
- ✅ Toplam hesaplamalar
- ✅ İmza alanları (müşteri ve yetkili)
- ✅ Yazdırma tarihi
- ✅ Özelleştirilebilir firma bilgileri

### Kullanım

**Sipariş Formu Yazdırma:**
1. Sipariş detay sayfasına git
2. Sağ üstteki "Yazdır" butonuna tıkla
3. VEYA `Ctrl+P` (Windows) / `Cmd+P` (Mac)
4. Yazıcı ayarlarını kontrol et:
   - Kağıt: A5
   - Yönlendirme: Dikey
   - Kenar boşlukları: Yok
5. Yazdır

**Firma Bilgilerini Özelleştirme:**
1. Ayarlar sayfasına git
2. "Firma Bilgileri" bölümünü bul
3. Bilgileri düzenle:
   - Firma Adı
   - Slogan
   - Adres
   - Telefon
   - Email
   - Vergi No
4. "Kaydet" butonuna tıkla
5. Artık tüm yazdırmalarda yeni bilgiler görünecek

### Form İçeriği

**1. Üst Bilgi:**
- Firma adı ve logosu
- Slogan
- İletişim bilgileri
- Vergi numarası

**2. Sipariş Bilgileri:**
- Fiş numarası (barkod formatında)
- Sipariş tarihi
- Teslim tarihi
- Sipariş durumu (renkli badge)

**3. Müşteri Bilgileri:**
- Ad soyad
- Telefon
- TC kimlik (varsa)
- Email (varsa)

**4. Reçete Bilgileri (varsa):**
- Sağ göz: SPH, CYL, AXIS, PD
- Sol göz: SPH, CYL, AXIS, PD
- Profesyonel tablo formatında

**5. Sipariş Kalemleri:**
- Kalem tipi (çerçeve, cam, işçilik)
- Ürün açıklaması
- Adet
- Birim fiyat
- İndirim
- Toplam

**6. Toplam Hesaplamalar:**
- Ara toplam
- İndirim (kırmızı)
- KDV (%20)
- Genel toplam (kalın)
- Ödenen (yeşil)
- Kalan (turuncu)

**7. Notlar:**
- Sipariş notları (varsa)
- Özel açıklamalar

**8. İmza Alanları:**
- Müşteri imzası
- Yetkili imzası
- İmza çizgileri

**9. Alt Bilgi:**
- Teşekkür mesajı
- Yazdırma tarihi
- Yasal uyarılar

### Teknik Detaylar

**Yazı Boyutları:**
- Logo: 24px
- Başlıklar: 11px
- Normal metin: 9px
- Küçük metin: 8px
- Genel toplam: 12px

**Renkler:**
- Başlıklar: Siyah (#000)
- Normal metin: Koyu gri (#333)
- Kenarlıklar: Açık gri (#DDD)
- İndirim: Kırmızı (#DC2626)
- Ödenen: Yeşil (#16A34A)
- Kalan: Turuncu (#EA580C)

**Sayfa Düzeni:**
- Boyut: 148mm x 210mm (A5)
- Kenar boşlukları: 10mm
- Yönlendirme: Dikey (Portrait)
- Sayfa sonu: Otomatik

### Yazıcı Ayarları

**Önerilen:**
- Kağıt: A5 (148mm x 210mm)
- Yönlendirme: Dikey
- Kenar boşlukları: Yok veya Minimum
- Renk: Siyah-Beyaz (önerilir)
- Kalite: Normal veya Yüksek

**Yazıcı Türleri:**
- Lazer yazıcı (önerilir - hızlı ve ekonomik)
- Inkjet yazıcı (renkli çıktı için)
- Termal yazıcı (çok hızlı ama özel kağıt gerektirir)

### Kullanım Senaryoları

**Senaryo 1: Normal Sipariş**
1. Sipariş oluştur
2. Ödeme al
3. Formu yazdır
4. Müşteriye imzalat
5. Bir kopyasını müşteriye ver
6. Bir kopyasını arşivle

**Senaryo 2: Reçeteli Sipariş**
1. Müşteri ve reçete kaydı oluştur
2. Sipariş oluştur (reçete seç)
3. Yazdır
4. Formda reçete bilgileri otomatik görünür
5. Müşteriye teslim et

**Senaryo 3: Toplu Yazdırma**
1. Bugün teslim edilecek siparişleri listele
2. Her siparişi sırayla aç ve yazdır
3. Tüm formları arşivle

**Senaryo 4: Arşiv Kopyası**
1. Eski siparişi bul
2. Yazdır
3. "Kopya" damgası vur (opsiyonel)
4. Müşteriye ver

### Avantajlar

**Profesyonellik:**
- Düzenli ve temiz görünüm
- Firma kimliğini yansıtır
- Müşteri güveni artırır

**Yasal Uygunluk:**
- Tüm gerekli bilgiler mevcut
- İmza alanları var
- Vergi numarası görünür

**Pratiklik:**
- Tek tuşla yazdırma
- Otomatik sayfa düzeni
- A5 kağıda tam oturur

**Ekonomik:**
- A5 kağıt kullanımı (A4'ün yarısı)
- Mürekkep tasarrufu
- Hızlı yazdırma

### İpuçları

**Kağıt Tasarrufu:**
- Sadece onaylanan siparişleri yazdırın
- Dijital kopyaları saklayın
- Taslak siparişleri yazdırmayın

**Kalite:**
- Lazer yazıcı kullanın
- Kaliteli A5 kağıt kullanın
- Mürekkep seviyesini kontrol edin

**Arşivleme:**
- Her formun bir kopyasını saklayın
- Tarih sırasına göre dosyalayın
- Dijital yedek alın (PDF)

**Müşteri Memnuniyeti:**
- Formu temiz ve düzenli yazdırın
- İmza alanını gösterin
- Teslim tarihini vurgulayın
- İletişim bilgilerinizi net yazın

Detaylı bilgi için: `SIPARIS_FORMU_YAZDIRMA.md`

---

## 🚀 Gelecek Geliştirmeler

### v1.1 (Planlanan)
- [ ] Referans ağacı görselleştirme
- [ ] Referans raporu
- [ ] Referans kampanyaları
- [ ] TC kimlik doğrulama (API entegrasyonu)

### v1.2 (Planlanan)
- [ ] Çoklu kullanıcı rolleri (Admin, Satış, Muhasebe)
- [ ] Kullanıcı yetkilendirme
- [ ] Aktivite logu
- [ ] Şifre sıfırlama
- [ ] Toplu stok güncelleme UI
- [ ] Stok sayımı sayfası
- [ ] Stok rezervasyon sistemi
- [ ] Otomatik stok sipariş önerileri

---

## 📝 Notlar

### Güvenlik
- Production ortamında bcrypt kullanın
- HTTPS kullanın
- Token-based auth düşünün (JWT)
- Session timeout ekleyin

### Performans
- TC kimlik index'i hızlı arama sağlar
- Parent_id index'i referans sorgularını hızlandırır
- Stok kontrolleri optimize edilmiş
- Lazy loading kullanılabilir

### Veri Bütünlüğü
- TC kimlik unique constraint
- Parent_id foreign key
- Stok hareketleri transaction ile korunur
- Cascade delete düşünülebilir

---

**Versiyon:** 1.2.0  
**Tarih:** 05.04.2026  
**Durum:** Production Ready ✅


### v1.3 Güncellemesi (Yeni Eklenenler)
- [x] Profesyonel A5 sipariş formu yazdırma
- [x] Özelleştirilebilir firma bilgileri
- [x] Reçete bilgileri yazdırma desteği
- [x] İmza alanları
- [x] Otomatik sayfa düzeni
- [x] Mobil uyumlu yazdırma

### v1.4 (Planlanan)
- [ ] QR kod ekleme (sipariş takibi için)
- [ ] Barkod ekleme (fiş numarası)
- [ ] Logo yükleme özelliği
- [ ] Toplu sipariş yazdırma
- [ ] Email ile sipariş formu gönderme
- [ ] WhatsApp ile paylaşma
- [ ] PDF olarak kaydetme butonu


---

## 💳 Çoklu Ödeme Yöntemi Sistemi

### Özellikler
- ✅ Tek siparişte birden fazla ödeme yöntemi
- ✅ Nakit + Kredi Kartı + Havale kombinasyonu
- ✅ Kısmi ödemeler (kapora, taksit)
- ✅ Dinamik ödeme ekleme/çıkarma
- ✅ Otomatik toplam hesaplama
- ✅ Fark hesaplama (fazla/eksik ödeme)
- ✅ Para üstü uyarısı
- ✅ Detaylı ödeme geçmişi
- ✅ Ödeme türü bazında özet

### Ödeme Türleri
- 💵 **Nakit** - Peşin nakit ödeme
- 💳 **Kredi Kartı** - Banka kartı ile ödeme
- 🏦 **Havale/EFT** - Banka transferi
- 📝 **Veresiye** - Vadeli ödeme

### Kullanım

**Tek Ödeme Yöntemi:**
1. Sipariş detayına git
2. "Ödeme Al" butonuna tıkla
3. Ödeme bilgilerini gir
4. "Ödeme Al" butonuna tıkla

**Çoklu Ödeme Yöntemi:**
1. Sipariş detayına git
2. "Ödeme Al" butonuna tıkla
3. İlk ödeme yöntemini gir
4. "Başka Ödeme Yöntemi Ekle" butonuna tıkla
5. İkinci ödeme yöntemini gir
6. İstediğin kadar ödeme yöntemi ekle
7. "Ödeme Al (X Yöntem)" butonuna tıkla

### Özellikler

**Akıllı Hesaplama:**
- Otomatik toplam hesaplama
- Kalan tutar gösterimi
- Fark hesaplama (fazla/eksik)
- Renkli uyarılar:
  - 🟢 Yeşil: Tam ödeme
  - 🟠 Turuncu: Fazla ödeme (para üstü)
  - 🔴 Kırmızı: Eksik ödeme (borç kalacak)

**Ödeme Geçmişi:**
- Tüm ödemelerin listesi
- Ödeme türüne göre ikonlar (💵💳🏦📝)
- Tarih ve saat bilgisi
- Ödeme açıklamaları
- Ödeme türü bazında özet:
  - Toplam ödeme sayısı
  - Nakit toplamı
  - Kredi kartı toplamı
  - Havale toplamı

### Kullanım Senaryoları

**Senaryo 1: Karışık Ödeme**
```
Sipariş: 2,500₺
Ödeme 1: 1,000₺ Nakit
Ödeme 2: 1,500₺ Kredi Kartı
Toplam: 2,500₺ ✓
```

**Senaryo 2: Kısmi Ödeme (Kapora)**
```
Sipariş: 3,000₺
Ödeme 1: 500₺ Nakit (Kapora)
Kalan: 2,500₺
---
Ödeme 2: 2,500₺ Kredi Kartı (Kalan)
Toplam: 3,000₺ ✓
```

**Senaryo 3: Fazla Ödeme**
```
Sipariş: 1,800₺
Ödeme: 2,000₺ Nakit
Fark: +200₺ (Para üstü)
```

**Senaryo 4: Üç Farklı Yöntem**
```
Sipariş: 5,000₺
Ödeme 1: 2,000₺ Nakit
Ödeme 2: 2,000₺ Kredi Kartı
Ödeme 3: 1,000₺ Havale
Toplam: 5,000₺ ✓
```

### Avantajlar

**Müşteri İçin:**
- Ödeme esnekliği
- Birden fazla kart kullanabilme
- Kısmi ödeme yapabilme
- Farklı yöntemleri birleştirebilme

**İşletme İçin:**
- Daha fazla satış
- Müşteri memnuniyeti
- Detaylı ödeme takibi
- Nakit akışı yönetimi

**Muhasebe İçin:**
- Ödeme türü bazında raporlama
- Detaylı ödeme geçmişi
- Kolay mutabakat
- Vergi uyumluluğu

### Teknik Detaylar

**Ödeme Modal:**
- Dinamik ödeme yöntemi ekleme/çıkarma
- Gerçek zamanlı toplam hesaplama
- Otomatik kalan tutar güncelleme
- Görsel uyarılar ve ikonlar

**Veritabanı:**
- Her ödeme yöntemi ayrı kayıt
- Sipariş toplamı otomatik güncelleme
- Ödeme tamamlanma durumu takibi

**Validasyon:**
- Tutar kontrolü (0'dan büyük olmalı)
- Fazla ödeme uyarısı
- Eksik ödeme uyarısı
- En az bir ödeme yöntemi zorunlu

Detaylı bilgi için: `COKLU_ODEME_SISTEMI.md`


---

## 📋 Ayrı Sipariş Fişi Sistemi (Lab İçin)

### Özellikler
- ✅ Müşteri formundan bağımsız sipariş fişi
- ✅ Cam laboratuvarı için özel tasarım
- ✅ Yeni sekmede açılır
- ✅ Otomatik yazdırma dialogu
- ✅ A5 kağıda optimize
- ✅ Lab odaklı içerik

### Kullanım

**Sipariş Fişi Yazdırma:**
1. Sipariş detayına git
2. "Sipariş Fişi" butonuna tıkla
3. Yeni sekme açılır
4. Otomatik yazdırma dialogu açılır
5. Yazıcı ayarlarını kontrol et (A5, Dikey)
6. Yazdır

**Müşteri Formu Yazdırma:**
1. Sipariş detayına git
2. "Müşteri Formu" butonuna tıkla
3. VEYA Ctrl+P (Windows) / Cmd+P (Mac)
4. Yazıcı ayarlarını kontrol et (A5, Dikey)
5. Yazdır

### İçerik Farkları

**Sipariş Fişi (Lab İçin):**
- Büyük ve net reçete bilgileri
- Sipariş detayları (cam tipi, adet)
- Lab notları alanı
- Teslim eden/alan imza alanları
- Minimal müşteri bilgisi
- "Lab için hazırlanmıştır" notu

**Müşteri Formu (Müşteri İçin):**
- Detaylı müşteri bilgileri
- Tüm sipariş kalemleri
- Fiyat bilgileri
- Ödeme bilgileri
- Müşteri/Yetkili imza alanları
- "Müşteri nüshası" notu

### Lab İş Akışı

**1. Sipariş Oluşturma:**
```
→ Müşteri gelir
→ Reçete alınır
→ Çerçeve seçilir
→ Cam tipi belirlenir
→ Sipariş oluşturulur
```

**2. Lab'a Gönderme:**
```
→ "Sipariş Fişi" yazdır
→ Çerçeve ile birlikte koy
→ Lab'a götür
→ İmza karşılığı teslim et
```

**3. Lab'dan Alma:**
```
→ Lab hazır olduğunda bildirir
→ Sipariş fişi ile git
→ Gözlüğü kontrol et
→ İmza karşılığı teslim al
```

**4. Müşteriye Teslim:**
```
→ "Müşteri Formu" yazdır
→ Gözlüğü kontrol ettir
→ Ödeme al
→ Müşteri formunu imzalat
→ Teslim et
```

### Lab Notları

**Kontrol Listesi:**
- □ Reçete kontrol edildi
- □ Cam tipi onaylandı
- □ Özel işlem var mı?
- □ Teslim tarihi belirlendi

**Özel İşlemler:**
- Anti-reflektif kaplama
- Sertleştirme
- UV koruma
- Blue light filter
- Photochromic
- Polarize

### Teknik Detaylar

**Route:**
```
/orders/:id/slip
```

**Özellikler:**
- Layout olmadan açılır
- Otomatik yazdırma (500ms gecikme)
- A5 kağıda optimize
- Print-only içerik
- Yeni sekmede açılır

**Butonlar:**
```javascript
// Sipariş Fişi (Lab)
<button onClick={() => window.open(`/orders/${id}/slip`, '_blank')}>
  Sipariş Fişi
</button>

// Müşteri Formu
<button onClick={handlePrint}>
  Müşteri Formu
</button>
```

### Avantajlar

**Lab İçin:**
- Net ve okunabilir reçete
- Sadece gerekli bilgiler
- Kolay kontrol listesi
- İmza alanları

**İşletme İçin:**
- Karışıklık önlenir
- Profesyonel görünüm
- Kolay arşivleme
- Hızlı iş akışı

**Müşteri İçin:**
- Ayrı müşteri formu
- Detaylı bilgiler
- Ödeme makbuzu
- Garanti belgesi

Detaylı bilgi için: `SIPARIS_FISI_SISTEMI.md`
