import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, User, ShoppingCart, Package, X } from 'lucide-react';
import db from '../db/database';

const normalize = (s) => (s ?? '').toString().toLocaleLowerCase('tr-TR');

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const customers = useLiveQuery(() => db.customers.toArray());
  const orders = useLiveQuery(() => db.orders.toArray());
  const products = useLiveQuery(() => db.products.toArray());

  // Ctrl/Cmd + K ile odaklan
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query).trim();
    if (q.length < 1) return [];

    const out = [];

    customers?.forEach(c => {
      const hay = normalize(`${c.ad} ${c.soyad} ${c.telefon} ${c.tc_kimlik || ''} ${c.email || ''}`);
      if (hay.includes(q)) {
        out.push({
          type: 'customer',
          id: c.id,
          title: `${c.ad} ${c.soyad}`,
          subtitle: c.telefon || c.tc_kimlik || '',
          to: `/customers/${c.id}`
        });
      }
    });

    orders?.forEach(o => {
      const hay = normalize(o.fis_no);
      if (hay.includes(q)) {
        out.push({
          type: 'order',
          id: o.id,
          title: o.fis_no,
          subtitle: `₺${(o.genel_toplam || 0).toLocaleString('tr-TR')} · ${o.durum}`,
          to: `/orders/${o.id}`
        });
      }
    });

    products?.forEach(p => {
      const hay = normalize(`${p.marka} ${p.model} ${p.barkod || ''} ${p.sku || ''}`);
      if (hay.includes(q)) {
        out.push({
          type: 'product',
          id: p.id,
          title: `${p.marka} ${p.model}`,
          subtitle: `Stok: ${p.stok_adedi} · ₺${(p.satis_fiyati || 0).toLocaleString('tr-TR')}`,
          to: `/products/${p.id}`
        });
      }
    });

    return out.slice(0, 12);
  }, [query, customers, orders, products]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[activeIndex]);
    }
  };

  const typeMeta = {
    customer: { icon: User, label: 'Müşteri', color: 'text-blue-500' },
    order: { icon: ShoppingCart, label: 'Sipariş', color: 'text-green-500' },
    product: { icon: Package, label: 'Ürün', color: 'text-purple-500' }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Müşteri, sipariş, ürün ara…  (Ctrl+K)"
          className="input pl-10 pr-9"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 1 && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">Sonuç bulunamadı</div>
          ) : (
            results.map((item, idx) => {
              const meta = typeMeta[item.type];
              const Icon = meta.icon;
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => go(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    idx === activeIndex ? 'bg-gray-100 dark:bg-slate-700' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${meta.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{meta.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
