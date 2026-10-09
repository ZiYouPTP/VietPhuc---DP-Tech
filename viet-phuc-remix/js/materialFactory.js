import * as THREE from 'three';

// Every map is generated here; there are no downloaded fabric images.
const textureCache = new Map();
const clamp = THREE.MathUtils.clamp;
const FABRICS = {
  silk: { roughness: 0.42, sheen: 0.62, sheenRoughness: 0.50, clearcoat: 0.018, normal: 0.032, thickness: 0.001, weave: 48 },
  linen: { roughness: 0.88, sheen: 0.12, sheenRoughness: 0.9, clearcoat: 0, normal: 0.39, thickness: 0.0017, weave: 28 },
  brocade: { roughness: 0.49, sheen: 0.62, sheenRoughness: 0.56, clearcoat: 0.035, normal: 0.25, thickness: 0.0025, weave: 36 },
  velvet: { roughness: 0.78, sheen: 1, sheenRoughness: 0.22, clearcoat: 0, normal: 0.065, thickness: 0.003, weave: 56 },
};
const PATTERNS = new Set(['plain', 'lotus', 'crane', 'cloud', 'geometric', 'dots', 'stripes']);

function normalise(options) {
  const aliases = { lua: 'silk', lanh: 'linen', dui: 'linen', gam: 'brocade', thoCam: 'brocade', nhung: 'velvet' };
  const material = aliases[options.material] || options.material || 'silk';
  const color = /^#[0-9a-f]{6}$/i.test(options.color || '') ? options.color.toLowerCase() : '#8a2947';
  return {
    material: FABRICS[material] ? material : 'silk', color,
    pattern: options.pattern === 'brocade' ? 'geometric' : PATTERNS.has(options.pattern) ? options.pattern : 'plain',
    patternScale: clamp(Number(options.patternScale) || 1, 0.35, 4),
    patternStrength: clamp(Number.isFinite(Number(options.patternStrength)) ? Number(options.patternStrength) : 0.45, 0, 1),
    clothMotion: options.clothMotion !== false,
  };
}

function canvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function setupTexture(texture, scale, colorSpace = THREE.NoColorSpace, multiplier = 1) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2 * scale * multiplier, 2 * scale * multiplier);
  texture.colorSpace = colorSpace; texture.anisotropy = 4; texture.needsUpdate = true; return texture;
}

function makeCanvas(size) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  return canvas.getContext('2d') ? canvas : null;
}

function generateColorMap(options) {
  const size = 256, canvas = makeCanvas(size), base = new THREE.Color(options.color);
  if (!canvas) {
    const color = base.clone().convertLinearToSRGB();
    const bytes = new Uint8Array([Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255), 255]);
    const texture = new THREE.DataTexture(bytes, 1, 1, THREE.RGBAFormat); texture.needsUpdate = true; return texture;
  }
  const context = canvas.getContext('2d'); context.fillStyle = options.color; context.fillRect(0, 0, size, size);
  // A small woven contrast gives the base cloth some structure even at rest.
  context.globalAlpha = options.material === 'linen' ? 0.052 : 0.025;
  context.fillStyle = '#fff2d8';
  for (let line = 0; line < size; line += 4) context.fillRect(line, 0, 1, size);
  context.fillStyle = '#150c18';
  for (let line = 0; line < size; line += 4) context.fillRect(0, line, size, 1);
  context.globalAlpha = options.patternStrength * (options.material === 'brocade' ? 0.92 : 0.72);
  context.strokeStyle = context.fillStyle = '#f3d4a4'; context.lineWidth = 2.4; context.lineCap = 'round'; context.lineJoin = 'round';
  const draw = (x, y, rotation = 0) => {
    context.save(); context.translate(x, y); context.rotate(rotation);
    if (options.pattern === 'lotus') {
      for (const turn of [-0.9, -0.45, 0, 0.45, 0.9]) {
        context.save(); context.rotate(turn); context.beginPath(); context.moveTo(0, 18); context.bezierCurveTo(-17, 4, -11, -20, 0, -30); context.bezierCurveTo(11, -20, 17, 4, 0, 18); context.stroke(); context.restore();
      }
      context.beginPath(); context.ellipse(0, 21, 27, 5, 0, 0, Math.PI * 2); context.stroke();
    } else if (options.pattern === 'crane') {
      context.beginPath(); context.moveTo(-28, 3); context.quadraticCurveTo(-13, -15, 1, 0); context.quadraticCurveTo(18, -16, 32, -10); context.lineTo(9, 10); context.quadraticCurveTo(1, 18, -13, 8); context.stroke();
      context.beginPath(); context.moveTo(9, 7); context.bezierCurveTo(19, -2, 10, -26, 18, -29); context.lineTo(26, -28); context.stroke();
      context.beginPath(); context.moveTo(-3, 13); context.lineTo(-6, 30); context.moveTo(3, 13); context.lineTo(8, 29); context.stroke();
      context.beginPath(); context.arc(18, -28, 2.3, 0, Math.PI * 2); context.fill();
    } else if (options.pattern === 'cloud') {
      context.beginPath(); context.moveTo(-31, 12); context.bezierCurveTo(-51, -1, -19, -26, -7, -13); context.bezierCurveTo(-4, -42, 32, -35, 26, -14); context.bezierCurveTo(48, -16, 53, 12, 27, 13); context.closePath(); context.stroke();
      context.beginPath(); context.moveTo(-19, 3); context.quadraticCurveTo(-5, -12, 6, 1); context.quadraticCurveTo(13, 11, 23, 3); context.stroke();
    } else if (options.pattern === 'geometric') {
      for (const radius of [12, 24, 36]) { context.beginPath(); context.moveTo(0, -radius); context.lineTo(radius, 0); context.lineTo(0, radius); context.lineTo(-radius, 0); context.closePath(); context.stroke(); }
      for (const sign of [-1, 1]) { context.beginPath(); context.moveTo(sign * 41, -17); context.lineTo(sign * 48, 0); context.lineTo(sign * 41, 17); context.stroke(); }
    } else if (options.pattern === 'dots') {
      context.beginPath(); context.arc(0, 0, 6, 0, Math.PI * 2); context.fill();
    }
    context.restore();
  };
  if (options.pattern === 'stripes') {
    for (let x = 0; x < size; x += 32) { context.fillRect(x, 0, 5, size); context.globalAlpha *= 0.62; context.fillRect(x + 10, 0, 1.5, size); context.globalAlpha /= 0.62; }
  } else if (options.pattern !== 'plain') {
    // Both rows stop inside the tile. The tile edges remain identical.
    for (const y of [64, 192]) for (const x of [64, 192]) draw(x, y, options.pattern === 'crane' && y === 192 ? -0.18 : 0);
  }
  return canvasTexture(canvas);
}

