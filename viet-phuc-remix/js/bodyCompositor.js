// 2D styling studies over the project's original PNG mannequins.
// Garment overlays are illustrations, not scanned clothing or historical reconstructions.
import { mergeLookLayers } from './lookLayers.js';
export const BODY_PRESETS = Object.freeze({
  male: Object.freeze({ id: 'male', label: 'Nam', src: new URL('../../assets/base_bodies/base_body_1.png', import.meta.url).href, width: 118, height: 308 }),
  female: Object.freeze({ id: 'female', label: 'Nữ', src: new URL('../../assets/base_bodies/base_body_2.png', import.meta.url).href, width: 105, height: 290 }),
});

const LABELS = Object.freeze({ 'ao-dai': 'Áo dài', 'ao-tu-than': 'Áo tứ thân', 'ao-ngu-than': 'Áo ngũ thân', 'ao-ba-ba': 'Áo bà ba', 'ao-nhat-binh': 'Áo nhật bình', 'ao-yem': 'Áo yếm', 'ao-giao-linh': 'Áo giao lĩnh' });
const POSES = {
  male: { cx: 54, neckL: 47, neckR: 65, neckY: 47, shoulderL: 28, shoulderR: 81, shoulderY: 58, waistL: 36, waistR: 76, waistY: 123, hipL: 32, hipR: 79, hipY: 148, elbowL: [21, 104], wristL: [23, 145], elbowR: [101, 99], wristR: [79, 129], ankleL: [23, 281], ankleR: [69, 282], hem: 259, headY: 25 },
  female: { cx: 43, neckL: 36, neckR: 50, neckY: 48, shoulderL: 23, shoulderR: 63, shoulderY: 59, waistL: 27, waistR: 58, waistY: 115, hipL: 20, hipR: 64, hipY: 139, elbowL: [15, 102], wristL: [13, 138], elbowR: [88, 88], wristR: [70, 116], ankleL: [28, 263], ankleR: [57, 265], hem: 246, headY: 26 },
};
const escapeXML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
const safeHex = (value, fallback = '#b83942') => /^#[\da-f]{6}$/i.test(value || '') ? value : fallback;
const clamp = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
let instance = 0;
const ACCESSORY_ALIASES = { 'khan-van': 'khan-dong', earrings: 'bong-tai', 'woven-bag': 'tui-tay', 'wooden-clogs': 'guoc-moc', 'silk-belt': 'day-lung' };

function imageLayers(config, body) {
  if (!Array.isArray(config.imageLayers)) return [];
  return mergeLookLayers(config).flatMap(layer => {
    if (!layer || typeof layer.id !== 'string' || typeof layer.src !== 'string') return [];
    let src = layer.src;
    if (!/^data:image\/(png|webp|jpeg);base64,[a-z\d+/=\s]+$/i.test(src)) {
      try {
        const url = new URL(src, import.meta.url), base = new URL(import.meta.url);
        if (!['http:', 'https:', 'file:'].includes(url.protocol) || url.origin !== base.origin || (url.protocol === 'file:' && base.protocol !== 'file:')) return [];
        src = url.href;
      } catch { return []; }
    }
    const slot = layer.id === config.costumeId ? 'outer' : layer.id === (config.slots?.bottom || 'trousers') ? 'bottom' : layer.id === 'inner-yem' ? 'inner' : 'accessory';
    const zIndex = clamp(layer.zIndex, 1, 100, { bottom: 10, inner: 20, outer: 30, belt: 40, footwear: 40, headwear: 40, accessory: 40 }[slot] ?? 40);
    const scale = clamp(layer.scale ?? 1, .25, 3, 1), x = clamp(layer.offsetX ?? 0, -body.width, body.width, 0), y = clamp(layer.offsetY ?? 0, -body.height, body.height, 0);
    const transform = `translate(${x + body.width / 2} ${y + body.height / 2}) scale(${scale}) translate(${-body.width / 2} ${-body.height / 2})`;
    return [{ ...layer, src, slot, zIndex, svg: `<image data-image-layer="${escapeXML(layer.id)}" href="${escapeXML(src)}" x="0" y="0" width="${body.width}" height="${body.height}" preserveAspectRatio="xMidYMid meet" transform="${transform}"/>` }];
  });
}

