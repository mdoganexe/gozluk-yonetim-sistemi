import { useEffect, useRef } from 'react';
import { filesToImages } from './image';

/**
 * Ctrl+V ile panodaki resmi yakalar. onImages(compressedImages[]) çağrılır.
 * enabled=false iken dinlemez (üstte başka bir modal açıkken çakışmasın diye).
 */
export function usePasteImages(onImages, { enabled = true, maxSize = 1400, quality = 0.8 } = {}) {
  const ref = useRef(onImages);
  ref.current = onImages;

  useEffect(() => {
    if (!enabled) return;
    const handler = async (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      const files = [];
      for (const it of items) {
        if (it.kind === 'file' && it.type && it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length === 0) return; // metin yapıştırmayı etkileme
      e.preventDefault();
      try {
        const imgs = await filesToImages(files, maxSize, quality);
        if (imgs.length) ref.current(imgs);
      } catch { /* yok say */ }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [enabled, maxSize, quality]);
}

/**
 * "Yapıştır" butonu için: panodaki resmi async clipboard API ile okur.
 * Yalnızca güvenli bağlam (localhost/HTTPS) + izin verildiğinde çalışır.
 */
export async function readClipboardImages(maxSize = 1400, quality = 0.8) {
  if (!navigator.clipboard || !navigator.clipboard.read) {
    throw new Error('Tarayıcı pano okumayı desteklemiyor. Ctrl+V kullanın.');
  }
  const items = await navigator.clipboard.read();
  const files = [];
  for (const item of items) {
    const type = item.types.find(t => t.startsWith('image/'));
    if (type) {
      const blob = await item.getType(type);
      files.push(new File([blob], 'pano.png', { type }));
    }
  }
  return filesToImages(files, maxSize, quality);
}
