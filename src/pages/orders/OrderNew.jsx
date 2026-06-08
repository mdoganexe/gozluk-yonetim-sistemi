import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Plus, Trash2, User, Glasses, AlertTriangle, Eye, Wrench, Package, Sun, Image as ImageIcon, Upload, ClipboardPaste } from 'lucide-react';
import db, { generateFisNo } from '../../db/database';
import { decreaseStockForOrder, checkStockAvailability } from '../../utils/stockManager';
import { useSettings } from '../../utils/useSettings';
import ProductPicker from '../../components/ProductPicker';
import CustomerPicker from '../../components/CustomerPicker';
import PrescriptionModal from '../../components/PrescriptionModal';
import { useImageViewer } from '../../components/ImageViewer';
import { filesToImages } from '../../utils/image';
import { usePasteImages, readClipboardImages } from '../../utils/usePasteImages';
import { LENS_BRANDS } from '../../data/eyewearBrands';
import { usageLabel } from '../../utils/prescription';

const PAYMENT_LABELS = {
  nakit: '💵 Nakit',
  kredi_karti: '💳 Kredi Kartı',
  havale: '🏦 Havale/EFT',
  veresiye: '📝 Veresiye'
};

const tl = (v) => `₺${(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

let _uid = 1;
const uid = () => Date.now() * 1000 + (_uid++ % 1000);

export default function OrderNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const settings = useSettings();
  const { openImages } = useImageViewer();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [orderImages, setOrderImages] = useState([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [items, setItems] = useState([]);
  const [kdvUygula, setKdvUygula] = useState(true);
  const [hemenTeslim, setHemenTeslim] = useState(false);
  const [payments, setPayments] = useState([]);
  const [orderData, setOrderData] = useState({
    siparis_tarihi: new Date().toISOString().split('T')[0],
    teslim_beklenen: '',
    indirim_yuzde: 0,
    indirim_tl: 0,
    notlar: ''
  });
  const prefilledRef = useRef(false);

  // Seçilen sipariş tarihini, günün saatiyle ISO'ya çevir (tarih aralığı sorgularıyla uyumlu)
  const siparisTarihiISO = () => {
    const today = new Date().toISOString().split('T')[0];
    if (!orderData.siparis_tarihi || orderData.siparis_tarihi === today) {
      return new Date().toISOString();
    }
    const [y, m, d] = orderData.siparis_tarihi.split('-').map(Number);
    const dt = new Date();
    dt.setFullYear(y, m - 1, d);
    return dt.toISOString();
  };

  const customers = useLiveQuery(() => db.customers.toArray());
  const products = useLiveQuery(() => db.products.toArray());
  const prescriptions = useLiveQuery(() =>
    selectedCustomer
      ? db.prescriptions.where('musteri_id').equals(selectedCustomer.id).reverse().toArray()
      : []
  , [selectedCustomer]);

  const frameProducts = (products || []).filter(p =>
    (p.kategori === 'çerçeve' || p.kategori === 'güneşlik') && (p.aktif === undefined || p.aktif === true)
  );
  const accessoryProducts = (products || []).filter(p =>
    (p.kategori === 'aksesuar' || p.kategori === 'cam_stok') && (p.aktif === undefined || p.aktif === true)
  );
  const sunglassProducts = (products || []).filter(p =>
    p.kategori === 'güneşlik' && (p.aktif === undefined || p.aktif === true)
  );

  // KDV varsayılanı ayardan
  useEffect(() => {
    setKdvUygula((settings.kdvOrani || 0) > 0);
  }, [settings.kdvOrani]);

  // URL parametreleri: müşteri / tip / reçete
  useEffect(() => {
    if (!customers) return;
    const customerId = searchParams.get('customer');
    const type = searchParams.get('type');

    if (customerId) {
      const customer = customers.find(c => c.id === parseInt(customerId));
      if (customer) setSelectedCustomer(customer);
    }
    if (type === 'lens' && !prefilledRef.current) {
      // Sadece lens: tekil cam kalemleri
      prefilledRef.current = true;
      setItems([
        newItem('cam_sag', null),
        newItem('cam_sol', null)
      ]);
    }
    if (type === 'gunes' && !prefilledRef.current) {
      // Güneş gözlüğü: tek kalem, reçete gerekmez, genelde anında teslim
      prefilledRef.current = true;
      setItems([newItem('güneş', null)]);
      setHemenTeslim(true);
    }
    if (searchParams.get('hemen') === '1') setHemenTeslim(true);
    if (type === 'gozluk' && !prefilledRef.current) {
      // Gözlük satışı: çerçeve + cam seti hazır gelsin (reçete dropdown'dan seçilir)
      prefilledRef.current = true;
      addGozlukGroup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, customers]);

  // Reçete URL parametresi geldiyse seç + gözlük seti oluştur (reçete mirası)
  useEffect(() => {
    if (!prescriptions || prescriptions.length === 0) return;
    const prescId = searchParams.get('prescription');
    if (prescId && !prefilledRef.current) {
      const p = prescriptions.find(x => x.id === parseInt(prescId));
      if (p) {
        prefilledRef.current = true;
        setSelectedPrescription(p);
        // Lens reçetesiyse tekil camlar, optikse komple gözlük seti
        if (p.recete_tipi === 'lens') {
          setItems([newItem('cam_sag', null), newItem('cam_sol', null)]);
        } else {
          addGozlukGroup();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptions, searchParams]);

  function newItem(kalem_tipi, grup_id) {
    return {
      id: uid(), grup_id, kalem_tipi,
      urun_id: null, aciklama: '', cam_marka: '',
      adet: 1, birim_fiyat: 0, indirim: 0
    };
  }

  function addGozlukGroup() {
    const grup_id = uid();
    setItems(prev => [
      ...prev,
      newItem('çerçeve', grup_id),
      newItem('cam_sag', grup_id),
      newItem('cam_sol', grup_id)
    ]);
  }

  const addItemToGroup = (grup_id, tipi) => setItems(prev => [...prev, newItem(tipi, grup_id)]);
  const addStandalone = (tipi) => setItems(prev => [...prev, newItem(tipi, null)]);
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const removeGroup = (grup_id) => setItems(prev => prev.filter(i => i.grup_id !== grup_id));

  // TEK setItems ile patch — eski bug (ardarda updateItem) düzeltildi
  const patchItem = (id, patch) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));

  const selectFrame = (item, product) => {
    if (!product) {
      patchItem(item.id, { urun_id: null, aciklama: '', birim_fiyat: 0 });
      return;
    }
    const adet = Math.min(item.adet || 1, product.stok_adedi || 1) || 1;
    patchItem(item.id, {
      urun_id: product.id,
      aciklama: `${product.marka} ${product.model}${product.renk ? ' - ' + product.renk : ''}`,
      birim_fiyat: parseFloat(product.satis_fiyati) || 0,
      adet
    });
  };

  // Stok limitli adet değişimi
  const changeAdet = (item, value) => {
    let adet = parseInt(value) || 1;
    if (adet < 1) adet = 1;
    if (item.urun_id) {
      const p = products?.find(x => x.id === item.urun_id);
      if (p && adet > p.stok_adedi) {
        adet = p.stok_adedi;
        alert(`Stokta sadece ${p.stok_adedi} adet var, daha fazlası seçilemez.`);
      }
    }
    patchItem(item.id, { adet });
  };

  // Gruplama: grup_id sırasına göre etiketle
  const groupIds = [...new Set(items.filter(i => i.grup_id != null).map(i => i.grup_id))];
  const standaloneItems = items.filter(i => i.grup_id == null);

  const calculateTotals = () => {
    const ara_toplam = items.reduce((sum, item) =>
      sum + ((item.birim_fiyat * item.adet) - item.indirim), 0);
    const indirim = parseFloat(orderData.indirim_tl) || (ara_toplam * ((parseFloat(orderData.indirim_yuzde) || 0) / 100));
    const kdvOrani = kdvUygula ? (settings.kdvOrani || 0) : 0;
    const kdv_tutari = (ara_toplam - indirim) * (kdvOrani / 100);
    const genel_toplam = ara_toplam - indirim + kdv_tutari;
    return { ara_toplam, indirim, kdv_tutari, genel_toplam, kdvOrani };
  };
  const totals = calculateTotals();

  // Ödeme yöntemleri
  const addPayment = () => setPayments(prev => [...prev, { id: uid(), odeme_turu: 'nakit', tutar: '' }]);
  const removePayment = (id) => setPayments(prev => prev.filter(p => p.id !== id));
  const patchPayment = (id, patch) => setPayments(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  const fillFullCash = () => setPayments([{ id: uid(), odeme_turu: 'nakit', tutar: totals.genel_toplam.toFixed(2) }]);
  const toggleHemenTeslim = () => {
    setHemenTeslim(v => {
      const nv = !v;
      if (nv && payments.length === 0 && totals.genel_toplam > 0) {
        setPayments([{ id: uid(), odeme_turu: 'nakit', tutar: totals.genel_toplam.toFixed(2) }]);
      }
      return nv;
    });
  };
  const odenenToplam = payments.reduce((s, p) => s + (parseFloat(p.tutar) || 0), 0);

  // Yeni reçete kaydedilince en yenisini otomatik seç
  const handlePrescriptionSaved = async () => {
    setShowPrescriptionModal(false);
    if (!selectedCustomer) return;
    const list = await db.prescriptions.where('musteri_id').equals(selectedCustomer.id).toArray();
    const newest = list.reduce((a, b) => (b.id > (a?.id || 0) ? b : a), null);
    if (newest) setSelectedPrescription(newest);
  };

  const handleOrderImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploadingImg(true);
    try {
      const yeni = await filesToImages(files, 1400, 0.8);
      setOrderImages(prev => [...prev, ...yeni]);
    } catch { alert('Görsel yüklenemedi'); }
    finally { setUploadingImg(false); e.target.value = ''; }
  };
  const removeOrderImage = (idx) => setOrderImages(prev => prev.filter((_, i) => i !== idx));

  // Ctrl+V yapıştırma (reçete modalı açıkken devre dışı; o zaman görsel modala gider)
  usePasteImages((imgs) => setOrderImages(prev => [...prev, ...imgs]), { enabled: !showPrescriptionModal });
  const handlePasteOrderImg = async () => {
    try {
      const imgs = await readClipboardImages();
      if (imgs.length) setOrderImages(prev => [...prev, ...imgs]);
      else alert('Panoda resim yok. Bir resmi kopyalayıp tekrar deneyin (veya Ctrl+V).');
    } catch (e) { alert(e.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return alert('Lütfen müşteri seçin');
    if (items.length === 0) return alert('Lütfen en az bir kalem ekleyin');

    // Çerçeve kalemlerinde ürün seçilmiş mi?
    const emptyFrame = items.find(i => i.kalem_tipi === 'çerçeve' && !i.urun_id);
    if (emptyFrame) return alert('Çerçeve kalemlerinde ürün seçmelisiniz (büyüteçle arayabilirsiniz).');

    try {
      // Stok kontrolü
      for (const item of items) {
        if (item.urun_id) {
          const check = await checkStockAvailability(item.urun_id, item.adet);
          if (!check.available) return alert(check.message);
        }
      }

      const fis_no = await generateFisNo();
      const odeme_tamamlandi = odenenToplam >= totals.genel_toplam && totals.genel_toplam > 0;

      const orderId = await db.orders.add({
        fis_no,
        musteri_id: selectedCustomer.id,
        recete_id: selectedPrescription?.id || null,
        recete_snapshot: selectedPrescription || null, // reçete mirası (anlık kopya)
        gorseller: orderImages, // siparişe eklenen görseller (reçete kâğıdı/ürün fotoğrafı)
        durum: hemenTeslim ? 'teslim_edildi' : 'onaylandi',
        siparis_tarihi: siparisTarihiISO(),
        teslim_beklenen: orderData.teslim_beklenen,
        ara_toplam: totals.ara_toplam,
        indirim_tl: totals.indirim,
        indirim_yuzde: parseFloat(orderData.indirim_yuzde) || 0,
        kdv_orani: totals.kdvOrani,
        kdv_dahil: kdvUygula,
        kdv_tutari: totals.kdv_tutari,
        genel_toplam: totals.genel_toplam,
        odenen_toplam: odenenToplam,
        odeme_tamamlandi,
        notlar: orderData.notlar
      });

      // Grup etiketleri (1. Gözlük, 2. Gözlük...)
      const grupSira = {};
      groupIds.forEach((g, idx) => { grupSira[g] = idx + 1; });

      for (const item of items) {
        await db.order_items.add({
          siparis_id: orderId,
          grup_id: item.grup_id,
          grup_label: item.grup_id != null ? `${grupSira[item.grup_id]}. Gözlük` : null,
          kalem_tipi: item.kalem_tipi,
          urun_id: item.urun_id,
          aciklama: item.aciklama,
          cam_marka: item.cam_marka || '',
          adet: item.adet,
          birim_fiyat: item.birim_fiyat,
          indirim: item.indirim,
          toplam: (item.birim_fiyat * item.adet) - item.indirim
        });
      }

      // Ödemeleri kaydet
      for (const p of payments) {
        const tutar = parseFloat(p.tutar) || 0;
        if (tutar > 0) {
          await db.payments.add({
            siparis_id: orderId,
            tarih: new Date().toISOString(),
            tutar,
            odeme_turu: p.odeme_turu,
            aciklama: 'Sipariş anında ödeme'
          });
        }
      }

      await decreaseStockForOrder(orderId, fis_no);
      navigate(`/orders/${orderId}`);
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  // ---- Render yardımcıları ----
  const camTipiLabel = { cam_sag: 'Cam (Sağ)', cam_sol: 'Cam (Sol)', cam: 'Cam' };

  const ItemRow = ({ item }) => {
    const isFrame = item.kalem_tipi === 'çerçeve';
    const isCam = item.kalem_tipi.startsWith('cam');
    const isAccessory = item.kalem_tipi === 'aksesuar';
    const isSun = item.kalem_tipi === 'güneş';

    return (
      <div key={item.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-12 gap-3 items-start">
          <div className="col-span-12 md:col-span-4">
            <label className="label">
              {isFrame ? 'Çerçeve' : isSun ? 'Güneş Gözlüğü' : isCam ? camTipiLabel[item.kalem_tipi] || 'Cam' : isAccessory ? 'Aksesuar' : 'İşçilik / Açıklama'}
            </label>
            {isFrame ? (
              <ProductPicker
                products={frameProducts}
                value={item.urun_id}
                onSelect={(p) => selectFrame(item, p)}
                placeholder="🔍 Çerçeve ara/seç…"
              />
            ) : isSun ? (
              <ProductPicker
                products={sunglassProducts}
                value={item.urun_id}
                onSelect={(p) => selectFrame(item, p)}
                placeholder="🔍 Güneş gözlüğü ara/seç…"
              />
            ) : isAccessory ? (
              <ProductPicker
                products={accessoryProducts}
                value={item.urun_id}
                onSelect={(p) => selectFrame(item, p)}
                placeholder="🔍 Aksesuar ara/seç…"
              />
            ) : (
              <input
                type="text"
                value={item.aciklama}
                onChange={(e) => patchItem(item.id, { aciklama: e.target.value })}
                className="input"
                placeholder={isCam ? 'Cam açıklaması (opsiyonel)' : 'Açıklama...'}
              />
            )}
          </div>

          {isCam && (
            <div className="col-span-12 md:col-span-3">
              <label className="label">Cam Markası / İndeks</label>
              <input
                type="text"
                value={item.cam_marka}
                list="on-cam-marka"
                onChange={(e) => patchItem(item.id, { cam_marka: e.target.value })}
                className="input"
                placeholder="ör. 1.6 Ormix"
                autoComplete="off"
              />
            </div>
          )}

          <div className={`col-span-4 ${isCam ? 'md:col-span-1' : 'md:col-span-2'}`}>
            <label className="label">Adet</label>
            <input
              type="number" min="1"
              value={item.adet}
              onChange={(e) => changeAdet(item, e.target.value)}
              className="input"
            />
          </div>

          <div className="col-span-4 md:col-span-2">
            <label className="label">Birim ₺</label>
            <input
              type="number" step="0.01"
              value={item.birim_fiyat}
              onChange={(e) => patchItem(item.id, { birim_fiyat: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>

          <div className="col-span-3 md:col-span-1">
            <label className="label">İnd. ₺</label>
            <input
              type="number" step="0.01"
              value={item.indirim}
              onChange={(e) => patchItem(item.id, { indirim: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>

          <div className="col-span-1 flex items-end h-full pb-1">
            <button type="button" onClick={() => removeItem(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">
          Satır toplam: <span className="font-medium">{tl((item.birim_fiyat * item.adet) - item.indirim)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <datalist id="on-cam-marka">{LENS_BRANDS.map(b => <option key={b} value={b} />)}</datalist>
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/orders')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Sipariş</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Müşteri + Reçete */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-6 h-6" /> Müşteri & Reçete
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Müşteri *</label>
              <CustomerPicker
                customers={customers || []}
                value={selectedCustomer?.id}
                onSelect={(c) => { setSelectedCustomer(c); setSelectedPrescription(null); }}
              />
            </div>

            {selectedCustomer && (
              <div>
                <label className="label">Reçete (opsiyonel — siparişe miras alınır)</label>
                <div className="flex gap-2">
                  {prescriptions && prescriptions.length > 0 ? (
                    <select
                      value={selectedPrescription?.id || ''}
                      onChange={(e) => setSelectedPrescription(prescriptions.find(p => p.id === parseInt(e.target.value)) || null)}
                      className="input flex-1"
                    >
                      <option value="">Reçete seçin (opsiyonel)...</option>
                      {prescriptions.map(p => (
                        <option key={p.id} value={p.id}>
                          {new Date(p.tarih).toLocaleDateString('tr-TR')} · {p.recete_tipi === 'lens' ? 'Lens' : 'Optik'} · {usageLabel(p.kullanim || 'uzak')}{p.aktif ? ' (Aktif)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="input flex-1 bg-gray-50 dark:bg-slate-700 text-gray-400 flex items-center">Kayıtlı reçete yok</div>
                  )}
                  <button type="button" onClick={() => setShowPrescriptionModal(true)}
                    className="btn-secondary whitespace-nowrap flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Reçete Ekle
                  </button>
                </div>
              </div>
            )}

            {/* Reçete önizleme (miras görünürlüğü) */}
            {selectedPrescription && (
              <div className="p-3 bg-primary-50 dark:bg-slate-700 rounded-lg text-sm">
                <p className="font-medium mb-1 flex items-center gap-2">
                  {selectedPrescription.recete_tipi === 'lens' ? <Eye className="w-4 h-4" /> : <Glasses className="w-4 h-4" />}
                  Reçete {new Date(selectedPrescription.tarih).toLocaleDateString('tr-TR')} · {usageLabel(selectedPrescription.kullanim || 'uzak')}
                  {selectedPrescription.lens_marka && ` · ${selectedPrescription.lens_marka}`}
                </p>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <span>Sağ: {selectedPrescription.sag_sfera || '–'} / {selectedPrescription.sag_silindir || '–'} × {selectedPrescription.sag_aks || '–'}</span>
                  <span>Sol: {selectedPrescription.sol_sfera || '–'} / {selectedPrescription.sol_silindir || '–'} × {selectedPrescription.sol_aks || '–'}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:w-2/3">
              <div>
                <label className="label">Sipariş Tarihi</label>
                <input type="date" value={orderData.siparis_tarihi}
                  onChange={(e) => setOrderData({ ...orderData, siparis_tarihi: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label className="label">Teslim Tarihi</label>
                <input type="date" value={orderData.teslim_beklenen}
                  onChange={(e) => setOrderData({ ...orderData, teslim_beklenen: e.target.value })}
                  className="input" />
              </div>
            </div>

            {/* Sipariş Görselleri (reçete kâğıdı / ürün fotoğrafı) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Görseller (reçete kâğıdı / fotoğraf)
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={handlePasteOrderImg} className="btn-secondary text-sm flex items-center gap-2">
                    <ClipboardPaste className="w-4 h-4" /> Yapıştır
                  </button>
                  <label className="btn-secondary text-sm flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploadingImg ? 'Yükleniyor...' : 'Görsel Ekle'}
                    <input type="file" accept="image/*" multiple capture="environment"
                      onChange={handleOrderImageUpload} disabled={uploadingImg} className="hidden" />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">Dosyadan, kameradan veya <strong>Ctrl+V</strong> ile panodan ekleyebilirsiniz.</p>
              {orderImages.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {orderImages.map((g, idx) => (
                    <div key={idx} className="relative group">
                      <img src={g.dataUrl} alt={g.name || ''} onClick={() => openImages(orderImages, idx)}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-zoom-in" />
                      <button type="button" onClick={() => removeOrderImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kalemler */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Sipariş Kalemleri</h2>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={addGozlukGroup} className="btn-primary text-sm flex items-center gap-1">
                <Glasses className="w-4 h-4" /> + Yeni Gözlük (Çerçeve+Cam)
              </button>
              <button type="button" onClick={() => addStandalone('güneş')} className="btn-secondary text-sm flex items-center gap-1">
                <Sun className="w-4 h-4" /> + Güneş Gözlüğü
              </button>
              <button type="button" onClick={() => addStandalone('cam')} className="btn-secondary text-sm flex items-center gap-1">
                <Eye className="w-4 h-4" /> + Tekil Cam
              </button>
              <button type="button" onClick={() => addStandalone('aksesuar')} className="btn-secondary text-sm flex items-center gap-1">
                <Package className="w-4 h-4" /> + Aksesuar
              </button>
              <button type="button" onClick={() => addStandalone('işçilik')} className="btn-secondary text-sm flex items-center gap-1">
                <Wrench className="w-4 h-4" /> + İşçilik
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Gözlük setleri (gruplar) */}
            {groupIds.map((grup_id, idx) => {
              const groupItems = items.filter(i => i.grup_id === grup_id);
              const frame = groupItems.find(i => i.kalem_tipi === 'çerçeve');
              const grupToplam = groupItems.reduce((s, i) => s + ((i.birim_fiyat * i.adet) - i.indirim), 0);
              return (
                <div key={grup_id} className="border-2 border-primary-200 dark:border-slate-600 rounded-xl p-4 bg-primary-50/40 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-primary-700 flex items-center gap-2">
                      <Glasses className="w-5 h-5" />
                      {idx + 1}. Gözlük
                      {frame?.aciklama && <span className="text-sm font-normal text-gray-600">— {frame.aciklama}</span>}
                    </h3>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => addItemToGroup(grup_id, 'cam')} className="text-xs btn-secondary py-1 px-2">+ Cam</button>
                      <button type="button" onClick={() => addItemToGroup(grup_id, 'işçilik')} className="text-xs btn-secondary py-1 px-2">+ İşçilik</button>
                      <button type="button" onClick={() => removeGroup(grup_id)} className="text-xs text-red-600 hover:bg-red-50 rounded px-2 py-1 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Seti Sil
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Bu çerçevenin camları bu kutunun içinde — birbirine bağlı kayıt edilir.
                  </p>
                  <div className="space-y-2">
                    {groupItems.map(item => ItemRow({ item }))}
                  </div>
                  <div className="text-right text-sm font-semibold mt-2 text-primary-700">
                    Set toplamı: {tl(grupToplam)}
                  </div>
                </div>
              );
            })}

            {/* Tekil kalemler */}
            {standaloneItems.length > 0 && (
              <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Tekil Kalemler</h3>
                <div className="space-y-2">
                  {standaloneItems.map(item => ItemRow({ item }))}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                Henüz kalem yok. "Yeni Gözlük" ile çerçeve + cam seti ekleyin.
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
              <span className="font-medium">{tl(totals.ara_toplam)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">İndirim (%)</label>
                <input type="number" step="0.01" value={orderData.indirim_yuzde}
                  onChange={(e) => setOrderData({ ...orderData, indirim_yuzde: parseFloat(e.target.value) || 0, indirim_tl: 0 })}
                  className="input" />
              </div>
              <div>
                <label className="label">İndirim (TL)</label>
                <input type="number" step="0.01" value={orderData.indirim_tl}
                  onChange={(e) => setOrderData({ ...orderData, indirim_tl: parseFloat(e.target.value) || 0, indirim_yuzde: 0 })}
                  className="input" />
              </div>
            </div>

            <div className="flex justify-between text-red-600">
              <span>İndirim:</span>
              <span className="font-medium">-{tl(totals.indirim)}</span>
            </div>

            {/* KDV opsiyonel */}
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={kdvUygula} onChange={(e) => setKdvUygula(e.target.checked)} className="w-4 h-4" />
                <span>KDV uygula (%{settings.kdvOrani})</span>
              </label>
              <span className="font-medium">{tl(totals.kdv_tutari)}</span>
            </div>

            <div className="flex justify-between text-xl font-bold border-t pt-3">
              <span>Genel Toplam:</span>
              <span>{tl(totals.genel_toplam)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Notlar</label>
            <textarea value={orderData.notlar}
              onChange={(e) => setOrderData({ ...orderData, notlar: e.target.value })}
              className="input" rows="2" />
          </div>
        </div>

        {/* Ödeme */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Ödeme (opsiyonel)</h2>
            <div className="flex gap-2">
              <button type="button" onClick={fillFullCash} className="btn-secondary text-sm">Tümü Nakit</button>
              <button type="button" onClick={addPayment} className="btn-secondary text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Ödeme Ekle
              </button>
            </div>
          </div>

          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">
              Ödeme eklemezseniz sipariş <strong>veresiye</strong> olarak kaydedilir, sonra Kasa'dan tahsilat alabilirsiniz.
            </p>
          ) : (
            <div className="space-y-3">
              {payments.map(p => (
                <div key={p.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <label className="label">Ödeme Türü</label>
                    <select value={p.odeme_turu} onChange={(e) => patchPayment(p.id, { odeme_turu: e.target.value })} className="input">
                      {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <label className="label">Tutar ₺</label>
                    <input type="number" step="0.01" value={p.tutar}
                      onChange={(e) => patchPayment(p.id, { tutar: e.target.value })} className="input" placeholder="0.00" />
                  </div>
                  <div className="col-span-1">
                    <button type="button" onClick={() => removePayment(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Toplam Ödeme / Kalan:</span>
                <span className="font-medium">
                  {tl(odenenToplam)} / <span className={totals.genel_toplam - odenenToplam > 0 ? 'text-orange-600' : 'text-green-600'}>
                    {tl(Math.max(0, totals.genel_toplam - odenenToplam))}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hemen Teslim */}
        <div className={`card border-2 ${hemenTeslim ? 'border-green-400 bg-green-50 dark:bg-slate-800' : 'border-gray-200'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={hemenTeslim} onChange={toggleHemenTeslim} className="w-5 h-5" />
            <div>
              <span className="font-semibold">Hemen Teslim Et (anında satış)</span>
              <p className="text-sm text-gray-600">
                Güneş gözlüğü/perakende gibi anında satışlar için. Sipariş <strong>Teslim Edildi</strong> olarak
                kaydedilir, tahsilat tam nakit ön-doldurulur (değiştirebilirsiniz). Laboratuvar/üretim beklemez.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1">
            {hemenTeslim ? 'Sat ve Teslim Et' : 'Siparişi Oluştur'}
          </button>
          <button type="button" onClick={() => navigate('/orders')} className="btn-secondary flex-1">İptal</button>
        </div>
      </form>

      {showPrescriptionModal && selectedCustomer && (
        <PrescriptionModal
          customerId={selectedCustomer.id}
          onClose={() => setShowPrescriptionModal(false)}
          onSave={handlePrescriptionSaved}
        />
      )}
    </div>
  );
}
