// ============================================================
// APP.JS – Việt phục Remix (full rewrite with AI mockup)
// ============================================================

let state = {
  selectedCostume: null,
  selectedEvent: 'festival',
  selectedColor: null,
  selectedAccessories: new Set(),
  selectedStyle: 'traditional',
  selectedWeather: 'sunny',
  lookbook: JSON.parse(localStorage.getItem('vietPhucLookbook') || '[]'),
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

  if (state.lookbook.length === 0) {
    document.getElementById('lookbook-empty').classList.remove('hidden');
  } else {
    document.getElementById('lookbook-empty').classList.add('hidden');
    document.getElementById('lookbook-actions').classList.remove('hidden');
  }
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
      <div class="costume-card-img" style="background:${c.bgGradient}">
        <span style="z-index:1;position:relative;font-size:72px">${c.emoji}</span>
      </div>
      <div class="costume-card-body">
        <div class="costume-card-tags">
          <span class="costume-card-tag region">${c.regionLabel}</span>
          ${c.tags.slice(0,2).map(t => `<span class="costume-card-tag">${t}</span>`).join('')}
        </div>
        <h3>${c.name}</h3>
        <p>${c.shortDesc}</p>
        <div class="costume-card-actions">
          <button class="btn-sm btn-sm-primary" onclick="event.stopPropagation();selectAndMix('${c.id}')">✨ Phối đồ</button>
          <button class="btn-sm btn-sm-ghost" onclick="event.stopPropagation();openCostumeModal('${c.id}')">📖 Chi tiết</button>
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
    <h2>${c.emoji} ${c.name}</h2>
    <p>${c.desc}</p>
    <div class="modal-section"><h3>📜 Nguồn gốc & lịch sử</h3><p>${c.origin}</p></div>
    <div class="modal-section"><h3>🎊 Dịp mặc phù hợp</h3><ul>${c.occasions.map(o=>`<li>${o}</li>`).join('')}</ul></div>
    <div class="modal-section"><h3>💡 Mẹo văn hóa</h3><ul>${c.culturalTips.map(t=>`<li>${t}</li>`).join('')}</ul></div>
    ${c.warnings.length ? `<div class="modal-section"><h3 style="color:#FF9800">⚠️ Lưu ý</h3><ul>${c.warnings.map(w=>`<li style="color:#FF9800">${w}</li>`).join('')}</ul></div>` : ''}
    <div class="modal-section"><h3>👗 Gợi ý phối theo phong cách</h3><ul>
      <li>🏮 Truyền thống: ${c.styleSuggestions.traditional}</li>
      <li>✨ Fusion: ${c.styleSuggestions.fusion}</li>
      <li>🔥 Gen Z Bold: ${c.styleSuggestions.genz}</li>
    </ul></div>
    <div style="margin-top:24px;display:flex;gap:12px">
      <button class="btn-primary" onclick="selectAndMix('${c.id}');closeModal()">✨ Phối đồ ngay</button>
      <button class="btn-ghost" onclick="closeModal()">Đóng</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }

function selectAndMix(id) {
  state.selectedCostume = id;
  renderCostumePills();
  document.getElementById('mixer').scrollIntoView({ behavior: 'smooth' });
}
function selectCostumeById(id) { selectAndMix(id); }

// ============================================================
// MIXER – PILLS
// ============================================================
function renderCostumePills() {
  document.getElementById('costume-pills').innerHTML = COSTUMES.map(c => `
    <button class="costume-pill ${state.selectedCostume === c.id ? 'selected' : ''}"
      onclick="selectCostumePill('${c.id}')" id="pill-${c.id}">
      ${c.emoji} ${c.name}
    </button>
  `).join('');
}

function selectCostumePill(id) {
  state.selectedCostume = id;
  renderCostumePills();
  const evSugg = EVENT_SUGGESTIONS[state.selectedEvent];
  if (evSugg?.colors?.[0] && !state.selectedColor) selectColorByHex(evSugg.colors[0]);
}

