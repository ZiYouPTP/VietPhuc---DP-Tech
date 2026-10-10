import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const files = await Promise.all(['../js/locales.js','../js/locale.js','../data.js', '../js/bodyAvailabilityData.js', '../js/compatibility.js', '../app.js'].map(path => readFile(new URL(path, import.meta.url), 'utf8')));
class Element {
  constructor() { this.innerHTML = ''; this.textContent = ''; this.dataset = {}; this.classList = {add(){},remove(){},toggle(){}}; }
  scrollIntoView() {}
  replaceChildren() { this.textContent = ''; }
}
const elements = new Map();
const getElementById = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
const listeners = {};
const dispatched = [];
let persisted = '';
let restored;
const window = {
  addEventListener: (type, listener) => { listeners[type] = listener; },
  dispatchEvent: event => { dispatched.push(event); },
  VietPhucIllustration: id => `<svg data-test-costume="${id}"></svg>`,
  VietPhucStudio: { restore: config => { restored = config; } },
};
const context = vm.createContext({
  window, document: { getElementById, addEventListener(){}, querySelectorAll: () => [] },
  localStorage: {getItem: () => '[]', setItem: (_key, value) => { persisted = value; }},
  CustomEvent: class {constructor(type, args) {this.type = type; this.detail = args.detail;}},
  IntersectionObserver: class {observe(){}}, setTimeout: () => 1, clearTimeout(){},
});
files.forEach(source => vm.runInContext(source, context));
const rules = window.VietPhucCompatibility;
const array = value => Array.from(value);
const outfit = () => window.VietPhucRemix.getOutfit();
const evaluate = source => vm.runInContext(source, context);

// Garment restrictions, group conflicts, and unknown input use the same rules.
assert.equal(rules.getAvailability('non-quai-thao', {costumeId:'ao-ba-ba'}).available, false);
assert.match(rules.getAvailability('non-quai-thao', {costumeId:'ao-ba-ba'}).reason, /bộ phối mẫu/);
assert.equal(rules.getAvailability('non-quai-thao', {costumeId:'ao-tu-than'}).available, true);
assert.equal(rules.getAvailability('khan-dong', {costumeId:'ao-dai',accessories:['non-la']}).available, false);
assert.equal(rules.getAvailability('non-la', {costumeId:'ao-dai',accessories:['non-la']}).available, true);
assert.equal(rules.getAvailability('hai-cong', {costumeId:'ao-dai',accessories:['guoc-moc']}).available, false);
for (const id of ['__proto__','constructor','unknown',null]) assert.equal(rules.getAvailability(id, {costumeId:'ao-dai'}).available, false);
assert.deepEqual(array(rules.sanitizeAccessories(['non-la','khan-dong','non-la','guoc-moc','hai-cong','bong-tai','__proto__'], {costumeId:'ao-dai'})), ['non-la','guoc-moc','bong-tai']);
assert.deepEqual(array(rules.sanitizeAccessories(['non-la','hai-cong','guoc-moc','tram-cai','bong-tai'], {costumeId:'ao-nhat-binh'})), ['hai-cong','tram-cai','bong-tai']);
assert.equal(rules.toStudioSlots(['non-la','guoc-moc','bong-tai'], 'ao-dai').headwear, 'non-la');
assert.deepEqual(array(rules.toStudioSlots(['vong-co','vong-tay','quat-lua','tui-tay'], 'ao-yem').accessory), ['vong-co','vong-tay','quat-lua','woven-bag']);
for (const gender of ['male','female']) assert.equal(rules.getAvailability('bong-tai', {costumeId:'ao-yem',gender}).available, true);

