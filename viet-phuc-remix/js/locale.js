// Keyed UI translations; changing language never changes an outfit recipe.
(function(scope){
 'use strict';
 const messages=scope.VietPhucMessages;
 let language=typeof navigator!=='undefined' && /^en\b/i.test(navigator.language||'')?'en':'vi';
 try { const saved=localStorage.getItem('vietPhucLanguage'); if(['vi','en'].includes(saved))language=saved; } catch {}
 const rendered=new Map();
 const ref=key=>({key});
 function parameter(value){
  if(value && typeof value==='object'){
   if(typeof value.key==='string')return t(value.key);
   if(Array.isArray(value.keys))return value.keys.map(key=>t(key)).join(value.separator||', ');
  }
  return String(value??'');
 }
 function t(key,params={}){
  const entry=Object.hasOwn(messages,key)?messages[key]:null;
  if(!entry)return key;
  const value=(entry[language]||entry.vi).replace(/\{(\w+)\}/g,(_,name)=>parameter(params[name]));
  // Let live announcements retain their key and parameters when language changes.
  if(rendered.size>600)rendered.clear();
  rendered.set(value,{key,params});
  return value;
 }
 function label(kind,id){return t(kind+'.'+(kind==='color'?String(id).replace(/^#/,'').toUpperCase():id));}
 function bind(element,key,params={}){
  if(!element)return;
  element.setAttribute('data-i18n',key);
  element.setAttribute('data-i18n-params',JSON.stringify(params));
  element.textContent=t(key,params);
 }
 function trackText(element,value){
  if(typeof element.setAttribute!=='function'){element.textContent=value;return;}
  const staticKey=Object.keys(messages).find(key=>messages[key].vi===value||messages[key].en===value);
  const descriptor=rendered.get(value)||(staticKey?{key:staticKey,params:{}}:null);
  if(descriptor)bind(element,descriptor.key,descriptor.params);
  else {element.removeAttribute('data-i18n');element.removeAttribute('data-i18n-params');element.textContent=value;}
 }
 function apply(){
  if(typeof document==='undefined')return;
  document.documentElement.lang=language;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
   let params={};try{params=JSON.parse(el.getAttribute('data-i18n-params')||'{}');}catch{}
   el.textContent=t(el.getAttribute('data-i18n'),params);
  });
  for(const attr of ['title','alt','aria-label','placeholder','content'])document.querySelectorAll('[data-i18n-'+attr+']').forEach(el=>el.setAttribute(attr,t(el.getAttribute('data-i18n-'+attr))));
  const toggle=document.getElementById('language-toggle');
  if(toggle){toggle.textContent=language==='vi'?'EN':'VI';toggle.setAttribute('aria-label',t(language==='vi'?'language.switchEN':'language.switchVI'));}
 }
 function setLanguage(next){
  if(!['vi','en'].includes(next))return;
  language=next;try{localStorage.setItem('vietPhucLanguage',language);}catch{}
  apply();
  if(typeof CustomEvent!=='undefined')scope.dispatchEvent?.(new CustomEvent('vietphuc:language-change',{detail:{language}}));
 }
 scope.VietPhucLocale=Object.freeze({t,label,ref,bind,trackText,apply,setLanguage,getLanguage:()=>language});
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('language-toggle')?.addEventListener('click',()=>setLanguage(language==='vi'?'en':'vi'));
  apply();
 });
})(typeof window!=='undefined'?window:globalThis);
