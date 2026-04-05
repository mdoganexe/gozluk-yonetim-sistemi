Gözlük Satış Yönetim Sistemi — Derin Teknik Plan
🧠 Önce Gerçek Soruları Soralım
Bir gözlükçü dükkanında gerçekte ne olur?

🏪 İş Akışı Analizi (Gerçek Dünya)
Müşteri Dükkanа Girdiğinde:
1. Müşteri yeni mi, eski mi? → Kayıt ara
2. Reçetesi var mı? → Reçete gir/güncelle
3. Çerçeve seçimi → Stoktan göster
4. Cam hesabı → Reçeteye göre cam tipi belirle
5. Sipariş oluştur → Çerçeve + Cam + İşçilik
6. Ön ödeme al → Kapora
7. Teslim tarihi ver → İş takibi
8. Teslimatta kalan ödeme → Kapat
Bu akış bize şunu söylüyor: Sipariş = birden fazla aşamalı bir süreç, tek seferlik satış değil.

🔬 Veri Modeli — Gerçek Derinlik
Problem: Çerçeve ≠ Cam ≠ Aksesuar
Gözlükçüde ürünler 3 tamamen farklı kategoride:
ÇERÇEVE
├── Beden (48□18, 52□16 gibi)
├── Renk (her renk ayrı stok)
├── Malzeme (metal, plastik, titanyum)
└── Köprü tipi

CAM (Lens)
├── Endeks (1.50, 1.56, 1.67, 1.74, 1.90)
├── Kaplama (AR, mavi filtre, fotokromik, güneş)
├── Tip (tek odak, bifokal, progressif)
├── Üretici (Essilor, Zeiss, Hoya, Türk üretici)
└── Stok mu? Sipariş mi? ← KRİTİK FARK

AKSESUAR
├── Kılıf, bez, vida, burun pedi
└── Basit stok takibi yeterli
Cam stoğu için kritik gerçek:
Camlar çoğunlukla stokta tutulmaz, reçeteye göre üretilir/sipariş edilir. Yani cam için ayrı bir tedarikçi siparişi akışı gerekir.

🗃️ Gelişmiş Veritabanı Şeması
customers — Müşteri
id                    UUID
ad, soyad             string
telefon               string (unique, arama için)
email                 string
adres                 text
dogum_tarihi          date         ← doğum günü hatırlatması
meslek                string       ← UV koruması önerisi için
notlar                text
olusturma_tarihi      datetime
guncelleme_tarihi     datetime
prescriptions — Göz Ölçüsü (Reçete)
id                    UUID
musteri_id            FK
tarih                 date
doktor_adi            string
hastane               string

── Sağ Göz ──────────────
sag_sfera             decimal(4,2)   -20.00 / +20.00
sag_silindir          decimal(4,2)
sag_aks               int(0-180)
sag_add               decimal(3,2)   (okuma eklentisi)
sag_prizma            decimal(3,2)   ← çoğu sistem atlar, hata
sag_prizma_yon         string

── Sol Göz ──────────────
sol_sfera             decimal(4,2)
sol_silindir          decimal(4,2)
sol_aks               int
sol_add               decimal(3,2)
sol_prizma            decimal(3,2)
sol_prizma_yon         string

── Mesafeler ─────────────
pd_uzak_sag           decimal(4,1)  mm cinsinden
pd_uzak_sol           decimal(4,1)
pd_yakin_sag          decimal(4,1)
pd_yakin_sol          decimal(4,1)

aktif                 boolean       ← en güncel reçete hangisi
notlar                text
products — Ürün (Çerçeve/Aksesuar)
id                    UUID
barkod                string (unique)
sku                   string        ← iç kod
marka                 string
model                 string
kategori              enum(çerçeve, güneşlik, aksesuar, cam_stok)
alt_kategori          string

── Çerçeve Özellikleri ───
cerceve_beden_lens    int           ← 48, 50, 52...
cerceve_beden_kopru   int           ← 18, 20...
cerceve_beden_sap     int           ← 135, 140...
cerceve_malzeme       string
renk                  string
cinsiyet              enum(erkek, kadın, unisex, çocuk)

── Fiyat ─────────────────
alis_fiyati           decimal(10,2)
satis_fiyati          decimal(10,2)
kdv_orani             int(0/8/18/20) ← KDV ayrı takip
para_birimi           string(TRY)

