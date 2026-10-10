import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateRulesDocument, validateLook, getItemAvailability } from '../js/outfitRules.js';

const rules = JSON.parse(await readFile(new URL('../data/outfit-rules.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(rules);
const codes = result => result.errors.map(error => error.code);
const warningCodes = result => result.warnings.map(warning => warning.code);
const makeLook = (id, items, extra = {}) => ({ outfitSetId: id, gender: 'female', items, ...extra });
const dai = makeLook('ao-dai', [{ id: 'ao-dai' }, { id: 'trousers' }]);

assert.equal(rules.outfitSets.length, 7);
assert.equal(rules.itemRules.length, 22);
assert.deepEqual(validateRulesDocument(rules), { valid: true, errors: [] });
const combinations = rules.outfitSets.flatMap(set => set.combinations);
assert.equal(combinations.length, 9);
assert.ok(combinations.every(combination => combination.needsVerification && combination.status === 'needsVerification' && combination.sources.length === 0));

// Each approved-looking combination remains an explicitly unverified app preview.
for (const set of rules.outfitSets) {
  assert.ok(set.palette.maxDistinctColors <= 4);
  assert.deepEqual(set.palette.forbiddenAdjacentPairs, [], 'No historical color bans were supplied.');
  assert.equal(set.genderPolicy.scope, 'user-body-preview-policy');
  assert.equal(set.genderPolicy.historicalUse, null);
  for (const combination of set.combinations) for (const gender of set.supportedGenders) {
    const result = validateLook(rules, makeLook(set.id, combination.items, { gender }));
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.ok(warningCodes(result).includes('cultural-needs-verification'));
    assert.ok(warningCodes(result).includes('gender-needs-verification'));
    assert.ok(result.layers.every(item => item.zIndex > 0 && set.layerOrder.includes(item.slot)));
  }
}
assert.deepEqual(rules.outfitSets.filter(set=>set.supportedGenders.includes('male')).map(set=>set.id).sort(),['ao-giao-linh','ao-ngu-than']);
assert.ok(codes(validateLook(rules,{...dai,gender:'male'})).includes('unsupported-gender'));
assert.equal(validateLook(rules,makeLook('ao-ngu-than',[{id:'ao-ngu-than'},{id:'trousers'}],{gender:'male'})).valid,true);

assert.ok(codes(validateLook(rules, makeLook('ao-dai', [{ id: 'ao-dai' }]))).includes('missing-required-slot'));
assert.ok(codes(validateLook(rules, makeLook('ao-dai', [{ id: 'ao-dai' }, { id: 'ao-dai' }, { id: 'trousers' }]))).includes('duplicate-slot'));
assert.ok(codes(validateLook(rules, makeLook('ao-dai', [{ id: 'ao-dai', slot: 'headwear' }, { id: 'trousers' }]))).includes('invalid-slot'));
assert.ok(codes(validateLook(rules, makeLook('ao-dai', [{ id: 'ao-dai' }, { id: 'skirt' }]))).includes('required-item-mismatch'));
assert.equal(validateLook(rules, makeLook('ao-tu-than', [{ id: 'ao-tu-than' }, { id: 'skirt' }])).valid, true);
assert.equal(validateLook(rules, makeLook('ao-tu-than', [{ id: 'ao-tu-than' }, { id: 'trousers' }])).valid, true);
assert.equal(getItemAvailability(rules, 'day-lung', dai).available, true, 'The new brief explicitly makes an áo dài sash optional.');
assert.equal(getItemAvailability(rules, 'non-la', dai).available, true);
assert.equal(getItemAvailability(rules, 'non-quai-thao', dai).available, false);
assert.equal(getItemAvailability(rules, 'not-a-real-item', dai).available, false);
assert.equal(getItemAvailability(rules, 'khan-dong', { ...dai, items: [...dai.items, { id: 'non-la' }] }).available, true, 'Replacing the same slot is allowed.');
assert.equal(getItemAvailability(rules, 'tram-cai', { ...dai, items: [...dai.items, { id: 'non-la' }] }).available, false, 'Independent slots can still share an exclusive group.');

const dressed = { ...dai, items: [...dai.items, { id: 'inner-yem' }, { id: 'day-lung' }, { id: 'non-la' }, { id: 'bong-tai' }, { id: 'vong-co' }, { id: 'vong-tay' }] };
const ordered = validateLook(rules, dressed);
const reversed = validateLook(rules, { ...dressed, items: [...dressed.items].reverse() });
assert.equal(ordered.valid, true);
assert.deepEqual(ordered.layers, reversed.layers, 'Render order is independent of selection order.');
assert.ok(ordered.layers.findIndex(item => item.id === 'inner-yem') < ordered.layers.findIndex(item => item.id === 'ao-dai'));
assert.ok(ordered.layers.findIndex(item => item.id === 'ao-dai') < ordered.layers.findIndex(item => item.id === 'day-lung'));
assert.equal(ordered.layers.filter(item => ['earrings', 'necklace', 'bracelet'].includes(item.slot)).length, 3);

const baba = makeLook('ao-ba-ba', [{ id: 'ao-ba-ba' }, { id: 'trousers', colorFamily: 'black' }]);
assert.equal(validateLook(rules, baba).valid, true);
assert.ok(codes(validateLook(rules, { ...baba, items: [{ id: 'ao-ba-ba' }, { id: 'trousers', colorFamily: 'pink' }] })).includes('required-color-family'));
assert.ok(codes(validateLook(rules, { ...baba, occasionId: 'ceremony' })).includes('casual-in-ceremony'));
const formalInDaily = validateLook(rules, makeLook('ao-nhat-binh', [{ id: 'ao-nhat-binh' }, { id: 'skirt' }], { occasionId: 'daily' }));
assert.equal(formalInDaily.valid, true);
assert.ok(warningCodes(formalInDaily).includes('formal-in-daily'));
const colorful = validateLook(rules, { ...dai, colors: ['#123456', '#234567', '#345678', '#456789', '#567890'] });
assert.equal(colorful.valid, true, 'A color warning does not block a look.');
assert.ok(warningCodes(colorful).includes('too-many-colors'));
assert.ok(warningCodes(colorful).includes('palette-provisional'));

// Data changes, rather than a hardcoded garment table, change checker behavior.
const oneBody = clone();
oneBody.itemRules.find(item => item.id === 'bong-tai').supportedGenders = ['female'];
const maleNgu=makeLook('ao-ngu-than',[{id:'ao-ngu-than'},{id:'trousers'}],{gender:'male'});
assert.equal(getItemAvailability(rules, 'bong-tai', maleNgu).available, true);
assert.equal(getItemAvailability(oneBody, 'bong-tai', maleNgu).available, false);
assert.equal(getItemAvailability(oneBody, 'bong-tai', dai).available, true);
const permitted = clone();
const permittedDai = permitted.outfitSets.find(set => set.id === 'ao-dai');
permittedDai.forbiddenItemIds = [];
permittedDai.optionalSlots.find(slot => slot.slot === 'headwear').allowedItemIds.push('non-quai-thao');
assert.equal(getItemAvailability(permitted, 'non-quai-thao', dai).available, true);

const missingOrder = clone();
missingOrder.outfitSets[0].layerOrder = missingOrder.outfitSets[0].layerOrder.filter(slot => slot !== 'bottom');
assert.ok(codes(validateRulesDocument(missingOrder)).includes('layer-order-missing'));
const missingSource = clone();
missingSource.outfitSets[0].combinations[0].needsVerification = false;
assert.ok(codes(validateRulesDocument(missingSource)).includes('missing-provenance'));
const missingTodo = clone();
delete missingTodo.itemRules[0].verificationTodo;
assert.ok(codes(validateRulesDocument(missingTodo)).includes('missing-provenance'));
const conflictingRule = clone();
conflictingRule.outfitSets[0].forbiddenItemIds.push('day-lung');
assert.ok(codes(validateRulesDocument(conflictingRule)).includes('allowed-forbidden-conflict'));
const malformed = clone();
malformed.slotIds = {};
assert.equal(validateRulesDocument(malformed).valid, false);
assert.equal(validateRulesDocument(null).valid, false);
assert.ok(codes(validateLook(missingSource, dai)).includes('invalid-rules'));
assert.ok(codes(validateLook(rules, { ...dai, gender: 'unknown' })).includes('unknown-gender'));
assert.ok(codes(validateLook(rules, { ...dai, outfitSetId: 'unknown' })).includes('unknown-outfit'));
assert.equal(getItemAvailability(rules, 'non-quai-thao', dai, 'en').reasons[0].message, rules.messages['forbidden-item'].en);

console.log('Outfit rules: 7 sets, 22 item rules, 9 unverified combinations; schema, required slots, exclusive slots, layer order, provenance, gender/context and color checks passed.');
