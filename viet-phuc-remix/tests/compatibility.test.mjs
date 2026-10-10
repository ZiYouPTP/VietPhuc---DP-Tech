import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const files = await Promise.all(['../js/photoMappingData.js','../js/locales.js','../js/locale.js','../data.js', '../js/bodyAvailabilityData.js', '../js/compatibility.js', '../app.js'].map(path => readFile(new URL(path, import.meta.url), 'utf8')));
const matchingSource=await readFile(new URL('../js/outfitMatching.js',import.meta.url),'utf8');
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
vm.runInContext(matchingSource,context);
files.forEach(source => vm.runInContext(source, context));
const rules = window.VietPhucCompatibility;
const array = value => Array.from(value);
const outfit = () => window.VietPhucRemix.getOutfit();
const evaluate = source => vm.runInContext(source, context);

// Availability uses actual reviewed photos; positions do not imply culture.
const canonical = ['non-la','non-quai-thao','khan-dong','khan-vanh','tram-cai','guoc-moc','hai-theu','giay-cao-got'];
const removed = ['vong-co','bong-tai','vong-tay','tui-tay','quat-lua','hai-cong','day-lung'];
assert.deepEqual(array(rules.getSupportedAccessoryIds()).sort(), [...canonical].sort());
assert.deepEqual(array(evaluate('ACCESSORIES.map(item=>item.id)')).sort(), [...canonical].sort());
for (const id of removed) assert.equal(rules.getAvailability(id, {costumeId:'ao-dai'}).available, false);
assert.equal(rules.getAvailability('non-quai-thao', {costumeId:'ao-ba-ba'}).available, false);
assert.match(rules.getAvailability('non-quai-thao', {costumeId:'ao-ba-ba'}).reason, /Chưa có ảnh dữ liệu/);
assert.equal(rules.getAvailability('non-quai-thao', {costumeId:'ao-tu-than'}).available, true);
assert.equal(rules.getAvailability('khan-dong', {costumeId:'ao-dai',accessories:['non-la']}).available, false);
assert.equal(rules.getAvailability('non-la', {costumeId:'ao-dai',accessories:['non-la']}).available, true);
assert.equal(rules.getAvailability('giay-cao-got', {costumeId:'ao-dai',accessories:['guoc-moc']}).available, false);
assert.equal(rules.getAvailability('khan-dong', {costumeId:'ao-ba-ba'}).available, true, 'The actual dataset supersedes the previous unverified costume preset');
assert.equal(rules.getAvailability('tram-cai', {costumeId:'ao-giao-linh',accessories:['non-la']}).available, false, 'A hat/hairpin pair without clogs is not photographed; use the complete triple');
assert.ok(rules.getCombinationOptions({costumeId:'ao-giao-linh',gender:'female'}).some(row=>row.accessories.length===3));
assert.equal(rules.getAvailability('giay-cao-got', {costumeId:'ao-dai',gender:'male'}).available, false);
assert.equal(rules.getAvailability('khan-dong', {costumeId:'ao-giao-linh',gender:'male'}).available,true);
assert.equal(rules.getAvailability('khan-dong', {costumeId:'ao-giao-linh',gender:'female'}).available,false,'The same outfit type can have different accessory evidence by body');
for (const id of ['__proto__','constructor','unknown',null]) assert.equal(rules.getAvailability(id, {costumeId:'ao-dai'}).available, false);
assert.deepEqual(array(rules.sanitizeAccessories(['non-la','khan-dong','non-la','guoc-moc','giay-cao-got','bong-tai','__proto__'], {costumeId:'ao-dai'})), ['non-la','guoc-moc']);
assert.deepEqual(array(rules.sanitizeAccessories(['non-la','hai-theu','guoc-moc','tram-cai','bong-tai','khan-vanh'], {costumeId:'ao-nhat-binh'})), ['hai-theu','khan-vanh']);
assert.equal(rules.toStudioSlots(['non-la','guoc-moc','bong-tai'], 'ao-dai').headwear, 'non-la');
assert.deepEqual(array(rules.toStudioSlots(removed, 'ao-yem').accessory), []);
assert.equal(rules.toStudioSlots(['non-la','tram-cai','guoc-moc'], 'ao-giao-linh').hairAdornment, 'tram-cai');
assert.deepEqual(array(rules.toStudioSlots(['non-la','tram-cai','guoc-moc'], 'ao-giao-linh').accessory), ['tram-cai']);
for (const gender of ['male','female']) assert.equal(rules.getAvailability('khan-dong', {costumeId:'ao-ngu-than',gender}).available, true);
const missingWindow = {VietPhucLocale:window.VietPhucLocale};
vm.runInNewContext(matchingSource,{window:missingWindow});
vm.runInNewContext(files[5], {window:missingWindow});
assert.equal(missingWindow.VietPhucCompatibility.getCostumeAvailability('ao-dai','female').available, false, 'A missing manifest cannot invent female support');
assert.deepEqual(array(missingWindow.VietPhucCompatibility.getSupportedAccessoryIds()), []);
const missingData = vm.createContext({window:{}});
vm.runInContext(files[3], missingData);
assert.equal(vm.runInContext('ACCESSORIES.length', missingData),0, 'A missing manifest keeps unsupported accessories hidden');
const unreviewedWindow = {VietPhucLocale:window.VietPhucLocale,VietPhucOutfitCatalogData:{...window.VietPhucOutfitCatalogData,items:window.VietPhucOutfitCatalogData.items.map(item=>({...item,availability:{previewEligible:false}}))}};
vm.runInNewContext(matchingSource,{window:unreviewedWindow});
vm.runInNewContext(files[5], {window:unreviewedWindow});
assert.equal(unreviewedWindow.VietPhucCompatibility.getCostumeAvailability('ao-dai','female').available,false);
assert.equal(unreviewedWindow.VietPhucCompatibility.getAvailability('non-la',{costumeId:'ao-dai'}).available,false, 'Unreviewed metadata cannot enable an accessory');

