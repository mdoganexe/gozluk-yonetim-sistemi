// Reçete kullanım türleri (bir kişide uzak/yakın gibi birden çok gözlük olabilir)
export const PRESCRIPTION_USAGE = {
  uzak: 'Uzak',
  yakin: 'Yakın',
  progresif: 'Progresif (Uzak+Yakın)',
  okuma: 'Okuma',
  bilgisayar: 'Bilgisayar',
  diger: 'Diğer',
};

export const usageLabel = (k) => PRESCRIPTION_USAGE[k] || (k || '');
