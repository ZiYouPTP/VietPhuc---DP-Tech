// ============================================================
// APP.JS – complete-photo mapping and local lookbook
// ============================================================

let storageIssue = '';
const LOOKBOOK_STUDIO_IDS = {
  outer: COSTUMES.map(costume => costume.id),
  inner: ['inner-yem'], bottom: ['trousers'], belt: [],
  headwear: ACCESSORIES.filter(item => item.type === 'headwear').map(item => item.id),
  hairAdornment: ['tram-cai'], accessory: ['tram-cai'],
  footwear: ACCESSORIES.filter(item => item.type === 'footwear').map(item => item.id),
};
const uiT = (key, params) => window.VietPhucLocale.t(key, params);
const uiLabel = (kind, id) => window.VietPhucLocale.label(kind, id);
const compatibility = window.VietPhucCompatibility;
const currentContext = () => ({ costumeId: state.selectedCostume, gender: state.selectedGender, accessories: [...state.selectedAccessories], style: state.selectedStyle, event: state.selectedEvent });
const colorContext = () => ({ ...currentContext(), body: {gender:state.selectedGender}, color:state.selectedColor, colorId:state.selectedColorId, variantId:state.selectedVariantId });
const currentColorOptions = () => window.VietPhucPhotoMapping?.getColorOptions(colorContext()) || [];
const costumeAvailability = (id, gender=state.selectedGender) => compatibility.getCostumeAvailability(id,gender,{event:state.selectedEvent});
const colorStepReady = () => !window.VietPhucColorHarmony || state.accessoriesConfirmed && compatibility.hasExactCombination([...state.selectedAccessories],currentContext());
let colorRecommendation=null;
function safeColorSelection(colorId, config) {
  if (typeof colorId !== 'string') return null;
  return window.VietPhucPhotoMapping?.getColorOptions(config).some(item => item.id === colorId && item.available) ? colorId : null;
}
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

