// ============================================================
// APP.JS – Việt phục Remix (full rewrite with AI mockup)
// ============================================================

let storageIssue = '';
const LOOKBOOK_STUDIO_IDS = {
  outer: COSTUMES.map(costume => costume.id),
  inner: ['inner-yem'], bottom: ['trousers'], belt: ['silk-belt'],
  headwear: ['non-la', 'non-quai-thao', 'khan-van', 'tram-cai'],
  accessory: ['earrings', 'woven-bag', 'vong-co', 'vong-tay', 'quat-lua'], footwear: ['wooden-clogs', 'hai-cong'],
};
const compatibility = window.VietPhucCompatibility;
const currentContext = () => ({ costumeId: state.selectedCostume, accessories: [...state.selectedAccessories], style: state.selectedStyle, event: state.selectedEvent });
const costumeIllustration = (id, color, gender) => window.VietPhucIllustration?.(id, color, gender) || '<div class="illustration-placeholder" aria-hidden="true"></div>';
const LOOKBOOK_HAIR_IDS = ['bun', 'bob', 'long', 'braid', 'short', 'ponytail', 'wavy', 'buzz'];
const LOOKBOOK_STYLE_NAMES = { traditional: 'Truyền thống', fusion: 'Fusion', genz: 'Gen Z Bold' };
const LOOKBOOK_EVENT_IDS = ['festival', 'tet', 'wedding', 'school', 'street', 'ceremony'];
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const safeLookColor = (value, fallback) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : fallback;
const safeLookNumber = (value, fallback, min, max) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

function safeLookDate(value) {
  if (typeof value !== 'string') return 'Chưa ghi ngày';
  const parts = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (!parts) return 'Chưa ghi ngày';
  const [, day, month, year] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 1900 && year <= 2200 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? `${day}/${month}/${year}` : 'Chưa ghi ngày';
}

function safeLookImage(value) {
  const prefix = 'data:image/png;base64,';
  if (typeof value !== 'string' || value.length > 8 * 1024 * 1024 || !value.startsWith(prefix)) return null;
  const encoded = value.slice(prefix.length);
  // PNG signature plus a strict base64 alphabet prevents HTML, SVG and URL input.
  return encoded.length >= 44 && encoded.length % 4 === 0 && encoded.startsWith('iVBORw0KGgo') && /^[A-Za-z0-9+/]+={0,2}$/.test(encoded) ? value : null;
}

function normaliseStudioLook(value, costumeId, color, accessories = []) {
  if (!isRecord(value) || !LOOKBOOK_STUDIO_IDS.outer.includes(costumeId)) return null;
  const sourceBody = isRecord(value.body) ? value.body : {};
  const sourceSlots = isRecord(value.slots) ? value.slots : {};
  const defaultMaterial = { 'ao-dai': 'silk', 'ao-tu-than': 'linen', 'ao-ngu-than': 'brocade', 'ao-ba-ba': 'linen', 'ao-nhat-binh': 'brocade', 'ao-yem': 'silk', 'ao-giao-linh': 'linen' }[costumeId];
  const body = {
    shape: safeLookNumber(sourceBody.shape, 0, -0.35, 0.35),
    height: safeLookNumber(sourceBody.height, 1.75, 1.55, 1.90),
    skin: safeLookColor(sourceBody.skin, '#CC9874').toLowerCase(),
    hair: LOOKBOOK_HAIR_IDS.includes(sourceBody.hair) ? sourceBody.hair : 'bun',
    gender: sourceBody.gender === 'male' ? 'male' : 'female',
  };
  const slots = { outer: costumeId, inner: costumeId === 'ao-tu-than' ? 'inner-yem' : null, bottom: 'trousers', belt: null, headwear: null, footwear: 'wooden-clogs', accessory: [] };
  for (const [slot, allowed] of Object.entries(LOOKBOOK_STUDIO_IDS)) {
    if (!Object.hasOwn(sourceSlots, slot)) continue;
    if (slot === 'accessory') {
      slots.accessory = Array.isArray(sourceSlots.accessory) ? [...new Set(sourceSlots.accessory.filter(id => typeof id === 'string' && allowed.includes(id)))] : [];
    } else {
      const selected = sourceSlots[slot];
      slots[slot] = selected === null || selected === '' ? null : typeof selected === 'string' && allowed.includes(selected) ? selected : slots[slot];
    }
  }
  // A persisted primary label and primary garment must identify the same look.
  if (slots.outer !== null) slots.outer = costumeId;
  if (LOOKBOOK_HAIR_IDS.includes(sourceSlots.hair)) { slots.hair = sourceSlots.hair; body.hair = sourceSlots.hair; }
  const cleanAccessories = compatibility.sanitizeAccessories(accessories, { costumeId });
  Object.assign(slots, compatibility.toStudioSlots(cleanAccessories, costumeId));
  const activeImageIds = [costumeId,...cleanAccessories,...(slots.bottom?['trousers']:[]),...(slots.inner?['inner-yem']:[])];
  return {
    costumeId, color,
    material: ['silk', 'linen', 'brocade', 'velvet'].includes(value.material) ? value.material : defaultMaterial,
    pattern: ['plain', 'lotus', 'crane', 'cloud', 'brocade', 'dots', 'stripes'].includes(value.pattern) ? value.pattern : 'plain',
    patternScale: safeLookNumber(value.patternScale, 1, 0.5, 3),
    patternStrength: safeLookNumber(value.patternStrength, 0.45, 0, 1),
    flare: safeLookNumber(value.flare, 0.1, 0, 0.35),
    clothMotion: typeof value.clothMotion === 'boolean' ? value.clothMotion : true,
    autoRotate: typeof value.autoRotate === 'boolean' ? value.autoRotate : false,
    body, slots, accessories: cleanAccessories,
    imageLayers: Array.isArray(value.imageLayers) ? value.imageLayers.slice(0,20).flatMap(layer => {
      if (!isRecord(layer) || typeof layer.id !== 'string' || !activeImageIds.includes(layer.id)) return [];
      const src=safeLookImage(layer.src); if (!src || layer.gender !== body.gender) return [];
      return [{id:layer.id,gender:body.gender,src,zIndex:safeLookNumber(layer.zIndex,30,1,100),key:body.gender+':'+layer.id}];
    }) : [],
  };
}

