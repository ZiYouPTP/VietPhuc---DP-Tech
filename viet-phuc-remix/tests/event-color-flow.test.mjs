import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const paths=['js/photoMappingData.js','js/cultureData.js','js/locales.js','js/locale.js','data.js','js/culture.js','js/outfitMatching.js','js/colorHarmony.js','js/compatibility.js','js/photoMapping.js','app.js','js/webFeatures.js'];
const code=await Promise.all(paths.map(path=>readFile(new URL('../'+path,import.meta.url),'utf8')));
function session(){
 const controls=new Map(),events=new Map();let persisted;
 const get=id=>{
  if(!controls.has(id))controls.set(id,{innerHTML:'',textContent:'',dataset:{},disabled:false,attrs:{},classList:{add(){},remove(){},toggle(){}},
   setAttribute(key,value){this.attrs[key]=value;},getAttribute(key){return this.attrs[key];},removeAttribute(key){delete this.attrs[key];},replaceChildren(){this.textContent='';},scrollIntoView(){}});
  return controls.get(id);
 };
 const window={addEventListener(type,fn){events.set(type,[...(events.get(type)||[]),fn]);},dispatchEvent(event){for(const fn of events.get(event.type)||[])fn(event);}};
 const context=vm.createContext({window,URL,Blob,structuredClone,navigator:{language:'vi'},location:{href:'http://localhost/viet-phuc-remix/',hash:''},
  document:{getElementById:get,documentElement:{},querySelectorAll:()=>[],addEventListener(){},baseURI:'http://localhost/viet-phuc-remix/'},
  localStorage:{getItem:()=>null,setItem(_key,value){persisted=value;}},CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail;}},
  IntersectionObserver:class{observe(){}},setTimeout:()=>1,clearTimeout(){}});
 code.forEach(source=>vm.runInContext(source,context));
 return {window,get,context,run:source=>vm.runInContext(source,context),outfit:()=>window.VietPhucRemix.getOutfit(),persisted:()=>persisted};
}
const event=(app,id)=>app.run(`selectEvent({classList:{add(){}}},'${id}')`);

test('Palette waits for the accessory step, including the explicit no-accessory choice',()=>{
 const app=session();app.run('renderColorSwatches()');
 assert.equal(app.get('color-swatches').innerHTML,'');assert.equal(app.get('btn-color-suggest').disabled,true);
 app.run("selectPhotoColor('ivory')");assert.equal(app.outfit().colorId,null);
 assert.ok(app.get('toast').textContent.includes('Không phụ kiện'));
 app.run("setAccessoryCombination('none')");
 assert.match(app.get('color-swatches').innerHTML,/swatch-ivory/);
 app.run("selectPhotoColor('ivory')");assert.equal(app.outfit().colorId,'ivory');
 app.run("selectCostumePill('ao-ngu-than')");assert.equal(app.get('color-swatches').innerHTML,'');
 assert.equal(app.outfit().colorId,null);
 app.run("selectPhotoColor('navy')");assert.equal(app.outfit().colorId,null);
 app.run("setAccessoryCombination('guoc-moc+khan-dong');selectPhotoColor('navy')");
 assert.equal(app.outfit().colorId,'navy');assert.ok(app.outfit().variantId);
});

test('Event changes repair the garment and dependent choices with real images and disabled guards',()=>{
 const app=session();app.run("selectCostumePill('ao-ba-ba');setAccessoryCombination('khan-dong');selectPhotoColor('pink')");
 for(const invalid of ['__proto__','constructor','unknown'])assert.equal(app.window.VietPhucCompatibility.getCostumeAvailability('ao-dai','female',{event:invalid}).available,false);
 event(app,'wedding');assert.equal(app.outfit().costumeId,'ao-dai');assert.equal(app.outfit().colorId,null);
 assert.deepEqual(Array.from(app.outfit().accessories),[]);
 assert.match(app.get('costume-pills').innerHTML,/disabled[^>]+id="pill-ao-ba-ba"/);
 app.run("selectCostumePill('ao-ba-ba');selectAndMix('ao-yem')");assert.equal(app.outfit().costumeId,'ao-dai');
 app.window.VietPhucRemix.setGender('male');assert.equal(app.outfit().costumeId,'ao-ngu-than');
 app.run("selectCostumePill('ao-giao-linh')");assert.equal(app.outfit().costumeId,'ao-ngu-than');
 event(app,'ceremony');app.run("selectCostumePill('ao-giao-linh');setAccessoryCombination('none')");
 assert.equal(app.outfit().costumeId,'ao-giao-linh');
 event(app,'school');assert.equal(app.outfit().costumeId,'ao-ngu-than');
 assert.ok(app.window.VietPhucPhotoMapping.resolve(app.outfit()));
});

