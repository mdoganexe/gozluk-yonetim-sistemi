import { useState } from 'react';
import { X, Plus, Trash2, CreditCard, Banknote, Building2, FileText } from 'lucide-react';
import db from '../db/database';

const paymentIcons = {
  nakit: Banknote,
  kredi_karti: CreditCard,
  havale: Building2,
  veresiye: FileText
};

const paymentLabels = {
  nakit: 'Nakit',
  kredi_karti: 'Kredi Kartı',
  havale: 'Havale/EFT',
  veresiye: 'Veresiye'
};

export default function PaymentModal({ orderId, kalanTutar, onClose, onSave }) {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: Date.now(),
      tutar: kalanTutar,
      odeme_turu: 'nakit',
      aciklama: ''
    }
  ]);

  const addPaymentMethod = () => {
    const toplamOdenen = paymentMethods.reduce((sum, p) => sum + (parseFloat(p.tutar) || 0), 0);
    const kalan = kalanTutar - toplamOdenen;
    
    setPaymentMethods([
      ...paymentMethods,
      {
        id: Date.now(),
        tutar: kalan > 0 ? kalan : 0,
        odeme_turu: 'nakit',
        aciklama: ''
      }
    ]);
  };

  const removePaymentMethod = (id) => {
    if (paymentMethods.length === 1) {
      alert('En az bir ödeme yöntemi olmalıdır');
      return;
    }
    setPaymentMethods(paymentMethods.filter(p => p.id !== id));
  };

  const updatePaymentMethod = (id, field, value) => {
    setPaymentMethods(paymentMethods.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const toplamOdenen = paymentMethods.reduce((sum, p) => sum + (parseFloat(p.tutar) || 0), 0);
  const fark = toplamOdenen - kalanTutar;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (toplamOdenen === 0) {
      alert('Ödeme tutarı 0 olamaz');
      return;
    }

    if (toplamOdenen > kalanTutar) {
      if (!confirm(`Ödeme tutarı kalan tutardan ${fark.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺ fazla. Devam etmek istiyor musunuz?`)) {
        return;
      }
    }

    try {
      // Her ödeme yöntemini ayrı ayrı kaydet
      for (const payment of paymentMethods) {
        if (parseFloat(payment.tutar) > 0) {
          await db.payments.add({
            siparis_id: orderId,
            tarih: new Date().toISOString(),
            tutar: parseFloat(payment.tutar),
            odeme_turu: payment.odeme_turu,
            aciklama: payment.aciklama || `${paymentLabels[payment.odeme_turu]} ile ödeme`
          });
        }
      }

      // Sipariş toplamını güncelle
      const order = await db.orders.get(orderId);
      const yeniOdenen = (order.odenen_toplam || 0) + toplamOdenen;
      const odeme_tamamlandi = yeniOdenen >= order.genel_toplam;

      await db.orders.update(orderId, {
        odenen_toplam: yeniOdenen,
        odeme_tamamlandi
      });

      onSave();
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold">Ödeme Al</h2>
            <p className="text-sm text-gray-600">
              Kalan: ₺{kalanTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Payment Methods */}
          <div className="space-y-3">
            {paymentMethods.map((payment, index) => {
              const Icon = paymentIcons[payment.odeme_turu];
              return (
                <div key={payment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        Ödeme Yöntemi {index + 1}
                      </span>
                    </div>
                    {paymentMethods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentMethod(payment.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Ödeme Türü *</label>
                      <select
                        required
                        value={payment.odeme_turu}
                        onChange={(e) => updatePaymentMethod(payment.id, 'odeme_turu', e.target.value)}
                        className="input"
                      >
                        <option value="nakit">💵 Nakit</option>
                        <option value="kredi_karti">💳 Kredi Kartı</option>
                        <option value="havale">🏦 Havale/EFT</option>
                        <option value="veresiye">📝 Veresiye</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Tutar *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0"
                        value={payment.tutar}
                        onChange={(e) => updatePaymentMethod(payment.id, 'tutar', e.target.value)}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="label">Açıklama</label>
                    <input
                      type="text"
                      value={payment.aciklama}
                      onChange={(e) => updatePaymentMethod(payment.id, 'aciklama', e.target.value)}
                      className="input"
                      placeholder="Ödeme notu (opsiyonel)"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Payment Method Button */}
          <button
            type="button"
            onClick={addPaymentMethod}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Başka Ödeme Yöntemi Ekle
          </button>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Kalan Tutar:</span>
              <span className="font-medium">₺{kalanTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Toplam Ödeme:</span>
              <span className="font-medium">₺{toplamOdenen.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-blue-300 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Fark:</span>
              <span className={`font-bold ${fark > 0 ? 'text-orange-600' : fark < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {fark > 0 && '+'}₺{fark.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {fark > 0 && (
              <p className="text-xs text-orange-600 mt-2">
                ⚠️ Ödeme tutarı kalan tutardan fazla. Para üstü verilecek.
              </p>
            )}
            {fark < 0 && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Ödeme tutarı kalan tutardan az. Borç kalacak.
              </p>
            )}
            {fark === 0 && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Ödeme tam olarak kalan tutara eşit.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Ödeme Al ({paymentMethods.length} Yöntem)
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
