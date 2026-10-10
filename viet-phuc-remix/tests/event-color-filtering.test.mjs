import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const catalog=JSON.parse(await readFile(new URL('../../assets/web/photo-catalog.json',import.meta.url),'utf8'));
const source=await readFile(new URL('../js/outfitMatching.js',import.meta.url),'utf8');
const window={};vm.runInNewContext(source,{window});
const matching=window.VietPhucMatching;
const create=value=>matching.createEngine(value||catalog);
const plain=value=>JSON.parse(JSON.stringify(value));
const query=(item,event='festival')=>({costumeId:item.costumeId,gender:item.gender,accessories:[...item.accessories],colorId:item.primaryColorId,event});
const expected={festival:['ao-dai','ao-tu-than','ao-ngu-than','ao-ba-ba','ao-nhat-binh','ao-yem','ao-giao-linh'],
 tet:['ao-dai','ao-tu-than','ao-ngu-than','ao-ba-ba'],wedding:['ao-dai','ao-nhat-binh','ao-ngu-than'],
 school:['ao-dai','ao-ngu-than'],street:['ao-dai','ao-ba-ba','ao-yem','ao-ngu-than'],
 ceremony:['ao-ngu-than','ao-nhat-binh','ao-giao-linh']};

test('editorial event profiles filter all real originals without asserting historical permission',()=>{
 const engine=create();
 assert.ok(Object.isFrozen(matching.eventProfiles));
 for(const [event,costumeIds] of Object.entries(expected)){
  const profile=matching.eventProfiles[event];
  assert.deepEqual(plain(profile.costumeIds),costumeIds);
  assert.ok(Object.isFrozen(profile));assert.ok(Object.isFrozen(profile.costumeIds));
  assert.equal(profile.kind,'editorial-demo-scope');assert.equal(profile.culturalAuthority,false);
  for(const item of catalog.items){
   const allowed=costumeIds.includes(item.costumeId),q=query(item,event),result=engine.search(q);
   assert.equal(result.status,allowed?'exact':'empty',`${event}: ${item.key}`);
   assert.equal(engine.hasExact(item.accessories,q),allowed);
   const colors=engine.colorOptions(q);
   assert.equal(colors.find(color=>color.id===item.primaryColorId).available,allowed);
   if(!allowed){
    assert.ok(result.excluded.some(row=>row.id===item.combinationId&&row.reasons.includes('outside-event-demo')));
    assert.ok(colors.every(color=>color.code==='outside-event-demo'&&!color.available));
   }
   assert.equal(item.eventIds,null);assert.equal(item.culturalInfo.needsVerification,true);
  }
 }
 for(const item of catalog.items)assert.equal(engine.search({...query(item),event:null}).status,'exact');
 assert.deepEqual(plain(engine.getDiagnostics()),{originals:47,variants:4,rejected:[]});
});

test('canonical event aliases and compatibility share event-aware availability and repair',async()=>{
 const engine=create();
 for(const [alias,canonical] of Object.entries({'le-hoi':'festival',truong:'school',graduation:'school',cuoi:'wedding',daily:'street','tho-cuong':'ceremony'})){
  assert.equal(matching.canonicalEvent(alias),canonical);
  for(const item of catalog.items)assert.equal(engine.search(query(item,alias)).status,engine.search(query(item,canonical)).status);
 }
 assert.equal(engine.search({...query(catalog.items[0]),event:'constructor'}).status,'invalid');
 const scope={VietPhucMatching:matching,VietPhucOutfitCatalogData:catalog,VietPhucLocale:{t:key=>key}};
 vm.runInNewContext(await readFile(new URL('../js/compatibility.js',import.meta.url),'utf8'),{window:scope});
 const compatibility=scope.VietPhucCompatibility;
 assert.equal(compatibility.getCostumeAvailability('ao-ba-ba','female',{event:'wedding'}).code,'outside-event-demo');
 assert.equal(compatibility.sanitizeCostume('ao-ba-ba','female',{event:'wedding'}),'ao-dai');
 assert.equal(compatibility.sanitizeCostume('ao-giao-linh','male',{event:'school'}),'ao-ngu-than');
 assert.equal(compatibility.sanitizeCostume('ao-giao-linh','male',{event:'ceremony'}),'ao-giao-linh');
 assert.equal(compatibility.sanitizeCostume('ao-yem','female',{event:'daily'}),'ao-yem');
});

