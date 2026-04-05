import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertTriangle, Package } from 'lucide-react';
import db from '../../db/database';
import ProductModal from '../../components/ProductModal';

export default function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const products = useLiveQuery(() => db.products.toArray());

  const filteredProducts = products?.filter(product => {
    const matchesSearch = 
      product.marka?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barkod?.includes(searchTerm) ||
      product.sku?.includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'all' || product.kategori === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products?.filter(p => p.stok_adedi <= (p.min_stok_uyari || 5)).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stok Yönetimi</h1>
          {lowStockCount > 0 && (
            <p className="text-orange-600 flex items-center gap-2 mt-1">
              <AlertTriangle className="w-4 h-4" />
              {lowStockCount} ürün düşük stokta
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Ürün
        </button>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Marka, model, barkod veya SKU ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'çerçeve', 'güneşlik', 'aksesuar', 'cam_stok'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat === 'all' ? 'Tümü' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ürün</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Barkod/SKU</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Stok</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Fiyat</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts?.map(product => {
                const isLowStock = product.stok_adedi <= (product.min_stok_uyari || 5);
                
                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{product.marka} {product.model}</div>
                        {product.renk && (
                          <div className="text-sm text-gray-600">{product.renk}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {product.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="text-sm">
                        {product.barkod && <div>B: {product.barkod}</div>}
                        {product.sku && <div>SKU: {product.sku}</div>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium ${
                        isLowStock 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isLowStock && <AlertTriangle className="w-4 h-4" />}
                        {product.stok_adedi}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ₺{product.satis_fiyati?.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/products/${product.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Detay
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {(!filteredProducts || filteredProducts.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              {searchTerm || categoryFilter !== 'all' 
                ? 'Arama sonucu bulunamadı' 
                : 'Henüz ürün kaydı yok'
              }
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          onClose={() => setShowModal(false)}
          onSave={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
