import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Edit, Plus, Eye, Glasses, CalendarClock, ShoppingCart, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import db from '../../db/database';
import CustomerModal from '../../components/CustomerModal';
import PrescriptionModal from '../../components/PrescriptionModal';
import AppointmentModal from '../../components/AppointmentModal';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [newPrescriptionType, setNewPrescriptionType] = useState(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [expandedPrescription, setExpandedPrescription] = useState(null);

  const customer = useLiveQuery(() => db.customers.get(parseInt(id)));
  const parentCustomer = useLiveQuery(() => 
    customer?.parent_id ? db.customers.get(customer.parent_id) : null
  , [customer]);
  const referredCustomers = useLiveQuery(() =>
    db.customers.where('parent_id').equals(parseInt(id)).toArray()
  , [id]);
  const prescriptions = useLiveQuery(() => 
    db.prescriptions.where('musteri_id').equals(parseInt(id)).reverse().toArray()
  );
  const orders = useLiveQuery(() =>
    db.orders.where('musteri_id').equals(parseInt(id)).reverse().toArray()
  );

  // URL parametrelerini kontrol et (hızlı satış akışı için)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'prescription' && customer) {
      setShowPrescriptionModal(true);
    }
  }, [searchParams, customer]);

  const handlePrescriptionSaved = () => {
    setShowPrescriptionModal(false);
    
    // Eğer next=order parametresi varsa, sipariş oluşturmaya yönlendir
    const next = searchParams.get('next');
    if (next === 'order') {
      window.location.href = `/orders/new?customer=${id}`;
    }
  };

  if (!customer) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/customers" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.ad} {customer.soyad}
            </h1>
            <p className="text-gray-600">{customer.telefon}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <CalendarClock className="w-5 h-5" />
            Randevu Oluştur
          </button>
          <button
            onClick={() => setShowCustomerModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Düzenle
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Müşteri Bilgileri</h2>
        <div className="grid grid-cols-2 gap-4">
          {customer.tc_kimlik && (
            <div>
              <p className="text-sm text-gray-600">TC Kimlik No</p>
              <p className="font-medium">{customer.tc_kimlik}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Telefon</p>
            <p className="font-medium">{customer.telefon}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{customer.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Doğum Tarihi</p>
            <p className="font-medium">
              {customer.dogum_tarihi 
                ? new Date(customer.dogum_tarihi).toLocaleDateString('tr-TR')
                : '-'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Meslek</p>
            <p className="font-medium">{customer.meslek || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Kayıt Tarihi</p>
            <p className="font-medium">
              {new Date(customer.olusturma_tarihi).toLocaleDateString('tr-TR')}
            </p>
          </div>
          {customer.adres && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Adres</p>
              <p className="font-medium">{customer.adres}</p>
            </div>
          )}
          {customer.notlar && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Notlar</p>
              <p className="font-medium">{customer.notlar}</p>
            </div>
          )}
        </div>
      </div>

      {/* Referans Bilgileri */}
      {(parentCustomer || (referredCustomers && referredCustomers.length > 0)) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Referans Bilgileri</h2>
          
          {parentCustomer && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Bu müşteriyi getiren:</p>
              <Link 
                to={`/customers/${parentCustomer.id}`}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                {parentCustomer.ad} {parentCustomer.soyad} - {parentCustomer.telefon}
              </Link>
            </div>
          )}

          {referredCustomers && referredCustomers.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Bu müşterinin getirdiği müşteriler ({referredCustomers.length}):
              </p>
              <div className="space-y-2">
                {referredCustomers.map(ref => (
                  <Link
                    key={ref.id}
                    to={`/customers/${ref.id}`}
                    className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <p className="font-medium text-green-700">
                      {ref.ad} {ref.soyad}
                    </p>
                    <p className="text-sm text-green-600">{ref.telefon}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prescriptions */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Glasses className="w-6 h-6" />
            Göz Ölçüleri (Reçeteler)
          </h2>
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(v => !v)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni Reçete
              <ChevronDown className="w-4 h-4" />
            </button>
            {showNewMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-20 overflow-hidden">
                <button
                  onClick={() => { setNewPrescriptionType('optik'); setSelectedPrescription(null); setShowPrescriptionModal(true); setShowNewMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
                >
                  <Glasses className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Optik (Gözlük) Reçetesi</span>
                </button>
                <button
                  onClick={() => { setNewPrescriptionType('lens'); setSelectedPrescription(null); setShowPrescriptionModal(true); setShowNewMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-left border-t border-gray-100 dark:border-slate-700"
                >
                  <Eye className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Lens (Kontakt) Reçetesi</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Tek tıkla numaraları aç/kapat • Çift tıkla bu reçeteyle sipariş oluştur
        </p>

        <div className="space-y-3">
          {prescriptions?.map(prescription => {
            const isLens = prescription.recete_tipi === 'lens';
            const expanded = expandedPrescription === prescription.id;
            const numbersSummary = `Sağ: ${prescription.sag_sfera || '–'}/${prescription.sag_silindir || '–'}  ·  Sol: ${prescription.sol_sfera || '–'}/${prescription.sol_silindir || '–'}`;
            return (
              <div
                key={prescription.id}
                onClick={() => setExpandedPrescription(expanded ? null : prescription.id)}
                onDoubleClick={() => navigate(`/orders/new?customer=${id}&prescription=${prescription.id}`)}
                title="Tek tık: numaraları gör • Çift tık: sipariş oluştur"
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  prescription.aktif ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'
                } hover:border-primary-400`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {new Date(prescription.tarih).toLocaleDateString('tr-TR')}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${isLens ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isLens ? 'Lens' : 'Optik'}
                      </span>
                      {prescription.aktif && (
                        <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">Aktif</span>
                      )}
                      {isLens && prescription.lens_marka && (
                        <span className="text-xs text-gray-600">{prescription.lens_marka}</span>
                      )}
                      {prescription.gorseller?.length > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <ImageIcon className="w-3.5 h-3.5" />{prescription.gorseller.length}
                        </span>
                      )}
                    </div>
                    {!expanded && (
                      <p className="text-sm text-gray-500 mt-1 font-mono">{numbersSummary}</p>
                    )}
                    {prescription.doktor_adi && expanded && (
                      <p className="text-sm text-gray-600 mt-1">Dr. {prescription.doktor_adi}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/orders/new?customer=${id}&prescription=${prescription.id}`)}
                      title="Bu reçeteyle sipariş oluştur"
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setSelectedPrescription(prescription); setNewPrescriptionType(null); setShowPrescriptionModal(true); }}
                      title="Düzenle"
                      className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <span className="p-2 text-gray-400">
                      {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">SAĞ GÖZ</p>
                        <div className="space-y-1">
                          <p>{isLens ? 'SPH' : 'Sfera'}: {prescription.sag_sfera || '-'}</p>
                          <p>{isLens ? 'CYL' : 'Silindir'}: {prescription.sag_silindir || '-'}</p>
                          <p>{isLens ? 'AXIS' : 'Aks'}: {prescription.sag_aks || '-'}</p>
                          {isLens ? (
                            <>
                              <p>BC: {prescription.sag_bc || '-'}</p>
                              <p>DIA (Çap): {prescription.sag_dia || '-'}</p>
                            </>
                          ) : (
                            <>
                              {prescription.sag_add && <p>Add: {prescription.sag_add}</p>}
                              <p>PD: {prescription.pd_uzak_sag || '-'}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">SOL GÖZ</p>
                        <div className="space-y-1">
                          <p>{isLens ? 'SPH' : 'Sfera'}: {prescription.sol_sfera || '-'}</p>
                          <p>{isLens ? 'CYL' : 'Silindir'}: {prescription.sol_silindir || '-'}</p>
                          <p>{isLens ? 'AXIS' : 'Aks'}: {prescription.sol_aks || '-'}</p>
                          {isLens ? (
                            <>
                              <p>BC: {prescription.sol_bc || '-'}</p>
                              <p>DIA (Çap): {prescription.sol_dia || '-'}</p>
                            </>
                          ) : (
                            <>
                              {prescription.sol_add && <p>Add: {prescription.sol_add}</p>}
                              <p>PD: {prescription.pd_uzak_sol || '-'}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {prescription.gorseller?.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {prescription.gorseller.map((g, idx) => (
                          <a key={idx} href={g.dataUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            <img src={g.dataUrl} alt={g.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {(!prescriptions || prescriptions.length === 0) && (
            <p className="text-center py-8 text-gray-500">Henüz reçete kaydı yok</p>
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Sipariş Geçmişi</h2>
        <div className="space-y-3">
          {orders?.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-semibold">{order.fis_no}</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.siparis_tarihi).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₺{order.genel_toplam?.toLocaleString('tr-TR')}</p>
                <p className="text-sm text-gray-600">{order.durum}</p>
              </div>
            </Link>
          ))}

          {(!orders || orders.length === 0) && (
            <p className="text-center py-8 text-gray-500">Henüz sipariş yok</p>
          )}
        </div>
      </div>

      {showCustomerModal && (
        <CustomerModal
          customer={customer}
          onClose={() => setShowCustomerModal(false)}
          onSave={() => setShowCustomerModal(false)}
        />
      )}

      {showPrescriptionModal && (
        <PrescriptionModal
          customerId={parseInt(id)}
          prescription={selectedPrescription}
          initialType={newPrescriptionType}
          onClose={() => setShowPrescriptionModal(false)}
          onSave={handlePrescriptionSaved}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          defaultCustomerId={parseInt(id)}
          onClose={() => setShowAppointmentModal(false)}
          onSave={() => setShowAppointmentModal(false)}
        />
      )}
    </div>
  );
}
