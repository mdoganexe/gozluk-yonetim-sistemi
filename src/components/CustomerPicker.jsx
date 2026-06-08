import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const normalize = (s) => (s ?? '').toString().toLocaleLowerCase('tr-TR');

/**
 * Aranabilir müşteri seçici (ad, soyad, telefon, TC).
 * props: customers[], value (id), onSelect(customer|null), placeholder
 */
export default function CustomerPicker({ customers = [], value, onSelect, placeholder = 'Müşteri ara/seç…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  const selected = customers.find(c => c.id === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  const filtered = useMemo(() => {
    const q = normalize(query).trim();
    const list = q
      ? customers.filter(c => normalize(`${c.ad} ${c.soyad} ${c.telefon || ''} ${c.tc_kimlik || ''}`).includes(q))
      : customers;
    return list.slice(0, 50);
  }, [query, customers]);

  const choose = (c) => { onSelect(c); setOpen(false); setQuery(''); };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)} className="input flex items-center justify-between gap-2 text-left">
        <span className={`truncate ${selected ? '' : 'text-gray-400'}`}>
          {selected ? `${selected.ad} ${selected.soyad} — ${selected.telefon || ''}` : placeholder}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {selected && <X className="w-4 h-4 text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); choose(null); }} />}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Ad, soyad, telefon, TC ara…" className="input pl-8 py-1.5 text-sm" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Müşteri bulunamadı</p>
            ) : (
              filtered.map(c => (
                <button key={c.id} type="button" onClick={() => choose(c)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${c.id === value ? 'bg-primary-50 dark:bg-slate-700' : ''}`}>
                  <span className="font-medium truncate">{c.ad} {c.soyad}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{c.telefon}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
