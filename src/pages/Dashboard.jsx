import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, AlertTriangle, Calendar, DollarSign, CalendarClock, Clock, User, Zap, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay, addDays, parseISO, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import db from '../db/database';
import SaleWizard from '../components/SaleWizard';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    pendingOrders: 0,
    lowStock: 0,
    todayDeliveries: 0
  });

  const [chartData, setChartData] = useState([]);
  const [showWizard, setShowWizard] = useState(false);

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

  // Yaklaşan randevular (bugün + önümüzdeki 7 gün, bekleyen)
  const upcomingAppointments = useLiveQuery(async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const limit = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const all = await db.appointments.where('durum').equals('bekliyor').toArray();
    return all
      .filter(a => a.tarih >= today && a.tarih <= limit)
      .sort((a, b) => (a.tarih + (a.saat || '')).localeCompare(b.tarih + (b.saat || '')));
  });

  const customers = useLiveQuery(() => db.customers.toArray());

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/orders/new?type=gunes&hemen=1"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all"
          >
            <Sun className="w-5 h-5" />
            Hemen Satış (Güneş)
          </Link>
          <button
            onClick={() => setShowWizard(true)}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-primary-600/30 transition-all"
          >
            <Zap className="w-5 h-5" />
            Hızlı Satış (Müşteri + Sipariş + Ödeme)
          </button>
          <div className="text-sm text-gray-600 hidden md:block">
            {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
          </div>
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

      {/* Yaklaşan Randevular */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary-600" />
            Yaklaşan Randevular (7 gün)
          </h2>
          <Link to="/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Tümünü Gör →
          </Link>
        </div>
        <div className="space-y-3">
          {upcomingAppointments?.slice(0, 6).map(a => {
            const customer = customers?.find(c => c.id === a.musteri_id);
            const today = isToday(parseISO(a.tarih));
            return (
              <Link
                key={a.id}
                to="/appointments"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center w-14">
                    <p className="text-sm font-bold">{format(parseISO(a.tarih), 'dd MMM')}</p>
                    {a.saat && (
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-0.5">
                        <Clock className="w-3 h-3" />{a.saat}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{a.tip}</p>
                    {customer && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />{customer.ad} {customer.soyad}
                      </p>
                    )}
                    {!customer && a.aciklama && (
                      <p className="text-sm text-gray-600 truncate max-w-xs">{a.aciklama}</p>
                    )}
                  </div>
                </div>
                {today && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    Bugün
                  </span>
                )}
              </Link>
            );
          })}
          {(!upcomingAppointments || upcomingAppointments.length === 0) && (
            <p className="text-gray-500 text-center py-4">Yaklaşan randevu yok</p>
          )}
        </div>
      </div>

      {showWizard && <SaleWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
}
