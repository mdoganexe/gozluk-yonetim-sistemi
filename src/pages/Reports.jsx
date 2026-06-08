import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Download, Printer, TrendingUp, Percent } from 'lucide-react';
import db from '../db/database';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const PAYMENT_LABELS = {
  nakit: 'Nakit',
  kredi_karti: 'Kredi Kartı',
  havale: 'Havale/EFT',
  veresiye: 'Veresiye'
};

const tl = (v) => `₺${(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const orders = useLiveQuery(() => db.orders.toArray());
  const products = useLiveQuery(() => db.products.toArray());
  const orderItems = useLiveQuery(() => db.order_items.toArray());
  const payments = useLiveQuery(() => db.payments.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());
  const expenses = useLiveQuery(() => db.expenses.toArray());

  const inRange = (dateStr) => {
    const d = new Date(dateStr);
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  };

  const filteredOrders = orders?.filter(o => inRange(o.siparis_tarihi) && o.durum !== 'iptal');

  // Satış özeti
  const totalSales = filteredOrders?.reduce((sum, o) => sum + (o.genel_toplam || 0), 0) || 0;
  const totalOrders = filteredOrders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Kâr / Marj hesabı (alış vs satış)
  let toplamMaliyet = 0;
  let toplamKalemSatis = 0;
  filteredOrders?.forEach(order => {
    const items = orderItems?.filter(item => item.siparis_id === order.id) || [];
    items.forEach(item => {
      toplamKalemSatis += item.toplam || 0;
      if (item.urun_id) {
        const product = products?.find(p => p.id === item.urun_id);
        if (product) {
          toplamMaliyet += (parseFloat(product.alis_fiyati) || 0) * (item.adet || 0);
        }
      }
    });
  });
  const brutKar = toplamKalemSatis - toplamMaliyet;
  const karMarji = toplamKalemSatis > 0 ? (brutKar / toplamKalemSatis) * 100 : 0;

  // Giderler (tarih filtreli) + net kâr
  const filteredExpenses = expenses?.filter(e => inRange(e.tarih)) || [];
  const toplamGider = filteredExpenses.reduce((s, e) => s + (e.tutar || 0), 0);
  const netKar = brutKar - toplamGider;

  // Ödeme türü kırılımı (tarihe göre filtreli)
  const filteredPayments = payments?.filter(p => inRange(p.tarih)) || [];
  const paymentByType = filteredPayments.reduce((acc, p) => {
    acc[p.odeme_turu] = (acc[p.odeme_turu] || 0) + p.tutar;
    return acc;
  }, {});
  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.tutar, 0);
  const paymentChartData = Object.entries(paymentByType).map(([key, value]) => ({
    name: PAYMENT_LABELS[key] || key,
    value
  }));

  // Ürün bazlı satış
  const productSales = {};
  filteredOrders?.forEach(order => {
    const items = orderItems?.filter(item => item.siparis_id === order.id);
    items?.forEach(item => {
      if (item.urun_id) {
        const product = products?.find(p => p.id === item.urun_id);
        if (product) {
          const key = `${product.marka} ${product.model}`;
          if (!productSales[key]) {
            productSales[key] = { name: key, adet: 0, tutar: 0 };
          }
          productSales[key].adet += item.adet;
          productSales[key].tutar += item.toplam;
        }
      }
    });
  });

  const productSalesData = Object.values(productSales)
    .sort((a, b) => b.tutar - a.tutar)
    .slice(0, 10);

  // Durum bazlı dağılım
  const statusData = {};
  orders?.forEach(order => {
    statusData[order.durum] = (statusData[order.durum] || 0) + 1;
  });
  const statusChartData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  // CSV dışa aktarım (Excel uyumlu, UTF-8 BOM)
  const exportCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      alert('Seçili tarih aralığında sipariş yok');
      return;
    }
    const header = ['Fiş No', 'Tarih', 'Müşteri', 'Durum', 'Ara Toplam', 'İndirim', 'KDV', 'Genel Toplam', 'Ödenen', 'Kalan'];
    const rows = filteredOrders.map(o => {
      const c = customers?.find(x => x.id === o.musteri_id);
      const kalan = (o.genel_toplam || 0) - (o.odenen_toplam || 0);
      return [
        o.fis_no,
        new Date(o.siparis_tarihi).toLocaleDateString('tr-TR'),
        c ? `${c.ad} ${c.soyad}` : '-',
        o.durum,
        (o.ara_toplam || 0).toFixed(2),
        (o.indirim_tl || 0).toFixed(2),
        (o.kdv_tutari || 0).toFixed(2),
        (o.genel_toplam || 0).toFixed(2),
        (o.odenen_toplam || 0).toFixed(2),
        kalan.toFixed(2)
      ];
    });
    const csv = [header, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapor-${dateRange.start}_${dateRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            CSV İndir
          </button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Yazdır
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="card no-print">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Başlangıç Tarihi</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Bitiş Tarihi</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 hidden print:block">
        Rapor Aralığı: {new Date(dateRange.start).toLocaleDateString('tr-TR')} – {new Date(dateRange.end).toLocaleDateString('tr-TR')}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Toplam Satış</p>
          <p className="text-3xl font-bold text-primary-600">{tl(totalSales)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Sipariş Sayısı</p>
          <p className="text-3xl font-bold text-green-600">{totalOrders}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Ortalama Sipariş</p>
          <p className="text-3xl font-bold text-purple-600">{tl(avgOrderValue)}</p>
        </div>
      </div>

      {/* Kâr / Marj */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Toplam Maliyet (Alış)</p>
          <p className="text-2xl font-bold text-gray-700">{tl(toplamMaliyet)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Ürün Satış Geliri</p>
          <p className="text-2xl font-bold text-blue-600">{tl(toplamKalemSatis)}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Brüt Kâr</p>
              <p className={`text-2xl font-bold ${brutKar >= 0 ? 'text-green-600' : 'text-red-600'}`}>{tl(brutKar)}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kâr Marjı</p>
              <p className={`text-2xl font-bold ${karMarji >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                %{karMarji.toFixed(1)}
              </p>
            </div>
            <Percent className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-3">
        * Maliyet yalnızca stoklu ürünler (çerçeve/güneşlik) için hesaplanır. Cam ve işçilik kalemlerinin alış maliyeti dahil değildir.
      </p>

      {/* Gider & Net Kâr */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Toplam Gider (Mağaza)</p>
          <p className="text-2xl font-bold text-red-600">{tl(toplamGider)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Net Kâr (Brüt Kâr − Gider)</p>
          <p className={`text-2xl font-bold ${netKar >= 0 ? 'text-green-600' : 'text-red-600'}`}>{tl(netKar)}</p>
        </div>
      </div>

      {/* Ödeme Türü Kırılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Ödeme Türü Kırılımı (Tahsilat)</h2>
          {totalCollected > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => tl(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1">
                {Object.entries(paymentByType).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{PAYMENT_LABELS[key] || key}</span>
                    <span className="font-medium">{tl(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                  <span>Toplam Tahsilat</span>
                  <span className="text-primary-600">{tl(totalCollected)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-12 text-gray-500">Bu aralıkta tahsilat yok</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Sipariş Durum Dağılımı</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Sales Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">En Çok Satan Ürünler</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={productSalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip
              formatter={(value, name) => (name === 'Tutar' ? tl(value) : value)}
            />
            <Bar dataKey="adet" fill="#0ea5e9" name="Adet" />
            <Bar dataKey="tutar" fill="#8b5cf6" name="Tutar" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stok Değeri */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Stok Değeri (İlk 10)</h2>
        <div className="space-y-3">
          {products?.slice(0, 10).map(product => {
            const stockValue = (parseFloat(product.alis_fiyati) || 0) * product.stok_adedi;
            return (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{product.marka} {product.model}</p>
                  <p className="text-sm text-gray-600">Stok: {product.stok_adedi}</p>
                </div>
                <span className="font-bold">{tl(stockValue)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
