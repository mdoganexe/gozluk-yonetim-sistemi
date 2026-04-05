import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Package, ShoppingCart, 
  Wallet, BarChart3, Settings, Menu, X, Glasses, LogOut, User 
} from 'lucide-react';
import { logout, getCurrentUser } from '../utils/auth';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/customers', icon: Users, label: 'Müşteriler' },
  { path: '/products', icon: Package, label: 'Stok' },
  { path: '/orders', icon: ShoppingCart, label: 'Siparişler' },
  { path: '/payments', icon: Wallet, label: 'Kasa' },
  { path: '/reports', icon: BarChart3, label: 'Raporlar' },
  { path: '/settings', icon: Settings, label: 'Ayarlar' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-primary-700 to-primary-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-primary-600">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Glasses className="w-8 h-8" />
              <span className="font-bold text-lg">OptikPro</span>
            </div>
          ) : (
            <Glasses className="w-8 h-8 mx-auto" />
          )}
        </div>

        {/* User Info */}
        {sidebarOpen && currentUser && (
          <div className="p-4 border-b border-primary-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentUser.fullName}</p>
                <p className="text-xs text-primary-200 truncate">{currentUser.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white text-primary-700 shadow-lg' 
                    : 'hover:bg-primary-600'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-primary-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Çıkış Yap</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 hover:bg-primary-600 transition-colors border-t border-primary-600"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
