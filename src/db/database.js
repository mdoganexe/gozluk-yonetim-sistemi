/* Ortak (sunucu tabanlı) veri katmanı.
   Dexie/IndexedDB yerine, aynı API yüzeyini sunar ama veriyi sunucudaki ortak
   JSON veritabanından okur/yazar. Böylece aynı ağdaki tüm cihazlar AYNI veriyi görür.
   Tüm uygulama kodu değişmeden çalışmaya devam eder (db.x.where().equals()... vb). */

const TABLES = ['users', 'customers', 'prescriptions', 'products', 'lens_catalog',
  'orders', 'order_items', 'payments', 'suppliers', 'stock_movements',
  'settings', 'appointments', 'expenses'];

// Bellek içi yansıma (sunucudan yüklenir, yazımlarda güncellenir)
const store = {};
TABLES.forEach(t => { store[t] = []; });

let serverRev = -1;
let version = 0;
const listeners = new Set();
function bump() { version++; listeners.forEach(l => { try { l(); } catch {} }); }

export function subscribe(l) { listeners.add(l); return () => listeners.delete(l); }
export function getVersion() { return version; }

const clone = (r) => (r ? { ...r } : r);
const cloneArr = (a) => a.map(clone);

function cmp(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'tr');
}

// --- Sunucu iletişimi ---
async function apiOp(o) {
  const res = await fetch('/api/op', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o)
  });
  if (!res.ok) throw new Error('Sunucu hatası (' + res.status + ')');
  const data = await res.json();
  serverRev = data.rev;
  return data;
}

// --- Sorgu (Collection) ---
class Query {
  constructor(name) { this.name = name; this._filters = []; this._sortBy = null; this._reverse = false; }
  _rows() {
    let rows = store[this.name].slice();
    for (const f of this._filters) rows = rows.filter(f);
    if (this._sortBy) { const k = this._sortBy; rows.sort((a, b) => cmp(a[k], b[k])); }
    if (this._reverse) rows.reverse();
    return rows;
  }
  filter(fn) { this._filters.push(fn); return this; }
  and(fn) { this._filters.push(fn); return this; }
  reverse() { this._reverse = !this._reverse; return this; }
  async toArray() { return cloneArr(this._rows()); }
  async first() { const r = this._rows()[0]; return r ? clone(r) : undefined; }
  async count() { return this._rows().length; }
  async sortBy(field) { this._sortBy = field; return cloneArr(this._rows()); }
  async each(cb) { this._rows().forEach(r => cb(clone(r))); }
  async modify(changes) {
    const rows = this._rows();
    for (const r of rows) {
      let ch;
      if (typeof changes === 'function') { const m = { ...r }; changes(m); const { id, ...rest } = m; ch = rest; }
      else ch = changes;
      await apiOp({ type: 'update', table: this.name, id: r.id, changes: ch });
      const local = store[this.name].find(x => x.id === r.id);
      if (local) Object.assign(local, ch);
    }
    bump();
  }
}

function whereClause(name, field) {
  const make = (pred) => { const q = new Query(name); q.filter(r => pred(r[field])); return q; };
  return {
    equals: (v) => make(x => x === v),
    anyOf: (arr) => make(x => arr.includes(x)),
    between: (a, b, incLower = true, incUpper = true) => make(x =>
      (incLower ? x >= a : x > a) && (incUpper ? x <= b : x < b)),
    startsWith: (s) => make(x => String(x ?? '').startsWith(s)),
    above: (v) => make(x => x > v),
    below: (v) => make(x => x < v),
  };
}

function makeTable(name) {
  return {
    name,
    toArray: async () => cloneArr(store[name]),
    get: async (id) => { const r = store[name].find(x => x.id === id); return r ? clone(r) : undefined; },
    add: async (value) => {
      const { id } = await apiOp({ type: 'add', table: name, value });
      store[name].push({ ...value, id }); bump(); return id;
    },
    bulkAdd: async (values) => {
      const { ids } = await apiOp({ type: 'bulkAdd', table: name, values });
      values.forEach((v, i) => store[name].push({ ...v, id: ids[i] })); bump(); return ids;
    },
    update: async (id, changes) => {
      await apiOp({ type: 'update', table: name, id, changes });
      const r = store[name].find(x => x.id === id); if (r) Object.assign(r, changes); bump(); return r ? 1 : 0;
    },
    delete: async (id) => {
      await apiOp({ type: 'delete', table: name, id });
      store[name] = store[name].filter(x => x.id !== id); bump();
    },
    clear: async () => { await apiOp({ type: 'clear', table: name }); store[name] = []; bump(); },
    count: async () => store[name].length,
    where: (field) => whereClause(name, field),
    orderBy: (field) => { const q = new Query(name); q._sortBy = field; return q; },
    filter: (fn) => new Query(name).filter(fn),
    toCollection: () => new Query(name),
  };
}

