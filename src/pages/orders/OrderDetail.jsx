import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Printer, DollarSign, FileText, Glasses, Eye } from 'lucide-react';
import db from '../../db/database';
import PaymentModal from '../../components/PaymentModal';
import { restoreStockForOrder } from '../../utils/stockManager';
import { groupOrderItems, kalemLabel, prescriptionOf } from '../../utils/orderHelpers';
import { useImageViewer } from '../../components/ImageViewer';
import { usageLabel } from '../../utils/prescription';

const statusColors = {
  taslak: 'bg-gray-100 text-gray-700',
  onaylandi: 'bg-blue-100 text-blue-700',
  uretimde: 'bg-yellow-100 text-yellow-700',
  hazir: 'bg-green-100 text-green-700',
  teslim_edildi: 'bg-purple-100 text-purple-700',
  iptal: 'bg-red-100 text-red-700'
};

const statusLabels = {
  taslak: 'Taslak',
  onaylandi: 'Onaylandı',
  uretimde: 'Üretimde',
  hazir: 'Hazır',
  teslim_edildi: 'Teslim Edildi',
  iptal: 'İptal'
};

const tl = (v) => `₺${(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openImages } = useImageViewer();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'OptikPro',
    companySlogan: 'Gözlük ve Optik Ürünler',
    companyPhone: '0XXX XXX XX XX',
    companyAddress: 'Adres Bilgisi',
    companyTaxNo: 'XXXXXXXXXX'
  });

  const order = useLiveQuery(() => db.orders.get(parseInt(id)));
  const customer = useLiveQuery(() => order ? db.customers.get(order.musteri_id) : null, [order]);
  const prescriptionDb = useLiveQuery(() => order?.recete_id ? db.prescriptions.get(order.recete_id) : null, [order]);
  const items = useLiveQuery(() => db.order_items.where('siparis_id').equals(parseInt(id)).toArray());
  const payments = useLiveQuery(() => db.payments.where('siparis_id').equals(parseInt(id)).toArray());

  useLiveQuery(async () => {
    const settingsData = await db.settings.toArray();
    const settingsObj = {};
    settingsData.forEach(s => { settingsObj[s.key] = s.value; });
    if (Object.keys(settingsObj).length > 0) setSettings(prev => ({ ...prev, ...settingsObj }));
  });

  const handleStatusChange = async (newStatus) => {
    const confirmMessage = newStatus === 'iptal'
      ? 'Siparişi iptal etmek istediğinize emin misiniz? Stok geri eklenecektir.'
      : `Sipariş durumunu "${statusLabels[newStatus]}" olarak değiştirmek istediğinize emin misiniz?`;
    if (confirm(confirmMessage)) {
      try {
        if (newStatus === 'iptal' && order.durum !== 'iptal') {
          await restoreStockForOrder(parseInt(id), order.fis_no);
        }
        await db.orders.update(parseInt(id), { durum: newStatus });
        if (newStatus === 'iptal') alert('Sipariş iptal edildi ve stok geri eklendi.');
      } catch (error) {
        alert('Hata: ' + error.message);
      }
    }
  };

  const handlePrint = () => window.print();

  if (!order || !customer) return <div>Yükleniyor...</div>;

  const kalan = order.genel_toplam - (order.odenen_toplam || 0);
  const prescription = prescriptionOf(order, prescriptionDb);
  const isLens = prescription?.recete_tipi === 'lens';
  const { groups, standalone } = groupOrderItems(items);
  const kdvOrani = order.kdv_orani ?? 20;
  const showKdv = order.kdv_dahil !== false && (order.kdv_tutari || 0) > 0;

  // Reçete tablosu (optik/lens) — hem ekran hem yazdırma için sade
  const PrescriptionTable = ({ print }) => {
    if (!prescription) return null;
    const cols = isLens
      ? [['SPH', 'sfera'], ['CYL', 'silindir'], ['AXIS', 'aks'], ['BC', 'bc'], ['DIA', 'dia']]
      : [['SPH', 'sfera'], ['CYL', 'silindir'], ['AXIS', 'aks'], ['PD', null]];
    const cellVal = (side, key) => {
      if (key === null) return prescription[`pd_uzak_${side}`] || '-';
      return prescription[`${side}_${key}`] || '-';
    };
    const bw = print ? '1px solid #000' : undefined;
    return (
      <table style={print ? { width: '100%', borderCollapse: 'collapse', fontSize: '11px' } : undefined}
        className={print ? '' : 'w-full text-sm border border-gray-300'}>
        <thead>
          <tr style={print ? { backgroundColor: '#f0f0f0' } : undefined} className={print ? '' : 'bg-gray-100'}>
            <th style={print ? { border: bw, padding: '6px' } : undefined} className={print ? '' : 'border border-gray-300 p-2'}></th>
            {cols.map(([h]) => (
              <th key={h} style={print ? { border: bw, padding: '6px', textAlign: 'center' } : undefined}
                className={print ? '' : 'border border-gray-300 p-2 text-center'}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[['SAĞ', 'sag'], ['SOL', 'sol']].map(([lbl, side]) => (
            <tr key={side}>
              <td style={print ? { border: bw, padding: '6px', fontWeight: 'bold', textAlign: 'center' } : undefined}
                className={print ? '' : 'border border-gray-300 p-2 font-bold text-center'}>{lbl}</td>
              {cols.map(([h, key]) => (
                <td key={h} style={print ? { border: bw, padding: '6px', textAlign: 'center', fontWeight: 'bold' } : undefined}
                  className={print ? '' : 'border border-gray-300 p-2 text-center font-medium'}>{cellVal(side, key)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printArea, #printArea * { visibility: visible; }
          #printArea { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* PRINT TEMPLATE - Müşteri Formu */}
      <div id="printArea" className="hidden print:block" style={{
        width: '148mm', minHeight: '210mm', padding: '8mm', margin: '0 auto',
        backgroundColor: 'white', fontFamily: 'Arial, sans-serif', fontSize: '10px'
      }}>
        <div style={{ borderBottom: '3px solid #000', paddingBottom: '8px', marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{settings.companyName}</div>
          <div style={{ fontSize: '10px', color: '#555' }}>{settings.companySlogan}</div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
            {settings.companyAddress} | Tel: {settings.companyPhone} | Vergi No: {settings.companyTaxNo}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '6px', backgroundColor: '#f0f0f0', border: '2px solid #333', marginBottom: '12px', borderRadius: '3px' }}>
          <div style={{ fontSize: '10px', color: '#666' }}>SİPARİŞ NO</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>{order.fis_no}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div style={{ border: '1px solid #ddd', padding: '6px', borderRadius: '3px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>SİPARİŞ BİLGİLERİ</div>
            <div style={{ fontSize: '9px', lineHeight: '1.5' }}>
              <div><strong>Tarih:</strong> {new Date(order.siparis_tarihi).toLocaleDateString('tr-TR')}</div>
              {order.teslim_beklenen && <div><strong>Teslim:</strong> {new Date(order.teslim_beklenen).toLocaleDateString('tr-TR')}</div>}
              <div><strong>Durum:</strong> {statusLabels[order.durum]}</div>
            </div>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '6px', borderRadius: '3px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>MÜŞTERİ BİLGİLERİ</div>
            <div style={{ fontSize: '9px', lineHeight: '1.5' }}>
              <div><strong>Ad Soyad:</strong> {customer.ad} {customer.soyad}</div>
              <div><strong>Telefon:</strong> {customer.telefon}</div>
              {customer.tc_kimlik && <div><strong>TC:</strong> {customer.tc_kimlik}</div>}
            </div>
          </div>
        </div>

        {prescription && (
          <div style={{ marginBottom: '12px', border: '2px solid #333', padding: '6px', borderRadius: '3px', backgroundColor: '#f9f9f9' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              {isLens ? 'LENS REÇETESİ' : 'REÇETE BİLGİLERİ'} — {usageLabel(prescription.kullanim || 'uzak')}{prescription.lens_marka ? ` · ${prescription.lens_marka}` : ''}
            </div>
            <PrescriptionTable print />
          </div>
        )}

        {/* Items grouped */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', borderBottom: '2px solid #333', paddingBottom: '3px' }}>SİPARİŞ KALEMLERİ</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Kalem</th>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', width: '35px' }}>Adet</th>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', width: '50px' }}>Birim</th>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', width: '60px' }}>Toplam</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, gi) => (
                <PrintGroup key={gi} group={g} index={gi} />
              ))}
              {standalone.map(item => <PrintItem key={item.id} item={item} />)}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '12px', border: '2px solid #333', padding: '8px', borderRadius: '3px', backgroundColor: '#f9fafb' }}>
          <div style={{ fontSize: '9px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>Ara Toplam:</span><span style={{ fontWeight: 'bold' }}>{tl(order.ara_toplam)}</span>
            </div>
            {order.indirim_tl > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#dc2626' }}>
                <span>İndirim:</span><span style={{ fontWeight: 'bold' }}>-{tl(order.indirim_tl)}</span>
              </div>
            )}
            {showKdv && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>KDV (%{kdvOrani}):</span><span style={{ fontWeight: 'bold' }}>{tl(order.kdv_tutari)}</span>
              </div>
            )}
          </div>
          <div style={{ borderTop: '2px solid #333', paddingTop: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
              <span>GENEL TOPLAM:</span><span style={{ fontSize: '13px' }}>{tl(order.genel_toplam)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '9px', marginBottom: '3px' }}>
              <span>Ödenen:</span><span style={{ fontWeight: 'bold' }}>{tl(order.odenen_toplam)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ea580c', fontSize: '10px', fontWeight: 'bold' }}>
              <span>Kalan:</span><span>{tl(kalan)}</span>
            </div>
          </div>
        </div>

        {order.notlar && (
          <div style={{ marginBottom: '12px', padding: '6px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '3px', fontSize: '8px' }}>
            <strong>NOTLAR:</strong> {order.notlar}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginTop: '30px', fontSize: '8px', fontWeight: 'bold' }}>Müşteri İmzası</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginTop: '30px', fontSize: '8px', fontWeight: 'bold' }}>Yetkili İmzası</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #ddd', paddingTop: '6px', textAlign: 'center', fontSize: '7px', color: '#666' }}>
          <div>Bizi tercih ettiğiniz için teşekkür ederiz.</div>
          <div>Yazdırma: {new Date().toLocaleString('tr-TR')}</div>
        </div>
      </div>

      {/* SCREEN VIEW */}
      <div className="space-y-6 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/orders')} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.fis_no}</h1>
              <p className="text-gray-600">{new Date(order.siparis_tarihi).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.open(`/orders/${id}/slip`, '_blank')} className="btn-secondary flex items-center gap-2">
              <FileText className="w-5 h-5" /> Sipariş Fişi
            </button>
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
              <Printer className="w-5 h-5" /> Müşteri Formu
            </button>
            <button onClick={() => setShowPaymentModal(true)} className="btn-primary flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Ödeme Al
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Sipariş Durumu</h2>
          <div className="flex gap-2 flex-wrap">
            {['onaylandi', 'uretimde', 'hazir', 'teslim_edildi', 'iptal'].map(status => (
              <button key={status} onClick={() => handleStatusChange(status)}
                disabled={order.durum === 'iptal' && status !== 'iptal'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  order.durum === status ? statusColors[status]
                    : order.durum === 'iptal' && status !== 'iptal' ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {statusLabels[status]}
              </button>
            ))}
          </div>
          {order.durum === 'iptal' && (
            <p className="mt-3 text-sm text-red-600">⚠️ İptal edilen sipariş için stok geri eklenmiştir.</p>
          )}
        </div>

        {/* Reçete (miras) */}
        {prescription && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {isLens ? <Eye className="w-5 h-5 text-green-600" /> : <Glasses className="w-5 h-5 text-blue-600" />}
              Reçete Bilgileri
              <span className={`px-2 py-0.5 text-xs rounded-full ${isLens ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {isLens ? 'Lens' : 'Optik'}
              </span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                {usageLabel(prescription.kullanim || 'uzak')}
              </span>
              {prescription.lens_marka && <span className="text-sm font-normal text-gray-600">· {prescription.lens_marka}</span>}
            </h2>
            <PrescriptionTable />
            {prescription.gorseller?.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {prescription.gorseller.map((g, i) => (
                  <img key={i} src={g.dataUrl} alt={g.name} onClick={() => openImages(prescription.gorseller, i)}
                    className="w-20 h-20 object-cover rounded border border-gray-200 cursor-zoom-in" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invoice / Items grouped */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Sipariş Kalemleri</h2>
          <div className="space-y-4">
            {groups.map((g, gi) => {
              const grupToplam = g.items.reduce((s, i) => s + (i.toplam || 0), 0);
              return (
                <div key={gi} className="border-2 border-primary-200 rounded-xl overflow-hidden">
                  <div className="bg-primary-50 px-4 py-2 flex items-center justify-between">
                    <span className="font-bold text-primary-700 flex items-center gap-2">
                      <Glasses className="w-4 h-4" /> {g.label}
                      {g.frame?.aciklama && <span className="font-normal text-gray-600 text-sm">— {g.frame.aciklama}</span>}
                    </span>
                    <span className="font-semibold text-primary-700">{tl(grupToplam)}</span>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {g.items.map(item => <ScreenItemRow key={item.id} item={item} />)}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {standalone.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {groups.length > 0 && <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700">Tekil Kalemler</div>}
                <table className="w-full text-sm">
                  <tbody>
                    {standalone.map(item => <ScreenItemRow key={item.id} item={item} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-4 space-y-2 mt-4">
            <div className="flex justify-between"><span>ARA TOPLAM:</span><span className="font-medium">{tl(order.ara_toplam)}</span></div>
            {order.indirim_tl > 0 && (
              <div className="flex justify-between text-red-600"><span>İNDİRİM:</span><span className="font-medium">-{tl(order.indirim_tl)}</span></div>
            )}
            {showKdv && (
              <div className="flex justify-between"><span>KDV (%{kdvOrani}):</span><span className="font-medium">{tl(order.kdv_tutari)}</span></div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2"><span>GENEL TOPLAM:</span><span>{tl(order.genel_toplam)}</span></div>
            <div className="flex justify-between text-green-600"><span>ÖDENEN:</span><span className="font-medium">{tl(order.odenen_toplam)}</span></div>
            <div className="flex justify-between text-orange-600 font-bold"><span>KALAN:</span><span>{tl(kalan)}</span></div>
          </div>

          {order.notlar && (
            <div className="mt-4 pt-4 border-t"><p className="text-sm text-gray-600">Not: {order.notlar}</p></div>
          )}
        </div>

        {/* Sipariş Görselleri */}
        {order.gorseller?.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Sipariş Görselleri
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {order.gorseller.map((g, i) => (
                <img key={i} src={g.dataUrl} alt={g.name || ''} onClick={() => openImages(order.gorseller, i)}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-zoom-in" />
              ))}
            </div>
          </div>
        )}

        {/* Payments */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Ödeme Geçmişi</h2>
          <div className="space-y-2">
            {payments?.map(payment => {
              const icon = { nakit: '💵', kredi_karti: '💳', havale: '🏦', veresiye: '📝' }[payment.odeme_turu] || '💰';
              return (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-medium capitalize">{payment.odeme_turu.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{new Date(payment.tarih).toLocaleString('tr-TR')}</p>
                      {payment.aciklama && <p className="text-sm text-gray-600">{payment.aciklama}</p>}
                    </div>
                  </div>
                  <span className="font-bold text-green-600 text-lg">{tl(payment.tutar)}</span>
                </div>
              );
            })}
            {(!payments || payments.length === 0) && (
              <p className="text-center py-8 text-gray-500">Henüz ödeme alınmadı</p>
            )}
          </div>
        </div>

        {showPaymentModal && (
          <PaymentModal
            orderId={parseInt(id)}
            kalanTutar={kalan}
            onClose={() => setShowPaymentModal(false)}
            onSave={() => setShowPaymentModal(false)}
          />
        )}
      </div>
    </>
  );
}

// --- Ekran satırı ---
function ScreenItemRow({ item }) {
  const isCam = item.kalem_tipi?.startsWith('cam');
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 px-4">
        <div className="flex items-center gap-2">
          {isCam && <span className="text-gray-400">└</span>}
          <span className="font-medium">{kalemLabel(item.kalem_tipi)}</span>
          {item.cam_marka && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded font-medium">{item.cam_marka}</span>
          )}
        </div>
        {item.aciklama && <div className="text-xs text-gray-500 ml-6">{item.aciklama}</div>}
      </td>
      <td className="py-2 px-4 text-center w-16">{item.adet}</td>
      <td className="py-2 px-4 text-right w-24">{tl(item.birim_fiyat)}</td>
      <td className="py-2 px-4 text-right w-24 font-medium">{tl(item.toplam)}</td>
    </tr>
  );
}

// --- Yazdırma grubu ---
function PrintGroup({ group, index }) {
  return (
    <>
      <tr style={{ backgroundColor: '#eef2ff' }}>
        <td colSpan={4} style={{ border: '1px solid #ddd', padding: '4px', fontWeight: 'bold' }}>
          {index + 1}. Gözlük{group.frame?.aciklama ? ` — ${group.frame.aciklama}` : ''}
        </td>
      </tr>
      {group.items.map(item => <PrintItem key={item.id} item={item} nested />)}
    </>
  );
}

function PrintItem({ item, nested }) {
  return (
    <tr>
      <td style={{ border: '1px solid #ddd', padding: '4px' }}>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {nested ? '↳ ' : ''}{kalemLabel(item.kalem_tipi)}
        </span>
        {item.cam_marka && <span style={{ marginLeft: 4, fontWeight: 'bold', color: '#b45309' }}>[{item.cam_marka}]</span>}
        {item.aciklama && <div style={{ fontSize: '8px', color: '#666' }}>{item.aciklama}</div>}
      </td>
      <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{item.adet}</td>
      <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>{tl(item.birim_fiyat)}</td>
      <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{tl(item.toplam)}</td>
    </tr>
  );
}
