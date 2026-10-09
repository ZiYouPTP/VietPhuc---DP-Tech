import { BODY_PRESETS, drawBodyLook, bodyLookPNG, loadBodyDataURL } from './bodyCompositor.js';
import { COSTUME_DETAILS, MATERIAL_NAMES, PATTERN_NAMES, LAYER_ITEMS, buildLayerPrompt } from './imagePrompt.js';
import { loadLibrary, getLayer, layersForLook, importLayer, removeLayer } from './layerLibrary.js';
import { drawFallback, fallbackPNG } from './fallback2d.js';
import { mergeLookLayers } from './lookLayers.js';
const $=id=>document.getElementById(id), rules=window.VietPhucCompatibility, startedAt=performance.now();
let config={costumeId:'ao-dai',color:'#C0392B',material:'silk',pattern:'plain',patternScale:1,patternStrength:.45,body:{gender:'female'},accessories:[]};
let disposed=false,bodyFailed=false,revision=0;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options=items=>Object.entries(items).map(([id,name])=>'<option value="'+id+'">'+escape(name)+'</option>').join('');
$('studio-material').innerHTML=options(MATERIAL_NAMES);$('studio-pattern').innerHTML=options(PATTERN_NAMES);
$('studio-layer-item').innerHTML=options(Object.fromEntries(Object.entries(LAYER_ITEMS).map(([id,item])=>[id,item.name])));
function sanitize(next){
 const costumeId=Object.hasOwn(COSTUME_DETAILS,next.costumeId)?next.costumeId:'ao-dai', accessories=rules.sanitizeAccessories(next.accessories,{costumeId});
 return {...next,costumeId,body:{gender:next.body?.gender==='male'?'male':'female'},accessories,slots:{outer:costumeId,bottom:'trousers',inner:costumeId==='ao-tu-than'?'inner-yem':null,...rules.toStudioSlots(accessories,costumeId)}};
}
function snapshotConfig(){return structuredClone({...config,imageLayers:mergeLookLayers(config,layersForLook(config))});}
function replaceSavedLayer(gender,id,layer){config.imageLayers=(config.imageLayers||[]).filter(item=>item.gender!==gender||item.id!==id);if(layer)config.imageLayers.push(layer);}
function layerStatus(message){$('studio-layer-status').textContent=message;}
function updateLayerStatus(){
 const id=$('studio-layer-item').value,layer=getLayer(config.body.gender,id);
 $('studio-layer-remove').disabled=!layer;
 layerStatus(LAYER_ITEMS[id].name+' · body '+BODY_PRESETS[config.body.gender].label.toLowerCase()+': '+(layer?'đã có PNG'+(layer.persisted===false?' (giữ trong phiên)':''):'chưa có PNG, đang dùng minh họa')+'.');
}
function render(){
 if(disposed)return;const start=performance.now(),next=snapshotConfig();
 $('studio-fallback').innerHTML=bodyFailed?drawFallback(next):drawBodyLook(next);
 $('studio-fallback').dataset.renderer='body-compositor-2d';$('studio-fallback').dataset.renderMs=String(Math.round(performance.now()-start));
 $('studio-status').textContent=bodyFailed?'Minh họa dự phòng':'Ghép ảnh 2D · body '+BODY_PRESETS[config.body.gender].label.toLowerCase();
 $('studio-metrics').textContent=next.imageLayers.length?next.imageLayers.length+' lớp PNG đang dùng.':'Đang dùng lớp minh họa.';
 $('studio-loading').hidden=true;updateLayerStatus();
 if(!$('studio-prompt-panel').hidden)$('studio-prompt-text').value=buildLayerPrompt(config,$('studio-layer-item').value);
}
function sync(){for(const [id,value] of [['studio-gender',config.body.gender],['studio-material',config.material],['studio-pattern',config.pattern],['studio-scale',config.patternScale],['studio-strength',config.patternStrength]])$(id).value=value;}
function applyOutfit(detail){
 const changed=config.costumeId!==detail.costumeId;
 config=sanitize({...config,...detail,material:changed?COSTUME_DETAILS[detail.costumeId]?.material||'silk':config.material});
 if(changed)$('studio-layer-item').value=config.costumeId;revision++;sync();render();
}
window.addEventListener('vietphuc:outfit-change',event=>applyOutfit(event.detail));
for(const [id,key] of [['studio-material','material'],['studio-pattern','pattern']])$(id).addEventListener('change',event=>{config[key]=event.target.value;revision++;render();});
for(const [id,key] of [['studio-scale','patternScale'],['studio-strength','patternStrength']])$(id).addEventListener('input',event=>{config[key]=Number(event.target.value);revision++;render();});
$('studio-gender').addEventListener('change',event=>{config.body.gender=event.target.value;bodyFailed=false;revision++;render();refreshIllustrations();});
$('studio-layer-item').addEventListener('change',()=>{updateLayerStatus();if(!$('studio-prompt-panel').hidden)$('studio-prompt-text').value=buildLayerPrompt(config,$('studio-layer-item').value);});
function download(data,filename){
 const bytes=Uint8Array.from(atob(data.split(',')[1]),char=>char.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
 const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
async function captureSnapshot(transparent=false){
 const captured=snapshotConfig(),outfitMeta=structuredClone(window.VietPhucRemix.getOutfit());let image;
 try{image=await bodyLookPNG(captured,transparent);}catch{image=await fallbackPNG(captured,transparent);window.showToast('Không tải được body hoặc lớp ảnh. Đã xuất minh họa dự phòng.');}
 return {image,studioConfig:captured,outfitMeta};
}
$('studio-capture').addEventListener('click',async event=>{
 const button=event.currentTarget;button.disabled=true;
 try{const snapshot=await captureSnapshot($('studio-transparent').checked);download(snapshot.image,'viet-phuc-'+snapshot.studioConfig.costumeId+'-'+snapshot.studioConfig.body.gender+'.png');await window.saveLook(snapshot);}
 catch{window.showToast('Chưa xuất được ảnh. Hãy thử lại.');}finally{button.disabled=false;}
});
$('studio-reference').addEventListener('click',async event=>{
 const gender=config.body.gender,button=event.currentTarget;button.disabled=true;
 try{download(await loadBodyDataURL(gender),'body-'+gender+'-tham-chieu.png');}catch{window.showToast('Chưa tải được body. Kiểm tra assets/base_bodies.');}finally{button.disabled=false;}
});
$('studio-prompt').addEventListener('click',()=>{$('studio-prompt-panel').hidden=false;$('studio-prompt-text').value=buildLayerPrompt(config,$('studio-layer-item').value);});
$('studio-copy-prompt').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText($('studio-prompt-text').value);window.showToast('Đã sao chép prompt. Đính kèm body gốc trong công cụ AI.');}
 catch{$('studio-prompt-text').focus();$('studio-prompt-text').select();window.showToast('Nhấn Ctrl/Cmd+C để sao chép prompt.');}
});
$('studio-layer-file').addEventListener('change',async event=>{
 const input=event.target,file=input.files?.[0];if(!file)return;const gender=config.body.gender,id=$('studio-layer-item').value;input.disabled=true;
 try{const layer=await importLayer(file,gender,id);replaceSavedLayer(gender,id,layer);revision++;render();refreshIllustrations();layerStatus('Đã nhập '+LAYER_ITEMS[id].name+' cho body '+BODY_PRESETS[gender].label.toLowerCase()+'.'+(layer.persisted===false?' Ảnh giữ trong phiên; bộ nhớ không khả dụng.':''));}
 catch(error){layerStatus(error.message||'Không đọc được PNG.');}finally{input.value='';input.disabled=false;}
});
$('studio-layer-remove').addEventListener('click',async()=>{const gender=config.body.gender,id=$('studio-layer-item').value;try{await removeLayer(gender,id);replaceSavedLayer(gender,id);revision++;render();refreshIllustrations();}catch(error){layerStatus(error.message);}});
function refreshIllustrations(){
 document.querySelectorAll('[data-costume-illustration]').forEach(el=>{el.innerHTML=window.VietPhucIllustration(el.dataset.costumeIllustration);});
 window.dispatchEvent(new CustomEvent('vietphuc:illustrations-ready'));
}
window.VietPhucIllustration=(costumeId,color,gender=config.body.gender)=>{
 const look=sanitize({costumeId,color:color||'#C0392B',body:{gender},accessories:[],material:COSTUME_DETAILS[costumeId]?.material,pattern:'plain'});
 return drawBodyLook({...look,imageLayers:layersForLook(look)});
};
window.VietPhucStudio={captureSnapshot,getConfig:()=>structuredClone(config),restore(next){config=sanitize({...config,...next});revision++;sync();render();},getMetrics:()=>({mode:'2d',revision,layers:layersForLook(config).length}),dispose(){disposed=true;}};
applyOutfit(window.VietPhucRemix.getOutfit());refreshIllustrations();
Promise.all(Object.keys(BODY_PRESETS).map(async gender=>{const image=new Image();image.src=BODY_PRESETS[gender].src;await image.decode();})).then(()=>{$('studio-fallback').dataset.readyMs=String(Math.round(performance.now()-startedAt));}).catch(()=>{bodyFailed=true;render();});
loadLibrary().then(()=>{render();refreshIllustrations();}).catch(()=>{});
window.addEventListener('pagehide',()=>{disposed=true;},{once:true});
