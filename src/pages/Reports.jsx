import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import db from '../db/database';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const orders = useLiveQuery(() => db.orders.toArray());
  const products = useLiveQuery(() => db.products.toArray());
  const orderItems = useLiveQuery(() => db.order_items.toArray());

  const filteredOrders = orders?.filter(order => {
    const orderDate = new Date(order.siparis_tarihi);
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return orderDate >= start && orderDate <= end && order.durum !== 'iptal';
  });

  // Satış özeti
  const totalSales = filteredOrders?.reduce((sum, o) => sum + (o.genel_toplam || 0), 0) || 0;
  const totalOrders = filteredOrders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

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
    if (!statusData[order.durum]) {
      statusData[order.durum] = 0;
    }
    statusData[order.durum]++;
  });

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>

      {/* Date Range */}
      <div className="card">
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Toplam Satış</p>
          <p className="text-3xl font-bold text-primary-600">
            ₺{totalSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Sipariş Sayısı</p>
          <p className="text-3xl font-bold text-green-600">{totalOrders}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Ortalama Sipariş</p>
          <p className="text-3xl font-bold text-purple-600">
            ₺{avgOrderValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
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
              formatter={(value, name) => {
                if (name === 'tutar') {
                  return `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
                }
                return value;
              }}
            />
            <Bar dataKey="adet" fill="#0ea5e9" name="Adet" />
            <Bar dataKey="tutar" fill="#8b5cf6" name="Tutar" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Sipariş Durum Dağılımı</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
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

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Stok Değeri</h2>
          <div className="space-y-3">
            {products?.slice(0, 10).map(product => {
              const stockValue = (product.alis_fiyati || 0) * product.stok_adedi;
              return (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.marka} {product.model}</p>
                    <p className="text-sm text-gray-600">Stok: {product.stok_adedi}</p>
                  </div>
                  <span className="font-bold">
                    ₺{stockValue.toLocaleString('tr-TR')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
