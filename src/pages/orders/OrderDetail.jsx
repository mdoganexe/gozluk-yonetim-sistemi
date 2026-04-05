import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Printer, DollarSign, FileText } from 'lucide-react';
import db from '../../db/database';
import PaymentModal from '../../components/PaymentModal';
import { restoreStockForOrder } from '../../utils/stockManager';

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

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'OptikPro',
    companySlogan: 'Gözlük ve Optik Ürünler',
    companyPhone: '0XXX XXX XX XX',
    companyAddress: 'Adres Bilgisi',
    companyTaxNo: 'XXXXXXXXXX'
  });

  const order = useLiveQuery(() => db.orders.get(parseInt(id)));
  const customer = useLiveQuery(() => 
    order ? db.customers.get(order.musteri_id) : null
  , [order]);
  const prescription = useLiveQuery(() =>
    order?.recete_id ? db.prescriptions.get(order.recete_id) : null
  , [order]);
  const items = useLiveQuery(() =>
    db.order_items.where('siparis_id').equals(parseInt(id)).toArray()
  );
  const payments = useLiveQuery(() =>
    db.payments.where('siparis_id').equals(parseInt(id)).toArray()
  );

  // Ayarları yükle
  useLiveQuery(async () => {
    const settingsData = await db.settings.toArray();
    const settingsObj = {};
    settingsData.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    if (Object.keys(settingsObj).length > 0) {
      setSettings(prev => ({ ...prev, ...settingsObj }));
    }
  });

  const handleStatusChange = async (newStatus) => {
    const confirmMessage = newStatus === 'iptal'
      ? 'Siparişi iptal etmek istediğinize emin misiniz? Stok geri eklenecektir.'
      : `Sipariş durumunu "${newStatus}" olarak değiştirmek istediğinize emin misiniz?`;
    
    if (confirm(confirmMessage)) {
      try {
        if (newStatus === 'iptal' && order.durum !== 'iptal') {
          await restoreStockForOrder(parseInt(id), order.fis_no);
        }
        
        await db.orders.update(parseInt(id), { durum: newStatus });
        
        if (newStatus === 'iptal') {
          alert('Sipariş iptal edildi ve stok geri eklendi.');
        }
      } catch (error) {
        alert('Hata: ' + error.message);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order || !customer) return <div>Yükleniyor...</div>;

  const kalan = order.genel_toplam - (order.odenen_toplam || 0);

  return (
    <>
      {/* PRINT TEMPLATE - Müşteri Formu */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printArea, #printArea * { visibility: visible; }
          #printArea { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      
      <div id="printArea" className="hidden print:block" style={{
        width: '148mm',
        minHeight: '210mm',
        padding: '8mm',
        margin: '0 auto',
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px'
      }}>
        {/* Header */}
        <div style={{ borderBottom: '3px solid #000', paddingBottom: '8px', marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{settings.companyName}</div>
          <div style={{ fontSize: '10px', color: '#555' }}>{settings.companySlogan}</div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
            {settings.companyAddress} | Tel: {settings.companyPhone} | Vergi No: {settings.companyTaxNo}
          </div>
        </div>

        {/* Order Number */}
        <div style={{ textAlign: 'center', padding: '6px', backgroundColor: '#f0f0f0', border: '2px solid #333', marginBottom: '12px', borderRadius: '3px' }}>
          <div style={{ fontSize: '10px', color: '#666' }}>SİPARİŞ NO</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>{order.fis_no}</div>
        </div>

        {/* Info Grid */}
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

        {/* Prescription */}
        {prescription && (
          <div style={{ marginBottom: '12px', border: '2px solid #333', padding: '6px', borderRadius: '3px', backgroundColor: '#f9f9f9' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>REÇETE BİLGİLERİ</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e5e7eb' }}>
                  <th style={{ border: '1px solid #999', padding: '4px', textAlign: 'center' }}></th>
                  <th style={{ border: '1px solid #999', padding: '4px', textAlign: 'center' }}>SPH</th>
                  <th style={{ border: '1px solid #999', padding: '4px', textAlign: 'center' }}>CYL</th>
                  <th style={{ border: '1px solid #999', padding: '4px', textAlign: 'center' }}>AXIS</th>
                  <th style={{ border: '1px solid #999', padding: '4px', textAlign: 'center' }}>PD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #999', padding: '4px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f3f4f6' }}>SAĞ</td>
                  <td style={{ border: '1px solid #999', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{prescription.sag_sph}</td>
                  <td style={{ border: '1px solid #999', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{prescription.sag_cyl}</td>
                  <td style={{ border: '1px solid #999', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{prescription.sag_axis}</td>
                  <td style={{ border: '1px solid #999', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{prescription.sag_pd}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #999', padding: '4px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f3f4f6' }}>SOL</td>
                  <td style={{ border: '1px solid #999', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{prescription.sol_sph}</td>
                  <td style={{ border: '1px solid #999', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{prescription.sol_cyl}</td>
                  <td style={{ border: '1px solid #999', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{prescription.sol_axis}</td>
                  <td style={{ border: '1px solid #999', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{prescription.sol_pd}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Items */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', borderBottom: '2px solid #333', paddingBottom: '3px' }}>SİPARİŞ KALEMLERİ</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Kalem</th>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', width: '35px' }}>Adet</th>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', width: '50px' }}>Birim</th>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', width: '50px' }}>İnd.</th>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', width: '60px' }}>Toplam</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{item.kalem_tipi}</div>
                    {item.aciklama && <div style={{ fontSize: '8px', color: '#666' }}>{item.aciklama}</div>}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{item.adet}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>₺{item.birim_fiyat?.toLocaleString('tr-TR')}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', color: '#dc2626' }}>₺{item.indirim?.toLocaleString('tr-TR')}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>₺{item.toplam?.toLocaleString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ marginBottom: '12px', border: '2px solid #333', padding: '8px', borderRadius: '3px', backgroundColor: '#f9fafb' }}>
          <div style={{ fontSize: '9px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>Ara Toplam:</span>
              <span style={{ fontWeight: 'bold' }}>₺{order.ara_toplam?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            {order.indirim_tl > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#dc2626' }}>
                <span>İndirim:</span>
                <span style={{ fontWeight: 'bold' }}>-₺{order.indirim_tl?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>KDV (%20):</span>
              <span style={{ fontWeight: 'bold' }}>₺{order.kdv_tutari?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div style={{ borderTop: '2px solid #333', paddingTop: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
              <span>GENEL TOPLAM:</span>
              <span style={{ fontSize: '13px' }}>₺{order.genel_toplam?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '9px', marginBottom: '3px' }}>
              <span>Ödenen:</span>
              <span style={{ fontWeight: 'bold' }}>₺{order.odenen_toplam?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ea580c', fontSize: '10px', fontWeight: 'bold' }}>
              <span>Kalan:</span>
              <span>₺{kalan.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notlar && (
          <div style={{ marginBottom: '12px', padding: '6px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '3px', fontSize: '8px' }}>
            <strong>NOTLAR:</strong> {order.notlar}
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginTop: '30px', fontSize: '8px', fontWeight: 'bold' }}>Müşteri İmzası</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '4px', marginTop: '30px', fontSize: '8px', fontWeight: 'bold' }}>Yetkili İmzası</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '6px', textAlign: 'center', fontSize: '7px', color: '#666' }}>
          <div>Bizi tercih ettiğiniz için teşekkür ederiz.</div>
          <div>Yazdırma: {new Date().toLocaleString('tr-TR')}</div>
        </div>
      </div>

      {/* SCREEN VIEW */}
      <div className="space-y-6 no-print">
        {/* Header */}
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
              <FileText className="w-5 h-5" />
              Sipariş Fişi
            </button>
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Müşteri Formu
            </button>
            <button onClick={() => setShowPaymentModal(true)} className="btn-primary flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Ödeme Al
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Sipariş Durumu</h2>
          <div className="flex gap-2 flex-wrap">
            {['onaylandi', 'uretimde', 'hazir', 'teslim_edildi', 'iptal'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={order.durum === 'iptal' && status !== 'iptal'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  order.durum === status
                    ? statusColors[status]
                    : order.durum === 'iptal' && status !== 'iptal'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
          {order.durum === 'iptal' && (
            <p className="mt-3 text-sm text-red-600">⚠️ İptal edilen sipariş için stok geri eklenmiştir.</p>
          )}
        </div>

        {/* Invoice Preview */}
        <div className="card">
          <div className="border-2 border-gray-300 rounded-lg p-8">
            <div className="text-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold">{settings.companyName}</h2>
              <p className="text-sm text-gray-600">{settings.companySlogan}</p>
              <p className="text-sm text-gray-600">Tel: {settings.companyPhone} | Vergi No: {settings.companyTaxNo}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="font-semibold">FİŞ NO: {order.fis_no}</p>
                <p>TARİH: {new Date(order.siparis_tarihi).toLocaleDateString('tr-TR')}</p>
                {order.teslim_beklenen && <p>TESLİM: {order.teslim_beklenen}</p>}
              </div>
              <div className="text-right">
                <p className="font-semibold">MÜŞTERİ: {customer.ad} {customer.soyad}</p>
                <p>TEL: {customer.telefon}</p>
              </div>
            </div>

            <div className="mb-6">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left py-2">KALEM</th>
                    <th className="text-center py-2">ADET</th>
                    <th className="text-right py-2">BİRİM</th>
                    <th className="text-right py-2">İNDİRİM</th>
                    <th className="text-right py-2">TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map(item => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-2">
                        <div className="font-medium">{item.kalem_tipi}</div>
                        <div className="text-xs text-gray-600">{item.aciklama}</div>
                      </td>
                      <td className="text-center py-2">{item.adet}</td>
                      <td className="text-right py-2">₺{item.birim_fiyat?.toLocaleString('tr-TR')}</td>
                      <td className="text-right py-2">₺{item.indirim?.toLocaleString('tr-TR')}</td>
                      <td className="text-right py-2 font-medium">₺{item.toplam?.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t-2 border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>ARA TOPLAM:</span>
                <span className="font-medium">₺{order.ara_toplam?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              {order.indirim_tl > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>İNDİRİM:</span>
                  <span className="font-medium">-₺{order.indirim_tl?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>KDV:</span>
                <span className="font-medium">₺{order.kdv_tutari?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>GENEL TOPLAM:</span>
                <span>₺{order.genel_toplam?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>ÖDENEN:</span>
                <span className="font-medium">₺{order.odenen_toplam?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-orange-600 font-bold">
                <span>KALAN:</span>
                <span>₺{kalan.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {order.notlar && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Not: {order.notlar}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payments */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Ödeme Geçmişi</h2>
          <div className="space-y-2">
            {payments?.map(payment => {
              const paymentIcon = {
                nakit: '💵',
                kredi_karti: '💳',
                havale: '🏦',
                veresiye: '📝'
              }[payment.odeme_turu] || '💰';

              return (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{paymentIcon}</span>
                    <div>
                      <p className="font-medium">{payment.odeme_turu.replace('_', ' ').charAt(0).toUpperCase() + payment.odeme_turu.slice(1).replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{new Date(payment.tarih).toLocaleString('tr-TR')}</p>
                      {payment.aciklama && <p className="text-sm text-gray-600">{payment.aciklama}</p>}
                    </div>
                  </div>
                  <span className="font-bold text-green-600 text-lg">
                    ₺{payment.tutar?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
            {(!payments || payments.length === 0) && (
              <p className="text-center py-8 text-gray-500">Henüz ödeme alınmadı</p>
            )}
          </div>

          {payments && payments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Toplam Ödeme Sayısı:</span>
                  <span className="font-medium">{payments.length} işlem</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nakit:</span>
                  <span className="font-medium">
                    ₺{payments.filter(p => p.odeme_turu === 'nakit').reduce((sum, p) => sum + p.tutar, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kredi Kartı:</span>
                  <span className="font-medium">
                    ₺{payments.filter(p => p.odeme_turu === 'kredi_karti').reduce((sum, p) => sum + p.tutar, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Havale/EFT:</span>
                  <span className="font-medium">
                    ₺{payments.filter(p => p.odeme_turu === 'havale').reduce((sum, p) => sum + p.tutar, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
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
