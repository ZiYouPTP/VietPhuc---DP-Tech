// Complete-photo mapping, local lookbook and portable recipes.
(function(scope){
 'use strict';
 const $=id=>document.getElementById(id),compare=[],locale=scope.VietPhucLocale;
 const t=(key,params)=>locale.t(key,params),label=(kind,id)=>locale.label(kind,id);
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const download=(content,type,name)=>{
  const url=URL.createObjectURL(new Blob([content],{type})),link=document.createElement('a');
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 scope.renderCompareBoard=()=>{
  const el=$('compare-grid');if(!el)return;
  el.innerHTML=compare.length?compare.map((look,i)=>{
   const name=label('costume',look.costumeId);
   return '<article class="compare-look"><img src="'+escape(look.image)+'" alt="'+escape(name)+'" /><p>'+escape(name)+'<br>'+escape(label('body',look.gender))+' · '+escape(label('event',look.eventId))+'<br>'+escape(t(look.fallback?'ui.closest_complete_sample':'ui.matching_photo'))+'</p><button type="button" class="text-action" onclick="removeCompareLook('+i+')">'+t('ui.remove_look')+'</button></article>';
  }).join(''):'<p class="compare-empty">'+t('ui.no_comparison_looks_yet_add_two_or_three_looks_to_compare')+'</p>';
 };
 scope.removeCompareLook=index=>{if(Number.isInteger(index))compare.splice(index,1);scope.renderCompareBoard();};
 let comparing=false;
 scope.addCompareLook=async()=>{
  if(comparing)return;
  if(compare.length>=3){showToast(t('ui.three_looks_are_already_in_comparison_remove_one_to_add_another'));return;}
  comparing=true;
  try{
   const snap=await scope.VietPhucStudio?.captureSnapshot();if(!snap?.image){showToast(t('compare.preparing'));return;}
   const item=scope.VietPhucPhotoMapping?.resolve(snap.studioConfig);
   compare.push({image:snap.image,costumeId:snap.studioConfig.costumeId,gender:snap.studioConfig.body.gender,eventId:snap.outfitMeta.event,fallback:!!item?.fallback});
   scope.renderCompareBoard();showToast(t('ui.look_added_to_comparison'));
  }catch{showToast(t('compare.error'));}finally{comparing=false;}
 };
 scope.exportLookbook=async()=>{
  if(!state.lookbook.length){showToast(t('ui.save_at_least_one_look_before_exporting'));return;}
  const cards=(await Promise.all(state.lookbook.map(async look=>{
   let image=look.image;const labels=lookLabels(look);
   if(!image){try{image=await scope.VietPhucPhotoMapping?.exportPNG({...look.studioConfig,costumeId:look.costumeId,color:look.color,colorId:look.colorId,accessories:look.accessories,event:look.event});}catch{}}
   return '<article>'+(image?'<img src="'+escape(image)+'" alt="'+escape(labels.name)+'" />':'<p>'+t('export.noPhoto')+'</p>')+'<h2>'+escape(labels.name)+'</h2><p>'+escape(labels.event)+' · '+escape(labels.style)+' · '+escape(labels.date)+'</p><p>'+escape(t('export.color',{name:labels.color}))+'</p><p>'+t('export.accessoryNote')+'</p></article>';
  }))).join('');
  const html='<!doctype html><html lang="'+locale.getLanguage()+'"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+t('export.title')+'</title><style>body{font:16px system-ui;margin:0;padding:32px;color:#302826;background:#f5f0e7}main{max-width:1100px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}article{background:white;padding:16px;border-radius:16px;break-inside:avoid}img{width:100%;height:380px;object-fit:contain}h2{font-size:20px}p{line-height:1.7}@media print{body{background:white;padding:0}article{border:1px solid #ddd}}</style><main><h1>'+t('export.title')+'</h1><p>'+t('export.note')+'</p><div class="grid">'+cards+'</div></main></html>';
  download(html,'text/html;charset=utf-8','viet-phuc-lookbook.html');showToast(t('ui.photo_lookbook_exported_open_the_file_to_view_or_print_to_pdf'));
 };
 function recipe(){
  const config=scope.VietPhucStudio?.getConfig()||scope.VietPhucRemix.getOutfit(),meta=scope.VietPhucRemix.getOutfit();
  return {v:1,c:config.costumeId,g:config.body.gender,a:meta.accessories,h:meta.color,ci:meta.colorId,vi:meta.variantId,s:meta.style,e:meta.event};
 }
 function sharedURL(){const url=new URL(location.href);url.hash='look='+encodeURIComponent(JSON.stringify(recipe()));return url.href;}
 scope.shareLook=async()=>{
  try{
   const url=sharedURL();
   if(navigator.share)await navigator.share({title:'Việt phục Remix',text:t('share.text'),url});
   else if(navigator.clipboard){await navigator.clipboard.writeText(url);showToast(t('ui.look_link_copied'));}
   else {showToast(t('share.manual'));let input=$('share-link');if(!input){input=document.createElement('input');input.id='share-link';input.readOnly=true;input.setAttribute('data-i18n-aria-label','share.linkLabel');input.setAttribute('aria-label',t('share.linkLabel'));$('preview-card').append(input);}input.value=url;input.focus();input.select();}
  }catch(error){if(error.name!=='AbortError')showToast(t('share.error'));}
 };
 function readSharedLook(){
  if(!location.hash.startsWith('#look='))return;
  try{
   if(location.hash.length>2500)throw Error();
   const value=JSON.parse(decodeURIComponent(location.hash.slice(6)));
   if(value?.v!==1||!['male','female'].includes(value.g)||!COSTUMES.some(c=>c.id===value.c)||!/^#[\da-f]{6}$/i.test(value.h)||!LOOKBOOK_EVENT_IDS.includes(value.e)||!Object.hasOwn(LOOKBOOK_STYLE_NAMES,value.s)||!Array.isArray(value.a)||value.a.length>12||!compatibility.getCostumeAvailability(value.c,value.g,{event:value.e}).available)throw Error();
   const accessories=compatibility.sanitizeAccessories(value.a,{costumeId:value.c,gender:value.g});
   const config={costumeId:value.c,body:{gender:value.g},accessories,event:value.e,color:value.h};
   if(value.ci!=null&&typeof value.ci!=='string'||value.vi!=null&&typeof value.vi!=='string')throw Error();
   const colorId=safeColorSelection(value.ci,config);
   if(value.ci!=null&&value.ci!==colorId)throw Error();
   const matched=scope.VietPhucPhotoMapping?.resolve({...config,colorId,variantId:value.vi});
   if(value.vi!=null&&(matched?.sourceKind!=='recolor'||matched.variantId!==value.vi))throw Error();
   state.selectedCostume=value.c;state.selectedGender=value.g;state.selectedColor=value.h;state.selectedColorId=colorId;state.selectedVariantId=matched?.sourceKind==='recolor'?matched.variantId:null;state.selectedAccessories=new Set(accessories);state.selectedStyle=value.s;state.selectedEvent=value.e;
   state.accessoriesConfirmed=true;
   document.querySelectorAll('.event-btn').forEach(b=>b.classList.toggle('active',b.dataset.event===value.e));
   document.querySelectorAll('[name=style]').forEach(input=>input.checked=input.value===value.s);
   renderCostumePills();renderCostumeGrid(state.filterRegion);renderColorSwatches();generateOutfit();scope.VietPhucStudio?.restore(scope.VietPhucRemix.getOutfit());scrollToMixer();showToast(t('ui.shared_look_opened'));
  }catch{showToast(t('ui.invalid_look_link_you_can_still_choose_an_outfit'));}
 }
 const placeholder=key=>'<div class="source-placeholder"><strong>'+t(key)+'</strong><p>'+t('ui.todo_add_references_before_publishing_cultural_information_this_demo_currently_provides_su')+'</p><p>'+t('ui.sources_pending_verification_needed')+'</p></div>';
 // Curated knowledge is independent of cultural approval for specific photos.
 scope.renderTimeline=()=>{$('timeline').innerHTML=scope.VietPhucCulture?.renderHistory()||placeholder('ui.dress_history');};
 scope.renderCultureRules=()=>{$('rules-grid').innerHTML=scope.VietPhucCulture?.renderRules()||placeholder('ui.cultural_rules');};
 scope.renderRegions=()=>{$('regions-map').innerHTML=scope.VietPhucCulture?.renderRegions()||placeholder('ui.regional_dress');};
 scope.renderModernTrends=()=>{$('modern-grid').innerHTML=scope.VietPhucCulture?.renderModern()||placeholder('ui.contemporary_styles');};
 scope.addEventListener('vietphuc:language-change',()=>{scope.renderCompareBoard();scope.renderTimeline();scope.renderCultureRules();scope.renderRegions();scope.renderModernTrends();});
 document.addEventListener('DOMContentLoaded',()=>{
  scope.renderCompareBoard();readSharedLook();
 });
 scope.addEventListener('hashchange',readSharedLook);
 scope.VietPhucWebFeatures=Object.freeze({sharedURL,readSharedLook,getCompare:()=>compare.map(item=>({...item}))});
})(window);