test('enabled colours always retrieve their exact real set and keep at most three primary alternatives',()=>{
 const engine=create(),groups=new Map();
 for(const item of [...catalog.items,...catalog.colorVariants]){
  const key=[item.costumeId,item.gender,[...item.accessories].sort().join('+')].join('|');
  if(!groups.has(key))groups.set(key,item);
 }
 assert.equal(groups.size,47);
 for(const item of groups.values())for(const event of Object.keys(expected)){
  const q=query(item,event),options=engine.colorOptions(q),enabled=options.filter(color=>color.available);
  assert.ok(enabled.length<=3);
  assert.ok(options.every(color=>!['gold','blue','green'].includes(color.id)),'Secondary colours without a primary photo stay hidden');
  for(const color of enabled){
   assert.equal(color.code,null);assert.ok(color.combinationIds.length);
   const result=engine.search({...q,colorId:color.id});
   assert.equal(result.status,'exact');assert.equal(result.best.primaryColorId,color.id);
   assert.deepEqual(plain(result.best.accessories).sort(),[...item.accessories].sort());
   assert.equal(result.best.costumeId,item.costumeId);assert.equal(result.best.gender,item.gender);
   if(catalog.items.some(original=>original.costumeId===item.costumeId&&original.gender===item.gender&&original.primaryColorId===color.id&&original.accessories.length===item.accessories.length&&original.accessories.every(id=>item.accessories.includes(id))))assert.equal(result.best.sourceKind,'original');
  }
 }
 for(const variant of catalog.colorVariants){
  assert.equal(engine.colorOptions(query(variant,'wedding')).find(color=>color.id===variant.primaryColorId).code,'outside-demo-profile');
  assert.equal(engine.colorOptions(query(variant,'ceremony')).find(color=>color.id===variant.primaryColorId).available,false);
 }
 const missing=engine.colorOptions({costumeId:'ao-giao-linh',gender:'female',accessories:['non-la','guoc-moc'],event:'festival'});
 assert.ok(missing.every(color=>!color.available&&color.code==='whole-set-missing'));
});

test('stale original colour provenance disables selection while retaining the actual original preview',()=>{
 const item=catalog.items.find(row=>row.costumeId==='ao-ba-ba'&&!row.accessories.length);
 for(const mutate of [row=>{row.metadata.colorStatus='unknown';},row=>{row.metadata.fields.colors.status='unknown';},row=>{row.metadata.fields.colors.sourceSha256='0'.repeat(64);},row=>{row.colorIds=[];}]){
  const altered=structuredClone(catalog),row=altered.items.find(value=>value.combinationId===item.combinationId);mutate(row);
  const engine=create(altered),q=query(item),options=engine.colorOptions(q);
  assert.equal(options.find(color=>color.id==='pink').available,false);
  assert.equal(options.find(color=>color.id==='pink').code,'color-unreviewed');
  const preview=engine.search({...q,colorId:null});
  assert.equal(preview.status,'exact');assert.equal(preview.best.combinationId,item.combinationId);
  assert.equal(preview.best.primaryColorId,null);assert.equal(preview.best.colorIds,null);
  assert.notEqual(engine.search(q).status,'exact');
  assert.equal(engine.getDiagnostics().originals,47);
 }
 const altered=structuredClone(catalog);
 altered.colorVariants[0].metadata.fields.colors.sourceSha256='0'.repeat(64);
 assert.ok(create(altered).getDiagnostics().rejected.some(row=>row.id===catalog.colorVariants[0].variantId));
});

