import Dexie from 'dexie';

export const db = new Dexie('GozlukYonetimDB');

// Version 1 - İlk şema
db.version(1).stores({
  customers: '++id, telefon, ad, soyad, email, olusturma_tarihi',
  prescriptions: '++id, musteri_id, tarih, aktif',
  products: '++id, barkod, sku, marka, model, kategori, stok_adedi',
  lens_catalog: '++id, tedarikci_id, ad, tip, endeks',
  orders: '++id, fis_no, musteri_id, durum, siparis_tarihi, teslim_beklenen',
  order_items: '++id, siparis_id, kalem_tipi',
  payments: '++id, siparis_id, tarih',
  suppliers: '++id, firma_adi, kategori',
  stock_movements: '++id, urun_id, tarih, hareket_tipi',
  settings: '++id, key'
});

// Version 2 - Login + TC Kimlik + Referans sistemi
db.version(2).stores({
  users: '++id, &username, email',
  customers: '++id, &tc_kimlik, telefon, ad, soyad, email, parent_id, olusturma_tarihi',
  prescriptions: '++id, musteri_id, tarih, aktif',
  products: '++id, barkod, sku, marka, model, kategori, stok_adedi',
  lens_catalog: '++id, tedarikci_id, ad, tip, endeks',
  orders: '++id, fis_no, musteri_id, durum, siparis_tarihi, teslim_beklenen',
  order_items: '++id, siparis_id, kalem_tipi',
  payments: '++id, siparis_id, tarih',
  suppliers: '++id, firma_adi, kategori',
  stock_movements: '++id, urun_id, tarih, hareket_tipi',
  settings: '++id, key'
}).upgrade(tx => {
  // Mevcut müşterilere tc_kimlik ve parent_id alanlarını ekle
  return tx.table('customers').toCollection().modify(customer => {
    if (!customer.tc_kimlik) customer.tc_kimlik = null;
    if (!customer.parent_id) customer.parent_id = null;
  });
});

// Helper functions
export const generateFisNo = async () => {
  const year = new Date().getFullYear();
  const orders = await db.orders
    .where('fis_no')
    .startsWith(`OPT-${year}`)
    .toArray();
  
  const lastNumber = orders.length > 0 
    ? Math.max(...orders.map(o => parseInt(o.fis_no.split('-')[2])))
    : 0;
  
  return `OPT-${year}-${String(lastNumber + 1).padStart(5, '0')}`;
};

export const updateStock = async (urun_id, miktar, hareket_tipi, referans_id, aciklama) => {
  const product = await db.products.get(urun_id);
  if (!product) throw new Error('Ürün bulunamadı');
  
  const onceki_stok = product.stok_adedi;
  const sonraki_stok = hareket_tipi === 'cikis' 
    ? onceki_stok - miktar 
    : onceki_stok + miktar;
  
  await db.products.update(urun_id, { stok_adedi: sonraki_stok });
  
  await db.stock_movements.add({
    urun_id,
    hareket_tipi,
    miktar,
    onceki_stok,
    sonraki_stok,
    referans_id,
    aciklama,
    tarih: new Date().toISOString()
  });
  
  return sonraki_stok;
};

export const exportData = async () => {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    customers: await db.customers.toArray(),
    prescriptions: await db.prescriptions.toArray(),
    products: await db.products.toArray(),
    lens_catalog: await db.lens_catalog.toArray(),
    orders: await db.orders.toArray(),
    order_items: await db.order_items.toArray(),
    payments: await db.payments.toArray(),
    suppliers: await db.suppliers.toArray(),
    stock_movements: await db.stock_movements.toArray(),
    settings: await db.settings.toArray()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gozluk-yedek-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        await db.transaction('rw', db.tables, async () => {
          for (const table of db.tables) {
            if (data[table.name]) {
              await table.clear();
              await table.bulkAdd(data[table.name]);
            }
          }
        });
        
        resolve('Veri başarıyla içe aktarıldı');
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export default db;
