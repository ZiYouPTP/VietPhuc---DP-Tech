import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createBody } from './body.js';
import { createFabricMaterial, updateFabricTime } from './materialFactory.js';
import { GARMENTS, GARMENT_BY_ID } from './garments.js';
import {
  generateGarment,
  updateGarmentBinding,
  disposeGarment,
  validateClearance,
  getGeneratorStats,
  clearGarmentCache,
} from './garmentGenerator.js';

const DEFAULT_CONFIG = {
  costumeId: 'ao-dai',
  color: '#a42d44',
  material: 'silk',
  pattern: 'plain',
  patternScale: 1,
  patternStrength: 0.5,
  flare: 0.1,
  clothMotion: true,
  autoRotate: false,
  body: { shape: 0, height: 1.75, skin: '#c9906b', hair: 'bun', gender: 'neutral' },
  slots: {},
};
const SLOT_ORDER = ['inner', 'bottom', 'outer', 'belt', 'headwear', 'accessory', 'footwear'];
const VIEW_NAMES = new Set(['front', 'angle', 'back', 'close']);
const MAX_ITEM_TRIANGLES = 30000;
const MAX_SCENE_TRIANGLES = 150000;
const clone = value => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));
const now = () => performance.now();
const nextTask = () => new Promise(resolve => setTimeout(resolve, 0));

// The pinned Three r186 GGX shader evaluates right-angle sin/cos values during
// ANGLE constant folding. Values around 1e-17 then trigger precision warnings.
// Stabilize just this studio's PMREM shader, retaining all renderer diagnostics.
class StudioPMREMGenerator extends THREE.PMREMGenerator {
  _allocateTargets() {
    const target = super._allocateTargets();
    const shader = this._ggxMaterial;
    if (shader && !shader.userData.studioStableTrig) {
      shader.fragmentShader = shader.fragmentShader
        .replace('float t1 = r * cos(phi);', 'float cosine = cos(phi);\nfloat t1 = r * (abs(cosine) < 1e-7 ? 0.0 : cosine);')
        .replace('float t2 = r * sin(phi);', 'float sine = sin(phi);\nfloat t2 = r * (abs(sine) < 1e-7 ? 0.0 : sine);');
      shader.defines.GGX_SAMPLES = 64;
      shader.userData.studioStableTrig = true;
      shader.needsUpdate = true;
    }
    return target;
  }
}

function mergeConfig(previous, incoming = {}) {
  const next = { ...previous, ...incoming };
  next.body = { ...previous.body, ...incoming.body };
  next.slots = { ...previous.slots, ...incoming.slots };
  next.body.shape = clamp(next.body.shape ?? 0, -1, 1);
  next.body.height = clamp(next.body.height ?? 1.75, 1.4, 2.05);
  next.patternScale = clamp(next.patternScale ?? 1, 0.25, 4);
  next.patternStrength = clamp(next.patternStrength ?? 0.5, 0, 1);
  next.flare = clamp(next.flare ?? 0.1, 0, 1);
  return next;
}

function lookupGarment(id) {
  if (!id) return null;
  if (GARMENT_BY_ID instanceof Map) return GARMENT_BY_ID.get(id) || null;
  return GARMENT_BY_ID[id] || GARMENTS.find(item => item.id === id) || null;
}

function countTriangles(root) {
  let count = 0;
  if (!root) return count;
  root.traverse(object => {
    if (!object.isMesh || !object.geometry || !object.visible) return;
    const geometry = object.geometry;
    const available = geometry.index ? geometry.index.count : geometry.attributes.position?.count || 0;
    const drawn = Math.min(available, geometry.drawRange.count === Infinity ? available : geometry.drawRange.count);
    count += Math.floor(drawn / 3) * (object.isInstancedMesh ? object.count : 1);
  });
  return count;
}