test('runtime colour cap prioritizes real original rows and cannot be bypassed by query or pinned variants',()=>{
 const altered=structuredClone(catalog),base=altered.items.find(row=>row.combinationId==='combination-045e317b8c6515d8');
 const otherOriginals=altered.items.filter(row=>row.costumeId===base.costumeId&&row.gender===base.gender&&row.combinationId!==base.combinationId).slice(0,2);
 for(const [index,row] of otherOriginals.entries()){
  // Deliberately inconsistent metadata on existing rows exercises a future overfull bundle.
  row.accessories=[...base.accessories];row.primaryColorId=['ivory','pink'][index];row.colorIds=[row.primaryColorId];
 }
 const engine=create(altered),q=query(base),options=engine.colorOptions(q);
 assert.deepEqual(options.filter(color=>color.available).map(color=>color.id).sort(),['burgundy','ivory','pink']);
 for(const colorId of ['navy','plum']){
  assert.equal(options.find(color=>color.id===colorId).code,'color-limit');
  assert.notEqual(engine.search({...q,colorId}).status,'exact');
  const variant=altered.colorVariants.find(row=>row.sourceCombinationId===base.combinationId&&row.primaryColorId===colorId);
  assert.ok(!engine.search({...q,colorId,variantId:variant.variantId}).candidates.some(row=>row.variantId===variant.variantId));
  assert.ok(!engine.search({...q,colorId:null,variantId:variant.variantId}).candidates.some(row=>row.variantId===variant.variantId));
 }
 altered.items.reverse();altered.colorVariants.reverse();
 assert.deepEqual(plain(create(altered).colorOptions(q)),plain(options),'File order cannot change cap choices');
});

test('failed images disable only their actual colour and keep palette reason and retrieval aligned',()=>{
 const engine=create(),variant=catalog.colorVariants.find(row=>row.sourceCombinationId==='combination-045e317b8c6515d8'&&row.primaryColorId==='navy'),q=query(variant);
 assert.equal(engine.colorOptions(q).find(color=>color.id==='navy').available,true);
 engine.markUnavailable(variant.key);
 const disabled=engine.colorOptions(q).find(color=>color.id==='navy');
 assert.equal(disabled.available,false);assert.equal(disabled.code,'image-unavailable');
 assert.notEqual(engine.search(q).status,'exact');
 assert.ok(engine.colorOptions(q).find(color=>color.id==='burgundy').available);
});

test('the limit also covers more than three original colours and is counted before event filtering',()=>{
 const altered=structuredClone(catalog),group=altered.items.filter(row=>row.costumeId==='ao-ngu-than'&&row.gender==='female').slice(0,4);
 const colors=['ivory','burgundy','pink','navy'];
 for(const [index,row] of group.entries()){
  row.accessories=[];row.primaryColorId=colors[index];row.colorIds=[row.primaryColorId];
 }
 const engine=create(altered),q={costumeId:'ao-ngu-than',gender:'female',accessories:[],event:'festival'};
 const options=engine.colorOptions(q),enabled=options.filter(color=>color.available),limited=options.filter(color=>color.code==='color-limit');
 assert.equal(enabled.length,3);assert.equal(limited.length,1);
 for(const event of ['tet','school','wedding','ceremony'])assert.deepEqual(engine.colorOptions({...q,event}).filter(color=>color.available).map(color=>color.id),enabled.map(color=>color.id));
 for(const color of limited){
  assert.notEqual(engine.search({...q,colorId:color.id}).status,'exact');
  assert.ok(engine.search({...q,colorId:color.id}).excluded.some(row=>row.reasons.includes('color-limit')));
 }
 assert.equal(engine.search({...q,colorId:null}).status,'exact','Original photos stay usable for an unpinned preview');
});
