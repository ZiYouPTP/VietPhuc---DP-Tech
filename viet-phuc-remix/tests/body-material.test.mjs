import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// Use the browser's checked-in Three release, without installing another stack.
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === 'three') return { url: new URL('../vendor/three/three.module.js', import.meta.url).href, shortCircuit: true };
  return nextResolve(specifier, context);
} });
const THREE = await import('three');
const { createBody, SKIN_TONES, HAIR_STYLES } = await import('../js/body.js');
const { createFabricMaterial, updateFabricTime, disposeFabricMaterial, clearMaterialCache } = await import('../js/materialFactory.js');

assert.equal(SKIN_TONES.length, 8);
assert.equal(HAIR_STYLES.length, 8);
const body = createBody({ shape: 0, height: 1.75 });
const geometry = body.mesh.geometry;
const topology = geometry.index.array.slice();
const positionAttribute = geometry.attributes.position;
const skeleton = body.skeleton;
assert.ok(topology.length / 3 <= 5000, 'Body must remain below its 5k triangle budget');
assert.equal(geometry.userData.fullIndex, body.mesh.userData.fullIndex);
assert.equal(skeleton.bones.length, 17);

function checkGeometry() {
  assert.ok(geometry.attributes.position.array.every(Number.isFinite));
  assert.ok(geometry.attributes.normal.array.every(Number.isFinite));
  const { skinIndex, skinWeight, region } = geometry.attributes;
  for (let vertex = 0; vertex < positionAttribute.count; vertex++) {
    assert.ok(region.getX(vertex) >= 1 && region.getX(vertex) <= 7);
    let sum = 0;
    for (let influence = 0; influence < 4; influence++) {
      assert.ok(skinIndex.array[vertex * 4 + influence] < skeleton.bones.length);
      sum += skinWeight.array[vertex * 4 + influence];
    }
    assert.ok(Math.abs(sum - 1) < 1e-6);
    const rest = new THREE.Vector3().fromBufferAttribute(positionAttribute, vertex);
    const skinned = body.mesh.applyBoneTransform(vertex, rest.clone());
    assert.ok(rest.distanceTo(skinned) < 1e-5, 'Rest-pose skeleton must preserve the body surface');
  }
}

for (const shape of [-1, 0, 1]) for (const height of [1.45, 1.75, 2.05]) {
  body.updateConfig({ shape, height });
  body.animate(0, false);
  assert.equal(geometry.attributes.position, positionAttribute, 'Shape updates must preserve the vertex buffer');
  assert.equal(body.skeleton, skeleton, 'Shape updates must preserve the shared skeleton');
  assert.deepEqual(Array.from(geometry.userData.fullIndex), Array.from(topology));
  checkGeometry();
  const profile = body.profile(1.02 * height / 1.75);
  const front = body.getSurface(1.02 * height / 1.75, 0);
  assert.ok(profile.rx > 0 && profile.rz > 0);
  assert.ok(Math.abs(front.z - profile.rz - profile.centerZ) < 1e-10);
}

body.updateConfig({ shape: 0, height: 1.75 });
body.setMaskRegions([{ region: 'torso', minY: 1, maxY: 1.5 }]);
const fullyMaskedCount = geometry.index.count;
body.setMaskRegions([{ region: 'torso', minY: 1, maxY: 1.5, excludeFrontAngle: 0.26 }]);
assert.ok(geometry.index.count > fullyMaskedCount, 'Open-front garments must preserve the exposed chest');
body.setMaskRegions(['torso', 'arms', 'legs']);
assert.ok(geometry.index.count < topology.length);
body.updateConfig({ shape: 0.7, height: 1.9 });
assert.ok(geometry.index.count < topology.length, 'Shape changes must retain the body mask');
body.setMaskRegions([]);
assert.deepEqual(Array.from(geometry.index.array), Array.from(topology));

for (const style of HAIR_STYLES) {
  const hair = body.setHair(style.id);
  assert.ok(hair.children.length > 0);
  assert.equal(hair.parent, body.boneMap.head);
  hair.traverse(object => { if (object.geometry) assert.ok(object.geometry.attributes.position.array.every(Number.isFinite)); });
}
body.animate(5, true);
assert.notEqual(body.boneMap.head.rotation.y, 0);
body.animate(5, false);
assert.ok(body.boneMap.head.rotation.y === 0);
assert.ok(body.boneMap.chest.rotation.z === 0);

for (const fabric of ['silk', 'linen', 'brocade', 'velvet']) for (const pattern of ['plain', 'lotus', 'crane', 'cloud', 'brocade', 'dots', 'stripes']) {
  const material = createFabricMaterial({ material: fabric, pattern });
  assert.equal(material.isMeshPhysicalMaterial, true);
  assert.ok(material.map && material.normalMap && material.roughnessMap);
  assert.ok(material.userData.fabric.thickness > 0);
  assert.deepEqual(material.defaultAttributeValues.hemFactor, [0]);
  const shader = { uniforms: {}, vertexShader: '#include <begin_vertex>' };
  material.onBeforeCompile(shader);
  assert.ok(shader.vertexShader.includes('attribute float hemFactor'));
  assert.ok(shader.vertexShader.includes('transformed.z'));
  updateFabricTime(material, 3, false);
  assert.equal(shader.uniforms.uClothTime.value, 3);
  assert.equal(shader.uniforms.uClothMotion.value, 0);
  material.userData.setClothMotion(true);
  assert.equal(shader.uniforms.uClothMotion.value, 1);
  disposeFabricMaterial(material);
}
const silk = createFabricMaterial({ material: 'silk' }), linen = createFabricMaterial({ material: 'linen' });
assert.ok(linen.roughness > silk.roughness, 'Fabric choice must change actual PBR reflectance');
assert.ok(linen.normalScale.x > silk.normalScale.x);
silk.dispose(); linen.dispose();
const metal = createFabricMaterial({ material: 'metal' }), wood = createFabricMaterial({ material: 'wood' });
assert.ok(metal.metalness > 0.7);
assert.equal(wood.metalness, 0);
metal.dispose(); wood.dispose();

// Disposing one garment cannot release textures another garment still uses.
const first = createFabricMaterial({ material: 'silk', color: '#b93045' });
const second = createFabricMaterial({ material: 'silk', color: '#b93045' });
assert.equal(first.map, second.map);
let textureDisposals = 0;
first.map.addEventListener('dispose', () => textureDisposals++);
first.dispose(); first.dispose();
assert.equal(textureDisposals, 0);
second.dispose(); second.userData.dispose();
assert.equal(textureDisposals, 1);
clearMaterialCache(); body.dispose();
console.log('Body morphs/rest skinning, masks, eight hairstyles/skin tones, PBR choices, cloth uniforms and shared-texture ownership: PASS');
