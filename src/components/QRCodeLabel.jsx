import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/database';
import { productToken } from '../utils/productCode';

export default function QRCodeLabel({ product, onClose }) {
  const [dataUrl, setDataUrl] = useState('');
  const token = productToken(product);
  const settings = useLiveQuery(() => db.settings.toArray());
  const companyName = settings?.find(s => s.key === 'companyName')?.value || 'OptikPro';

  useEffect(() => {
    QRCode.toDataURL(token, { width: 260, margin: 1, errorCorrectionLevel: 'M' })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [token]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Yazdırma stili: sadece etiketi göster */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qrLabelArea, #qrLabelArea * { visibility: visible; }
          #qrLabelArea { position: absolute; left: 0; top: 0; }
          @page { size: 50mm 30mm; margin: 2mm; }
        }
      `}</style>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between no-print">
          <h2 className="text-lg font-semibold">Ürün Etiketi (QR)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6">
          {/* Etiketin kendisi (yazdırılan kısım) */}
          <div id="qrLabelArea" className="mx-auto bg-white text-black border border-gray-300 rounded-lg p-3 text-center" style={{ width: 220 }}>
            <div style={{ fontSize: 10, fontWeight: 700 }}>{companyName}</div>
            {dataUrl
              ? <img src={dataUrl} alt="QR" style={{ width: 150, height: 150, margin: '4px auto' }} />
              : <div style={{ width: 150, height: 150, margin: '4px auto' }} className="bg-gray-100" />}
            <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}>{product.marka} {product.model}</div>
            {product.renk && <div style={{ fontSize: 10 }}>{product.renk}</div>}
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
              ₺{(product.satis_fiyati || 0).toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', marginTop: 2 }}>{token}</div>
            {product.raf_konumu && <div style={{ fontSize: 9 }}>Raf: {product.raf_konumu}</div>}
          </div>

          <div className="flex gap-3 mt-6 no-print">
            <button onClick={() => window.print()} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Printer className="w-5 h-5" /> Etiketi Yazdır
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">Kapat</button>
          </div>
        </div>
      </div>
    </div>
  );
}
