import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const paths=['../js/photoMappingData.js','../js/locales.js','../js/locale.js','../data.js','../js/compatibility.js','../js/photoMapping.js','../app.js'];
const sources=await Promise.all(paths.map(path=>readFile(new URL(path,import.meta.url),'utf8')));
const matchingSource=await readFile(new URL('../js/outfitMatching.js',import.meta.url),'utf8');
function session(changeCatalog){
  const elements=new Map(),get=id=>{
    if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',dataset:{},classList:{add(){},remove(){},toggle(){}},scrollIntoView(){},replaceChildren(){this.textContent='';}});
    return elements.get(id);
  };
  let restored,persisted,clipboard;
  const downloads=[];
  class BrowserURL extends URL {
    static createObjectURL(blob){downloads.push(blob);return 'blob:test-colour-export';}
    static revokeObjectURL(){}
  }
  const window={addEventListener(){},dispatchEvent(){},VietPhucStudio:{restore(config){restored=config;},getConfig(){return window.VietPhucRemix.getOutfit();}}};
  const context=vm.createContext({window,document:{baseURI:'http://localhost/viet-phuc-remix/',getElementById:get,querySelectorAll:()=>[],addEventListener(){},body:{append(){}},createElement(){return {click(){},remove(){}};}},
    URL:BrowserURL,Blob,location:{href:'http://localhost/viet-phuc-remix/',hash:''},navigator:{language:'vi',clipboard:{async writeText(value){clipboard=value;}}},
    localStorage:{getItem:()=>null,setItem(_key,value){persisted=value;}},CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail;}},
    IntersectionObserver:class{observe(){}},setTimeout:()=>1,clearTimeout(){}});
  vm.runInContext(sources[0],context);
  if(changeCatalog){
    changeCatalog(window.VietPhucOutfitCatalogData);
    window.VietPhucColorVariantData=window.VietPhucOutfitCatalogData.colorVariants;
  }
  vm.runInContext(matchingSource,context);
  sources.slice(1).forEach(source=>vm.runInContext(source,context));
  return {window,get,run:code=>vm.runInContext(code,context),context,restored:()=>restored,persisted:()=>persisted,clipboard:()=>clipboard,downloads};
}
const app=session(),mapping=app.window.VietPhucPhotoMapping,catalog=app.window.VietPhucOutfitCatalogData;
const variants=Array.from(catalog.colorVariants||[]);
assert.ok(variants.length>0,'The real generated catalog must contain approved variants before the colour demo is claimed complete');
assert.equal(catalog.items.length,47,'Colour variants must not replace or inflate the original catalog');
assert.ok(catalog.items.every(item=>item.sourceKind==='original'));
const appEvent=event=>({'le-hoi':'festival',truong:'school'}[event]||event);
const colorFor=id=>catalog.colors.find(color=>color.id===id);
const hexFor=id=>colorFor(id).hex||colorFor(id).swatchHex;
const sourceFor=variant=>catalog.items.find(item=>item.combinationId===variant.sourceCombinationId);
const configFor=(variant,changes={})=>{
  const source=sourceFor(variant);
  return {costumeId:source.costumeId,body:{gender:source.gender},accessories:Array.from(source.accessories),event:appEvent(variant.demoEventIds[0]),colorId:variant.primaryColorId,color:hexFor(variant.primaryColorId),variantId:variant.variantId,...changes};
};
for(const variant of variants){
  const source=sourceFor(variant),config=configFor(variant);
  assert.equal(variant.quality.status,'approved');
  assert.equal(variant.sourceAssetId,source.assetId);
  assert.equal(variant.sourceSha256,source.sourceSha256);
  assert.equal(variant.width,source.width);assert.equal(variant.height,source.height);
  assert.deepEqual(Array.from(variant.accessories),Array.from(source.accessories));
  const resolved=mapping.resolve(config);
  assert.equal(resolved.sourceKind,'recolor');assert.equal(resolved.variantId,variant.variantId);
  assert.equal(resolved.colorExact,true);assert.equal(resolved.accessoriesExact,true);assert.equal(resolved.fallback,false);
  assert.equal(resolved.sourceCombinationId,source.combinationId);
  assert.ok(mapping.getColorOptions(config).find(color=>color.id===variant.primaryColorId)?.available);
  assert.equal(mapping.resolve({...config,colorId:null}).sourceKind,'original','An explicit original choice bypasses generated variants');
  assert.equal(mapping.resolve({...config,colorId:source.primaryColorId,variantId:null}).sourceKind,'original','Existing primary-colour photos take priority');
  assert.equal(mapping.resolve({...config,colorId:undefined,variantId:null}).sourceKind,'recolor','Supported legacy HEX values map to the approved colour catalog');
  const outsideProfile=mapping.resolve({...config,event:'wedding'});
  assert.equal(outsideProfile.sourceKind,'original');assert.equal(outsideProfile.colorFallback,true,'Editorial event limits cannot silently display an unavailable variant');
  assert.match(mapping.draw(config),/data-source-kind="recolor"/);
  assert.ok(app.window.VietPhucMessages['photo.'+variant.key]?.vi);
  assert.ok(app.window.VietPhucMessages['photo.'+variant.key]?.en);
}
const variant=variants[0],config=configFor(variant);
const invalidAccessories=mapping.resolve({...config,accessories:['__unsupported__']});
assert.equal(invalidAccessories,null,'Unknown accessories fail closed instead of showing an arbitrary original');

