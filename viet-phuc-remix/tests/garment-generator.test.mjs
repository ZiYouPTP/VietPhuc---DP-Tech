import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {performance} from 'node:perf_hooks';

// Test the browser ES modules using the identical checked-in Three.js version.
registerHooks({resolve(specifier, context, nextResolve) {
  if (specifier === 'three') return {url: new URL('../vendor/three/three.module.js', import.meta.url).href, shortCircuit: true};
  return nextResolve(specifier, context);
}});
const {createBody} = await import('../js/body.js');
const {GARMENTS, GARMENT_BY_ID} = await import('../js/garments.js');
const {generateGarment, updateGarmentBinding, disposeGarment, clearGarmentCache, getGeneratorStats, validateClearance} = await import('../js/garmentGenerator.js');

const body = createBody({shape: 0, height: 1.75});
const groups = [];
function assertFlatHem(group, body, normalizedY) {
  const shell = group.children.find((mesh) => mesh.userData.part === 'body-shell'), binding = shell.geometry.userData.binding;
  const position = shell.geometry.attributes.position, expected = normalizedY * body.config.height / 1.75;
  let cutVertices = 0;
  for (let vertex = 0; vertex < position.count; vertex++) {
    if (Math.abs(binding.cutY?.[vertex] - normalizedY) < 0.00001) {
      assert.ok(Math.abs(position.getY(vertex) - expected) < 0.00001, 'Clipped hem must remain on its horizontal cut plane');
      cutVertices++;
    }
  }
  assert.ok(cutVertices >= 32, 'Hem regression must inspect the complete clipped perimeter');
}
for (const definition of GARMENTS) {
  const start = performance.now();
  const group = generateGarment(body, definition, {material: definition.defaultMaterial});
  assert.ok(group.children.length > 0, `${definition.id} generated no meshes`);
  assert.ok(group.userData.triangleCount < 30000, `${definition.id} exceeds triangle budget`);
  assert.equal(definition.culturalInfo.needsVerification, true);
  assert.ok(Array.isArray(definition.culturalInfo.sources));
  if (definition.slot === 'outer') assert.equal(validateClearance(group, body).ok, true, `${definition.id} clips through the body`);
  if (definition.slot === 'outer') assert.equal(group.children.filter((mesh) => mesh.userData.part.startsWith('shoulder-bridge')).length, 2, 'Sleeves need two rounded shoulder connections');
  if (definition.id === 'ao-ba-ba') assertFlatHem(group, body, definition.generator.shell.minY);
  for (const mesh of group.children) {
    assert.equal(mesh.skeleton, body.skeleton, 'Garment must share body skeleton');
    const {position, skinWeight, skinIndex} = mesh.geometry.attributes;
    assert.ok(position.array.every(Number.isFinite), `${mesh.name} contains invalid vertices`);
    for (let vertex = 0; vertex < position.count; vertex++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) { sum += skinWeight.array[vertex * 4 + k]; assert.ok(skinIndex.array[vertex * 4 + k] < body.skeleton.bones.length); }
      assert.ok(Math.abs(sum - 1) < 0.00001, `${mesh.name} weights do not sum to one`);
    }
    assert.equal(mesh.geometry.userData.binding.triangle.length, position.count);
    if (/body-shell|shoulder-bridge|hem-panel|trouser-waist|trouser-leg|inner-bib|waist-sash/.test(mesh.userData.part)) {
      const edges = new Map(), index = mesh.geometry.index.array;
      for (let i = 0; i < index.length; i += 3) for (let k = 0; k < 3; k++) {
        const a = index[i + k], b = index[i + (k + 1) % 3], key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) || 0) + 1);
      }
      assert.ok([...edges.values()].every((count) => count === 2), `${mesh.name} has unclosed solidify edges`);
    }
  }
  console.log(`${definition.id}: ${group.userData.triangleCount} triangles; ${Math.round(performance.now() - start)}ms`);
  groups.push(group);
}
const group = groups[0], before = group.children[0].geometry.attributes.position.array.slice();
const maskBefore = group.userData.maskedRegions[0].minY;
body.setMaskRegions(group.userData.maskedRegions);
body.updateConfig({shape: 0.8, height: 1.88});
updateGarmentBinding(group, body);
assert.ok(group.children[0].geometry.attributes.position.array.some((value, index) => Math.abs(value - before[index]) > 0.001), 'Bindings must respond to body shape changes');
assert.ok(group.children.every((mesh) => mesh.geometry.attributes.position.array.every(Number.isFinite)));
assert.equal(validateClearance(group, body).ok, true, 'Binding update must maintain shell clearance');
assert.ok(Math.abs(group.userData.maskedRegions[0].minY - maskBefore * 1.88 / 1.75) < 0.00001, 'Mask boundaries must follow height');
updateGarmentBinding(group, body);
assert.ok(Math.abs(group.userData.maskedRegions[0].minY - maskBefore * 1.88 / 1.75) < 0.00001, 'Repeated updates must not compound mask scaling');
const baBa = groups.find((item) => item.userData.definition.id === 'ao-ba-ba');
updateGarmentBinding(baBa, body);
assertFlatHem(baBa, body, GARMENT_BY_ID['ao-ba-ba'].generator.shell.minY);

// Cache immutable geometry owners; dispose one live garment without harming another.
const cached1 = generateGarment(body, GARMENT_BY_ID['ao-dai']);
const cached2 = generateGarment(body, GARMENT_BY_ID['ao-dai']);
assert.notEqual(cached1.children[0].geometry, cached2.children[0].geometry);
assert.notEqual(cached1.children[0].geometry.attributes.position.array, cached2.children[0].geometry.attributes.position.array);
assert.ok(getGeneratorStats().cacheHits > 0);
disposeGarment(cached1); assert.ok(cached2.children[0].geometry.attributes.position.count > 0);
const fallback = generateGarment(body, GARMENT_BY_ID['ao-ngu-than'], {simple: true});
assert.equal(fallback.userData.simple, true); assert.ok(fallback.children.length < groups[2].children.length);
console.log('Flat clipped hem before/after morph, mask-preserving binding, closed shells, normalized skin weights, cache isolation and simple fallback: PASS');
groups.concat(cached2, fallback).forEach(disposeGarment); clearGarmentCache(); body.dispose();
assert.equal(getGeneratorStats().cacheEntries, 0);
