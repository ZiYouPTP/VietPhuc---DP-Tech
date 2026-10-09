import * as THREE from 'three';

// The mannequin and all its hairstyles are generated locally. Coordinates are
// metres, Y is up, and +Z is the front. No body photograph or model is required.
export const SKIN_TONES = [
  { id: 'porcelain', color: '#f3d7c5', nameVI: 'Sáng hồng', nameEN: 'Light rose' },
  { id: 'ivory', color: '#eac6a6', nameVI: 'Sáng ấm', nameEN: 'Light warm' },
  { id: 'peach', color: '#ddb18e', nameVI: 'Be ấm', nameEN: 'Warm beige' },
  { id: 'golden', color: '#cd9a70', nameVI: 'Vàng ấm', nameEN: 'Golden' },
  { id: 'tan', color: '#b78058', nameVI: 'Nâu mật', nameEN: 'Honey brown' },
  { id: 'copper', color: '#996444', nameVI: 'Nâu đồng', nameEN: 'Copper brown' },
  { id: 'umber', color: '#794d36', nameVI: 'Nâu sẫm', nameEN: 'Deep brown' },
  { id: 'deep', color: '#52372d', nameVI: 'Nâu đậm', nameEN: 'Dark brown' },
];

export const HAIR_STYLES = [
  { id: 'bun', nameVI: 'Búi thấp', nameEN: 'Low bun' },
  { id: 'bob', nameVI: 'Tóc bob', nameEN: 'Bob' },
  { id: 'long', nameVI: 'Tóc dài', nameEN: 'Long' },
  { id: 'braid', nameVI: 'Tóc tết', nameEN: 'Braid' },
  { id: 'short', nameVI: 'Tóc ngắn', nameEN: 'Short' },
  { id: 'ponytail', nameVI: 'Đuôi ngựa', nameEN: 'Ponytail' },
  { id: 'wavy', nameVI: 'Tóc sóng', nameEN: 'Wavy' },
  { id: 'buzz', nameVI: 'Tóc sát', nameEN: 'Buzz cut' },
];

const REGIONS = { torso: 1, arms: 2, legs: 3, neck: 4, head: 5, hands: 6, feet: 7 };
const BONE_NAMES = ['hips', 'spine', 'chest', 'neck', 'head', 'leftUpperArm', 'leftForearm', 'leftHand', 'rightUpperArm', 'rightForearm', 'rightHand', 'leftThigh', 'leftCalf', 'leftFoot', 'rightThigh', 'rightCalf', 'rightFoot'];
const clamp = THREE.MathUtils.clamp;

function normaliseConfig(input = {}) {
  const numericShape = Number(input.shape ?? 0);
  const numericHeight = Number(input.height ?? 1.75);
  return {
    shape: clamp(Number.isFinite(numericShape) ? numericShape : 0, -1, 1),
    height: clamp(Number.isFinite(numericHeight) ? numericHeight : 1.75, 1.45, 2.05),
    skin: /^#[0-9a-f]{6}$/i.test(input.skin || '') ? input.skin : '#cd9a70',
    hair: HAIR_STYLES.some(style => style.id === input.hair) ? input.hair : 'bun',
    gender: ['neutral', 'female', 'male'].includes(input.gender) ? input.gender : 'neutral',
  };
}

function dimensions(config) {
  const scale = config.height / 1.75;
  const width = 1 + config.shape * 0.22;
  const shoulderGender = config.gender === 'male' ? 1.055 : config.gender === 'female' ? 0.965 : 1;
  const hipGender = config.gender === 'female' ? 1.045 : config.gender === 'male' ? 0.97 : 1;
  const rings = [
    [0.79, 0.154 * hipGender, 0.103, 0],
    [0.84, 0.182 * hipGender, 0.113, -0.006],
    [0.92, 0.176 * hipGender, 0.110, -0.002],
    [1.02, 0.139, 0.091, 0],
    [1.10, 0.152, 0.099, 0.002],
    [1.20, 0.175 * shoulderGender, 0.111, 0.001],
    [1.30, 0.196 * shoulderGender, 0.117, 0],
    [1.38, 0.206 * shoulderGender, 0.112, -0.004],
    [1.43, 0.208 * shoulderGender, 0.099, -0.004],
    [1.47, 0.154 * shoulderGender, 0.077, -0.003],
    [1.495, 0.061, 0.050, 0],
  ].map(([y, rx, rz, centerZ]) => ({ y: y * scale, rx: rx * width * scale, rz: rz * (1 + config.shape * 0.26) * scale, centerZ: centerZ * scale }));
  const sample = y => {
    let lower = rings[0], upper = rings[rings.length - 1];
    for (let index = 0; index < rings.length - 1; index++) {
      if (y <= rings[index + 1].y) { lower = rings[index]; upper = rings[index + 1]; break; }
    }
    const fraction = clamp((y - lower.y) / Math.max(upper.y - lower.y, 0.001), 0, 1);
    return { rx: THREE.MathUtils.lerp(lower.rx, upper.rx, fraction), rz: THREE.MathUtils.lerp(lower.rz, upper.rz, fraction), centerZ: THREE.MathUtils.lerp(lower.centerZ, upper.centerZ, fraction) };
  };
  return { scale, width, rings, sample, shoulder: 0.208 * shoulderGender * width * scale, hip: 0.106 * hipGender * width * scale };
}