function selectedAccessories(config) {
  const selected = new Set(Array.isArray(config.accessories) ? config.accessories : []);
  const slots = config.slots || {};
  for (const id of [slots.headwear, slots.footwear, slots.belt, ...(Array.isArray(slots.accessory) ? slots.accessory : [])]) if (id) selected.add(ACCESSORY_ALIASES[id] || id);
  return selected;
}

function garmentPaths(id, p) {
  const { cx: c, neckL: nl, neckR: nr, neckY: ny, shoulderL: sl, shoulderR: sr, shoulderY: sy, waistL: wl, waistR: wr, waistY: wy, hipL: hl, hipR: hr, hipY: hy, hem } = p;
  const [elx, ely] = p.elbowL, [wlx, wly] = p.wristL, [erx, ery] = p.elbowR, [wrx, wry] = p.wristR;
  const broad = id === 'ao-nhat-binh' || id === 'ao-giao-linh';
  const sleeve = broad ? 12 : id === 'ao-ngu-than' || id === 'ao-tu-than' ? 7 : 4.5;
  const arms = `M${sl} ${sy}Q${sl - 8} ${sy + 4} ${elx - 5} ${ely}L${wlx - sleeve} ${wly - 5}Q${wlx} ${wly + 1} ${wlx + sleeve} ${wly - 5}L${elx + sleeve} ${ely + 2}L${sl + 10} ${sy + 17}Z M${sr} ${sy}Q${sr + 7} ${sy + 2} ${erx + 5} ${ery - 2}Q${erx + 7} ${ery + 4} ${erx + 2} ${ery + 10}L${wrx + sleeve} ${wry + 3}L${wrx - sleeve} ${wry - 5}L${erx - sleeve} ${ery}L${sr - 7} ${sy + 19}Z`;
  const shoulder = `M${nl} ${ny}Q${nl - 4} ${sy - 4} ${sl} ${sy}L${sl + 7} ${sy + 27}L${wl} ${wy}`;
  const close = `L${wr} ${wy}L${sr - 7} ${sy + 27}L${sr} ${sy}Q${nr + 3} ${sy - 3} ${nr} ${ny}Z`;
  if (id === 'ao-yem') return `M${nl + 1} ${ny + 4}L${nr - 1} ${ny + 4}Q${nr + 2} ${sy + 8} ${sr - 2} ${sy + 19}L${wr + 1} ${wy - 1}L${c} ${hy - 1}L${wl - 1} ${wy - 1}L${sl + 1} ${sy + 19}Q${nl - 2} ${sy + 8} ${nl + 1} ${ny + 4}Z`;
  if (id === 'ao-ba-ba') return `${arms} ${shoulder}L${hl - 1} ${hy + 14}Q${c} ${hy + 21} ${hr + 1} ${hy + 14}${close}`;
  if (id === 'ao-tu-than') return `${arms} M${nl} ${ny}L${sl} ${sy}L${sl + 7} ${sy + 26}L${wl} ${wy}L${hl - 10} ${hem - 3}Q${c - 14} ${hem + 2} ${c - 5} ${hem - 1}L${c - 4} ${wy + 3}L${c - 8} ${sy + 31}Z M${nr} ${ny}L${sr} ${sy}L${sr - 7} ${sy + 26}L${wr} ${wy}L${hr + 12} ${hem - 3}Q${c + 15} ${hem + 2} ${c + 5} ${hem - 1}L${c + 4} ${wy + 3}L${c + 8} ${sy + 31}Z`;
  const flare = id === 'ao-dai' ? 9 : broad ? 17 : 13;
  return `${arms} ${shoulder}L${hl - flare} ${hem - 2}Q${c - 11} ${hem + 7} ${c} ${hem + 4}Q${c + 16} ${hem + 8} ${hr + flare} ${hem - 2}${close}`;
}

