import { BODY_PRESETS, drawBodyLook, bodyLookPNG, loadBodyDataURL } from './bodyCompositor.js';
import { COSTUME_DETAILS, MATERIAL_NAMES, PATTERN_NAMES, LAYER_ITEMS, buildLayerPrompt } from './imagePrompt.js';
import { loadLibrary, getLayer, layersForLook, importLayer, removeLayer } from './layerLibrary.js';
import { drawFallback, fallbackPNG } from './fallback2d.js';
import { mergeLookLayers } from './lookLayers.js';
const $=id=>document.getElementById(id), rules=window.VietPhucCompatibility, startedAt=performance.now();
const t=(key,params)=>window.VietPhucLocale.t(key,params);
let config={costumeId:'ao-dai',color:'#C0392B',material:'silk',pattern:'plain',patternScale:1,patternStrength:.45,body:{gender:'female'},accessories:[]};
let disposed=false,bodyFailed=false,revision=0;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const layerKey=id=>Object.hasOwn(COSTUME_DETAILS,id)?'costume.'+id:['trousers','inner-yem'].includes(id)?'layer.'+id:'accessory.'+id;
const options=(items,kind)=>Object.keys(items).map(id=>'<option value="'+id+'">'+escape(t(kind==='layer'?layerKey(id):kind+'.'+id))+'</option>').join('');
$('studio-material').innerHTML=options(MATERIAL_NAMES,'material');$('studio-pattern').innerHTML=options(PATTERN_NAMES,'pattern');
$('studio-layer-item').innerHTML=options(LAYER_ITEMS,'layer');
function sanitize(next){
 let gender=next.body?.gender==='male'?'male':'female', costumeId=rules.sanitizeCostume(next.costumeId,gender);
 if(!costumeId){gender='female';costumeId=rules.sanitizeCostume(next.costumeId,gender);}
 const accessories=rules.sanitizeAccessories(next.accessories,{costumeId,gender});
 return {...next,costumeId,body:{gender},accessories,slots:{outer:costumeId,bottom:'trousers',inner:costumeId==='ao-tu-than'?'inner-yem':null,...rules.toStudioSlots(accessories,costumeId)}};
}
function snapshotConfig(){return structuredClone({...config,imageLayers:mergeLookLayers(config,layersForLook(config))});}
function replaceSavedLayer(gender,id,layer){config.imageLayers=(config.imageLayers||[]).filter(item=>item.gender!==gender||item.id!==id);if(layer)config.imageLayers.push(layer);}
function layerStatus(message){$('studio-layer-status').textContent=message;}
function updateLayerStatus(){
 const id=$('studio-layer-item').value,layer=getLayer(config.body.gender,id);
 $('studio-layer-remove').disabled=!layer;
 layerStatus(t('legacy.layerStatus',{name:{key:layerKey(id)},gender:{key:'gender.'+config.body.gender},status:{key:layer?(layer.persisted===false?'legacy.pngSession':'legacy.pngReady'):'legacy.pngMissing'}}));
}
function syncLayerItems(){
 const selector=$('studio-layer-item');let selected=selector.value;
 if(Object.hasOwn(COSTUME_DETAILS,selected)&&!rules.getCostumeAvailability(selected,config.body.gender).available)selected=config.costumeId;
 selector.innerHTML=Object.keys(LAYER_ITEMS).map(id=>'<option value="'+id+'"'+(Object.hasOwn(COSTUME_DETAILS,id)&&!rules.getCostumeAvailability(id,config.body.gender).available?' disabled':'')+'>'+escape(t(layerKey(id)))+'</option>').join('');
 selector.value=Object.hasOwn(LAYER_ITEMS,selected)?selected:config.costumeId;
}
function render(){
 if(disposed)return;const start=performance.now(),next=snapshotConfig();
 const mapped=window.VietPhucPhotoMapping?.resolve(next);
 $('studio-fallback').innerHTML=mapped?window.VietPhucPhotoMapping.draw(next):bodyFailed?drawFallback(next):drawBodyLook(next);
 $('studio-fallback').dataset.renderer=mapped?'photo-mapping-2d':'body-compositor-2d';$('studio-fallback').dataset.renderMs=String(Math.round(performance.now()-start));
 $('studio-status').textContent=mapped?t('photo.status',{name:{key:'photo.'+mapped.key}}):bodyFailed?t('photo.fallback'):t('photo.bodyFallback',{gender:{key:'gender.'+config.body.gender}});
 $('studio-metrics').textContent=mapped?(mapped.exact?t('ui.a_matching_photo_is_available'):t('photo.missingCombination',{name:{key:'photo.'+mapped.key}})):(next.imageLayers.length?t('photo.layers',{count:next.imageLayers.length}):t('photo.unavailable'));
 $('studio-loading').hidden=true;syncLayerItems();updateLayerStatus();
 if(!$('studio-prompt-panel').hidden)$('studio-prompt-text').value=buildLayerPrompt(config,$('studio-layer-item').value);
}
function sync(){for(const [id,value] of [['studio-gender',config.body.gender],['mixer-gender',config.body.gender],['studio-material',config.material],['studio-pattern',config.pattern],['studio-scale',config.patternScale],['studio-strength',config.patternStrength]])if($(id))$(id).value=value;}
function applyOutfit(detail){
 const changed=config.costumeId!==detail.costumeId;
 config=sanitize({...config,...detail,material:changed?COSTUME_DETAILS[detail.costumeId]?.material||'silk':config.material});
 if(changed)$('studio-layer-item').value=config.costumeId;revision++;sync();render();
}
window.addEventListener('vietphuc:outfit-change',event=>applyOutfit(event.detail));
for(const [id,key] of [['studio-material','material'],['studio-pattern','pattern']])$(id).addEventListener('change',event=>{config[key]=event.target.value;revision++;render();});
for(const [id,key] of [['studio-scale','patternScale'],['studio-strength','patternStrength']])$(id).addEventListener('input',event=>{config[key]=Number(event.target.value);revision++;render();});
$('studio-gender').addEventListener('change',event=>{config=sanitize({...config,body:{gender:event.target.value}});bodyFailed=false;revision++;window.VietPhucRemix.setGender?.(config.body.gender,config.costumeId);sync();render();refreshIllustrations();});
$('studio-layer-item').addEventListener('change',()=>{updateLayerStatus();if(!$('studio-prompt-panel').hidden)$('studio-prompt-text').value=buildLayerPrompt(config,$('studio-layer-item').value);});
function download(data,filename){
 const bytes=Uint8Array.from(atob(data.split(',')[1]),char=>char.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
 const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
async function captureSnapshot(transparent=false){
 const captured=snapshotConfig(),outfitMeta=structuredClone(window.VietPhucRemix.getOutfit());let image;
 try{image=window.VietPhucPhotoMapping?.resolve(captured)?await window.VietPhucPhotoMapping.exportPNG(captured):await bodyLookPNG(captured,transparent);}catch{image=await fallbackPNG(captured,transparent);window.showToast(t('photo.exportFallback'));}
 return {image,studioConfig:captured,outfitMeta};
}
$('studio-capture').addEventListener('click',async event=>{
 const button=event.currentTarget;button.disabled=true;
 try{const snapshot=await captureSnapshot($('studio-transparent').checked);download(snapshot.image,'viet-phuc-'+snapshot.studioConfig.costumeId+'-'+snapshot.studioConfig.body.gender+'.png');await window.saveLook(snapshot);}
 catch{window.showToast(t('photo.exportError'));}finally{button.disabled=false;}
});
$('studio-reference').addEventListener('click',async event=>{
 const gender=config.body.gender,button=event.currentTarget;button.disabled=true;
 try{download(await loadBodyDataURL(gender),'body-'+gender+'-tham-chieu.png');}catch{window.showToast(t('legacy.bodyError'));}finally{button.disabled=false;}
});
$('studio-prompt').addEventListener('click',()=>{$('studio-prompt-panel').hidden=false;$('studio-prompt-text').value=buildLayerPrompt(config,$('studio-layer-item').value);});
$('studio-copy-prompt').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText($('studio-prompt-text').value);window.showToast(t('legacy.promptCopied'));}
 catch{$('studio-prompt-text').focus();$('studio-prompt-text').select();window.showToast(t('legacy.promptManual'));}
});
$('studio-layer-file').addEventListener('change',async event=>{
 const input=event.target,file=input.files?.[0];if(!file)return;const gender=config.body.gender,id=$('studio-layer-item').value;input.disabled=true;
 if(Object.hasOwn(COSTUME_DETAILS,id)&&!rules.getCostumeAvailability(id,gender).available){layerStatus(rules.getCostumeAvailability(id,gender).reason);input.value='';input.disabled=false;return;}
 try{const layer=await importLayer(file,gender,id);replaceSavedLayer(gender,id,layer);revision++;render();refreshIllustrations();layerStatus(t('legacy.imported',{name:{key:layerKey(id)},gender:{key:'gender.'+gender},note:layer.persisted===false?{key:'legacy.sessionNote'}:''}));}
 catch(error){layerStatus(error.message||t('legacy.pngError'));}finally{input.value='';input.disabled=false;}
});
$('studio-layer-remove').addEventListener('click',async()=>{const gender=config.body.gender,id=$('studio-layer-item').value;try{await removeLayer(gender,id);replaceSavedLayer(gender,id);revision++;render();refreshIllustrations();}catch(error){layerStatus(error.message);}});
function refreshIllustrations(){
 document.querySelectorAll('[data-costume-illustration]').forEach(el=>{el.innerHTML=window.VietPhucIllustration(el.dataset.costumeIllustration);});
 window.dispatchEvent(new CustomEvent('vietphuc:illustrations-ready'));
}
window.VietPhucIllustration=(costumeId,color,gender=config.body.gender)=>{
 if(!rules.getCostumeAvailability(costumeId,gender).available)gender='female';
 const look=sanitize({costumeId,color:color||'#C0392B',body:{gender},accessories:[],material:COSTUME_DETAILS[costumeId]?.material,pattern:'plain'});
 return window.VietPhucPhotoMapping?.draw(look,true)||drawBodyLook({...look,imageLayers:layersForLook(look)});
};
window.VietPhucStudio={captureSnapshot,getConfig:()=>structuredClone(config),restore(next){config=sanitize({...config,...next});window.VietPhucRemix.setGender?.(config.body.gender,config.costumeId);revision++;sync();render();refreshIllustrations();},getMetrics:()=>({mode:'2d',revision,layers:layersForLook(config).length}),dispose(){disposed=true;}};
applyOutfit(window.VietPhucRemix.getOutfit());refreshIllustrations();
Promise.all(Object.keys(BODY_PRESETS).map(async gender=>{const image=new Image();image.src=BODY_PRESETS[gender].src;await image.decode();})).then(()=>{$('studio-fallback').dataset.readyMs=String(Math.round(performance.now()-startedAt));}).catch(()=>{bodyFailed=true;render();});
if(!window.VietPhucPhotoMapping)loadLibrary().then(()=>{render();refreshIllustrations();}).catch(()=>{});
window.addEventListener('vietphuc:photo-error',()=>{render();refreshIllustrations();});
window.addEventListener('vietphuc:language-change',()=>{render();refreshIllustrations();});
window.addEventListener('pagehide',()=>{disposed=true;},{once:true});