function bonePositions(dim) {
  const s = dim.scale, shoulder = dim.shoulder, hip = dim.hip;
  const positions = {
    hips: [0, 0.84 * s, 0], spine: [0, 1.05 * s, 0], chest: [0, 1.32 * s, 0],
    neck: [0, 1.48 * s, 0], head: [0, 1.60 * s, 0],
  };
  for (const [side, sign] of [['left', 1], ['right', -1]]) {
    positions[`${side}UpperArm`] = [sign * shoulder, 1.425 * s, -0.006 * s];
    positions[`${side}Forearm`] = [sign * (shoulder + 0.061 * s), 1.125 * s, 0.007 * s];
    positions[`${side}Hand`] = [sign * (shoulder + 0.091 * s), 0.855 * s, 0.022 * s];
    positions[`${side}Thigh`] = [sign * hip, 0.835 * s, 0];
    positions[`${side}Calf`] = [sign * (hip + 0.006 * s), 0.445 * s, 0.008 * s];
    positions[`${side}Foot`] = [sign * (hip + 0.008 * s), 0.075 * s, 0.02 * s];
  }
  return Object.fromEntries(Object.entries(positions).map(([name, value]) => [name, new THREE.Vector3(...value)]));
}

function skinFor(y, region, side = 'left', dim) {
  const sy = y / dim.scale;
  let first = 'hips', second = 'spine', amount = clamp((sy - 0.91) / 0.23, 0, 1);
  if (region === REGIONS.torso && sy > 1.17) { first = 'spine'; second = 'chest'; amount = clamp((sy - 1.17) / 0.22, 0, 1); }
  if (region === REGIONS.neck) { first = 'chest'; second = 'neck'; amount = 0.8; }
  if (region === REGIONS.head) { first = 'head'; second = 'head'; amount = 0; }
  if (region === REGIONS.arms) { first = `${side}UpperArm`; second = `${side}Forearm`; amount = clamp((1.17 - sy) / 0.10, 0, 1); }
  if (region === REGIONS.hands) { first = `${side}Hand`; second = first; amount = 0; }
  if (region === REGIONS.legs) { first = `${side}Thigh`; second = `${side}Calf`; amount = clamp((0.51 - sy) / 0.11, 0, 1); }
  if (region === REGIONS.feet) { first = `${side}Foot`; second = first; amount = 0; }
  return { indices: [BONE_NAMES.indexOf(first), BONE_NAMES.indexOf(second), 0, 0], weights: [1 - amount, amount, 0, 0] };
}

