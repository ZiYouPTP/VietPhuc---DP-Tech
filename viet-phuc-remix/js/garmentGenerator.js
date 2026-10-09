import * as THREE from 'three';
import {GARMENT_BY_ID} from './garments.js';

// All distances are metres. No external garment assets or heavy cloth simulation.
const cache = new Map();
const CACHE_LIMIT = 10;
const stats = {generated: 0, cacheHits: 0, fallbackCount: 0, disposed: 0};
const MATERIAL_THICKNESS = {silk: 0.0011, linen: 0.0017, brocade: 0.0024, velvet: 0.003};
const Y_SCALE = 1.75;
const RAD = Math.PI / 180;
const clamp = THREE.MathUtils.clamp;

function scaleFor(body) {
  const box = new THREE.Box3().setFromBufferAttribute(body.mesh.geometry.attributes.position);
  const actualHeight = Number(body.config?.height);
  return actualHeight > 1 && actualHeight < 2.4 ? actualHeight / Y_SCALE : Math.max(0.75, (box.max.y - box.min.y) / Y_SCALE);
}
function profile(body, y) {
  const fn = body.profile || body.mesh.userData.profile;
  if (typeof fn === 'function') return fn(y);
  const s = scaleFor(body);
  const t = clamp((y / s - 1.02) / 0.28, 0, 1);
  return {rx: (0.14 + t * 0.06) * s, rz: (0.09 + t * 0.025) * s, centerZ: 0};
}
function surfacePoint(body, y, theta, offset = 0) {
  const p = profile(body, y);
  return new THREE.Vector3(Math.sin(theta) * (p.rx + offset), y, (p.centerZ || 0) + Math.cos(theta) * (p.rz + offset));
}
function easeAt(y, curve, s) {
  if (typeof curve === 'number') return curve * s;
  if (!curve?.length) return 0.016 * s;
  const value = y / s;
  if (value <= curve[0][0]) return curve[0][1] * s;
  for (let i = 1; i < curve.length; i++) {
    if (value <= curve[i][0]) {
      const t = (value - curve[i - 1][0]) / (curve[i][0] - curve[i - 1][0]);
      return THREE.MathUtils.lerp(curve[i - 1][1], curve[i][1], t) * s;
    }
  }
  return curve.at(-1)[1] * s;
}
function fullIndex(body) {
  return body.mesh.userData.fullIndex || body.mesh.geometry.userData.fullIndex || body.mesh.geometry.index?.array;
}
function triangleCount(geometry) { return (geometry.index?.count || geometry.attributes.position.count) / 3; }
function boneIndex(body, name, fallback = 0) {
  const value = body.boneMap?.[name];
  if (typeof value === 'number') return value;
  if (value) { const n = body.skeleton.bones.indexOf(value); if (n >= 0) return n; }
  const n = body.skeleton.bones.findIndex((bone) => bone.name.toLowerCase().includes(name.toLowerCase()));
  return n < 0 ? fallback : n;
}

function createBodyLookup(body) {
  const geometry = body.mesh.geometry;
  const indices = fullIndex(body);
  if (!indices?.length || !geometry.attributes.position) throw new Error('Body must have an indexed surface');
  const position = geometry.attributes.position;
  const cellSize = 0.13 * scaleFor(body);
  const grid = new Map();
  const vertexTriangle = new Int32Array(position.count).fill(-1);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const key = (x, y, z) => `${x},${y},${z}`;
  for (let i = 0; i < indices.length; i += 3) {
    const tri = i / 3;
    a.fromBufferAttribute(position, indices[i]); b.fromBufferAttribute(position, indices[i + 1]); c.fromBufferAttribute(position, indices[i + 2]);
    for (let k = 0; k < 3; k++) if (vertexTriangle[indices[i + k]] < 0) vertexTriangle[indices[i + k]] = tri;
    const minX = Math.floor(Math.min(a.x, b.x, c.x) / cellSize), maxX = Math.floor(Math.max(a.x, b.x, c.x) / cellSize);
    const minY = Math.floor(Math.min(a.y, b.y, c.y) / cellSize), maxY = Math.floor(Math.max(a.y, b.y, c.y) / cellSize);
    const minZ = Math.floor(Math.min(a.z, b.z, c.z) / cellSize), maxZ = Math.floor(Math.max(a.z, b.z, c.z) / cellSize);
    for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) for (let z = minZ; z <= maxZ; z++) {
      const id = key(x, y, z);
      if (!grid.has(id)) grid.set(id, []);
      grid.get(id).push(tri);
    }
  }
  const triangle = new THREE.Triangle(), closest = new THREE.Vector3(), bary = new THREE.Vector3();
  const readTriangle = (tri) => {
    const start = tri * 3;
    triangle.a.fromBufferAttribute(position, indices[start]);
    triangle.b.fromBufferAttribute(position, indices[start + 1]);
    triangle.c.fromBufferAttribute(position, indices[start + 2]);
    return triangle;
  };
  return {
    body, position, indices, vertexTriangle, readTriangle,
    nearest(point, sourceVertex = -1) {
      if (sourceVertex >= 0 && vertexTriangle[sourceVertex] >= 0) {
        const tri = vertexTriangle[sourceVertex], start = tri * 3;
        const weights = [0, 0, 0];
        weights[indices[start] === sourceVertex ? 0 : indices[start + 1] === sourceVertex ? 1 : 2] = 1;
        return {tri, bary: weights, point: new THREE.Vector3().fromBufferAttribute(position, sourceVertex)};
      }
      const cellX = Math.floor(point.x / cellSize), cellY = Math.floor(point.y / cellSize), cellZ = Math.floor(point.z / cellSize);
      const candidates = new Set();
      for (let r = 0; r <= 2 && candidates.size < 3; r++) {
        for (let x = cellX - r; x <= cellX + r; x++) for (let y = cellY - r; y <= cellY + r; y++) for (let z = cellZ - r; z <= cellZ + r; z++) {
          for (const tri of grid.get(key(x, y, z)) || []) candidates.add(tri);
        }
      }
      if (!candidates.size) for (let tri = 0; tri < indices.length / 3; tri++) candidates.add(tri);
      let best = Infinity, bestTri = 0;
      const bestPoint = new THREE.Vector3();
      for (const tri of candidates) {
        readTriangle(tri).closestPointToPoint(point, closest);
        const d = closest.distanceToSquared(point);
        if (d < best) { best = d; bestTri = tri; bestPoint.copy(closest); }
      }
      readTriangle(bestTri).getBarycoord(bestPoint, bary);
      return {tri: bestTri, bary: [bary.x, bary.y, bary.z], point: bestPoint};
    },
  };
}