const _tables = {};
TABLES.forEach(t => { _tables[t] = makeTable(t); });

export const db = {
  ..._tables,
  tables: TABLES.map(t => _tables[t]),
  // Basit transaction: küçük tek-mağaza uygulaması için callback'i çalıştırır
  transaction: async (_mode, _tables, cb) => cb(),
};

// --- Başlatma & senkron ---
let pollTimer = null;
export async function initDB() {
  const res = await fetch('/api/db');
  if (!res.ok) throw new Error('Sunucuya bağlanılamadı');
  const data = await res.json();
  TABLES.forEach(t => { store[t] = data.tables[t] || []; });
  serverRev = data.rev;
  bump();
  if (!pollTimer) {
    pollTimer = setInterval(async () => {
      try {
        const r = await (await fetch('/api/rev')).json();
        if (r.rev !== serverRev) {
          const d = await (await fetch('/api/db')).json();
          TABLES.forEach(t => { store[t] = d.tables[t] || []; });
          serverRev = d.rev;
          bump();
        }
      } catch { /* ağ kesintisi - sessizce geç */ }
    }, 2500);
  }
}

// --- Ayar yardımcıları ---
export const SETTINGS_DEFAULTS = {
  companyName: 'OptikPro',
  companySlogan: 'Gözlük ve Optik Ürünler',
  companyPhone: '0XXX XXX XX XX',
  companyAddress: 'Adres Bilgisi',
  companyTaxNo: 'XXXXXXXXXX',
  companyEmail: 'info@optikpro.com',
  kdvOrani: 20,
  hatirlatmaAyi: 12
};

export const getSettings = async () => {
  const rows = await db.settings.toArray();
  const obj = { ...SETTINGS_DEFAULTS };
  rows.forEach(s => { obj[s.key] = s.value; });
  obj.kdvOrani = parseFloat(obj.kdvOrani) || 0;
  return obj;
};

export const getSetting = async (key) => {
  const row = await db.settings.where('key').equals(key).first();
  return row ? row.value : SETTINGS_DEFAULTS[key];
};

// --- Fiş no ---
export const generateFisNo = async () => {
  const year = new Date().getFullYear();
  const orders = await db.orders.where('fis_no').startsWith(`OPT-${year}`).toArray();
  const lastNumber = orders.length > 0
    ? Math.max(...orders.map(o => parseInt(o.fis_no.split('-')[2]) || 0))
    : 0;
  return `OPT-${year}-${String(lastNumber + 1).padStart(5, '0')}`;
};

// --- Stok ---
export const updateStock = async (urun_id, miktar, hareket_tipi, referans_id, aciklama) => {
  const product = await db.products.get(urun_id);
  if (!product) throw new Error('Ürün bulunamadı');
  const onceki_stok = Number(product.stok_adedi) || 0;
  const adet = Number(miktar) || 0;
  const sonraki_stok = hareket_tipi === 'cikis' ? onceki_stok - adet : onceki_stok + adet;
  await db.products.update(urun_id, { stok_adedi: sonraki_stok });
  await db.stock_movements.add({
    urun_id, hareket_tipi, miktar: adet, onceki_stok, sonraki_stok,
    referans_id, aciklama, tarih: new Date().toISOString()
  });
  return sonraki_stok;
};

// --- Yedekleme ---
export const exportData = async () => {
  const data = { version: 4, exportDate: new Date().toISOString() };
  for (const t of TABLES) data[t] = await db[t].toArray();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gozluk-yedek-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = async (file) => {
  const text = await file.text();
  const data = JSON.parse(text);
  const tables = {};
  TABLES.forEach(t => { tables[t] = Array.isArray(data[t]) ? data[t] : []; });
  const res = await fetch('/api/replace', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tables })
  });
  if (!res.ok) throw new Error('İçe aktarma başarısız');
  return 'Veri başarıyla içe aktarıldı';
};

export default db;