function buildBodyData(config) {
  const dim = dimensions(config), positions = [], uv = [], regions = [], skinIndices = [], skinWeights = [], indices = [];
  const put = (point, texture, region, side) => {
    const index = positions.length / 3;
    positions.push(point.x, point.y, point.z); uv.push(...texture); regions.push(region);
    const skin = skinFor(point.y, region, side, dim); skinIndices.push(...skin.indices); skinWeights.push(...skin.weights);
    return index;
  };
  function ringSurface(rings, segments, region, side = 'left', cap = true) {
    const start = positions.length / 3;
    rings.forEach((ring, ri) => {
      const center = ring.center || new THREE.Vector3(0, ring.y, ring.centerZ || 0);
      const axis = ring.axis || new THREE.Vector3(0, 1, 0);
      const radialX = new THREE.Vector3(1, 0, 0).addScaledVector(axis, -axis.x).normalize();
      const radialZ = new THREE.Vector3().crossVectors(radialX, axis).normalize();
      for (let segment = 0; segment <= segments; segment++) {
        const theta = segment / segments * Math.PI * 2;
        const p = center.clone().addScaledVector(radialX, Math.sin(theta) * ring.rx).addScaledVector(radialZ, Math.cos(theta) * ring.rz);
        put(p, [segment / segments, ri / Math.max(rings.length - 1, 1)], region, side);
      }
    });
    const stride = segments + 1;
    for (let row = 0; row < rings.length - 1; row++) {
      for (let segment = 0; segment < segments; segment++) {
        const a = start + row * stride + segment, b = a + 1, c = a + stride, d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }
    if (cap) {
      for (const [row, isTop] of [[0, false], [rings.length - 1, true]]) {
        const ring = rings[row];
        const center = put(ring.center || new THREE.Vector3(0, ring.y, ring.centerZ || 0), [0.5, isTop ? 1 : 0], region, side);
        for (let segment = 0; segment < segments; segment++) {
          const a = start + row * stride + segment;
          indices.push(...(isTop ? [center, a + 1, a] : [center, a, a + 1]));
        }
      }
    }
  }
  function ellipsoid(center, radius, region, side = 'left', segments = 16, rows = 10) {
    const rings = Array.from({ length: rows + 1 }, (_, row) => {
      const latitude = -Math.PI / 2 + row / rows * Math.PI;
      const horizontal = Math.max(Math.cos(latitude), 0.002);
      return { center: center.clone().add(new THREE.Vector3(0, Math.sin(latitude) * radius.y, 0)), rx: radius.x * horizontal, rz: radius.z * horizontal };
    });
    ringSurface(rings, segments, region, side, true);
  }
  ringSurface(dim.rings, 32, REGIONS.torso);
  const s = dim.scale;
  ringSurface([1.47, 1.51, 1.55].map(y => ({ y: y * s, rx: 0.049 * s, rz: 0.045 * s })), 16, REGIONS.neck);
  ellipsoid(new THREE.Vector3(0, 1.622 * s, 0), new THREE.Vector3(0.096 * s, 0.126 * s, 0.094 * s), REGIONS.head, 'left', 20, 14);
  ellipsoid(new THREE.Vector3(0, 1.602 * s, 0.091 * s), new THREE.Vector3(0.016 * s, 0.023 * s, 0.018 * s), REGIONS.head, 'left', 10, 6);
  const bones = bonePositions(dim);
  for (const [side, sign] of [['left', 1], ['right', -1]]) {
    ellipsoid(new THREE.Vector3(sign * 0.095 * s, 1.616 * s, -0.003 * s), new THREE.Vector3(0.015 * s, 0.031 * s, 0.018 * s), REGIONS.head, side, 8, 6);
    const shoulder = bones[`${side}UpperArm`], elbow = bones[`${side}Forearm`], wrist = bones[`${side}Hand`];
    const armRings = [];
    for (let row = 0; row <= 10; row++) {
      const t = row / 10;
      const center = t < 0.5 ? wrist.clone().lerp(elbow, t * 2) : elbow.clone().lerp(shoulder, (t - 0.5) * 2);
      const axis = (t < 0.5 ? elbow.clone().sub(wrist) : shoulder.clone().sub(elbow)).normalize();
      const radius = (t < 0.5 ? THREE.MathUtils.lerp(0.035, 0.052, t * 2) : THREE.MathUtils.lerp(0.052, 0.064, (t - 0.5) * 2)) * s * (1 + config.shape * 0.13);
      armRings.push({ center, axis, rx: radius, rz: radius * 0.88 });
    }
    ringSurface(armRings, 16, REGIONS.arms, side);
    const palm = wrist.clone().add(new THREE.Vector3(sign * 0.005 * s, -0.056 * s, 0.003 * s));
    ellipsoid(palm, new THREE.Vector3(0.037 * s, 0.061 * s, 0.020 * s), REGIONS.hands, side, 12, 7);
    for (let finger = 0; finger < 4; finger++) {
      const fingerCenter = palm.clone().add(new THREE.Vector3((finger - 1.5) * 0.014 * s, (-0.062 + Math.abs(finger - 1.5) * 0.004) * s, 0.001 * s));
      ellipsoid(fingerCenter, new THREE.Vector3(0.009 * s, (0.034 - Math.abs(finger - 1.5) * 0.003) * s, 0.011 * s), REGIONS.hands, side, 6, 4);
    }
    ellipsoid(palm.clone().add(new THREE.Vector3(-sign * 0.034 * s, -0.015 * s, 0.005 * s)), new THREE.Vector3(0.016 * s, 0.034 * s, 0.013 * s), REGIONS.hands, side, 8, 5);
    const thigh = bones[`${side}Thigh`], knee = bones[`${side}Calf`], ankle = bones[`${side}Foot`];
    const legRings = [];
    for (let row = 0; row <= 12; row++) {
      const t = row / 12;
      const center = t < 0.48 ? ankle.clone().lerp(knee, t / 0.48) : knee.clone().lerp(thigh, (t - 0.48) / 0.52);
      let radius = t < 0.48 ? 0.040 + Math.sin(t / 0.48 * Math.PI * 0.82) * 0.028 : THREE.MathUtils.lerp(0.064, 0.087, (t - 0.48) / 0.52);
      radius *= s * (1 + config.shape * 0.18);
      legRings.push({ center, rx: radius, rz: radius * 1.04 });
    }
    ringSurface(legRings, 16, REGIONS.legs, side);
    ellipsoid(new THREE.Vector3(ankle.x, 0.055 * s, 0.077 * s), new THREE.Vector3(0.057 * s, 0.052 * s, 0.122 * s), REGIONS.feet, side, 14, 8);
  }
  return { positions, uv, regions, skinIndices, skinWeights, indices, dim, bones };
}

function addEllipsoid(group, material, center, radii, segments = 16) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, 12), material);
  mesh.position.copy(center); mesh.scale.set(...radii); mesh.castShadow = true; group.add(mesh); return mesh;
}