function generateWeaveMaps(options) {
  const size = 256, spec = FABRICS[options.material], normalPixels = new Uint8Array(size * size * 4), roughPixels = new Uint8Array(size * size * 4);
  const frequency = spec.weave;
  // Periodic functions keep the normal map seamless at each repeat boundary.
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size * Math.PI * 2, v = y / size * Math.PI * 2;
    const weaveX = Math.cos(u * frequency) * (0.65 + Math.sin(v * frequency) * 0.2);
    const weaveY = Math.cos(v * frequency) * (0.65 + Math.sin(u * frequency) * 0.2);
    const foldX = Math.cos(u * 3 + Math.sin(v * 2)) * 0.12;
    const foldY = Math.cos(v * 4 + Math.sin(u * 2)) * 0.12;
    const nx = -(weaveX * 0.48 + foldX), ny = -(weaveY * 0.48 + foldY), length = Math.sqrt(nx * nx + ny * ny + 1);
    const index = (y * size + x) * 4;
    normalPixels[index] = Math.round((nx / length * 0.5 + 0.5) * 255); normalPixels[index + 1] = Math.round((ny / length * 0.5 + 0.5) * 255); normalPixels[index + 2] = Math.round((1 / length * 0.5 + 0.5) * 255); normalPixels[index + 3] = 255;
    const modulation = clamp(0.9 + Math.sin(u * frequency) * Math.sin(v * frequency) * 0.075 + Math.sin(u * 3 + v * 2) * 0.022, 0.75, 1);
    roughPixels[index] = roughPixels[index + 1] = roughPixels[index + 2] = Math.round(modulation * 255); roughPixels[index + 3] = 255;
  }
  const normal = new THREE.DataTexture(normalPixels, size, size, THREE.RGBAFormat), roughness = new THREE.DataTexture(roughPixels, size, size, THREE.RGBAFormat);
  for (const texture of [normal, roughness]) { texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter; texture.generateMipmaps = true; texture.needsUpdate = true; }
  return { normal, roughness };
}

function acquireTextures(options) {
  const key = [options.material, options.color, options.pattern, options.patternScale, Math.round(options.patternStrength * 100)].join('|');
  let entry = textureCache.get(key);
  if (!entry) {
    const woven = generateWeaveMaps(options);
    entry = { key, refs: 0, map: setupTexture(generateColorMap(options), options.patternScale, THREE.SRGBColorSpace), normalMap: setupTexture(woven.normal, 1, THREE.NoColorSpace, 2), roughnessMap: setupTexture(woven.roughness, 1, THREE.NoColorSpace, 2) };
    textureCache.set(key, entry);
  }
  entry.refs++; return entry;
}

function releaseTextures(entry) {
  entry.refs = Math.max(0, entry.refs - 1);
  if (entry.refs === 0) { entry.map.dispose(); entry.normalMap.dispose(); entry.roughnessMap.dispose(); textureCache.delete(entry.key); }
}