function garmentMaterials(group) {
  const materials = new Set();
  group.traverse(object => {
    if (!object.material) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  return materials;
}

function resolvedSlots(config) {
  const resolved = new Map();
  const top = lookupGarment(config.costumeId);
  if (top) {
    resolved.set(top.slot || 'outer', top);
    for (const recommended of top.recommendedItems || []) {
      const definition = lookupGarment(typeof recommended === 'string' ? recommended : recommended.id);
      if (definition && definition.slot !== 'accessory') resolved.set(definition.slot, definition);
    }
  }
  for (const slot of SLOT_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(config.slots, slot)) continue;
    const selected = config.slots[slot];
    if (slot === 'accessory') {
      for (const [key] of resolved) if (key.startsWith('accessory:')) resolved.delete(key);
      for (const id of Array.isArray(selected) ? selected : selected ? [selected] : []) {
        const definition = lookupGarment(typeof id === 'string' ? id : id.id);
        if (definition) resolved.set(`accessory:${definition.id}`, definition);
      }
    } else {
      const definition = lookupGarment(typeof selected === 'string' ? selected : selected?.id);
      if (definition) resolved.set(slot, definition);
      else resolved.delete(slot);
    }
  }
  return resolved;
}

function garmentOptions(config, definition, slot) {
  const selected = config.slots[slot];
  const overrides = selected && typeof selected === 'object' && !Array.isArray(selected) ? selected : {};
  const mainLayer = slot === 'outer';
  return {
    color: overrides.color || (mainLayer ? config.color : definition.defaultColor || '#ece5d3'),
    material: overrides.material || (mainLayer ? config.material : definition.defaultMaterial || 'silk'),
    pattern: overrides.pattern || (mainLayer ? config.pattern : 'plain'),
    patternScale: mainLayer ? config.patternScale : 1,
    patternStrength: mainLayer ? config.patternStrength : 0,
    flare: mainLayer ? config.flare : 0,
    clothMotion: config.clothMotion,
    materialFactory: createFabricMaterial,
  };
}

function optionKey(definition, options) {
  return JSON.stringify([definition.id, options.color, options.material, options.pattern, options.patternScale,
    options.patternStrength, options.flare]);
}

function drawStudioBackground(context, width, height) {
  const gradient = context.createLinearGradient(0, 0, width * 0.75, height);
  gradient.addColorStop(0, '#f7efe5');
  gradient.addColorStop(0.6, '#ece3d8');
  gradient.addColorStop(1, '#d7c9bf');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function fallbackSVG(config, view = 'front') {
  const color = /^#[0-9a-f]{3,8}$/i.test(config.color) ? config.color : '#a42d44';
  const skin = /^#[0-9a-f]{3,8}$/i.test(config.body.skin) ? config.body.skin : '#c9906b';
  const width = 92 + Number(config.body.shape || 0) * 12;
  const isShort = config.costumeId === 'ao-ba-ba';
  const back = view === 'back';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" role="img" aria-label="Bản phối 2D dự phòng">
    <ellipse data-fallback-shadow="true" cx="180" cy="449" rx="74" ry="12" fill="#594f48" opacity=".13"/>
    <path d="M155 306L146 437H172L180 331L188 437H214L205 306Z" fill="#ede4d3"/>
    <path d="M140 434H172V448H135Q131 439 140 434ZM188 434H214Q225 440 225 448H188Z" fill="#49362e"/>
    <path d="M150 139Q130 143 122 166L97 257Q99 266 109 263L142 185M210 139Q230 143 238 166L263 257Q261 266 251 263L218 185" fill="${skin}"/>
    <path d="M${180 - width / 2} 146Q155 131 180 131Q205 131 ${180 + width / 2} 146L227 ${isShort ? 302 : 423}Q204 431 181 ${isShort ? 301 : 415}Q156 431 133 ${isShort ? 302 : 423}Z" fill="${color}"/>
    <path d="M145 144L127 171L110 243L124 249L152 182M215 144L233 171L250 243L236 249L208 182" fill="${color}"/>
    <path d="M166 132V145Q180 153 194 145V132" fill="${color}" stroke="#ffffff" stroke-opacity=".5" stroke-width="2"/>
    ${back ? '' : `<path d="M180 151V${isShort ? 293 : 351}" fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width="1.5"/>`}
    <rect x="170" y="112" width="20" height="22" rx="7" fill="${skin}"/>
    <ellipse cx="180" cy="87" rx="29" ry="36" fill="${skin}"/>
    <path d="M151 91Q140 45 176 47Q217 43 210 93L201 79Q186 78 169 60Q156 75 151 91" fill="#2d2525"/>
    ${back ? '<ellipse cx="180" cy="84" rx="29" ry="34" fill="#2d2525"/>' : '<circle cx="170" cy="88" r="2" fill="#3a2c27"/><circle cx="190" cy="88" r="2" fill="#3a2c27"/><path d="M173 106Q180 111 187 106" fill="none" stroke="#805449" stroke-width="1.5"/>'}
  </svg>`;
}

async function rasterizeSVG(svg, width, height, transparent) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt không hỗ trợ chụp ảnh 2D.');
  if (!transparent) drawStudioBackground(context, width, height);
  const copy = svg.cloneNode(true);
  if (transparent) copy.querySelectorAll('[data-fallback-shadow]').forEach(shadow => shadow.remove());
  const source = new XMLSerializer().serializeToString(copy);
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Không thể chụp bản phối 2D.'));
      image.src = url;
    });
    const ratio = Math.min(width / (image.width || 360), height / (image.height || 480));
    const drawWidth = (image.width || 360) * ratio;
    const drawHeight = (image.height || 480) * ratio;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Procedural studio with a single controller for WebGL and the 2D fallback. */
export async function createViewer(host, options = {}) {
  if (!(host instanceof HTMLElement)) throw new TypeError('Viewer cần một phần tử HTML.');
  const bootStart = Number.isFinite(options.startedAt) ? options.startedAt : now();
  host.dataset.boot = 'loading';
  delete host.dataset.readyMs;
  const notify = (name, ...values) => {
    if (typeof options[name] === 'function') options[name](...values);
  };
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const debug = options.debug === true || new URLSearchParams(location.search).get('debug') === '1';
  let reducedMotion = media.matches;
  let config = mergeConfig(clone(DEFAULT_CONFIG), options.getConfig?.() || {});
  if (reducedMotion) config = { ...config, autoRotate: false, clothMotion: false };
  let disposed = false;
  let mode = 'webgl';
  let fallbackReason = '';
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let body = null;
  let environmentTarget = null;
  let floor = null;
  let contact = null;
  let resizeObserver = null;
  let intersectionObserver = null;
  let inViewport = true;
  let animationFrame = 0;
  let dirty = true;
  let settleFrames = 0;
  let lastFrameTime = 0;
  let motionTime = 0;
  let updateRevision = 0;
  let pendingUpdate = Promise.resolve();
  let lastMetricTime = 0;
  let controlsChanged = false;
  let currentView = 'front';
  let bodySignature = '';
  let initialLookPrepared = false;
  let firstLookRendered = false;
  const slots = new Map();
  const fades = new Map();
  const metrics = {
    mode, triangles: 0, garmentTriangles: 0, generationMs: 0, renderMs: 0,
    drawCalls: 0, cacheHits: 0, generatedItems: 0, fallbackItems: 0, readyMs: null, warning: '',
  };

  function markFirstLookRendered() {
    if (firstLookRendered || !initialLookPrepared || mode !== 'webgl') return false;
    firstLookRendered = true;
    metrics.readyMs = Number((now() - bootStart).toFixed(1));
    host.dataset.readyMs = String(metrics.readyMs);
    host.dataset.boot = 'ready';
    return true;
  }

  function emitMetrics(force = false) {
    if (!force && now() - lastMetricTime < 600) return;
    lastMetricTime = now();
    const generator = getGeneratorStats?.() || {};
    metrics.mode = mode;
    metrics.cacheHits = generator.cacheHits ?? generator.hits ?? 0;
    metrics.triangles = mode === 'webgl' ? countTriangles(scene) : 0;
    metrics.garmentTriangles = [...slots.values()].reduce((sum, entry) => sum + countTriangles(entry.group), 0);
    metrics.drawCalls = renderer?.info.render.calls || 0;
    metrics.generatedItems = slots.size;
    metrics.fallbackItems = [...slots.values()].filter(entry => entry.group.userData.simpleFallback).length;
    if (metrics.triangles > MAX_SCENE_TRIANGLES) metrics.warning = 'Scene vượt ngân sách 150.000 tam giác.';
    notify('onMetrics', { ...metrics });
  }

  function paused() {
    return disposed || mode !== 'webgl' || document.hidden || !inViewport;
  }

  function invalidate(frames = 0) {
    dirty = true;
    settleFrames = Math.max(settleFrames, frames);
    if (!animationFrame && !paused()) animationFrame = requestAnimationFrame(frame);
  }

  function frame(timestamp) {
    animationFrame = 0;
    if (paused() || !renderer || !scene) return;
    const delta = Math.min((timestamp - (lastFrameTime || timestamp)) / 1000, 0.05);
    lastFrameTime = timestamp;
    motionTime += delta;
    const clothEnabled = config.clothMotion && !reducedMotion;
    const rotateEnabled = config.autoRotate && !reducedMotion;
    controls.autoRotate = rotateEnabled;
    controlsChanged = false;
    controls.update(delta);
    body.animate?.(motionTime, clothEnabled);
    if (clothEnabled) {
      for (const entry of slots.values()) {
        for (const material of garmentMaterials(entry.group)) updateFabricTime(material, motionTime, true);
      }
    }
    const fadeActive = updateFades(timestamp);
    if (dirty || controlsChanged || clothEnabled || rotateEnabled || fadeActive) {
      const before = now();
      try {
        renderer.render(scene, camera);
      } catch (error) {
        enterFallback('Trình dựng hình đã dừng. Bản phối 2D vẫn sẵn sàng.');
        return;
      }
      metrics.renderMs = Number((now() - before).toFixed(2));
      dirty = false;
      emitMetrics(markFirstLookRendered());
    }
    settleFrames = controlsChanged ? Math.max(settleFrames, 3) : Math.max(0, settleFrames - 1);
    if (!animationFrame && (clothEnabled || rotateEnabled || fadeActive || settleFrames > 0 || dirty)) {
      animationFrame = requestAnimationFrame(frame);
    }
  }

  function updateFades(timestamp) {
    const hadFades = fades.size > 0;
    for (const [group, fade] of fades) {
      const progress = reducedMotion ? 1 : Math.min((timestamp - fade.started) / 180, 1);
      const opacity = 1 - Math.pow(1 - progress, 3);
      for (const [material, initial] of fade.materials) {
        material.opacity = initial.opacity * opacity;
        material.transparent = progress < 1 || initial.transparent;
        material.depthWrite = progress === 1 ? initial.depthWrite : false;
        if (material.transparent !== initial.lastTransparent) {
          material.needsUpdate = true;
          initial.lastTransparent = material.transparent;
        }
      }
      if (progress === 1) fades.delete(group);
    }
    return hadFades;
  }

  function fadeIn(group) {
    if (reducedMotion) return;
    const materials = new Map();
    for (const material of garmentMaterials(group)) {
      materials.set(material, {
        opacity: material.opacity, transparent: material.transparent,
        lastTransparent: true, depthWrite: material.depthWrite,
      });
      material.opacity = 0;
      material.transparent = true;
      material.depthWrite = false;
      material.needsUpdate = true;
    }
    fades.set(group, { started: now(), materials });
  }

  function endFades() {
    for (const fade of fades.values()) {
      for (const [material, initial] of fade.materials) {
        material.opacity = initial.opacity;
        material.transparent = initial.transparent;
        material.depthWrite = initial.depthWrite;
        material.needsUpdate = true;
      }
    }
    fades.clear();
  }

  function resize() {
    if (mode !== 'webgl' || !renderer) return;
    const bounds = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width || 360));
    const height = Math.max(1, Math.round(bounds.height || 480));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    invalidate();
  }

  function onControlChange() {
    controlsChanged = true;
    invalidate();
  }

  function onControlStart() { invalidate(40); }
  function onControlEnd() { invalidate(40); }

  function onVisibilityChange() {
    lastFrameTime = 0;
    if (document.hidden && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else invalidate();
  }

  function onMotionChange(event) {
    reducedMotion = event.matches;
    if (reducedMotion) {
      config.autoRotate = false;
      config.clothMotion = false;
      if (controls) controls.autoRotate = false;
      endFades();
      body?.animate?.(motionTime, false);
    }
    setMotionUniforms();
    invalidate();
  }

  function setMotionUniforms() {
    const enabled = config.clothMotion && !reducedMotion;
    for (const entry of slots.values()) {
      for (const material of garmentMaterials(entry.group)) updateFabricTime(material, motionTime, enabled);
    }
  }

  function onContextLost(event) {
    event.preventDefault();
    enterFallback('WebGL bị gián đoạn. Bạn vẫn có thể phối đồ và chụp bản 2D.');
  }

  function setupStudio() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' });
    if (!context) throw new Error('Trình duyệt hoặc thiết bị không hỗ trợ WebGL 2.');
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 0);
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Nhân vật mặc Việt phục; kéo để xoay, cuộn hoặc chụm hai ngón để phóng to.');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    host.replaceChildren(canvas);
    host.dataset.viewerMode = 'webgl';
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.05, 30);
    camera.position.set(0, 1.0, 3.8);
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.9, 0);
    controls.minDistance = 1.4;
    controls.maxDistance = 5.5;
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.61;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.enablePan = false;
    controls.autoRotateSpeed = 0.7;
    controls.addEventListener('change', onControlChange);
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);
    controls.update();

    const key = new THREE.DirectionalLight(0xfff1df, 3.0);
    key.position.set(-3, 4.5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024);
    key.shadow.camera.left = -1.8;
    key.shadow.camera.right = 1.8;
    key.shadow.camera.top = 2.7;
    key.shadow.camera.bottom = -1.2;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.bias = -0.00015;
    key.shadow.normalBias = 0.009;
    key.shadow.radius = 4;
    key.target.position.set(0, 0.9, 0);
    const fill = new THREE.DirectionalLight(0xdde8ff, 1.35);
    fill.position.set(3, 2, 3);
    const rim = new THREE.DirectionalLight(0xffe9ce, 2.2);
    rim.position.set(1.5, 3.5, -3.5);
    scene.add(key, key.target, fill, rim);

    const pmrem = new StudioPMREMGenerator(renderer);
    const room = new RoomEnvironment();
    try {
      environmentTarget = pmrem.fromScene(room, 0, 0.1, 20, { size: mobile ? 64 : 128 });
      scene.environment = environmentTarget.texture;
      scene.environmentIntensity = 0.55;
    } finally {
      room.dispose?.();
      pmrem.dispose();
    }

    floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ color: '#5d4b41', opacity: 0.2 }));
    floor.name = 'studio-shadow-floor';
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.001;
    floor.receiveShadow = true;
    scene.add(floor);
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = contactCanvas.height = 128;
    const contactContext = contactCanvas.getContext('2d');
    const contactGradient = contactContext.createRadialGradient(64, 64, 5, 64, 64, 64);
    contactGradient.addColorStop(0, 'rgba(52,38,31,0.32)');
    contactGradient.addColorStop(0.4, 'rgba(52,38,31,0.16)');
    contactGradient.addColorStop(1, 'rgba(52,38,31,0)');
    contactContext.fillStyle = contactGradient;
    contactContext.fillRect(0, 0, 128, 128);
    const contactTexture = new THREE.CanvasTexture(contactCanvas);
    contactTexture.colorSpace = THREE.SRGBColorSpace;
    contact = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.65), new THREE.MeshBasicMaterial({
      map: contactTexture, transparent: true, depthWrite: false, opacity: 0.8,
    }));
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.003;
    contact.name = 'soft-contact-shadow';
    scene.add(contact);
    body = createBody(config.body);
    scene.add(body.group);
    bodySignature = JSON.stringify(config.body);

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(entries => {
        inViewport = entries[0]?.isIntersecting ?? true;
        lastFrameTime = 0;
        if (!inViewport && animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        } else invalidate();
      }, { rootMargin: '80px' });
      intersectionObserver.observe(host);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    media.addEventListener?.('change', onMotionChange);
    resize();
  }

  function detachEntry(entry) {
    fades.delete(entry.group);
    entry.group.removeFromParent();
    disposeGarment(entry.group);
  }

  function disposeWebGL() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    resizeObserver = intersectionObserver = null;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    media.removeEventListener?.('change', onMotionChange);
    controls?.removeEventListener('change', onControlChange);
    controls?.removeEventListener('start', onControlStart);
    controls?.removeEventListener('end', onControlEnd);
    controls?.dispose();
    controls = null;
    endFades();
    for (const entry of slots.values()) detachEntry(entry);
    slots.clear();
    body?.dispose();
    body = null;
    floor?.geometry.dispose();
    floor?.material.dispose();
    contact?.geometry.dispose();
    contact?.material.map?.dispose();
    contact?.material.dispose();
    scene?.traverse(object => {
      if (object.isLight && object.shadow) object.shadow.dispose();
    });
    environmentTarget?.dispose();
    environmentTarget = null;
    if (renderer) {
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
    renderer = scene = camera = floor = contact = null;
  }

  async function renderFallback() {
    if (disposed) return;
    host.dataset.viewerMode = 'fallback';
    const result = await options.renderFallback?.(host, clone(config), fallbackReason, { view: currentView });
    if (typeof result === 'string') {
      if (result.startsWith('data:image/')) {
        const image = document.createElement('img');
        image.src = result;
        image.alt = 'Bản phối Việt phục 2D';
        host.replaceChildren(image);
      } else {
        const parsed = new DOMParser().parseFromString(result, 'image/svg+xml');
        if (parsed.documentElement.localName === 'svg') host.replaceChildren(document.importNode(parsed.documentElement, true));
      }
    } else if (result instanceof Element) host.replaceChildren(result);
    if (!options.renderFallback) {
      const parsed = new DOMParser().parseFromString(fallbackSVG(config, currentView), 'image/svg+xml');
      host.replaceChildren(document.importNode(parsed.documentElement, true));
    }
    const rendered = host.querySelector('svg,img,canvas');
    if (rendered) {
      rendered.style.width = '100%';
      rendered.style.height = '100%';
      rendered.style.objectFit = 'contain';
    }
    emitMetrics(true);
    notify('onStatus', 'fallback', fallbackReason);
  }

  async function enterFallback(reason) {
    if (disposed) return;
    mode = 'fallback';
    host.dataset.boot = 'fallback';
    fallbackReason = reason;
    metrics.warning = reason;
    updateRevision += 1;
    disposeWebGL();
    clearGarmentCache();
    notify('onFallback', reason);
    try {
      await renderFallback();
    } catch (error) {
      const parsed = new DOMParser().parseFromString(fallbackSVG(config, currentView), 'image/svg+xml');
      host.replaceChildren(document.importNode(parsed.documentElement, true));
      host.firstElementChild.style.width = host.firstElementChild.style.height = '100%';
      notify('onStatus', 'fallback', reason);
    }
  }

  function simpleShell(definition, optionsForItem) {
    // Last-resort copy of body triangles: no external files and no empty stage.
    const geometry = body.mesh.geometry.clone();
    const position = geometry.getAttribute('position');
    const normal = geometry.getAttribute('normal');
    const fullIndex = body.mesh.userData.fullIndex || geometry.userData.fullIndex;
    const sourceIndex = fullIndex ? new THREE.BufferAttribute(fullIndex, 1) : geometry.index;
    const isBottom = definition.slot === 'bottom';
    const minY = isBottom ? 0.05 : body.config.height * 0.45;
    const maxY = isBottom ? body.config.height * 0.57 : body.config.height * 0.86;
    const indices = [];
    const indexCount = sourceIndex?.count || position.count;
    for (let i = 0; i < indexCount; i += 3) {
      const a = sourceIndex ? sourceIndex.getX(i) : i;
      const b = sourceIndex ? sourceIndex.getX(i + 1) : i + 1;
      const c = sourceIndex ? sourceIndex.getX(i + 2) : i + 2;
      const centerY = (position.getY(a) + position.getY(b) + position.getY(c)) / 3;
      if (centerY >= minY && centerY <= maxY) indices.push(a, b, c);
    }
    for (let i = 0; i < position.count; i += 1) {
      position.setXYZ(i, position.getX(i) + normal.getX(i) * 0.009,
        position.getY(i) + normal.getY(i) * 0.009, position.getZ(i) + normal.getZ(i) * 0.009);
    }
    geometry.setIndex(indices);
    geometry.clearGroups();
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const material = createFabricMaterial({ ...optionsForItem, pattern: 'plain', clothMotion: false });
    const mesh = geometry.getAttribute('skinIndex') && body.mesh.skeleton
      ? new THREE.SkinnedMesh(geometry, material) : new THREE.Mesh(geometry, material);
    if (mesh.isSkinnedMesh) mesh.bind(body.skeleton, body.mesh.bindMatrix);
    mesh.castShadow = mesh.receiveShadow = true;
    const group = new THREE.Group();
    group.add(mesh);
    group.userData.definition = definition;
    group.userData.simpleFallback = true;
    group.userData.maskedRegions = [];
    return group;
  }

  async function buildItem(definition, optionsForItem) {
    let group;
    try {
      group = await generateGarment(body, definition, optionsForItem);
      if (!group?.isObject3D || countTriangles(group) === 0) throw new Error('Generator không tạo được bề mặt.');
      if (countTriangles(group) >= MAX_ITEM_TRIANGLES) throw new Error('Trang phục vượt ngân sách 30.000 tam giác.');
      if (group.userData.simple) {
        group.userData.simpleFallback = true;
        metrics.warning = `Món ${definition.nameVi || definition.id} đang dùng phiên bản đơn giản.`;
      }
    } catch (error) {
      if (group) disposeGarment(group);
      metrics.warning = `Món ${definition.nameVi || definition.name?.vi || definition.id} đang dùng phiên bản đơn giản.`;
      try {
        group = await generateGarment(body, definition, { ...optionsForItem, simple: true });
        if (!group?.isObject3D || !countTriangles(group) || countTriangles(group) >= MAX_ITEM_TRIANGLES) {
          if (group) disposeGarment(group);
          group = simpleShell(definition, optionsForItem);
        }
      } catch {
        group = simpleShell(definition, optionsForItem);
      }
      group.userData.simpleFallback = true;
    }
    group.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        // Skeleton-attached clothing has a shared bone matrix, so avoid stale geometry bounds.
        if (object.isSkinnedMesh) object.frustumCulled = false;
      }
    });
    return group;
  }

  function applyBodyMask() {
    const regions = [];
    for (const entry of slots.values()) regions.push(...(entry.group.userData.maskedRegions || []));
    body.setMaskRegions?.(regions);
  }

  async function update(incoming = {}) {
    if (disposed) return;
    config = mergeConfig(config, incoming);
    if (reducedMotion) {
      config.clothMotion = false;
      config.autoRotate = false;
    }
    if (config.slots.hair) config.body.hair = typeof config.slots.hair === 'string' ? config.slots.hair : config.slots.hair.id;
    const revision = ++updateRevision;
    if (mode === 'fallback') {
      await renderFallback();
      return;
    }
    const generationStart = now();
    notify('onStatus', 'loading');
    await nextTask();
    if (revision !== updateRevision || disposed) return;
    try {
      const nextBodySignature = JSON.stringify(config.body);
      const bodyChanged = nextBodySignature !== bodySignature;
      const shapeChanged = body.config.shape !== config.body.shape || body.config.height !== config.body.height
        || body.config.gender !== config.body.gender;
      if (bodyChanged) {
        body.updateConfig(config.body);
        bodySignature = nextBodySignature;
        // Binding is applied once on a shape change; skinning handles animation thereafter.
        for (const entry of slots.values()) updateGarmentBinding(entry.group, body);
      }
      const desired = resolvedSlots(config);
      for (const [slot, entry] of slots) {
        if (!desired.has(slot)) {
          detachEntry(entry);
          slots.delete(slot);
        }
      }
      for (const [slot, definition] of desired) {
        if (revision !== updateRevision || disposed) return;
        const optionsForItem = garmentOptions(config, definition, slot);
        const key = optionKey(definition, optionsForItem);
        const existing = slots.get(slot);
        const regenerateShape = shapeChanged && definition.generator?.regenerateOnBodyChange === true;
        if (existing?.key === key && !regenerateShape) continue;
        const group = await buildItem(definition, optionsForItem);
        if (revision !== updateRevision || disposed || mode !== 'webgl') {
          disposeGarment(group);
          return;
        }
        if (existing) detachEntry(existing);
        scene.add(group);
        slots.set(slot, { group, definition, key });
        fadeIn(group);
        // Development diagnostics are computed on demand, never per animation frame.
        if (debug) {
          const clearance = validateClearance?.(group, body);
          group.userData.clearanceReport = clearance;
          if (clearance && !clearance.ok) console.warn('[Việt phục] Cần kiểm tra khoảng cách vải/body:', definition.id, clearance);
        }
      }
      applyBodyMask();
      setMotionUniforms();
      metrics.generationMs = Number((now() - generationStart).toFixed(1));
      initialLookPrepared = slots.size > 0;
      if (shapeChanged && currentView === 'close') setView('close');
      emitMetrics(true);
      notify('onStatus', 'ready', metrics.warning);
      invalidate(4);
    } catch (error) {
      await enterFallback('Không thể tạo bản phối 360°. Bản phối 2D đang được hiển thị.');
    }
  }

  function setView(view) {
    if (!VIEW_NAMES.has(view)) view = 'front';
    currentView = view;
    if (disposed) return;
    if (mode === 'fallback') {
      pendingUpdate = renderFallback();
      return pendingUpdate;
    }
    const heightFactor = config.body.height / 1.75;
    if (view === 'close') {
      controls.target.set(0, 1.2 * heightFactor, 0);
      camera.position.set(0.25, 1.35 * heightFactor, 1.62);
    } else {
      controls.target.set(0, 0.9 * heightFactor, 0);
      if (view === 'back') camera.position.set(0, 1.0 * heightFactor, -3.8);
      else if (view === 'angle') camera.position.set(2.5, 1.08 * heightFactor, 2.9);
      else camera.position.set(0, 1.0 * heightFactor, 3.8);
    }
    controls.update();
    invalidate(30);
  }

  function setAutoRotate(enabled) {
    config.autoRotate = Boolean(enabled) && !reducedMotion;
    if (controls) controls.autoRotate = config.autoRotate;
    invalidate(4);
  }

  function setClothMotion(enabled) {
    config.clothMotion = Boolean(enabled) && !reducedMotion;
    setMotionUniforms();
    body?.animate?.(motionTime, config.clothMotion);
    invalidate(4);
  }

  async function capture({ transparent = false } = {}) {
    if (disposed) throw new Error('Viewer đã đóng.');
    await pendingUpdate;
    if (mode === 'fallback') {
      const svg = host.querySelector('svg') || host.parentElement?.querySelector('#studio-fallback svg');
      if (svg) {
        const bounds = host.getBoundingClientRect();
        return rasterizeSVG(svg, Math.max(360, Math.round(bounds.width)), Math.max(480, Math.round(bounds.height)), transparent);
      }
      const image = host.querySelector('img');
      if (image?.src.startsWith('data:image/png')) return image.src;
      throw new Error('Bản phối 2D chưa sẵn sàng để chụp.');
    }
    const floorVisible = floor.visible;
    const contactVisible = contact.visible;
    endFades();
    try {
      if (transparent) floor.visible = contact.visible = false;
      renderer.render(scene, camera);
      if (markFirstLookRendered()) emitMetrics(true);
      if (transparent) return renderer.domElement.toDataURL('image/png');
      const canvas = document.createElement('canvas');
      canvas.width = renderer.domElement.width;
      canvas.height = renderer.domElement.height;
      const context = canvas.getContext('2d');
      drawStudioBackground(context, canvas.width, canvas.height);
      context.drawImage(renderer.domElement, 0, 0);
      return canvas.toDataURL('image/png');
    } finally {
      floor.visible = floorVisible;
      contact.visible = contactVisible;
      invalidate();
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    updateRevision += 1;
    disposeWebGL();
    clearGarmentCache();
    host.replaceChildren();
    delete host.dataset.viewerMode;
    delete host.dataset.boot;
    delete host.dataset.readyMs;
  }

  const controller = {
    update(next) {
      pendingUpdate = update(next);
      return pendingUpdate;
    },
    setView, setAutoRotate, setClothMotion, capture, dispose,
    getMetrics: () => ({ ...metrics, mode }),
    getConfig: () => clone(config),
  };
  notify('onStatus', 'loading');
  try {
    setupStudio();
    pendingUpdate = update(config);
    await pendingUpdate;
  } catch (error) {
    await enterFallback(error.message || 'Thiết bị không hỗ trợ chế độ 360°.');
  }
  return controller;
}
