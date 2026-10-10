import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const catalog=JSON.parse(await readFile(new URL('../../assets/web/photo-catalog.json',import.meta.url),'utf8'));
const source=await readFile(new URL('../js/outfitMatching.js',import.meta.url),'utf8');
const window={};vm.runInNewContext(source,{window});
const create=value=>window.VietPhucMatching.createEngine(value||catalog);
const config=item=>({costumeId:item.costumeId,gender:item.gender,accessories:[...item.accessories],colorId:item.primaryColorId,event:'festival',style:'traditional'});
const copy=()=>structuredClone(catalog);
const values=value=>JSON.parse(JSON.stringify(value));
const femaleGiao={costumeId:'ao-giao-linh',gender:'female',event:'festival'};

test('all 47 real originals are exact matches with their own complete set and colour',()=>{
 const engine=create();assert.deepEqual(values(engine.getDiagnostics()),{originals:47,variants:4,rejected:[]});
 for(const item of catalog.items){
  const result=engine.search(config(item));
  assert.equal(result.status,'exact');assert.equal(result.best.combinationId,item.combinationId);
  assert.equal(result.best.score,100);assert.equal(result.best.sourceKind,'original');
  assert.ok(result.best.warnings.some(w=>w.code==='culture-unverified'));
  assert.ok(result.best.warnings.some(w=>w.code==='style-unverified'));
 }
});
test('approved recolors retain exact source, body and accessory bindings',()=>{
 const engine=create();
 for(const item of catalog.colorVariants){
  const result=engine.search({...config(item),variantId:item.variantId});
  assert.equal(result.status,'exact');assert.equal(result.best.variantId,item.variantId);
  assert.equal(result.best.score,100);assert.equal(result.best.sourceCombinationId,item.sourceCombinationId);
  assert.equal(engine.search({...config(item),colorId:catalog.items.find(s=>s.combinationId===item.sourceCombinationId).primaryColorId}).best.sourceKind,'original');
 }
});
test('every interactive add/remove is gated by the entire resulting photographed set',()=>{
 const engine=create(),accessories=engine.getSupportedAccessoryIds();
 for(const item of catalog.items){
  const q=config(item),choices=engine.choices(q);
  for(const id of accessories){
   const proposed=q.accessories.includes(id)?q.accessories.filter(value=>value!==id):[...q.accessories,id];
   const expected=choices.some(set=>set.accessories.length===proposed.length&&set.accessories.every(value=>proposed.includes(value)));
   assert.equal(engine.accessoryAvailability(id,q).available,expected,`${item.key}: toggle ${id}`);
  }
 }
});
test('giao linh triple is reachable atomically, while missing intermediate pairs stay disabled',()=>{
 const engine=create(),triple=['guoc-moc','non-la','tram-cai'];
 assert.ok(engine.choices(femaleGiao).some(set=>set.accessories.length===3));
 assert.equal(engine.hasExact(triple,femaleGiao),true);
 assert.equal(engine.hasExact(['non-la','guoc-moc'],femaleGiao),false);
 assert.equal(engine.accessoryAvailability('tram-cai',{...femaleGiao,accessories:['non-la']}).available,false);
 assert.equal(engine.accessoryAvailability('tram-cai',{...femaleGiao,accessories:triple}).available,false,'Removing hairpin leaves a missing pair');
 assert.equal(engine.accessoryAvailability('non-la',{...femaleGiao,accessories:triple}).available,true,'The remaining hairpin/clogs pair is photographed');
 assert.deepEqual(values(engine.sanitizeAccessories(triple,femaleGiao)),triple);
});
test('no-accessory photos are genuine choices for all nine current families',()=>{
 const engine=create(),families=new Set();
 for(const item of catalog.items){
  families.add(item.familyId);
  assert.ok(engine.choices(config(item)).some(set=>set.key==='none'));
  const result=engine.search({...config(item),accessories:[],colorId:null});
  assert.equal(result.status,'exact');assert.equal(result.best.accessories.length,0);
 }
 assert.equal(families.size,9);
});
test('a missing no-accessory asset disables that mode and only offers a labelled reference',()=>{
 const altered=copy(),item=altered.items.find(i=>i.gender==='female'&&i.costumeId==='ao-giao-linh'&&!i.accessories.length);
 item.availability.previewEligible=false;
 const engine=create(altered),result=engine.search({...femaleGiao,accessories:[],colorId:null});
 assert.equal(engine.hasExact([],femaleGiao),false);assert.equal(result.status,'reference');
 assert.ok(result.best.differences.some(d=>d.code==='accessories-extra'));
 assert.equal(result.best.score,50);
});
test('closest reference uses Jaccard over real complete sets and explains the extra hairpin',()=>{
 const engine=create(),result=engine.search({...femaleGiao,accessories:['non-la','guoc-moc'],colorId:'burgundy'});
 assert.equal(result.status,'reference');assert.equal(result.best.score,86);
 assert.deepEqual(values(result.best.accessories),['guoc-moc','non-la','tram-cai']);
 assert.deepEqual(values(result.best.differences),[{code:'accessories-extra',ids:['tram-cai']}]);
 assert.equal(result.best.accessoriesExact,false);assert.equal(result.best.colorExact,true);
});
test('hard constraints never relax garment, body or approved-demo event limits',()=>{
 const engine=create();
 for(const costumeId of ['ao-dai','ao-tu-than','ao-ba-ba','ao-yem','ao-nhat-binh'])assert.equal(engine.search({costumeId,gender:'male'}).status,'empty');
 const variant=catalog.colorVariants[0],result=engine.search({...config(variant),event:'wedding'});
 assert.equal(result.status,'reference');assert.equal(result.best.sourceKind,'original');
 assert.ok(result.best.differences.some(d=>d.code==='color-different'));
 assert.ok(result.excluded.some(e=>e.id===variant.variantId&&e.reasons.includes('outside-demo-profile')));
 assert.equal(engine.colorOptions({...config(variant),event:'wedding'}).find(c=>c.id===variant.primaryColorId).available,false);
 for(const candidate of result.candidates){assert.equal(candidate.costumeId,variant.costumeId);assert.equal(candidate.gender,variant.gender);}
});
test('unknown inputs are rejected instead of becoming arbitrary original-photo fallbacks',()=>{
 const engine=create();
 for(const changes of [{costumeId:'constructor'},{gender:'other'},{accessories:['bong-tai']},{accessories:'non-la'},{colorId:'invented'},{event:'invented'},{style:'invented'},{variantId:'unapproved'},{requireVerifiedCulture:'false'}]){
  const result=engine.search({...femaleGiao,...changes});assert.equal(result.status,'invalid');assert.equal(result.best,null);
 }
 assert.equal(engine.search(null).status,'invalid');
});
test('unreviewed, stale and unbound records fail closed before ranking',()=>{
 for(const alter of [c=>{c.items[0].metadata.fields.accessoryIds.sourceSha256='0'.repeat(64);},c=>{c.colorVariants[0].quality.status='pending_review';},c=>{c.colorVariants[0].sourceAssetId='missing';}]){
  const altered=copy();alter(altered);const engine=create(altered);
  assert.equal(engine.getDiagnostics().rejected.length,1);
  assert.equal(engine.search(config(catalog.items[0])).candidates.some(c=>engine.getDiagnostics().rejected.some(r=>r.id===c.combinationId)),false);
 }
 assert.equal(create({}).search(femaleGiao).status,'empty');
 assert.equal(window.VietPhucMatching.createEngine(null).search(femaleGiao).status,'empty');
});
test('image failures are removed before ranking and never trigger another costume or composition',()=>{
 const engine=create(),q={costumeId:'ao-yem',gender:'female',accessories:[],colorId:null},first=engine.search(q);
 engine.markUnavailable(first.best.key);const reference=engine.search(q);
 assert.equal(reference.status,'reference');assert.equal(reference.best.costumeId,'ao-yem');
 engine.markUnavailable(reference.best.key);assert.equal(engine.search(q).status,'empty');
 assert.equal(engine.search(q).best,null);
});
test('unknown history is a notice; verified reconstruction is a separate non-relaxable requirement',()=>{
 const engine=create(),q=config(catalog.items[0]);
 assert.equal(engine.search(q).status,'exact');assert.equal(engine.search({...q,requireVerifiedCulture:true}).status,'empty');
 assert.ok(engine.search({...q,requireVerifiedCulture:true}).excluded.some(e=>e.reasons.includes('culture-unverified')));
 const altered=copy();altered.items[0].culturalInfo.rules=[{kind:'hard',verified:true,sources:[],forbiddenAccessoryIds:[altered.items[0].accessories[0]]}];
 assert.equal(create(altered).search(q).status,'exact','Unsourced draft restrictions cannot ban an actual dataset combination');
 const heels=catalog.items.find(item=>item.accessories.includes('giay-cao-got'));
 assert.ok(engine.search(config(heels)).best.warnings.some(w=>w.code==='modern-heels'));
});
test('style unknown does not invent a score advantage; deterministic ties are independent of file order',()=>{
 const q={...femaleGiao,accessories:['non-la','guoc-moc'],colorId:null};
 const a=create().search(q),altered=copy();altered.items.reverse();altered.colorVariants.reverse();
 const b=create(altered).search(q);
 assert.deepEqual(values(a.candidates.map(c=>[c.combinationId,c.score])),values(b.candidates.map(c=>[c.combinationId,c.score])));
 assert.equal(create().search({...q,style:'traditional'}).best.score,create().search({...q,style:'genz'}).best.score);
 assert.ok(a.candidates.every(c=>Number.isFinite(c.score)&&c.score>=0&&c.score<=100));
});
test('restore repair keeps a largest real subset, preserves choice order and never adds accessories',()=>{
 const engine=create(),q={costumeId:'ao-dai',gender:'female'},input=['non-la','guoc-moc','giay-cao-got','bong-tai'];
 const clean=values(engine.sanitizeAccessories(input,q));
 assert.deepEqual(clean,['non-la','guoc-moc']);assert.ok(engine.hasExact(clean,q));
 assert.ok(clean.every(id=>input.includes(id)));assert.deepEqual(values(engine.sanitizeAccessories(['bong-tai'],q)),[]);
});
test('export decode failures exhaust only real same-outfit candidates and leave no composited output',async()=>{
 const events=[],scope={VietPhucOutfitCatalogData:copy(),dispatchEvent:event=>events.push(event.type)};
 const context=vm.createContext({window:scope,URL,Image:class{async decode(){throw Error('offline');}},
  CustomEvent:class{constructor(type){this.type=type;}},document:{addEventListener(){},createElement(){throw Error('No canvas should be created without a photo');}}});
 for(const file of ['../js/locales.js','../js/locale.js','../js/outfitMatching.js','../js/photoMapping.js'])vm.runInContext(await readFile(new URL(file,import.meta.url),'utf8'),context);
 const q={costumeId:'ao-yem',gender:'female',accessories:[],colorId:null,event:'festival'};
 await assert.rejects(()=>scope.VietPhucPhotoMapping.exportPNG(q));
 assert.equal(events.length,2,'The only two real yem photos fail once each');
 assert.equal(scope.VietPhucPhotoMapping.resolve(q),null);
 assert.equal(scope.VietPhucPhotoMapping.draw(q),'');
 assert.match(scope.VietPhucPhotoMapping.insights(scope.VietPhucPhotoMapping.search(q)),/matching-empty/);
 assert.equal(scope.VietPhucPhotoMapping.search({costumeId:'ao-dai',gender:'female',accessories:[],colorId:null}).status,'exact','Other outfits must not be tried or consumed by export recovery');
});
