// Sipariş kalemlerini gözlük setlerine (grup_id) göre grupla.
// Eski (grup_id'siz) siparişlerde tüm kalemler "standalone" döner.
export function groupOrderItems(items) {
  const byGroup = {};
  const standalone = [];
  (items || []).forEach(it => {
    if (it.grup_id != null) {
      (byGroup[it.grup_id] = byGroup[it.grup_id] || []).push(it);
    } else {
      standalone.push(it);
    }
  });
  const groups = Object.values(byGroup).map(its => {
    const frame = its.find(i => i.kalem_tipi === 'çerçeve');
    return {
      label: its[0].grup_label || 'Gözlük',
      frame,
      items: its
    };
  });
  return { groups, standalone };
}

// Kalem tipi → okunabilir etiket
export const kalemLabel = (tip) => ({
  'çerçeve': 'Çerçeve',
  cam_sag: 'Cam (Sağ)',
  cam_sol: 'Cam (Sol)',
  cam: 'Cam',
  'güneş': 'Güneş Gözlüğü',
  aksesuar: 'Aksesuar',
  'işçilik': 'İşçilik'
}[tip] || tip);

// Sipariş için reçete kaynağı: önce anlık kopya (miras), yoksa DB'den gelen
export const prescriptionOf = (order, prescriptionFromDb) =>
  order?.recete_snapshot || prescriptionFromDb || null;
