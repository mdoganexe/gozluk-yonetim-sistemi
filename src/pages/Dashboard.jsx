import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, AlertTriangle, Calendar, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import db from '../db/database';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    pendingOrders: 0,
    lowStock: 0,
    todayDeliveries: 0
  });

  const [chartData, setChartData] = useState([]);

  // Bugünün siparişleri
  const todayOrders = useLiveQuery(async () => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);
    
    return await db.orders
      .where('siparis_tarihi')
      .between(start.toISOString(), end.toISOString())
      .toArray();
  });

  // Bekleyen siparişler
  const pendingOrders = useLiveQuery(() => 
    db.orders
      .where('durum')
      .anyOf(['onaylandi', 'uretimde'])
      .toArray()
  );

  // Düşük stok uyarıları
  const lowStockProducts = useLiveQuery(() =>
    db.products
      .filter(p => p.stok_adedi <= (p.min_stok_uyari || 5))
      .toArray()
  );

  // Bugün teslim edilecekler
  const todayDeliveries = useLiveQuery(async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return await db.orders
      .where('teslim_beklenen')
      .equals(today)
      .and(order => order.durum !== 'teslim_edildi')
      .toArray();
  });

  // İstatistikleri güncelle
  useEffect(() => {
    if (todayOrders && pendingOrders && lowStockProducts && todayDeliveries) {
      const todaySales = todayOrders.reduce((sum, order) => sum + (order.genel_toplam || 0), 0);
      
      setStats({
        todaySales,
        pendingOrders: pendingOrders.length,
        lowStock: lowStockProducts.length,
        todayDeliveries: todayDeliveries.length
      });
    }
  }, [todayOrders, pendingOrders, lowStockProducts, todayDeliveries]);

  // Son 7 gün grafik verisi
  useEffect(() => {
    const loadChartData = async () => {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const start = startOfDay(date);
        const end = endOfDay(date);
        
        const orders = await db.orders
          .where('siparis_tarihi')
          .between(start.toISOString(), end.toISOString())
          .toArray();
        
        const total = orders.reduce((sum, order) => sum + (order.genel_toplam || 0), 0);
        
        data.push({
          date: format(date, 'dd MMM', { locale: tr }),
          tutar: total
        });
      }
      setChartData(data);
    };
    
    loadChartData();
  }, [todayOrders]);

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <Link to={link} className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-600">
          {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Bugünkü Satış"
          value={`₺${stats.todaySales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
          color="bg-green-500"
          link="/orders"
        />
        <StatCard
          icon={ShoppingCart}
          title="Bekleyen Siparişler"
          value={stats.pendingOrders}
          color="bg-blue-500"
          link="/orders"
        />
        <StatCard
          icon={AlertTriangle}
          title="Düşük Stok Uyarısı"
          value={stats.lowStock}
          color="bg-orange-500"
          link="/products"
        />
        <StatCard
          icon={Calendar}
          title="Bugün Teslim"
          value={stats.todayDeliveries}
          color="bg-purple-500"
          link="/orders"
        />
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Son 7 Gün Satış Grafiği</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
            />
            <Bar dataKey="tutar" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders & Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Düşük Stok Uyarıları */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Düşük Stok Uyarıları
            </h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Tümünü Gör →
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockProducts?.slice(0, 5).map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div>
                  <p className="font-medium">{product.marka} {product.model}</p>
                  <p className="text-sm text-gray-600">{product.kategori}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">Stok: {product.stok_adedi}</p>
                  <p className="text-xs text-gray-500">Min: {product.min_stok_uyari || 5}</p>
                </div>
              </Link>
            ))}
            {(!lowStockProducts || lowStockProducts.length === 0) && (
              <p className="text-gray-500 text-center py-4">Düşük stok uyarısı yok ✓</p>
            )}
          </div>
        </div>

        {/* Bekleyen Siparişler */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bekleyen Siparişler</h2>
            <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Tümünü Gör →
            </Link>
          </div>
          <div className="space-y-3">
            {pendingOrders?.slice(0, 5).map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium">{order.fis_no}</p>
                  <p className="text-sm text-gray-600">{order.durum}</p>
                </div>
                <span className="text-sm font-medium">₺{order.genel_toplam?.toLocaleString('tr-TR')}</span>
              </Link>
            ))}
            {(!pendingOrders || pendingOrders.length === 0) && (
              <p className="text-gray-500 text-center py-4">Bekleyen sipariş yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Bugün Teslim Edilecekler */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bugün Teslim Edilecekler</h2>
          <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Tümünü Gör →
          </Link>
        </div>
        <div className="space-y-3">
          {todayDeliveries?.slice(0, 5).map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <div>
                <p className="font-medium">{order.fis_no}</p>
                <p className="text-sm text-gray-600">Teslim: {order.teslim_beklenen}</p>
              </div>
              <span className="text-sm font-medium">₺{order.genel_toplam?.toLocaleString('tr-TR')}</span>
            </Link>
          ))}
          {(!todayDeliveries || todayDeliveries.length === 0) && (
            <p className="text-gray-500 text-center py-4">Bugün teslim edilecek sipariş yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
