/* OptikPro - tek dosyalık sunucu: dist statik dosyalarını sunar + ortak JSON veritabanı API'si.
   Aynı ağdaki tüm cihazlar (telefon/tablet/PC) bu sunucuya bağlanıp AYNI veriyi görür. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const argPort = (process.argv.find(a => a.startsWith('--port=')) || '').split('=')[1];
const noOpen = process.argv.includes('--no-open') || process.env.NO_OPEN === '1';
const PORT = parseInt(argPort || process.env.PORT || '3000', 10);
const DIST = path.join(__dirname, '..', 'dist');
// Veri dosyası: exe'nin yanına (pkg) ya da proje köküne yazılır (geliştirme)
const DATA_DIR = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, '..');
const DATA_FILE = path.join(DATA_DIR, 'optikpro-data.json');

const TABLES = ['users', 'customers', 'prescriptions', 'products', 'lens_catalog',
  'orders', 'order_items', 'payments', 'suppliers', 'stock_movements',
  'settings', 'appointments', 'expenses'];

const emptyDb = () => {
  const tables = {}; const seq = {};
  TABLES.forEach(t => { tables[t] = []; seq[t] = 0; });
  return { rev: 0, seq, tables };
};

let DB = emptyDb();

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      DB = { ...emptyDb(), ...parsed };
      // eksik tablo/seq tamamla
      TABLES.forEach(t => { if (!DB.tables[t]) DB.tables[t] = []; if (DB.seq[t] == null) DB.seq[t] = 0; });
    }
  } catch (e) { console.error('Veri okunamadı, boş başlatılıyor:', e.message); DB = emptyDb(); }
}

let saveTimer = null;
function save() {
  // sık yazımları toplulaştır + atomik yaz (çökmede dosya bozulmasın)
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const tmp = DATA_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(DB));
      fs.renameSync(tmp, DATA_FILE);
    } catch (e) { console.error('Veri yazılamadı:', e.message); }
  }, 150);
}

// Her açılışta verinin tarihli yedeğini al (son 20 tutulur)
function backupOnStart() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const dir = path.join(DATA_DIR, 'yedekler');
    fs.mkdirSync(dir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    fs.copyFileSync(DATA_FILE, path.join(dir, `optikpro-${ts}.json`));
    const files = fs.readdirSync(dir).filter(f => f.startsWith('optikpro-') && f.endsWith('.json')).sort();
    while (files.length > 20) { try { fs.unlinkSync(path.join(dir, files.shift())); } catch {} }
  } catch (e) { console.error('Yedek alınamadı:', e.message); }
}

function applyOp(op) {
  const t = op.table;
  if (!TABLES.includes(t)) throw new Error('Bilinmeyen tablo: ' + t);
  const tbl = DB.tables[t];
  let resultId, resultIds;
  if (op.type === 'add') {
    const id = ++DB.seq[t];
    tbl.push({ ...op.value, id });
    resultId = id;
  } else if (op.type === 'bulkAdd') {
    resultIds = [];
    for (const v of op.values) { const id = ++DB.seq[t]; tbl.push({ ...v, id }); resultIds.push(id); }
  } else if (op.type === 'update') {
    const r = tbl.find(x => x.id === op.id);
    if (r) Object.assign(r, op.changes);
  } else if (op.type === 'delete') {
    DB.tables[t] = tbl.filter(x => x.id !== op.id);
  } else if (op.type === 'clear') {
    DB.tables[t] = [];
  } else {
    throw new Error('Bilinmeyen işlem: ' + op.type);
  }
  DB.rev++;
  save();
  return { rev: DB.rev, id: resultId, ids: resultIds };
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.map': 'application/json', '.txt': 'text/plain; charset=utf-8'
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 50 * 1024 * 1024) reject(new Error('Çok büyük')); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // --- API ---
  if (url.startsWith('/api/')) {
    try {
      if (url === '/api/rev' && req.method === 'GET') return sendJson(res, 200, { rev: DB.rev });
      if (url === '/api/db' && req.method === 'GET') return sendJson(res, 200, { rev: DB.rev, tables: DB.tables });
      if (url === '/api/op' && req.method === 'POST') {
        const op = JSON.parse(await readBody(req));
        return sendJson(res, 200, applyOp(op));
      }
      if (url === '/api/replace' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req));
        const fresh = emptyDb();
        TABLES.forEach(t => {
          const rows = Array.isArray(body.tables?.[t]) ? body.tables[t] : [];
          fresh.tables[t] = rows;
          fresh.seq[t] = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
        });
        fresh.rev = DB.rev + 1;
        DB = fresh; save();
        return sendJson(res, 200, { rev: DB.rev });
      }
      return sendJson(res, 404, { error: 'Bilinmeyen API' });
    } catch (e) {
      return sendJson(res, 500, { error: e.message });
    }
  }

  // --- Statik (SPA) ---
  try {
    let p = decodeURIComponent(url);
    if (p === '/') p = '/index.html';
    let filePath = path.normalize(path.join(DIST, p));
    if (!filePath.startsWith(DIST)) { res.writeHead(403); return res.end('Forbidden'); }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST, 'index.html'); // SPA fallback
    }
    const ext = path.extname(filePath).toLowerCase();
    const data = fs.readFileSync(filePath);
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    // HTML asla önbelleğe alınmasın (güncelleme sonrası eski sürüm yüklenmesin);
    // hash'li asset'ler uzun süre önbelleklenebilir.
    if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else if (filePath.includes(path.sep + 'assets' + path.sep)) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }
    res.writeHead(200, headers);
    res.end(data);
  } catch (e) {
    res.writeHead(500); res.end('Sunucu hatası: ' + e.message);
  }
});

load();
backupOnStart();
server.listen(PORT, '0.0.0.0', () => {
  const ips = [];
  const nets = os.networkInterfaces();
  Object.keys(nets).forEach(n => nets[n].forEach(ni => {
    if (ni.family === 'IPv4' && !ni.internal) ips.push(ni.address);
  }));
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║            OptikPro çalışıyor             ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('  Bu bilgisayar:    http://localhost:' + PORT);
  ips.forEach(ip => console.log('  Telefon/Tablet:   http://' + ip + ':' + PORT + '   (aynı Wi-Fi ağında)'));
  console.log('');
  console.log('  Veri dosyası: ' + DATA_FILE);
  console.log('  Otomatik yedekler: ' + path.join(DATA_DIR, 'yedekler'));
  console.log('  Güncelleme: sadece OptikPro.exe değiştirilir, veri korunur.');
  console.log('  Kapatmak için bu pencereyi kapatın.');
  console.log('');
  if (process.platform === 'win32' && !noOpen) {
    exec('start "" "http://localhost:' + PORT + '"');
  }
});
