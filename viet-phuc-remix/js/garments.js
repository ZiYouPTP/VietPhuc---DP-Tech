// Geometry definitions are design mockups. No historical reconstruction is asserted.
export const MATERIALS_ALLOWED = ['silk', 'linen', 'brocade', 'velvet'];
export const PATTERNS = ['plain', 'lotus', 'crane', 'cloud', 'brocade', 'dots', 'stripes'];

const culturalInfo = (name) => ({
  sources: [],
  needsVerification: true,
  text: `${name}: bản phối minh họa do ứng dụng dựng bằng code. Chưa có nguồn đối chiếu cấu tạo, niên đại hoặc quy tắc sử dụng; cần bổ sung nguồn và người thẩm định trước khi giới thiệu như phục dựng văn hóa.`,
  textEn: `${name}: a code-generated styling mockup. Construction and cultural context require source references and expert review before presenting it as a historical reconstruction.`,
});
const top = {
  category: 'top', slot: 'outer', materialsAllowed: MATERIALS_ALLOWED, texturesAllowed: PATTERNS,
  colorZones: ['main', 'trim'], tags: {events: ['tet', 'graduation', 'yearbook'], regions: [], seasons: ['all']},
};
const detail = (kind, options = {}) => ({kind, ...options});
const shell = {regions: [1, 2], minY: 1.015, maxY: 1.50, sleeve: {length: 'long', shoulder: {bridge: true, innerReach: 0.071, innerDrop: 0.025, crestLift: 0.008, reachDown: 0.36, radius: 0.064, innerRadius: 0.050, ease: 0.012, rows: 14, columns: 24}}, ease: [[0.80, 0.025], [1.02, 0.009], [1.30, 0.010], [1.44, 0.011], [1.51, 0.009]], smoothing: 2, thickness: 0.0012};