function normaliseStoredLook(value) {
  if (!isRecord(value) || !Number.isSafeInteger(value.id) || value.id <= 0) return null;
  const costume = COSTUMES.find(item => item.id === value.costumeId);
  const color = safeLookColor(value.color, null);
  if (!costume || !color) return null;
  const style = Object.hasOwn(LOOKBOOK_STYLE_NAMES, value.style) ? value.style : 'traditional';
  const event = LOOKBOOK_EVENT_IDS.includes(value.event) ? value.event : 'festival';
  const accessories = compatibility.sanitizeAccessories(value.accessories, { costumeId: costume.id, style, event });
  const colorData = COLORS.find(item => item.hex.toUpperCase() === color);
  // Reconstruct display text from trusted catalogs; persisted labels are ignored.
  return {
    id: value.id, costumeId: costume.id, costumeName: costume.name, costumeEmoji: costume.emoji,
    color, colorName: colorData?.name || 'Màu tùy chọn',
    image: safeLookImage(value.image), studioConfig: normaliseStudioLook(value.studioConfig, costume.id, color, accessories),
    accessories, style, styleName: LOOKBOOK_STYLE_NAMES[style], event, eventName: getEventLabel(event), savedAt: safeLookDate(value.savedAt),
  };
}

function readLookbook() {
  try {
    const value = JSON.parse(localStorage.getItem('vietPhucLookbook') || '[]');
    if (!Array.isArray(value)) { storageIssue = 'Lookbook cũ không đọc được. Bạn vẫn có thể phối và xuất ảnh.'; return []; }
    const ids = new Set();
    return value.map(normaliseStoredLook).filter(look => {
      if (!look || ids.has(look.id)) return false;
      ids.add(look.id); return true;
    });
  } catch { storageIssue = 'Lookbook cũ không đọc được. Bạn vẫn có thể phối và xuất ảnh.'; return []; }
}
function persistLookbook() {
  try { localStorage.setItem('vietPhucLookbook', JSON.stringify(state.lookbook)); return true; }
  catch { storageIssue = 'Bộ nhớ không lưu được. Lookbook đang giữ trong phiên này; hãy xuất ảnh.'; return false; }
}
let state = {
  selectedCostume: 'ao-dai',
  selectedEvent: 'festival',
  selectedColor: '#C0392B',
  selectedAccessories: new Set(),
  selectedStyle: 'traditional',
  selectedWeather: 'sunny',
  lookbook: readLookbook(),
  filterRegion: 'all',
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  renderCostumeGrid();
  renderCostumePills();
  renderColorSwatches();
  renderAccessoryGrid();
  renderTimeline();
  renderCultureRules();
  renderRegions();
  renderModernTrends();
  renderLookbook();
  startShowcaseRotation();
  generateOutfit();
  if (storageIssue) showToast(storageIssue);

  if (state.lookbook.length === 0) {
    document.getElementById('lookbook-empty').classList.remove('hidden');
  } else {
    document.getElementById('lookbook-empty').classList.add('hidden');
    document.getElementById('lookbook-actions').classList.remove('hidden');
  }
});

