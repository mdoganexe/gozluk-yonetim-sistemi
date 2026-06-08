import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Glasses, Eye, Sun } from 'lucide-react';

const OPTIONS = [
  {
    key: 'gozluk', title: 'Gözlük Satışı', subtitle: 'Çerçeve + Cam',
    icon: Glasses, color: 'primary',
    features: ['Reçete girişi', 'Çerçeve seçimi', 'Cam seçimi'],
  },
  {
    key: 'gunes', title: 'Güneş Gözlüğü', subtitle: 'Numarasız / Numaralı',
    icon: Sun, color: 'amber',
    features: ['Güneş gözlüğü seçimi', 'Hızlı satış', 'Reçete opsiyonel'],
  },
  {
    key: 'lens', title: 'Sadece Lens', subtitle: 'Cam Değişimi',
    icon: Eye, color: 'green',
    features: ['Reçete girişi', 'Cam seçimi', 'Hızlı sipariş'],
  },
];

const COLOR = {
  primary: { ring: 'border-primary-500 bg-primary-50', icon: 'bg-primary-500', hover: 'hover:border-primary-300' },
  amber: { ring: 'border-amber-500 bg-amber-50', icon: 'bg-amber-500', hover: 'hover:border-amber-300' },
  green: { ring: 'border-green-500 bg-green-50', icon: 'bg-green-500', hover: 'hover:border-green-300' },
};

export default function QuickSaleModal({ customer, onClose }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const go = (key) => {
    setSelected(key);
    setTimeout(() => {
      if (key === 'gozluk') {
        navigate(`/orders/new?customer=${customer.id}&type=gozluk`);
      } else if (key === 'gunes') {
        navigate(`/orders/new?customer=${customer.id}&type=gunes`);
      } else {
        navigate(`/orders/new?customer=${customer.id}&type=lens`);
      }
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Hızlı Satış</h2>
            <p className="text-sm text-gray-600 mt-1">{customer.ad} {customer.soyad} için satış türünü seçin</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {OPTIONS.map(opt => {
              const Icon = opt.icon;
              const c = COLOR[opt.color];
              const active = selected === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => go(opt.key)}
                  className={`group relative p-6 border-2 rounded-xl transition-all text-center ${
                    active ? `${c.ring} scale-105` : `border-gray-200 ${c.hover} hover:bg-gray-50 dark:hover:bg-slate-700`
                  }`}
                >
                  <div className={`mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    active ? c.icon : 'bg-gray-100 dark:bg-slate-700'
                  }`}>
                    <Icon className={`w-9 h-9 ${active ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{opt.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{opt.subtitle}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    {opt.features.map(f => <p key={f}>✓ {f}</p>)}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Güneş Gözlüğü</strong>: numarasız güneş gözlüğü için reçeteye gerek yok; doğrudan ürün seçip satarsınız.
            </p>
          </div>

          <div className="mt-4">
            <button onClick={onClose} className="w-full btn-secondary">İptal (Daha Sonra)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
