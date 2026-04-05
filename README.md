# Gözlük Satış ve Yönetim Sistemi

Profesyonel gözlükçüler için geliştirilmiş, tamamen offline çalışan modern bir satış ve stok yönetim sistemi.

## 🎯 Özellikler

- **Müşteri Yönetimi**: TC Kimlik ile müşteri kaydı, referans sistemi
- **Reçete Yönetimi**: Detaylı göz reçetesi kayıtları
- **Ürün & Stok Yönetimi**: Çerçeve, lens, aksesuar stok takibi
- **Sipariş Yönetimi**: Hızlı satış akışı, sipariş takibi
- **Çoklu Ödeme**: Nakit, kredi kartı, havale, veresiye desteği
- **Profesyonel Çıktılar**: A5 sipariş formu ve laboratuvar fişi
- **Raporlama**: Satış, stok ve finansal raporlar
- **Offline Çalışma**: İnternet bağlantısı gerektirmez (IndexedDB)

## 🚀 Kurulum

### Gereksinimler
- Node.js 16+ 
- npm veya yarn

### Adımlar

1. Projeyi klonlayın:
```bash
git clone https://github.com/[kullanici-adi]/gozluk-yonetim-sistemi.git
cd gozluk-yonetim-sistemi
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda açın: `http://localhost:5173`

## 📦 Production Build

```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

## 🔧 Teknolojiler

- **Frontend**: React 18, React Router
- **Styling**: Tailwind CSS
- **Database**: Dexie.js (IndexedDB wrapper)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite

## 📖 Kullanım

### İlk Kullanım
1. Sistem ilk açılışta kullanıcı kaydı oluşturmanızı isteyecektir
2. Kullanıcı adı ve şifre belirleyin
3. Ayarlar bölümünden firma bilgilerinizi girin

### Hızlı Satış Akışı
1. Müşteri ekleyin (TC Kimlik ile)
2. Açılan hızlı satış penceresinden "Gözlük Satışı" veya "Sadece Lens" seçin
3. Reçete bilgilerini girin
4. Ürünleri seçin (stok otomatik düşer)
5. Ödeme yöntemlerini belirleyin
6. Sipariş fişi ve müşteri formu çıktısı alın

### Stok Yönetimi
- Ürünler otomatik olarak stoktan düşer
- İptal edilen siparişlerde stok geri yüklenir
- Dashboard'da düşük stok uyarıları görüntülenir
- Toplu stok güncellemesi yapılabilir

## 📄 Lisans

Bu proje özel kullanım içindir.

## 👨‍💻 Geliştirici

Gözlükçüler için, gözlükçüler tarafından geliştirilmiştir.

## 🆘 Destek

Sorun bildirmek veya öneride bulunmak için GitHub Issues kullanabilirsiniz.