function garmentDetails(id, p, gold, color) {
  const { cx: c, neckL: nl, neckR: nr, neckY: ny, waistL: wl, waistR: wr, waistY: wy, hem } = p;
  const collar = `<path d="M${nl} ${ny + 3}V${ny - 5}Q${c} ${ny - 2} ${nr} ${ny - 5}V${ny + 3}Q${c} ${ny + 7} ${nl} ${ny + 3}Z" fill="${color}" stroke="${gold}" stroke-width=".7"/>`;
  const buttons = (x, from, count = 5) => Array.from({ length: count }, (_, i) => `<circle cx="${x}" cy="${from + i * 10}" r=".9" fill="${gold}"/>`).join('');
  if (id === 'ao-nhat-binh') return `<path d="M${nl - 4} ${ny + 1}L${nl - 4} ${ny + 45}H${nr + 4}V${ny + 1}L${nr - 2} ${ny + 1}V${ny + 38}H${nl + 2}V${ny + 1}Z" fill="${gold}"/><path d="M${nl - 1} ${ny + 3}V${ny + 41}H${nr + 1}V${ny + 3}" fill="none" stroke="#9b354b" stroke-width="1"/><path d="M${c} ${ny + 46}V${hem + 1}" stroke="${gold}" stroke-width="1.1"/><path d="M${p.hipL - 14} ${hem - 9}Q${c} ${hem} ${p.hipR + 14} ${hem - 9}" fill="none" stroke="${gold}" stroke-width="4"/><circle cx="${c}" cy="${ny + 48}" r="2.5" fill="${gold}"/>`;
  if (id === 'ao-giao-linh') return `<path d="M${nl} ${ny}L${wr - 2} ${wy + 5}M${nr} ${ny}L${wl + 4} ${wy - 7}" stroke="#eee1bd" stroke-width="5" fill="none"/><path d="M${nl} ${ny}L${wr - 2} ${wy + 5}" stroke="${gold}" stroke-width="1" fill="none"/><path d="M${wr - 2} ${wy + 5}L${c + 12} ${hem}" stroke="#442830" stroke-opacity=".25" fill="none"/>`;
  if (id === 'ao-yem') return `<path d="M${nl + 1} ${ny + 4}Q${c} ${ny + 9} ${nr - 1} ${ny + 4}" stroke="${gold}" stroke-width="1.2" fill="none"/><path d="M${nl + 1} ${ny + 4}L${nl - 1} ${ny - 2}M${nr - 1} ${ny + 4}L${nr + 1} ${ny - 2}" stroke="${color}" stroke-width="2"/><path d="M${c - 4} ${ny + 28}Q${c} ${ny + 18} ${c + 4} ${ny + 28}Q${c} ${ny + 37} ${c - 4} ${ny + 28}Z" fill="none" stroke="${gold}" stroke-width=".7"/>`;
  if (id === 'ao-tu-than') return `<path d="M${nl} ${ny}L${c - 8} ${p.shoulderY + 31}L${c - 4} ${wy + 3}M${nr} ${ny}L${c + 8} ${p.shoulderY + 31}L${c + 4} ${wy + 3}" fill="none" stroke="${gold}" stroke-width="1.2"/><path d="M${c - 5} ${wy + 9}L${c - 7} ${hem}M${c + 5} ${wy + 9}L${c + 7} ${hem}" stroke="${gold}" stroke-opacity=".6" stroke-width=".6"/>`;
  if (id === 'ao-ba-ba') return `<path d="M${nl} ${ny}Q${c} ${ny + 21} ${nr} ${ny}M${c} ${ny + 13}V${p.hipY + 15}" fill="none" stroke="${gold}" stroke-width=".8"/>${buttons(c + 2, ny + 20, 8)}<path d="M${wl + 1} ${wy + 10}H${c - 5}V${wy + 21}H${wl + 1}ZM${c + 7} ${wy + 10}H${wr - 1}V${wy + 21}H${c + 7}Z" fill="none" stroke="${gold}" stroke-opacity=".6" stroke-width=".7"/>`;
  return `${collar}<path d="M${nr} ${ny + 4}L${p.shoulderR - 4} ${p.shoulderY + 14}L${wr - 3} ${wy + 12}" fill="none" stroke="${gold}" stroke-width=".7"/>${buttons(wr - 3, p.shoulderY + 17, 6)}<path d="M${id === 'ao-dai' ? c + 2 : wr - 3} ${wy + 13}L${c + 5} ${hem + 3}" fill="none" stroke="#291f28" stroke-opacity=".18" stroke-width=".7"/>`;
}

