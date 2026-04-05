import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Edit, Package } from 'lucide-react';
import db from '../../db/database';
import ProductModal from '../../components/ProductModal';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const product = useLiveQuery(() => db.products.get(parseInt(id)));
  const movements = useLiveQuery(() =>
    db.stock_movements.where('urun_id').equals(parseInt(id)).reverse().toArray()
  );

  if (!product) return <div>Yükleniyor...</div>;

  const isLowStock = product.stok_adedi <= (product.min_stok_uyari || 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/products')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.marka} {product.model}
            </h1>
            <p className="text-gray-600">{product.kategori}</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Düzenle
        </button>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-semibold mb-4">Ürün Bilgileri</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Marka</p>
              <p className="font-medium">{product.marka}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Model</p>
              <p className="font-medium">{product.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kategori</p>
              <p className="font-medium">{product.kategori}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Renk</p>
              <p className="font-medium">{product.renk || '-'}</p>
            </div>
            {product.barkod && (
              <div>
                <p className="text-sm text-gray-600">Barkod</p>
                <p className="font-medium">{product.barkod}</p>
              </div>
            )}
            {product.sku && (
              <div>
                <p className="text-sm text-gray-600">SKU</p>
                <p className="font-medium">{product.sku}</p>
              </div>
            )}
            {product.raf_konumu && (
              <div>
                <p className="text-sm text-gray-600">Raf Konumu</p>
                <p className="font-medium">{product.raf_konumu}</p>
              </div>
            )}
          </div>

          {(product.kategori === 'çerçeve' || product.kategori === 'güneşlik') && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Çerçeve Özellikleri</h3>
              <div className="grid grid-cols-3 gap-4">
                {product.cerceve_beden_lens && (
                  <div>
                    <p className="text-sm text-gray-600">Lens</p>
                    <p className="font-medium">{product.cerceve_beden_lens} mm</p>
                  </div>
                )}
                {product.cerceve_beden_kopru && (
                  <div>
                    <p className="text-sm text-gray-600">Köprü</p>
                    <p className="font-medium">{product.cerceve_beden_kopru} mm</p>
                  </div>
                )}
                {product.cerceve_beden_sap && (
                  <div>
                    <p className="text-sm text-gray-600">Sap</p>
                    <p className="font-medium">{product.cerceve_beden_sap} mm</p>
                  </div>
                )}
                {product.cerceve_malzeme && (
                  <div>
                    <p className="text-sm text-gray-600">Malzeme</p>
                    <p className="font-medium">{product.cerceve_malzeme}</p>
                  </div>
                )}
                {product.cinsiyet && (
                  <div>
                    <p className="text-sm text-gray-600">Cinsiyet</p>
                    <p className="font-medium">{product.cinsiyet}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Stock Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Stok Durumu
            </h2>
            <div className={`text-center p-6 rounded-lg ${
              isLowStock ? 'bg-orange-50' : 'bg-green-50'
            }`}>
              <p className="text-sm text-gray-600 mb-2">Mevcut Stok</p>
              <p className={`text-4xl font-bold ${
                isLowStock ? 'text-orange-600' : 'text-green-600'
              }`}>
                {product.stok_adedi}
              </p>
              {isLowStock && (
                <p className="text-sm text-orange-600 mt-2">Düşük Stok!</p>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Min. Stok Uyarı: {product.min_stok_uyari || 5}</p>
            </div>
          </div>

          {/* Price Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Fiyat Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Alış Fiyatı</p>
                <p className="text-lg font-medium">
                  ₺{product.alis_fiyati?.toLocaleString('tr-TR') || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Satış Fiyatı</p>
                <p className="text-2xl font-bold text-primary-600">
                  ₺{product.satis_fiyati?.toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">KDV Oranı</p>
                <p className="font-medium">%{product.kdv_orani || 20}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Movements */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Stok Hareketleri</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Hareket</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Miktar</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Önceki</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Sonraki</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {movements?.map(movement => (
                <tr key={movement.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm">
                    {new Date(movement.tarih).toLocaleString('tr-TR')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      movement.hareket_tipi === 'giris' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {movement.hareket_tipi}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium">
                    {movement.hareket_tipi === 'giris' ? '+' : '-'}{movement.miktar}
                  </td>
                  <td className="py-3 px-4 text-center">{movement.onceki_stok}</td>
                  <td className="py-3 px-4 text-center font-medium">{movement.sonraki_stok}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{movement.aciklama}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!movements || movements.length === 0) && (
            <p className="text-center py-8 text-gray-500">Henüz stok hareketi yok</p>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={product}
          onClose={() => setShowModal(false)}
          onSave={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
