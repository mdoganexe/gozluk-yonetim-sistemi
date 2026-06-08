// Gözlük/optik marka ve model önerileri (web araştırmasına dayalı, otomatik tamamlama için).
// Kaynaklar: EZContacts Top 25 Eyewear Brands 2025, Optical Illusions Top 10,
// Lens.com en çok satan kontakt lensler, Zeiss/Hoya/Essilor "Big 3" cam üreticileri.

// Çerçeve & güneş gözlüğü markaları (dünya + Türkiye'de yaygın)
export const FRAME_BRANDS = [
  'Ray-Ban', 'Oakley', 'Persol', 'Oliver Peoples', 'Tom Ford', 'Gucci', 'Prada',
  'Versace', 'Dolce & Gabbana', 'Giorgio Armani', 'Emporio Armani', 'Burberry',
  'Cartier', 'Dior', 'Chanel', 'Saint Laurent', 'Fendi', 'Bvlgari', 'Miu Miu',
  'Michael Kors', 'Marc Jacobs', 'Hugo Boss', 'Calvin Klein', 'Tommy Hilfiger',
  'Lacoste', 'Guess', 'Fossil', 'Diesel', 'Police', 'Carrera', 'Vogue Eyewear',
  'Vogue', 'Pierre Cardin', 'Levi\'s', 'Esprit', 'Nike', 'Adidas', 'Puma',
  'Under Armour', 'Maui Jim', 'Serengeti', 'Warby Parker', 'Mykita', 'Lindberg',
  'Silhouette', 'Rodenstock', 'Flair', 'Centro Style', 'Osse', 'Mustang', 'Hawk',
  'Aqua', 'By Charlotte', 'Twins', 'Atos Lombardini', 'Mont Blanc', 'Montblanc'
];

// Cam (oftalmik lens) üreticileri ve sık kullanılan indeks/kaplama etiketleri
export const LENS_BRANDS = [
  'Essilor', 'Varilux', 'Crizal', 'Eyezen', 'Transitions', 'Zeiss', 'Hoya',
  'Rodenstock', 'Nikon', 'Shamir', 'Seiko', 'Tokai', 'Ormix', 'Norville',
  // sık kullanılan cam türü/indeks etiketleri (cam markası alanı için)
  '1.5', '1.56', '1.6', '1.67', '1.74', '1.6 Ormix', '1.67 Ormix',
  'Blue Cut', 'Mavi Filtre', 'Fotokromik', 'Polarize', 'Antireflesh', 'Asferik'
];

// Kontakt lens markaları (reçete lens markası alanı için)
export const CONTACT_LENS_BRANDS = [
  'Acuvue', 'Acuvue Oasys', 'Acuvue Moist', '1-Day Acuvue', 'Biofinity',
  'Air Optix', 'Air Optix Aqua', 'Dailies', 'Dailies Total 1', 'Dailies AquaComfort',
  'Bausch+Lomb ULTRA', 'PureVision', 'SofLens', 'Avaira', 'Proclear', 'MyDay',
  'Clariti', 'FreshLook', 'Bella', 'Solotica', 'Optyx', 'Maxima', 'Gelflex'
];

// Bazı popüler markalar için temsili model/seri önerileri
export const BRAND_MODELS = {
  'Ray-Ban': ['Aviator', 'Wayfarer', 'New Wayfarer', 'Clubmaster', 'Round Metal', 'Justin', 'Erika', 'Hexagonal', 'Jackie Ohh', 'RB2140', 'RB3025', 'RB3016', 'RB4165', 'RB2132'],
  'Oakley': ['Holbrook', 'Frogskins', 'Radar EV', 'Flak 2.0', 'Gascan', 'Jawbreaker', 'Sutro', 'Crosslink', 'Half Jacket'],
  'Persol': ['PO0649', 'PO0714', 'PO3019', 'PO3092', 'PO0649 Original'],
  'Gucci': ['GG0010', 'GG0061', 'GG0396', 'GG0024'],
  'Prada': ['PR 01OV', 'PR 17WS', 'Linea Rossa'],
  'Tom Ford': ['FT5178', 'FT5401', 'Henry', 'Marko'],
  'Carrera': ['Champion', 'Endurance', 'Carrera 1001'],
  'Police': ['Origins', 'Lewis', 'Highway'],
  'Maui Jim': ['Peahi', 'Red Sands', 'Cliff House'],
  'Vogue Eyewear': ['VO5051', 'VO4023'],
};

// Kategoriye göre marka listesi döndür
export const brandsForCategory = (kategori) => {
  if (kategori === 'cam_stok') return LENS_BRANDS;
  // çerçeve, güneşlik, aksesuar ve diğerleri için çerçeve markaları
  return FRAME_BRANDS;
};

// Markaya göre model önerileri (büyük/küçük harf duyarsız)
export const modelsForBrand = (marka) => {
  const key = (marka || '').trim();
  if (!key) return [];
  const found = Object.keys(BRAND_MODELS).find(
    b => b.toLocaleLowerCase('tr-TR') === key.toLocaleLowerCase('tr-TR')
  );
  return found ? BRAND_MODELS[found] : [];
};
