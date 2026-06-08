import { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import {
  X, ArrowLeft, ArrowRight, Check, User, Glasses, Eye, Wrench, Package,
  Plus, Trash2, CreditCard, CheckCircle2, FileText
} from 'lucide-react';
import db, { generateFisNo } from '../db/database';
import { decreaseStockForOrder, checkStockAvailability } from '../utils/stockManager';
import { useSettings } from '../utils/useSettings';
import ProductPicker from './ProductPicker';
import CustomerPicker from './CustomerPicker';
import { CONTACT_LENS_BRANDS, LENS_BRANDS } from '../data/eyewearBrands';

const tl = (v) => `₺${(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
const PAYMENT_LABELS = { nakit: '💵 Nakit', kredi_karti: '💳 Kredi Kartı', havale: '🏦 Havale/EFT', veresiye: '📝 Veresiye' };

let _uid = 1;
const uid = () => Date.now() * 1000 + (_uid++ % 1000);
const newItem = (kalem_tipi, grup_id) => ({
  id: uid(), grup_id, kalem_tipi, urun_id: null, aciklama: '', cam_marka: '', adet: 1, birim_fiyat: 0, indirim: 0
});

const STEPS = ['Müşteri', 'Reçete', 'Kalemler', 'Ödeme', 'Özet'];

export default function SaleWizard({ onClose }) {
  const navigate = useNavigate();
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { orderId, fisNo }

  const customers = useLiveQuery(() => db.customers.orderBy('ad').toArray());
  const products = useLiveQuery(() => db.products.toArray());

  // --- Adım 1: Müşteri ---
  const [custMode, setCustMode] = useState('new'); // 'new' | 'existing'
  const [existingCustomerId, setExistingCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({ ad: '', soyad: '', telefon: '', tc_kimlik: '', email: '' });

  const existingCustomer = customers?.find(c => c.id === parseInt(existingCustomerId));

  // --- Adım 2: Reçete ---
  const [presMode, setPresMode] = useState('none'); // 'none' | 'existing' | 'new'
  const [existingPresId, setExistingPresId] = useState('');
  const [presTip, setPresTip] = useState('optik');
  const [presData, setPresData] = useState({
    sag_sfera: '', sag_silindir: '', sag_aks: '', sag_bc: '', sag_dia: '',
    sol_sfera: '', sol_silindir: '', sol_aks: '', sol_bc: '', sol_dia: '',
    pd_uzak_sag: '', pd_uzak_sol: '', lens_marka: '', doktor_adi: '', notlar: ''
  });

  const existingPrescriptions = useLiveQuery(
    () => (custMode === 'existing' && existingCustomerId)
      ? db.prescriptions.where('musteri_id').equals(parseInt(existingCustomerId)).reverse().toArray()
      : [],
    [custMode, existingCustomerId]
  );

  // --- Adım 3: Kalemler ---
  const [items, setItems] = useState([]);
  const [kdvUygula, setKdvUygula] = useState(true);
  const [discount, setDiscount] = useState({ indirim_yuzde: 0, indirim_tl: 0 });
  const [teslim, setTeslim] = useState('');
  const [notlar, setNotlar] = useState('');

  useEffect(() => { setKdvUygula((settings.kdvOrani || 0) > 0); }, [settings.kdvOrani]);

  const frameProducts = (products || []).filter(p =>
    (p.kategori === 'çerçeve' || p.kategori === 'güneşlik') && (p.aktif === undefined || p.aktif === true));
  const accessoryProducts = (products || []).filter(p =>
    (p.kategori === 'aksesuar' || p.kategori === 'cam_stok') && (p.aktif === undefined || p.aktif === true));

  const addGozlukGroup = () => {
    const g = uid();
    setItems(prev => [...prev, newItem('çerçeve', g), newItem('cam_sag', g), newItem('cam_sol', g)]);
  };
  const addItemToGroup = (g, t) => setItems(prev => [...prev, newItem(t, g)]);
  const addStandalone = (t) => setItems(prev => [...prev, newItem(t, null)]);
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const removeGroup = (g) => setItems(prev => prev.filter(i => i.grup_id !== g));
  const patchItem = (id, patch) => setItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));

  const selectFrame = (item, product) => {
    if (!product) return patchItem(item.id, { urun_id: null, aciklama: '', birim_fiyat: 0 });
    const adet = Math.min(item.adet || 1, product.stok_adedi || 1) || 1;
    patchItem(item.id, {
      urun_id: product.id,
      aciklama: `${product.marka} ${product.model}${product.renk ? ' - ' + product.renk : ''}`,
      birim_fiyat: parseFloat(product.satis_fiyati) || 0,
      adet
    });
  };
  const changeAdet = (item, value) => {
    let adet = parseInt(value) || 1;
    if (adet < 1) adet = 1;
    if (item.urun_id) {
      const p = products?.find(x => x.id === item.urun_id);
      if (p && adet > p.stok_adedi) { adet = p.stok_adedi; alert(`Stokta sadece ${p.stok_adedi} adet var.`); }
    }
    patchItem(item.id, { adet });
  };

  const groupIds = [...new Set(items.filter(i => i.grup_id != null).map(i => i.grup_id))];
  const standaloneItems = items.filter(i => i.grup_id == null);

  const totals = useMemo(() => {
    const ara_toplam = items.reduce((s, i) => s + ((i.birim_fiyat * i.adet) - i.indirim), 0);
    const indirim = parseFloat(discount.indirim_tl) || (ara_toplam * ((parseFloat(discount.indirim_yuzde) || 0) / 100));
    const kdvOrani = kdvUygula ? (settings.kdvOrani || 0) : 0;
    const kdv_tutari = (ara_toplam - indirim) * (kdvOrani / 100);
    const genel_toplam = ara_toplam - indirim + kdv_tutari;
    return { ara_toplam, indirim, kdv_tutari, genel_toplam, kdvOrani };
  }, [items, discount, kdvUygula, settings.kdvOrani]);

  // --- Adım 4: Ödeme ---
  const [payments, setPayments] = useState([]);
  const addPayment = () => setPayments(prev => [...prev, { id: uid(), odeme_turu: 'nakit', tutar: '' }]);
  const removePayment = (id) => setPayments(prev => prev.filter(p => p.id !== id));
  const patchPayment = (id, patch) => setPayments(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  const fillFullCash = () => setPayments([{ id: uid(), odeme_turu: 'nakit', tutar: totals.genel_toplam.toFixed(2) }]);
  const odenenToplam = payments.reduce((s, p) => s + (parseFloat(p.tutar) || 0), 0);

  // --- Adım geçiş doğrulama ---
  const canNext = () => {
    if (step === 0) {
      if (custMode === 'existing') return !!existingCustomerId;
      return newCustomer.ad.trim() && newCustomer.soyad.trim() && newCustomer.telefon.trim();
    }
    if (step === 2) {
      if (items.length === 0) return false;
      if (items.some(i => i.kalem_tipi === 'çerçeve' && !i.urun_id)) return false;
      return true;
    }
    return true;
  };

  const next = () => {
    if (!canNext()) {
      if (step === 0) alert('Müşteri seçin veya yeni müşteri bilgilerini (Ad, Soyad, Telefon) doldurun.');
      else if (step === 2) alert('En az bir kalem ekleyin ve çerçeve kalemlerinde ürün seçin.');
      return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep(s => Math.max(s - 1, 0));

  // --- Tamamla ---
  const finish = async () => {
    setSaving(true);
    try {
      // 0) Stok kontrolü EN BAŞTA (yetersizse yeni müşteri/reçete oluşturup yetim bırakma)
      for (const item of items) {
        if (item.urun_id) {
          const check = await checkStockAvailability(item.urun_id, item.adet);
          if (!check.available) { setSaving(false); return alert(check.message); }
        }
      }

      // 1) Müşteri
      let customerId;
      if (custMode === 'existing') {
        customerId = parseInt(existingCustomerId);
      } else {
        if (newCustomer.tc_kimlik) {
          const ex = await db.customers.where('tc_kimlik').equals(newCustomer.tc_kimlik).first();
          if (ex) { setSaving(false); return alert('Bu TC Kimlik numarası zaten kayıtlı!'); }
        }
        customerId = await db.customers.add({
          ...newCustomer,
          parent_id: null,
          olusturma_tarihi: new Date().toISOString(),
          guncelleme_tarihi: new Date().toISOString()
        });
      }

      // 2) Reçete
      let receteId = null;
      let receteSnapshot = null;
      if (presMode === 'existing' && existingPresId) {
        receteId = parseInt(existingPresId);
        receteSnapshot = existingPrescriptions?.find(p => p.id === receteId) || null;
      } else if (presMode === 'new') {
        await db.prescriptions.where('musteri_id').equals(customerId).modify({ aktif: false });
        const presPayload = {
          musteri_id: customerId,
          recete_tipi: presTip,
          tarih: new Date().toISOString().split('T')[0],
          aktif: true,
          gorseller: [],
          ...presData
        };
        receteId = await db.prescriptions.add(presPayload);
        receteSnapshot = { id: receteId, ...presPayload };
      }

      // 3) Sipariş
      const fis_no = await generateFisNo();
      const odeme_tamamlandi = odenenToplam >= totals.genel_toplam && totals.genel_toplam > 0;
      const orderId = await db.orders.add({
        fis_no,
        musteri_id: customerId,
        recete_id: receteId,
        recete_snapshot: receteSnapshot,
        durum: 'onaylandi',
        siparis_tarihi: new Date().toISOString(),
        teslim_beklenen: teslim,
        ara_toplam: totals.ara_toplam,
        indirim_tl: totals.indirim,
        indirim_yuzde: parseFloat(discount.indirim_yuzde) || 0,
        kdv_orani: totals.kdvOrani,
        kdv_dahil: kdvUygula,
        kdv_tutari: totals.kdv_tutari,
        genel_toplam: totals.genel_toplam,
        odenen_toplam: odenenToplam,
        odeme_tamamlandi,
        notlar
      });

      // 5) Kalemler (gruplu)
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

      // 6) Ödemeler
      for (const p of payments) {
        const t = parseFloat(p.tutar) || 0;
        if (t > 0) {
          await db.payments.add({
            siparis_id: orderId, tarih: new Date().toISOString(),
            tutar: t, odeme_turu: p.odeme_turu, aciklama: 'Hızlı satış sihirbazı'
          });
        }
      }

      // 7) Stok düş
      await decreaseStockForOrder(orderId, fis_no);

      setResult({ orderId, fisNo: fis_no });
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const customerName = custMode === 'existing'
    ? (existingCustomer ? `${existingCustomer.ad} ${existingCustomer.soyad}` : '-')
    : `${newCustomer.ad} ${newCustomer.soyad}`.trim();

  // ---- Render ----
  const ItemRow = ({ item }) => {
    const isFrame = item.kalem_tipi === 'çerçeve';
    const isCam = item.kalem_tipi.startsWith('cam');
    const isAcc = item.kalem_tipi === 'aksesuar';
    const camLbl = { cam_sag: 'Cam (Sağ)', cam_sol: 'Cam (Sol)', cam: 'Cam' }[item.kalem_tipi] || 'Cam';
    return (
      <div key={item.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-12 md:col-span-4">
            <label className="label">{isFrame ? 'Çerçeve' : isCam ? camLbl : isAcc ? 'Aksesuar' : 'İşçilik'}</label>
            {isFrame ? (
              <ProductPicker products={frameProducts} value={item.urun_id} onSelect={(p) => selectFrame(item, p)} placeholder="🔍 Çerçeve ara/seç…" />
            ) : isAcc ? (
              <ProductPicker products={accessoryProducts} value={item.urun_id} onSelect={(p) => selectFrame(item, p)} placeholder="🔍 Aksesuar ara/seç…" />
            ) : (
              <input type="text" value={item.aciklama} onChange={(e) => patchItem(item.id, { aciklama: e.target.value })} className="input" placeholder="Açıklama" />
            )}
          </div>
          {isCam && (
            <div className="col-span-12 md:col-span-3">
              <label className="label">Cam Markası / İndeks</label>
              <input type="text" value={item.cam_marka} list="wiz-cam-marka" onChange={(e) => patchItem(item.id, { cam_marka: e.target.value })} className="input" placeholder="ör. 1.6 Ormix" autoComplete="off" />
            </div>
          )}
          <div className={`col-span-4 ${isCam ? 'md:col-span-1' : 'md:col-span-2'}`}>
            <label className="label">Adet</label>
            <input type="number" min="1" value={item.adet} onChange={(e) => changeAdet(item, e.target.value)} className="input" />
          </div>
          <div className="col-span-4 md:col-span-2">
            <label className="label">Birim ₺</label>
            <input type="number" step="0.01" value={item.birim_fiyat} onChange={(e) => patchItem(item.id, { birim_fiyat: parseFloat(e.target.value) || 0 })} className="input" />
          </div>
          <div className="col-span-3 md:col-span-1">
            <label className="label">İnd. ₺</label>
            <input type="number" step="0.01" value={item.indirim} onChange={(e) => patchItem(item.id, { indirim: parseFloat(e.target.value) || 0 })} className="input" />
          </div>
          <div className="col-span-1 flex items-end h-full pb-1">
            <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    );
  };

  const EyeRow = ({ side, label }) => (
    <div key={side} className="grid grid-cols-5 gap-2 items-end">
      <div className="font-semibold text-sm pb-2">{label}</div>
      <div><label className="label">{presTip === 'lens' ? 'SPH' : 'Sfera'}</label>
        <input type="number" step="0.25" value={presData[`${side}_sfera`]} onChange={(e) => setPresData({ ...presData, [`${side}_sfera`]: e.target.value })} className="input" /></div>
      <div><label className="label">{presTip === 'lens' ? 'CYL' : 'Sil.'}</label>
        <input type="number" step="0.25" value={presData[`${side}_silindir`]} onChange={(e) => setPresData({ ...presData, [`${side}_silindir`]: e.target.value })} className="input" /></div>
      <div><label className="label">{presTip === 'lens' ? 'AXIS' : 'Aks'}</label>
        <input type="number" value={presData[`${side}_aks`]} onChange={(e) => setPresData({ ...presData, [`${side}_aks`]: e.target.value })} className="input" /></div>
      <div><label className="label">{presTip === 'lens' ? 'DIA' : 'PD'}</label>
        <input type="number" step="0.1" value={presTip === 'lens' ? presData[`${side}_dia`] : presData[`pd_uzak_${side}`]}
          onChange={(e) => setPresData({ ...presData, [presTip === 'lens' ? `${side}_dia` : `pd_uzak_${side}`]: e.target.value })} className="input" /></div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <datalist id="wiz-cam-marka">{LENS_BRANDS.map(b => <option key={b} value={b} />)}</datalist>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl my-4 flex flex-col max-h-[95vh]">
        {/* Header + Stepper */}
        <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-primary-600" /> Hızlı Satış Sihirbazı</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
          </div>
          {!result && (
            <div className="flex items-center">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-600' : 'text-gray-400'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
                    }`}>
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className="text-sm font-medium hidden sm:inline">{label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'}`} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* SONUÇ */}
          {result ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Satış Tamamlandı! 🎉</h3>
              <p className="text-gray-600 mb-1">Fiş No: <span className="font-mono font-bold">{result.fisNo}</span></p>
              <p className="text-gray-600 mb-6">{customerName} · {tl(totals.genel_toplam)} ({tl(odenenToplam)} tahsil edildi)</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => { navigate(`/orders/${result.orderId}`); onClose(); }} className="btn-primary flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Siparişi Aç / Fiş Yazdır
                </button>
                <button onClick={onClose} className="btn-secondary">Kapat</button>
              </div>
            </div>
          ) : (
            <>
              {/* ADIM 1: MÜŞTERİ */}
              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5" /> Müşteri</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setCustMode('new')}
                      className={`p-3 rounded-lg border-2 font-medium ${custMode === 'new' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                      Yeni Müşteri
                    </button>
                    <button type="button" onClick={() => setCustMode('existing')}
                      className={`p-3 rounded-lg border-2 font-medium ${custMode === 'existing' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                      Mevcut Müşteri
                    </button>
                  </div>

                  {custMode === 'existing' ? (
                    <div>
                      <label className="label">Müşteri Seç *</label>
                      <CustomerPicker
                        customers={customers || []}
                        value={existingCustomerId ? parseInt(existingCustomerId) : undefined}
                        onSelect={(c) => { setExistingCustomerId(c ? String(c.id) : ''); setPresMode('none'); setExistingPresId(''); }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label">Ad *</label>
                          <input type="text" value={newCustomer.ad} onChange={(e) => setNewCustomer({ ...newCustomer, ad: e.target.value })} className="input" /></div>
                        <div><label className="label">Soyad *</label>
                          <input type="text" value={newCustomer.soyad} onChange={(e) => setNewCustomer({ ...newCustomer, soyad: e.target.value })} className="input" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label">Telefon *</label>
                          <input type="tel" value={newCustomer.telefon} onChange={(e) => setNewCustomer({ ...newCustomer, telefon: e.target.value })} className="input" placeholder="05XX XXX XX XX" /></div>
                        <div><label className="label">TC Kimlik No</label>
                          <input type="text" maxLength="11" value={newCustomer.tc_kimlik} onChange={(e) => setNewCustomer({ ...newCustomer, tc_kimlik: e.target.value })} className="input" /></div>
                      </div>
                      <div><label className="label">Email</label>
                        <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} className="input" /></div>
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 2: REÇETE */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Glasses className="w-5 h-5" /> Reçete (opsiyonel)</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={() => setPresMode('none')} className={`px-4 py-2 rounded-lg font-medium ${presMode === 'none' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Reçetesiz</button>
                    {custMode === 'existing' && existingPrescriptions?.length > 0 && (
                      <button type="button" onClick={() => setPresMode('existing')} className={`px-4 py-2 rounded-lg font-medium ${presMode === 'existing' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Kayıtlı Reçete</button>
                    )}
                    <button type="button" onClick={() => setPresMode('new')} className={`px-4 py-2 rounded-lg font-medium ${presMode === 'new' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Yeni Reçete</button>
                  </div>

                  {presMode === 'existing' && (
                    <div>
                      <label className="label">Kayıtlı Reçete Seç</label>
                      <select value={existingPresId} onChange={(e) => setExistingPresId(e.target.value)} className="input">
                        <option value="">Seçin...</option>
                        {existingPrescriptions?.map(p => (
                          <option key={p.id} value={p.id}>
                            {new Date(p.tarih).toLocaleDateString('tr-TR')} · {p.recete_tipi === 'lens' ? 'Lens' : 'Optik'}{p.aktif ? ' (Aktif)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {presMode === 'new' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setPresTip('optik')} className={`p-2 rounded-lg border-2 text-sm font-medium ${presTip === 'optik' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'}`}>Optik (Gözlük)</button>
                        <button type="button" onClick={() => setPresTip('lens')} className={`p-2 rounded-lg border-2 text-sm font-medium ${presTip === 'lens' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>Lens (Kontakt)</button>
                      </div>
                      {presTip === 'lens' && (
                        <div><label className="label">Lens Markası</label>
                          <input type="text" value={presData.lens_marka} list="wiz-lens-marka" onChange={(e) => setPresData({ ...presData, lens_marka: e.target.value })} className="input" placeholder="Acuvue, Biofinity..." autoComplete="off" />
                          <datalist id="wiz-lens-marka">{CONTACT_LENS_BRANDS.map(b => <option key={b} value={b} />)}</datalist></div>
                      )}
                      <div className="space-y-2 border rounded-lg p-3">
                        {EyeRow({ side: 'sag', label: 'SAĞ' })}
                        {EyeRow({ side: 'sol', label: 'SOL' })}
                      </div>
                      <p className="text-xs text-gray-500">Görsel eklemek için satış sonrası müşteri kartından reçeteyi düzenleyebilirsiniz.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 3: KALEMLER */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg font-semibold">Sipariş Kalemleri</h3>
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" onClick={addGozlukGroup} className="btn-primary text-sm flex items-center gap-1"><Glasses className="w-4 h-4" /> + Yeni Gözlük</button>
                      <button type="button" onClick={() => addStandalone('cam')} className="btn-secondary text-sm flex items-center gap-1"><Eye className="w-4 h-4" /> + Tekil Cam</button>
                      <button type="button" onClick={() => addStandalone('aksesuar')} className="btn-secondary text-sm flex items-center gap-1"><Package className="w-4 h-4" /> + Aksesuar</button>
                      <button type="button" onClick={() => addStandalone('işçilik')} className="btn-secondary text-sm flex items-center gap-1"><Wrench className="w-4 h-4" /> + İşçilik</button>
                    </div>
                  </div>

                  {groupIds.map((g, idx) => {
                    const gi = items.filter(i => i.grup_id === g);
                    const frame = gi.find(i => i.kalem_tipi === 'çerçeve');
                    const gtop = gi.reduce((s, i) => s + ((i.birim_fiyat * i.adet) - i.indirim), 0);
                    return (
                      <div key={g} className="border-2 border-primary-200 dark:border-slate-600 rounded-xl p-3 bg-primary-50/40 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-primary-700 flex items-center gap-2"><Glasses className="w-4 h-4" /> {idx + 1}. Gözlük
                            {frame?.aciklama && <span className="text-sm font-normal text-gray-600">— {frame.aciklama}</span>}</h4>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => addItemToGroup(g, 'cam')} className="text-xs btn-secondary py-1 px-2">+ Cam</button>
                            <button type="button" onClick={() => removeGroup(g)} className="text-xs text-red-600 hover:bg-red-50 rounded px-2 py-1">Seti Sil</button>
                          </div>
                        </div>
                        <div className="space-y-2">{gi.map(item => ItemRow({ item }))}</div>
                        <div className="text-right text-sm font-semibold mt-2 text-primary-700">Set: {tl(gtop)}</div>
                      </div>
                    );
                  })}

                  {standaloneItems.length > 0 && (
                    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-3">
                      <h4 className="font-semibold text-gray-700 mb-2">Tekil Kalemler</h4>
                      <div className="space-y-2">{standaloneItems.map(item => ItemRow({ item }))}</div>
                    </div>
                  )}

                  {items.length === 0 && <p className="text-center py-6 text-gray-500">"Yeni Gözlük" ile başlayın.</p>}

                  {/* İndirim + KDV + teslim */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="label">İndirim (%)</label>
                        <input type="number" value={discount.indirim_yuzde} onChange={(e) => setDiscount({ indirim_yuzde: parseFloat(e.target.value) || 0, indirim_tl: 0 })} className="input" /></div>
                      <div><label className="label">İndirim (TL)</label>
                        <input type="number" value={discount.indirim_tl} onChange={(e) => setDiscount({ indirim_tl: parseFloat(e.target.value) || 0, indirim_yuzde: 0 })} className="input" /></div>
                      <div><label className="label">Teslim Tarihi</label>
                        <input type="date" value={teslim} onChange={(e) => setTeslim(e.target.value)} className="input" /></div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={kdvUygula} onChange={(e) => setKdvUygula(e.target.checked)} className="w-4 h-4" />
                      <span>KDV uygula (%{settings.kdvOrani})</span>
                    </label>
                    <div className="flex justify-between text-lg font-bold"><span>Genel Toplam:</span><span>{tl(totals.genel_toplam)}</span></div>
                  </div>
                </div>
              )}

              {/* ADIM 4: ÖDEME */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Ödeme</h3>
                    <div className="flex gap-2">
                      <button type="button" onClick={fillFullCash} className="btn-secondary text-sm">Tümü Nakit</button>
                      <button type="button" onClick={addPayment} className="btn-secondary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Ödeme Ekle</button>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg flex justify-between font-semibold">
                    <span>Genel Toplam:</span><span>{tl(totals.genel_toplam)}</span>
                  </div>
                  {payments.length === 0 ? (
                    <p className="text-sm text-gray-500">Ödeme eklemezseniz sipariş <strong>veresiye</strong> kaydedilir.</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.map(p => (
                        <div key={p.id} className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-6"><label className="label">Tür</label>
                            <select value={p.odeme_turu} onChange={(e) => patchPayment(p.id, { odeme_turu: e.target.value })} className="input">
                              {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select></div>
                          <div className="col-span-5"><label className="label">Tutar ₺</label>
                            <input type="number" step="0.01" value={p.tutar} onChange={(e) => patchPayment(p.id, { tutar: e.target.value })} className="input" /></div>
                          <div className="col-span-1"><button type="button" onClick={() => removePayment(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button></div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Ödeme / Kalan:</span>
                    <span className="font-medium">{tl(odenenToplam)} / <span className={totals.genel_toplam - odenenToplam > 0 ? 'text-orange-600' : 'text-green-600'}>{tl(Math.max(0, totals.genel_toplam - odenenToplam))}</span></span>
                  </div>
                </div>
              )}

              {/* ADIM 5: ÖZET */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Özet — Onayla</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-gray-600">Müşteri</span><span className="font-medium">{customerName || '-'} {custMode === 'new' && '(yeni)'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-gray-600">Reçete</span>
                      <span className="font-medium">{presMode === 'none' ? 'Yok' : presMode === 'new' ? `Yeni (${presTip === 'lens' ? 'Lens' : 'Optik'})` : 'Kayıtlı reçete'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-gray-600">Kalem</span>
                      <span className="font-medium">{groupIds.length} gözlük seti, {items.length} kalem</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-gray-600">Genel Toplam</span><span className="font-bold">{tl(totals.genel_toplam)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-gray-600">Tahsil / Kalan</span>
                      <span className="font-medium">{tl(odenenToplam)} / {tl(Math.max(0, totals.genel_toplam - odenenToplam))}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">"Satışı Tamamla" ile müşteri{custMode === 'new' ? ', reçete' : ''}, sipariş, ödeme kaydedilir ve stok düşülür.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-between">
            <button onClick={step === 0 ? onClose : back} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> {step === 0 ? 'İptal' : 'Geri'}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary flex items-center gap-2">İleri <ArrowRight className="w-5 h-5" /></button>
            ) : (
              <button onClick={finish} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                <Check className="w-5 h-5" /> {saving ? 'Kaydediliyor...' : 'Satışı Tamamla'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