function triangleFrame(lookup, tri, weights) {
  const g = lookup.body.mesh.geometry, start = tri * 3, ids = [lookup.indices[start], lookup.indices[start + 1], lookup.indices[start + 2]];
  const normal = new THREE.Vector3();
  if (g.attributes.normal) for (let k = 0; k < 3; k++) normal.addScaledVector(new THREE.Vector3().fromBufferAttribute(g.attributes.normal, ids[k]), weights[k]);
  if (normal.lengthSq() < 1e-8) lookup.readTriangle(tri).getNormal(normal);
  normal.normalize();
  const triangle = lookup.readTriangle(tri);
  const tangent = triangle.b.clone().sub(triangle.a);
  tangent.addScaledVector(normal, -tangent.dot(normal));
  if (tangent.lengthSq() < 1e-8) tangent.set(1, 0, 0).addScaledVector(normal, -normal.x);
  tangent.normalize();
  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
  return {ids, normal, tangent, bitangent};
}
function skinAt(lookup, ids, bary, hemFactor = 0, anchor = null) {
  if (anchor !== null) return {indices: [anchor, 0, 0, 0], weights: [1, 0, 0, 0]};
  const si = lookup.body.mesh.geometry.attributes.skinIndex, sw = lookup.body.mesh.geometry.attributes.skinWeight;
  const weights = new Map();
  if (si && sw) for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) {
    const id = si.array[ids[k] * 4 + j];
    weights.set(id, (weights.get(id) || 0) + sw.array[ids[k] * 4 + j] * bary[k]);
  }
  // The hem follows pelvis instead of borrowing individual moving leg weights.
  const pelvis = boneIndex(lookup.body, 'pelvis', boneIndex(lookup.body, 'hips', 0));
  const fade = clamp(hemFactor * 0.88, 0, 0.88);
  if (fade) { for (const [id, value] of weights) weights.set(id, value * (1 - fade)); weights.set(pelvis, (weights.get(pelvis) || 0) + fade); }
  const entries = [...weights].sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (!entries.length) entries.push([pelvis, 1]);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0) || 1;
  while (entries.length < 4) entries.push([0, 0]);
  return {indices: entries.map((entry) => entry[0]), weights: entries.map((entry) => entry[1] / total)};
}
function attachBindings(geometry, lookup, metadata = {}) {
  const position = geometry.attributes.position, count = position.count;
  const tri = new Uint32Array(count), bary = new Float32Array(count * 3), offset = new Float32Array(count), tangential = new Float32Array(count * 2);
  const skinIndices = new Uint16Array(count * 4), skinWeights = new Float32Array(count * 4);
  const hem = geometry.attributes.hemFactor || new THREE.Float32BufferAttribute(new Float32Array(count), 1);
  const colors = new Float32Array(count * 3);
  const p = new THREE.Vector3(), delta = new THREE.Vector3();
  for (let v = 0; v < count; v++) {
    p.fromBufferAttribute(position, v);
    const nearest = lookup.nearest(p, metadata.sourceVertex?.[v] ?? -1), frame = triangleFrame(lookup, nearest.tri, nearest.bary);
    delta.copy(p).sub(nearest.point);
    tri[v] = nearest.tri; bary.set(nearest.bary, v * 3);
    offset[v] = delta.dot(frame.normal);
    tangential[v * 2] = delta.dot(frame.tangent); tangential[v * 2 + 1] = delta.dot(frame.bitangent);
    const skin = skinAt(lookup, frame.ids, nearest.bary, metadata.skirt ? hem.getX(v) : 0, metadata.anchor ?? null);
    skinIndices.set(skin.indices, v * 4); skinWeights.set(skin.weights, v * 4);
    // Stable, inexpensive contact AO: deeper near body, folds and overlap layers.
    const gap = Math.max(0, offset[v]);
    const underarm = p.y > 1.10 * metadata.scale && p.y < 1.43 * metadata.scale && Math.abs(p.x) > 0.17 * metadata.scale;
    const ao = clamp(0.83 + Math.min(0.16, gap * 5) - (underarm ? 0.055 : 0) - (metadata.layer > 0 ? 0.018 : 0), 0.72, 1);
    colors[v * 3] = colors[v * 3 + 1] = colors[v * 3 + 2] = ao;
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  geometry.setAttribute('hemFactor', hem);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.userData.binding = {triangle: tri, barycentric: bary, offset, tangential, cutY: geometry.userData.cutY ? Float32Array.from(geometry.userData.cutY) : null, scale: metadata.scale, anchor: metadata.anchor ?? null, skirt: !!metadata.skirt};
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  return geometry;
}

function resolveShellClearance(geometry, lookup, scale) {
  // Independent mannequin limb shells overlap slightly at shoulders. Project
  // only contacting shell vertices; three bounded passes keep generation cheap.
  const position = geometry.attributes.position, point = new THREE.Vector3(), delta = new THREE.Vector3(), shift = new THREE.Vector3();
  const half = position.count / 2;
  for (let pass = 0; pass < 3; pass++) {
    let moved = 0;
    for (let v = 0; v < half; v++) {
      let worst = 0.0025 * scale; shift.set(0, 0, 0);
      for (const id of [v, v + half]) {
        point.fromBufferAttribute(position, id);
        const nearest = lookup.nearest(point), frame = triangleFrame(lookup, nearest.tri, nearest.bary);
        const signed = delta.copy(point).sub(nearest.point).dot(frame.normal);
        if (signed < worst) { worst = signed; shift.copy(frame.normal).multiplyScalar(0.003 * scale - signed); }
      }
      if (shift.lengthSq()) {
        for (const id of [v, v + half]) {
          point.fromBufferAttribute(position, id).add(shift);
          if (Number.isFinite(geometry.userData.cutY?.[id])) point.y = geometry.userData.cutY[id] * scale;
          position.setXYZ(id, point.x, point.y, point.z);
        }
        moved++;
      }
    }
    if (!moved) break;
  }
  position.needsUpdate = true; geometry.computeVertexNormals();
}

function makeSurface(vertices, indices, uv, hemFactor, sourceVertex) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setAttribute('hemFactor', new THREE.Float32BufferAttribute(hemFactor || new Float32Array(vertices.length / 3), 1));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  geometry.userData.sourceVertex = sourceVertex || Array(vertices.length / 3).fill(-1);
  return geometry;
}
function smoothSurface(geometry, passes = 1) {
  const p = geometry.attributes.position, index = geometry.index.array, neighbors = Array.from({length: p.count}, () => new Set()), boundaryEdges = new Map();
  for (let i = 0; i < index.length; i += 3) for (let j = 0; j < 3; j++) {
    const a = index[i + j], b = index[i + (j + 1) % 3], key = a < b ? `${a}:${b}` : `${b}:${a}`;
    neighbors[a].add(b); neighbors[b].add(a); boundaryEdges.set(key, (boundaryEdges.get(key) || 0) + 1);
  }
  const boundary = new Set();
  for (const [key, count] of boundaryEdges) if (count === 1) key.split(':').forEach((v) => boundary.add(Number(v)));
  for (let n = 0; n < passes; n++) {
    const previous = Float32Array.from(p.array);
    for (let v = 0; v < p.count; v++) {
      if (boundary.has(v) || !neighbors[v].size) continue;
      const center = [0, 0, 0];
      for (const id of neighbors[v]) for (let k = 0; k < 3; k++) center[k] += previous[id * 3 + k];
      for (let k = 0; k < 3; k++) p.array[v * 3 + k] = previous[v * 3 + k] * 0.91 + center[k] / neighbors[v].size * 0.09;
    }
  }
  p.needsUpdate = true; geometry.computeVertexNormals();
}
function solidify(surface, thickness) {
  // Explicit inner, outer and boundary-wall triangles, not just DoubleSide.
  const p = surface.attributes.position, n = surface.attributes.normal, uv = surface.attributes.uv, h = surface.attributes.hemFactor;
  const count = p.count, positions = [], uvs = [], hems = [], sourceVertex = [], indices = [], edges = new Map(), cutY = [];
  for (let side = 0; side < 2; side++) for (let v = 0; v < count; v++) {
    const amount = side ? -thickness : 0;
    const cut = surface.userData.cutY?.[v];
    positions.push(p.getX(v) + n.getX(v) * amount, Number.isFinite(cut) ? p.getY(v) : p.getY(v) + n.getY(v) * amount, p.getZ(v) + n.getZ(v) * amount);
    uvs.push(uv.getX(v), uv.getY(v)); hems.push(h.getX(v)); sourceVertex.push(surface.userData.sourceVertex[v]);
    cutY.push(Number.isFinite(cut) ? cut : NaN);
  }
  const src = surface.index.array;
  for (let i = 0; i < src.length; i += 3) {
    const a = src[i], b = src[i + 1], c = src[i + 2];
    indices.push(a, b, c, c + count, b + count, a + count);
    for (const [x, y] of [[a, b], [b, c], [c, a]]) {
      const key = x < y ? `${x}:${y}` : `${y}:${x}`;
      if (edges.has(key)) edges.get(key).count++; else edges.set(key, {a: x, b: y, count: 1});
    }
  }
  for (const {a, b, count: edgeCount} of edges.values()) if (edgeCount === 1) indices.push(b, a, a + count, b, a + count, b + count);
  const geometry = makeSurface(positions, indices, uvs, hems, sourceVertex);
  if (surface.userData.cutY) geometry.userData.cutY = cutY;
  surface.dispose();
  return geometry;
}
function shellGeometry(body, params, s, thickness, simple) {
  const g = body.mesh.geometry, source = fullIndex(body), pos = g.attributes.position, normal = g.attributes.normal, regions = g.attributes.region;
  const vertices = [], indices = [], uv = [], hem = [], sourceVertex = [], cutY = [], map = new Map();
  const selected = new Set(params.regions || [1, 2]);
  const minY = (params.minY ?? 1.015) * s, maxY = (params.maxY ?? 1.5) * s;
  const include = (ids) => {
    let y = 0, x = 0, z = 0;
    const region = regions ? Math.round(regions.getX(ids[0])) : 1;
    if (!selected.has(region)) return false;
    for (const id of ids) { y += pos.getY(id) / 3; x += pos.getX(id) / 3; z += pos.getZ(id) / 3; }
    if (region === 1 && (Math.max(...ids.map((id) => pos.getY(id))) < minY - 0.03 * s || Math.min(...ids.map((id) => pos.getY(id))) > maxY + 0.03 * s)) return false;
    if (region === 2 && params.sleeve?.length === 'short' && y < 1.225 * s) return false;
    if (region === 2 && params.sleeve?.shoulder?.bridge) {
      const side = x > 0 ? 'left' : 'right';
      const shoulder = body.boneMap?.[`${side}UpperArm`]?.getWorldPosition(new THREE.Vector3());
      const elbow = body.boneMap?.[`${side}Forearm`]?.getWorldPosition(new THREE.Vector3());
      if (shoulder && elbow && Math.abs(y - shoulder.y) < 0.032 * s) {
        const a = new THREE.Vector3().fromBufferAttribute(pos, ids[0]), b = new THREE.Vector3().fromBufferAttribute(pos, ids[1]), c = new THREE.Vector3().fromBufferAttribute(pos, ids[2]);
        const faceNormal = b.sub(a).cross(c.sub(a)).normalize(), axis = shoulder.clone().sub(elbow).normalize();
        if (faceNormal.dot(axis) > 0.85) return false;
      }
    }
    if (region === 1 && params.openFront && z > 0 && Math.abs(Math.atan2(x, z)) < params.openFront) return false;
    return true;
  };
  const descriptor = (id) => {
    const y = pos.getY(id), gap = easeAt(y, params.ease, s);
    return {key: `v${id}`, source: id, point: new THREE.Vector3(pos.getX(id) + normal.getX(id) * gap, y + normal.getY(id) * gap, pos.getZ(id) + normal.getZ(id) * gap), uv: [(Math.atan2(pos.getX(id), pos.getZ(id)) / Math.PI + 1) * 0.5, y / (0.6 * s)], cut: NaN};
  };
  const clip = (polygon, plane, keepAbove) => {
    const output = [];
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i], b = polygon[(i + 1) % polygon.length];
      const aIn = keepAbove ? a.point.y >= plane : a.point.y <= plane, bIn = keepAbove ? b.point.y >= plane : b.point.y <= plane;
      if (aIn) output.push(a);
      if (aIn !== bIn) {
        const t = (plane - a.point.y) / (b.point.y - a.point.y), edge = [a.key, b.key].sort().join(':');
        const point = a.point.clone().lerp(b.point, t); point.y = plane;
        output.push({key: `cut${plane}:${edge}`, source: -1, point, uv: [THREE.MathUtils.lerp(a.uv[0], b.uv[0], t), THREE.MathUtils.lerp(a.uv[1], b.uv[1], t)], cut: plane / s});
      }
    }
    return output;
  };
  const vertex = (value) => {
    if (map.has(value.key)) return map.get(value.key);
    const v = vertices.length / 3;
    vertices.push(value.point.x, value.point.y, value.point.z); uv.push(...value.uv);
    hem.push(0); sourceVertex.push(value.source); cutY.push(value.cut); map.set(value.key, v); return v;
  };
  for (let i = 0; i < source.length; i += 3) {
    const ids = [source[i], source[i + 1], source[i + 2]];
    if (!include(ids)) continue;
    let polygon = ids.map(descriptor);
    if (!regions || Math.round(regions.getX(ids[0])) === 1) polygon = clip(clip(polygon, minY, true), maxY, false);
    for (let j = 1; j < polygon.length - 1; j++) indices.push(vertex(polygon[0]), vertex(polygon[j]), vertex(polygon[j + 1]));
  }
  if (!indices.length) throw new Error('No body triangles selected for garment');
  const surface = makeSurface(vertices, indices, uv, hem, sourceVertex);
  surface.userData.cutY = cutY;
  smoothSurface(surface, simple ? 0 : (params.smoothing || 1));
  return solidify(surface, thickness);
}
function loftPanel(body, hem, panel, s, thickness, flareOption = 0) {
  const rows = hem.rows || 18, columns = hem.columns || 20;
  const vertices = [], indices = [], uv = [], factors = [];
  const topY = hem.startY * s, endY = hem.endY * s;
  const top = profile(body, topY), hip = profile(body, 0.865 * s);
  const extra = (hem.flare + clamp(Number(flareOption) || 0, 0, 1) * 0.075) * s;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows, y = THREE.MathUtils.lerp(topY, endY, t);
    const hipFactor = Math.min(1, (topY - y) / (0.18 * s));
    const rx = THREE.MathUtils.lerp(top.rx, Math.max(hip.rx + 0.019 * s, top.rx), hipFactor) + extra * Math.pow(t, 1.35);
    const rz = THREE.MathUtils.lerp(top.rz, Math.max(hip.rz + 0.021 * s, top.rz), hipFactor) + extra * (hem.depthFlareScale ?? 0.56) * Math.pow(t, 1.25);
    for (let col = 0; col <= columns; col++) {
      const u = col / columns, angle = THREE.MathUtils.lerp(panel.from, panel.to, u) * RAD;
      const fold = Math.sin(u * Math.PI * 5 + t * 0.45) * (0.0045 * s * t * t);
      const layer = (panel.layer || 0) * 0.0045 * s;
      vertices.push(Math.sin(angle) * (rx + 0.016 * s + layer + fold), y, (top.centerZ || 0) + Math.cos(angle) * (rz + 0.016 * s + layer + fold));
      uv.push((angle / (Math.PI * 2)) * 1.6, (topY - y) / (0.55 * s)); factors.push(t * t);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col, b = a + 1, c = a + columns + 1, d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
  }
  return solidify(makeSurface(vertices, indices, uv, factors), thickness);
}
function cylinderSurface(body, yTop, yBottom, cols, rows, pointAt, thickness, hemMode = false) {
  const vertices = [], indices = [], uv = [], factors = [];
  // Use welded angular seam for a watertight solid, while keeping stable UVs.
  for (let row = 0; row <= rows; row++) for (let col = 0; col < cols; col++) {
    const t = row / rows, theta = col / cols * Math.PI * 2, y = THREE.MathUtils.lerp(yTop, yBottom, t), p = pointAt(y, theta, t);
    vertices.push(p.x, p.y, p.z); uv.push(col / cols * 1.5, (yTop - y) / 0.55); factors.push(hemMode ? t * t : 0);
    if (row < rows) {
      const a = row * cols + col, b = row * cols + (col + 1) % cols, c = a + cols, d = b + cols;
      indices.push(a, c, b, b, c, d);
    }
  }
  return solidify(makeSurface(vertices, indices, uv, factors), thickness);
}
function shoulderBridge(body, params, side, scale, thickness) {
  const sign = side === 'left' ? 1 : -1;
  const shoulder = body.boneMap?.[`${side}UpperArm`]?.getWorldPosition(new THREE.Vector3()) || new THREE.Vector3(sign * 0.208 * scale, 1.425 * scale, -0.006 * scale);
  const elbow = body.boneMap?.[`${side}Forearm`]?.getWorldPosition(new THREE.Vector3()) || new THREE.Vector3(sign * 0.269 * scale, 1.125 * scale, 0.007 * scale);
  const inside = shoulder.clone().add(new THREE.Vector3(-sign * params.innerReach * scale, -params.innerDrop * scale, 0));
  const crest = shoulder.clone().add(new THREE.Vector3(0, params.crestLift * scale, 0));
  const middle = shoulder.clone().lerp(elbow, params.reachDown * 0.5);
  const end = shoulder.clone().lerp(elbow, params.reachDown);
  const curve = new THREE.CatmullRomCurve3([inside, crest, middle, end], false, 'centripetal');
  const rows = params.rows || 14, cols = params.columns || 24, vertices = [], indices = [], uv = [], hems = [];
  const radius0 = params.innerRadius * scale, radius1 = (params.radius + params.ease) * scale;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows, center = curve.getPoint(t), axis = curve.getTangent(t).normalize();
    const radial = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), axis).normalize();
    const forward = new THREE.Vector3().crossVectors(axis, radial).normalize();
    const radius = THREE.MathUtils.lerp(radius0, radius1, Math.sin(Math.min(1, t * 2) * Math.PI / 2)) * (1 - 0.055 * t);
    for (let col = 0; col < cols; col++) {
      const angle = col / cols * Math.PI * 2;
      const point = center.clone().addScaledVector(radial, Math.sin(angle) * radius).addScaledVector(forward, Math.cos(angle) * radius * 0.88);
      vertices.push(point.x, point.y, point.z); uv.push(col / cols, t * 0.5); hems.push(0);
      if (row < rows) {
        const a = row * cols + col, b = row * cols + (col + 1) % cols, c = a + cols, d = b + cols;
        // A curve proceeds from torso toward wrist. Correct winding faces out.
        indices.push(a, c, b, b, c, d);
      }
    }
  }
  return solidify(makeSurface(vertices, indices, uv, hems), thickness);
}
function ribbonGeometry(points, width, thickness, s, sway = false) {
  const vertices = [], indices = [], uv = [], factors = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i], tangent = points[Math.min(i + 1, points.length - 1)].clone().sub(points[Math.max(0, i - 1)]);
    const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 0, 1)).normalize().multiplyScalar(width / 2);
    vertices.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z);
    uv.push(0, i / (points.length - 1), 1, i / (points.length - 1)); factors.push(sway ? i / points.length : 0, sway ? i / points.length : 0);
    if (i < points.length - 1) { const a = i * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  return solidify(makeSurface(vertices, indices, uv, factors), thickness * s);
}
function tube(points, radius, segments = 28, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
  const geometry = new THREE.TubeGeometry(curve, segments, radius, 6, closed);
  if (!closed) {
    const positions = Array.from(geometry.attributes.position.array), uvs = Array.from(geometry.attributes.uv.array), indices = Array.from(geometry.index.array);
    for (const [row, top] of [[0, false], [segments, true]]) {
      const center = curve.getPoint(row / segments), id = positions.length / 3;
      positions.push(center.x, center.y, center.z); uvs.push(0.5, top ? 1 : 0);
      for (let col = 0; col < 6; col++) {
        const a = row * 7 + col, b = a + 1;
        indices.push(...(top ? [id, a, b] : [id, b, a]));
      }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
  }
  return geometry;
}
function addPart(parts, geometry, name, options = {}) { parts.push({geometry, name, ...options}); }
function collar(body, params, s, thickness) {
  const top = 1.492 * s;
  if (params.type === 'open') {
    const points = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18, y = (1.49 - t * 0.47) * s, theta = (0.40 + t * 0.12);
      points.push(surfacePoint(body, y, theta, 0.026 * s));
    }
    const right = ribbonGeometry(points, 0.018 * s, 0.0025, s);
    const left = right.clone(); left.scale(-1, 1, 1);
    // A mirrored geometry reverses winding; reverse faces to preserve outer side.
    const idx = left.index.array; for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
    left.computeVertexNormals();
    return [right, left];
  }
  const radius = (params.radius || 0.07) * s;
  return [cylinderSurface(body, top + params.height * s, top - 0.008 * s, 40, 3,
    (y, theta) => new THREE.Vector3(Math.sin(theta) * radius, y, Math.cos(theta) * radius * 0.93), thickness)];
}
function patchOnBody(body, y0, y1, theta0, theta1, gap, thickness, s, rows = 8, cols = 8) {
  const vertices = [], indices = [], uv = [], factors = [];
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
    const y = THREE.MathUtils.lerp(y0, y1, row / rows), theta = THREE.MathUtils.lerp(theta0, theta1, col / cols), p = surfacePoint(body, y, theta, gap);
    vertices.push(p.x, p.y, p.z); uv.push(col / cols * 0.45, row / rows * 0.8); factors.push(0);
    if (row < rows && col < cols) { const a = row * (cols + 1) + col, b = a + 1, c = a + cols + 1, d = c + 1; indices.push(a, b, c, b, d, c); }
  }
  return solidify(makeSurface(vertices, indices, uv, factors), thickness);
}
function addDetails(parts, body, definition, s, thickness) {
  for (const detail of definition.generator.details || []) {
    if (detail.kind === 'buttons') {
      for (let i = 0; i < detail.count; i++) {
        const y = THREE.MathUtils.lerp(detail.fromY, detail.toY, i / Math.max(1, detail.count - 1)) * s;
        const p = profile(body, y), x = detail.x * s;
        const z = (p.centerZ || 0) + p.rz * Math.sqrt(Math.max(0.2, 1 - x * x / (p.rx * p.rx))) + 0.025 * s;
        const button = new THREE.SphereGeometry(detail.radius * s, 10, 6); button.scale(1, 1, 0.43); button.translate(x, y, z);
        addPart(parts, button, `button-${i}`, {color: detail.color, material: 'metal', anchor: null, hem: false});
      }
    } else if (detail.kind === 'piping') {
      const points = [];
      if (detail.path === 'collar') for (let i = 0; i <= 40; i++) { const theta = i / 40 * Math.PI * 2; points.push(new THREE.Vector3(Math.sin(theta) * 0.069 * s, 1.533 * s, Math.cos(theta) * 0.064 * s)); }
      else if (detail.path === 'diagonal') for (let i = 0; i <= 24; i++) { const t = i / 24; points.push(surfacePoint(body, (1.485 - t * 0.093) * s, t * 0.59, 0.021 * s)); }
      else if (detail.path === 'center') for (let i = 0; i <= 24; i++) points.push(surfacePoint(body, THREE.MathUtils.lerp(1.477, 0.879, i / 24) * s, 0, 0.023 * s));
      else if (detail.path === 'open-front') {
        for (const sign of [-1, 1]) {
          const edge = [];
          for (let i = 0; i <= 24; i++) edge.push(surfacePoint(body, THREE.MathUtils.lerp(1.465, 1.035, i / 24) * s, sign * 0.28, 0.023 * s));
          addPart(parts, tube(edge, 0.0021 * s, 24), `front-edge-${sign}`, {color: detail.color});
        }
      }
      if (points.length) addPart(parts, tube(points, 0.0022 * s, points.length), `piping-${detail.path}`, {color: detail.color});
    } else if (detail.kind === 'pockets') {
      for (const side of [-1, 1]) addPart(parts, patchOnBody(body, detail.y * s, (detail.y + detail.height) * s, side * 0.42 - 0.18, side * 0.42 + 0.18, 0.028 * s, thickness, s, 4, 6), `pocket-${side}`, {layer: 1});
    }
  }
}

