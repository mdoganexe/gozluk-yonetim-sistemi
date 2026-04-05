import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';
import db from '../../db/database';

const statusColors = {
  taslak: 'bg-gray-100 text-gray-700',
  onaylandi: 'bg-blue-100 text-blue-700',
  uretimde: 'bg-yellow-100 text-yellow-700',
  hazir: 'bg-green-100 text-green-700',
  teslim_edildi: 'bg-purple-100 text-purple-700',
  iptal: 'bg-red-100 text-red-700'
};

export default function OrderList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const orders = useLiveQuery(() => db.orders.orderBy('siparis_tarihi').reverse().toArray());
  const customers = useLiveQuery(() => db.customers.toArray());

  const getCustomerName = (customerId) => {
    const customer = customers?.find(c => c.id === customerId);
    return customer ? `${customer.ad} ${customer.soyad}` : '-';
  };

  const filteredOrders = orders?.filter(order => {
    const customerName = getCustomerName(order.musteri_id);
    const matchesSearch = 
      order.fis_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.durum === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
        <Link to="/orders/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Sipariş
        </Link>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Fiş no veya müşteri adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {['all', 'taslak', 'onaylandi', 'uretimde', 'hazir', 'teslim_edildi', 'iptal'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'Tümü' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fiş No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Teslim</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tutar</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.map(order => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{order.fis_no}</td>
                  <td className="py-3 px-4">{getCustomerName(order.musteri_id)}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(order.siparis_tarihi).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {order.teslim_beklenen || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.durum]}`}>
                      {order.durum}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    ₺{order.genel_toplam?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/orders/${order.id}`}
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
          
          {(!filteredOrders || filteredOrders.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Arama sonucu bulunamadı' 
                : 'Henüz sipariş kaydı yok'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