// Main selection, native disabled markup, direct click guards, and transitions.
evaluate('renderCostumePills()');
assert.equal((getElementById('costume-pills').innerHTML.match(/id="pill-/g) || []).length, 7);
for (const id of ['ao-nhat-binh','ao-yem','ao-giao-linh']) {
  evaluate(`selectCostumePill('${id}')`);
  assert.equal(outfit().costumeId, id);
  assert.equal(dispatched.at(-1).detail.costumeId, id);
}
evaluate("selectCostumePill('ao-tu-than');toggleAccessory('non-quai-thao');toggleAccessory('day-lung')");
assert.deepEqual(array(outfit().accessories), ['non-quai-thao']);
evaluate("selectCostumePill('ao-ba-ba')");
assert.deepEqual(array(outfit().accessories), []);
assert.match(getElementById('accessory-status').textContent, /Đã bỏ Nón Quai Thao/);
assert.match(getElementById('accessory-grid').innerHTML, /disabled aria-describedby="acc-reason-non-quai-thao"/);
evaluate("toggleAccessory('non-quai-thao')");
assert.deepEqual(array(outfit().accessories), [], 'Calling a disabled handler cannot bypass the rule');
window.VietPhucRemix.setAccessories(['non-la','tram-cai','guoc-moc','hai-cong','bong-tai']);
assert.deepEqual(array(outfit().accessories), ['non-la','guoc-moc']);
assert.equal(dispatched.at(-1).detail.event, 'festival');
for (const id of removed) {
 assert.ok(!getElementById('accessory-grid').innerHTML.includes(`id="acc-${id}"`));
 assert.ok(!getElementById('suggestion-chips').innerHTML.includes(`toggleAccessory('${id}')`));
}

// A saved look cannot restore blocked accessories or untrusted display content.
evaluate("selectCostumePill('ao-giao-linh');setAccessoryCombination('none');toggleAccessory('non-la');toggleAccessory('guoc-moc')");
assert.deepEqual(array(outfit().accessories),[],'Missing intermediate sets cannot be selected by handlers');
assert.match(getElementById('accessory-combinations').innerHTML,/id="combo-guoc-moc\+non-la\+tram-cai"/);
evaluate("setAccessoryCombination('guoc-moc+non-la+tram-cai');toggleAccessory('tram-cai');setAccessoryCombination('__unknown__')");
assert.deepEqual(array(outfit().accessories),['guoc-moc','non-la','tram-cai'],'Atomic choice reaches the photographed triple; invalid removal or unknown set cannot bypass the guard');
evaluate("toggleAccessory('non-la')");
assert.deepEqual(array(outfit().accessories),['guoc-moc','tram-cai'],'A removal with an actual remaining pair is allowed');
evaluate("setAccessoryCombination('none')");
assert.deepEqual(array(outfit().accessories),[]);
const record = {
  id: 14, costumeId: 'ao-nhat-binh', color: '#abcdef', costumeName: '<script>bad</script>',
  accessories: ['non-la','guoc-moc','hai-cong','tram-cai','bong-tai','constructor','hai-theu','khan-vanh'],
  studioConfig: {costumeId:'ao-dai',body:{gender:'female'},slots:{outer:'ao-dai',headwear:'non-la',footwear:'wooden-clogs'}},
  style:'fusion', event:'wedding', savedAt:'8/10/2026', image:'javascript:bad',
};
context.testRecord = record;
const clean = evaluate('normaliseStoredLook(testRecord)');
assert.deepEqual(array(clean.accessories), ['hai-theu','khan-vanh']);
assert.equal(clean.studioConfig.costumeId,'ao-nhat-binh');
assert.equal(clean.studioConfig.slots.headwear,'khan-vanh');
assert.equal(clean.studioConfig.slots.footwear,'hai-theu');
assert.equal(clean.studioConfig.body.gender,'female');
assert.equal(clean.color,'#ABCDEF');
assert.equal(clean.image,null);
context.cachedPNG='data:image/png;base64,'+(await readFile(new URL('./fixtures/qa-opaque.png',import.meta.url))).toString('base64');
assert.equal(evaluate('normaliseStoredLook({...testRecord,image:cachedPNG})').image,null,'Repaired accessories invalidate cached pixels from a different set');
context.validRecord={...record,accessories:['hai-theu','khan-vanh'],studioConfig:clean.studioConfig};
assert.equal(evaluate('normaliseStoredLook({...validRecord,image:cachedPNG})').image,context.cachedPNG);
assert.equal(evaluate('normaliseStoredLook({...validRecord,image:cachedPNG,studioConfig:{...validRecord.studioConfig,sourceCombinationId:"missing-source"}})').image,null);
assert.equal(evaluate('normaliseStoredLook({...validRecord,image:cachedPNG,studioConfig:{...validRecord.studioConfig,imageCombinationId:"missing-image"}})').image,null);
assert.ok(!clean.costumeName.includes('<'));
evaluate('state.lookbook = [normaliseStoredLook(testRecord)];restoreLook(14)');
assert.deepEqual(array(outfit().accessories), ['hai-theu','khan-vanh']);
assert.equal(restored.slots.headwear,'khan-vanh');
await evaluate('saveLook({studioConfig:testRecord.studioConfig, outfitMeta:{accessories:["non-la","khan-dong","constructor"],style:"traditional",event:"tet"}})');
const saved = JSON.parse(persisted)[0];
assert.deepEqual(saved.accessories,['non-la']);
assert.equal(saved.studioConfig.slots.headwear,'non-la');
assert.equal(saved.studioConfig.slots.footwear,null);

// The user's male policy applies to all entry points, rather than just CSS.
evaluate("selectEvent({classList:{add(){}}},'festival')");
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
