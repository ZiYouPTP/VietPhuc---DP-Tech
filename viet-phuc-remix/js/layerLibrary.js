import { LAYER_ITEMS } from './imagePrompt.js';
import { activeLayerIds } from './lookLayers.js';
const memory = new Map();
let database;
const key = (gender,id) => `${gender==='male'?'male':'female'}:${id}`;
function db() {
  if (!database) database = new Promise((resolve,reject)=>{
    if (!globalThis.indexedDB) {reject(new Error('Không có bộ nhớ ảnh trên trình duyệt này.'));return;}
    const request=indexedDB.open('vietphuc-image-layers',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('layers',{keyPath:'key'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
  return database;
}
export async function loadLibrary() {
  const database=await db();
  await new Promise((resolve,reject)=>{
    const request=database.transaction('layers').objectStore('layers').getAll();
    request.onsuccess=()=>{for(const layer of request.result) if(layer && Object.hasOwn(LAYER_ITEMS,layer.id)&&['male','female'].includes(layer.gender)&&layer.key===key(layer.gender,layer.id)&&/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(layer.src))memory.set(layer.key,{...layer,persisted:true});resolve();};
    request.onerror=()=>reject(request.error);
  });
}
export function getLayer(gender,id) {return memory.get(key(gender,id));}
export function layersForLook(config) {
  return [...activeLayerIds(config)].map(id=>getLayer(config.body?.gender,id)).filter(Boolean).sort((a,b)=>a.zIndex-b.zIndex);
}
export function validateLayerGeometry(width,height,gender) {
  const expected=gender==='male'?118/308:105/290;
  if(width*height>16000000)throw new Error('Ảnh quá lớn. Dùng PNG dưới 16 triệu điểm ảnh.');
  if(Math.abs(width/height/expected-1)>.02)throw new Error(`Khung PNG chưa đúng tỉ lệ body ${gender==='male'?'nam (118:308)':'nữ (105:290)'}. Giữ cả canvas body, không cắt sát món đồ.`);
}
export async function importLayer(file,gender,id) {
  if(!Object.hasOwn(LAYER_ITEMS,id))throw new Error('Món đồ không hợp lệ.');
  if(!file||file.type!=='image/png')throw new Error('Hãy chọn ảnh PNG nền trong suốt.');
  if(file.size>6*1024*1024)throw new Error('Ảnh vượt quá 6 MB. Hãy giảm kích thước PNG.');
  const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Không đọc được ảnh.'));reader.readAsDataURL(file);});
  const img=new Image();img.src=src;await img.decode();
  validateLayerGeometry(img.naturalWidth,img.naturalHeight,gender);
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let transparent=0,visible=0;
  for(let i=3;i<pixels.length;i+=4){if(pixels[i]<16)transparent++;if(pixels[i]>32)visible++;}
  if(transparent<canvas.width*canvas.height*.05)throw new Error('PNG chưa có nền trong suốt thật. Hãy xóa nền trước khi nhập.');
  if(!visible)throw new Error('Ảnh rỗng, chưa có món đồ.');
  const layer={key:key(gender,id),id,gender,src,zIndex:LAYER_ITEMS[id].zIndex,name:file.name};
  memory.set(layer.key,layer);
  try {
    const database=await db();
    await new Promise((resolve,reject)=>{const tx=database.transaction('layers','readwrite');tx.objectStore('layers').put(layer);tx.oncomplete=resolve;tx.onerror=()=>reject(new Error('Không lưu được ảnh.'));tx.onabort=tx.onerror;});
    layer.persisted=true;
  } catch {layer.persisted=false;}
  return layer;
}
export async function removeLayer(gender,id) {
  const sessionOnly=getLayer(gender,id)?.persisted===false;
  try {
    const database=await db();
    await new Promise((resolve,reject)=>{const tx=database.transaction('layers','readwrite');tx.objectStore('layers').delete(key(gender,id));tx.oncomplete=resolve;tx.onerror=()=>reject(new Error('Không bỏ được ảnh đã nhập.'));tx.onabort=tx.onerror;});
  } catch(error) { if(!sessionOnly)throw error; }
  memory.delete(key(gender,id));
}
