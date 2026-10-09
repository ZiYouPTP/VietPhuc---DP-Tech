import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BODY_PRESETS, drawBodyLook } from '../js/bodyCompositor.js';
import { COSTUME_DETAILS, buildLayerPrompt } from '../js/imagePrompt.js';
import { validateLayerGeometry, importLayer, getLayer, layersForLook, removeLayer } from '../js/layerLibrary.js';

assert.equal(Object.keys(COSTUME_DETAILS).length,7);
for(const gender of ['male','female']) for(const costumeId of Object.keys(COSTUME_DETAILS)) {
  const svg=drawBodyLook({costumeId,body:{gender},color:'#1A7A4C',pattern:'lotus'});
  assert.ok(svg.includes(BODY_PRESETS[gender].src));
  assert.ok(svg.includes('data-costume="'+costumeId+'"'));
  assert.ok(!svg.includes('NaN'));
  const prompt=buildLayerPrompt({costumeId,body:{gender}},costumeId);
  assert.ok(prompt.includes('MỘT món đồ'));
  assert.ok(prompt.includes('không chứa mannequin'));
}
assert.throws(()=>validateLayerGeometry(200,200,'male'),/tỉ lệ/);
assert.doesNotThrow(()=>validateLayerGeometry(1180,3080,'male'));
assert.throws(()=>validateLayerGeometry(11800,30800,'male'),/quá lớn/);

const src='data:image/png;base64,'+(await readFile(new URL('./fixtures/qa-layer-male.png',import.meta.url))).toString('base64');
globalThis.FileReader=class{readAsDataURL(){this.result=src;queueMicrotask(()=>this.onload());}};
globalThis.Image=class{naturalWidth=118;naturalHeight=308;async decode(){}};
const pixels=new Uint8ClampedArray(118*308*4);pixels[7]=255;
globalThis.document={createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:pixels})})})};
// Denied IndexedDB must still allow import/use within the current session.
const imported=await importLayer({type:'image/png',size:500,name:'fixture.png'},'male','ao-ba-ba');
assert.equal(imported.persisted,false);
assert.equal(getLayer('male','ao-ba-ba').src,src);
assert.equal(getLayer('female','ao-ba-ba'),undefined);
assert.equal(layersForLook({costumeId:'ao-ba-ba',body:{gender:'male'}}).length,1);
const svg=drawBodyLook({costumeId:'ao-ba-ba',body:{gender:'male'},imageLayers:[imported]});
assert.ok(svg.includes('data-image-layer="ao-ba-ba"'));
assert.ok(!svg.includes('data-layer="garment"'),'PNG must replace its own illustrated layer');
await removeLayer('male','ao-ba-ba');
assert.equal(getLayer('male','ao-ba-ba'),undefined);
console.log('Seven costumes/two base bodies, per-item prompts, frame validation, layer replacement and session-storage fallback: PASS');
