import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, CreditCard, Banknote, Building2, FileText, Wallet, Plus, TrendingDown, Trash2, Edit } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import db from '../db/database';
import PaymentModal from '../components/PaymentModal';
import ExpenseModal, { EXPENSE_CATEGORIES } from '../components/ExpenseModal';

export default function Payments() {
  const [payOrder, setPayOrder] = useState(null);
  const [showExpense, setShowExpense] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  const payments = useLiveQuery(() => db.payments.orderBy('tarih').reverse().toArray());
  const orders = useLiveQuery(() => db.orders.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());
  const expenses = useLiveQuery(() => db.expenses.orderBy('tarih').reverse().toArray());

  const isToday = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d >= startOfDay(today) && d <= endOfDay(today);
  };

  const todayPayments = payments?.filter(p => isToday(p.tarih));
  const todayTotal = todayPayments?.reduce((sum, p) => sum + p.tutar, 0) || 0;

  // Giderler
  const todayExpenses = expenses?.filter(e => isToday(e.tarih)) || [];
  const todayExpenseTotal = todayExpenses.reduce((s, e) => s + (e.tutar || 0), 0);
  const netKasa = todayTotal - todayExpenseTotal;

  const removeExpense = async (id) => {
    if (confirm('Bu gider kaydı silinsin mi?')) await db.expenses.delete(id);
  };

  // Günlük ödeme türü kırılımı (mini Z raporu)
  const todayByType = (todayPayments || []).reduce((acc, p) => {
    acc[p.odeme_turu] = (acc[p.odeme_turu] || 0) + p.tutar;
    return acc;
  }, {});

  const zRows = [
    { key: 'nakit', label: 'Nakit', icon: Banknote, color: 'text-green-600' },
    { key: 'kredi_karti', label: 'Kredi Kartı', icon: CreditCard, color: 'text-blue-600' },
    { key: 'havale', label: 'Havale/EFT', icon: Building2, color: 'text-purple-600' },
    { key: 'veresiye', label: 'Veresiye', icon: FileText, color: 'text-orange-600' },
  ];

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Kasa Yönetimi</h1>
        <button onClick={() => { setEditExpense(null); setShowExpense(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Gider Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bugünkü Gider</p>
              <p className="text-2xl font-bold text-red-600">
                ₺{todayExpenseTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Günlük Kasa Kırılımı (Z Raporu) */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold">Bugünkü Kasa Kırılımı</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {zRows.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
              <p className={`text-lg font-bold ${color}`}>
                ₺{(todayByType[key] || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bugün Toplam Tahsilat</span>
            <span className="font-bold text-green-600">
              +₺{todayTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bugün Toplam Gider</span>
            <span className="font-bold text-red-600">
              -₺{todayExpenseTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-2">
            <span className="font-semibold">Net Kasa (Tahsilat - Gider)</span>
            <span className={`text-xl font-bold ${netKasa >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
              ₺{netKasa.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
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
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {veresiyeOrders?.map(order => {
                const customer = customers?.find(c => c.id === order.musteri_id);
                const kalan = order.genel_toplam - (order.odenen_toplam || 0);

                return (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      <Link to={`/orders/${order.id}`} className="text-primary-600 hover:text-primary-700">
                        {order.fis_no}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {customer ? `${customer.ad} ${customer.soyad}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₺{order.genel_toplam?.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      ₺{(order.odenen_toplam || 0).toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-orange-600">
                      ₺{kalan.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setPayOrder({ id: order.id, kalan })}
                        className="btn-primary text-sm py-1.5 px-3 inline-flex items-center gap-1"
                      >
                        <DollarSign className="w-4 h-4" />
                        Tahsilat Al
                      </button>
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

      {/* Giderler */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" /> Giderler (Mağaza Giderleri)
          </h2>
          <button onClick={() => { setEditExpense(null); setShowExpense(true); }} className="btn-secondary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Gider Ekle
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Açıklama</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ödeme</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tutar</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {expenses?.slice(0, 50).map(exp => (
                <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{new Date(exp.tarih).toLocaleDateString('tr-TR')}</td>
                  <td className="py-3 px-4">{exp.aciklama}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{EXPENSE_CATEGORIES[exp.kategori] || exp.kategori}</td>
                  <td className="py-3 px-4 text-sm capitalize">{exp.odeme_turu?.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-right font-bold text-red-600">
                    -₺{exp.tutar?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditExpense(exp); setShowExpense(true); }} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeExpense(exp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!expenses || expenses.length === 0) && (
            <p className="text-center py-8 text-gray-500">Henüz gider kaydı yok</p>
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

      {payOrder && (
        <PaymentModal
          orderId={payOrder.id}
          kalanTutar={payOrder.kalan}
          onClose={() => setPayOrder(null)}
          onSave={() => setPayOrder(null)}
        />
      )}

      {showExpense && (
        <ExpenseModal
          expense={editExpense}
          onClose={() => { setShowExpense(false); setEditExpense(null); }}
          onSave={() => { setShowExpense(false); setEditExpense(null); }}
        />
      )}
    </div>
  );
}
