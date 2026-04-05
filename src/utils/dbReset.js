import db from '../db/database';

// Veritabanını tamamen sıfırla (sadece geliştirme için)
export const resetDatabase = async () => {
  try {
    await db.delete();
    console.log('Veritabanı silindi. Sayfa yenileniyor...');
    window.location.reload();
  } catch (error) {
    console.error('Veritabanı silinemedi:', error);
  }
};

// Veritabanı versiyonunu kontrol et
export const checkDatabaseVersion = async () => {
  try {
    const version = await db.verno;
    console.log('Mevcut veritabanı versiyonu:', version);
    return version;
  } catch (error) {
    console.error('Veritabanı versiyonu kontrol edilemedi:', error);
    return null;
  }
};