// ============================================================
// EVENT
// ============================================================
function selectEvent(btn, event) {
  document.querySelectorAll('.event-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.selectedEvent = event;
  const evSugg = EVENT_SUGGESTIONS[event];
  if (evSugg?.colors?.[0]) selectColorByHex(evSugg.colors[0]);
}

// ============================================================
// COLOR
// ============================================================
function renderColorSwatches() {
  document.getElementById('color-swatches').innerHTML = COLORS.map(c => `
    <button class="color-swatch ${state.selectedColor === c.hex ? 'selected' : ''}"
      style="background:${c.hex};${c.hex==='#FFFFFF'?'border:2px solid #444':''}"
      title="${c.name} – ${c.meaning}"
      onclick="selectColor('${c.hex}')" id="swatch-${c.hex.replace('#','')}"></button>
  `).join('');
}

function selectColor(hex) {
  state.selectedColor = hex;
  renderColorSwatches();
  updateHarmonyCheck();
}
function selectColorByHex(hex) { selectColor(hex); }

function updateHarmonyCheck() {
  const h = document.getElementById('color-harmony');
  if (!state.selectedColor) { h.innerHTML = ''; return; }
  const c = COLORS.find(x => x.hex === state.selectedColor);
  if (!c) return;
  const good = c.good.includes(state.selectedEvent);
  h.innerHTML = good
    ? `<span class="harmony-good">✅ <strong>${c.name}</strong> phù hợp với sự kiện này – ${c.meaning}</span>`
    : `<span class="harmony-ok">💛 <strong>${c.name}</strong> có thể dùng – ${c.meaning}. Cân nhắc màu khác.</span>`;
}

// ============================================================
// ACCESSORIES
// ============================================================
function renderAccessoryGrid() {
  document.getElementById('accessory-grid').innerHTML = ACCESSORIES.map(a => `
    <div class="accessory-item ${state.selectedAccessories.has(a.id) ? 'selected' : ''}"
      title="${a.desc}" onclick="toggleAccessory('${a.id}')" id="acc-${a.id}">
      <div class="accessory-icon">${a.emoji}</div>
      <div class="accessory-name">${a.name}</div>
    </div>
  `).join('');
}

function toggleAccessory(id) {
  state.selectedAccessories.has(id) ? state.selectedAccessories.delete(id) : state.selectedAccessories.add(id);
  renderAccessoryGrid();
}

// ============================================================
// STYLE & WEATHER
// ============================================================
function updateStyle(s) { state.selectedStyle = s; }

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
  if (!state.selectedCostume) { showToast('⚠️ Hãy chọn loại trang phục trước!'); return; }
  if (!state.selectedColor) { showToast('🎨 Hãy chọn màu sắc chủ đạo!'); return; }

  const costume  = COSTUMES.find(c => c.id === state.selectedCostume);
  const colorData = COLORS.find(c => c.hex === state.selectedColor);
  const accessories = ACCESSORIES.filter(a => state.selectedAccessories.has(a.id));
  const style = state.selectedStyle;
  const event = state.selectedEvent;

  document.getElementById('outfit-placeholder').classList.add('hidden');
  document.getElementById('outfit-result').classList.remove('hidden');

  showOutfitResult(costume, colorData, accessories, style, event);
}