function motifFor(pattern) {
  switch (pattern) {
    case 'stripes': return '<path d="M3 0V16M11 0V16" stroke="#f5dfb0" stroke-width=".7"/>';
    case 'dots': return '<circle cx="4" cy="4" r=".9" fill="#f5dfb0"/><circle cx="12" cy="12" r=".9" fill="#f5dfb0"/>';
    case 'lotus': return '<path d="M8 12Q0 11 3 5Q6 6 8 12Q5 5 8 2Q11 5 8 12Q10 6 13 5Q16 11 8 12ZM4 14H12" fill="none" stroke="#f5dfb0" stroke-width=".55"/>';
    case 'crane': return '<path d="M2 12Q6 5 9 8Q12 6 13 3M8 9Q10 13 14 12M9 8L9 13L6 15" fill="none" stroke="#f5dfb0" stroke-width=".65"/>';
    case 'cloud': return '<path d="M2 10Q0 6 5 6Q5 1 9 3Q12 2 12 7Q17 8 13 11H5" fill="none" stroke="#f5dfb0" stroke-width=".65"/>';
    case 'brocade': return '<path d="M8 1L15 8L8 15L1 8ZM8 5L11 8L8 11L5 8Z" fill="none" stroke="#f5dfb0" stroke-width=".6"/>';
    default: return '';
  }
}

function bottomLayer(p, bottom) {
  if (!bottom) return '';
  const { cx: c, hipL: hl, hipR: hr, waistY: wy, hipY: hy, ankleL: [lx, ly], ankleR: [rx, ry] } = p;
  if (bottom === 'skirt' || bottom === 'long-skirt') return `<path data-layer="bottom" d="M${hl} ${wy + 4}H${hr}L${hr + 17} ${ry - 3}Q${c} ${ry + 3} ${hl - 13} ${ly - 3}Z" fill="#e7d8be" stroke="#b5a48b" stroke-width=".6"/><path d="M${c - 8} ${hy}L${c - 14} ${ly - 3}M${c + 8} ${hy}L${c + 16} ${ry - 3}" fill="none" stroke="#b5a48b" stroke-width=".7"/>`;
  return `<g data-layer="bottom" fill="#eee6d7" stroke="#bfb09a" stroke-width=".65"><path d="M${hl} ${wy + 4}H${c + 3}L${c + 1} ${hy + 25}L${lx + 7} ${ly}H${lx - 8}L${hl - 3} ${hy + 26}Z"/><path d="M${c + 1} ${wy + 4}H${hr}L${hr + 1} ${hy + 25}L${rx + 9} ${ry}H${rx - 8}L${c - 2} ${hy + 26}Z"/></g>`;
}