function disposeMeshes(group, disposeMaterials = false) {
  const materials = new Set();
  group.traverse(object => {
    object.geometry?.dispose();
    if (disposeMaterials && object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
  });
  materials.forEach(material => material.dispose());
  group.clear();
}

function createHair(style, scale) {
  const root = new THREE.Group(); root.name = `procedural-hair-${style}`;
  const material = new THREE.MeshStandardMaterial({ color: '#241b24', roughness: 0.7, metalness: 0, side: THREE.DoubleSide });
  const capGeometry = new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, style === 'buzz' ? 1.29 : 1.34);
  const cap = new THREE.Mesh(capGeometry, material); cap.scale.set(0.104 * scale, 0.134 * scale, 0.106 * scale); cap.position.set(0, 0.020 * scale, -0.003 * scale); cap.castShadow = true; root.add(cap);
  const ball = (p, r, detail) => addEllipsoid(root, material, new THREE.Vector3(...p).multiplyScalar(scale), r.map(value => value * scale), detail);
  if (style === 'bun') {
    ball([0, -0.045, -0.099], [0.058, 0.046, 0.044], 20);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.031 * scale, 0.004 * scale, 6, 18), new THREE.MeshStandardMaterial({ color: '#be9454', roughness: 0.45, metalness: 0.35 }));
    tie.position.set(0, -0.041 * scale, -0.125 * scale); root.add(tie);
  }
  if (style === 'bob' || style === 'long' || style === 'wavy') {
    const isLong = style !== 'bob', length = isLong ? 0.225 : 0.083;
    for (const sign of [-1, 1]) {
      if (!isLong) ball([sign * 0.078, -length * 0.45, -0.022], [0.034, length * 0.62 + 0.035, 0.063]);
      else {
        // Long side sections bend over the shoulder rather than entering it.
        const sidePoints = [[sign * 0.080, 0.060, -0.029], [sign * 0.105, -0.020, -0.034], [sign * 0.135, -0.130, -0.050], [sign * 0.158, -0.243, -0.086]].map(point => new THREE.Vector3(...point).multiplyScalar(scale));
        const strand = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sidePoints), 18, 0.035 * scale, 10, false), material); strand.castShadow = true; root.add(strand);
      }
      if (style === 'wavy') for (let part = 0; part < 4; part++) ball([sign * (0.105 + part * 0.017 + Math.sin(part * 2) * 0.006), -0.052 - part * 0.054, -0.05 - part * 0.010], [0.037, 0.041, 0.040]);
    }
    ball([0, -length * 0.46, -0.078], [0.085, length * 0.62 + 0.03, 0.033]);
  }
  if (style === 'braid' || style === 'ponytail') {
    const points = [new THREE.Vector3(0, 0.013, -0.102), new THREE.Vector3(0.012, -0.077, -0.126), new THREE.Vector3(0.010, -0.185, -0.104), new THREE.Vector3(0.038, -0.295, -0.090)].map(point => point.multiplyScalar(scale));
    const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 18, (style === 'braid' ? 0.022 : 0.037) * scale, 10, false), material); tail.castShadow = true; root.add(tail);
    if (style === 'braid') for (let part = 0; part < 7; part++) ball([part % 2 ? 0.013 : -0.005, -0.075 - part * 0.031, -0.112], [0.024, 0.026, 0.025], 12);
  }
  if (style === 'short') {
    ball([-0.04, 0.109, 0.031], [0.053, 0.025, 0.065]);
    ball([0.043, 0.115, 0.025], [0.053, 0.030, 0.063]);
  }
  return root;
}