── Stok ──────────────────
stok_adedi            int
min_stok_uyari        int
raf_konumu            string        ← A3, B12 gibi
tedarikci_id          FK

aktif                 boolean
notlar                text
lens_catalog — Cam Kataloğu (Fiyat Listesi)
id                    UUID
tedarikci_id          FK
ad                    string        ← "Essilor Crizal Forte UV"
tip                   enum(tek_odak, bifokal, progressif, büro)
endeks                decimal(3,2)  ← 1.50, 1.67...
kaplama               string[]      ← AR, UV, mavi, fotokromik
sfera_min/max         decimal
silindir_min/max      decimal
alis_fiyati           decimal(10,2)
satis_fiyati          decimal(10,2)
stok_var              boolean       ← stokta mı, sipariş mi
orders — Sipariş (Ana Fiş)
id                    UUID
fis_no                string        ← OPT-2024-00001 formatı
musteri_id            FK
recete_id             FK            ← hangi reçeteyle yapıldı

── Durum Makinesi ────────
durum                 enum:
                        taslak
                        onaylandi
                        uretimdе (cam siparişi verildi)
                        hazir
                        teslim_edildi
                        iptal

── Tarihler ──────────────
siparis_tarihi        datetime
teslim_beklenen       date
teslim_gerceklesen    date

── Ödeme ─────────────────
ara_toplam            decimal(10,2)
indirim_tl            decimal(10,2)
indirim_yuzde         decimal(5,2)
kdv_tutari            decimal(10,2)
genel_toplam          decimal(10,2)
odenen_toplam         decimal(10,2)  ← kalan borç hesabı
odeme_tamamlandi      boolean

notlar                text
olusturan             string
order_items — Sipariş Kalemleri
id                    UUID
siparis_id            FK
kalem_tipi            enum(çerçeve, cam_sag, cam_sol, aksesuar, işçilik)
urun_id               FK nullable   ← çerçeve/aksesuar için
lens_katalog_id       FK nullable   ← cam için
aciklama              string        ← manuel açıklama
adet                  int
birim_fiyat           decimal(10,2)
indirim               decimal(10,2)
toplam                decimal(10,2)
payments — Ödeme Hareketleri
id                    UUID
siparis_id            FK
tarih                 datetime
tutar                 decimal(10,2)
odeme_turu            enum(nakit, kredi_karti, havale, veresiye)
aciklama              string        ← "kapora", "kalan"
suppliers — Tedarikçi
id                    UUID
firma_adi             string
yetkili               string
telefon               string
email                 string
adres                 text
web                   string
kategori              string[]      ← cam, çerçeve, aksesuar
vade_gun              int           ← ödeme vadesi
notlar                text
stock_movements — Stok Hareket Logu
id                    UUID
urun_id               FK
hareket_tipi          enum(giris, cikis, sayim, iade, fire)
miktar                int
onceki_stok           int
sonraki_stok          int
referans_id           UUID          ← sipariş id veya sayım id
aciklama              string
tarih                 datetime

🔄 Kritik İş Akışları (Use Cases)
UC-1: Yeni Müşteri + Satış
Müşteri Ekle
    → Göz Ölçüsü Gir (reçete)
    → Sipariş Oluştur
        → Çerçeve Seç (stoktan)
        → Cam Seç (katalogdan veya stoktan)
        → İşçilik ekle (varsa)
        → İndirim uygula
        → Kapora al → Payment kaydı
        → Teslim tarihi gir
        → Fiş yazdır (müşteri kopyası)
    → Stok otomatik düşer (çerçeve)
    → Cam tedarikçi siparişine düşer (opsiyonel)
UC-2: Teslim
Sipariş ara (fis_no veya müşteri adı)
    → Durum: "hazır" yap
    → Kalan ödemeyi al → Payment kaydı
    → Durum: "teslim edildi" yap
    → Teslim fişi yazdır
UC-3: Stok Sayımı
Kategoriye göre ürün listesi aç
    → Her ürün için gerçek stok gir
    → Sistem farkı gösterir (+/-)
    → Onayla → stock_movements kaydı oluşur

