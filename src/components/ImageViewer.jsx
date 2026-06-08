import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const ImageViewerContext = createContext(null);

export function useImageViewer() {
  return useContext(ImageViewerContext);
}

// Uygulama genelinde görsel önizleme (lightbox). data: URL'leri yeni sekmede
// açmak tarayıcılarca engellendiği için tüm görseller bununla açılır.
export function ImageViewerProvider({ children }) {
  const [images, setImages] = useState(null); // [{dataUrl, name}]
  const [index, setIndex] = useState(0);

  const openImages = useCallback((imgs, start = 0) => {
    const arr = (Array.isArray(imgs) ? imgs : [imgs])
      .map(i => (typeof i === 'string' ? { dataUrl: i } : i))
      .filter(i => i && i.dataUrl);
    if (arr.length === 0) return;
    setIndex(Math.min(Math.max(0, start), arr.length - 1));
    setImages(arr);
  }, []);

  const openImage = useCallback((img) => openImages([img], 0), [openImages]);
  const close = useCallback(() => setImages(null), []);

  const prev = useCallback(() => setIndex(i => (images ? (i - 1 + images.length) % images.length : 0)), [images]);
  const next = useCallback(() => setIndex(i => (images ? (i + 1) % images.length : 0)), [images]);

  useEffect(() => {
    if (!images) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images, close, prev, next]);

  const current = images && images[index];

  return (
    <ImageViewerContext.Provider value={{ openImages, openImage }}>
      {children}
      {current && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          <button onClick={close} title="Kapat (Esc)"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
            <X className="w-8 h-8" />
          </button>

          <a href={current.dataUrl} download={current.name || 'gorsel.jpg'} onClick={(e) => e.stopPropagation()}
            title="İndir" className="absolute top-4 left-4 text-white/80 hover:text-white p-2">
            <Download className="w-7 h-7" />
          </a>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 md:left-6 text-white/80 hover:text-white p-2 bg-white/10 rounded-full">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 md:right-6 text-white/80 hover:text-white p-2 bg-white/10 rounded-full">
                <ChevronRight className="w-8 h-8" />
              </button>
              <div className="absolute bottom-4 text-white/80 text-sm">
                {index + 1} / {images.length}
              </div>
            </>
          )}

          <img
            src={current.dataUrl}
            alt={current.name || ''}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </ImageViewerContext.Provider>
  );
}