// Main selection, native disabled markup, direct click guards, and transitions.
evaluate('renderCostumePills()');
assert.equal((getElementById('costume-pills').innerHTML.match(/id="pill-/g) || []).length, 7);
for (const id of ['ao-nhat-binh','ao-yem','ao-giao-linh']) {
  evaluate(`selectCostumePill('${id}')`);
  assert.equal(outfit().costumeId, id);
  assert.equal(dispatched.at(-1).detail.costumeId, id);
}
evaluate("selectCostumePill('ao-tu-than');toggleAccessory('non-quai-thao');toggleAccessory('day-lung')");
assert.deepEqual(array(outfit().accessories), ['non-quai-thao','day-lung']);
evaluate("selectCostumePill('ao-ba-ba')");
assert.deepEqual(array(outfit().accessories), []);
assert.match(getElementById('accessory-status').textContent, /Đã bỏ Nón Quai Thao, Dây Lưng/);
assert.match(getElementById('accessory-grid').innerHTML, /disabled aria-describedby="acc-reason-non-quai-thao"/);
evaluate("toggleAccessory('non-quai-thao')");
assert.deepEqual(array(outfit().accessories), [], 'Calling a disabled handler cannot bypass the rule');
window.VietPhucRemix.setAccessories(['non-la','tram-cai','guoc-moc','hai-cong','bong-tai']);
assert.deepEqual(array(outfit().accessories), ['non-la','guoc-moc','bong-tai']);
assert.equal(dispatched.at(-1).detail.event, 'festival');
assert.ok(!getElementById('suggestion-chips').innerHTML.includes("toggleAccessory('khan-dong')"));

// A saved look cannot restore blocked accessories or untrusted display content.
const record = {
  id: 14, costumeId: 'ao-nhat-binh', color: '#abcdef', costumeName: '<script>bad</script>',
  accessories: ['non-la','guoc-moc','hai-cong','tram-cai','bong-tai','constructor'],
  studioConfig: {costumeId:'ao-dai',body:{gender:'female'},slots:{outer:'ao-dai',headwear:'non-la',footwear:'wooden-clogs'}},
  style:'fusion', event:'wedding', savedAt:'8/10/2026', image:'javascript:bad',
};
context.testRecord = record;
const clean = evaluate('normaliseStoredLook(testRecord)');
assert.deepEqual(array(clean.accessories), ['hai-cong','tram-cai','bong-tai']);
assert.equal(clean.studioConfig.costumeId,'ao-nhat-binh');
assert.equal(clean.studioConfig.slots.headwear,'tram-cai');
assert.equal(clean.studioConfig.slots.footwear,'hai-cong');
assert.equal(clean.studioConfig.body.gender,'female');
assert.equal(clean.color,'#ABCDEF');
assert.equal(clean.image,null);
assert.ok(!clean.costumeName.includes('<'));
evaluate('state.lookbook = [normaliseStoredLook(testRecord)];restoreLook(14)');
assert.deepEqual(array(outfit().accessories), ['hai-cong','tram-cai','bong-tai']);
assert.equal(restored.slots.headwear,'tram-cai');
await evaluate('saveLook({studioConfig:testRecord.studioConfig, outfitMeta:{accessories:["non-la","khan-dong","constructor"],style:"traditional",event:"tet"}})');
const saved = JSON.parse(persisted)[0];
assert.deepEqual(saved.accessories,['non-la']);
assert.equal(saved.studioConfig.slots.headwear,'non-la');
assert.equal(saved.studioConfig.slots.footwear,null);

// The user's male policy applies to all entry points, rather than just CSS.
window.VietPhucRemix.setGender('male');
assert.equal(outfit().body.gender,'male');
assert.equal(outfit().costumeId,'ao-ngu-than');
assert.equal((getElementById('costume-pills').innerHTML.match(/disabled aria-describedby="costume-body-status"/g)||[]).length,5);
for(const id of ['ao-dai','ao-ba-ba','ao-tu-than','ao-yem','ao-nhat-binh']){
 assert.equal(rules.getCostumeAvailability(id,'male').available,false);
 evaluate(`selectCostumePill('${id}');selectAndMix('${id}');selectCostumeById('${id}')`);
 assert.equal(outfit().costumeId,'ao-ngu-than','Disabled handlers cannot dress a male body in another garment');
}
for(const id of ['ao-ngu-than','ao-giao-linh']){
 assert.equal(rules.getCostumeAvailability(id,'male').available,true);
 evaluate(`selectCostumePill('${id}')`);
 assert.equal(outfit().costumeId,id);
 assert.equal(dispatched.at(-1).detail.body.gender,'male');
}
context.invalidMaleLook={...record,id:15,studioConfig:{...record.studioConfig,body:{gender:'male'}}};
assert.equal(evaluate('normaliseStoredLook(invalidMaleLook)').studioConfig,null,'Old forbidden male snapshots cannot be restored');
evaluate('state.lookbook=[invalidMaleLook];restoreLook(15)');
assert.equal(outfit().costumeId,'ao-giao-linh');
assert.equal(outfit().body.gender,'male');
window.VietPhucRemix.setGender('female');
for(const id of ['ao-dai','ao-ba-ba','ao-tu-than','ao-yem','ao-nhat-binh','ao-ngu-than']){
 evaluate(`selectCostumePill('${id}')`);
 assert.equal(outfit().costumeId,id,'Switching to female must reopen the female garment options');
}
assert.equal((getElementById('costume-pills').innerHTML.match(/disabled aria-describedby="costume-body-status"/g)||[]).length,0);

console.log('Compatibility, seven garments, disabled controls, selection transitions, and safe lookbook round trips: PASS');