function buildParts(body, definition, options) {
  const p = definition.generator, s = scaleFor(body), simple = !!options.simple;
  const thickness = (MATERIAL_THICKNESS[options.material || definition.defaultMaterial] || p.thickness || 0.0015) * s;
  const parts = [], masks = [];
  if (p.type === 'top') {
    addPart(parts, shellGeometry(body, p.shell, s, thickness, simple), 'body-shell');
    if (p.shell.sleeve?.shoulder?.bridge) for (const side of ['left', 'right']) addPart(parts, shoulderBridge(body, p.shell.sleeve.shoulder, side, s, thickness), `shoulder-bridge-${side}`);
    masks.push({region: 1, minY: p.shell.minY * s, maxY: p.shell.maxY * s, excludeFrontAngle: p.shell.openFront || 0}, {region: 2, minY: 0, maxY: 2.5 * s});
    if (p.hem) for (let i = 0; i < p.hem.panels.length; i++) addPart(parts, loftPanel(body, p.hem, p.hem.panels[i], s, thickness, options.flare), `hem-panel-${i}`, {skirt: true, layer: p.hem.panels[i].layer || 0});
    if (!simple && p.collar) for (const [i, geometry] of collar(body, p.collar, s, thickness).entries()) addPart(parts, geometry, `collar-${i}`);
    if (!simple && p.overlay) addPart(parts, patchOnBody(body, p.overlay.fromY * s, p.overlay.toY * s, p.overlay.fromAngle * RAD, p.overlay.toAngle * RAD, (0.024 + p.overlay.offset) * s, thickness, s), 'overlapping-front', {layer: 1});
    if (!simple) addDetails(parts, body, definition, s, thickness);
  } else if (p.type === 'trousers') {
    // A closed upper shell around pelvis joins the two leg shells with overlapping sewn-looking waist seams.
    addPart(parts, shellGeometry(body, {regions: [1], minY: 0.805, maxY: p.waistY, ease: p.ease, smoothing: 1}, s, thickness, simple), 'trouser-waist');
    for (const side of [-1, 1]) {
      const jointSide = side > 0 ? 'left' : 'right';
      const thigh = body.boneMap?.[`${jointSide}Thigh`], calf = body.boneMap?.[`${jointSide}Calf`], foot = body.boneMap?.[`${jointSide}Foot`];
      const thighPosition = thigh?.getWorldPosition(new THREE.Vector3()) || new THREE.Vector3(side * 0.106 * s, 0.835 * s, 0);
      const calfPosition = calf?.getWorldPosition(new THREE.Vector3()) || new THREE.Vector3(side * 0.112 * s, 0.445 * s, 0.008 * s);
      const footPosition = foot?.getWorldPosition(new THREE.Vector3()) || new THREE.Vector3(side * 0.114 * s, 0.075 * s, 0.02 * s);
      const radiusShape = 1 + (Number(body.config.shape) || 0) * 0.18;
      addPart(parts, cylinderSurface(body, 0.88 * s, p.ankleY * s, p.columns || 24, p.rows || 18, (y, theta, t) => {
        const center = y >= calfPosition.y ? calfPosition.clone().lerp(thighPosition, clamp((y - calfPosition.y) / (thighPosition.y - calfPosition.y), 0, 1)) : footPosition.clone().lerp(calfPosition, clamp((y - footPosition.y) / (calfPosition.y - footPosition.y), 0, 1));
        const kneeT = clamp((y / s - 0.445) / 0.39, 0, 1);
        const fittedRadius = (0.068 + kneeT * 0.019) * s * radiusShape + p.ease * s;
        const radius = Math.max(fittedRadius, (p.legRadius + p.flare * t + (Number(options.flare) || 0) * 0.018 * t) * s);
        return new THREE.Vector3(center.x + Math.sin(theta) * radius, y, center.z + Math.cos(theta) * (radius * 0.92));
      }, thickness), `trouser-leg-${side}`, {leg: true});
    }
    masks.push({region: 3, minY: p.ankleY * s, maxY: p.waistY * s}, {region: 1, minY: 0, maxY: p.waistY * s});
  } else if (p.type === 'inner') {
    const vertices = [], indices = [], uv = [], factors = [], rows = 14, cols = 12;
    for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
      const t = row / rows, y = THREE.MathUtils.lerp(p.topY, p.bottomY, t) * s, width = THREE.MathUtils.lerp(p.topWidth, p.lowerWidth, Math.min(1, t * 2)) * s;
      const x = (col / cols * 2 - 1) * width, pr = profile(body, y), z = Math.sqrt(Math.max(0.01, 1 - x * x / (pr.rx * pr.rx))) * pr.rz + p.ease * s;
      vertices.push(x, y, z); uv.push(col / cols, t); factors.push(0);
      if (row < rows && col < cols) { const a = row * (cols + 1) + col; indices.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2); }
    }
    addPart(parts, solidify(makeSurface(vertices, indices, uv, factors), thickness), 'inner-bib');
    if (!simple) {
      for (const side of [-1, 1]) addPart(parts, tube([new THREE.Vector3(side * 0.03 * s, p.topY * s, 0.115 * s), new THREE.Vector3(side * 0.058 * s, 1.445 * s, 0.09 * s), new THREE.Vector3(side * 0.061 * s, 1.51 * s, -0.011 * s)], 0.006 * s, 18), `inner-tie-${side}`);
    }
  } else if (p.type === 'belt') {
    addPart(parts, cylinderSurface(body, (p.y + p.width / 2) * s, (p.y - p.width / 2) * s, 48, 3, (y, theta) => surfacePoint(body, y, theta, p.ease * s), thickness), 'waist-sash');
    for (const side of [-1, 1]) {
      const points = [];
      for (let i = 0; i <= 14; i++) { const t = i / 14; points.push(new THREE.Vector3(side * (0.045 + t * 0.011) * s, (p.y - t * p.tailLength) * s, (0.17 + Math.sin(t * Math.PI) * 0.016) * s)); }
      addPart(parts, ribbonGeometry(points, p.tailWidth * s, p.thickness, s, true), `sash-tail-${side}`, {skirt: true});
    }
    const knot = new THREE.SphereGeometry(0.026 * s, 14, 8); knot.scale(1.3, 0.68, 0.6); knot.translate(0, p.y * s, 0.177 * s); addPart(parts, knot, 'sash-knot');
  } else if (p.type === 'conical-hat') {
    const points = [];
    for (let i = 0; i <= p.rings; i++) { const t = i / p.rings; points.push(new THREE.Vector2(Math.max(0.006, p.radius * t) * s, (p.y + p.height * (1 - t)) * s)); }
    for (let i = p.rings; i >= 0; i--) { const t = i / p.rings; points.push(new THREE.Vector2(Math.max(0.005, p.radius * t - p.thickness) * s, (p.y + p.height * (1 - t) - p.thickness) * s)); }
    points.push(points[0].clone());
    addPart(parts, new THREE.LatheGeometry(points, p.segments || 48), 'hat-solid-cone', {anchor: boneIndex(body, 'head')});
    if (!simple) for (let ring = 2; ring <= 8; ring++) {
      const t = ring / 8, geometry = new THREE.TorusGeometry(p.radius * t * s, 0.0013 * s, 4, 48); geometry.rotateX(Math.PI / 2); geometry.translate(0, (p.y + p.height * (1 - t)) * s + 0.001 * s, 0);
      addPart(parts, geometry, `hat-rib-${ring}`, {color: '#a68d52', anchor: boneIndex(body, 'head')});
    }
    if (!simple) for (const side of [-1, 1]) addPart(parts, tube([new THREE.Vector3(side * 0.19 * s, p.y * s, 0), new THREE.Vector3(side * 0.13 * s, 1.58 * s, 0.045 * s), new THREE.Vector3(0, 1.555 * s, 0.12 * s)], 0.0027 * s, 22), `hat-strap-${side}`, {color: '#8d5571', anchor: boneIndex(body, 'head')});
  } else if (p.type === 'headband') {
    for (let coil = 0; coil < p.coils; coil++) {
      const geometry = new THREE.TorusGeometry((p.radius + coil * 0.005) * s, p.tube * s, 10, 48); geometry.rotateX(Math.PI / 2); geometry.scale(1, 1, 0.95); geometry.translate(0, (p.y + coil * 0.012) * s, 0);
      addPart(parts, geometry, `headband-coil-${coil}`, {anchor: boneIndex(body, 'head')});
    }
  } else if (p.type === 'earrings') {
    for (const side of [-1, 1]) {
      const geometry = new THREE.TorusGeometry(p.radius * s, p.thickness * s, 8, 18); geometry.translate(side * p.x * s, p.y * s, 0.015 * s);
      addPart(parts, geometry, `earring-${side}`, {material: 'metal', anchor: boneIndex(body, 'head')});
    }
  } else if (p.type === 'bag') {
    const shape = new THREE.Shape(), w = p.width * s / 2, h = p.height * s;
    shape.moveTo(-w, 0.016 * s); shape.quadraticCurveTo(-w, 0, -w + 0.016 * s, 0); shape.lineTo(w - 0.016 * s, 0); shape.quadraticCurveTo(w, 0, w, 0.016 * s); shape.lineTo(w, h); shape.lineTo(-w, h); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {depth: p.depth * s, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.003 * s, bevelThickness: 0.003 * s, curveSegments: 8});
    geometry.translate(p.x * s, p.y * s - h / 2, p.z * s - p.depth * s / 2); addPart(parts, geometry, 'bag-body', {anchor: boneIndex(body, 'pelvis', 0)});
    const handle = [new THREE.Vector3((p.x - 0.054) * s, (p.y + 0.06) * s, p.z * s), new THREE.Vector3(p.x * s, (p.y + 0.14) * s, p.z * s), new THREE.Vector3((p.x + 0.054) * s, (p.y + 0.06) * s, p.z * s)];
    addPart(parts, tube(handle, 0.007 * s, 20), 'bag-handle', {anchor: boneIndex(body, 'pelvis', 0)});
  } else if (p.type === 'clogs') {
    for (const side of [-1, 1]) {
      const shape = new THREE.Shape(), w = p.width * s / 2, l = p.length * s;
      shape.absellipse(0, l * 0.28, w, l * 0.50, 0, Math.PI * 2, false, 0);
      const geometry = new THREE.ExtrudeGeometry(shape, {depth: p.height * s, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.006 * s, bevelThickness: 0.004 * s, curveSegments: 16});
      geometry.rotateX(Math.PI / 2); geometry.translate(side * p.x * s, p.height * s + 0.006 * s, 0);
      const anchor = boneIndex(body, side > 0 ? 'leftFoot' : 'rightFoot', boneIndex(body, 'pelvis', 0));
      addPart(parts, geometry, `clog-sole-${side}`, {material: 'wood', anchor});
      const strap = [new THREE.Vector3((side * p.x - 0.048) * s, 0.065 * s, 0.044 * s), new THREE.Vector3(side * p.x * s, 0.112 * s, 0.060 * s), new THREE.Vector3((side * p.x + 0.048) * s, 0.065 * s, 0.044 * s)];
      addPart(parts, tube(strap, 0.012 * s, 14), `clog-strap-${side}`, {color: '#6c333b', anchor});
    }
    masks.push({region: 7, minY: 0, maxY: 0.055 * s});
  } else throw new Error(`Unknown garment generator: ${p.type}`);
  const count = parts.reduce((sum, part) => sum + triangleCount(part.geometry), 0);
  if (count > 30000) { parts.forEach((part) => part.geometry.dispose()); throw new Error('Garment exceeds triangle budget'); }
  return {parts, masks, s};
}