function accessoryLayer(selected, p, color) {
  const { cx: c, neckY: ny, neckL: nl, neckR: nr, waistL: wl, waistR: wr, waistY: wy, wristL: [wx, wyh], ankleL: [lx, ly], ankleR: [rx, ry] } = p;
  const parts = [];
  const add = (id, svg) => { if (selected.has(id)) parts.push(`<g data-accessory="${id}">${svg}</g>`); };
  add('day-lung', `<path d="M${wl - 1} ${wy - 2}Q${c} ${wy + 4} ${wr + 1} ${wy - 2}V${wy + 5}Q${c} ${wy + 11} ${wl - 1} ${wy + 5}Z" fill="#6b7a43"/><path d="M${c + 8} ${wy + 5}L${c + 7} ${wy + 69}L${c + 15} ${wy + 62}L${c + 13} ${wy + 5}Z" fill="#819153"/><path d="M${c + 8} ${wy + 5}L${c + 22} ${wy + 45}L${c + 27} ${wy + 40}L${c + 13} ${wy + 4}Z" fill="#6b7a43"/>`);
  add('vong-co', `<path d="M${nl - 3} ${ny + 7}Q${c} ${ny + 32} ${nr + 2} ${ny + 7}" fill="none" stroke="#d4ad5b" stroke-width="1.7"/><circle cx="${c}" cy="${ny + 23}" r="2.1" fill="#efca74"/>`);
  add('bong-tai', `<g fill="#e6c272" stroke="#a7813e" stroke-width=".4"><ellipse cx="${nl - 4}" cy="37" rx="1.4" ry="3.2"/><ellipse cx="${nr + 1}" cy="37" rx="1.4" ry="3.2"/></g>`);
  add('vong-tay', `<path d="M${wx - 3} ${wyh - 1}Q${wx} ${wyh + 2} ${wx + 3} ${wyh - 1}" fill="none" stroke="#d8b466" stroke-width="2.1"/>`);
  add('tui-tay', `<path d="M${wx - 11} ${wyh + 21}H${wx + 8}L${wx + 10} ${wyh + 43}Q${wx - 1} ${wyh + 47} ${wx - 13} ${wyh + 43}Z" fill="#806145" stroke="#574230" stroke-width=".8"/><path d="M${wx - 8} ${wyh + 23}V${wyh + 15}Q${wx - 2} ${wyh + 6} ${wx + 5} ${wyh + 15}V${wyh + 23}" fill="none" stroke="#574230" stroke-width="1.7"/><path d="M${wx - 10} ${wyh + 28}H${wx + 7}M${wx - 10} ${wyh + 32}H${wx + 7}M${wx - 10} ${wyh + 36}H${wx + 7}" stroke="#b28d5c" stroke-width=".6"/>`);
  add('quat-lua', `<g transform="translate(${wx - 1} ${wyh + 13}) rotate(14)"><path d="M0 1L-22 -18Q0 -39 22 -18Z" fill="#f0d6bc" stroke="#bd975e" stroke-width=".8"/><path d="M0 1L-15 -24M0 1L-7 -29M0 1V-30M0 1L8 -29M0 1L15 -24" stroke="#bd975e" stroke-width=".5"/><circle cx="0" cy="1" r="1.5" fill="#996c3d"/></g>`);
  add('guoc-moc', `<g fill="#aa8057" stroke="#78553b" stroke-width=".5"><path d="M${lx - 5} ${ly - 1}L${lx + 6} ${ly + 2}L${lx + 3} ${ly + 11}L${lx - 14} ${ly + 11}Z"/><path d="M${rx - 6} ${ry - 1}H${rx + 6}L${rx + 10} ${ry + 11}H${rx - 6}Z"/></g><g fill="none" stroke="#49382f" stroke-width="3"><path d="M${lx - 8} ${ly + 5}L${lx + 4} ${ly + 6}M${rx - 5} ${ry + 5}L${rx + 7} ${ry + 5}"/></g>`);
  add('hai-cong', `<g fill="#4f3242" stroke="#d5ad61" stroke-width=".8"><path d="M${lx - 5} ${ly - 2}L${lx + 6} ${ly}L${lx + 5} ${ly + 11}H${lx - 17}Q${lx - 22} ${ly + 5} ${lx - 17} ${ly + 1}Q${lx - 16} ${ly + 8} ${lx - 5} ${ly + 5}Z"/><path d="M${rx - 6} ${ry - 2}L${rx + 6} ${ry}Q${rx + 14} ${ry + 8} ${rx + 15} ${ry}Q${rx + 20} ${ry + 5} ${rx + 15} ${ry + 11}H${rx - 6}Z"/></g>`);
  add('khan-dong', `<path d="M${c - 16} 23Q${c - 18} 7 ${c} 5Q${c + 18} 7 ${c + 17} 23L${c + 12} 24Q${c} 17 ${c - 12} 24Z" fill="${color}" stroke="#d4ad64" stroke-width=".8"/><path d="M${c - 14} 17Q${c} 8 ${c + 15} 17M${c - 15} 20Q${c} 11 ${c + 16} 20" fill="none" stroke="#e5c685" stroke-width=".5"/>`);
  add('tram-cai', `<path d="M${c + 4} 11L${c + 21} 21" stroke="#d7b36e" stroke-width="1.4"/><g fill="#eed19a" stroke="#aa8350" stroke-width=".4"><circle cx="${c + 7}" cy="12" r="3"/><circle cx="${c + 4}" cy="10" r="2.5"/><circle cx="${c + 8}" cy="8" r="2.5"/><circle cx="${c + 10}" cy="12" r="2.5"/></g>`);
  add('non-la', `<path d="M${c - 38} 26L${c} -1L${c + 39} 26Q${c} 35 ${c - 38} 26Z" fill="#dfc695" stroke="#ae8e57" stroke-width=".7"/><path d="M${c - 26} 21Q${c} 26 ${c + 27} 21M${c - 15} 11Q${c} 15 ${c + 15} 11" fill="none" stroke="#ba9d6c" stroke-width=".5"/><path d="M${c - 24} 29Q${c} 69 ${c + 25} 29" fill="none" stroke="#97688b" stroke-width="1"/>`);
  add('non-quai-thao', `<path d="M${c - 42} 16Q${c} 3 ${c + 42} 16V24Q${c} 37 ${c - 42} 24Z" fill="#d2b780" stroke="#a48a55" stroke-width=".7"/><ellipse cx="${c}" cy="16" rx="42" ry="9" fill="#ead6ad" stroke="#b69762" stroke-width=".6"/><path d="M${c - 34} 26Q${c - 41} 68 ${c - 17} 84M${c + 34} 26Q${c + 41} 68 ${c + 17} 84" stroke="#785170" fill="none" stroke-width="2.2"/>`);
  return parts.join('');
}

