// HSL heuristics over reviewed colour families. Scores never ban an outfit.
(function(scope){
 'use strict';
 const clamp=value=>Math.min(1,Math.max(0,value));
 const eventPreferences=Object.freeze({festival:['burgundy','plum','pink'],tet:['burgundy','pink','ivory'],wedding:['burgundy','ivory','pink'],school:['ivory','navy','plum'],street:['navy','pink','plum'],ceremony:['burgundy','navy','ivory']});
 function parseHex(hex){
  if(typeof hex!=='string'||!/^#[0-9a-f]{6}$/i.test(hex))return null;
  const rgb=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255);
  const max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min,l=(max+min)/2;
  let h=0,s=0;
  if(delta){s=delta/(1-Math.abs(2*l-1));h=60*(max===rgb[0]?((rgb[1]-rgb[2])/delta)%6:max===rgb[1]?(rgb[2]-rgb[0])/delta+2:(rgb[0]-rgb[1])/delta+4);}
  return {rgb,h:(h+360)%360,s,l,neutral:s<.2||l>.86||l<.12};
 }
 function pair(first,second){
  const a=parseHex(first),b=parseHex(second);if(!a||!b)return null;
  const hueDistance=Math.min(Math.abs(a.h-b.h),360-Math.abs(a.h-b.h));
  const lightnessContrast=Math.abs(a.l-b.l),saturationDistance=Math.abs(a.s-b.s);
  const colorDistance=Math.sqrt(a.rgb.reduce((sum,value,i)=>sum+(value-b.rgb[i])**2,0)/3);
  let relation,base;
  if(a.neutral||b.neutral){relation='neutral';base=.9;}
  else if(hueDistance<=12){relation='monochromatic';base=.85;}
  else if(hueDistance<=40){relation='analogous';base=.82;}
  else if(hueDistance>=150){relation='complementary';base=.82;}
  else {relation='mixed';base=.62;}
  const balanced=1-Math.abs(lightnessContrast-.35);
  const score=Math.round(100*clamp(.75*base+.15*balanced+.1*(1-saturationDistance)));
  return {relation,score,hueDistance:Math.round(hueDistance),lightnessContrast:Math.round(lightnessContrast*100)/100,colorDistance:Math.round(colorDistance*100)/100};
 }
 function evaluate(item,catalog){
  const colors=Array.isArray(catalog?.colors)?catalog.colors:[];
  const reviewed=item?.metadata?.fields?.colors?.status==='visually-reviewed'&&item.metadata.fields.colors.sourceSha256===item.sourceSha256&&['visually-reviewed','approved-recolor'].includes(item.metadata.colorStatus);
  const ids=reviewed?[...new Set([item?.primaryColorId,...(Array.isArray(item?.colorIds)?item.colorIds:[])].filter(Boolean))]:[];
  const palette=ids.flatMap(id=>{const row=colors.find(color=>color.id===id),hex=row?.hex||row?.swatchHex;return parseHex(hex)?[{id,hex}]:[];});
  const pairs=[];
  for(let i=0;i<palette.length;i++)for(let j=i+1;j<palette.length;j++)pairs.push({...pair(palette[i].hex,palette[j].hex),colorIds:[palette[i].id,palette[j].id]});
  const score=pairs.length?Math.round(pairs.reduce((sum,row)=>sum+row.score,0)/pairs.length):null;
  return {score,level:score===null?'insufficient':score>=85?'high':score>=70?'balanced':'consider',pairs,palette,
   scope:'approximate-colour-family-harmony',coverage:'recorded-colours-only',areaWeightsKnown:false};
 }
 function recommend({engine,catalog,context}={}){
  if(!engine||!context)return [];
  const event=scope.VietPhucMatching?.canonicalEvent(context.event)||context.event;
  const preferences=Object.hasOwn(eventPreferences,event)?eventPreferences[event]:[];
  const options=engine.colorOptions(context).filter(color=>color.available);
  const stylePreferences={traditional:['burgundy','ivory'],fusion:['navy','plum'],genz:['plum','pink','navy']};
  return options.flatMap(color=>{
   const result=engine.search({...context,colorId:color.id,variantId:null}),item=result.best;
   if(!item||!item.accessoriesExact||!item.colorExact)return [];
   const harmony=evaluate(item,catalog),index=preferences.indexOf(color.id);
   const eventPreference=index<0?0:(preferences.length-index)/preferences.length;
   const stylePreference=(Object.hasOwn(stylePreferences,context.style)?stylePreferences[context.style]:[]).includes(color.id)?1:0;
   const rankScore=Math.round(100*(.75*(harmony.score===null?.5:harmony.score/100)+.2*eventPreference+.05*stylePreference))/100;
   return [{colorId:color.id,hex:color.hex||color.swatchHex,sourceKind:item.sourceKind,combinationId:item.combinationId,variantId:item.variantId||null,harmony,rankScore,
    reasonCodes:[...(eventPreference?['event-preference']:[]),...(stylePreference?['style-preference']:[]),...(harmony.pairs.length?['recorded-harmony']:['insufficient-colours'])]}];
  }).sort((a,b)=>b.rankScore-a.rankScore||Number(b.colorId===context.colorId)-Number(a.colorId===context.colorId)||Number(a.sourceKind==='recolor')-Number(b.sourceKind==='recolor')||(a.colorId<b.colorId?-1:a.colorId>b.colorId?1:0));
 }
 scope.VietPhucColorHarmony=Object.freeze({parseHex,pair,evaluate,recommend,eventPreferences});
})(typeof window!=='undefined'?window:globalThis);
