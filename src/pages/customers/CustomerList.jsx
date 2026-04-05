import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Plus, Search, Phone, Mail, Eye } from 'lucide-react';
import db from '../../db/database';
import CustomerModal from '../../components/CustomerModal';
import QuickSaleModal from '../../components/QuickSaleModal';

export default function CustomerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = useLiveQuery(() => db.customers.toArray());

  const filteredCustomers = customers?.filter(customer => {
    const search = searchTerm.toLowerCase();
    return (
      customer.ad?.toLowerCase().includes(search) ||
      customer.soyad?.toLowerCase().includes(search) ||
      customer.telefon?.includes(search) ||
      customer.tc_kimlik?.includes(search) ||
      customer.email?.toLowerCase().includes(search)
    );
  });

  const handleCustomerSaved = (customerId) => {
    setShowModal(false);
    
    // Yeni eklenen müşteriyi bul
    db.customers.get(customerId).then(customer => {
      if (customer) {
        setSelectedCustomer(customer);
        setShowQuickSale(true);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Müşteriler</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Müşteri
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Ad, soyad, telefon, TC kimlik veya email ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ad Soyad</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">TC Kimlik</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kayıt Tarihi</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers?.map(customer => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{customer.ad} {customer.soyad}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {customer.tc_kimlik || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {customer.telefon}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(customer.olusturma_tarihi).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/customers/${customer.id}`}
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Detay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!filteredCustomers || filteredCustomers.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz müşteri kaydı yok'}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSave={handleCustomerSaved}
        />
      )}

      {showQuickSale && selectedCustomer && (
        <QuickSaleModal
          customer={selectedCustomer}
          onClose={() => {
            setShowQuickSale(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}
