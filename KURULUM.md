# GitHub'a Deployment Rehberi

## 1. Git Repository Oluşturma

### Yerel Repository'yi Başlatma

```bash
# Git repository'yi başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit'i oluştur
git commit -m "İlk commit: Gözlük Yönetim Sistemi"
```

## 2. GitHub Repository Oluşturma

1. GitHub'da oturum açın: https://github.com
2. Sağ üst köşeden "+" butonuna tıklayın
3. "New repository" seçin
4. Repository adı: `gozluk-yonetim-sistemi`
5. Açıklama: "Profesyonel Gözlük Satış ve Stok Yönetim Sistemi"
6. Public veya Private seçin
7. "Create repository" butonuna tıklayın

## 3. GitHub'a Push Etme

GitHub'da oluşturduğunuz repository'nin URL'sini kullanarak:

```bash
# Remote repository ekle
git remote add origin https://github.com/[kullanici-adi]/gozluk-yonetim-sistemi.git

# Ana branch'i main olarak ayarla
git branch -M main

# GitHub'a push et
git push -u origin main
```

## 4. Deployment Seçenekleri

### A) GitHub Pages (Statik Hosting)

1. `vite.config.js` dosyasını düzenleyin:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/gozluk-yonetim-sistemi/', // Repository adınız
})
```

2. Build ve deploy:
```bash
npm run build
```

3. GitHub repository ayarlarından:
   - Settings > Pages
   - Source: Deploy from a branch
   - Branch: main > /dist
   - Save

### B) Vercel (Önerilen)

1. Vercel hesabı oluşturun: https://vercel.com
2. "Import Project" butonuna tıklayın
3. GitHub repository'nizi seçin
4. Framework Preset: Vite
5. Deploy butonuna tıklayın

Vercel otomatik olarak:
- Build yapacak
- HTTPS sertifikası ekleyecek
- Her commit'te otomatik deploy edecek

### C) Netlify

1. Netlify hesabı oluşturun: https://netlify.com
2. "Add new site" > "Import an existing project"
3. GitHub'ı seçin ve repository'nizi bağlayın
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy butonuna tıklayın

## 5. Yerel Geliştirme

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Production build test
npm run build
npm run preview
```

## 6. Güncelleme Yapma

```bash
# Değişiklikleri ekle
git add .

# Commit oluştur
git commit -m "Açıklama mesajı"

# GitHub'a push et
git push
```

## 7. Önemli Notlar

- **Offline Çalışma**: Sistem tamamen IndexedDB kullanır, backend gerektirmez
- **Veri Güvenliği**: Tüm veriler kullanıcının tarayıcısında saklanır
- **Tarayıcı Desteği**: Modern tarayıcılar (Chrome, Firefox, Edge, Safari)
- **Mobil Uyumluluk**: Responsive tasarım ile mobil cihazlarda çalışır

## 8. Sorun Giderme

### Build Hatası
```bash
# node_modules'ü temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Git Hatası
```bash
# Remote'u kontrol et
git remote -v

# Remote'u değiştir
git remote set-url origin https://github.com/[kullanici-adi]/gozluk-yonetim-sistemi.git
```

## 9. Güvenlik

- `.env` dosyası `.gitignore`'da olduğundan GitHub'a yüklenmez
- Hassas bilgileri asla commit etmeyin
- Production'da HTTPS kullanın

## 10. Yedekleme

Veritabanı yedeği için:
- Ayarlar > Veritabanı Yönetimi
- "Veritabanını Dışa Aktar" butonunu kullanın
- JSON dosyasını güvenli bir yere kaydedin
