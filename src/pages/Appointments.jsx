import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Plus, CalendarClock, Check, Edit, Trash2, Clock, User } from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import db from '../db/database';
import AppointmentModal, { APPOINTMENT_TYPES } from '../components/AppointmentModal';

const typeColors = {
  muayene: 'bg-blue-100 text-blue-700',
  teslim: 'bg-green-100 text-green-700',
  hatirlatma: 'bg-orange-100 text-orange-700',
  kontrol: 'bg-purple-100 text-purple-700',
  diger: 'bg-gray-100 text-gray-700'
};

export default function Appointments() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('bekliyor'); // bekliyor | tumu | tamamlandi

  const appointments = useLiveQuery(() => db.appointments.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());

  const customerName = (id) => {
    if (!id) return null;
    const c = customers?.find(x => x.id === id);
    return c ? `${c.ad} ${c.soyad}` : null;
  };

  const sorted = (appointments || [])
    .filter(a => {
      if (filter === 'tumu') return true;
      if (filter === 'tamamlandi') return a.durum === 'tamamlandi';
      return a.durum === 'bekliyor';
    })
    .sort((a, b) => (a.tarih + (a.saat || '')).localeCompare(b.tarih + (b.saat || '')));

  const markDone = async (id) => {
    await db.appointments.update(id, { durum: 'tamamlandi' });
  };

  const remove = async (id) => {
    if (confirm('Bu randevu silinsin mi?')) {
      await db.appointments.delete(id);
    }
  };

  const dateBadge = (a) => {
    const d = parseISO(a.tarih);
    if (a.durum === 'bekliyor' && isPast(d) && !isToday(d)) {
      return <span className="text-xs text-red-600 font-medium">Geçti</span>;
    }
    if (isToday(d)) {
      return <span className="text-xs text-green-600 font-medium">Bugün</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarClock className="w-8 h-8 text-primary-600" />
          Randevular & Hatırlatmalar
        </h1>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Randevu
        </button>
      </div>

      {/* Filtre */}
      <div className="flex gap-2">
        {[
          { key: 'bekliyor', label: 'Bekleyen' },
          { key: 'tamamlandi', label: 'Tamamlanan' },
          { key: 'tumu', label: 'Tümü' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.key ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="card">
        <div className="space-y-3">
          {sorted.map(a => {
            const name = customerName(a.musteri_id);
            const done = a.durum === 'tamamlandi';
            return (
              <div
                key={a.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  done ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="text-center flex-shrink-0 w-16">
                    <p className="text-sm font-bold text-gray-900">
                      {format(parseISO(a.tarih), 'dd MMM', { locale: tr })}
                    </p>
                    {a.saat && (
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-0.5">
                        <Clock className="w-3 h-3" />{a.saat}
                      </p>
                    )}
                    {dateBadge(a)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[a.tip] || typeColors.diger}`}>
                        {APPOINTMENT_TYPES[a.tip] || a.tip}
                      </span>
                      {done && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          Tamamlandı
                        </span>
                      )}
                    </div>
                    {name && (
                      <Link
                        to={`/customers/${a.musteri_id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1"
                      >
                        <User className="w-3.5 h-3.5" />{name}
                      </Link>
                    )}
                    {a.aciklama && <p className="text-sm text-gray-600 mt-1">{a.aciklama}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!done && (
                    <button
                      onClick={() => markDone(a.id)}
                      title="Tamamlandı olarak işaretle"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => { setEditing(a); setShowModal(true); }}
                    title="Düzenle"
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    title="Sil"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CalendarClock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              {filter === 'bekliyor' ? 'Bekleyen randevu yok' : 'Kayıt bulunamadı'}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AppointmentModal
          appointment={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