window.addEventListener('vietphuc:illustrations-ready', () => {
  renderCostumeGrid(state.filterRegion);
  renderCostumePills();
  renderLookbook();
});

// ============================================================
// HEADER
// ============================================================
function initHeader() {
  window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 20);
  });
}
function toggleMenu() { document.getElementById('mobile-menu').classList.toggle('open'); }
function scrollToMixer() { document.getElementById('mixer').scrollIntoView({ behavior: 'smooth' }); }

// ============================================================
// HERO SHOWCASE
// ============================================================
let showcaseInterval;
function startShowcaseRotation() {
  showcaseInterval = setInterval(() => {
    const cards = document.querySelectorAll('.showcase-card');
    let active = 0;
    cards.forEach((c, i) => { if (c.classList.contains('active')) active = i; });
    changeShowcase((active + 1) % cards.length);
  }, 3500);
}
function changeShowcase(idx) {
  clearInterval(showcaseInterval);
  document.querySelectorAll('.showcase-card').forEach((c, i) => c.classList.toggle('active', i === idx));
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  startShowcaseRotation();
}

// ============================================================
// COSTUME GRID
// ============================================================
function renderCostumeGrid(filter = 'all') {
  const grid = document.getElementById('costume-grid');
  const list = filter === 'all' ? COSTUMES : COSTUMES.filter(c => c.region === filter);
  grid.innerHTML = list.map((c, i) => `
    <div class="costume-card" style="animation-delay:${i*0.07}s" data-region="${c.region}" onclick="openCostumeModal('${c.id}')">
      <div class="costume-card-img costume-illustration" style="background:${c.bgGradient}">
        ${costumeIllustration(c.id, c.color)}
      </div>
      <div class="costume-card-body">
        <div class="costume-card-tags">
          <span class="costume-card-tag region">${c.regionLabel}</span>
          ${c.tags.slice(0,2).map(t => `<span class="costume-card-tag">${t}</span>`).join('')}
        </div>
        <h3>${c.name}</h3>
        <p>${c.shortDesc}</p>
        <div class="costume-card-actions">
          <button class="btn-sm btn-sm-primary" onclick="event.stopPropagation();selectAndMix('${c.id}')">Phối đồ</button>
          <button class="btn-sm btn-sm-ghost" onclick="event.stopPropagation();openCostumeModal('${c.id}')">Chi tiết</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCostumes(region) {
  state.filterRegion = region;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-filter="${region}"]`)?.classList.add('active');
  renderCostumeGrid(region);
}

function openCostumeModal(id) {
  const c = COSTUMES.find(x => x.id === id);
  if (!c) return;
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-tag">${c.regionLabel}</div>
    <h2>${c.name}</h2>
    <div class="modal-costume-preview costume-illustration">${costumeIllustration(c.id, c.color)}</div>
    <div class="culture-verification">Cần xác minh · Nguồn: chưa có nguồn đối chiếu cho các nhận định dưới đây.</div>
    <p>${c.desc}</p>
    <div class="modal-section"><h3>Nguồn gốc & lịch sử</h3><p>${c.origin}</p></div>
    <div class="modal-section"><h3>Dịp mặc phù hợp</h3><ul>${c.occasions.map(o=>`<li>${o}</li>`).join('')}</ul></div>
    <div class="modal-section"><h3>Mẹo văn hóa</h3><ul>${c.culturalTips.map(t=>`<li>${t}</li>`).join('')}</ul></div>
    ${c.warnings.length ? `<div class="modal-section"><h3 style="color:#FF9800">Lưu ý</h3><ul>${c.warnings.map(w=>`<li style="color:#FF9800">${w}</li>`).join('')}</ul></div>` : ''}
    <div class="modal-section"><h3>Gợi ý phối theo phong cách</h3><ul>
      <li>Truyền thống: ${c.styleSuggestions.traditional}</li>
      <li>Fusion: ${c.styleSuggestions.fusion}</li>
      <li>Gen Z Bold: ${c.styleSuggestions.genz}</li>
    </ul></div>
    <div style="margin-top:24px;display:flex;gap:12px">
      <button class="btn-primary" onclick="selectAndMix('${c.id}');closeModal()">Phối đồ ngay</button>
      <button class="btn-ghost" onclick="closeModal()">Đóng</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }

function selectAndMix(id) {
  if (!COSTUMES.some(costume => costume.id === id)) return;
  state.selectedCostume = id;
  sanitizeSelectedAccessories(true);
  renderCostumePills();
  generateOutfit();
  document.getElementById('mixer').scrollIntoView({ behavior: 'smooth' });
}
function selectCostumeById(id) { selectAndMix(id); }

// ============================================================
// MIXER – PILLS
// ============================================================
function renderCostumePills() {
  document.getElementById('costume-pills').innerHTML = COSTUMES.map(c => `
    <button type="button" class="costume-pill ${state.selectedCostume === c.id ? 'selected' : ''}" aria-pressed="${state.selectedCostume === c.id}"
      onclick="selectCostumePill('${c.id}')" id="pill-${c.id}">
      <span class="costume-pill-preview costume-illustration">${costumeIllustration(c.id, c.color)}</span>
      <span class="costume-pill-name">${c.name}</span>
    </button>
  `).join('');
}

function selectCostumePill(id) {
  if (!COSTUMES.some(costume => costume.id === id)) return;
  state.selectedCostume = id;
  sanitizeSelectedAccessories(true);
  renderCostumePills();
  const evSugg = EVENT_SUGGESTIONS[state.selectedEvent];
  if (evSugg?.colors?.[0] && !state.selectedColor) selectColorByHex(evSugg.colors[0]);
  generateOutfit();
}

