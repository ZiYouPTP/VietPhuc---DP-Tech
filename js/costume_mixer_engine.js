/**
 * Phase 3 – Costume Mixer Logic Engine
 * Rules engine + Z-index layering + HTML5 Canvas compositor
 *
 * Không dùng framework – vanilla JS ES2022 module
 */

// ============================================================
// CONFIG
// ============================================================
const CANVAS_W = 512;
const CANVAS_H = 768;
const POLL_BASE = 'https://image.pollinations.ai/prompt';
const MANIFEST_URL = '/assets/clothing_manifest.json';
const BODIES = [
  '/assets/base_bodies/base_body_1.png',
  '/assets/base_bodies/base_body_2.png',
];

/** Z-index order – lower renders first (below) */
const Z_INDEX = {
  'Áo lót trong':   2,
  'Quần/Váy':       3,
  'Áo khoác ngoài': 4,
  'Phụ kiện thân':  5,
  'Giày dép':       5,
  'Phụ kiện đầu':   6,
};

// ============================================================
// STATE
// ============================================================
const state = {
  /** item_id → manifest entry */
  manifest: {},
  /** item_id → raw items data */
  items: {},
  /** item_id → AI data */
  aiData: {},
  /** Currently selected item_ids (Set) */
  selected: new Set(),
  /** Which base body (0 or 1) */
  bodyIndex: 0,
  /** Cached Image objects keyed by item_id */
  imageCache: new Map(),
  /** 'idle' | 'loading' | 'compositing' | 'done' */
  status: 'idle',
};

// ============================================================
// DATA LOADING
// ============================================================
export async function loadData({ itemsUrl, aiUrl, manifestUrl = MANIFEST_URL }) {
  const [itemsRaw, aiRaw, manifestRaw] = await Promise.all([
    fetch(itemsUrl).then(r => r.json()),
    fetch(aiUrl).then(r => r.json()),
    fetch(manifestUrl).then(r => r.json()).catch(() => []),
  ]);

  // Index items
  for (const item of itemsRaw.items ?? []) {
    state.items[item.item_id] = item;
  }

  // Index AI data
  for (const ai of aiRaw.items ?? []) {
    state.aiData[ai.item_id] = ai;
  }

  // Index manifest
  for (const m of (Array.isArray(manifestRaw) ? manifestRaw : [])) {
    state.manifest[m.item_id] = m;
  }

  console.log(`[Engine] Loaded ${Object.keys(state.items).length} items, ${Object.keys(state.manifest).length} manifest entries`);
}

// ============================================================
// PHASE 3A – REQUIRED MATCHES (rules.required_matches)
// ============================================================
/**
 * Given a set of selected item_ids, scan required_matches
 * and auto-add any missing required companions.
 * Returns { added: string[], finalSet: Set<string> }
 */
export function applyRequiredMatches(selectedIds) {
  const queue = [...selectedIds];
  const result = new Set(selectedIds);
  const added = [];

  // BFS: each new item may pull in more required items
  while (queue.length) {
    const id = queue.shift();
    const item = state.items[id];
    if (!item) continue;

    for (const reqId of (item.rules?.required_matches ?? [])) {
      if (!result.has(reqId) && state.items[reqId]) {
        result.add(reqId);
        added.push(reqId);
        queue.push(reqId);   // chain: new item may also have required_matches
        console.log(`  [RequiredMatch] ${id} → auto-add ${reqId} (${state.items[reqId]?.name})`);
      }
    }
  }

  return { added, finalSet: result };
}

// ============================================================
// PHASE 3B – CONFLICT RESOLUTION (incompatible_items)
// ============================================================
/**
 * Check the full selection for conflicts from AI data.
 * Returns array of conflict objects: { offender, victim, reason }
 */
export function detectConflicts(selectedIds) {
  const idArray = [...selectedIds];
  const conflicts = [];
  const seen = new Set();

  for (const id of idArray) {
    const item = state.items[id];
    const ai   = state.aiData[id];
    if (!item && !ai) continue;

    // Check AI incompatible_items list
    const incompList = ai?.incompatible_items?.value ?? item?.rules?.incompatible_items ?? [];

    for (const incomp of incompList) {
      // incomp may be item_id or plain text description
      // Try to match against selected items by item_id or name
      for (const otherId of idArray) {
        if (otherId === id) continue;
        const other = state.items[otherId];
        if (!other) continue;

        const matchById   = incomp === otherId;
        const matchByName = other.name && incomp.toLowerCase().includes(other.name.toLowerCase());
        const matchOther  = other.aliases?.some(a => incomp.toLowerCase().includes(a.toLowerCase()));

        if (matchById || matchByName || matchOther) {
          const key = [id, otherId].sort().join('|');
          if (!seen.has(key)) {
            seen.add(key);
            conflicts.push({
              offender: id,
              victim:   otherId,
              reason:   ai?.incompatible_items?.reasoning ?? 'Xung đột văn hóa / vùng miền',
              confidence: ai?.incompatible_items?.confidence ?? 'thap',
            });
          }
        }
      }
    }

    // Global rules check
    // (region_mixing: check if items span multiple incompatible regions)
  }

  return conflicts;
}