// ---- Render outfit result ----
function showOutfitResult(costume, colorData, accessories, style, event) {
  const figCostume = document.getElementById('figure-costume');
  const figAcc = document.getElementById('figure-accessories');
  const hex = colorData?.hex || '#C0392B';
  const styleLabel = { traditional: '🏮 Truyền thống', fusion: '✨ Fusion', genz: '🔥 Gen Z Bold' }[style];


  figCostume.innerHTML = `
    <div class="mk-result">
      <div class="mk-photo-wrap mk-fallback-wrap">
        <div class="mk-fallback">
          <div class="mkf-glow" style="background:radial-gradient(circle,${hex}55,transparent 70%)"></div>
          <div class="mkf-head">👤</div>
          <div class="mkf-body" style="background:linear-gradient(180deg,${hex}ee 0%,${hex}88 60%,${hex}44 100%);box-shadow:0 0 60px ${hex}55">
            <span class="mkf-emoji">${costume.emoji}</span>
            <div class="mkf-shine"></div>
          </div>
          <div class="mkf-feet"></div>
        </div>
        <div class="mk-badge mk-badge-color" style="background:${hex}ee">
          <span class="mk-dot"></span>${colorData?.name}
        </div>
        <div class="mk-badge mk-badge-style">${styleLabel}</div>
      </div>
      <div class="mk-footer">
        <div class="mk-footer-left">
          <div class="mk-name">${costume.emoji} ${costume.name}</div>
          <div class="mk-sub">${costume.regionLabel} · ${getEventLabel(event)}</div>
        </div>
        <button class="mk-save-btn" onclick="saveLook()" title="Lưu lookbook">💾 Lưu</button>
      </div>
    </div>`;

  // Accessories bar
  figAcc.innerHTML = accessories.length
    ? `<div class="acc-bar">${accessories.map(a => `
        <div class="acc-chip" title="${a.desc}">
          <span class="acc-emoji">${a.emoji}</span>
          <span class="acc-label">${a.name}</span>
        </div>`).join('')}</div>`
    : `<span class="acc-empty">Chưa chọn phụ kiện – thêm để hoàn thiện outfit</span>`;

  // Tags
  document.getElementById('outfit-tags').innerHTML = `
    <span class="outfit-tag highlight">${styleLabel}</span>
    <span class="outfit-tag" style="background:${hex}22;border-color:${hex}55;color:${hex}">● ${colorData?.name}</span>
    ${accessories.slice(0,3).map(a => `<span class="outfit-tag">${a.emoji} ${a.name}</span>`).join('')}
    ${accessories.length > 3 ? `<span class="outfit-tag">+${accessories.length-3}</span>` : ''}`;

  // Culture card
  document.getElementById('culture-card').classList.remove('hidden');
  document.getElementById('culture-content').innerHTML = `
    <p><strong>${costume.name}</strong> – ${costume.shortDesc}</p>
    <p style="margin-top:8px">${costume.culturalTips[0] || ''}</p>
    ${costume.styleSuggestions[style] ? `<p style="margin-top:8px">🎧 Gợi ý ${styleLabel}: <em>${costume.styleSuggestions[style]}</em></p>` : ''}`;

  // Warnings
  const warns = [...costume.warnings];
  if (colorData?.hex === '#FFFFFF') warns.push('Màu trắng trong văn hóa Việt truyền thống liên quan đến tang lễ – dùng ở dịp vui cần cẩn thận.');
  if (WEATHER_TIPS[state.selectedWeather]?.avoid?.includes(state.selectedCostume))
    warns.push(`Trang phục này không phù hợp lắm với thời tiết ${getWeatherLabel(state.selectedWeather)}.`);
  const wc = document.getElementById('warning-card');
  if (warns.length) {
    wc.classList.remove('hidden');
    document.getElementById('warning-list').innerHTML = warns.map(w => `<li>${w}</li>`).join('');
  } else wc.classList.add('hidden');

  // Suggestions
  const evSugg = EVENT_SUGGESTIONS[event];
  document.getElementById('suggestion-section').classList.remove('hidden');
  const altC = evSugg?.costumes?.filter(id => id !== state.selectedCostume).slice(0,2) || [];
  const altA = evSugg?.accessories?.filter(id => !state.selectedAccessories.has(id)).slice(0,2) || [];
  document.getElementById('suggestion-chips').innerHTML = [
    ...altC.map(id => { const c = COSTUMES.find(x=>x.id===id); return c ? `<button class="suggestion-chip" onclick="selectAndMix('${id}');generateOutfit()">${c.emoji} Thử ${c.name}</button>` : ''; }),
    ...altA.map(id => { const a = ACCESSORIES.find(x=>x.id===id); return a ? `<button class="suggestion-chip" onclick="toggleAccessory('${id}');generateOutfit()">${a.emoji} Thêm ${a.name}</button>` : ''; }),
  ].filter(Boolean).join('');

  // Compare
  document.getElementById('comparison-section').classList.remove('hidden');
  const styleEmoji = { traditional:'🏮', fusion:'✨', genz:'🔥' };
  const styleNames = { traditional:'Truyền thống', fusion:'Fusion', genz:'Gen Z Bold' };
  document.getElementById('compare-grid').innerHTML = Object.entries(costume.styleSuggestions)
    .filter(([s]) => s !== style).slice(0,2)
    .map(([s, desc]) => `
      <div class="compare-item" onclick="document.querySelector('[name=style][value=${s}]').checked=true;updateStyle('${s}');generateOutfit()">
        <div class="ci-emoji">${styleEmoji[s]}</div>
        <div class="ci-name">${styleNames[s]}</div>
        <div class="ci-desc">${desc}</div>
      </div>`).join('');

  showToast('✅ Outfit đã tạo! Nhấn 💾 Lưu để vào lookbook.');
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
function saveLook() {
  if (!state.selectedCostume || !state.selectedColor) { showToast('⚠️ Tạo outfit trước khi lưu!'); return; }
  const costume = COSTUMES.find(c => c.id === state.selectedCostume);
  const colorData = COLORS.find(c => c.hex === state.selectedColor);
  const look = {
    id: Date.now(),
    costumeId: state.selectedCostume,
    costumeName: costume.name,
    costumeEmoji: costume.emoji,
    color: state.selectedColor,
    colorName: colorData?.name || '',
    accessories: [...state.selectedAccessories],
    style: state.selectedStyle,
    styleName: { traditional:'Truyền thống', fusion:'Fusion', genz:'Gen Z Bold' }[state.selectedStyle],
    event: state.selectedEvent,
    eventName: getEventLabel(state.selectedEvent),
    savedAt: new Date().toLocaleDateString('vi-VN'),
  };
  state.lookbook.unshift(look);
  localStorage.setItem('vietPhucLookbook', JSON.stringify(state.lookbook));
  renderLookbook();
  showToast('💾 Đã lưu vào lookbook!');
}

function renderLookbook() {
  const grid = document.getElementById('lookbook-grid');
  const empty = document.getElementById('lookbook-empty');
  const actions = document.getElementById('lookbook-actions');
  if (state.lookbook.length === 0) { empty.classList.remove('hidden'); grid.innerHTML = ''; actions.classList.add('hidden'); return; }
  empty.classList.add('hidden'); actions.classList.remove('hidden');
  grid.innerHTML = state.lookbook.map(look => {
    const accEmojis = ACCESSORIES.filter(a => look.accessories.includes(a.id)).map(a=>a.emoji).slice(0,4);
    const cover = `<div class="lb-emoji-cover" style="background:linear-gradient(135deg,${look.color}44,${look.color}11)"><span style="font-size:56px">${look.costumeEmoji}</span></div>`;
    return `
      <div class="lookbook-item">
        <div class="lookbook-item-cover">
          ${cover}
          <button class="lookbook-item-delete" onclick="deleteLook(${look.id})">✕</button>
          <div class="lb-style-tag">${look.styleName}</div>
        </div>
        <div class="lookbook-item-body">
          <div class="lookbook-item-name">${look.costumeName}</div>
          <div class="lookbook-item-event">${look.eventName} · ${look.savedAt}</div>
          <div class="lookbook-item-tags">
            <span class="outfit-tag" style="background:${look.color}22;border-color:${look.color}55;color:${look.color};font-size:11px">● ${look.colorName}</span>
            ${accEmojis.join(' ')}
          </div>
        </div>
      </div>`;
  }).join('');
}

function deleteLook(id) {
  state.lookbook = state.lookbook.filter(l => l.id !== id);
  localStorage.setItem('vietPhucLookbook', JSON.stringify(state.lookbook));
  renderLookbook();
  showToast('🗑️ Đã xóa khỏi lookbook');
}
function clearLookbook() {
  if (!confirm('Xóa toàn bộ lookbook?')) return;
  state.lookbook = [];
  localStorage.setItem('vietPhucLookbook', JSON.stringify([]));
  renderLookbook();
  showToast('🗑️ Đã xóa lookbook');
}
function exportLookbook() {
  const data = state.lookbook.map(l => `🌸 ${l.costumeName}\n   Sự kiện: ${l.eventName}\n   Màu sắc: ${l.colorName}\n   Phong cách: ${l.styleName}\n   Ngày lưu: ${l.savedAt}\n`).join('\n');
  const blob = new Blob([`LOOKBOOK VIỆT PHỤC REMIX\n${'='.repeat(40)}\n\n${data}`], { type:'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'viet-phuc-lookbook.txt'; a.click();
  showToast('📤 Đã xuất lookbook!');
}
function shareLook() {
  const text = state.selectedCostume
    ? `✨ Tôi vừa phối outfit ${COSTUMES.find(c=>c.id===state.selectedCostume)?.name} trên Việt Phục Remix! #ViệtPhục #GenZ`
    : '✨ Khám phá Việt Phục Remix! #ViệtPhục #GenZ';
  navigator.share ? navigator.share({ title:'Việt Phục Remix', text }) : navigator.clipboard.writeText(text).then(()=>showToast('📋 Đã copy!'));
}

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
      <div class="rule-icon">${r.icon}</div>
      <div class="rule-title">${r.title}</div>
      <div class="rule-desc">${r.desc}</div>
    </div>`).join('');
}
function renderRegions() {
  document.getElementById('regions-map').innerHTML = REGIONS.map((r,i) => `
    <div class="region-card" style="animation-delay:${i*0.08}s">
      <div class="region-header">
        <span class="region-icon">${r.icon}</span>
        <div><div class="region-name">${r.name}</div><div style="font-size:12px;color:rgba(245,237,216,0.5)">${r.desc}</div></div>
      </div>
      <div class="region-costumes">${r.costumes.map(c=>`<span class="region-costume-tag">${c}</span>`).join('')}</div>
    </div>`).join('');
}
function renderModernTrends() {
  document.getElementById('modern-grid').innerHTML = MODERN_TRENDS.map((t,i) => `
    <div class="modern-card" style="animation-delay:${i*0.08}s">
      <div class="modern-card-icon">${t.icon}</div>
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
