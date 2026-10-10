import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { BODY_PRESETS, drawBodyLook } from '../js/bodyCompositor.js';
import { COSTUME_DETAILS, MATERIAL_NAMES, PATTERN_NAMES, LAYER_ITEMS, buildLayerPrompt } from '../js/imagePrompt.js';
import { mergeLookLayers } from '../js/lookLayers.js';

// Run the real app and studio together: the selected body, garment label,
// rendered layer and exported metadata must agree after every transition.
class Control {
 constructor(){this.value='';this.innerHTML='';this.textContent='';this.hidden=true;this.dataset={};this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 addEventListener(type,callback){this.listeners[type]=callback;}
 emit(value,type='change'){this.value=value;return this.listeners[type]?.({target:this,currentTarget:this});}
 scrollIntoView(){}
 replaceChildren(){this.textContent='';}
}
const controls=new Map(),get=id=>{if(!controls.has(id))controls.set(id,new Control());return controls.get(id);};
get('studio-layer-item').value='ao-dai';
const listeners=new Map();
const win={addEventListener(type,callback){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(callback);},
 dispatchEvent(event){for(const callback of listeners.get(event.type)||[])callback(event);},showToast(){}};
const context=vm.createContext({window:win,document:{getElementById:get,querySelectorAll:()=>[],addEventListener(){}},
 localStorage:{getItem:()=>null,setItem(){}},structuredClone,performance:{now:()=>1},
 CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail;}},
 IntersectionObserver:class{observe(){}},setTimeout:()=>1,clearTimeout(){},
 BODY_PRESETS,drawBodyLook,COSTUME_DETAILS,MATERIAL_NAMES,PATTERN_NAMES,LAYER_ITEMS,buildLayerPrompt,mergeLookLayers,
 layersForLook:()=>[],getLayer:()=>null,loadLibrary:async()=>{},removeLayer:async()=>{},importLayer:async()=>{},
 bodyLookPNG:async config=>structuredClone(config),loadBodyDataURL:async()=>'',drawFallback:drawBodyLook,fallbackPNG:async()=>'',
 Image:class{async decode(){}}});
for(const path of ['../js/locales.js','../js/locale.js','../data.js','../js/bodyAvailabilityData.js','../js/compatibility.js','../app.js']){
 vm.runInContext(await readFile(new URL(path,import.meta.url),'utf8'),context);
}
const studio=(await readFile(new URL('../js/studio.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
vm.runInContext(studio,context);
const run=code=>vm.runInContext(code,context);
const check=async(id,gender)=>{
 const selected=win.VietPhucRemix.getOutfit(),rendered=win.VietPhucStudio.getConfig(),captured=await win.VietPhucStudio.captureSnapshot(true);
 assert.equal(selected.costumeId,id);assert.equal(rendered.costumeId,id);
 assert.equal(selected.body.gender,gender);assert.equal(rendered.body.gender,gender);
 assert.equal(captured.studioConfig.costumeId,id);assert.equal(captured.outfitMeta.costumeId,id);
 assert.equal(captured.studioConfig.body.gender,gender);assert.equal(captured.outfitMeta.body.gender,gender);
 assert.ok(get('studio-fallback').innerHTML.includes(`data-costume="${id}"`));
};
await check('ao-dai','female');
get('studio-gender').emit('male');
await check('ao-ngu-than','male');
assert.equal((get('costume-pills').innerHTML.match(/disabled aria-describedby="costume-body-status"/g)||[]).length,5);
for(const id of ['ao-dai','ao-ba-ba','ao-tu-than','ao-yem','ao-nhat-binh']){
 run(`selectCostumePill('${id}');selectAndMix('${id}');selectCostumeById('${id}')`);
 await check('ao-ngu-than','male');
}
run("selectCostumePill('ao-giao-linh')");
await check('ao-giao-linh','male');
win.VietPhucStudio.restore({body:{gender:'male'},costumeId:'ao-nhat-binh'});
await check('ao-ngu-than','male');
context.badLook={id:99,costumeId:'ao-dai',color:'#C0392B',accessories:[],studioConfig:{costumeId:'ao-dai',body:{gender:'male'}}};
run('state.lookbook=[badLook];restoreLook(99)');
await check('ao-ngu-than','male');
context.goodLook={id:100,costumeId:'ao-ngu-than',color:'#1A7A4C',accessories:[],studioConfig:{costumeId:'ao-ngu-than',body:{gender:'female'}}};
run('state.lookbook=[goodLook];restoreLook(100)');
await check('ao-ngu-than','female');
run("selectCostumePill('ao-ba-ba')");
await check('ao-ba-ba','female');
get('studio-gender').emit('male');
await check('ao-ngu-than','male');
console.log('Real app + studio: two male garments only, locked UI/handlers/restore, gender transitions and matching export metadata: PASS');