export function createFabricMaterial(input = {}) {
  // Hardware and wooden footwear use the same factory, but retain their own
  // reflectance instead of being rendered as glossy cloth.
  if (input.material === 'metal' || input.material === 'wood') {
    const metal = input.material === 'metal';
    const color = /^#[0-9a-f]{6}$/i.test(input.color || '') ? input.color : metal ? '#d8b16a' : '#6e4a32';
    let map;
    if (!metal) {
      const canvas = makeCanvas(128);
      if (canvas) {
        const context = canvas.getContext('2d'); context.fillStyle = color; context.fillRect(0, 0, 128, 128);
        context.strokeStyle = '#e2bc85'; context.lineWidth = 1;
        for (let row = 0; row < 128; row += 3) {
          context.globalAlpha = 0.10 + Math.sin(row * 1.72) * 0.055; context.beginPath();
          for (let x = 0; x <= 128; x += 4) { const y = row + Math.sin(x / 128 * Math.PI * 4 + row * 0.25) * 1.3; if (x === 0) context.moveTo(x, y); else context.lineTo(x, y); }
          context.stroke();
        }
        map = setupTexture(canvasTexture(canvas), 0.5, THREE.SRGBColorSpace);
      }
    }
    const material = new THREE.MeshPhysicalMaterial({ color: map ? '#ffffff' : color, map: map || null, metalness: metal ? 0.82 : 0, roughness: metal ? 0.27 : 0.73, clearcoat: metal ? 0.09 : 0.04, vertexColors: input.vertexColors === true });
    material.userData.fabric = { material: input.material, thickness: metal ? 0.003 : 0.025, clothMotion: false };
    const baseDispose = material.dispose.bind(material); let disposed = false;
    material.dispose = () => { if (disposed) return; disposed = true; map?.dispose(); baseDispose(); };
    material.userData.dispose = material.dispose; return material;
  }
  const options = normalise(input), spec = FABRICS[options.material], maps = acquireTextures(options);
  const material = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', map: maps.map, normalMap: maps.normalMap, roughnessMap: maps.roughnessMap,
    normalScale: new THREE.Vector2(spec.normal, spec.normal),
    roughness: spec.roughness, metalness: 0, sheen: spec.sheen, sheenRoughness: spec.sheenRoughness,
    sheenColor: new THREE.Color(options.color).lerp(new THREE.Color('#fff1d3'), 0.45),
    clearcoat: spec.clearcoat, clearcoatRoughness: 0.5, ior: 1.46,
    specularIntensity: options.material === 'silk' ? 0.55 : 0.82,
    side: THREE.FrontSide, vertexColors: input.vertexColors === true,
    // The generator creates actual inner/outer surfaces and closed boundary edges.
    thickness: spec.thickness, transmission: 0,
  });
  const uniforms = { uClothTime: { value: 0 }, uClothMotion: { value: options.clothMotion ? 1 : 0 } };
  material.userData.fabric = { ...options, thickness: spec.thickness };
  material.userData.uniforms = uniforms;
  material.userData.setClothMotion = enabled => { uniforms.uClothMotion.value = enabled ? 1 : 0; };
  material.defaultAttributeValues = { ...material.defaultAttributeValues, hemFactor: [0] };
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `attribute float hemFactor;\nuniform float uClothTime;\nuniform float uClothMotion;\n${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float fabricHem = clamp(hemFactor, 0.0, 1.0);
      float fabricWave = sin(uClothTime * 1.25 + position.y * 4.1 + position.x * 5.0);
      transformed.x += fabricWave * 0.009 * fabricHem * fabricHem * uClothMotion;
      transformed.z += sin(uClothTime * 1.05 + position.x * 6.4) * 0.006 * fabricHem * uClothMotion;
    `);
  };
  material.customProgramCacheKey = () => 'viet-phuc-procedural-fabric-v2';
  const baseDispose = material.dispose.bind(material); let disposed = false;
  material.dispose = () => { if (disposed) return; disposed = true; releaseTextures(maps); baseDispose(); };
  material.userData.dispose = material.dispose;
  return material;
}

export function updateFabricTime(material, time = 0, enabled) {
  if (Array.isArray(material)) { material.forEach(item => updateFabricTime(item, time, enabled)); return; }
  const uniforms = material?.userData?.uniforms;
  if (!uniforms) return;
  uniforms.uClothTime.value = Number.isFinite(time) ? time : 0;
  if (typeof enabled === 'boolean') uniforms.uClothMotion.value = enabled ? 1 : 0;
}

export function disposeFabricMaterial(material) {
  if (Array.isArray(material)) material.forEach(disposeFabricMaterial);
  else material?.dispose();
}

export function clearMaterialCache() {
  // Live materials retain their maps. Entries release automatically on dispose.
  for (const [key, entry] of textureCache) if (!entry.refs) { entry.map.dispose(); entry.normalMap.dispose(); entry.roughnessMap.dispose(); textureCache.delete(key); }
}