function normaliseStudioLook(value, costumeId, color, accessories = [], colorId = null, event = 'festival') {
  if (!isRecord(value) || !LOOKBOOK_STUDIO_IDS.outer.includes(costumeId)) return null;
  const sourceBody = isRecord(value.body) ? value.body : {};
  if (!compatibility.getCostumeAvailability(costumeId, sourceBody.gender === 'male' ? 'male' : 'female',{event}).available) return null;
  const sourceSlots = isRecord(value.slots) ? value.slots : {};
  const defaultMaterial = { 'ao-dai': 'silk', 'ao-tu-than': 'linen', 'ao-ngu-than': 'brocade', 'ao-ba-ba': 'linen', 'ao-nhat-binh': 'brocade', 'ao-yem': 'silk', 'ao-giao-linh': 'linen' }[costumeId];
  const body = {
    shape: safeLookNumber(sourceBody.shape, 0, -0.35, 0.35),
    height: safeLookNumber(sourceBody.height, 1.75, 1.55, 1.90),
    skin: safeLookColor(sourceBody.skin, '#CC9874').toLowerCase(),
    hair: LOOKBOOK_HAIR_IDS.includes(sourceBody.hair) ? sourceBody.hair : 'bun',
    gender: sourceBody.gender === 'male' ? 'male' : 'female',
  };
  const slots = { outer: costumeId, inner: costumeId === 'ao-tu-than' ? 'inner-yem' : null, bottom: 'trousers', belt: null, headwear: null, footwear: null, hairAdornment: null, accessory: [] };
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
  const cleanAccessories = compatibility.sanitizeAccessories(accessories, { costumeId, gender: body.gender });
  Object.assign(slots, compatibility.toStudioSlots(cleanAccessories, { costumeId, gender: body.gender }));
  const activeImageIds = [costumeId,...cleanAccessories,...(slots.bottom?['trousers']:[]),...(slots.inner?['inner-yem']:[])];
  const matched = window.VietPhucPhotoMapping?.resolve({costumeId,color,colorId,event,body,accessories:cleanAccessories,variantId:colorId?value.variantId:null});
  return {
    costumeId, color, colorId, event,
    variantId: matched?.sourceKind === 'recolor' ? matched.variantId : null,
    sourceCombinationId: matched?.sourceCombinationId || matched?.combinationId || null,
    imageCombinationId: matched?.combinationId || null,
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
  const gender = value.studioConfig?.body?.gender === 'male' ? 'male' : 'female';
  const accessories = compatibility.sanitizeAccessories(value.accessories, { costumeId: costume.id, gender, style, event });
  const claimedColorId = Object.hasOwn(value, 'colorId') ? value.colorId : value.studioConfig?.colorId;
  const colorId = safeColorSelection(claimedColorId, {costumeId:costume.id,body:{gender},accessories,event});
  const studioConfig = normaliseStudioLook(value.studioConfig, costume.id, color, accessories, colorId, event);
  const staleVariant = typeof value.studioConfig?.variantId === 'string' && studioConfig?.variantId !== value.studioConfig.variantId;
  const staleColor = typeof claimedColorId === 'string' && claimedColorId !== colorId;
  const requestedAccessories = Array.isArray(value.accessories) ? [...new Set(value.accessories)] : [];
  const staleAccessories = requestedAccessories.length !== accessories.length || requestedAccessories.some(id => !accessories.includes(id));
  const claimedSource = value.studioConfig?.sourceCombinationId;
  const staleSource = typeof claimedSource === 'string' && claimedSource !== studioConfig?.sourceCombinationId;
  const staleImage = typeof value.studioConfig?.imageCombinationId === 'string' && value.studioConfig.imageCombinationId !== studioConfig?.imageCombinationId;
  const colorData = COLORS.find(item => item.hex.toUpperCase() === color);
  // Reconstruct display text from trusted catalogs; persisted labels are ignored.
  return {
    id: value.id, costumeId: costume.id, costumeName: costume.name, costumeEmoji: costume.emoji,
    color, colorId, colorName: colorId ? colorData?.name || uiT('color.custom') : uiT('color.originalPhoto'),
    image: staleColor || staleVariant || staleAccessories || staleSource || staleImage ? null : safeLookImage(value.image), studioConfig,
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
  selectedColorId: null,
  selectedVariantId: null,
  selectedAccessories: new Set(),
  accessoriesConfirmed: false,
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
window.addEventListener('vietphuc:photo-error', () => {
  generateOutfit();renderCostumePills();renderCostumeGrid(state.filterRegion);
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
  const knowledge=window.VietPhucCulture;
  const list = filter === 'all' ? COSTUMES : COSTUMES.filter(c => knowledge?.getProfile(c.id)?.regionIds.includes(filter) ?? c.region === filter);
  grid.innerHTML = list.map((c, i) => `
    <div class="costume-card" style="animation-delay:${i*0.07}s" data-region="${c.region}" onclick="openCostumeModal('${c.id}')">
      <div class="costume-card-img costume-illustration" style="background:${c.bgGradient}">
        ${costumeIllustration(c.id, c.color)}
      </div>
      <div class="costume-card-body">
        <div class="costume-card-tags">
          <span class="costume-card-tag region">${knowledge?.regionLabel(c.id) || (c.needsVerification ? uiT('ui.region_verification_pending') : c.regionLabel)}</span>
          ${(c.needsVerification ? [] : c.tags.slice(0,2)).map(t => `<span class="costume-card-tag">${t}</span>`).join('')}
        </div>
        <h3>${uiLabel('costume',c.id)}</h3>
        <p>${knowledge?.summary(c.id) || (c.needsVerification ? uiT('ui.supplied_outfit_photo_cultural_information_awaits_verification') : c.shortDesc)}</p>
        <div class="costume-card-actions">
          <button class="btn-sm btn-sm-primary" ${costumeAvailability(c.id).available ? '' : 'disabled'} title="${costumeAvailability(c.id).reason}" onclick="event.stopPropagation();selectAndMix('${c.id}')">${uiT('ui.style')}</button>
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
    <div class="modal-tag">${window.VietPhucCulture?.regionLabel(c.id) || (c.needsVerification ? uiT('ui.region_verification_pending') : c.regionLabel)}</div>
    <h2>${uiLabel('costume',c.id)}</h2>
    <div class="modal-costume-preview costume-illustration">${costumeIllustration(c.id, c.color)}</div>
    ${window.VietPhucCulture?.detail(c.id) || `<div class="culture-verification">${uiT('ui.verification_needed_sources_pending')}</div>
    <p>${c.needsVerification ? uiT('ui.a_photo_sample_for_browsing_and_selecting_outfits_historical_reconstruction_is_not_verifie') : c.desc}</p>
    <div class="modal-section"><h3>${uiT('ui.origins_and_history')}</h3><p>${c.needsVerification ? uiT('ui.todo_add_sources_for_structure_period_and_regional_use_before_publication') : c.origin}</p></div>`}
    <div class="modal-section"><h3>${uiT('ui.using_this_look')}</h3><p>${uiT('ui.choose_an_outfit_occasion_and_accessories_existing_matching_photos_are_shown_missing_combi')}</p></div>
    <div style="margin-top:24px;display:flex;gap:12px">
      <button class="btn-primary" ${costumeAvailability(c.id).available ? '' : 'disabled'} title="${costumeAvailability(c.id).reason}" onclick="selectAndMix('${c.id}');closeModal()">${uiT('ui.start_styling')}</button>
      <button class="btn-ghost" onclick="closeModal()">${uiT('ui.close')}</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() { openedCostumeId=null; document.getElementById('modal-overlay').classList.add('hidden'); }

function selectAndMix(id) {
  if (!COSTUMES.some(costume => costume.id === id)) return;
  const availability = costumeAvailability(id);
  if (!availability.available) { showToast(availability.reason); return; }
  if(state.selectedCostume!==id)state.accessoriesConfirmed=false;
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
      ${costumeAvailability(c.id).available ? '' : 'disabled aria-describedby="costume-body-status"'} title="${costumeAvailability(c.id).reason}"
      onclick="selectCostumePill('${c.id}')" id="pill-${c.id}">
      <span class="costume-pill-preview costume-illustration">${costumeIllustration(c.id, c.color)}</span>
      <span class="costume-pill-name">${uiLabel('costume',c.id)}</span>
    </button>
  `).join('');
  const status = document.getElementById('costume-body-status');
  if (status) status.textContent = state.selectedGender === 'male' ? uiT('ui.male_body_only_male_ngu_than_and_giao_linh_are_available_other_outfits_are_locked') : '';
}

function selectCostumePill(id) {
  if (!COSTUMES.some(costume => costume.id === id)) return;
  const availability = costumeAvailability(id);
  if (!availability.available) { showToast(availability.reason); return; }
  if(state.selectedCostume!==id)state.accessoriesConfirmed=false;
  state.selectedCostume = id;
  sanitizeSelectedAccessories(true);
  renderCostumePills();
  generateOutfit();
}

function setGender(gender, costumeId = state.selectedCostume) {
  let selectedGender = gender === 'male' ? 'male' : 'female';
  let selectedCostume = compatibility.sanitizeCostume(costumeId, selectedGender,{event:state.selectedEvent});
  if (!selectedCostume) {
    selectedGender = 'female';
    selectedCostume = compatibility.sanitizeCostume(costumeId, selectedGender,{event:state.selectedEvent});
    showToast(uiT('availability.maleFallback'));
  } else if (selectedCostume !== costumeId) showToast(uiT('availability.maleSelected'));
  if(state.selectedGender!==selectedGender||state.selectedCostume!==selectedCostume)state.accessoriesConfirmed=false;
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
  const previous=state.selectedCostume;
  state.selectedCostume=compatibility.sanitizeCostume(previous,state.selectedGender,{event})||previous;
  if(state.selectedCostume!==previous){
    state.accessoriesConfirmed=false;
    showToast(uiT('eventScope.changedCostume',{name:{key:'costume.'+state.selectedCostume}}));
  }
  sanitizeSelectedAccessories(true);
  renderCostumePills();renderCostumeGrid(state.filterRegion);
  generateOutfit();
}

// ============================================================
// COLOR
// ============================================================
function renderColorSwatches() {
  const ready=colorStepReady();
  const picker=document.getElementById('color-swatches'),status=document.getElementById('color-step-status'),button=document.getElementById('btn-color-suggest');
  if(status)status.textContent=ready?'':uiT(compatibility.getCombinationOptions(currentContext()).length?'color.confirmAccessories':'matching.empty');
  if(button)button.disabled=!ready||!currentColorOptions().some(item=>item.available);
  if(!ready){picker.innerHTML='';return;}
  const options = currentColorOptions();
  document.getElementById('color-swatches').innerHTML = `<button type="button" class="color-swatch color-original ${state.selectedColorId === null ? 'selected' : ''}" style="background:#E6DED2;color:#302826;width:auto;min-width:90px;padding:0 10px" aria-pressed="${state.selectedColorId === null}" title="${uiT('color.originalPhoto')}" onclick="selectPhotoColor(null)" id="swatch-original">${uiT('color.originalShort')}</button>` + options.map(c => `
    <button type="button" class="color-swatch ${state.selectedColorId === c.id ? 'selected' : ''}" aria-pressed="${state.selectedColorId === c.id}" aria-disabled="${!c.available}" ${c.available ? '' : 'disabled'}
      style="background:${c.hex};${!c.available?'opacity:.3;filter:grayscale(.65);cursor:not-allowed;':''}${c.hex.toUpperCase()==='#FFFFFF'?'border:2px solid #444':''}"
      title="${uiT('color.id.'+c.id)}${c.reason?' · '+c.reason:''}" aria-label="${uiT('color.id.'+c.id)}"
      onclick="selectPhotoColor('${c.id}')" id="swatch-${c.id}"></button>
  `).join('');
}

function selectColor(hex) {
  const option = currentColorOptions().find(item => item.hex.toUpperCase() === String(hex).toUpperCase());
  if (!option?.available) { showToast(uiT('color.noApprovedImage')); return; }
  selectPhotoColor(option.id);
}
function selectPhotoColor(colorId) {
  if(!colorStepReady()){showToast(uiT('color.confirmAccessories'));return;}
  const option = currentColorOptions().find(item => item.id === colorId);
  if (colorId !== null && !option?.available) { showToast(uiT('color.noApprovedImage')); return; }
  state.selectedColorId = colorId;
  state.selectedVariantId = null;
  if (option) state.selectedColor = option.hex.toUpperCase();
  renderColorSwatches();
  updateHarmonyCheck();
  if (state.selectedCostume) generateOutfit();
}
function selectColorByHex(hex) { selectColor(hex); }

function updateHarmonyCheck() {
  const h = document.getElementById('color-harmony');
  const mapped = window.VietPhucPhotoMapping?.resolve(colorContext());
  colorRecommendation=null;
  const suggestion=document.getElementById('color-suggestion');if(suggestion)suggestion.innerHTML='';
  if(!colorStepReady()){h.innerHTML='';return;}
  const evaluation=window.VietPhucColorHarmony?.evaluate(mapped,window.VietPhucOutfitCatalogData);
  const harmonyText=evaluation?uiT(evaluation.score===null?'harmony.insufficient':'harmony.score',{score:evaluation.score}):'';
  h.innerHTML = `<span class="harmony-ok">${uiT(mapped?.noteKey || 'color.originalPhoto')}</span>${harmonyText?`<span class="harmony-score">${harmonyText}</span><details class="harmony-details"><summary>${uiT('harmony.details')}</summary><p>${uiT('harmony.scope')}</p>${evaluation.pairs.map(pair=>`<p>${pair.colorIds.map(id=>uiT('color.id.'+id)).join(' + ')} · ${uiT('harmony.relation.'+pair.relation)} · ${pair.score}/100</p>`).join('')}</details>`:''}`;
}

function suggestPhotoColor(){
  if(!colorStepReady()){showToast(uiT('color.confirmAccessories'));return;}
  const engine=window.VietPhucMatching?.getEngine(window.VietPhucOutfitCatalogData);
  const ranked=window.VietPhucColorHarmony?.recommend({engine,catalog:window.VietPhucOutfitCatalogData,context:colorContext()})||[];
  const option=ranked[0],container=document.getElementById('color-suggestion');
  if(!option){showToast(uiT('harmony.noSuggestion'));return;}
  colorRecommendation={colorId:option.colorId,context:JSON.stringify(currentContext())};
  const alreadySelected=state.selectedColorId===option.colorId||state.selectedColorId===null&&window.VietPhucPhotoMapping.resolve(colorContext())?.primaryColorId===option.colorId;
  container.innerHTML=`<strong>${uiT('harmony.proposed',{name:{key:'color.id.'+option.colorId}})}</strong><p>${option.reasonCodes.map(code=>uiT('harmony.reason.'+code)).join(' ')}</p><button type="button" class="text-action" onclick="applyColorSuggestion()" ${alreadySelected?'disabled':''}>${uiT(alreadySelected?'harmony.current':'harmony.apply')}</button>`;
}
function applyColorSuggestion(){
  if(!colorRecommendation||colorRecommendation.context!==JSON.stringify(currentContext())){showToast(uiT('harmony.stale'));return;}
  const id=colorRecommendation.colorId;
  if(!currentColorOptions().some(color=>color.id===id&&color.available)){showToast(uiT('harmony.noSuggestion'));return;}
  selectPhotoColor(id);
}

// ============================================================
// ACCESSORIES
// ============================================================
function renderAccessoryGrid() {
  const context = currentContext();
  document.getElementById('accessory-grid').innerHTML = ACCESSORIES.filter(a=>compatibility.getSupportedAccessoryIds().includes(a.id)).map(a => {
    const selected = state.selectedAccessories.has(a.id);
    const { available, reason } = compatibility.getAvailability(a.id, context);
    return `<button type="button" class="acc-btn ${selected ? 'selected' : ''}" aria-pressed="${selected}" aria-disabled="${!available}"
      ${available ? '' : `disabled aria-describedby="acc-reason-${a.id}"`} title="${reason || (a.needsVerification ? uiT('ui.demo_preset_verification_pending') : a.desc)}" onclick="toggleAccessory('${a.id}')" id="acc-${a.id}">
      <span class="acc-type">${compatibility.getAccessoryType(a.id)}</span>
      <span class="acc-name">${uiLabel('accessory',a.id)}</span>
      ${reason ? `<span class="acc-reason" id="acc-reason-${a.id}">${reason}</span>` : ''}
    </button>`;
  }).join('');
  const picker = document.getElementById('accessory-combinations');
  if (picker) picker.innerHTML = `<p>${uiT('matching.combinations')}</p>` + compatibility.getCombinationOptions(context).map(option=>{
    const selected = option.accessories.length === state.selectedAccessories.size && option.accessories.every(id=>state.selectedAccessories.has(id));
    const label = option.accessories.length ? option.accessories.map(id=>uiLabel('accessory',id)).join(' + ') : uiT('matching.noAccessories');
    return `<button type="button" class="suggestion-chip ${selected?'selected':''}" aria-pressed="${selected}" id="combo-${option.key}" onclick="setAccessoryCombination('${option.key}')">${label}</button>`;
  }).join('');
}

function toggleAccessory(id) {
  const { available, reason } = compatibility.getAvailability(id, currentContext());
  if (!available) { showToast(reason); return; }
  if (state.selectedAccessories.has(id)) state.selectedAccessories.delete(id);
  else state.selectedAccessories.add(id);
  state.accessoriesConfirmed=true;
  document.getElementById('accessory-status')?.replaceChildren();
  generateOutfit();
}

function sanitizeSelectedAccessories(announce = false) {
  const previous = [...state.selectedAccessories];
  const clean = compatibility.sanitizeAccessories(previous, currentContext());
  state.selectedAccessories = new Set(clean);
  const removed = ACCESSORIES.filter(item => previous.includes(item.id) && !state.selectedAccessories.has(item.id));
  if (announce && removed.length) {
    state.accessoriesConfirmed=false;
    const message = uiT('availability.removed',{names:{keys:removed.map(item=>'accessory.'+item.id)}});
    const status = document.getElementById('accessory-status');
    if (status) window.VietPhucLocale.trackText(status,message);
    showToast(message);
  } else if (announce) document.getElementById('accessory-status')?.replaceChildren();
  return clean;
}

function setAccessories(ids) {
  state.selectedAccessories = new Set(compatibility.sanitizeAccessories(ids, currentContext()));
  state.accessoriesConfirmed=compatibility.hasExactCombination([...state.selectedAccessories],currentContext());
  generateOutfit();
  return [...state.selectedAccessories];
}
function setAccessoryCombination(key) {
  const option = compatibility.getCombinationOptions(currentContext()).find(row=>row.key===key);
  if (!option) { showToast(uiT('matching.whole-set-missing')); return; }
  state.selectedAccessories = new Set(option.accessories);
  state.accessoriesConfirmed=true;
  generateOutfit();
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
  const costume  = COSTUMES.find(c => c.id === state.selectedCostume);
  if (!costume) return;
  sanitizeSelectedAccessories();
  renderAccessoryGrid();
  if(!colorStepReady()&&state.selectedColorId){state.selectedColorId=null;state.selectedVariantId=null;}
  if (state.selectedColorId && !currentColorOptions().some(item => item.id === state.selectedColorId && item.available)) {
    state.selectedColorId = null; state.selectedVariantId = null;
    showToast(uiT('color.resetToOriginal'));
  }
  let mapped = window.VietPhucPhotoMapping?.resolve(colorContext());
  if (mapped?.colorFallback && state.selectedVariantId) {
    state.selectedVariantId = null;
    mapped = window.VietPhucPhotoMapping.resolve(colorContext());
  }
  state.selectedVariantId = mapped?.sourceKind === 'recolor' ? mapped.variantId : null;
  const actualColor=window.VietPhucOutfitCatalogData?.colors?.find(row=>row.id===mapped?.primaryColorId);
  const actualHex=actualColor?.hex||actualColor?.swatchHex;
  if(/^#[0-9a-f]{6}$/i.test(actualHex||''))state.selectedColor=actualHex.toUpperCase();
  renderColorSwatches(); updateHarmonyCheck();
  const colorData = COLORS.find(c => c.hex === state.selectedColor);
  const accessories = ACCESSORIES.filter(a => state.selectedAccessories.has(a.id));
  const style = state.selectedStyle;
  const event = state.selectedEvent;

  document.getElementById('outfit-placeholder').classList.add('hidden');
  document.getElementById('outfit-result').classList.remove('hidden');

  showOutfitResult(costume, colorData, accessories, style, event);
  window.dispatchEvent(new CustomEvent('vietphuc:outfit-change', {detail: {
    costumeId: state.selectedCostume, body: {gender: state.selectedGender}, color: state.selectedColor, colorId: state.selectedColorId, variantId: state.selectedVariantId, accessories: [...state.selectedAccessories], style, event,
  }}));
}

// ---- Render outfit result ----
function showOutfitResult(costume, colorData, accessories, style, event) {
  const figCostume = document.getElementById('figure-costume');
  const figAcc = document.getElementById('figure-accessories');
  const hex = safeLookColor(state.selectedColor, '#C0392B');
  const colorLabel = state.selectedColorId ? uiT('color.id.'+state.selectedColorId) : uiT('color.originalPhoto');
  const styleLabel = uiLabel('style',style);


  figCostume.innerHTML = `
    <div class="mk-result">
      <div class="mk-photo-wrap mk-fallback-wrap">
        <div class="mk-fallback costume-illustration">${window.VietPhucPhotoMapping?.draw(colorContext()) || `<p class="matching-empty">${uiT('matching.empty')}</p>`}</div>
        <div class="mk-badge mk-badge-color" style="background:${hex}ee">
          <span class="mk-dot"></span>${colorLabel}
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
    <span class="outfit-tag" style="background:${hex}22;border-color:${hex}55;color:${hex}">${colorLabel}</span>
    ${accessories.slice(0,3).map(a => `<span class="outfit-tag">${uiLabel('accessory',a.id)}</span>`).join('')}
    ${accessories.length > 3 ? `<span class="outfit-tag">+${accessories.length-3}</span>` : ''}`;

  // Culture card
  document.getElementById('culture-card').classList.remove('hidden');
  document.getElementById('culture-content').innerHTML = window.VietPhucCulture?.detail(costume.id,{compact:true,accessoryIds:Array.from(state.selectedAccessories)}) || `
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
  const altC = (window.VietPhucMatching?.eventProfiles[state.selectedEvent]?.costumeIds||evSugg?.costumes)?.filter(id => id !== state.selectedCostume && COSTUMES.some(costume => costume.id === id) && costumeAvailability(id).available).slice(0,2) || [];
  const altA = ACCESSORIES.map(item => item.id).filter(id => !state.selectedAccessories.has(id) && compatibility.getAvailability(id, currentContext()).available).slice(0,2);
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
  const savedColorId = snapshot?.studioConfig && Object.hasOwn(snapshot.studioConfig, 'colorId') ? snapshot.studioConfig.colorId
    : snapshot?.outfitMeta && Object.hasOwn(snapshot.outfitMeta, 'colorId') ? snapshot.outfitMeta.colorId : state.selectedColorId;
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
    colorId: savedColorId,
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
  return {name:uiLabel('costume',look.costumeId),event:getEventLabel(look.event),style:uiLabel('style',look.style),color:look.colorId?uiT('color.id.'+look.colorId):uiT('color.originalPhoto'),date:/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(look.savedAt)?look.savedAt:uiT('look.dateMissing')};
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
      : `<div class="lb-illustration-cover costume-illustration" style="background:linear-gradient(135deg,${look.color}44,${look.color}11)">${window.VietPhucPhotoMapping?.draw(look.studioConfig || {costumeId:look.costumeId,body:{gender:'female'},accessories:look.accessories,colorId:null}, true) || `<p class="matching-empty">${uiT('matching.empty')}</p>`}</div>`;
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
  state.selectedColorId = look.colorId; state.selectedVariantId = look.studioConfig.variantId;
  state.selectedAccessories = new Set(look.accessories); state.selectedStyle = look.style;
  state.accessoriesConfirmed=true;
  state.selectedEvent = look.event;
  document.querySelectorAll('.event-btn').forEach(b=>b.classList.toggle('active',b.dataset.event===look.event));
  document.querySelectorAll('[name=style]').forEach(input=>input.checked=input.value===look.style);
  renderCostumePills(); renderCostumeGrid(state.filterRegion); renderColorSwatches(); renderAccessoryGrid(); generateOutfit();
  if (look.studioConfig) window.VietPhucStudio?.restore(look.studioConfig);
  scrollToMixer();
}
window.VietPhucRemix = {setAccessories, setGender, selectPhotoColor, getOutfit:()=>({costumeId:state.selectedCostume,body:{gender:state.selectedGender},color:state.selectedColor,colorId:state.selectedColorId,variantId:state.selectedVariantId,accessories:[...state.selectedAccessories],style:state.selectedStyle,event:state.selectedEvent})};

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
