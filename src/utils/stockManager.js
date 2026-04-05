import db, { updateStock } from '../db/database';

/**
 * Sipariş için stok düşür
 * @param {number} orderId - Sipariş ID
 * @param {string} fisNo - Fiş numarası
 * @returns {Promise<void>}
 */
export const decreaseStockForOrder = async (orderId, fisNo) => {
  const items = await db.order_items.where('siparis_id').equals(orderId).toArray();
  
  for (const item of items) {
    if (item.urun_id) {
      const product = await db.products.get(item.urun_id);
      
      if (product) {
        // Stok kontrolü
        if (product.stok_adedi < item.adet) {
          throw new Error(
            `${product.marka} ${product.model} için yeterli stok yok!\n` +
            `Mevcut: ${product.stok_adedi}, İstenen: ${item.adet}`
          );
        }
        
        // Stok düş
        await updateStock(
          item.urun_id,
          item.adet,
          'cikis',
          orderId,
          `Sipariş: ${fisNo} - ${item.kalem_tipi}`
        );
      }
    }
  }
};

/**
 * Sipariş iptal edildiğinde stok geri ekle
 * @param {number} orderId - Sipariş ID
 * @param {string} fisNo - Fiş numarası
 * @returns {Promise<void>}
 */
export const restoreStockForOrder = async (orderId, fisNo) => {
  const items = await db.order_items.where('siparis_id').equals(orderId).toArray();
  
  for (const item of items) {
    if (item.urun_id) {
      const product = await db.products.get(item.urun_id);
      
      if (product) {
        // Stok geri ekle
        await updateStock(
          item.urun_id,
          item.adet,
          'giris',
          orderId,
          `İptal: ${fisNo} - ${item.kalem_tipi} (Stok İadesi)`
        );
      }
    }
  }
};

/**
 * Ürün stok durumunu kontrol et
 * @param {number} productId - Ürün ID
 * @param {number} requestedAmount - İstenen miktar
 * @returns {Promise<{available: boolean, current: number, message: string}>}
 */
export const checkStockAvailability = async (productId, requestedAmount) => {
  const product = await db.products.get(productId);
  
  if (!product) {
    return {
      available: false,
      current: 0,
      message: 'Ürün bulunamadı'
    };
  }
  
  const available = product.stok_adedi >= requestedAmount;
  
  return {
    available,
    current: product.stok_adedi,
    message: available 
      ? 'Stok yeterli' 
      : `Yetersiz stok! Mevcut: ${product.stok_adedi}, İstenen: ${requestedAmount}`
  };
};

/**
 * Düşük stok uyarısı kontrolü
 * @param {number} productId - Ürün ID
 * @returns {Promise<{isLow: boolean, current: number, minimum: number}>}
 */
export const checkLowStock = async (productId) => {
  const product = await db.products.get(productId);
  
  if (!product) {
    return { isLow: false, current: 0, minimum: 0 };
  }
  
  const minimum = product.min_stok_uyari || 5;
  const isLow = product.stok_adedi <= minimum;
  
  return {
    isLow,
    current: product.stok_adedi,
    minimum
  };
};

/**
 * Toplu stok güncelleme
 * @param {Array<{productId: number, amount: number}>} updates - Güncellemeler
 * @param {string} type - 'giris' veya 'cikis'
 * @param {string} reason - Sebep
 * @returns {Promise<void>}
 */
export const bulkStockUpdate = async (updates, type, reason) => {
  for (const update of updates) {
    await updateStock(
      update.productId,
      update.amount,
      type,
      null,
      reason
    );
  }
};

/**
 * Stok sayımı yap
 * @param {Array<{productId: number, actualStock: number}>} counts - Sayım sonuçları
 * @returns {Promise<Array<{productId: number, difference: number, action: string}>>}
 */
export const performStockCount = async (counts) => {
  const results = [];
  
  for (const count of counts) {
    const product = await db.products.get(count.productId);
    
    if (product) {
      const difference = count.actualStock - product.stok_adedi;
      
      if (difference !== 0) {
        const type = difference > 0 ? 'giris' : 'cikis';
        const amount = Math.abs(difference);
        
        await updateStock(
          count.productId,
          amount,
          type,
          null,
          `Stok Sayımı - Fark: ${difference}`
        );
        
        results.push({
          productId: count.productId,
          difference,
          action: type === 'giris' ? 'Eklendi' : 'Düşüldü'
        });
      }
    }
  }
  
  return results;
};
