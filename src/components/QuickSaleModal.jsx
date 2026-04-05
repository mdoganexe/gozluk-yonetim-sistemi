import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Glasses, Eye } from 'lucide-react';

export default function QuickSaleModal({ customer, onClose }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const handleSelection = (type) => {
    setSelectedType(type);
    
    // Kısa bir animasyon için bekle
    setTimeout(() => {
      if (type === 'gozluk') {
        // Gözlük satışı - Önce reçete ekle, sonra sipariş
        navigate(`/customers/${customer.id}?action=prescription&next=order`);
      } else {
        // Sadece lens - Direkt sipariş (cam seçimi)
        navigate(`/orders/new?customer=${customer.id}&type=lens`);
      }
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Hızlı Satış</h2>
            <p className="text-sm text-gray-600 mt-1">
              {customer.ad} {customer.soyad} için satış türünü seçin
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6 text-center">
            Müşteri ne satın almak istiyor?
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Gözlük Satışı */}
            <button
              onClick={() => handleSelection('gozluk')}
              className={`group relative p-8 border-2 rounded-xl transition-all ${
                selectedType === 'gozluk'
                  ? 'border-primary-500 bg-primary-50 scale-105'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full transition-colors ${
                  selectedType === 'gozluk'
                    ? 'bg-primary-500'
                    : 'bg-gray-100 group-hover:bg-primary-100'
                }`}>
                  <Glasses className={`w-12 h-12 ${
                    selectedType === 'gozluk'
                      ? 'text-white'
                      : 'text-gray-600 group-hover:text-primary-600'
                  }`} />
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Gözlük Satışı
                  </h3>
                  <p className="text-sm text-gray-600">
                    Çerçeve + Cam
                  </p>
                </div>

                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>✓ Reçete girişi</p>
                  <p>✓ Çerçeve seçimi</p>
                  <p>✓ Cam seçimi</p>
                  <p>✓ Tam sipariş</p>
                </div>
              </div>

              {selectedType === 'gozluk' && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            {/* Sadece Lens */}
            <button
              onClick={() => handleSelection('lens')}
              className={`group relative p-8 border-2 rounded-xl transition-all ${
                selectedType === 'lens'
                  ? 'border-green-500 bg-green-50 scale-105'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full transition-colors ${
                  selectedType === 'lens'
                    ? 'bg-green-500'
                    : 'bg-gray-100 group-hover:bg-green-100'
                }`}>
                  <Eye className={`w-12 h-12 ${
                    selectedType === 'lens'
                      ? 'text-white'
                      : 'text-gray-600 group-hover:text-green-600'
                  }`} />
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sadece Lens
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cam Değişimi
                  </p>
                </div>

                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>✓ Reçete girişi</p>
                  <p>✓ Cam seçimi</p>
                  <p>✓ Hızlı sipariş</p>
                  <p className="text-transparent">✓ -</p>
                </div>
              </div>

              {selectedType === 'lens' && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 İpucu:</strong> Gözlük satışı için önce reçete girişi yapılacak, 
              sonra çerçeve ve cam seçimi ile sipariş oluşturulacak.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              İptal (Daha Sonra)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
