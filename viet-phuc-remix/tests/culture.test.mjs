import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import test from 'node:test';

const root=new URL('../../',import.meta.url);
const paths=['js/photoMappingData.js','js/cultureData.js','js/locales.js','js/locale.js','data.js','js/culture.js','js/outfitMatching.js','js/compatibility.js','js/photoMapping.js','app.js','js/webFeatures.js'];
const code=await Promise.all(paths.map(path=>readFile(new URL('../'+path,import.meta.url),'utf8')));
function session(){
 const elements=new Map(),listeners=new Map(),get=id=>{
  if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',dataset:{},attrs:{},setAttribute(key,value){this.attrs[key]=value;},getAttribute(key){return this.attrs[key];},removeAttribute(key){delete this.attrs[key];},classList:{add(){},remove(){},toggle(){}},scrollIntoView(){}});
  return elements.get(id);
 };
 const window={addEventListener(type,callback){listeners.set(type,[...(listeners.get(type)||[]),callback]);},dispatchEvent(event){for(const callback of listeners.get(event.type)||[])callback(event);}};
 const context=vm.createContext({window,URL,Blob,document:{documentElement:{},getElementById:get,querySelectorAll:()=>[],addEventListener(){},baseURI:'http://localhost/viet-phuc-remix/'},
  location:{href:'http://localhost/viet-phuc-remix/',hash:''},navigator:{language:'vi'},localStorage:{getItem:()=>null,setItem(){}},
  CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail;}},IntersectionObserver:class{observe(){}},setTimeout:()=>1,clearTimeout(){}});
 code.forEach(source=>vm.runInContext(source,context));
 return {window,get,run:source=>vm.runInContext(source,context)};
}

