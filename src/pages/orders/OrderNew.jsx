import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Plus, Trash2, User, Glasses, AlertTriangle } from 'lucide-react';
import db, { generateFisNo } from '../../db/database';
import { decreaseStockForOrder, checkStockAvailability } from '../../utils/stockManager';

export default function OrderNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [items, setItems] = useState([]);
  const [orderData, setOrderData] = useState({
    teslim_beklenen: '',
    indirim_yuzde: 0,
    indirim_tl: 0,
    notlar: ''
  });

  const customers = useLiveQuery(() => db.customers.toArray());
  const products = useLiveQuery(() => db.products.toArray());
  const prescriptions = useLiveQuery(() => 
    selectedCustomer 
      ? db.prescriptions.where('musteri_id').equals(selectedCustomer.id).toArray()
      : []
  , [selectedCustomer]);

  // URL parametrelerinden müşteri ve tip bilgisini al
  useEffect(() => {
    const customerId = searchParams.get('customer');
    const type = searchParams.get('type');
    
    if (customerId && customers) {
      const customer = customers.find(c => c.id === parseInt(customerId));
      if (customer) {
        setSelectedCustomer(customer);
        
        // Eğer sadece lens satışı ise, otomatik cam kalemleri ekle
        if (type === 'lens') {
          setItems([
            {
              id: Date.now(),
              kalem_tipi: 'cam_sag',
              urun_id: null,
              aciklama: '',
              adet: 1,
              birim_fiyat: 0,
              indirim: 0
            },
            {
              id: Date.now() + 1,
              kalem_tipi: 'cam_sol',
              urun_id: null,
              aciklama: '',
              adet: 1,
              birim_fiyat: 0,
              indirim: 0
            }
          ]);
        }
      }
    }
  }, [searchParams, customers]);

  const addItem = (type) => {
    setItems([...items, {
      id: Date.now(),
      kalem_tipi: type,
      urun_id: null,
      aciklama: '',
      adet: 1,
      birim_fiyat: 0,
      indirim: 0
    }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotals = () => {
    const ara_toplam = items.reduce((sum, item) => {
      const itemTotal = (item.birim_fiyat * item.adet) - item.indirim;
      return sum + itemTotal;
    }, 0);

    const indirim = orderData.indirim_tl || (ara_toplam * (orderData.indirim_yuzde / 100));
    const kdv_tutari = (ara_toplam - indirim) * 0.20; // Varsayılan %20 KDV
    const genel_toplam = ara_toplam - indirim + kdv_tutari;

    return { ara_toplam, indirim, kdv_tutari, genel_toplam };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('Lütfen müşteri seçin');
      return;
    }

    if (items.length === 0) {
      alert('Lütfen en az bir kalem ekleyin');
      return;
    }

    try {
      // Önce tüm stokları kontrol et
      for (const item of items) {
        if (item.urun_id) {
          const stockCheck = await checkStockAvailability(item.urun_id, item.adet);
          if (!stockCheck.available) {
            alert(stockCheck.message);
            return;
          }
        }
      }

      const fis_no = await generateFisNo();
      const totals = calculateTotals();

      const orderId = await db.orders.add({
        fis_no,
        musteri_id: selectedCustomer.id,
        recete_id: selectedPrescription?.id || null,
        durum: 'onaylandi',
        siparis_tarihi: new Date().toISOString(),
        teslim_beklenen: orderData.teslim_beklenen,
        ara_toplam: totals.ara_toplam,
        indirim_tl: totals.indirim,
        indirim_yuzde: orderData.indirim_yuzde,
        kdv_tutari: totals.kdv_tutari,
        genel_toplam: totals.genel_toplam,
        odenen_toplam: 0,
        odeme_tamamlandi: false,
        notlar: orderData.notlar
      });

      // Sipariş kalemlerini ekle
      for (const item of items) {
        await db.order_items.add({
          siparis_id: orderId,
          kalem_tipi: item.kalem_tipi,
          urun_id: item.urun_id,
          aciklama: item.aciklama,
          adet: item.adet,
          birim_fiyat: item.birim_fiyat,
          indirim: item.indirim,
          toplam: (item.birim_fiyat * item.adet) - item.indirim
        });
      }

      // Stok düşürme işlemini stockManager ile yap
      await decreaseStockForOrder(orderId, fis_no);

      navigate(`/orders/${orderId}`);
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/orders')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Sipariş</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Müşteri Seçimi */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-6 h-6" />
            Müşteri Seçimi
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Müşteri *</label>
              <select
                required
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers?.find(c => c.id === parseInt(e.target.value));
                  setSelectedCustomer(customer);
                  setSelectedPrescription(null);
                }}
                className="input"
              >
                <option value="">Müşteri seçin...</option>
                {customers?.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.ad} {customer.soyad} - {customer.telefon}
                  </option>
                ))}
              </select>
            </div>

            {prescriptions && prescriptions.length > 0 && (
              <div>
                <label className="label">Reçete</label>
                <select
                  value={selectedPrescription?.id || ''}
                  onChange={(e) => {
                    const prescription = prescriptions.find(p => p.id === parseInt(e.target.value));
                    setSelectedPrescription(prescription);
                  }}
                  className="input"
                >
                  <option value="">Reçete seçin (opsiyonel)...</option>
                  {prescriptions.map(prescription => (
                    <option key={prescription.id} value={prescription.id}>
                      {new Date(prescription.tarih).toLocaleDateString('tr-TR')}
                      {prescription.aktif && ' (Aktif)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label">Teslim Tarihi</label>
              <input
                type="date"
                value={orderData.teslim_beklenen}
                onChange={(e) => setOrderData({ ...orderData, teslim_beklenen: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Kalemler */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sipariş Kalemleri</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addItem('çerçeve')}
                className="btn-secondary text-sm"
              >
                + Çerçeve
              </button>
              <button
                type="button"
                onClick={() => addItem('cam_sag')}
                className="btn-secondary text-sm"
              >
                + Cam Sağ
              </button>
              <button
                type="button"
                onClick={() => addItem('cam_sol')}
                className="btn-secondary text-sm"
              >
                + Cam Sol
              </button>
              <button
                type="button"
                onClick={() => addItem('işçilik')}
                className="btn-secondary text-sm"
              >
                + İşçilik
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-2">
                    <label className="label">Tip</label>
                    <input
                      type="text"
                      value={item.kalem_tipi}
                      disabled
                      className="input bg-gray-100"
                    />
                  </div>

                  {item.kalem_tipi === 'çerçeve' ? (
                    <div className="col-span-3">
                      <label className="label">Ürün</label>
                      <select
                        value={item.urun_id || ''}
                        onChange={(e) => {
                          const product = products?.find(p => p.id === parseInt(e.target.value));
                          updateItem(item.id, 'urun_id', parseInt(e.target.value));
                          if (product) {
                            updateItem(item.id, 'birim_fiyat', product.satis_fiyati);
                            updateItem(item.id, 'aciklama', `${product.marka} ${product.model}`);
                          }
                        }}
                        className="input"
                      >
                        <option value="">Seçin...</option>
                        {products?.filter(p => 
                          (p.kategori === 'çerçeve' || p.kategori === 'güneşlik') && 
                          (p.aktif === undefined || p.aktif === true)
                        ).map(product => {
                          const isLowStock = product.stok_adedi <= (product.min_stok_uyari || 5);
                          const isOutOfStock = product.stok_adedi === 0;
                          return (
                            <option 
                              key={product.id} 
                              value={product.id}
                              disabled={isOutOfStock}
                            >
                              {product.marka} {product.model} - Stok: {product.stok_adedi}
                              {isOutOfStock ? ' ❌ STOK YOK' : isLowStock ? ' ⚠️ DÜŞÜK' : ' ✓'}
                            </option>
                          );
                        })}
                      </select>
                      {item.urun_id && (() => {
                        const product = products?.find(p => p.id === item.urun_id);
                        if (product) {
                          const isLowStock = product.stok_adedi <= (product.min_stok_uyari || 5);
                          const willBeInsufficient = product.stok_adedi < item.adet;
                          if (willBeInsufficient) {
                            return (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Yetersiz stok! Mevcut: {product.stok_adedi}
                              </p>
                            );
                          } else if (isLowStock) {
                            return (
                              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Düşük stok uyarısı
                              </p>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                  ) : (
                    <div className="col-span-3">
                      <label className="label">Açıklama</label>
                      <input
                        type="text"
                        value={item.aciklama}
                        onChange={(e) => updateItem(item.id, 'aciklama', e.target.value)}
                        className="input"
                        placeholder="Ürün açıklaması..."
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="label">Adet</label>
                    <input
                      type="number"
                      min="1"
                      value={item.adet}
                      onChange={(e) => updateItem(item.id, 'adet', parseInt(e.target.value))}
                      className="input"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="label">Birim Fiyat</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.birim_fiyat}
                      onChange={(e) => updateItem(item.id, 'birim_fiyat', parseFloat(e.target.value))}
                      className="input"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="label">İndirim</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.indirim}
                      onChange={(e) => updateItem(item.id, 'indirim', parseFloat(e.target.value))}
                      className="input"
                    />
                  </div>

                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                Henüz kalem eklenmedi. Yukarıdaki butonlardan kalem ekleyin.
              </p>
            )}
          </div>
        </div>

        {/* Toplam */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Toplam</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Ara Toplam:</span>
              <span className="font-medium">₺{totals.ara_toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">İndirim (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={orderData.indirim_yuzde}
                  onChange={(e) => setOrderData({ ...orderData, indirim_yuzde: parseFloat(e.target.value) || 0, indirim_tl: 0 })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">İndirim (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={orderData.indirim_tl}
                  onChange={(e) => setOrderData({ ...orderData, indirim_tl: parseFloat(e.target.value) || 0, indirim_yuzde: 0 })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-between text-red-600">
              <span>İndirim:</span>
              <span className="font-medium">-₺{totals.indirim.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between">
              <span>KDV (%20):</span>
              <span className="font-medium">₺{totals.kdv_tutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-xl font-bold border-t pt-3">
              <span>Genel Toplam:</span>
              <span>₺{totals.genel_toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Notlar</label>
            <textarea
              value={orderData.notlar}
              onChange={(e) => setOrderData({ ...orderData, notlar: e.target.value })}
              className="input"
              rows="3"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1">
            Siparişi Oluştur
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="btn-secondary flex-1"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
