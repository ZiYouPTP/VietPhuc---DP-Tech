// Mapping uses complete supplied photos. No API, recolouring or layer warping.
(function(scope){
 'use strict';
 const data=scope.VietPhucPhotoMappingData||[],broken=new Set();
 const t=(key,params)=>scope.VietPhucLocale.t(key,params);
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const base=typeof document!=='undefined'?document.baseURI:'http://localhost/viet-phuc-remix/';
 const url=item=>new URL('../'+item.file,base).href;
 function resolve(config={}){
  const gender=config.body?.gender==='male'?'male':'female';
  if(gender==='male'&&!['ao-ngu-than','ao-giao-linh'].includes(config.costumeId))return null;
  const choices=data.filter(item=>item.gender===gender&&item.costumeId===config.costumeId&&!broken.has(item.key));
  const selected=[...new Set(config.accessories||[])].sort();
  const exact=choices.find(item=>item.accessories.length===selected.length&&item.accessories.every(id=>selected.includes(id)));
  const item=exact||choices.find(item=>item.accessories.length===0)||choices[0]||data.find(item=>item.gender===gender&&!item.accessories.length&&!broken.has(item.key));
  if(!item)return null;
  return {...item,src:url(item),exact:!!exact,fallback:!exact};
 }
 function draw(config={},lazy=false){
  const item=resolve(config);if(!item)return '';
  return '<img class="mapped-look-photo" src="'+escape(item.src)+'" alt="'+escape(t('photo.alt',{name:{key:'photo.'+item.key}}))+'" '+(lazy?'loading="lazy"':'fetchpriority="high"')+' decoding="async" data-photo-key="'+escape(item.key)+'" onerror="window.VietPhucPhotoMapping.recover(this)" />';
 }
 function recover(image){
  const key=image.dataset.photoKey;if(!data.some(item=>item.key===key)||broken.has(key))return;
  broken.add(key);scope.dispatchEvent(new CustomEvent('vietphuc:photo-error'));
 }
 async function exportPNG(config){
  let item=resolve(config);if(!item)throw new Error(t('photo.loadError'));
  const image=new Image();image.src=item.src;
  try{await image.decode();}catch{broken.add(item.key);item=resolve(config);if(!item)throw new Error(t('photo.loadError'));image.src=item.src;await image.decode();}
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=1240;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error(t('photo.exportUnsupported'));
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,960,1240);
  const scale=Math.min(900/image.naturalWidth,1180/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
  ctx.drawImage(image,(960-w)/2,(1240-h)/2,w,h);
  return canvas.toDataURL('image/png');
 }
 scope.VietPhucPhotoMapping=Object.freeze({resolve,draw,recover,exportPNG});
})(window);
