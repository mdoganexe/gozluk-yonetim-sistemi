# 🚀 Hızlı Başlangıç - GitHub'a Deploy

## Adım 1: GitHub Repository Oluştur

1. https://github.com adresine git
2. Sağ üstten **"+"** butonuna tıkla
3. **"New repository"** seç
4. Repository bilgilerini gir:
   - **Repository name**: `gozluk-yonetim-sistemi`
   - **Description**: "Profesyonel Gözlük Satış ve Stok Yönetim Sistemi"
   - **Public** veya **Private** seç (istediğin gibi)
   - ❌ "Initialize this repository with a README" seçeneğini işaretleme
5. **"Create repository"** butonuna tıkla

## Adım 2: GitHub'a Yükle

GitHub'da oluşturduğun repository sayfasında göreceğin komutları kullan:

```bash
# Remote repository ekle (kendi kullanıcı adınla değiştir)
git remote add origin https://github.com/[KULLANICI-ADIN]/gozluk-yonetim-sistemi.git

# Ana branch'i main olarak ayarla
git branch -M main

# GitHub'a yükle
git push -u origin main
```

**Örnek** (kullanıcı adın "mehmet" ise):
```bash
git remote add origin https://github.com/mehmet/gozluk-yonetim-sistemi.git
git branch -M main
git push -u origin main
```

## Adım 3: Online Deploy (İsteğe Bağlı)

### Seçenek A: Vercel (Önerilen - En Kolay)

1. https://vercel.com adresine git
2. GitHub ile giriş yap
3. **"Add New Project"** butonuna tıkla
4. Repository'ni seç: `gozluk-yonetim-sistemi`
5. **"Deploy"** butonuna tıkla
6. 2-3 dakika bekle, hazır! 🎉

Vercel otomatik olarak:
- ✅ Build yapacak
- ✅ HTTPS sertifikası ekleyecek
- ✅ Her commit'te otomatik deploy edecek
- ✅ Ücretsiz domain verecek (örn: `gozluk-yonetim.vercel.app`)

### Seçenek B: Netlify

1. https://netlify.com adresine git
2. **"Add new site"** > **"Import an existing project"**
3. GitHub'ı seç ve repository'ni bağla
4. Build ayarları:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **"Deploy"** butonuna tıkla

## ✅ Tamamlandı!

Git repository'n hazır ve GitHub'da! 

### Şimdi Ne Yapabilirsin?

1. **Yerel Geliştirme**: 
   ```bash
   npm run dev
   ```

2. **Değişiklik Yap ve Yükle**:
   ```bash
   git add .
   git commit -m "Değişiklik açıklaması"
   git push
   ```

3. **Online Erişim**: Vercel/Netlify kullandıysan, verilen URL'den sisteme eriş

## 📝 Önemli Notlar

- ✅ Tüm dosyalar commit edildi (71 dosya)
- ✅ `.gitignore` hazır (node_modules, dist, .env dahil değil)
- ✅ README.md oluşturuldu
- ✅ Deployment rehberleri hazır
- ✅ Sistem tamamen offline çalışır (IndexedDB)

## 🆘 Sorun mu Yaşıyorsun?

### "Permission denied" hatası alıyorsan:
```bash
# SSH key kullan veya GitHub'da Personal Access Token oluştur
# Settings > Developer settings > Personal access tokens
```

### Remote URL'i değiştirmek istersen:
```bash
git remote set-url origin https://github.com/[YENİ-KULLANICI-ADI]/gozluk-yonetim-sistemi.git
```

### Commit'leri görmek için:
```bash
git log --oneline
```

## 📚 Daha Fazla Bilgi

- Detaylı kurulum: `KURULUM.md`
- Kullanım kılavuzu: `KULLANIM_KILAVUZU.md`
- Proje özeti: `PROJE_OZETI.md`
