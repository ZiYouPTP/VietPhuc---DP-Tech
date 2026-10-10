// Headless browser regression tests of the local app, not desktop automation.
// Pass a Playwright package directory as argv[2] when it is not installed locally.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.argv[2]||'playwright');
const base=process.env.REMIX_TEST_URL||'http://127.0.0.1:8067/viet-phuc-remix/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({locale:'vi-VN',viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage(),errors=[],requests=[];const checks=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
page.on('request',r=>requests.push(r.url()));
await mkdir(new URL('../assets/review/browser/',import.meta.url),{recursive:true});
const shot=name=>page.screenshot({path:new URL('../assets/review/browser/'+name,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
try{
 const start=Date.now();await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>window.VietPhucStudio);
 await page.locator('#studio-fallback img').waitFor();await page.waitForFunction(()=>document.querySelector('#studio-fallback img')?.complete);
 const readyMs=Date.now()-start;checks.push({name:'Desktop initial load',readyMs});assert.ok(readyMs<3000,'Initial local load must be under 3s');
 await shot('desktop-hero.png');
 assert.equal(await page.locator('.costume-card').count(),7);
 assert.equal(await page.locator('#studio-fallback').getAttribute('data-renderer'),'photo-mapping-2d');
 for(const id of ['ao-dai','ao-tu-than','ao-ba-ba','ao-nhat-binh','ao-yem','ao-ngu-than','ao-giao-linh']){
  await page.locator('#pill-'+id).click();assert.equal(await page.locator('#studio-fallback img').getAttribute('data-photo-key'),'female-'+id);
 }
 await page.locator('#studio-gender').selectOption('male');assert.equal(await page.locator('#costume-pills button:disabled').count(),5);
 for(const id of ['ao-ngu-than','ao-giao-linh']){await page.locator('#pill-'+id).click();assert.equal(await page.locator('#studio-fallback img').getAttribute('data-photo-key'),'male-'+id);}
 await page.evaluate(()=>selectCostumePill('ao-dai'));assert.equal(await page.evaluate(()=>VietPhucRemix.getOutfit().costumeId),'ao-giao-linh');
 checks.push({name:'All seven female mappings; exactly two male mappings; handler guards',pass:true});
 await page.locator('#studio-gender').selectOption('female');await page.locator('#pill-ao-dai').click();
 await page.locator('#acc-non-la').click();assert.equal(await page.locator('#studio-fallback img').getAttribute('data-photo-key'),'female-ao-dai-non-la');
 assert.equal(await page.locator('#acc-khan-dong').isDisabled(),true);
 await page.locator('#acc-non-la').click();await page.locator('#acc-vong-co').click();
 assert.match(await page.locator('#studio-metrics').innerText(),/Chưa có ảnh đúng/);
 assert.equal(await page.locator('#studio-fallback img').getAttribute('data-photo-key'),'female-ao-dai');
 checks.push({name:'Accessory mapping, conflict locks and explicit missing-combination fallback',pass:true});
 await page.locator('#btn-save-look').click();await page.waitForFunction(()=>document.querySelectorAll('.lookbook-item').length===1);
 await page.reload({waitUntil:'load'});assert.equal(await page.locator('.lookbook-item').count(),1);
 await page.locator('.lookbook-item button').filter({hasText:'Mở lại'}).click();
 assert.equal(await page.evaluate(()=>VietPhucRemix.getOutfit().accessories.includes('vong-co')),true);
 checks.push({name:'Save PNG and restore selection after page reload',pass:true});
 await page.locator('#comparison-section button').filter({hasText:'Thêm mẫu hiện tại'}).click();await page.waitForFunction(()=>VietPhucWebFeatures.getCompare().length===1);
 await page.locator('#pill-ao-ba-ba').click();await page.evaluate(()=>addCompareLook());
 await page.locator('#pill-ao-yem').click();await page.evaluate(()=>addCompareLook());
 await page.evaluate(()=>addCompareLook());assert.equal(await page.locator('.compare-look').count(),3);
 checks.push({name:'Three actual frozen image comparisons and capacity guard',pass:true});
 let downloadTask=page.waitForEvent('download');await page.locator('#btn-export').click();let download=await downloadTask;
 const exported=await (await import('node:fs/promises')).readFile(await download.path(),'utf8');
 assert.match(exported,/data:image\/png;base64,/);assert.match(exported,/Lookbook Việt phục Remix/);assert.ok(!exported.includes('onerror='));
 downloadTask=page.waitForEvent('download');await page.locator('#studio-capture').click();download=await downloadTask;
 const png=await (await import('node:fs/promises')).readFile(await download.path());assert.equal(png.readUInt32BE(16),960);assert.equal(png.readUInt32BE(20),1240);
 checks.push({name:'Self-contained HTML photo lookbook and 960x1240 PNG export',pass:true});
 await page.locator('#language-toggle').click();assert.equal(await page.locator('html').getAttribute('lang'),'en');
 assert.equal(await page.locator('#btn-save-look').innerText(),'Save look');await page.locator('#pill-ao-dai').click();assert.equal(await page.locator('#btn-save-look').innerText(),'Save look');
 await writeFile(new URL('../assets/review/browser/english-content.txt',import.meta.url),await page.locator('body').innerText());
 await page.locator('#language-toggle').click();assert.equal(await page.locator('#btn-save-look').innerText(),'Lưu mẫu');
 checks.push({name:'VI/EN including dynamically rebuilt controls',pass:true});
 await page.locator('#studio-gender').selectOption('male');await page.locator('#pill-ao-giao-linh').click();
 const shared=await page.evaluate(()=>VietPhucWebFeatures.sharedURL());await page.goto(shared,{waitUntil:'load'});
 assert.equal(await page.evaluate(()=>VietPhucRemix.getOutfit().body.gender),'male');assert.equal(await page.locator('#studio-fallback img').getAttribute('data-photo-key'),'male-ao-giao-linh');
 const invalid={v:1,c:'ao-dai',g:'male',a:[],h:'#FFFFFF',s:'traditional',e:'tet'};
 await page.goto(base+'#look='+encodeURIComponent(JSON.stringify(invalid)),{waitUntil:'load'});
 assert.equal(await page.evaluate(()=>VietPhucRemix.getOutfit().costumeId),'ao-giao-linh','An invalid hash must leave the previous valid selection intact');
 await page.reload({waitUntil:'load'});assert.equal(await page.evaluate(()=>VietPhucRemix.getOutfit().body.gender),'female','A fresh load with an invalid hash must retain the safe default');
 checks.push({name:'Shared recipes round trip and invalid male recipe rejection',pass:true});
 await page.goto(base,{waitUntil:'load'});await page.locator('#studio').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await shot('desktop-mixer.png');
 await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'load'});
 await page.locator('#studio').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await shot('mobile-mixer.png');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No mobile horizontal overflow');
 await page.locator('#studio-gender').selectOption('male');assert.equal(await page.locator('#costume-pills button:disabled').count(),5);
 assert.equal(await page.locator('#mixer-gender').inputValue(),'male');await page.locator('#mixer-gender').selectOption('female');assert.equal(await page.locator('#studio-gender').inputValue(),'female');
 checks.push({name:'390px mobile layout and gender controls',pass:true});
 assert.deepEqual(errors,[],'No browser console/page errors');
 assert.ok(requests.every(url=>url.startsWith('http://127.0.0.1:8067/')||url.startsWith('data:')),'No external APIs or assets required');
 checks.push({name:'No console errors or external requests',pass:true});
 // Missing asset recovery is tested independently so intentional HTTP errors
 // are not mistaken for console failures in the normal app flow.
 const failure=await context.newPage();await failure.route('**/assets/web/female-ao-dai.webp',route=>route.abort());
 await failure.goto(base,{waitUntil:'load'});await failure.waitForFunction(()=>document.querySelector('#studio-fallback img')?.dataset.photoKey==='female-ao-dai-non-la');
 assert.match(await failure.locator('#studio-metrics').innerText(),/Chưa có ảnh/);await failure.close();
 checks.push({name:'Missing photo recovers to a complete allowed image',pass:true});
 const noPhotos=await context.newPage();await noPhotos.route('**/assets/web/*.webp',route=>route.abort());
 await noPhotos.goto(base,{waitUntil:'load'});await noPhotos.locator('#studio-fallback svg').waitFor();assert.equal(await noPhotos.locator('#studio-fallback').getAttribute('data-renderer'),'body-compositor-2d');await noPhotos.close();
 checks.push({name:'All photos unavailable still produces a 2D illustration',pass:true});
 await writeFile(new URL('../assets/review/browser/verification.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),checks,errors},null,2));
 console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser.close();}