/** Returns a complete, accessible SVG using the actual body asset. */
export function drawBodyLook(config = {}) {
  const gender = config.body?.gender === 'male' ? 'male' : 'female';
  const body = BODY_PRESETS[gender], p = POSES[gender];
  const costumeId = Object.hasOwn(LABELS, config.costumeId) ? config.costumeId : 'ao-dai';
  const color = safeHex(config.color), gold = '#dfc28a';
  const key = `body-look-${++instance}`;
  const scale = 530 / body.height, left = 240 - body.width * scale / 2;
  const garment = garmentPaths(costumeId, p);
  const motif = motifFor(config.pattern);
  const patternScale = clamp(config.patternScale, .4, 3, 1);
  const strength = clamp(config.patternStrength, 0, 1, .45);
  const sheen = { silk: .19, linen: .04, brocade: .12, velvet: .08 }[config.material] ?? .15;
  const selected = selectedAccessories(config);
  const slots = config.slots || {};
  const layers = imageLayers(config, body);
  const hasLayer = (slot, id) => layers.some(layer => layer.slot === slot || (id && layer.id === id));
  for (const layer of layers) selected.delete(ACCESSORY_ALIASES[layer.id] || layer.id);
  const bottom = Object.hasOwn(slots, 'bottom') ? slots.bottom : 'trousers';
  const inner = costumeId === 'ao-tu-than' && slots.inner !== null ? `<path data-layer="inner" d="M${p.neckL + 2} ${p.neckY + 4}H${p.neckR - 2}L${p.waistR - 2} ${p.waistY + 8}H${p.waistL + 2}Z" fill="#d9b778" stroke="#a78756" stroke-width=".5"/>` : '';
  const illustratedGarment = `<path data-layer="garment" d="${garment}" fill="url(#${key}-fabric)" stroke="${color}" stroke-width=".8" stroke-linejoin="round"/>
    <g clip-path="url(#${key}-garment)">
      ${motif ? `<rect data-layer="pattern" x="0" y="0" width="${body.width}" height="${body.height}" fill="url(#${key}-motif)" opacity="${strength}"/>` : ''}
      <rect data-layer="fabric-shading" x="0" y="0" width="${body.width}" height="${body.height}" fill="url(#${key}-shade)"/>
      ${costumeId !== 'ao-yem' ? `<path d="M${p.waistL + 4} ${p.waistY + 10}Q${p.waistL} ${p.hem - 30} ${p.hipL - 4} ${p.hem}M${p.waistR - 6} ${p.waistY + 10}Q${p.waistR} ${p.hem - 20} ${p.hipR + 3} ${p.hem}" stroke="#241a21" stroke-opacity=".14" fill="none" stroke-width="1.2"/>` : ''}
    </g>${garmentDetails(costumeId, p, gold, color)}`;
  const content = [
    { zIndex: 10, svg: hasLayer('bottom', bottom) ? '' : bottomLayer(p, bottom) },
    { zIndex: 20, svg: hasLayer('inner', slots.inner) ? '' : inner },
    { zIndex: 30, svg: hasLayer('outer', costumeId) ? '' : illustratedGarment },
    { zIndex: 40, svg: accessoryLayer(selected, p, color) },
    ...layers,
  ].sort((a, b) => a.zIndex - b.zIndex).map(layer => layer.svg).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 620" role="img" aria-label="${escapeXML(`${LABELS[costumeId]} trên base body ${body.label.toLowerCase()}`)}" data-costume="${costumeId}" data-body="${gender}">
    <title>${escapeXML(`${LABELS[costumeId]} · Base body ${body.label}`)}</title>
    <defs>
      <linearGradient id="${key}-fabric" x1="0" x2="1"><stop stop-color="${color}"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="${color}"/></linearGradient>
      <linearGradient id="${key}-shade" x1="0" x2="1"><stop stop-color="#221624" stop-opacity=".27"/><stop offset=".34" stop-color="#fff" stop-opacity="${sheen}"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#221624" stop-opacity=".26"/></linearGradient>
      <pattern id="${key}-motif" width="${16 * patternScale}" height="${16 * patternScale}" patternUnits="userSpaceOnUse" viewBox="0 0 16 16">${motif}</pattern>
      <clipPath id="${key}-garment"><path d="${garment}"/></clipPath>
    </defs>
    <ellipse data-studio-shadow="true" cx="240" cy="584" rx="94" ry="10" fill="#423231" opacity=".12"/>
    <g transform="translate(${left} 52) scale(${scale})">
      <image data-base-body="${gender}" href="${escapeXML(body.src)}" x="0" y="0" width="${body.width}" height="${body.height}" preserveAspectRatio="xMidYMid meet"/>
      ${content}
    </g>
  </svg>`;
}

const bodyDataCache = new Map();
/** A self-contained copy of the unchanged base PNG, for export/reference downloads. */
export async function loadBodyDataURL(gender = 'female') {
  const id = gender === 'male' ? 'male' : 'female';
  if (!bodyDataCache.has(id)) {
    const promise = (async () => {
      const response = await fetch(BODY_PRESETS[id].src);
      if (!response.ok) throw new Error(`Không tải được base body ${BODY_PRESETS[id].label.toLowerCase()} (${response.status}).`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = '';
      for (let start = 0; start < bytes.length; start += 8192) binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
      return `data:image/png;base64,${btoa(binary)}`;
    })();
    bodyDataCache.set(id, promise);
    promise.catch(() => bodyDataCache.delete(id));
  }
  return bodyDataCache.get(id);
}

/** Exports at 960×1240; embeds the body PNG so browsers retain it inside SVG-to-canvas. */
export async function bodyLookPNG(config = {}, transparent = false) {
  const gender = config.body?.gender === 'male' ? 'male' : 'female';
  const bodyData = await loadBodyDataURL(gender);
  let svg = drawBodyLook(config).replace(escapeXML(BODY_PRESETS[gender].src), bodyData);
  for (const layer of imageLayers(config, BODY_PRESETS[gender])) {
    if (layer.src.startsWith('data:')) continue;
    const response = await fetch(layer.src);
    if (!response.ok) throw new Error('Không tải được lớp ảnh để xuất.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let start = 0; start < bytes.length; start += 8192) binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
    const contentType = response.headers.get('Content-Type')?.split(';')[0];
    const type = ['image/png', 'image/jpeg', 'image/webp'].includes(contentType) ? contentType : 'image/png';
    svg = svg.replace(escapeXML(layer.src), `data:${type};base64,${btoa(binary)}`);
  }
  if (transparent) svg = svg.replace(/<ellipse data-studio-shadow="true"[^>]*\/>/, '');
  const image = new Image();
  image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 960; canvas.height = 1240;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt không hỗ trợ xuất ảnh.');
  if (!transparent) {
    const background = context.createLinearGradient(0, 0, 960, 1240);
    background.addColorStop(0, '#f8f2e7'); background.addColorStop(1, '#e6ddd0');
    context.fillStyle = background; context.fillRect(0, 0, 960, 1240);
  }
  context.drawImage(image, 0, 0, 960, 1240);
  return canvas.toDataURL('image/png');
}