export function createBody(initialConfig = {}) {
  const config = normaliseConfig(initialConfig), group = new THREE.Group(); group.name = 'generated-body';
  let built = buildBodyData(config), maskRegions = [], hair;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(built.positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(built.uv, 2));
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(built.skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(built.skinWeights, 4));
  geometry.setAttribute('region', new THREE.Uint8BufferAttribute(built.regions, 1));
  const fullIndex = new Uint32Array(built.indices); geometry.setIndex(new THREE.BufferAttribute(fullIndex.slice(), 1)); geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  geometry.userData.fullIndex = fullIndex;
  const material = new THREE.MeshPhysicalMaterial({ color: config.skin, roughness: 0.69, metalness: 0, sheen: 0.12, sheenRoughness: 0.85, sheenColor: '#e8bea1' });
  const mesh = new THREE.SkinnedMesh(geometry, material); mesh.name = 'parametric-body'; mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
  const boneMap = Object.fromEntries(BONE_NAMES.map(name => { const bone = new THREE.Bone(); bone.name = name; return [name, bone]; }));
  const parentMap = { spine: 'hips', chest: 'spine', neck: 'chest', head: 'neck', leftUpperArm: 'chest', leftForearm: 'leftUpperArm', leftHand: 'leftForearm', rightUpperArm: 'chest', rightForearm: 'rightUpperArm', rightHand: 'rightForearm', leftThigh: 'hips', leftCalf: 'leftThigh', leftFoot: 'leftCalf', rightThigh: 'hips', rightCalf: 'rightThigh', rightFoot: 'rightCalf' };
  Object.entries(parentMap).forEach(([name, parent]) => boneMap[parent].add(boneMap[name])); mesh.add(boneMap.hips);
  const skeleton = new THREE.Skeleton(BONE_NAMES.map(name => boneMap[name]));
  function resetSkeleton() {
    BONE_NAMES.forEach(name => {
      const rest = built.bones[name];
      boneMap[name].position.copy(rest);
      if (parentMap[name]) boneMap[name].position.sub(built.bones[parentMap[name]]);
      boneMap[name].rotation.set(0, 0, 0); boneMap[name].scale.set(1, 1, 1);
    });
    group.updateMatrixWorld(true); skeleton.calculateInverses(); mesh.bind(skeleton); skeleton.update();
  }
  resetSkeleton();
  const landmarks = Object.fromEntries(['headwear', 'hair', 'leftEar', 'rightEar', 'belt', 'leftHand', 'rightHand', 'leftFoot', 'rightFoot'].map(name => [name, new THREE.Vector3()]));
  function updateLandmarks() {
    const s = built.dim.scale;
    landmarks.headwear.set(0, 1.758 * s, -0.006 * s); landmarks.hair.copy(built.bones.head).add(new THREE.Vector3(0, 0.022 * s, 0));
    landmarks.leftEar.set(0.103 * s, 1.605 * s, 0); landmarks.rightEar.set(-0.103 * s, 1.605 * s, 0); landmarks.belt.set(0, 1.03 * s, 0);
    ['leftHand', 'rightHand', 'leftFoot', 'rightFoot'].forEach(name => landmarks[name].copy(built.bones[name]));
  }
  const face = new THREE.Group(); face.name = 'stylised-face'; boneMap.head.add(face);
  function updateFace() {
    disposeMeshes(face, true); const s = built.dim.scale;
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: '#352427' });
    for (const sign of [-1, 1]) addEllipsoid(face, eyeMaterial, new THREE.Vector3(sign * 0.033 * s, 0.029 * s, 0.101 * s), [0.0095 * s, 0.005 * s, 0.0035 * s], 12);
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(config.skin).multiplyScalar(0.55) });
    addEllipsoid(face, mouthMaterial, new THREE.Vector3(0, -0.014 * s, 0.092 * s), [0.016 * s, 0.0023 * s, 0.0025 * s], 12);
  }
  function setHair(style) {
    if (hair) { hair.removeFromParent(); disposeMeshes(hair, true); }
    config.hair = HAIR_STYLES.some(item => item.id === style) ? style : 'bun';
    hair = createHair(config.hair, built.dim.scale); boneMap.head.add(hair);
    return hair;
  }
  function profile(y) { return built.dim.sample(y); }
  function getSurface(y, theta = 0) { const p = profile(y); return new THREE.Vector3(Math.sin(theta) * p.rx, y, Math.cos(theta) * p.rz + p.centerZ); }
  mesh.userData.fullIndex = fullIndex; mesh.userData.config = config; mesh.userData.landmarks = landmarks; mesh.userData.boneMap = boneMap; mesh.userData.profile = profile; mesh.userData.getSurface = getSurface;
  function setMaskRegions(requested = []) {
    maskRegions = Array.isArray(requested) ? requested : [requested];
    if (!maskRegions.length) { geometry.setIndex(new THREE.BufferAttribute(fullIndex.slice(), 1)); return; }
    const rules = maskRegions.map(rule => typeof rule === 'object' ? { ...rule, region: typeof rule.region === 'string' ? REGIONS[rule.region] : rule.region } : { region: typeof rule === 'string' ? REGIONS[rule] : rule });
    const position = geometry.attributes.position, region = geometry.attributes.region, visible = [];
    for (let tri = 0; tri < fullIndex.length; tri += 3) {
      const a = fullIndex[tri], b = fullIndex[tri + 1], c = fullIndex[tri + 2], y = (position.getY(a) + position.getY(b) + position.getY(c)) / 3;
      const hidden = rules.some(rule => {
        if (region.getX(a) !== rule.region || y < (rule.minY ?? -Infinity) || y > (rule.maxY ?? Infinity)) return false;
        if (rule.excludeFrontAngle) {
          const x = (position.getX(a) + position.getX(b) + position.getX(c)) / 3;
          const z = (position.getZ(a) + position.getZ(b) + position.getZ(c)) / 3;
          if (z > 0 && Math.abs(Math.atan2(x, z)) < rule.excludeFrontAngle) return false;
        }
        return true;
      });
      if (!hidden) visible.push(a, b, c);
    }
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(visible), 1));
  }
  function updateConfig(next = {}) {
    const previousHair = config.hair, previousHeight = config.height, previousShape = config.shape, previousGender = config.gender;
    Object.assign(config, normaliseConfig({ ...config, ...next })); material.color.set(config.skin);
    const rebuild = previousShape !== config.shape || previousHeight !== config.height || previousGender !== config.gender;
    if (rebuild) {
      built = buildBodyData(config);
      geometry.attributes.position.array.set(built.positions); geometry.attributes.position.needsUpdate = true;
      geometry.attributes.skinIndex.array.set(built.skinIndices); geometry.attributes.skinIndex.needsUpdate = true;
      geometry.attributes.skinWeight.array.set(built.skinWeights); geometry.attributes.skinWeight.needsUpdate = true;
      // Calculate normals on the full body before restoring the clothing mask.
      geometry.setIndex(new THREE.BufferAttribute(fullIndex.slice(), 1)); geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
      resetSkeleton(); updateLandmarks(); setMaskRegions(maskRegions);
    }
    if (rebuild || previousHair !== config.hair) setHair(config.hair);
    updateFace(); return api;
  }
  function animate(time = 0, enabled = true) {
    const factor = enabled ? 1 : 0;
    boneMap.chest.rotation.z = Math.sin(time * 0.65) * 0.006 * factor;
    boneMap.head.rotation.y = Math.sin(time * 0.43) * 0.022 * factor;
    boneMap.head.rotation.z = Math.sin(time * 0.39) * 0.008 * factor;
    group.updateMatrixWorld(true); skeleton.update();
  }
  function dispose() { disposeMeshes(face, true); if (hair) disposeMeshes(hair, true); geometry.dispose(); material.dispose(); skeleton.dispose(); group.removeFromParent(); group.clear(); }
  const api = { group, root: group, mesh, skeleton, config, landmarks, boneMap, profile, getSurface, updateConfig, updateBody: updateConfig, setMaskRegions, updateMask: setMaskRegions, setCoveredRegions: setMaskRegions, setHair, animate, idle: animate, dispose };
  updateLandmarks(); updateFace(); setHair(config.hair); return api;
}