🖨️ Fiş Tasarımı
Sipariş Fişi İçeriği
┌─────────────────────────────────┐
│      [FİRMA ADI] LOGO           │
│   Adres | Tel | Vergi No        │
├─────────────────────────────────┤
│ FİŞ NO: OPT-2024-00123          │
│ TARİH: 05.04.2026               │
│ TESLIM: 10.04.2026              │
├─────────────────────────────────┤
│ MÜŞTERİ: Ali Yılmaz             │
│ TEL: 0532 xxx xx xx             │
├─────────────────────────────────┤
│ GÖZ ÖLÇÜSÜ:                     │
│      Sfera  Sil   Aks   Add     │
│ SAĞ: +1.50  -0.50  180         │
│ SOL: +1.75  -0.75  175         │
│ PD:  32 / 32                    │
├─────────────────────────────────┤
│ KALEMLER:               TUTAR   │
│ Çerçeve: Marka Model    850₺    │
│ Sağ Cam: Essilor 1.67   650₺    │
│ Sol Cam: Essilor 1.67   650₺    │
│ İnce kenar işçilik      150₺    │
├─────────────────────────────────┤
│ ARA TOPLAM:           2.300₺    │
│ İNDİRİM (%10):         -230₺    │
│ TOPLAM:               2.070₺    │
│ KAPORA:               1.000₺    │
│ KALAN:                1.070₺    │
├─────────────────────────────────┤
│ [İmza alanı]    [Kaşe alanı]    │
└─────────────────────────────────┘

⚡ Teknik Mimari Kararları
Neden IndexedDB + Dexie.js?
SQLite (WASM)     → 2MB+ bundle, kompleks setup
PouchDB           → CouchDB sync odaklı, gereksiz
localForage       → IndexedDB wrapper ama zayıf query
Dexie.js          → ✅ En olgun, compound index, 
                       transaction, live query desteği
Veri Güvenliği Katmanları
Katman 1: Her kayıt sonrası otomatik IndexedDB commit
Katman 2: Günlük otomatik JSON export (download tetikle)
Katman 3: Manuel yedekleme butonu
Katman 4: Import ile geri yükleme
Performans Stratejisi
Müşteri arama     → telefon + ad alanlarına index
Sipariş listesi   → tarih DESC index
Stok uyarısı      → stok_adedi < min_stok_uyari compound index
Barkod okuma      → barkod unique index, O(1) lookup

📦 Modüller ve Ekranlar — Tam Liste
📊 Dashboard
   ├── Günlük satış tutarı
   ├── Bekleyen siparişler (sayı + liste)
   ├── Düşük stok uyarıları
   ├── Bugün teslim edilecekler
   └── Son 7 gün satış grafiği

👓 Stok
   ├── Ürün Listesi (filtre + arama + barkod)
   ├── Ürün Detay / Düzenle
   ├── Yeni Ürün
   ├── Stok Hareketleri
   ├── Stok Sayımı
   └── Düşük Stok Raporu

👥 Müşteriler
   ├── Müşteri Listesi
   ├── Müşteri Kartı
   │    ├── Kişisel bilgiler
   │    ├── Reçete geçmişi
   │    └── Sipariş geçmişi
   ├── Yeni Müşteri
   └── Reçete Gir / Düzenle

🧾 Siparişler
   ├── Sipariş Listesi (durum filtreli)
   ├── Yeni Sipariş (wizard akış)
   ├── Sipariş Detay
   ├── Fiş Yazdır
   └── Teslim Al

💰 Kasa (Ödemeler)
   ├── Günlük tahsilat
   ├── Veresiye / Bakiye listesi
   └── Ödeme geçmişi

📈 Raporlar
   ├── Satış Raporu (tarih aralığı)
   ├── Ürün Bazlı Satış
   ├── Müşteri Bazlı Satış
   ├── Stok Değeri
   └── KDV Raporu

⚙️ Ayarlar
   ├── Firma Bilgileri (fiş başlığı için)
   ├── Tedarikçiler
   ├── Cam Kataloğu
   ├── Yedekle (Export JSON)
   ├── Geri Yükle (Import JSON)
   └── Veri Yönetimi

🗓️ Geliştirme Sırası (Öncelik Sıralı)
ÖncelikModülNeden?1DB Şeması + Temel LayoutHer şeyin temeli2Müşteri CRUD + ReçeteSatıştan önce müşteri lazım3Stok CRUDSatıştan önce ürün lazım4Sipariş Oluşturma + FişAna gelir akışı5Ödeme TakibiKapora / kalan6DashboardÖzet görünüm7RaporlarSonradan eklenebilir8YedeklemeKritik ama son