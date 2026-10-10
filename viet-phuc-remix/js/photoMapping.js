// Browser adapter for the pure complete-outfit retrieval engine.
(function(scope){
 'use strict';
 const engine=scope.VietPhucMatching?.getEngine(scope.VietPhucOutfitCatalogData);
 const t=(key,params)=>scope.VietPhucLocale.t(key,params);
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const base=typeof document!=='undefined'&&document.baseURI||'http://localhost/viet-phuc-remix/';
 function search(config={}){return engine?.search(config)||{status:'empty',best:null,candidates:[],errors:[],excluded:[]};}
 function resolve(config={}){
  const result=search(config),item=result.best;
  return item?{...item,src:new URL('../'+item.file,base).href,matchStatus:result.status,
   noteKey:item.fallback?'matching.reference':item.sourceKind==='recolor'?'color.approvedVariant':'color.originalPhoto'}:null;
 }
 function getColorOptions(config={}){
  const keys={'outside-demo-profile':'color.outsideDemo','event-not-supported':'color.outsideDemo','outside-event-demo':'matching.outside-event-demo','color-unreviewed':'color.unreviewed','color-limit':'color.limit','image-unavailable':'color.imageUnavailable'};
  return (engine?.colorOptions(config)||[]).map(color=>({...color,reason:color.available?'':t(Object.hasOwn(keys,color.code)?keys[color.code]:'color.noApprovedImage')}));
 }
 function draw(config={},lazy=false){
  const item=resolve(config);if(!item)return '';
  return '<img class="mapped-look-photo" src="'+escape(item.src)+'" alt="'+escape(t('photo.alt',{name:{key:'photo.'+item.key}}))+'" width="'+item.width+'" height="'+item.height+'" '+(lazy?'loading="lazy"':'fetchpriority="high"')+' decoding="async" data-photo-key="'+escape(item.key)+'" data-combination-id="'+escape(item.combinationId)+'" data-asset-id="'+escape(item.assetId)+'" data-source-kind="'+escape(item.sourceKind)+'" data-variant-id="'+escape(item.variantId||'')+'" data-source-combination-id="'+escape(item.sourceCombinationId||item.combinationId)+'" data-color-id="'+escape(item.primaryColorId||'')+'" data-costume="'+escape(item.costumeId)+'" data-gender="'+escape(item.gender)+'" data-match-status="'+item.matchStatus+'" data-match-score="'+item.score+'" onerror="window.VietPhucPhotoMapping.recover(this)" />';
 }
 function describe(result){
  if(!result?.best)return t(result?.status==='invalid'?'matching.invalid':'matching.empty');
  const item=result.best,parts=[t(item.exact?'matching.exact':'matching.reference'),t('matching.score',{score:item.score})];
  for(const difference of item.differences){
   if(difference.ids)parts.push(t('matching.'+difference.code,{names:{keys:difference.ids.map(id=>'accessory.'+id)}}));
   else if(difference.code==='color-different')parts.push(t('matching.color-different',{requested:{key:'color.id.'+difference.requested},actual:item.primaryColorId?{key:'color.id.'+item.primaryColorId}:{key:'matching.unknown'}}));
   else parts.push(t('matching.'+difference.code));
  }
  return parts.join(' · ');
 }
 function insights(result){
  if(!result?.best)return '<p class="matching-empty" role="status">'+escape(describe(result))+'</p>';
  const item=result.best,warningText=item.warnings.map(w=>t('matching.'+w.code));
  return '<div class="matching-insights" data-status="'+result.status+'"><strong>'+escape(describe(result))+'</strong>'
   +'<p>'+escape(t('matching.actualPhoto',{name:{key:'costume.'+item.costumeId},color:item.primaryColorId?{key:'color.id.'+item.primaryColorId}:{key:'matching.unknown'}}))+'</p>'
   +'<details><summary>'+escape(t('matching.why'))+'</summary><p>'+escape(t('matching.formula'))+'</p><ul>'
   +item.breakdown.map(b=>'<li>'+escape(t('matching.field.'+b.field))+' · '+escape(t('matching.weight',{weight:b.weight,value:Math.round(b.value*100)}))+'</li>').join('')
   +'</ul><p>'+escape(t('matching.scope'))+'</p>'
   +(warningText.length?'<ul class="matching-warnings">'+warningText.map(w=>'<li>'+escape(w)+'</li>').join('')+'</ul>':'')+'</details></div>';
 }
 function recover(image){
  const key=image.dataset.photoKey;
  if(typeof key!=='string'||image.dataset.recoveryAttempted)return;
  image.dataset.recoveryAttempted='true';engine?.markUnavailable(key);
  scope.dispatchEvent(new CustomEvent('vietphuc:photo-error'));
 }
 async function exportPNG(config){
  let item=resolve(config);if(!item)throw new Error(t('matching.empty'));
  const image=new Image();
  while(item){
   image.src=item.src;
   try{await image.decode();break;}catch{
    engine?.markUnavailable(item.key);scope.dispatchEvent(new CustomEvent('vietphuc:photo-error'));item=resolve(config);
   }
  }
  if(!item)throw new Error(t('matching.empty'));
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=1240;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error(t('photo.exportUnsupported'));
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,960,1240);
  const scale=Math.min(900/image.naturalWidth,1180/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
  ctx.drawImage(image,(960-w)/2,(1240-h)/2,w,h);
  return canvas.toDataURL('image/png');
 }
 scope.VietPhucPhotoMapping=Object.freeze({search,resolve,draw,recover,exportPNG,getColorOptions,describe,insights});
})(typeof window!=='undefined'?window:globalThis);
