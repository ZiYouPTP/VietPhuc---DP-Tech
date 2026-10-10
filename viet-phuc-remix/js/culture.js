// Source-linked knowledge views; matching and photo approval stay separate.
(function(scope){
 'use strict';
 const data=scope.VietPhucCultureData,locale=scope.VietPhucLocale;
 if(!data||!locale)return;
 const t=(key,params)=>locale.t(key,params);
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const getProfile=id=>data.profiles.find(profile=>profile.id===id)||null;
 const text=(id,field)=>getProfile(id)?t('culture.profile.'+id+'.'+field):'';
 function sourceURL(value){
  try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}
 }
 function sourceLink(id,full=false){
  const source=data.sources.find(row=>row.id===id),url=sourceURL(source?.url);
  if(!source||!url)return '';
  const label=full?source.publisher+' · '+source.title:'['+(data.sources.indexOf(source)+1)+']';
  return '<a class="culture-source" href="'+escape(url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+escape(t('culture.sourceLabel',{publisher:source.publisher}))+'" title="'+escape(source.title)+'">'+escape(label)+'</a>';
 }
 const citations=row=>(row?.sourceIds||[]).map(id=>sourceLink(id)).join(' ');
 const badge=profile=>'<span class="culture-status">'+escape(t(profile.status==='reference'?'culture.reference':'culture.compared'))+'</span>';
 function section(profile,field){
  return '<section class="culture-detail-section"><h3>'+escape(t('culture.'+field))+'</h3><p>'+escape(text(profile.id,field))+' '+citations(profile[field])+'</p></section>';
 }
 function accessoryNotes(ids=[]){
  const notes=data.accessories.filter(item=>ids.includes(item.id));
  if(!notes.length)return '';
  return '<section class="culture-detail-section"><h3>'+escape(t('culture.accessories'))+'</h3><ul>'+notes.map(item=>'<li><strong>'+escape(locale.label('accessory',item.id))+':</strong> '+escape(t('culture.accessory.'+item.id+'.note'))+' '+citations(item.note)+'</li>').join('')+'</ul></section>';
 }
 function detail(id,{compact=false,accessoryIds=[]}={}){
  const profile=getProfile(id);if(!profile)return '';
  const fields=['history','construction','materials','usage','uncertainty'];
  const sourceIds=[...new Set(['summary',...fields].flatMap(field=>profile[field]?.sourceIds||[]))];
  const photoNote='<p class="culture-photo-note">'+escape(t('culture.photoNote'))+'</p>';
  const body=photoNote+fields.map(field=>section(profile,field)).join('')+accessoryNotes(accessoryIds)+
   '<section class="culture-detail-section"><h3>'+escape(t('culture.sources'))+'</h3><ul class="culture-source-list">'+sourceIds.map(sourceId=>'<li>'+sourceLink(sourceId,true)+'</li>').join('')+'</ul></section>';
  return '<article class="culture-profile" data-culture-profile="'+escape(id)+'">'+badge(profile)+
   '<p>'+escape(text(id,'summary'))+' '+citations(profile.summary)+'</p>'+
   (compact?'<details><summary>'+escape(t('culture.readMore'))+'</summary>'+body+'</details>':body)+'</article>';
 }
 function profileCard(profile,field='history'){
  return '<article class="culture-knowledge-card">'+badge(profile)+'<h3>'+escape(locale.label('costume',profile.id))+'</h3><p>'+escape(text(profile.id,field))+' '+citations(profile[field])+'</p><button type="button" class="btn-sm btn-sm-ghost" data-culture-costume="'+escape(profile.id)+'">'+escape(t('ui.details'))+'</button></article>';
 }
 function renderHistory(){return data.profiles.map(profile=>profileCard(profile)).join('');}
 function renderRules(){
  return '<p class="culture-tab-note">'+escape(t('culture.editorial'))+'</p>'+data.guidance.map(item=>
   '<article class="culture-knowledge-card"><h3>'+escape(t('culture.guidance.'+item.id+'.title'))+'</h3><p>'+escape(t('culture.guidance.'+item.id+'.body'))+' '+citations(item.body)+'</p></article>').join('');
 }
 function renderRegions(){
  const representative={north:['ao-tu-than','ao-yem'],central:['ao-ngu-than','ao-nhat-binh'],south:['ao-ba-ba']};
  return '<p class="culture-tab-note">'+escape(t('culture.regionNote'))+'</p>'+Object.entries(representative).map(([region,ids])=>
   '<article class="culture-knowledge-card"><h3>'+escape(t('ui.'+region))+'</h3>'+ids.map(id=>'<p><strong>'+escape(locale.label('costume',id))+'</strong> · '+escape(text(id,'regionLabel'))+' '+citations(getProfile(id)?.regionLabel)+'</p>').join('')+'</article>').join('');
 }
 function renderModern(){return '<p class="culture-tab-note">'+escape(t('culture.modernNote'))+'</p>'+['ao-dai','ao-nhat-binh','ao-ngu-than'].map(id=>profileCard(getProfile(id),'usage')).join('');}
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-culture-costume]');
  if(button&&getProfile(button.dataset.cultureCostume))scope.openCostumeModal?.(button.dataset.cultureCostume);
 });
 scope.VietPhucCulture=Object.freeze({getProfile,summary:id=>text(id,'summary'),regionLabel:id=>text(id,'regionLabel'),detail,renderHistory,renderRules,renderRegions,renderModern});
})(typeof window!=='undefined'?window:globalThis);