function stableStringify(value) {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().filter((key) => typeof value[key] !== 'function').map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}
function cacheKey(body, definition, options) {
  return stableStringify({id: definition.id, generator: definition.generator, body: {shape: body.config?.shape, height: body.config?.height, gender: body.config?.gender}, vertexCount: body.mesh.geometry.attributes.position.count, material: options.material || definition.defaultMaterial, flare: Number(options.flare || 0).toFixed(3), simple: !!options.simple});
}
function fallbackMaterial(options) {
  if (options.material === 'metal') return new THREE.MeshPhysicalMaterial({color: options.color || '#d0aa67', metalness: 0.75, roughness: 0.27, vertexColors: true});
  return new THREE.MeshPhysicalMaterial({color: options.color || '#a34350', roughness: options.material === 'silk' ? 0.37 : 0.8, sheen: 0.6, sheenColor: new THREE.Color(options.color || '#ffffff'), side: THREE.DoubleSide, vertexColors: true});
}
function cloneGeometry(template) {
  const geometry = template.clone();
  const b = template.userData.binding;
  geometry.userData.binding = {...b, triangle: b.triangle.slice(), barycentric: b.barycentric.slice(), offset: b.offset.slice(), tangential: b.tangential.slice(), cutY: b.cutY?.slice() || null};
  return geometry;
}
export function generateGarment(body, definition, options = {}) {
  definition = typeof definition === 'string' ? GARMENT_BY_ID[definition] : definition;
  if (!definition?.generator) throw new Error('Missing garment definition');
  const key = cacheKey(body, definition, options);
  let template = cache.get(key);
  if (template) { cache.delete(key); cache.set(key, template); stats.cacheHits++; }
  else {
    let built;
    try { built = buildParts(body, definition, options); }
    catch (error) {
      if (options.simple) throw error;
      stats.fallbackCount++;
      return generateGarment(body, definition, {...options, simple: true});
    }
    const lookup = createBodyLookup(body);
    for (const part of built.parts) {
      if (part.name === 'body-shell' || part.name === 'trouser-waist') resolveShellClearance(part.geometry, lookup, built.s);
      attachBindings(part.geometry, lookup, {...part, scale: built.s, sourceVertex: part.geometry.userData.sourceVertex});
    }
    template = {...built, triangleCount: built.parts.reduce((sum, part) => sum + triangleCount(part.geometry), 0)};
    cache.set(key, template); stats.generated++;
    if (cache.size > CACHE_LIMIT) { const first = cache.keys().next().value; cache.get(first).parts.forEach((part) => part.geometry.dispose()); cache.delete(first); }
  }
  const group = new THREE.Group(); group.name = `garment-${definition.id}`;
  const materials = [], bindings = [];
  for (const part of template.parts) {
    const geometry = cloneGeometry(part.geometry);
    const partOptions = {...options, color: part.color || options.color || definition.defaultColor, material: part.material || options.material || definition.defaultMaterial, pattern: part.color ? 'plain' : (options.pattern || 'plain'), vertexColors: true, name: part.name};
    let material;
    try { material = options.materialFactory?.(partOptions) || fallbackMaterial(partOptions); } catch { material = fallbackMaterial(partOptions); }
    material.vertexColors = true; material.side = THREE.DoubleSide;
    const mesh = body.skeleton ? new THREE.SkinnedMesh(geometry, material) : new THREE.Mesh(geometry, material);
    if (body.skeleton) mesh.bind(body.skeleton, body.mesh.bindMatrix);
    mesh.name = `${definition.id}:${part.name}`; mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
    mesh.userData.part = part.name; mesh.userData.isGarment = true; mesh.userData.binding = geometry.userData.binding;
    group.add(mesh); materials.push(material); bindings.push(geometry.userData.binding);
  }
  group.userData = {definition, triangleCount: template.triangleCount, maskedRegions: template.masks.map((mask) => ({...mask})), baseMasks: template.masks.map((mask) => ({...mask})), bodyScale: template.s, bindings, materials, options: {...options, materialFactory: undefined}, simple: !!options.simple, cacheKey: key};
  return group;
}

