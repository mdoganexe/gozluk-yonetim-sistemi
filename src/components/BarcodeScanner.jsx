import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Keyboard, Camera } from 'lucide-react';

const REGION_ID = 'barcode-scanner-region';

/**
 * Kamera ile QR/barkod tarar. Kamera yoksa veya USB barkod okuyucu
 * kullanılıyorsa manuel/otomatik klavye girişi de kabul eder.
 * props: onScan(text), onClose
 */
export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');
  const scannerRef = useRef(null);
  const handledRef = useRef(false);

  useEffect(() => {
    let html5 = null;
    const start = async () => {
      try {
        html5 = new Html5Qrcode(REGION_ID, { verbose: false });
        scannerRef.current = html5;
        await html5.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => finish(decodedText),
          () => {} // her kareye gelen "bulunamadı" hatalarını yok say
        );
      } catch (e) {
        setError('Kamera açılamadı. USB barkod okuyucuyla veya aşağıdaki kutuya yazıp Enter ile arayabilirsiniz.');
      }
    };
    start();
    return () => {
      // Bu effect çalışmasına ait örneği durdur (StrictMode çift-mount güvenli)
      if (html5) {
        html5.stop().then(() => html5.clear()).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = async (text) => {
    if (handledRef.current) return;
    handledRef.current = true;
    try { await scannerRef.current?.stop(); } catch {}
    onScan(String(text).trim());
  };

  const submitManual = (e) => {
    e.preventDefault();
    if (manual.trim()) finish(manual);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Camera className="w-5 h-5" /> Barkod / QR Tara</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-4">
          {!error ? (
            <>
              <div id={REGION_ID} className="w-full rounded-lg overflow-hidden bg-black" style={{ minHeight: 220 }} />
              <p className="text-xs text-gray-500 text-center">Kodu kameraya gösterin; otomatik okunacaktır.</p>
            </>
          ) : (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">{error}</div>
          )}

          <form onSubmit={submitManual} className="border-t border-gray-200 pt-4">
            <label className="label flex items-center gap-2"><Keyboard className="w-4 h-4" /> Manuel / USB Okuyucu</label>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                className="input"
                placeholder="Barkod numarası… (USB okuyucu otomatik yazar)"
              />
              <button type="submit" className="btn-primary px-4">Ara</button>
            </div>
            <p className="text-xs text-gray-500 mt-1">USB barkod okuyucu bu kutuya yazıp otomatik arar.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
