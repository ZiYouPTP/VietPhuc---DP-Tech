// Availability is evidence of an entire accessory set, not a slot preset.
(function(scope){
 'use strict';
 const t=(key,params)=>scope.VietPhucLocale.t(key,params);
 const engine=scope.VietPhucMatching?.getEngine(scope.VietPhucOutfitCatalogData);
 const accessories=Object.fromEntries((scope.VietPhucOutfitCatalogData?.accessories||[]).filter(item=>engine?.getSupportedAccessoryIds().includes(item.id)).map(item=>[item.id,item]));
 function getCostumeAvailability(costumeId,gender='female',context={}){
  const available=!!engine?.choices({...context,costumeId,gender,body:{gender}}).length;
  const event=scope.VietPhucMatching?.canonicalEvent(context.event);
  const profiles=scope.VietPhucMatching?.eventProfiles;
  const outsideScope=event&&profiles&&Object.hasOwn(profiles,event)&&!profiles[event].costumeIds.includes(costumeId);
  const code=available?null:outsideScope?'outside-event-demo':'costume-data-missing';
  return {available,code,reason:available?'':t(outsideScope?'matching.outside-event-demo':'availability.costumeDataMissing')};
 }
 function sanitizeCostume(costumeId,gender='female',context={}){
  if(getCostumeAvailability(costumeId,gender,context).available)return costumeId;
  return ['ao-dai','ao-tu-than','ao-ngu-than','ao-ba-ba','ao-nhat-binh','ao-yem','ao-giao-linh'].find(id=>getCostumeAvailability(id,gender,context).available)||null;
 }
 function getAvailability(id,context={}){
  const result=engine?.accessoryAvailability(id,context)||{available:false,code:'accessory-unknown'};
  const key=result.code==='accessory-not-in-dataset'?'availability.notInDataset':'matching.'+result.code;
  return {...result,reason:result.available?'':t(key,{name:{key:'costume.'+context.costumeId}})};
 }
 const sanitizeAccessories=(ids,context={})=>engine?.sanitizeAccessories(ids,typeof context==='string'?{costumeId:context}:context)||[];
 function toStudioSlots(ids,context={}){
  const selected=sanitizeAccessories(ids,context);
  return {headwear:selected.find(id=>accessories[id]?.type==='headwear')||null,footwear:selected.find(id=>accessories[id]?.type==='footwear')||null,
   hairAdornment:selected.includes('tram-cai')?'tram-cai':null,belt:null,accessory:selected.filter(id=>accessories[id]?.type==='hair')};
 }
 scope.VietPhucCompatibility=Object.freeze({getAvailability,sanitizeAccessories,toStudioSlots,getCostumeAvailability,sanitizeCostume,
  getAccessoryType:id=>t('type.'+(accessories[id]?.type||'other')),getSupportedAccessoryIds:()=>Object.keys(accessories),
  getCombinationOptions:context=>engine?.choices(context)||[],hasExactCombination:(ids,context)=>engine?.hasExact(ids,context)||false,
  getKnownCostumeAvailability:(id,gender)=>engine?.hasFamily(id,gender)||false,
  presets:Object.freeze({get label(){return t('matching.scope');},ruleType:'reviewed-exact-accessory-set',needsVerification:true,sources:[]})});
})(typeof window!=='undefined'?window:globalThis);
