import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Printer } from 'lucide-react';
import db from '../../db/database';

export default function OrderSlip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    companyName: 'OptikPro',
    companySlogan: 'Gözlük ve Optik Ürünler',
    companyPhone: '0XXX XXX XX XX',
    companyAddress: 'Adres Bilgisi'
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

  const handlePrint = () => {
    window.print();
  };

  // Sayfa yüklendiğinde otomatik yazdırma dialogu aç
  useEffect(() => {
    if (order && customer && items) {
      // Kısa bir gecikme ile yazdırma dialogunu aç
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order, customer, items]);

  if (!order || !customer) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <>
      {/* Screen View - Minimal */}
      <div className="no-print p-4 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(`/orders/${id}`)} 
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Sipariş Fişi</h1>
                  <p className="text-gray-600">{order.fis_no}</p>
                </div>
              </div>
              <button 
                onClick={handlePrint}
                className="btn-primary flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Yazdır
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📋 Bu sipariş fişi cam laboratuvarına götürülmek üzere hazırlanmıştır.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                Yazdır butonuna tıklayın veya otomatik açılan yazdırma penceresini kullanın.
              </p>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Önizleme</h3>
              <p className="text-sm text-gray-600">
                Yazdırma önizlemesi için tarayıcınızın yazdırma özelliğini kullanın.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print View - A5 Order Slip */}
      <div className="hidden print:block print-container">
        {/* Header */}
        <div className="print-header">
          <div className="print-logo">{settings.companyName}</div>
          <div className="print-company-info">{settings.companySlogan}</div>
          <div className="print-company-info">
            {settings.companyAddress} | Tel: {settings.companyPhone}
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', margin: '12px 0', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>SİPARİŞ FİŞİ</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>{order.fis_no}</div>
        </div>

        {/* Order Info */}
        <div className="print-section">
          <div className="print-info-grid">
            <div className="print-info-item">
              <span className="print-info-label">Tarih:</span>
              <span>{new Date(order.siparis_tarihi).toLocaleDateString('tr-TR')}</span>
            </div>
            {order.teslim_beklenen && (
              <div className="print-info-item">
                <span className="print-info-label">Teslim:</span>
                <span>{new Date(order.teslim_beklenen).toLocaleDateString('tr-TR')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="print-section">
          <div className="print-section-title">Müşteri Bilgileri</div>
          <div className="print-info-grid">
            <div className="print-info-item">
              <span className="print-info-label">Ad Soyad:</span>
              <span>{customer.ad} {customer.soyad}</span>
            </div>
            <div className="print-info-item">
              <span className="print-info-label">Telefon:</span>
              <span>{customer.telefon}</span>
            </div>
          </div>
        </div>

        {/* Prescription Info - LARGE AND CLEAR */}
        {prescription && (
          <div className="print-section" style={{ border: '2px solid #000', padding: '8px', marginTop: '12px' }}>
            <div className="print-section-title" style={{ fontSize: '12px', marginBottom: '8px' }}>
              REÇETE BİLGİLERİ
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></th>
                  <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>SPH</th>
                  <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>CYL</th>
                  <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>AXIS</th>
                  <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>PD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>SAĞ</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {prescription.sag_sph}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {prescription.sag_cyl}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {prescription.sag_axis}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {prescription.sag_pd}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>SOL</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {prescription.sol_sph}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {prescription.sol_cyl}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {prescription.sol_axis}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {prescription.sol_pd}
                  </td>
                </tr>
              </tbody>
            </table>
            {prescription.notlar && (
              <div style={{ marginTop: '6px', fontSize: '9px', padding: '4px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
                <strong>Not:</strong> {prescription.notlar}
              </div>
            )}
          </div>
        )}

        {/* Items - Focus on Lens */}
        <div className="print-section" style={{ marginTop: '12px' }}>
          <div className="print-section-title">Sipariş Detayları</div>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Kalem</th>
                <th style={{ width: '15%', textAlign: 'center' }}>Adet</th>
                <th style={{ width: '35%' }}>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {items?.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 'bold', fontSize: '10px' }}>
                    {item.kalem_tipi.toUpperCase()}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '10px' }}>{item.adet}</td>
                  <td style={{ fontSize: '9px' }}>{item.aciklama || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {order.notlar && (
          <div className="print-notes" style={{ marginTop: '12px', border: '1px solid #ddd' }}>
            <strong>Özel Notlar:</strong> {order.notlar}
          </div>
        )}

        {/* Lab Instructions */}
        <div style={{ 
          marginTop: '16px', 
          padding: '8px', 
          border: '2px dashed #666',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
            LAB NOTLARI:
          </div>
          <div style={{ fontSize: '8px', color: '#666', lineHeight: '1.4' }}>
            □ Reçete kontrol edildi<br/>
            □ Cam tipi onaylandı<br/>
            □ Özel işlem var mı? _______________<br/>
            □ Teslim tarihi: {order.teslim_beklenen ? new Date(order.teslim_beklenen).toLocaleDateString('tr-TR') : '_______________'}
          </div>
        </div>

        {/* Signature Area */}
        <div className="print-signature-area" style={{ marginTop: '20px' }}>
          <div className="print-signature-box">
            Teslim Eden
          </div>
          <div className="print-signature-box">
            Teslim Alan (Lab)
          </div>
        </div>

        {/* Footer */}
        <div className="print-footer">
          <div style={{ fontSize: '7px' }}>
            Bu fiş cam laboratuvarı için hazırlanmıştır. Müşteri nüshası değildir.
          </div>
          <div style={{ fontSize: '7px', marginTop: '2px' }}>
            Yazdırma: {new Date().toLocaleString('tr-TR')}
          </div>
        </div>
      </div>
    </>
  );
}