// Invalidity fixtures mutate real rows; successful cases above use supplied images.
for(const change of [row=>{row.quality.status='pending';},row=>{row.sourceSha256='0'.repeat(64);},row=>{row.sourceAssetId='__missing__';}]){
  const invalid=session(value=>{for(const row of value.colorVariants)change(row);});
  const result=invalid.window.VietPhucPhotoMapping.resolve(config);
  assert.equal(result,null,'A pinned variant that loses approval cannot be silently restored');
  const reference=invalid.window.VietPhucPhotoMapping.resolve({...config,variantId:null});
  assert.equal(reference.sourceKind,'original');assert.equal(reference.colorFallback,true);
  const activeIds=invalid.window.VietPhucPhotoMapping.getColorOptions(config).map(color=>color.id);
  for(const row of variants){
    if(!catalog.items.some(item=>item.primaryColorId===row.primaryColorId))assert.ok(!activeIds.includes(row.primaryColorId),'A colour backed only by unapproved or unlinked variants is hidden');
  }
}
const entry=await readFile(new URL('../index.html',import.meta.url),'utf8');
assert.ok(entry.indexOf('id="ms-accessories"')<entry.indexOf('id="ms-color"'),'Accessory selection must precede colour selection');
app.context.variant=variant;app.context.config=config;
app.run('state.selectedCostume=config.costumeId;state.selectedGender=config.body.gender;state.selectedEvent=config.event;state.selectedAccessories=new Set(config.accessories);generateOutfit();selectPhotoColor(config.colorId)');
assert.equal(app.window.VietPhucRemix.getOutfit().colorId,variant.primaryColorId);
assert.equal(app.window.VietPhucRemix.getOutfit().variantId,variant.variantId);
assert.match(app.get('figure-costume').innerHTML,/data-source-kind="recolor"/,'The result card uses the selected combination, not a separate base illustration');
await app.run('saveLook({studioConfig:VietPhucRemix.getOutfit(),outfitMeta:VietPhucRemix.getOutfit()})'.replaceAll('VietPhucRemix','window.VietPhucRemix'));
const saved=JSON.parse(app.persisted())[0];
assert.equal(saved.colorId,variant.primaryColorId);assert.equal(saved.studioConfig.variantId,variant.variantId);
const revoked=session(value=>{for(const row of value.colorVariants)row.quality.status='pending';});
revoked.context.saved=saved;
revoked.context.untrustedPixels='data:image/png;base64,'+(await readFile(new URL('./fixtures/qa-opaque.png',import.meta.url))).toString('base64');
const restoredAfterRevocation=revoked.run('normaliseStoredLook({...saved,image:untrustedPixels})');
assert.equal(restoredAfterRevocation.colorId,null);assert.equal(restoredAfterRevocation.studioConfig.variantId,null);
assert.equal(restoredAfterRevocation.image,null,'A cached PNG cannot reintroduce a colour variant that no longer has approval');
app.context.savedId=saved.id;app.run('selectPhotoColor(null);restoreLook(savedId)');
assert.equal(app.window.VietPhucRemix.getOutfit().variantId,variant.variantId);
assert.equal(app.restored().colorId,variant.primaryColorId);assert.equal(app.restored().variantId,variant.variantId);
app.run('selectPhotoColor(null)');
app.context.frozenOriginal=JSON.parse(JSON.stringify(app.window.VietPhucRemix.getOutfit()));
app.run('selectPhotoColor(config.colorId)');
await app.run('saveLook({studioConfig:frozenOriginal,outfitMeta:frozenOriginal})');
assert.equal(JSON.parse(app.persisted())[0].colorId,null,'An asynchronous original snapshot must keep its explicit null colour selection after the live UI changes');
assert.equal(JSON.parse(app.persisted())[0].studioConfig.variantId,null);
app.run("selectEvent({classList:{add(){}}},'wedding')");
assert.equal(app.window.VietPhucRemix.getOutfit().colorId,null,'Changing the event restores the original when no approved variant is valid');
app.run('selectPhotoColor(config.colorId)');
assert.equal(app.window.VietPhucRemix.getOutfit().colorId,null,'Disabled colour handlers must reject unavailable selections');
assert.match(app.get('color-swatches').innerHTML,new RegExp(`aria-disabled="true" disabled[^]*id="swatch-${variant.primaryColorId}"`));