export function updateGarmentBinding(group, body) {
  if (!group || !body) return;
  const lookup = createBodyLookup(body), scale = scaleFor(body);
  const maskRatio = scale / (group.userData.bodyScale || scale);
  group.userData.maskedRegions = (group.userData.baseMasks || group.userData.maskedRegions).map((mask) => ({...mask, minY: mask.minY === undefined ? undefined : mask.minY * maskRatio, maxY: mask.maxY === undefined ? undefined : mask.maxY * maskRatio}));
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), p = new THREE.Vector3();
  group.traverse((mesh) => {
    const binding = mesh.geometry?.userData.binding;
    if (!binding) return;
    const geometry = mesh.geometry, position = geometry.attributes.position;
    const ratio = scale / (binding.scale || scale);
    for (let v = 0; v < position.count; v++) {
      const tri = binding.triangle[v], start = tri * 3, weights = [binding.barycentric[v * 3], binding.barycentric[v * 3 + 1], binding.barycentric[v * 3 + 2]], frame = triangleFrame(lookup, tri, weights);
      a.fromBufferAttribute(lookup.position, lookup.indices[start]); b.fromBufferAttribute(lookup.position, lookup.indices[start + 1]); c.fromBufferAttribute(lookup.position, lookup.indices[start + 2]);
      p.copy(a).multiplyScalar(weights[0]).addScaledVector(b, weights[1]).addScaledVector(c, weights[2]);
      p.addScaledVector(frame.normal, binding.offset[v] * ratio).addScaledVector(frame.tangent, binding.tangential[v * 2] * ratio).addScaledVector(frame.bitangent, binding.tangential[v * 2 + 1] * ratio);
      if (Number.isFinite(binding.cutY?.[v])) p.y = binding.cutY[v] * scale;
      position.setXYZ(v, p.x, p.y, p.z);
      const skin = skinAt(lookup, frame.ids, weights, binding.skirt ? geometry.attributes.hemFactor.getX(v) : 0, binding.anchor);
      geometry.attributes.skinIndex.array.set(skin.indices, v * 4); geometry.attributes.skinWeight.array.set(skin.weights, v * 4);
    }
    if (mesh.userData.part === 'body-shell' || mesh.userData.part === 'trouser-waist') resolveShellClearance(geometry, lookup, scale);
    position.needsUpdate = true; geometry.attributes.skinIndex.needsUpdate = true; geometry.attributes.skinWeight.needsUpdate = true;
    geometry.computeVertexNormals(); geometry.computeBoundingSphere(); geometry.computeBoundingBox();
  });
}

