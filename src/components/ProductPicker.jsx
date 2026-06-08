import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, AlertTriangle, ScanLine } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import { findProductByCode } from '../utils/productCode';

const normalize = (s) => (s ?? '').toString().toLocaleLowerCase('tr-TR');

/**
 * Aranabilir (büyüteçli) ürün seçici. Stoğu biten ürünler seçilemez.
 * props: products[], value (urun_id), onSelect(product|null), placeholder
 */
export default function ProductPicker({ products = [], value, onSelect, placeholder = 'Ürün seç…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const handleScan = (code) => {
    setScanning(false);
    const found = findProductByCode(products, code);
    if (found) {
      choose(found);
    } else {
      setOpen(true);
      setQuery(code);
      alert(`"${code}" bu listede bulunamadı (stokta/aktif değil olabilir).`);
    }
  };

  const selected = products.find(p => p.id === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const filtered = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return products;
    return products.filter(p =>
      normalize(`${p.marka} ${p.model} ${p.barkod || ''} ${p.sku || ''} ${p.renk || ''}`).includes(q)
    );
  }, [query, products]);

  const choose = (p) => {
    onSelect(p);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input flex items-center justify-between gap-2 text-left"
      >
        <span className={`truncate ${selected ? '' : 'text-gray-400'}`}>
          {selected ? `${selected.marka} ${selected.model}` : placeholder}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
              onClick={(e) => { e.stopPropagation(); choose(null); }}
            />
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </button>

      {selected && (
        <p className="text-xs mt-1 flex items-center gap-1">
          <span className="text-gray-500">Stok: {selected.stok_adedi}</span>
          {selected.stok_adedi <= (selected.min_stok_uyari || 5) && (
            <span className="text-orange-600 flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> düşük
            </span>
          )}
        </p>
      )}

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-slate-700 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Marka, model, barkod ara…"
                className="input pl-8 py-1.5 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setScanning(true)}
              title="Barkod/QR tara"
              className="btn-secondary px-2.5 flex items-center"
            >
              <ScanLine className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Ürün bulunamadı</p>
            ) : (
              filtered.map(p => {
                const out = p.stok_adedi === 0;
                const low = !out && p.stok_adedi <= (p.min_stok_uyari || 5);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={out}
                    onClick={() => choose(p)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                      out ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    } ${p.id === value ? 'bg-primary-50 dark:bg-slate-700' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.marka} {p.model}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {p.renk && `${p.renk} · `}₺{(p.satis_fiyati || 0).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <span className={`text-xs flex-shrink-0 ml-2 ${out ? 'text-red-600' : low ? 'text-orange-600' : 'text-green-600'}`}>
                      {out ? 'STOK YOK' : `Stok: ${p.stok_adedi}${low ? ' ⚠' : ''}`}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {scanning && (
        <BarcodeScanner onScan={handleScan} onClose={() => setScanning(false)} />
      )}
    </div>
  );
}