test('Knowledge provenance resolves to supplied records and selected references',async()=>{
 const {window,run}=session(),data=window.VietPhucCultureData;
 const items=JSON.parse(await readFile(new URL('viet_phuc_items.json',root),'utf8')).items;
 const sources=JSON.parse(await readFile(new URL('viet_phuc_sources.json',root),'utf8')).sources;
 assert.equal(data.audit.localItemCount,items.length);
 assert.equal(data.audit.localSourceCount,sources.length);
 assert.equal(data.audit.readSourceCount,data.sources.length);
 assert.equal(data.profiles.length,7);
 assert.equal(new Set(data.profiles.map(profile=>profile.id)).size,7);
 for(const row of data.audit.rawFiles){
  const bytes=await readFile(new URL(row.path,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256,row.path+' must retain its supplied bytes');
 }
 for(const source of data.sources){
  assert.ok(source.id==='extra_ao_dai_01'||sources.some(row=>row.source_id===source.id));
  assert.equal(source.reviewStatus,'read-and-compared');
  assert.match(source.url,/^https:\/\//);
 }
 for(const row of [...data.profiles,...data.accessories]){
  for(const recordId of row.recordIds)assert.ok(items.some(item=>item.item_id===recordId),recordId);
  for(const value of Object.values(row))if(value?.vi){
   assert.ok(value.en);
   for(const sourceId of value.sourceIds)assert.ok(data.sources.some(source=>source.id===sourceId),sourceId);
  }
 }
 assert.equal(data.audit.photoCultureVerified,false);
 assert.ok(data.audit.excludedFiles.includes('viet_phuc_items_AI_GENERATED.json'));
 assert.equal(window.VietPhucCulture.getProfile('ao-giao-linh').status,'reference');
 assert.ok(run('COSTUMES.every(item=>item.needsVerification)'),'Old drafts must not become certified facts');
 const catalog=window.VietPhucOutfitCatalogData;
 assert.equal(catalog.items.length,47);
 assert.equal(catalog.colorVariants.length,4);
 assert.equal(window.VietPhucPhotoMapping.resolve({costumeId:'ao-dai',body:{gender:'female'},accessories:[],requireVerifiedCulture:true}),null,'General references cannot certify an outfit image');
});

test('All garment details, citations and culture tabs render in both languages',()=>{
 const {window,get,run}=session(),culture=window.VietPhucCulture;
 for(const language of ['vi','en']){
  window.VietPhucLocale.setLanguage(language);
  for(const profile of window.VietPhucCultureData.profiles){
   const detail=culture.detail(profile.id,{accessoryIds:['non-la','giay-cao-got']});
   assert.ok(detail.includes(culture.summary(profile.id)));
   assert.match(detail,/rel="noopener noreferrer"/);
   assert.match(detail,/<h3>/);
   assert.ok(!detail.includes('culture.profile.'),'No untranslated data keys');
   assert.ok(detail.includes(window.VietPhucLocale.t('culture.photoNote')));
   run(`openCostumeModal('${profile.id}')`);
   assert.ok(get('modal-content').innerHTML.includes(culture.summary(profile.id)));
  }
  window.renderTimeline();window.renderCultureRules();window.renderRegions();window.renderModernTrends();
  assert.equal((get('timeline').innerHTML.match(/data-culture-costume=/g)||[]).length,7);
  assert.ok(get('rules-grid').innerHTML.includes(window.VietPhucLocale.t('culture.editorial')));
  assert.ok(get('regions-map').innerHTML.includes(window.VietPhucLocale.t('culture.regionNote')));
  for(const region of ['north','central','south'])assert.ok(get('regions-map').innerHTML.includes(window.VietPhucLocale.t('ui.'+region)));
  assert.equal((get('modern-grid').innerHTML.match(/data-culture-costume=/g)||[]).length,3);
  assert.match(culture.detail('ao-dai',{compact:true}),/<details>/);
 }
 assert.equal(culture.detail('__unknown__'),'');
 assert.equal(culture.summary('__unknown__'),'');
});

test('Knowledge follows the selected outfit without changing retrieval or the accessory catalog',()=>{
 const {window,get,run}=session();
 const original=window.VietPhucPhotoMapping.resolve({costumeId:'ao-dai',body:{gender:'female'},accessories:[]});
 assert.ok(original);
 run("state.selectedCostume='ao-dai';state.selectedAccessories=new Set();generateOutfit()");
 assert.match(get('culture-content').innerHTML,/data-culture-profile="ao-dai"/);
 const selected=window.VietPhucRemix.getOutfit();
 assert.equal(window.VietPhucPhotoMapping.resolve(selected).assetId,original.assetId);
 run("state.selectedCostume='ao-ngu-than';state.selectedAccessories=new Set(['khan-dong','guoc-moc']);generateOutfit()");
 assert.match(get('culture-content').innerHTML,/data-culture-profile="ao-ngu-than"/);
 assert.ok(get('culture-content').innerHTML.includes(window.VietPhucLocale.t('culture.accessory.khan-dong.note')));
 window.VietPhucLocale.setLanguage('en');
 assert.ok(get('culture-content').innerHTML.includes(window.VietPhucLocale.t('culture.profile.ao-ngu-than.history')));
 assert.equal(run('ACCESSORIES.length'),8);
});

test('Reference text is escaped and non-web source URLs cannot render links',()=>{
 const {window}=session(),data=window.VietPhucCultureData;
 data.sources[0].url='javascript:alert(1)';
 data.sources[0].title='<img src=x onerror=alert(1)>';
 const content=window.VietPhucCulture.detail('ao-tu-than');
 assert.ok(!content.includes('javascript:'));
 assert.ok(!content.includes('<img src=x'));
 data.sources[0].url='https://example.com/?q="<script>';
 data.sources[0].publisher='<script>alert(1)</script>';
 const escaped=window.VietPhucCulture.detail('ao-tu-than');
 assert.ok(escaped.includes('&lt;script&gt;'));
 assert.ok(!escaped.includes('<script>'));
});
