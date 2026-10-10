import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const catalog=JSON.parse(await readFile(new URL('../../assets/web/photo-catalog.json',import.meta.url),'utf8'));
const matching=await readFile(new URL('../js/outfitMatching.js',import.meta.url),'utf8');
const harmonySource=await readFile(new URL('../js/colorHarmony.js',import.meta.url),'utf8');
function modules(value=catalog){
 const window={};vm.runInNewContext(matching,{window});vm.runInNewContext(harmonySource,{window});
 return {harmony:window.VietPhucColorHarmony,engine:window.VietPhucMatching.createEngine(value)};
}

test('HSL handles hue wrapping, achromatic colours and invalid hex without NaN',()=>{
 const {harmony}=modules();
 assert.equal(harmony.parseHex('#FF0000').h,0);
 assert.equal(harmony.parseHex('#00FF00').h,120);
 assert.equal(harmony.parseHex('#0000FF').h,240);
 for(const hex of ['#000000','#FFFFFF','#808080'])assert.equal(harmony.parseHex(hex).neutral,true);
 for(const value of ['red','#fff','#GG0000',null,{},'#123456;filter:invert(1)'])assert.equal(harmony.parseHex(value),null);
 assert.equal(harmony.pair('#ff0010','#ff1000').relation,'monochromatic');
 assert.equal(harmony.pair('#ff0000','#ff5500').relation,'analogous');
 assert.equal(harmony.pair('#ff0000','#00ffff').relation,'complementary');
 assert.equal(harmony.pair('#ff0000','#eeeeee').relation,'neutral');
 assert.equal(harmony.pair('invalid','#ffffff'),null);
 for(const first of catalog.colors)for(const second of catalog.colors){
  const a=harmony.pair(first.swatchHex,second.swatchHex),b=harmony.pair(second.swatchHex,first.swatchHex);
  assert.equal(a.score,b.score);assert.equal(a.colorDistance,b.colorDistance);
  assert.ok(a.score>=0&&a.score<=100);
 }
});

test('Scores use recorded colours, disclose missing areas and avoid assigning single-colour scores',()=>{
 const {harmony}=modules();
 const single=catalog.items.find(item=>item.colorIds.length===1),multiple=catalog.items.find(item=>item.colorIds.length>1);
 assert.ok(single&&multiple);
 const one=harmony.evaluate(single,catalog),many=harmony.evaluate(multiple,catalog);
 assert.equal(one.score,null);assert.equal(one.pairs.length,0);assert.equal(one.level,'insufficient');
 assert.ok(many.pairs.length>0);assert.ok(many.score>=0&&many.score<=100);
 assert.equal(many.areaWeightsKnown,false);assert.equal(many.coverage,'recorded-colours-only');
 assert.equal(many.scope,'approximate-colour-family-harmony');
 assert.equal(harmony.evaluate(null,catalog).score,null);
 assert.equal(harmony.evaluate({...single,primaryColorId:null,colorIds:null},catalog).score,null);
 const unreviewed=structuredClone(multiple);unreviewed.metadata.fields.colors.status='unknown';
 assert.equal(harmony.evaluate(unreviewed,catalog).score,null);
});

test('Suggestions never relax event, complete accessory set, approval or colour constraints',()=>{
 const {harmony,engine}=modules();
 for(const item of catalog.items)for(const event of ['festival','tet','wedding','school','street','ceremony']){
  const context={costumeId:item.costumeId,gender:item.gender,accessories:item.accessories,event,style:'fusion',colorId:null};
  const ranked=harmony.recommend({engine,catalog,context});
  const enabled=engine.colorOptions(context).filter(color=>color.available).map(color=>color.id);
  assert.equal(ranked.length,enabled.length);
  for(const row of ranked){
   assert.ok(enabled.includes(row.colorId));
   const result=engine.search({...context,colorId:row.colorId});
   assert.equal(result.status,'exact');assert.equal(result.best.combinationId,row.combinationId);
   assert.ok(!row.reasonCodes.includes('historically-verified'));
  }
 }
 const item=catalog.items.find(row=>row.combinationId==='combination-045e317b8c6515d8');
 const context={costumeId:item.costumeId,gender:item.gender,accessories:item.accessories,event:'tet',style:'traditional',colorId:null};
 const tet=harmony.recommend({engine,catalog,context});
 assert.equal(tet.length,3);
 const wedding=harmony.recommend({engine,catalog,context:{...context,event:'wedding'}});
 assert.equal(wedding.length,1);assert.equal(wedding[0].colorId,'burgundy');
 assert.equal(harmony.recommend({engine,catalog,context:{...context,accessories:['__unsupported__']}}).length,0);
 const variant=catalog.colorVariants.find(row=>row.sourceCombinationId===item.combinationId&&row.primaryColorId==='navy');
 engine.markUnavailable(variant.key);
 assert.ok(!harmony.recommend({engine,catalog,context}).some(row=>row.colorId==='navy'));
});

test('Suggestions are stable under file order and event/style preferences remain soft',()=>{
 const {harmony,engine}=modules(),reverse=structuredClone(catalog);
 reverse.items.reverse();reverse.colorVariants.reverse();reverse.colors.reverse();
 const other=modules(reverse).engine;
 const item=catalog.items.find(row=>row.combinationId==='combination-045e317b8c6515d8');
 const context={costumeId:item.costumeId,gender:item.gender,accessories:item.accessories,event:'school',style:'genz',colorId:'navy'};
 const result=harmony.recommend({engine,catalog,context}),again=harmony.recommend({engine:other,catalog:reverse,context});
 assert.deepEqual(Array.from(result,row=>row.colorId),Array.from(again,row=>row.colorId));
 for(const style of ['traditional','fusion','genz']){
  assert.deepEqual(engine.colorOptions({...context,style}).filter(row=>row.available).map(row=>row.id),engine.colorOptions(context).filter(row=>row.available).map(row=>row.id));
 }
});
