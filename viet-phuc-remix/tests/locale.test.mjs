import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const catalogs=await readFile(new URL('../js/locales.js',import.meta.url),'utf8');
const runtime=await readFile(new URL('../js/locale.js',import.meta.url),'utf8');
const generated=await readFile(new URL('../js/photoMappingData.js',import.meta.url),'utf8');
const cultureData=await readFile(new URL('../js/cultureData.js',import.meta.url),'utf8');
function session(browserLanguage='vi-VN',saved=null,blocked=false){
 const events=[],values=new Map([['vietPhucLanguage',saved]]),window={dispatchEvent:event=>events.push(event)};
 const context=vm.createContext({window,navigator:{language:browserLanguage},localStorage:{getItem:key=>{if(blocked)throw Error('denied');return values.get(key);},setItem:(key,value)=>{if(blocked)throw Error('denied');values.set(key,value);}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}});
 vm.runInContext(generated,context);vm.runInContext(cultureData,context);vm.runInContext(catalogs,context);vm.runInContext(runtime,context);
 return {locale:window.VietPhucLocale,messages:window.VietPhucMessages,photos:window.VietPhucPhotoMappingData,values,events};
}
assert.equal(session('vi-VN').locale.getLanguage(),'vi');
assert.equal(session('en-US').locale.getLanguage(),'en');
assert.equal(session('fr-FR').locale.getLanguage(),'vi');
assert.equal(session('en-US','vi').locale.getLanguage(),'vi','An explicit choice overrides browser language');
assert.equal(session('vi-VN','en').locale.getLanguage(),'en');
assert.equal(session('vi-VN','invalid').locale.getLanguage(),'vi');
const blocked=session('en-US',null,true);blocked.locale.setLanguage('vi');assert.equal(blocked.locale.getLanguage(),'vi');
blocked.locale.setLanguage('invalid');assert.equal(blocked.locale.getLanguage(),'vi');
assert.equal(blocked.events.length,1,'Invalid language input must not trigger a redraw');
const {locale,messages,photos,values}=session();
const params=text=>[...text.matchAll(/\{(\w+)\}/g)].map(match=>match[1]).sort();
for(const [key,row] of Object.entries(messages)){
 assert.ok(row.vi && row.en,`${key} must have both languages`);
 assert.deepEqual(params(row.vi),params(row.en),`${key} parameters must agree`);
}
for(const photo of photos){
 assert.ok(Object.hasOwn(messages,'photo.'+photo.key),`Missing dynamic photo label for ${photo.key}`);
 assert.ok(messages['photo.'+photo.key].vi && messages['photo.'+photo.key].en);
}
const correctedPhoto=photos.find(photo=>photo.costumeId==='ao-giao-linh'&&photo.accessories.includes('non-la')&&photo.accessories.includes('tram-cai')&&photo.accessories.includes('guoc-moc'));
assert.ok(correctedPhoto,'The reviewed three-accessory photo must remain in the actual catalog');
assert.match(messages['photo.'+correctedPhoto.key].vi,/trâm/i,'Photo labels use reviewed contents rather than just filename tokens');
assert.match(messages['photo.'+correctedPhoto.key].en,/hairpin/i);
// Parameter references localize accessory names inside a live announcement.
const element={attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}};
locale.trackText(element,locale.t('availability.conflict',{name:{key:'accessory.non-la'}}));
assert.match(element.textContent,/Nón Lá/);
locale.setLanguage('en');assert.equal(values.get('vietPhucLanguage'),'en');
assert.equal(locale.t(element.attrs['data-i18n'],JSON.parse(element.attrs['data-i18n-params'])),'Remove Conical hat before selecting this accessory.');

// Scan the actual entry and component references, catching a missing key before UI QA.
const files=['../index.html','../app.js','../js/compatibility.js','../js/photoMapping.js','../js/webFeatures.js','../js/studio.js','../js/culture.js','../js/colorHarmony.js'];
for(const file of files){
 const source=await readFile(new URL(file,import.meta.url),'utf8');
 const refs=[...source.matchAll(/\b(?:t|uiT)\(\s*['"]([^'"]+)['"]/g)].map(match=>match[1]).filter(key=>!key.endsWith('.'));
 refs.push(...[...source.matchAll(/['"]((?:ui|language|legacy|photo|availability)\.[^'"]+)['"]/g)].map(match=>match[1]).filter(key=>!key.endsWith('.')));
 refs.push(...[...source.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(match=>match[1]));
 for(const key of refs)assert.ok(Object.hasOwn(messages,key),`${file} refers to missing ${key}`);
}
const dataContext=vm.createContext({window:{}});
vm.runInContext(generated,dataContext);
vm.runInContext(await readFile(new URL('../data.js',import.meta.url),'utf8'),dataContext);
for(const [catalog,kind,id] of [['COSTUMES','costume','id'],['ACCESSORIES','accessory','id'],['COLORS','color','hex']]){
 for(const item of vm.runInContext(catalog,dataContext))assert.ok(Object.hasOwn(messages,kind+'.'+String(item[id]).replace(/^#/,'')),`Missing ${kind} label for ${item[id]}`);
}
assert.equal(vm.runInContext('ACCESSORIES.length',dataContext),8,'Coverage must include the generated supported catalog, not an empty fallback');
const entry=await readFile(new URL('../index.html',import.meta.url),'utf8');
assert.ok(entry.indexOf('src="js/photoMappingData.js"') < entry.indexOf('src="js/locales.js"'));
assert.ok(entry.indexOf('src="js/photoMappingData.js"') < entry.indexOf('src="data.js"'));
for(const file of ['../app.js','../js/compatibility.js','../js/photoMapping.js','../js/webFeatures.js','../js/studio.js','../js/culture.js','../js/colorHarmony.js']){
 const source=(await readFile(new URL(file,import.meta.url),'utf8')).replace(/\/\/[^\n]*/g,'').replace(/Việt phục Remix/g,'');
 assert.ok(!/[\u00C0-\u1EF9Đđ]/.test(source),`${file} contains a Vietnamese label outside the shared dictionary`);
}
console.log('Locale defaults, storage fallback, parameter parity, live announcements, catalog coverage and component keys: PASS');