export function validateClearance(group, body) {
  // Dev-only geometric audit. Masking handles covered skin; this is not a cloth collision solver.
  const lookup = createBodyLookup(body);
  const details = [], point = new THREE.Vector3();
  group.traverse((mesh) => {
    if (!mesh.geometry || !mesh.userData.part?.includes('shell')) return;
    let penetrating = 0, minimum = Infinity;
    const positions = mesh.geometry.attributes.position;
    for (let v = 0; v < positions.count; v += 3) {
      point.fromBufferAttribute(positions, v);
      const nearest = lookup.nearest(point), frame = triangleFrame(lookup, nearest.tri, nearest.bary);
      const clearance = point.clone().sub(nearest.point).dot(frame.normal);
      minimum = Math.min(minimum, clearance); if (clearance < -0.0015) penetrating++;
    }
    details.push({part: mesh.userData.part, minimumClearance: minimum, penetrating});
  });
  return {ok: details.every((detail) => !detail.penetrating), parts: details};
}
export function disposeGarment(group) {
  if (!group || group.userData.disposed) return;
  const materials = new Set();
  group.traverse((object) => { if (object.geometry) object.geometry.dispose(); if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material)); else if (object.material) materials.add(object.material); });
  for (const material of materials) {
    if (typeof material.userData?.dispose === 'function') material.userData.dispose();
    else if (typeof material.userData?.disposeTextures === 'function') material.userData.disposeTextures();
    // Fabric factory owns a ref-counted texture cache and releases it in dispose().
    else if (!material.userData?.fabric) for (const key of ['map', 'normalMap', 'roughnessMap', 'bumpMap', 'aoMap']) material[key]?.dispose?.();
    material.dispose();
  }
  group.removeFromParent(); group.clear(); group.userData.disposed = true; stats.disposed++;
}
export function clearGarmentCache() { for (const template of cache.values()) template.parts.forEach((part) => part.geometry.dispose()); cache.clear(); }
export function getGeneratorStats() { return {...stats, cacheEntries: cache.size, cacheTriangleCount: [...cache.values()].reduce((sum, template) => sum + template.triangleCount, 0)}; }
