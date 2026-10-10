// ============================================================
// APP.JS – complete-photo mapping and local lookbook
// ============================================================

let storageIssue = '';
const LOOKBOOK_STUDIO_IDS = {
  outer: COSTUMES.map(costume => costume.id),
  inner: ['inner-yem'], bottom: ['trousers'], belt: ['silk-belt'],
  headwear: ['non-la', 'non-quai-thao', 'khan-van', 'tram-cai'],
  accessory: ['earrings', 'woven-bag', 'vong-co', 'vong-tay', 'quat-lua'], footwear: ['wooden-clogs', 'hai-cong'],
};
const uiT = (key, params) => window.VietPhucLocale.t(key, params);
const uiLabel = (kind, id) => window.VietPhucLocale.label(kind, id);
const compatibility = window.VietPhucCompatibility;
const currentContext = () => ({ costumeId: state.selectedCostume, gender: state.selectedGender, accessories: [...state.selectedAccessories], style: state.selectedStyle, event: state.selectedEvent });
const costumeIllustration = (id, color, gender) => window.VietPhucIllustration?.(id, color, gender) || '<div class="illustration-placeholder" aria-hidden="true"></div>';
const LOOKBOOK_HAIR_IDS = ['bun', 'bob', 'long', 'braid', 'short', 'ponytail', 'wavy', 'buzz'];
const LOOKBOOK_STYLE_NAMES = { traditional: uiT('style.traditional'), fusion: uiT('style.fusion'), genz: uiT('style.genz') };
const LOOKBOOK_EVENT_IDS = ['festival', 'tet', 'wedding', 'school', 'street', 'ceremony'];
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const safeLookColor = (value, fallback) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : fallback;
const safeLookNumber = (value, fallback, min, max) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

function safeLookDate(value) {
  if (typeof value !== 'string') return uiT('look.dateMissing');
  const parts = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (!parts) return uiT('look.dateMissing');
  const [, day, month, year] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 1900 && year <= 2200 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? `${day}/${month}/${year}` : uiT('look.dateMissing');
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
  if (!compatibility.getCostumeAvailability(costumeId, sourceBody.gender === 'male' ? 'male' : 'female').available) return null;
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
    color, colorName: colorData?.name || uiT('color.custom'),
    image: safeLookImage(value.image), studioConfig: normaliseStudioLook(value.studioConfig, costume.id, color, accessories),
    accessories, style, styleName: LOOKBOOK_STYLE_NAMES[style], event, eventName: getEventLabel(event), savedAt: safeLookDate(value.savedAt),
  };
}

