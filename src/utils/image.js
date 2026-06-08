// Görseli tarayıcıda küçültüp base64 (JPEG) döndürür — sunucu JSON veritabanı şişmesin.
export const fileToCompressedDataUrl = (file, maxSize = 1200, quality = 0.8) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Birden çok dosyayı sıkıştırıp {name, dataUrl} listesi döndürür
export const filesToImages = async (fileList, maxSize, quality) => {
  const out = [];
  for (const file of Array.from(fileList || [])) {
    const dataUrl = await fileToCompressedDataUrl(file, maxSize, quality);
    out.push({ name: file.name, dataUrl });
  }
  return out;
};
