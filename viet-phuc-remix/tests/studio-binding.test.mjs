import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { BODY_PRESETS, drawBodyLook } from '../js/bodyCompositor.js';
import { mergeLookLayers } from '../js/lookLayers.js';
import { COSTUME_DETAILS, MATERIAL_NAMES, PATTERN_NAMES, LAYER_ITEMS, buildLayerPrompt } from '../js/imagePrompt.js';
class Control {
 constructor(){this.value='';this.innerHTML='';this.hidden=true;this.listeners={};this.dataset={};}
 addEventListener(name,fn){this.listeners[name]=fn;}
 emit(value,type='change'){this.value=value;return this.listeners[type]?.({target:this,currentTarget:this});}
}
const controls=new Map(),get=id=>{if(!controls.has(id))controls.set(id,new Control());return controls.get(id);};
get('studio-layer-item').value='ao-dai';
const events={};let metadata={costumeId:'ao-dai',color:'#C0392B',accessories:[],style:'traditional',event:'festival'};
const win={addEventListener:(name,fn)=>events[name]=fn,dispatchEvent:event=>events[event.type]?.(event),VietPhucRemix:{getOutfit:()=>structuredClone(metadata)},showToast(){}};
for(const path of ['../js/locales.js','../js/locale.js'])vm.runInNewContext(await readFile(new URL(path,import.meta.url),'utf8'),{window:win});
vm.runInNewContext(await readFile(new URL('../js/compatibility.js',import.meta.url),'utf8'),{window:win});
vm.runInNewContext(await readFile(new URL('../js/bodyAvailabilityData.js',import.meta.url),'utf8'),{window:win});
const layer={id:'ao-ngu-than',gender:'male',src:'data:image/png;base64,fixture',zIndex:30};
const layersForLook=config=>config.body.gender==='male'&&config.costumeId==='ao-ngu-than'?[layer]:[];
const context=vm.createContext({window:win,document:{getElementById:get,querySelectorAll:()=>[]},structuredClone,performance:{now:()=>1},
 BODY_PRESETS,drawBodyLook,mergeLookLayers,COSTUME_DETAILS,MATERIAL_NAMES,PATTERN_NAMES,LAYER_ITEMS,buildLayerPrompt,
 layersForLook,loadLibrary:async()=>{},getLayer:()=>null,importLayer:async()=>{},removeLayer:async()=>{},
 bodyLookPNG:async config=>structuredClone(config),loadBodyDataURL:async()=>'',drawFallback:drawBodyLook,fallbackPNG:async()=>'',Image:class{async decode(){}},
 CustomEvent:class{constructor(type){this.type=type;}},setTimeout,URL,Blob});
const source=(await readFile(new URL('../js/studio.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
vm.runInContext(source,context);
await get('studio-gender').emit('male');
assert.ok(get('studio-fallback').innerHTML.includes('base_body_1.png'));
const task=win.VietPhucStudio.captureSnapshot(true);
metadata={...metadata,costumeId:'ao-yem',color:'#1A7A4C',style:'fusion'};
events['vietphuc:outfit-change']({detail:metadata});
const captured=await task;
assert.equal(captured.image.costumeId,'ao-ngu-than');
assert.equal(captured.studioConfig.body.gender,'male');
assert.equal(captured.studioConfig.imageLayers[0].id,'ao-ngu-than');
assert.equal(captured.outfitMeta.style,'traditional','Capture must freeze app metadata before awaiting export');
assert.ok(get('studio-fallback').innerHTML.includes('data-costume="ao-ngu-than"'),'Male outfit events must sanitize female-only garments');
assert.ok(!get('studio-fallback').innerHTML.includes('data-costume="ao-yem"'));
await get('studio-prompt').emit('','click');
assert.ok(get('studio-prompt-text').value.includes('MỘT món đồ'));
assert.ok(get('studio-prompt-text').value.includes('base_body_1.png'));
assert.equal(get('studio-fallback').dataset.renderer,'body-compositor-2d');
assert.ok(!source.includes("import('./viewer.js')"),'The active studio must not load Three or its viewer');
win.VietPhucStudio.restore(captured.studioConfig);
assert.equal(win.VietPhucStudio.getConfig().costumeId,'ao-ngu-than');

// Saved pixels must survive editing while stale or wrong-body layers stay hidden.
const savedLayer={...layer,src:'data:image/png;base64,c2F2ZWQ='};
win.VietPhucStudio.restore({...captured.studioConfig,imageLayers:[
 savedLayer,{...layer,id:'non-la',zIndex:60},{...layer,id:'ao-ba-ba'},
 {...layer,gender:'female',src:'data:image/png;base64,ZmVtYWxl'},
]});
const cleanSnapshot=await win.VietPhucStudio.captureSnapshot(true);
assert.deepEqual(Array.from(cleanSnapshot.studioConfig.imageLayers,item=>item.id),['ao-ngu-than'],'Only selected items for the current body may be exported');
assert.equal(cleanSnapshot.studioConfig.imageLayers[0].src,savedLayer.src,'Saved pixels must take precedence over the current library');
win.VietPhucStudio.restore(cleanSnapshot.studioConfig);
metadata={costumeId:'ao-ngu-than',color:'#1A7A4C',accessories:['bong-tai'],style:'fusion',event:'school'};
events['vietphuc:outfit-change']({detail:metadata});
const edited=await win.VietPhucStudio.captureSnapshot(true);
assert.equal(edited.studioConfig.color,'#1A7A4C');
assert.equal(edited.studioConfig.imageLayers[0].src,savedLayer.src,'Changing color/accessories must retain the matching saved garment PNG');
await get('studio-gender').emit('female');
assert.equal((await win.VietPhucStudio.captureSnapshot(true)).studioConfig.imageLayers.length,0,'A male snapshot cannot be rendered on the female body');
await get('studio-gender').emit('male');
assert.equal((await win.VietPhucStudio.captureSnapshot(true)).studioConfig.imageLayers[0].src,savedLayer.src,'Switching back must recover the saved layer');
win.VietPhucStudio.restore({costumeId:'ao-dai',body:{gender:'male'},imageLayers:[{...savedLayer,id:'ao-dai'}]});
assert.equal(win.VietPhucStudio.getConfig().costumeId,'ao-ngu-than','Direct restore must not bypass the male policy');
assert.ok(!(await win.VietPhucStudio.captureSnapshot(true)).studioConfig.imageLayers.some(item=>item.id==='ao-dai'));
for(const costumeId of ['ao-ngu-than','ao-giao-linh']){
 win.VietPhucStudio.restore({costumeId,body:{gender:'male'}});
 assert.equal(win.VietPhucStudio.getConfig().costumeId,costumeId);
}
assert.equal((get('studio-layer-item').innerHTML.match(/ disabled/g)||[]).length,5,'Male layer selector must lock the other five garments');
console.log('2D body selection, independent image layers, frozen capture, prompt, restore, saved-layer precedence and stale-layer filtering: PASS');
