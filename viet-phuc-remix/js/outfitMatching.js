// Pure retrieval over reviewed complete photos. No image composition or inferred history.
(function(scope){
 'use strict';
 const ACCESSORIES=['non-la','non-quai-thao','khan-dong','khan-vanh','tram-cai','guoc-moc','hai-theu','giay-cao-got'];
 const COSTUMES=['ao-dai','ao-tu-than','ao-ngu-than','ao-ba-ba','ao-nhat-binh','ao-yem','ao-giao-linh'];
 const EVENTS=['festival','tet','wedding','school','street','ceremony'];
 const ALIASES=Object.freeze({'le-hoi':'festival',truong:'school',graduation:'school',cuoi:'wedding',daily:'street','tho-cuong':'ceremony'});
 const canonicalEvent=value=>Object.hasOwn(ALIASES,value)?ALIASES[value]:value||null;
 // These lists describe the demo's editorial scope, never historical permission.
 const eventCostumes={festival:COSTUMES,tet:['ao-dai','ao-tu-than','ao-ngu-than','ao-ba-ba'],
  wedding:['ao-dai','ao-nhat-binh','ao-ngu-than'],school:['ao-dai','ao-ngu-than'],
  street:['ao-dai','ao-ba-ba','ao-yem','ao-ngu-than'],ceremony:['ao-ngu-than','ao-nhat-binh','ao-giao-linh']};
 const eventProfiles=Object.freeze(Object.fromEntries(EVENTS.map(id=>[id,Object.freeze({id,
  costumeIds:Object.freeze([...eventCostumes[id]]),kind:'editorial-demo-scope',culturalAuthority:false})])));
 const STYLES=['traditional','fusion','genz'];
 const WEIGHTS=Object.freeze({costume:25,gender:15,accessories:40,color:15,style:5});
 const hash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/i.test(value);
 const ids=value=>Array.isArray(value)&&value.every(id=>typeof id==='string')&&new Set(value).size===value.length;
 const sameSet=(a,b)=>a.length===b.length&&a.every(id=>b.includes(id));
 const compareId=(a,b)=>a===b?0:a<b?-1:1;
 const safeFile=(file,prefix)=>typeof file==='string'&&file.startsWith(prefix)&&!file.includes('\\')&&!file.split('/').some(part=>['','.','..'].includes(part));
 const verifiedCulture=item=>item.culturalInfo?.needsVerification===false&&Array.isArray(item.culturalInfo.sources)&&item.culturalInfo.sources.length>0&&item.metadata?.fields?.culturalInfo?.status==='verified';

 function createEngine(catalog={}){
  if(!catalog||typeof catalog!=='object'||Array.isArray(catalog))catalog={};
  const unavailable=new Set(), rejected=[];
  const palette=(Array.isArray(catalog.colors)?catalog.colors:[]).filter(c=>typeof c.id==='string');
  const knownColors=new Set(palette.map(c=>c.id));
  const colorClaims=new Map();
  const reviewedColors=item=>knownColors.has(item.primaryColorId)&&ids(item.colorIds)&&item.colorIds.includes(item.primaryColorId)
   &&item.colorIds.every(id=>knownColors.has(id))&&item.metadata?.colorStatus===(item.sourceKind==='recolor'?'approved-recolor':'visually-reviewed')
   &&item.metadata?.fields?.colors?.status==='visually-reviewed'&&item.metadata.fields.colors.sourceSha256===item.sourceSha256;
  function validOriginal(item){
   return item&&item.availability?.previewEligible===true&&item.sourceKind==='original'&&!item.generated
    &&COSTUMES.includes(item.costumeId)&&['male','female'].includes(item.gender)
    &&ids(item.accessories)&&item.accessories.every(id=>ACCESSORIES.includes(id))
    &&typeof item.combinationId==='string'&&typeof item.key==='string'&&hash(item.sourceSha256)
    &&safeFile(item.file,'assets/derived/outfits/')&&safeFile(item.sourceFile,'assets/web/')
    &&item.derivative?.file===item.file&&hash(item.derivative.sha256)&&item.derivative.sourceSha256===item.sourceSha256
    &&Number.isInteger(item.width)&&item.width>0&&Number.isInteger(item.height)&&item.height>0
    &&item.metadata?.appearanceStatus==='visually-reviewed'
    &&['costumeId','gender','accessoryIds'].every(field=>item.metadata?.fields?.[field]?.sourceSha256===item.sourceSha256)
    &&(item.primaryColorId===null||knownColors.has(item.primaryColorId));
  }
  const originals=(Array.isArray(catalog.items)?catalog.items:[]).filter(item=>{
   const valid=validOriginal(item);if(!valid)rejected.push({id:item?.combinationId,code:'unreviewed-or-invalid-source'});return valid;
  }).map(item=>{
   if(reviewedColors(item))return item;
   colorClaims.set(item.combinationId,item.primaryColorId);
   // Uncertain colour labels cannot enable a swatch; the reviewed photo stays usable.
   return {...item,primaryColorId:null,colorIds:null};
  });
  const bySource=new Map(originals.map(item=>[item.combinationId,item]));
  const variants=(Array.isArray(catalog.colorVariants)?catalog.colorVariants:[]).filter(item=>{
   const source=bySource.get(item?.sourceCombinationId);
   const valid=source&&reviewedColors(source)&&reviewedColors(item)&&item.metadata.colorStatus==='approved-recolor'
    &&item.sourceKind==='recolor'&&item.generated===true&&item.availability?.previewEligible===true
    &&item.quality?.status==='approved'&&item.status==='approved'&&item.quality.checks?.passed===true
    &&item.sourceAssetId===source.assetId&&item.sourceSha256===source.sourceSha256
    &&item.baseImageFile===source.file&&item.baseImageSha256===source.derivative.sha256
    &&item.costumeId===source.costumeId&&item.gender===source.gender&&ids(item.accessories)&&sameSet(item.accessories,source.accessories)
    &&item.width===source.width&&item.height===source.height&&knownColors.has(item.primaryColorId)
    &&item.variantId===item.combinationId&&typeof item.key==='string'
    &&safeFile(item.file,'assets/generated/color-variants/')&&item.artifact?.file===item.file&&hash(item.artifact.sha256)
    &&hash(item.mask?.sha256)&&hash(item.recipe?.sha256)&&Array.isArray(item.demoEventIds)&&item.demoEventIds.length>0;
   if(!valid)rejected.push({id:item?.variantId,code:'unapproved-or-unbound-variant'});return valid;
  });
  const photos=[...originals,...variants];
  const groupKey=item=>[item.costumeId,item.gender,[...item.accessories].sort().join('+')||'none'].join('|');
  const allowedColors=new Map();
  // Count distinct primary alternatives across every event, with originals first.
  for(const item of [...originals,...variants].sort((a,b)=>Number(a.sourceKind==='recolor')-Number(b.sourceKind==='recolor')||compareId(a.combinationId,b.combinationId))){
   if(!item.primaryColorId)continue;
   const key=groupKey(item);if(!allowedColors.has(key))allowedColors.set(key,new Set());
   const colors=allowedColors.get(key);if(colors.size<3||colors.has(item.primaryColorId))colors.add(item.primaryColorId);
  }
  const withinColorLimit=item=>!item.primaryColorId||allowedColors.get(groupKey(item))?.has(item.primaryColorId)===true;
  function normalize(input={}){
   const errors=[];
   if(!input||typeof input!=='object'||Array.isArray(input))return {errors:[{code:'invalid-query'}]};
   const gender=input.body?.gender??input.gender??'female';
   const event=canonicalEvent(input.event);
   const style=input.style||null;
   const values=input.accessories===undefined?[]:input.accessories instanceof Set?[...input.accessories]:input.accessories;
   if(!COSTUMES.includes(input.costumeId))errors.push({code:'unknown-costume'});
   if(!['male','female'].includes(gender))errors.push({code:'unknown-gender'});
   if(event&&!EVENTS.includes(event))errors.push({code:'unknown-event'});
   if(style&&!STYLES.includes(style))errors.push({code:'unknown-style'});
   if(input.requireVerifiedCulture!==undefined&&typeof input.requireVerifiedCulture!=='boolean')errors.push({code:'invalid-culture-policy'});
   if(!Array.isArray(values)||values.some(id=>typeof id!=='string'||!ACCESSORIES.includes(id)))errors.push({code:'unknown-accessory'});
   let colorId=input.colorId;
   if(colorId===undefined)colorId=palette.find(c=>String(c.hex||c.swatchHex).toUpperCase()===String(input.color||'').toUpperCase())?.id||null;
   if(colorId==='original')colorId=null;
   if(colorId!=null&&!knownColors.has(colorId))errors.push({code:'unknown-color'});
   if(input.variantId!=null&&!variants.some(v=>v.variantId===input.variantId))errors.push({code:'unknown-variant'});
   return {errors,query:{costumeId:input.costumeId,gender,event,style,colorId:colorId??null,
    accessories:Array.isArray(values)?[...new Set(values)].sort():[],variantId:input.variantId||null,requireVerifiedCulture:input.requireVerifiedCulture===true}};
  }
  function hardReasons(item,q){
   const reasons=[];
   if(unavailable.has(item.key)||unavailable.has(item.combinationId))reasons.push('image-unavailable');
   if(item.costumeId!==q.costumeId)reasons.push('different-costume');
   if(item.gender!==q.gender)reasons.push('different-gender');
   if(q.event&&!eventProfiles[q.event].costumeIds.includes(item.costumeId))reasons.push('outside-event-demo');
   if(q.event&&Array.isArray(item.eventIds)&&!item.eventIds.some(id=>canonicalEvent(id)===q.event))reasons.push('event-not-supported');
   if(item.sourceKind==='recolor'&&(!q.event||!item.demoEventIds.some(id=>canonicalEvent(id)===q.event)))reasons.push('outside-demo-profile');
   if((item.sourceKind==='recolor'||q.colorId)&&!withinColorLimit(item))reasons.push('color-limit');
   if(q.requireVerifiedCulture&&!verifiedCulture(item))reasons.push('culture-unverified');
   // A historical rule must have its own reviewed sources. Draft rules never ban a look.
   for(const rule of Array.isArray(item.culturalInfo?.rules)?item.culturalInfo.rules:[]){
    if(!verifiedCulture(item)||rule?.kind!=='hard'||rule.verified!==true||!Array.isArray(rule.sources)||!rule.sources.length)continue;
    if(rule.eventIds!=null&&!Array.isArray(rule.eventIds))continue;
    if(rule.eventIds?.length&&!rule.eventIds.some(id=>canonicalEvent(id)===q.event))continue;
    if(Array.isArray(rule.forbiddenAccessoryIds)&&rule.forbiddenAccessoryIds.some(id=>item.accessories.includes(id)))reasons.push('verified-cultural-rule');
   }
   return reasons;
  }
  function eligible(q){return photos.filter(item=>hardReasons(item,q).length===0);}
  function rank(item,q){
   const union=new Set([...q.accessories,...item.accessories]);
   const intersection=q.accessories.filter(id=>item.accessories.includes(id)).length;
   const accessoryScore=union.size?intersection/union.size:1;
   const accessoriesExact=sameSet(q.accessories,item.accessories),colorExact=!q.colorId||item.primaryColorId===q.colorId;
   const styleKnown=!!q.style&&Array.isArray(item.styleIds)&&item.styleIds.length>0;
   const styleExact=!styleKnown||item.styleIds.includes(q.style);
   const breakdown=[{field:'costume',weight:WEIGHTS.costume,value:1},{field:'gender',weight:WEIGHTS.gender,value:1},
    {field:'accessories',weight:WEIGHTS.accessories,value:accessoryScore}];
   if(q.colorId)breakdown.push({field:'color',weight:WEIGHTS.color,value:colorExact?1:0});
   if(styleKnown)breakdown.push({field:'style',weight:WEIGHTS.style,value:styleExact?1:0});
   const score=Math.round(1000*breakdown.reduce((sum,b)=>sum+b.weight*b.value,0)/breakdown.reduce((sum,b)=>sum+b.weight,0))/10;
   const differences=[];
   const missing=q.accessories.filter(id=>!item.accessories.includes(id)),extra=item.accessories.filter(id=>!q.accessories.includes(id));
   if(missing.length)differences.push({code:'accessories-missing',ids:missing});
   if(extra.length)differences.push({code:'accessories-extra',ids:extra});
   if(!colorExact)differences.push({code:'color-different',requested:q.colorId,actual:item.primaryColorId});
   if(!styleExact)differences.push({code:'style-different',requested:q.style,actual:item.styleIds});
   const warnings=[];
   if(!verifiedCulture(item))warnings.push({code:'culture-unverified'});
   if(q.event&&!Array.isArray(item.eventIds))warnings.push({code:'event-unverified'});
   if(q.style&&!styleKnown)warnings.push({code:'style-unverified'});
   if(item.accessories.includes('giay-cao-got'))warnings.push({code:'modern-heels'});
   if(item.sourceKind==='recolor')warnings.push({code:'approved-recolor'});
   return {...item,score,breakdown,differences,warnings,accessoriesExact,colorExact,colorFallback:!colorExact,
    dataExact:accessoriesExact&&colorExact,exact:accessoriesExact&&colorExact&&styleExact,
    fallback:!(accessoriesExact&&colorExact&&styleExact),scoreScope:'dataset-attribute-similarity'};
  }
  function search(input={}){
   const normalized=normalize(input);
   if(normalized.errors.length)return {status:'invalid',best:null,candidates:[],errors:normalized.errors,excluded:[],query:normalized.query};
   const q=normalized.query,excluded=[];
   for(const item of photos){const reasons=hardReasons(item,q);if(reasons.length)excluded.push({id:item.combinationId,reasons});}
   const candidates=eligible(q).filter(item=>item.sourceKind!=='recolor'||!q.variantId||item.variantId===q.variantId).map(item=>rank(item,q));
   candidates.sort((a,b)=>Number(b.exact)-Number(a.exact)||b.score-a.score
    ||Number(a.sourceKind==='recolor')-Number(b.sourceKind==='recolor')||b.breakdown.length-a.breakdown.length||compareId(a.combinationId,b.combinationId));
   const best=candidates[0]||null;
   return {status:best?(best.exact?'exact':'reference'):'empty',best,candidates,errors:[],excluded,query:q};
  }
  function choices(context={}){
   const normalized=normalize({...context,body:{gender:context.body?.gender??context.gender??'female'},accessories:[],colorId:null,variantId:null});
   if(normalized.errors.length)return [];
   const sets=new Map();
   for(const item of eligible(normalized.query)){
    const values=[...item.accessories].sort(),key=values.join('+')||'none';
    if(!sets.has(key))sets.set(key,{key,accessories:values,combinationIds:[]});
    sets.get(key).combinationIds.push(item.combinationId);
   }
   return [...sets.values()].sort((a,b)=>a.accessories.length-b.accessories.length||compareId(a.key,b.key));
  }
  const hasExact=(values,context)=>Array.isArray(values)&&choices(context).some(set=>sameSet(set.accessories,[...new Set(values)]));
  function accessoryAvailability(id,context={}){
   if(!ACCESSORIES.includes(id))return {available:false,code:'accessory-unknown'};
   const selected=Array.isArray(context.accessories)?context.accessories:context.accessories instanceof Set?[...context.accessories]:[];
   const removing=selected.includes(id),proposed=removing?selected.filter(value=>value!==id):[...selected,id];
   const sets=choices(context);
   if(!sets.some(set=>set.accessories.includes(id)))return {available:false,code:'accessory-not-in-dataset'};
   return hasExact(proposed,context)?{available:true,code:null}:{available:false,code:removing?'removal-breaks-set':'whole-set-missing'};
  }
  function sanitizeAccessories(values,context={}){
   const requested=[...new Set((Array.isArray(values)?values:values instanceof Set?[...values]:[]).filter(id=>ACCESSORIES.includes(id)))];
   const subsets=choices(context).filter(set=>set.accessories.every(id=>requested.includes(id)));
   subsets.sort((a,b)=>b.accessories.length-a.accessories.length||requested.reduce((n,id,i)=>n+((b.accessories.includes(id)?1:0)-(a.accessories.includes(id)?1:0))*2**(requested.length-i),0)||compareId(a.key,b.key));
   return subsets[0]?requested.filter(id=>subsets[0].accessories.includes(id)):[];
  }
  function colorOptions(context={}){
   const normalized=normalize({...context,colorId:null,variantId:null});
   const q=normalized.query;
   const sameCombination=item=>item.costumeId===q.costumeId&&item.gender===q.gender&&sameSet(item.accessories,q.accessories);
   const combination=normalized.errors.length?[]:photos.filter(sameCombination);
   const supported=new Set(photos.map(item=>item.primaryColorId).filter(Boolean));
   return palette.filter(c=>supported.has(c.id)).map(color=>{
    const matching=combination.filter(item=>item.primaryColorId===color.id);
    const available=matching.filter(item=>hardReasons(item,{...q,colorId:color.id}).length===0);
    let code=null;
    if(!available.length){
     const reasons=new Set(matching.flatMap(item=>hardReasons(item,{...q,colorId:color.id})));
     if(normalized.errors.length)code='invalid-query';
     else if(q.event&&!eventProfiles[q.event].costumeIds.includes(q.costumeId))code='outside-event-demo';
     else if(combination.some(item=>colorClaims.get(item.combinationId)===color.id))code='color-unreviewed';
     else code=['outside-demo-profile','event-not-supported','color-limit','image-unavailable','culture-unverified','verified-cultural-rule'].find(reason=>reasons.has(reason))||'whole-set-missing';
    }
    return {...color,hex:color.hex||color.swatchHex,available:available.length>0,code,
     combinationIds:available.map(item=>item.combinationId).sort(compareId),
     sourceKind:available.some(i=>i.sourceKind==='original')?'original':available.length?'recolor':null};
   });
  }
  return Object.freeze({search,choices,hasExact,accessoryAvailability,sanitizeAccessories,colorOptions,
   hasFamily:(costumeId,gender)=>originals.some(item=>item.costumeId===costumeId&&item.gender===gender),
   getSupportedAccessoryIds:()=>ACCESSORIES.filter(id=>photos.some(item=>item.accessories.includes(id))),
   markUnavailable:id=>unavailable.add(id),getDiagnostics:()=>({originals:originals.length,variants:variants.length,rejected:[...rejected]}),weights:WEIGHTS});
 }
 const cache=new WeakMap();
 function getEngine(catalog){
  if(!catalog||typeof catalog!=='object')return createEngine();
  if(!cache.has(catalog))cache.set(catalog,createEngine(catalog));return cache.get(catalog);
 }
 scope.VietPhucMatching=Object.freeze({createEngine,getEngine,eventProfiles,canonicalEvent});
})(typeof window!=='undefined'?window:globalThis);
