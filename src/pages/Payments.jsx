import { useLiveQuery } from 'dexie-react-hooks';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import db from '../db/database';

export default function Payments() {
  const payments = useLiveQuery(() => db.payments.orderBy('tarih').reverse().toArray());
  const orders = useLiveQuery(() => db.orders.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());

  const todayPayments = payments?.filter(p => {
    const paymentDate = new Date(p.tarih);
    const today = new Date();
    return paymentDate >= startOfDay(today) && paymentDate <= endOfDay(today);
  });

  const todayTotal = todayPayments?.reduce((sum, p) => sum + p.tutar, 0) || 0;

  const veresiyeOrders = orders?.filter(o => 
    !o.odeme_tamamlandi && o.durum !== 'iptal'
  );

  const veresiyeTotal = veresiyeOrders?.reduce((sum, o) => 
    sum + (o.genel_toplam - (o.odenen_toplam || 0)), 0
  ) || 0;

  const getOrderInfo = (siparisId) => {
    const order = orders?.find(o => o.id === siparisId);
    if (!order) return { fis_no: '-', customer: '-' };
    
    const customer = customers?.find(c => c.id === order.musteri_id);
    return {
      fis_no: order.fis_no,
      customer: customer ? `${customer.ad} ${customer.soyad}` : '-'
    };
  };

  const paymentTypeColors = {
    nakit: 'bg-green-100 text-green-700',
    kredi_karti: 'bg-blue-100 text-blue-700',
    havale: 'bg-purple-100 text-purple-700',
    veresiye: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Kasa Yönetimi</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bugünkü Tahsilat</p>
              <p className="text-2xl font-bold text-green-600">
                ₺{todayTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Toplam Veresiye</p>
              <p className="text-2xl font-bold text-orange-600">
                ₺{veresiyeTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bekleyen Ödeme</p>
              <p className="text-2xl font-bold text-blue-600">
                {veresiyeOrders?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Veresiye List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Bekleyen Ödemeler</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fiş No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Toplam</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Ödenen</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Kalan</th>
              </tr>
            </thead>
            <tbody>
              {veresiyeOrders?.map(order => {
                const customer = customers?.find(c => c.id === order.musteri_id);
                const kalan = order.genel_toplam - (order.odenen_toplam || 0);
                
                return (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{order.fis_no}</td>
                    <td className="py-3 px-4">
                      {customer ? `${customer.ad} ${customer.soyad}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₺{order.genel_toplam?.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      ₺{order.odenen_toplam?.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-orange-600">
                      ₺{kalan.toLocaleString('tr-TR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {(!veresiyeOrders || veresiyeOrders.length === 0) && (
            <p className="text-center py-8 text-gray-500">Bekleyen ödeme yok</p>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Ödeme Geçmişi</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fiş No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tür</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Açıklama</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map(payment => {
                const orderInfo = getOrderInfo(payment.siparis_id);
                
                return (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      {format(new Date(payment.tarih), 'dd.MM.yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4 font-medium">{orderInfo.fis_no}</td>
                    <td className="py-3 px-4">{orderInfo.customer}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${paymentTypeColors[payment.odeme_turu]}`}>
                        {payment.odeme_turu}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{payment.aciklama || '-'}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      ₺{payment.tutar?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {(!payments || payments.length === 0) && (
            <p className="text-center py-8 text-gray-500">Henüz ödeme kaydı yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