// Exercise the real portable-recipe and export functions with trusted metadata.
app.run('state.selectedEvent=config.event;selectPhotoColor(config.colorId)');
app.run(await readFile(new URL('../js/webFeatures.js',import.meta.url),'utf8'));
await app.window.shareLook();
const sharedURL=new URL(app.clipboard()),recipe=JSON.parse(decodeURIComponent(sharedURL.hash.slice(6)));
assert.equal(recipe.ci,variant.primaryColorId);assert.equal(recipe.vi,variant.variantId);
app.run('selectPhotoColor(null)');
app.context.location.hash=sharedURL.hash;app.window.VietPhucWebFeatures.readSharedLook();
assert.equal(app.window.VietPhucRemix.getOutfit().colorId,variant.primaryColorId);
assert.equal(app.restored().variantId,variant.variantId);
app.run('selectPhotoColor(null)');
app.context.location.hash='#look='+encodeURIComponent(JSON.stringify({...recipe,vi:'__unapproved__'}));
app.window.VietPhucWebFeatures.readSharedLook();
assert.equal(app.window.VietPhucRemix.getOutfit().colorId,null,'A shared recipe cannot inject an unapproved variant ID');
const legacyRecipe={...recipe};delete legacyRecipe.ci;delete legacyRecipe.vi;
app.context.location.hash='#look='+encodeURIComponent(JSON.stringify(legacyRecipe));
app.window.VietPhucWebFeatures.readSharedLook();
assert.equal(app.window.VietPhucRemix.getOutfit().colorId,null,'Legacy v1 colour notes restore safely as original photos');
const exported=[];
app.window.VietPhucPhotoMapping=Object.freeze({...mapping,exportPNG:async look=>{
  const image=mapping.resolve(look);exported.push({look:JSON.parse(JSON.stringify(look)),image});
  return image.src; // Image encoding is separate; retrieval uses the real catalog.
}});
app.context.exportSaved=saved;app.run('state.lookbook=[exportSaved]');
await app.window.exportLookbook();
assert.equal(exported.length,1);assert.equal(exported[0].look.colorId,variant.primaryColorId);
assert.equal(exported[0].look.variantId,variant.variantId);assert.equal(exported[0].look.event,config.event);
assert.equal(exported[0].image.variantId,variant.variantId,'Export retrieves the same approved variant as the saved look');
assert.ok((await app.downloads[0].text()).includes(exported[0].image.src));
console.log(`Actual approved colour variants, original priority, exact-source filtering, event demo profiles, fail-closed review/hash guards, palette order, lookbook, share and export metadata: PASS (${variants.length} variants)`);