/**
 * Auto-remove conflicting items, keeping the first-added item.
 * Returns { removed: string[], finalSet: Set<string>, conflicts }
 */
export function resolveConflicts(selectedIds) {
  const conflicts = detectConflicts(selectedIds);
  const toRemove  = new Set();

  // Strategy: keep earlier-added item (lower index), remove later
  const idArray = [...selectedIds];
  for (const conflict of conflicts) {
    const idxOff = idArray.indexOf(conflict.offender);
    const idxVic = idArray.indexOf(conflict.victim);
    // Remove whichever was added later
    const removeId = idxOff > idxVic ? conflict.offender : conflict.victim;
    if (!toRemove.has(removeId)) {
      console.warn(`  [Conflict] Remove ${removeId} (${state.items[removeId]?.name}) — ${conflict.reason}`);
      toRemove.add(removeId);
    }
  }

  const finalSet = new Set(idArray.filter(id => !toRemove.has(id)));
  return { removed: [...toRemove], finalSet, conflicts };
}

// ============================================================
// PHASE 3C – IMAGE LAYER LOADING
// ============================================================
function loadImage(src) {
  if (state.imageCache.has(src)) {
    return Promise.resolve(state.imageCache.get(src));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { state.imageCache.set(src, img); resolve(img); };
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

/** Build Pollinations.ai URL for a given item */
function buildPollinationsUrl(item, seed = 42) {
  const colors = item.filters?.color_tags?.slice(0, 3).join(', ') ?? 'traditional';
  const catDesc = {
    'Áo khoác ngoài': 'outer robe',
    'Áo lót trong':   'inner undergarment',
    'Quần/Váy':       'trousers or skirt',
    'Phụ kiện đầu':   'headwear',
    'Giày dép':       'footwear',
    'Phụ kiện thân':  'belt or body ornament',
  }[item.category] ?? 'garment';

  const prompt = encodeURIComponent(
    `${item.name} Vietnamese traditional ${catDesc}, ` +
    `color ${colors}, flat lay product photo on pure white background, ` +
    `no person, front view, full item visible, isolated on white, ` +
    `ultra sharp 4K professional fashion photography`
  );
  return `${POLL_BASE}/${prompt}?width=${CANVAS_W}&height=${CANVAS_H}&seed=${seed}&nologo=true&model=flux`;
}

/** Resolve the image URL for an item: manifest > Pollinations */
function resolveLayerUrl(itemId, seed = 0) {
  const m = state.manifest[itemId];
  if (m?.layer) {
    // Serve pre-processed transparent PNG from local server
    return '/' + m.layer.replace(/\\/g, '/');
  }
  // Fallback: generate on-the-fly from Pollinations
  const item = state.items[itemId];
  if (!item) return null;
  return buildPollinationsUrl(item, seed);
}

// ============================================================
// PHASE 3D – CANVAS COMPOSITOR
// ============================================================
/**
 * Main render function.
 * @param {HTMLCanvasElement} canvas
 * @param {string[]} selectedIds
 * @param {object} options
 */
export async function renderOutfit(canvas, selectedIds, options = {}) {
  const {
    bodyIndex = state.bodyIndex,
    onProgress = () => {},
    colorTint  = null,   // optional CSS color to tint base body
  } = options;

  const ctx = canvas.getContext('2d');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  state.status = 'loading';

  // --- Step 1: Rules engine ---
  onProgress({ step: 'rules', pct: 5 });
  const { finalSet: afterRequired, added } = applyRequiredMatches(selectedIds);
  const { finalSet: afterConflict, removed, conflicts } = resolveConflicts(afterRequired);

  // --- Step 2: Sort by Z-index ---
  const sorted = [...afterConflict]
    .map(id => ({
      id,
      item: state.items[id],
      z: Z_INDEX[state.items[id]?.category ?? ''] ?? 4,
    }))
    .sort((a, b) => a.z - b.z);

  // --- Step 3: Load base body ---
  onProgress({ step: 'base_body', pct: 10 });
  try {
    const bodyImg = await loadImage(BODIES[bodyIndex % BODIES.length]);
    ctx.drawImage(bodyImg, 0, 0, CANVAS_W, CANVAS_H);

    // Optional color tint overlay on body
    if (colorTint) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = colorTint;
      ctx.globalAlpha = 0.35;
      ctx.drawImage(bodyImg, 0, 0, CANVAS_W, CANVAS_H);
      ctx.restore();
    }
  } catch (e) {
    console.warn('[Canvas] Base body not loaded, using blank', e);
  }

  // --- Step 4: Composite each clothing layer ---
  const total = sorted.length;
  for (let i = 0; i < total; i++) {
    const { id, item, z } = sorted[i];
    onProgress({ step: 'layer', id, pct: Math.round(10 + (i / total) * 80) });

    const url = resolveLayerUrl(id, i);
    if (!url) continue;

    try {
      const layerImg = await loadImage(url);
      ctx.drawImage(layerImg, 0, 0, CANVAS_W, CANVAS_H);
      console.log(`  [Canvas] z=${z} ← ${id}`);
    } catch (e) {
      console.warn(`  [Canvas] Failed to load layer ${id}:`, e);
    }
  }

  onProgress({ step: 'done', pct: 100 });
  state.status = 'done';

  return {
    added,
    removed,
    conflicts,
    finalItems: [...afterConflict],
    canvasDataUrl: canvas.toDataURL('image/png'),
  };
}

// ============================================================
// PHASE 3E – UI HELPERS
// ============================================================

/** Build a human-readable conflict warning message */
export function buildConflictMessage(conflicts) {
  if (!conflicts.length) return null;
  return conflicts.map(c => {
    const off = state.items[c.offender]?.name ?? c.offender;
    const vic = state.items[c.victim]?.name ?? c.victim;
    return `⚠️ ${off} xung đột với ${vic}: ${c.reason}`;
  }).join('\n');
}

/** Get the full set of common pairings for a given item */
export function getCommonPairings(itemId) {
  const item = state.items[itemId];
  if (!item) return [];
  return (item.rules?.common_pairings ?? []).map(id => ({
    id,
    name: state.items[id]?.name ?? id,
    category: state.items[id]?.category,
  }));
}

/** Get red flags for currently selected items */
export function getRedFlags(selectedIds) {
  const flags = [];
  for (const id of selectedIds) {
    const item = state.items[id];
    for (const flag of (item?.rules?.red_flags ?? [])) {
      flags.push({ item_id: id, name: item.name, flag });
    }
  }
  return flags;
}

/** Export canvas as download */
export function exportCanvasAsImage(canvas, filename = 'viet-phuc-outfit.png') {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, 'image/png');
}

