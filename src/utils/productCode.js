// Ürün QR/barkod kod yardımcıları

// QR'a yazılacak token: barkod varsa onu, yoksa "PRD-<id>" kullan
export const productToken = (p) => (p?.barkod && String(p.barkod).trim())
  ? String(p.barkod).trim()
  : `PRD-${p?.id}`;

// Okutulan/yazılan koda göre ürünü bul (barkod, sku, PRD-id veya ham id)
export const findProductByCode = (products, code) => {
  if (!products || !code) return null;
  const c = String(code).trim();
  const m = c.match(/^PRD[-:]?(\d+)$/i);
  if (m) return products.find(p => p.id === parseInt(m[1])) || null;
  return (
    products.find(p => p.barkod && String(p.barkod).trim() === c) ||
    products.find(p => p.sku && String(p.sku).trim() === c) ||
    products.find(p => String(p.id) === c) ||
    null
  );
};

// Mağaza içi barkod üret (13 haneli, taranabilir)
export const generateBarcode = () => {
  const rnd = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return ('20' + String(Date.now()).slice(-9) + rnd).slice(0, 13);
};
