# 📖 Kullanım Kılavuzu

## İçindekiler
1. [Dashboard](#dashboard)
2. [Müşteri Yönetimi](#müşteri-yönetimi)
3. [Stok Yönetimi](#stok-yönetimi)
4. [Sipariş Yönetimi](#sipariş-yönetimi)
5. [Kasa Yönetimi](#kasa-yönetimi)
6. [Raporlar](#raporlar)
7. [Ayarlar](#ayarlar)

---

## Dashboard

Ana ekranda günlük işlerinizi takip edin:

### Kartlar
- **Bugünkü Satış:** Gün içinde yapılan toplam satış
- **Bekleyen Siparişler:** Henüz teslim edilmemiş siparişler
- **Düşük Stok Uyarısı:** Minimum stok seviyesinin altındaki ürünler
- **Bugün Teslim:** Bugün teslim edilmesi gereken siparişler

### Grafik
Son 7 günün satış grafiğini görüntüleyin.

### Hızlı Erişim
- Bekleyen siparişlere tıklayarak detaya gidin
- Bugün teslim edilecekleri görüntüleyin

---

## Müşteri Yönetimi

### Yeni Müşteri Ekleme

1. **Müşteriler** menüsüne tıklayın
2. **Yeni Müşteri** butonuna basın
3. Zorunlu alanları doldurun:
   - Ad *
   - Soyad *
   - Telefon *
4. Opsiyonel bilgiler:
   - Email
   - Adres
   - Doğum Tarihi (hatırlatma için)
   - Meslek (UV koruması önerileri için)
   - Notlar
5. **Kaydet** butonuna basın

### Müşteri Arama

Arama kutusuna:
- Ad veya soyad
- Telefon numarası
- Email adresi
yazarak hızlıca bulun.

### Müşteri Detayı

Müşteri kartında:
- Kişisel bilgiler
- Reçete geçmişi
- Sipariş geçmişi

### Reçete Ekleme

1. Müşteri detayına girin
2. **Yeni Reçete** butonuna basın
3. Bilgileri girin:

**Sağ Göz:**
- Sfera: +/- değer (örn: +1.50)
- Silindir: Astigmat değeri (örn: -0.50)
- Aks: 0-180 arası (örn: 180)
- Add: Okuma eklentisi (örn: +2.00)

**Sol Göz:**
- Aynı değerler

**PD (Pupil Distance):**
- Uzak Sağ/Sol: mm cinsinden
- Yakın Sağ/Sol: mm cinsinden

4. **Aktif reçete** kutusunu işaretleyin (en güncel reçete)
5. **Kaydet**

---

## Stok Yönetimi

### Yeni Ürün Ekleme

1. **Stok** menüsüne tıklayın
2. **Yeni Ürün** butonuna basın
3. Temel bilgileri girin:
   - Marka *
   - Model *
   - Kategori * (Çerçeve/Güneşlik/Aksesuar/Cam)
   - Renk
   - Barkod
   - SKU (İç kod)

4. **Çerçeve ise** ek bilgiler:
   - Lens bedeni (48, 50, 52 mm)
   - Köprü bedeni (18, 20 mm)
   - Sap uzunluğu (135, 140 mm)
   - Malzeme (Metal, Plastik, Titanyum)
   - Cinsiyet (Erkek/Kadın/Unisex/Çocuk)

5. **Fiyat ve Stok:**
   - Alış fiyatı
   - Satış fiyatı *
   - KDV oranı (0/8/18/20%)
   - Stok adedi *
   - Min. stok uyarı seviyesi
   - Raf konumu (A3, B12 gibi)

6. **Kaydet**

### Stok Arama ve Filtreleme

- **Arama:** Marka, model, barkod veya SKU ile ara
- **Kategori Filtreleri:** Tümü, Çerçeve, Güneşlik, Aksesuar, Cam

### Düşük Stok Uyarıları

Stok adedi minimum seviyenin altına düşen ürünler otomatik olarak işaretlenir.

### Stok Hareketleri

Ürün detayında:
- Giriş/Çıkış hareketleri
- Tarih ve saat
- Önceki/Sonraki stok
- Açıklama (hangi sipariş için)

---

## Sipariş Yönetimi

### Yeni Sipariş Oluşturma

1. **Siparişler** → **Yeni Sipariş**

2. **Müşteri Seçimi:**
   - Müşteri seçin *
   - Reçete seçin (opsiyonel)
   - Teslim tarihi belirleyin

3. **Kalem Ekleme:**
   
   **Çerçeve Eklemek için:**
   - "+ Çerçeve" butonuna basın
   - Stoktan ürün seçin
   - Adet belirleyin
   - Fiyat otomatik gelir
   - İndirim uygulayabilirsiniz

   **Cam Eklemek için:**
   - "+ Cam Sağ" veya "+ Cam Sol" butonuna basın
   - Açıklama girin (örn: "Essilor 1.67 AR Kaplama")
   - Fiyat girin
   - Adet: 1

   **İşçilik Eklemek için:**
   - "+ İşçilik" butonuna basın
   - Açıklama girin (örn: "İnce kenar işçiliği")
   - Fiyat girin

4. **Toplam Hesaplama:**
   - Ara toplam otomatik hesaplanır
   - İndirim uygulayın (% veya TL)
   - KDV otomatik eklenir (%20)
   - Genel toplam gösterilir

5. **Notlar:**
   - Özel notlar ekleyin

6. **Siparişi Oluştur** butonuna basın

### Sipariş Durumları

- **Onaylandı:** Sipariş alındı
- **Üretimde:** Cam siparişi verildi
- **Hazır:** Teslime hazır
- **Teslim Edildi:** Müşteriye teslim edildi
- **İptal:** İptal edildi

### Sipariş Detayı

- Müşteri bilgileri
- Sipariş kalemleri
- Fiyat detayları
- Ödeme geçmişi
- Durum değiştirme
- Fiş yazdırma

### Ödeme Alma

1. Sipariş detayına girin
2. **Ödeme Al** butonuna basın
3. Bilgileri girin:
   - Tutar (kalan tutar otomatik gelir)
   - Ödeme türü (Nakit/Kredi Kartı/Havale/Veresiye)
   - Açıklama (Kapora, Kalan vb.)
4. **Ödeme Al** butonuna basın

### Fiş Yazdırma

1. Sipariş detayına girin
2. **Yazdır** butonuna basın
3. Tarayıcı yazdırma penceresi açılır
4. Yazıcı seçin ve yazdırın

**Fiş İçeriği:**
- Firma bilgileri
- Fiş numarası ve tarih
- Müşteri bilgileri
- Sipariş kalemleri
- Fiyat detayları
- Ödeme bilgileri

---

## Kasa Yönetimi

### Günlük Tahsilat

Ana ekranda:
- Bugünkü toplam tahsilat
- Toplam veresiye
- Bekleyen ödeme sayısı

### Bekleyen Ödemeler

Ödenmemiş veya kısmen ödenmiş siparişler:
- Fiş numarası
- Müşteri adı
- Toplam tutar
- Ödenen tutar
- Kalan tutar

### Ödeme Geçmişi

Tüm ödemelerin listesi:
- Tarih ve saat
- Fiş numarası
- Müşteri
- Ödeme türü
- Açıklama
- Tutar

---

## Raporlar

### Tarih Aralığı Seçimi

1. Başlangıç tarihi seçin
2. Bitiş tarihi seçin
3. Raporlar otomatik güncellenir

### Satış Özeti

- Toplam satış tutarı
- Sipariş sayısı
- Ortalama sipariş tutarı

### En Çok Satan Ürünler

Grafik olarak:
- Ürün adı
- Satış adedi
- Satış tutarı

### Sipariş Durum Dağılımı

Pasta grafik:
- Her durumdan kaç sipariş var
- Yüzdelik dağılım

### Stok Değeri

En değerli stoklar:
- Ürün adı
- Stok adedi
- Toplam değer (Alış fiyatı × Stok)

---

## Ayarlar

### Firma Bilgileri

Fiş başlığında görünecek bilgiler:
- Firma adı
- Adres
- Telefon
- Vergi numarası

### Veri Yedekleme

**Yedek Alma:**
1. **Verileri Dışa Aktar** butonuna basın
2. JSON dosyası indirilir
3. Dosyayı güvenli bir yere kaydedin

**Önerilen Yedekleme:**
- Her gün sonunda
- Önemli işlemlerden önce
- Haftalık bulut yedekleme

**Yedek Dosyası:**
- Format: JSON
- İsim: `gozluk-yedek-2024-04-05.json`
- İçerik: Tüm müşteri, ürün, sipariş verileri

### Veri Geri Yükleme

⚠️ **DİKKAT:** Mevcut tüm veriler silinir!

1. **Verileri İçe Aktar** butonuna basın
2. Yedek JSON dosyasını seçin
3. Onaylayın
4. Sayfa yenilenir

### Sistem Bilgisi

- Versiyon numarası
- Veritabanı tipi
- Depolama bilgisi

---

## 💡 İpuçları

### Hızlı Kullanım

1. **Klavye Kısayolları:**
   - Arama kutularında hızlı yazın
   - Tab ile form alanları arası geçiş

2. **Müşteri Arama:**
   - Telefon numarasının son 4 hanesini yazın
   - Hızlı bulma için

3. **Stok Kontrolü:**
   - Her sabah düşük stok uyarılarını kontrol edin
   - Dashboard'dan hızlı erişim

4. **Yedekleme:**
   - Her gün sonunda yedek alın
   - Bulut depolamaya yükleyin

### Sık Yapılan Hatalar

❌ **Reçete eklemeden sipariş:**
- Reçete opsiyoneldir ama önerilir
- Sonradan eklenebilir

❌ **Stok kontrolü yapmadan satış:**
- Sipariş oluştururken stok otomatik düşer
- Stok yoksa uyarı verir

❌ **Yedek almadan veri silme:**
- Silinen veriler geri getirilemez
- Mutlaka yedek alın

### En İyi Pratikler

✅ **Günlük Rutin:**
1. Dashboard kontrolü
2. Bugün teslim edilecekleri kontrol et
3. Düşük stok uyarılarını incele
4. Gün sonu yedek al

✅ **Haftalık Rutin:**
1. Raporları incele
2. Stok sayımı yap
3. Veresiye takibi
4. Bulut yedekleme

✅ **Aylık Rutin:**
1. Detaylı satış analizi
2. Stok değerlendirmesi
3. Müşteri analizi
4. Sistem güncellemesi

---

## 🆘 Sık Sorulan Sorular

**S: Veriler nerede saklanıyor?**
C: Tarayıcınızın IndexedDB'sinde, tamamen offline.

**S: İnternet gerekli mi?**
C: Hayır, tamamen offline çalışır.

**S: Birden fazla bilgisayarda kullanabilir miyim?**
C: Evet, yedek alıp diğer bilgisayara yükleyin.

**S: Mobil cihazdan kullanabilir miyim?**
C: Evet, responsive tasarım sayesinde.

**S: Veriler güvende mi?**
C: Evet, sadece sizin bilgisayarınızda saklanır.

**S: Fiş yazdırma nasıl çalışır?**
C: Tarayıcının yazdırma özelliğini kullanır.

---

**Başarılar! 🎉**

Daha fazla yardım için: README.md ve KURULUM.md dosyalarını inceleyin.