function readLookbook() {
  try {
    const value = JSON.parse(localStorage.getItem('vietPhucLookbook') || '[]');
    if (!Array.isArray(value)) { storageIssue = uiT('storage.readError'); return []; }
    const ids = new Set();
    return value.map(normaliseStoredLook).filter(look => {
      if (!look || ids.has(look.id)) return false;
      ids.add(look.id); return true;
    });
  } catch { storageIssue = uiT('storage.readError'); return []; }
}
function persistLookbook() {
  try { localStorage.setItem('vietPhucLookbook', JSON.stringify(state.lookbook)); return true; }
  catch { storageIssue = uiT('storage.writeError'); return false; }
}
let state = {
  selectedCostume: 'ao-dai',
  selectedGender: 'female',
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
          <span class="costume-card-tag region">${c.needsVerification ? uiT('ui.region_verification_pending') : c.regionLabel}</span>
          ${(c.needsVerification ? [uiT('ui.existing_photo_sample')] : c.tags.slice(0,2)).map(t => `<span class="costume-card-tag">${t}</span>`).join('')}
        </div>
        <h3>${uiLabel('costume',c.id)}</h3>
        <p>${c.needsVerification ? uiT('ui.supplied_outfit_photo_cultural_information_awaits_verification') : c.shortDesc}</p>
        <div class="costume-card-actions">
          <button class="btn-sm btn-sm-primary" ${compatibility.getCostumeAvailability(c.id,state.selectedGender).available ? '' : 'disabled'} onclick="event.stopPropagation();selectAndMix('${c.id}')">${uiT('ui.style')}</button>
          <button class="btn-sm btn-sm-ghost" onclick="event.stopPropagation();openCostumeModal('${c.id}')">${uiT('ui.details')}</button>
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

let openedCostumeId=null;
function openCostumeModal(id) {
  openedCostumeId=id;
  const c = COSTUMES.find(x => x.id === id);
  if (!c) return;
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-tag">${c.needsVerification ? uiT('ui.region_verification_pending') : c.regionLabel}</div>
    <h2>${uiLabel('costume',c.id)}</h2>
    <div class="modal-costume-preview costume-illustration">${costumeIllustration(c.id, c.color)}</div>
    <div class="culture-verification">${uiT('ui.verification_needed_sources_pending')}</div>
    <p>${c.needsVerification ? uiT('ui.a_photo_sample_for_browsing_and_selecting_outfits_historical_reconstruction_is_not_verifie') : c.desc}</p>
    <div class="modal-section"><h3>${uiT('ui.origins_and_history')}</h3><p>${c.needsVerification ? uiT('ui.todo_add_sources_for_structure_period_and_regional_use_before_publication') : c.origin}</p></div>
    <div class="modal-section"><h3>${uiT('ui.using_this_look')}</h3><p>${uiT('ui.choose_an_outfit_occasion_and_accessories_existing_matching_photos_are_shown_missing_combi')}</p></div>
    <div style="margin-top:24px;display:flex;gap:12px">
      <button class="btn-primary" ${compatibility.getCostumeAvailability(c.id,state.selectedGender).available ? '' : 'disabled'} onclick="selectAndMix('${c.id}');closeModal()">${uiT('ui.start_styling')}</button>
      <button class="btn-ghost" onclick="closeModal()">${uiT('ui.close')}</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() { openedCostumeId=null; document.getElementById('modal-overlay').classList.add('hidden'); }

function selectAndMix(id) {
  if (!COSTUMES.some(costume => costume.id === id)) return;
  const availability = compatibility.getCostumeAvailability(id,state.selectedGender);
  if (!availability.available) { showToast(availability.reason); return; }
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
      ${compatibility.getCostumeAvailability(c.id,state.selectedGender).available ? '' : 'disabled aria-describedby="costume-body-status"'}
      onclick="selectCostumePill('${c.id}')" id="pill-${c.id}">
      <span class="costume-pill-preview costume-illustration">${costumeIllustration(c.id, c.color)}</span>
      <span class="costume-pill-name">${uiLabel('costume',c.id)}</span>
    </button>
  `).join('');
  const status = document.getElementById('costume-body-status');
  if (status) status.textContent = state.selectedGender === 'male' ? uiT('ui.male_body_only_male_ngu_than_and_giao_linh_are_available_other_outfits_are_locked') : uiT('ui.female_body_uses_the_female_ngu_than_and_all_seven_supplied_outfit_types');
}

function selectCostumePill(id) {
  if (!COSTUMES.some(costume => costume.id === id)) return;
  const availability = compatibility.getCostumeAvailability(id,state.selectedGender);
  if (!availability.available) { showToast(availability.reason); return; }
  state.selectedCostume = id;
  sanitizeSelectedAccessories(true);
  renderCostumePills();
  const evSugg = EVENT_SUGGESTIONS[state.selectedEvent];
  if (evSugg?.colors?.[0] && !state.selectedColor) selectColorByHex(evSugg.colors[0]);
  generateOutfit();
}

function setGender(gender, costumeId = state.selectedCostume) {
  let selectedGender = gender === 'male' ? 'male' : 'female';
  let selectedCostume = compatibility.sanitizeCostume(costumeId, selectedGender);
  if (!selectedCostume) {
    selectedGender = 'female';
    selectedCostume = compatibility.sanitizeCostume(costumeId, selectedGender);
    showToast(uiT('availability.maleFallback'));
  } else if (selectedCostume !== costumeId) showToast(uiT('availability.maleSelected'));
  state.selectedGender = selectedGender;
  state.selectedCostume = selectedCostume;
  sanitizeSelectedAccessories(true);
  renderCostumePills(); renderCostumeGrid(state.filterRegion); generateOutfit();
  return selectedGender;
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
      title="${uiLabel('color',c.hex)}"
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
    ? `<span class="harmony-good"><strong>${uiLabel('color',c.hex)}</strong> ${uiT('color.suggestedSuffix')}</span>`
    : `<span class="harmony-ok"><strong>${uiLabel('color',c.hex)}</strong> ${uiT('color.freeSuffix')}</span>`;
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
      ${available ? '' : `disabled aria-describedby="acc-reason-${a.id}"`} title="${reason || (a.needsVerification ? uiT('ui.demo_preset_verification_pending') : a.desc)}" onclick="toggleAccessory('${a.id}')" id="acc-${a.id}">
      <span class="acc-type">${compatibility.getAccessoryType(a.id)}</span>
      <span class="acc-name">${uiLabel('accessory',a.id)}</span>
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
    const message = uiT('availability.removed',{names:{keys:removed.map(item=>'accessory.'+item.id)}});
    const status = document.getElementById('accessory-status');
    if (status) window.VietPhucLocale.trackText(status,message);
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
  document.getElementById('weather-tip').textContent = uiT('ui.weather_is_a_reference_note_choose_suitable_fabric_when_wearing_an_outfit_app_photos_stay_');
}

// ============================================================
// GENERATE OUTFIT
// ============================================================
function generateOutfit() {
  if (!state.selectedCostume) { showToast(uiT('selection.chooseCostume')); return; }
  if (!state.selectedColor) { showToast(uiT('selection.chooseColor')); return; }
  if (!compatibility.getCostumeAvailability(state.selectedCostume,state.selectedGender).available) {
    setGender(state.selectedGender); return;
  }

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
    costumeId: state.selectedCostume, body: {gender: state.selectedGender}, color: state.selectedColor, accessories: [...state.selectedAccessories], style, event,
  }}));
}

// ---- Render outfit result ----
function showOutfitResult(costume, colorData, accessories, style, event) {
  const figCostume = document.getElementById('figure-costume');
  const figAcc = document.getElementById('figure-accessories');
  const hex = colorData?.hex || '#C0392B';
  const styleLabel = uiLabel('style',style);


  figCostume.innerHTML = `
    <div class="mk-result">
      <div class="mk-photo-wrap mk-fallback-wrap">
        <div class="mk-fallback costume-illustration">${costumeIllustration(costume.id, hex)}</div>
        <div class="mk-badge mk-badge-color" style="background:${hex}ee">
          <span class="mk-dot"></span>${colorData ? uiLabel('color',colorData.hex) : uiT('color.custom')}
        </div>
        <div class="mk-badge mk-badge-style">${styleLabel}</div>
      </div>
      <div class="mk-footer">
        <div class="mk-footer-left">
          <div class="mk-name">${uiLabel('costume',costume.id)}</div>
          <div class="mk-sub">${uiT('ui.region_verification_pending')} · ${getEventLabel(event)}</div>
        </div>
        <button class="mk-save-btn" onclick="saveLook()" title="${uiT('ui.save_looks')}">${uiT('look.save')}</button>
      </div>
    </div>`;

  // Accessories bar
  figAcc.innerHTML = accessories.length
    ? `<div class="acc-bar">${accessories.map(a => `
        <div class="acc-chip" title="${uiT('ui.demo_preset_verification_pending')}">
          <span class="acc-label">${uiLabel('accessory',a.id)}</span>
        </div>`).join('')}</div>`
    : `<span class="acc-empty">${uiT('ui.no_accessory_notes_selected')}</span>`;

  // Tags
  document.getElementById('outfit-tags').innerHTML = `
    <span class="outfit-tag highlight">${styleLabel}</span>
    <span class="outfit-tag" style="background:${hex}22;border-color:${hex}55;color:${hex}">${colorData ? uiLabel('color',colorData.hex) : uiT('color.custom')}</span>
    ${accessories.slice(0,3).map(a => `<span class="outfit-tag">${uiLabel('accessory',a.id)}</span>`).join('')}
    ${accessories.length > 3 ? `<span class="outfit-tag">+${accessories.length-3}</span>` : ''}`;

  // Culture card
  document.getElementById('culture-card').classList.remove('hidden');
  document.getElementById('culture-content').innerHTML = `
    <div class="culture-verification">${uiT('ui.verification_needed_sources_pending_these_sample_selections_are_not_verified_historical_re')}</div>
    <p><strong>${uiLabel('costume',costume.id)}</strong> ${uiT('ui.supplied_sample_photo')}</p>
    <p>${uiT('ui.todo_add_sources_for_structure_period_region_and_combinations_body_and_accessory_restricti')}</p>`;

  // Warnings
  const warns = costume.needsVerification ? [] : [...costume.warnings];
  if (!WEATHER_TIPS[state.selectedWeather]?.needsVerification && WEATHER_TIPS[state.selectedWeather]?.avoid?.includes(state.selectedCostume))
    warns.push(uiT('weather.warning',{weather:{key:'weather.'+state.selectedWeather}}));
  const wc = document.getElementById('warning-card');
  if (warns.length) {
    wc.classList.remove('hidden');
    document.getElementById('warning-list').innerHTML = warns.map(w => `<li>${uiT('culture.needsSource',{text:w})}</li>`).join('');
  } else wc.classList.add('hidden');

  // Suggestions
  const evSugg = EVENT_SUGGESTIONS[event];
  document.getElementById('suggestion-section').classList.remove('hidden');
  const altC = evSugg?.costumes?.filter(id => id !== state.selectedCostume && COSTUMES.some(costume => costume.id === id) && compatibility.getCostumeAvailability(id,state.selectedGender).available).slice(0,2) || [];
  const altA = evSugg?.accessories?.filter(id => !state.selectedAccessories.has(id) && compatibility.getAvailability(id, currentContext()).available).slice(0,2) || [];
  document.getElementById('suggestion-chips').innerHTML = [
    ...altC.map(id => { const c = COSTUMES.find(x=>x.id===id); return c ? `<button class="suggestion-chip" onclick="selectAndMix('${id}')">${uiT('selection.try',{name:{key:'costume.'+id}})}</button>` : ''; }),
    ...altA.map(id => { const a = ACCESSORIES.find(x=>x.id===id); return a ? `<button class="suggestion-chip" onclick="toggleAccessory('${id}')">${uiT('selection.add',{name:{key:'accessory.'+id}})}</button>` : ''; }),
  ].filter(Boolean).join('');

  // Compare
  document.getElementById('comparison-section').classList.remove('hidden');
  window.renderCompareBoard?.();

}

function getEventLabel(e) {
  return { festival:uiT('event.festival'), tet:uiT('event.tet'), wedding:uiT('event.wedding'), school:uiT('event.school'), street:uiT('event.street'), ceremony:uiT('event.ceremony') }[e] || e;
}
function getWeatherLabel(w) {
  return uiLabel('weather',w);
}

// ============================================================
// LOOKBOOK
// ============================================================
async function saveLook(snapshot) {
  if (!state.selectedCostume || !state.selectedColor) { showToast(uiT('look.saveFirst')); return; }
  if (!snapshot) {
    try { snapshot = await window.VietPhucStudio?.captureSnapshot(); }
    catch { showToast(uiT('look.captureError')); return; }
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
    styleName: { traditional:uiT('style.traditional'), fusion:uiT('style.fusion'), genz:uiT('style.genz') }[savedStyle],
    event: savedEvent,
    eventName: getEventLabel(savedEvent),
    savedAt: new Date().toLocaleDateString('vi-VN'),
  });
  if (!look) { showToast(uiT('look.invalid')); return; }
  state.lookbook.unshift(look);
  const persisted = persistLookbook();
  renderLookbook();
  showToast(persisted ? uiT('ui.photo_saved_to_your_lookbook') : storageIssue);
}

function lookLabels(look) {
  return {name:uiLabel('costume',look.costumeId),event:getEventLabel(look.event),style:uiLabel('style',look.style),color:COLORS.some(c=>c.hex.toUpperCase()===look.color.toUpperCase())?uiLabel('color',look.color):uiT('color.custom'),date:/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(look.savedAt)?look.savedAt:uiT('look.dateMissing')};
}
function renderLookbook() {
  const grid = document.getElementById('lookbook-grid');
  const empty = document.getElementById('lookbook-empty');
  const actions = document.getElementById('lookbook-actions');
  if (state.lookbook.length === 0) { empty.classList.remove('hidden'); grid.innerHTML = ''; actions.classList.add('hidden'); return; }
  empty.classList.add('hidden'); actions.classList.remove('hidden');
  grid.innerHTML = state.lookbook.map(look => {
    const labels=lookLabels(look);
    const accessoryNames = ACCESSORIES.filter(a => look.accessories.includes(a.id)).map(a => uiLabel('accessory',a.id)).slice(0,4);
    const cover = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(look.image || '')
      ? `<img class="lb-photo" src="${look.image}" alt="${labels.name}" loading="lazy" />`
      : `<div class="lb-illustration-cover costume-illustration" style="background:linear-gradient(135deg,${look.color}44,${look.color}11)">${costumeIllustration(look.costumeId, look.color, look.studioConfig?.body?.gender)}</div>`;
    return `
      <div class="lookbook-item">
        <div class="lookbook-item-cover">
          ${cover}
          <button class="lookbook-item-delete" aria-label="${uiT('look.deleteLabel',{name:{key:'costume.'+look.costumeId}})}" onclick="deleteLook(${look.id})">${uiT('ui.delete')}</button>
          <div class="lb-style-tag">${labels.style}</div>
        </div>
        <div class="lookbook-item-body">
          <div class="lookbook-item-name">${labels.name}</div>
          <div class="lookbook-item-event">${labels.event} · ${labels.date}</div>
          <div class="lookbook-item-tags">
            <span class="outfit-tag" style="background:${look.color}22;border-color:${look.color}55;color:${look.color};font-size:11px">${labels.color}</span>
            ${accessoryNames.map(name => `<span class="outfit-tag">${name}</span>`).join('')}
          </div>
          ${look.studioConfig ? `<button class="btn-sm btn-sm-ghost" onclick="restoreLook(${look.id})">${uiT('ui.open_this_look')}</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function deleteLook(id) {
  state.lookbook = state.lookbook.filter(l => l.id !== id);
  persistLookbook();
  renderLookbook();
  showToast(uiT('ui.look_removed'));
}
function clearLookbook() {
  if (!confirm(uiT('look.confirmClear'))) return;
  state.lookbook = [];
  persistLookbook();
  renderLookbook();
  showToast(uiT('ui.lookbook_cleared'));
}
function restoreLook(id) {
  const look = normaliseStoredLook(state.lookbook.find(l => l.id === id)); if (!look) return;
  if (!look.studioConfig) { showToast(uiT('look.restoreInvalid')); return; }
  state.selectedGender = look.studioConfig.body.gender;
  state.selectedCostume = look.costumeId; state.selectedColor = look.color;
  state.selectedAccessories = new Set(look.accessories); state.selectedStyle = look.style;
  state.selectedEvent = look.event;
  document.querySelectorAll('.event-btn').forEach(b=>b.classList.toggle('active',b.dataset.event===look.event));
  document.querySelectorAll('[name=style]').forEach(input=>input.checked=input.value===look.style);
  renderCostumePills(); renderCostumeGrid(state.filterRegion); renderColorSwatches(); renderAccessoryGrid(); generateOutfit();
  if (look.studioConfig) window.VietPhucStudio?.restore(look.studioConfig);
  scrollToMixer();
}
window.VietPhucRemix = {setAccessories, setGender, getOutfit:()=>({costumeId:state.selectedCostume,body:{gender:state.selectedGender},color:state.selectedColor,accessories:[...state.selectedAccessories],style:state.selectedStyle,event:state.selectedEvent})};

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

// ============================================================
// TOAST
// ============================================================
let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  window.VietPhucLocale.trackText(t,msg); t.classList.add('show');
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

// Only presentation is rebuilt; selected IDs, snapshot pixels and storage stay intact.
window.addEventListener('vietphuc:language-change',()=>{
  renderCostumeGrid(state.filterRegion);renderCostumePills();renderColorSwatches();renderAccessoryGrid();renderLookbook();updateHarmonyCheck();
  const costume=COSTUMES.find(c=>c.id===state.selectedCostume);
  if(costume)showOutfitResult(costume,COLORS.find(c=>c.hex===state.selectedColor),ACCESSORIES.filter(a=>state.selectedAccessories.has(a.id)),state.selectedStyle,state.selectedEvent);
  if(openedCostumeId)openCostumeModal(openedCostumeId);
});