export const GARMENTS = [
  {
    ...top, id: 'ao-dai', name: 'Áo dài', nameVi: 'Áo dài', nameEn: 'Áo dài', nameVI: 'Áo dài', nameEN: 'Áo dài',
    defaultColor: '#b93045', defaultMaterial: 'silk', recommendedItems: ['trousers'],
    generator: {
      type: 'top', shell: {...shell},
      collar: {type: 'standing', height: 0.045, radius: 0.067, thickness: 0.002},
      hem: {startY: 1.03, endY: 0.22, flare: 0.065, depthFlareScale: 0.30, panels: [{from: -70, to: 70, layer: 0}, {from: 110, to: 250, layer: 0}], rows: 18, columns: 22},
      layers: 1, thickness: 0.0012,
      details: [detail('piping', {path: 'collar', color: '#e7c78b'}), detail('buttons', {x: 0.104, fromY: 1.395, toY: 1.055, count: 6, radius: 0.009, color: '#d5af69'}), detail('piping', {path: 'diagonal', color: '#d5af69'})],
    }, culturalInfo: culturalInfo('Áo dài'),
  },
  {
    ...top, id: 'ao-tu-than', name: 'Áo tứ thân', nameVi: 'Áo tứ thân', nameEn: 'Four-panel tunic', nameVI: 'Áo tứ thân', nameEN: 'Four-panel tunic',
    defaultColor: '#754752', defaultMaterial: 'linen', recommendedItems: ['trousers', 'inner-yem', 'silk-belt'],
    generator: {
      type: 'top', shell: {...shell, openFront: 0.26, ease: [[0.8, 0.025], [1.02, 0.017], [1.3, 0.016], [1.44, 0.014]]},
      collar: {type: 'open', height: 0.018, thickness: 0.003},
      hem: {startY: 1.04, endY: 0.28, flare: 0.13, panels: [{from: -82, to: -12, layer: 0}, {from: 12, to: 82, layer: 0}, {from: 98, to: 180, layer: 0}, {from: 181, to: 262, layer: 0}], rows: 18, columns: 14},
      layers: 1, thickness: 0.0018,
      details: [detail('piping', {path: 'open-front', color: '#d0a970'})],
    }, culturalInfo: culturalInfo('Áo tứ thân'),
  },
  {
    ...top, id: 'ao-ngu-than', name: 'Áo ngũ thân', nameVi: 'Áo ngũ thân', nameEn: 'Five-panel tunic', nameVI: 'Áo ngũ thân', nameEN: 'Five-panel tunic',
    defaultColor: '#164d54', defaultMaterial: 'brocade', recommendedItems: ['trousers'],
    generator: {
      type: 'top', shell: {...shell, ease: [[0.8, 0.035], [1.02, 0.025], [1.3, 0.020], [1.44, 0.018]]},
      collar: {type: 'standing', height: 0.041, radius: 0.069, thickness: 0.0025},
      hem: {startY: 1.04, endY: 0.31, flare: 0.115, panels: [{from: -86, to: 18, layer: 0}, {from: 14, to: 87, layer: 1}, {from: 93, to: 181, layer: 0}, {from: 179, to: 267, layer: 0}, {from: -17, to: 34, layer: -1}], rows: 18, columns: 17},
      overlay: {fromY: 1.06, toY: 1.39, fromAngle: -26, toAngle: 35, offset: 0.007},
      layers: 2, thickness: 0.002,
      details: [detail('buttons', {x: 0.105, fromY: 1.395, toY: 1.065, count: 5, radius: 0.010, color: '#c9a258'}), detail('piping', {path: 'diagonal', color: '#baa471'})],
    }, culturalInfo: culturalInfo('Áo ngũ thân'),
  },
  {
    ...top, id: 'ao-ba-ba', name: 'Áo bà ba', nameVi: 'Áo bà ba', nameEn: 'Bà ba shirt', nameVI: 'Áo bà ba', nameEN: 'Bà ba shirt',
    defaultColor: '#795c49', defaultMaterial: 'linen', recommendedItems: ['trousers'],
    generator: {
      type: 'top', shell: {...shell, minY: 0.875, ease: [[0.8, 0.026], [1.02, 0.017], [1.3, 0.014], [1.44, 0.011]]},
      collar: {type: 'round', radius: 0.075, height: 0.010, thickness: 0.002},
      layers: 1, thickness: 0.0015,
      details: [detail('buttons', {x: 0, fromY: 1.39, toY: 0.925, count: 7, radius: 0.007, color: '#d7c3a2'}), detail('piping', {path: 'center', color: '#c19c75'}), detail('pockets', {y: 0.997, halfWidth: 0.045, height: 0.055})],
    }, culturalInfo: culturalInfo('Áo bà ba'),
  },
  {
    id: 'trousers', name: 'Quần suông', nameVi: 'Quần suông', nameEn: 'Wide trousers', nameVI: 'Quần suông', nameEN: 'Wide trousers',
    category: 'bottom', slot: 'bottom', defaultColor: '#f0dfbd', defaultMaterial: 'silk',
    materialsAllowed: MATERIALS_ALLOWED, texturesAllowed: PATTERNS, colorZones: ['main'], tags: {events: [], regions: [], seasons: ['all']},
    generator: {type: 'trousers', waistY: 0.975, ankleY: 0.075, legRadius: 0.084, flare: 0.022, rows: 18, columns: 24, thickness: 0.0013, ease: 0.018, layers: 1},
    culturalInfo: culturalInfo('Quần suông'),
  },
  {
    id: 'inner-yem', name: 'Lớp yếm minh họa', nameVi: 'Lớp yếm minh họa', nameEn: 'Illustrative inner layer', nameVI: 'Lớp yếm minh họa', nameEN: 'Illustrative inner layer',
    category: 'inner', slot: 'inner', defaultColor: '#dfa947', defaultMaterial: 'silk', materialsAllowed: MATERIALS_ALLOWED, texturesAllowed: PATTERNS, colorZones: ['main'], tags: {events: [], regions: [], seasons: ['all']},
    generator: {type: 'inner', topY: 1.395, bottomY: 0.965, topWidth: 0.035, lowerWidth: 0.155, ease: 0.008, thickness: 0.001, layers: 1},
    culturalInfo: culturalInfo('Lớp yếm minh họa'),
  },
  {
    id: 'silk-belt', name: 'Dải lụa', nameVi: 'Dải lụa', nameEn: 'Silk sash', nameVI: 'Dải lụa', nameEN: 'Silk sash',
    category: 'belt', slot: 'belt', defaultColor: '#a54143', defaultMaterial: 'silk', materialsAllowed: MATERIALS_ALLOWED, texturesAllowed: PATTERNS, colorZones: ['main'], tags: {events: [], regions: [], seasons: ['all']},
    generator: {type: 'belt', y: 1.045, width: 0.055, ease: 0.038, tailLength: 0.33, tailWidth: 0.046, thickness: 0.0014, layers: 1},
    culturalInfo: culturalInfo('Dải lụa'),
  },
  {
    id: 'non-la', name: 'Nón lá', nameVi: 'Nón lá', nameEn: 'Conical hat', nameVI: 'Nón lá', nameEN: 'Conical hat',
    category: 'headwear', slot: 'headwear', defaultColor: '#d1b677', defaultMaterial: 'linen', materialsAllowed: ['linen'], texturesAllowed: ['plain'], colorZones: ['main'], tags: {events: [], regions: [], seasons: ['all']},
    generator: {type: 'conical-hat', radius: 0.29, height: 0.155, y: 1.735, thickness: 0.003, rings: 9, segments: 48, layers: 1},
    culturalInfo: culturalInfo('Nón lá'),
  },
  {
    id: 'khan-van', name: 'Khăn vấn minh họa', nameVi: 'Khăn vấn minh họa', nameEn: 'Illustrative wrapped headband', nameVI: 'Khăn vấn minh họa', nameEN: 'Illustrative wrapped headband',
    category: 'headwear', slot: 'headwear', defaultColor: '#342c32', defaultMaterial: 'velvet', materialsAllowed: MATERIALS_ALLOWED, texturesAllowed: PATTERNS, colorZones: ['main'], tags: {events: [], regions: [], seasons: ['all']},
    generator: {type: 'headband', radius: 0.094, tube: 0.014, y: 1.735, coils: 3, thickness: 0.002, layers: 1},
    culturalInfo: culturalInfo('Khăn vấn minh họa'),
  },
  {
    id: 'earrings', name: 'Khuyên tai', nameVi: 'Khuyên tai', nameEn: 'Earrings', nameVI: 'Khuyên tai', nameEN: 'Earrings',
    category: 'accessory', slot: 'accessory', defaultColor: '#d8b16a', defaultMaterial: 'metal', materialsAllowed: ['metal'], texturesAllowed: ['plain'], colorZones: ['main'], tags: {events: [], regions: [], seasons: ['all']},
    generator: {type: 'earrings', radius: 0.013, thickness: 0.003, y: 1.61, x: 0.10, layers: 1}, culturalInfo: culturalInfo('Khuyên tai'),
  },
  {
    id: 'woven-bag', name: 'Túi phối', nameVi: 'Túi phối', nameEn: 'Styling bag', nameVI: 'Túi phối', nameEN: 'Styling bag',
    category: 'accessory', slot: 'accessory', defaultColor: '#bd9562', defaultMaterial: 'linen', materialsAllowed: ['linen', 'velvet'], texturesAllowed: ['plain', 'stripes'], colorZones: ['main'], tags: {events: [], regions: [], seasons: ['all']},
    generator: {type: 'bag', x: 0.245, y: 0.865, z: 0.15, width: 0.14, height: 0.15, depth: 0.065, thickness: 0.004, layers: 1}, culturalInfo: culturalInfo('Túi phối'),
  },
  {
    id: 'wooden-clogs', name: 'Guốc minh họa', nameVi: 'Guốc minh họa', nameEn: 'Illustrative wooden clogs', nameVI: 'Guốc minh họa', nameEN: 'Illustrative wooden clogs',
    category: 'footwear', slot: 'footwear', defaultColor: '#6e4a32', defaultMaterial: 'wood', materialsAllowed: ['wood'], texturesAllowed: ['plain'], colorZones: ['main', 'strap'], tags: {events: [], regions: [], seasons: ['all']},
    generator: {type: 'clogs', x: 0.098, width: 0.105, length: 0.23, height: 0.037, thickness: 0.008, layers: 1}, culturalInfo: culturalInfo('Guốc minh họa'),
  },
];

export const GARMENT_BY_ID = Object.fromEntries(GARMENTS.map((garment) => [garment.id, garment]));
export const STARTER_OUTFITS = {
  'ao-dai': ['ao-dai', 'trousers'],
  'ao-tu-than': ['ao-tu-than', 'inner-yem', 'trousers', 'silk-belt'],
  'ao-ngu-than': ['ao-ngu-than', 'trousers'],
  'ao-ba-ba': ['ao-ba-ba', 'trousers'],
};
for (const garment of GARMENTS.filter((item) => item.slot === 'outer')) {
  const outfit = STARTER_OUTFITS[garment.id];
  garment.defaultSlots = {inner: outfit.includes('inner-yem') ? 'inner-yem' : null, bottom: 'trousers', belt: outfit.includes('silk-belt') ? 'silk-belt' : null, headwear: null, footwear: 'wooden-clogs', accessory: []};
}