// ============================================================
// EVENT
// ============================================================
function selectEvent(btn, event) {
  if (!LOOKBOOK_EVENT_IDS.includes(event)) return;
  document.querySelectorAll('.event-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.selectedEvent = event;
  const evSugg = EVENT_SUGGESTIONS[event];
  if (evSugg?.colors?.[0]) selectColorByHex(evSugg.colors[0]);
  else generateOutfit();
}

// ============================================================
// COLOR
// ============================================================
function renderColorSwatches() {
  document.getElementById('color-swatches').innerHTML = COLORS.map(c => `
    <button class="color-swatch ${state.selectedColor === c.hex ? 'selected' : ''}"
      style="background:${c.hex};${c.hex==='#FFFFFF'?'border:2px solid #444':''}"
      title="${c.name}"
      onclick="selectColor('${c.hex}')" id="swatch-${c.hex.replace('#','')}"></button>
  `).join('');
}

function selectColor(hex) {
  state.selectedColor = hex;
  renderColorSwatches();
  updateHarmonyCheck();
  if (state.selectedCostume) generateOutfit();
}
function selectColorByHex(hex) { selectColor(hex); }

function updateHarmonyCheck() {
  const h = document.getElementById('color-harmony');
  if (!state.selectedColor) { h.innerHTML = ''; return; }
  const c = COLORS.find(x => x.hex === state.selectedColor);
  if (!c) return;
  const good = c.good.includes(state.selectedEvent);
  h.innerHTML = good
    ? `<span class="harmony-good"><strong>${c.name}</strong> nằm trong bảng màu gợi ý cho dịp này.</span>`
    : `<span class="harmony-ok"><strong>${c.name}</strong> là lựa chọn phối tự do của bạn.</span>`;
}

// ============================================================
// ACCESSORIES
// ============================================================
function renderAccessoryGrid() {
  const context = currentContext();
  document.getElementById('accessory-grid').innerHTML = ACCESSORIES.map(a => {
    const selected = state.selectedAccessories.has(a.id);
    const { available, reason } = compatibility.getAvailability(a.id, context);
    return `<button type="button" class="acc-btn ${selected ? 'selected' : ''}" aria-pressed="${selected}" aria-disabled="${!available}"
      ${available ? '' : `disabled aria-describedby="acc-reason-${a.id}"`} title="${reason || a.desc}" onclick="toggleAccessory('${a.id}')" id="acc-${a.id}">
      <span class="acc-type">${compatibility.getAccessoryType(a.id)}</span>
      <span class="acc-name">${a.name}</span>
      ${reason ? `<span class="acc-reason" id="acc-reason-${a.id}">${reason}</span>` : ''}
    </button>`;
  }).join('');
}

function toggleAccessory(id) {
  if (state.selectedAccessories.has(id)) state.selectedAccessories.delete(id);
  else {
    const { available, reason } = compatibility.getAvailability(id, currentContext());
    if (!available) { showToast(reason); return; }
    state.selectedAccessories.add(id);
  }
  document.getElementById('accessory-status')?.replaceChildren();
  generateOutfit();
}

function sanitizeSelectedAccessories(announce = false) {
  const previous = [...state.selectedAccessories];
  const clean = compatibility.sanitizeAccessories(previous, currentContext());
  state.selectedAccessories = new Set(clean);
  const removed = ACCESSORIES.filter(item => previous.includes(item.id) && !state.selectedAccessories.has(item.id));
  if (announce && removed.length) {
    const message = `Đã bỏ ${removed.map(item => item.name).join(', ')} khỏi bộ phối mới.`;
    const status = document.getElementById('accessory-status');
    if (status) status.textContent = message;
    showToast(message);
  } else if (announce) document.getElementById('accessory-status')?.replaceChildren();
  return clean;
}

function setAccessories(ids) {
  state.selectedAccessories = new Set(compatibility.sanitizeAccessories(ids, currentContext()));
  generateOutfit();
  return [...state.selectedAccessories];
}

// ============================================================
// STYLE & WEATHER
// ============================================================
function updateStyle(s) { if (!Object.hasOwn(LOOKBOOK_STYLE_NAMES, s)) return; state.selectedStyle = s; generateOutfit(); }

function setWeather(weather, btn) {
  state.selectedWeather = weather;
  document.querySelectorAll('.weather-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('weather-tip').textContent = WEATHER_TIPS[weather].tip;
}

// ============================================================
// GENERATE OUTFIT
// ============================================================
function generateOutfit() {
  if (!state.selectedCostume) { showToast('Hãy chọn loại trang phục trước!'); return; }
  if (!state.selectedColor) { showToast('Hãy chọn màu sắc chủ đạo!'); return; }

  const costume  = COSTUMES.find(c => c.id === state.selectedCostume);
  if (!costume) return;
  sanitizeSelectedAccessories();
  renderAccessoryGrid();
  const colorData = COLORS.find(c => c.hex === state.selectedColor);
  const accessories = ACCESSORIES.filter(a => state.selectedAccessories.has(a.id));
  const style = state.selectedStyle;
  const event = state.selectedEvent;

  document.getElementById('outfit-placeholder').classList.add('hidden');
  document.getElementById('outfit-result').classList.remove('hidden');

  showOutfitResult(costume, colorData, accessories, style, event);
  window.dispatchEvent(new CustomEvent('vietphuc:outfit-change', {detail: {
    costumeId: state.selectedCostume, color: state.selectedColor, accessories: [...state.selectedAccessories], style, event,
  }}));
}

// ---- Render outfit result ----
function showOutfitResult(costume, colorData, accessories, style, event) {
  const figCostume = document.getElementById('figure-costume');
  const figAcc = document.getElementById('figure-accessories');
  const hex = colorData?.hex || '#C0392B';
  const styleLabel = LOOKBOOK_STYLE_NAMES[style];


  figCostume.innerHTML = `
    <div class="mk-result">
      <div class="mk-photo-wrap mk-fallback-wrap">
        <div class="mk-fallback costume-illustration">${costumeIllustration(costume.id, hex)}</div>
        <div class="mk-badge mk-badge-color" style="background:${hex}ee">
          <span class="mk-dot"></span>${colorData?.name || 'Màu tùy chọn'}
        </div>
        <div class="mk-badge mk-badge-style">${styleLabel}</div>
      </div>
      <div class="mk-footer">
        <div class="mk-footer-left">
          <div class="mk-name">${costume.name}</div>
          <div class="mk-sub">${costume.regionLabel} · ${getEventLabel(event)}</div>
        </div>
        <button class="mk-save-btn" onclick="saveLook()" title="Lưu lookbook">Lưu</button>
      </div>
    </div>`;

  // Accessories bar
  figAcc.innerHTML = accessories.length
    ? `<div class="acc-bar">${accessories.map(a => `
        <div class="acc-chip" title="${a.desc}">
          <span class="acc-label">${a.name}</span>
        </div>`).join('')}</div>`
    : `<span class="acc-empty">Chưa chọn phụ kiện – thêm để hoàn thiện outfit</span>`;

  // Tags
  document.getElementById('outfit-tags').innerHTML = `
    <span class="outfit-tag highlight">${styleLabel}</span>
    <span class="outfit-tag" style="background:${hex}22;border-color:${hex}55;color:${hex}">${colorData?.name || 'Màu tùy chọn'}</span>
    ${accessories.slice(0,3).map(a => `<span class="outfit-tag">${a.name}</span>`).join('')}
    ${accessories.length > 3 ? `<span class="outfit-tag">+${accessories.length-3}</span>` : ''}`;

  // Culture card
  document.getElementById('culture-card').classList.remove('hidden');
  document.getElementById('culture-content').innerHTML = `
    <div class="culture-verification">Cần xác minh · Nguồn: chưa có nguồn. Các gợi ý hiện có là nội dung tham khảo, không phải xác nhận phục dựng.</div>
    <p><strong>${costume.name}</strong> – ${costume.shortDesc}</p>
    <p style="margin-top:8px">${costume.culturalTips[0] || ''}</p>
    ${costume.styleSuggestions[style] ? `<p style="margin-top:8px">Gợi ý ${styleLabel}: <em>${costume.styleSuggestions[style]}</em></p>` : ''}`;

  // Warnings
  const warns = [...costume.warnings];
  if (WEATHER_TIPS[state.selectedWeather]?.avoid?.includes(state.selectedCostume))
    warns.push(`Trang phục này không phù hợp lắm với thời tiết ${getWeatherLabel(state.selectedWeather)}.`);
  const wc = document.getElementById('warning-card');
  if (warns.length) {
    wc.classList.remove('hidden');
    document.getElementById('warning-list').innerHTML = warns.map(w => `<li>Cần xác minh nguồn: ${w}</li>`).join('');
  } else wc.classList.add('hidden');

  // Suggestions
  const evSugg = EVENT_SUGGESTIONS[event];
  document.getElementById('suggestion-section').classList.remove('hidden');
  const altC = evSugg?.costumes?.filter(id => id !== state.selectedCostume && COSTUMES.some(costume => costume.id === id)).slice(0,2) || [];
  const altA = evSugg?.accessories?.filter(id => !state.selectedAccessories.has(id) && compatibility.getAvailability(id, currentContext()).available).slice(0,2) || [];
  document.getElementById('suggestion-chips').innerHTML = [
    ...altC.map(id => { const c = COSTUMES.find(x=>x.id===id); return c ? `<button class="suggestion-chip" onclick="selectAndMix('${id}')">Thử ${c.name}</button>` : ''; }),
    ...altA.map(id => { const a = ACCESSORIES.find(x=>x.id===id); return a ? `<button class="suggestion-chip" onclick="toggleAccessory('${id}')">Thêm ${a.name}</button>` : ''; }),
  ].filter(Boolean).join('');

  // Compare
  document.getElementById('comparison-section').classList.remove('hidden');
  const styleNames = { traditional:'Truyền thống', fusion:'Fusion', genz:'Gen Z Bold' };
  document.getElementById('compare-grid').innerHTML = Object.entries(costume.styleSuggestions)
    .filter(([s]) => s !== style).slice(0,2)
    .map(([s, desc]) => `
      <div class="compare-item" onclick="document.querySelector('[name=style][value=${s}]').checked=true;updateStyle('${s}')">
        <div class="ci-name">${styleNames[s]}</div>
        <div class="ci-desc">${desc}</div>
      </div>`).join('');

}

function getEventLabel(e) {
  return { festival:'Lễ hội', tet:'Tết Nguyên Đán', wedding:'Đám cưới', school:'Tốt nghiệp', street:'Street style', ceremony:'Lễ tế' }[e] || e;
}
function getWeatherLabel(w) {
  return { sunny:'nắng nóng', cool:'mát mẻ', rain:'mưa', winter:'lạnh' }[w] || w;
}

// ============================================================
// LOOKBOOK
// ============================================================
async function saveLook(snapshot) {
  if (!state.selectedCostume || !state.selectedColor) { showToast('Tạo outfit trước khi lưu!'); return; }
  if (!snapshot) {
    try { snapshot = await window.VietPhucStudio?.captureSnapshot(); }
    catch { showToast('Chưa chụp được bản phối. Hãy thử lại hoặc dùng nút Chụp look để tải ảnh.'); return; }
  }
  const costumeId = snapshot?.studioConfig?.costumeId || state.selectedCostume;
  const savedColor = snapshot?.studioConfig?.color || state.selectedColor;
  const costume = COSTUMES.find(c => c.id === costumeId);
  if (!costume) return;
  const colorData = COLORS.find(c => c.hex === savedColor);
  const savedStyle = snapshot?.outfitMeta?.style || state.selectedStyle;
  const savedEvent = snapshot?.outfitMeta?.event || state.selectedEvent;
  const look = normaliseStoredLook({
    id: Date.now(),
    costumeId,
    costumeName: costume.name,
    costumeEmoji: costume.emoji,
    color: savedColor,
    image: snapshot?.image || null,
    studioConfig: snapshot?.studioConfig || null,
    colorName: colorData?.name || '',
    accessories: snapshot?.outfitMeta?.accessories || [...state.selectedAccessories],
    style: savedStyle,
    styleName: { traditional:'Truyền thống', fusion:'Fusion', genz:'Gen Z Bold' }[savedStyle],
    event: savedEvent,
    eventName: getEventLabel(savedEvent),
    savedAt: new Date().toLocaleDateString('vi-VN'),
  });
  if (!look) { showToast('Chưa lưu được bộ phối. Hãy chọn lại trang phục và màu sắc.'); return; }
  state.lookbook.unshift(look);
  const persisted = persistLookbook();
  renderLookbook();
  showToast(persisted ? 'Đã lưu ảnh vào lookbook!' : storageIssue);
}

function renderLookbook() {
  const grid = document.getElementById('lookbook-grid');
  const empty = document.getElementById('lookbook-empty');
  const actions = document.getElementById('lookbook-actions');
  if (state.lookbook.length === 0) { empty.classList.remove('hidden'); grid.innerHTML = ''; actions.classList.add('hidden'); return; }
  empty.classList.add('hidden'); actions.classList.remove('hidden');
  grid.innerHTML = state.lookbook.map(look => {
    const accessoryNames = ACCESSORIES.filter(a => look.accessories.includes(a.id)).map(a => a.name).slice(0,4);
    const cover = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(look.image || '')
      ? `<img class="lb-photo" src="${look.image}" alt="${look.costumeName}" loading="lazy" />`
      : `<div class="lb-illustration-cover costume-illustration" style="background:linear-gradient(135deg,${look.color}44,${look.color}11)">${costumeIllustration(look.costumeId, look.color, look.studioConfig?.body?.gender)}</div>`;
    return `
      <div class="lookbook-item">
        <div class="lookbook-item-cover">
          ${cover}
          <button class="lookbook-item-delete" aria-label="Xóa ${look.costumeName} khỏi lookbook" onclick="deleteLook(${look.id})">Xóa</button>
          <div class="lb-style-tag">${look.styleName}</div>
        </div>
        <div class="lookbook-item-body">
          <div class="lookbook-item-name">${look.costumeName}</div>
          <div class="lookbook-item-event">${look.eventName} · ${look.savedAt}</div>
          <div class="lookbook-item-tags">
            <span class="outfit-tag" style="background:${look.color}22;border-color:${look.color}55;color:${look.color};font-size:11px">${look.colorName}</span>
            ${accessoryNames.map(name => `<span class="outfit-tag">${name}</span>`).join('')}
          </div>
          ${look.studioConfig ? `<button class="btn-sm btn-sm-ghost" onclick="restoreLook(${look.id})">Mở lại phối đồ</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function deleteLook(id) {
  state.lookbook = state.lookbook.filter(l => l.id !== id);
  persistLookbook();
  renderLookbook();
  showToast('Đã xóa khỏi lookbook');
}
function clearLookbook() {
  if (!confirm('Xóa toàn bộ lookbook?')) return;
  state.lookbook = [];
  persistLookbook();
  renderLookbook();
  showToast('Đã xóa lookbook');
}
function exportLookbook() {
  const data = state.lookbook.map(l => `${l.costumeName}\n   Sự kiện: ${l.eventName}\n   Màu sắc: ${l.colorName}\n   Phong cách: ${l.styleName}\n   Ngày lưu: ${l.savedAt}\n`).join('\n');
  const blob = new Blob([`LOOKBOOK VIỆT PHỤC REMIX\n${'='.repeat(40)}\n\n${data}`], { type:'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'viet-phuc-lookbook.txt'; a.click();
  showToast('Đã xuất lookbook!');
}
async function shareLook() {
  const text = state.selectedCostume
    ? `Tôi vừa phối outfit ${COSTUMES.find(c=>c.id===state.selectedCostume)?.name} trên Việt Phục Remix! #ViệtPhục #GenZ`
    : 'Khám phá Việt Phục Remix! #ViệtPhục #GenZ';
  try {
    if (navigator.share) await navigator.share({ title:'Việt Phục Remix', text });
    else if (navigator.clipboard) { await navigator.clipboard.writeText(text); showToast('Đã sao chép!'); }
    else { showToast('Trình duyệt chưa hỗ trợ chia sẻ. Bạn có thể chụp look để tải ảnh.'); }
  } catch (error) { if (error.name !== 'AbortError') showToast('Chưa chia sẻ được. Bạn có thể chụp look để tải ảnh.'); }
}
function restoreLook(id) {
  const look = normaliseStoredLook(state.lookbook.find(l => l.id === id)); if (!look) return;
  state.selectedCostume = look.costumeId; state.selectedColor = look.color;
  state.selectedAccessories = new Set(look.accessories); state.selectedStyle = look.style;
  state.selectedEvent = look.event;
  document.querySelectorAll('.event-btn').forEach(b=>b.classList.toggle('active',b.dataset.event===look.event));
  document.querySelectorAll('[name=style]').forEach(input=>input.checked=input.value===look.style);
  renderCostumePills(); renderColorSwatches(); renderAccessoryGrid(); generateOutfit();
  if (look.studioConfig) window.VietPhucStudio?.restore(look.studioConfig);
  scrollToMixer();
}
window.VietPhucRemix = {setAccessories, getOutfit:()=>({costumeId:state.selectedCostume,color:state.selectedColor,accessories:[...state.selectedAccessories],style:state.selectedStyle,event:state.selectedEvent})};

// ============================================================
// CULTURE TABS
// ============================================================
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['history','rules','regions','modern'].forEach(t => {
    document.getElementById(`tab-${t}-content`)?.classList.toggle('hidden', t !== tab);
  });
}

function renderTimeline() {
  document.getElementById('timeline').innerHTML = TIMELINE_DATA.map((item, i) => `
    <div class="timeline-item" style="animation-delay:${i*0.1}s">
      <div class="timeline-year">${item.year}</div>
      <div class="timeline-title">${item.title}</div>
      <div class="timeline-desc">${item.desc}</div>
    </div>`).join('');
}
function renderCultureRules() {
  document.getElementById('rules-grid').innerHTML = CULTURE_RULES.map((r,i) => `
    <div class="rule-card rule-type-${r.type}" style="animation-delay:${i*0.07}s">
      <div class="rule-type-label">${r.type === 'do' ? 'Gợi ý' : 'Lưu ý'}</div>
      <div class="rule-title">${r.title}</div>
      <div class="rule-desc">${r.desc}</div>
    </div>`).join('');
}
function renderRegions() {
  document.getElementById('regions-map').innerHTML = REGIONS.map((r,i) => `
    <div class="region-card" style="animation-delay:${i*0.08}s">
      <div class="region-header">
        <div><div class="region-name">${r.name}</div><div style="font-size:12px;color:rgba(245,237,216,0.5)">${r.desc}</div></div>
      </div>
      <div class="region-costumes">${r.costumes.map(c=>`<span class="region-costume-tag">${c}</span>`).join('')}</div>
    </div>`).join('');
}
function renderModernTrends() {
  document.getElementById('modern-grid').innerHTML = MODERN_TRENDS.map((t,i) => `
    <div class="modern-card" style="animation-delay:${i*0.08}s">
      <h3>${t.title}</h3>
      <p>${t.desc}</p>
    </div>`).join('');
}

// ============================================================
// TOAST
// ============================================================
let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3500);
}

// ============================================================
// INTERSECTION OBSERVER
// ============================================================
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='none'; } });
}, { threshold: 0.1 });
document.querySelectorAll('.costume-card,.rule-card,.region-card,.modern-card,.timeline-item').forEach(el => observer.observe(el));