// ============================================================
// PHASE 3F – COMPLETE MIXER UI CLASS
// ============================================================
export class CostumeMixer {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.root         - Container element
   * @param {HTMLCanvasElement} opts.canvas - Canvas for rendering
   * @param {string} opts.itemsUrl
   * @param {string} opts.aiUrl
   */
  constructor(opts) {
    this.root   = opts.root;
    this.canvas = opts.canvas;
    this.opts   = opts;
    this._onUpdate = opts.onUpdate ?? (() => {});
  }

  async init() {
    await loadData({
      itemsUrl: this.opts.itemsUrl,
      aiUrl:    this.opts.aiUrl,
    });
    this._buildUI();
    return this;
  }

  /** Select or deselect an item, then auto-run rules */
  toggle(itemId) {
    if (state.selected.has(itemId)) {
      state.selected.delete(itemId);
    } else {
      state.selected.add(itemId);
    }
    this._syncRules();
  }

  clearAll() {
    state.selected.clear();
    this._syncRules();
  }

  setBody(index) {
    state.bodyIndex = index;
    this.render();
  }

  _syncRules() {
    // Run required_matches
    const { finalSet: afterRequired, added } = applyRequiredMatches(state.selected);
    // Run conflict resolution
    const { finalSet: afterConflict, removed, conflicts } = resolveConflicts(afterRequired);

    // Update state.selected with rules-resolved set
    state.selected = afterConflict;

    const flags = getRedFlags(afterConflict);
    this._onUpdate({ added, removed, conflicts, flags, selected: [...afterConflict] });
    this.render();
  }

  async render() {
    const result = await renderOutfit(this.canvas, [...state.selected], {
      bodyIndex: state.bodyIndex,
      onProgress: (p) => this._onUpdate({ progress: p }),
    });
    this._onUpdate({ renderResult: result });
    return result;
  }

  exportImage(filename) {
    exportCanvasAsImage(this.canvas, filename);
  }

  /** Build simple item selector UI inside this.root */
  _buildUI() {
    const categories = {};
    for (const [id, item] of Object.entries(state.items)) {
      const cat = item.category ?? 'Khác';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    }

    const html = Object.entries(categories).map(([cat, items]) => `
      <div class="mixer-category" data-cat="${cat}">
        <h4 class="cat-label">${cat} <span class="cat-z">z=${Z_INDEX[cat] ?? '?'}</span></h4>
        <div class="cat-items">
          ${items.map(item => `
            <button class="item-chip" data-id="${item.item_id}"
              title="${item.cultural_context?.historical_meaning?.slice(0,120) ?? ''}">
              ${item.name}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');

    this.root.innerHTML = html;

    this.root.querySelectorAll('.item-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggle(btn.dataset.id);
        this.root.querySelectorAll('.item-chip').forEach(b => {
          b.classList.toggle('selected', state.selected.has(b.dataset.id));
        });
      });
    });
  }
}