test('Exact approved colours reset on event/accessory changes and unsupported colours cannot be applied',()=>{
 const app=session();event(app,'tet');
 app.run("selectCostumePill('ao-ngu-than');setAccessoryCombination('guoc-moc+khan-dong');selectPhotoColor('navy')");
 const variant=app.window.VietPhucPhotoMapping.resolve(app.outfit());assert.equal(variant.sourceKind,'recolor');
 event(app,'wedding');assert.equal(app.outfit().colorId,null);assert.equal(app.outfit().variantId,null);
 assert.equal(app.window.VietPhucPhotoMapping.resolve(app.outfit()).sourceKind,'original');
 assert.equal(app.outfit().color,'#8A2334','The saved colour follows the displayed original after reset');
 assert.match(app.get('color-swatches').innerHTML,/disabled[^>]*id="swatch-navy"/);
 app.run("selectPhotoColor('navy')");assert.equal(app.outfit().colorId,null);
 event(app,'tet');app.run("selectPhotoColor('navy');setAccessoryCombination('none')");
 assert.equal(app.outfit().colorId,null);assert.equal(app.outfit().variantId,null);
 const ids=app.window.VietPhucPhotoMapping.getColorOptions(app.outfit()).map(row=>row.id);
 for(const id of ['gold','blue','green'])assert.ok(!ids.includes(id),'No primary photo means no selectable colour');
});

test('Colour suggestions can be previewed, applied, translated and invalidated without altering accessory sets',()=>{
 const app=session();event(app,'school');
 app.run("selectCostumePill('ao-ngu-than');setAccessoryCombination('guoc-moc+khan-dong');updateStyle('fusion');suggestPhotoColor()");
 assert.equal(app.outfit().colorId,null,'Showing a suggestion does not apply it');
 const recommendation=app.run('colorRecommendation.colorId');assert.equal(recommendation,'navy');
 assert.match(app.get('color-suggestion').innerHTML,/Áp dụng màu/);
 app.run('applyColorSuggestion()');assert.equal(app.outfit().colorId,'navy');
 assert.equal(app.window.VietPhucPhotoMapping.resolve(app.outfit()).sourceKind,'recolor');
 assert.deepEqual(Array.from(app.outfit().accessories),['guoc-moc','khan-dong']);
 app.run('suggestPhotoColor()');app.window.VietPhucLocale.setLanguage('en');
 assert.equal(app.get('color-suggestion').innerHTML,'','A language redraw does not keep stale proposal markup');
 assert.ok(app.get('color-harmony').innerHTML.includes('Estimated colour harmony'));
 app.run('suggestPhotoColor()');assert.match(app.get('color-suggestion').innerHTML,/Already using this colour/);
 event(app,'wedding');app.run('applyColorSuggestion()');assert.equal(app.outfit().colorId,null);
 assert.ok(app.get('toast').textContent.includes('selection has changed'));
});

test('An image-load failure removes a selected variant and resets the live colour state',()=>{
 const app=session();event(app,'tet');
 app.run("selectCostumePill('ao-ngu-than');setAccessoryCombination('guoc-moc+khan-dong');selectPhotoColor('navy')");
 const item=app.window.VietPhucPhotoMapping.resolve(app.outfit());
 app.window.VietPhucPhotoMapping.recover({dataset:{photoKey:item.key}});
 assert.equal(app.outfit().colorId,null);assert.equal(app.outfit().variantId,null);
 assert.equal(app.window.VietPhucPhotoMapping.resolve(app.outfit()).sourceKind,'original');
 assert.match(app.get('color-swatches').innerHTML,/disabled[^>]*id="swatch-navy"/);
});

test('Lookbook and portable recipes keep valid event-colour combinations; invalid scopes cannot restore',async()=>{
 const app=session();event(app,'tet');
 app.run("selectCostumePill('ao-ngu-than');setAccessoryCombination('guoc-moc+khan-dong');selectPhotoColor('navy')");
 const config=app.outfit();app.context.config=config;
 await app.run('saveLook({studioConfig:config,outfitMeta:config})');
 const saved=JSON.parse(app.persisted())[0];assert.equal(saved.colorId,'navy');assert.ok(saved.studioConfig.variantId);
 event(app,'wedding');app.run(`restoreLook(${saved.id})`);assert.equal(app.outfit().event,'tet');assert.equal(app.outfit().colorId,'navy');
 assert.match(app.get('color-swatches').innerHTML,/id="swatch-navy"/);
 const invalid={...saved,costumeId:'ao-ba-ba',event:'wedding',studioConfig:{...saved.studioConfig,costumeId:'ao-ba-ba',event:'wedding'}};
 app.context.invalid=invalid;assert.equal(app.run('normaliseStoredLook(invalid).studioConfig'),null);
 const url=app.window.VietPhucWebFeatures.sharedURL();assert.equal(JSON.parse(decodeURIComponent(new URL(url).hash.slice(6))).ci,'navy');
});
