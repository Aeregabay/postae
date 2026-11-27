/* i18n für Fetchy: Wörterbücher aus i18n/<code>.json, Fallback-Kette (nl-BE→nl→de, sonst →de), Intl-Formatierer. Browser + Node. */
export const LANGS=[
 {code:'de',name:'Deutsch',locale:'de-CH'},
 {code:'en',name:'English',locale:'en-GB'},
 {code:'fr',name:'Français',locale:'fr-CH'},
 {code:'es',name:'Español',locale:'es-ES'},
 {code:'it',name:'Italiano',locale:'it-CH'},
 {code:'nl',name:'Nederlands',locale:'nl-NL'},
 {code:'nl-BE',name:'Vlaams (België)',locale:'nl-BE'},
 {code:'pt',name:'Português',locale:'pt-PT'},
 {code:'pl',name:'Polski',locale:'pl-PL'}];
export const DEFAULT_LANG='de',LS_KEY='pq.lang';
const FALLBACK={'nl-BE':['nl-BE','nl','de']};
const chainOf=c=>FALLBACK[c]||[...new Set([c,DEFAULT_LANG])];
const IS_NODE=typeof process!=='undefined'&&!!process.versions?.node&&typeof document==='undefined';
const isLang=c=>LANGS.some(l=>l.code===c);

let cur=DEFAULT_LANG,dicts=[],loc=LANGS[0].locale,plural=new Intl.PluralRules(loc);
const cache=new Map(),subs=new Set(),warned=new Set();

async function loadDict(code){
 if(cache.has(code))return cache.get(code);
 let d={};
 try{
  if(IS_NODE){const fs=await import('node:fs/promises');d=JSON.parse(await fs.readFile(new URL(`./i18n/${code}.json`,import.meta.url),'utf8'))}
  else{const r=await fetch(new URL(`./i18n/${code}.json`,import.meta.url));if(r.ok)d=await r.json()}
 }catch{d={}}
 cache.set(code,d);return d}

/* Gespeicherte Wahl, sonst navigator.languages, sonst 'de' */
export function detectLang(){
 if(IS_NODE)return DEFAULT_LANG;
 try{const s=localStorage.getItem(LS_KEY);if(s&&isLang(s))return s}catch{}
 for(const tag of navigator.languages||[navigator.language]){
  const [b,r]=String(tag||'').split('-'),base=(b||'').toLowerCase(),reg=(r||'').toUpperCase();
  if(base==='nl'&&reg==='BE')return'nl-BE';
  if(isLang(base))return base}
 return DEFAULT_LANG}

export async function setLang(code,{save=true}={}){
 if(!isLang(code))code=DEFAULT_LANG;
 dicts=await Promise.all(chainOf(code).map(loadDict));
 cur=code;loc=LANGS.find(l=>l.code===code).locale;plural=new Intl.PluralRules(loc);
 if(save&&!IS_NODE)try{localStorage.setItem(LS_KEY,code)}catch{}
 if(typeof document!=='undefined')document.documentElement.lang=loc;
 subs.forEach(f=>{try{f(code)}catch{}})}
export const init=()=>setLang(detectLang(),{save:false});
export const onLangChange=f=>{subs.add(f);return()=>subs.delete(f)};
export const lang=()=>cur,locale=()=>loc;

const find=key=>{for(const d of dicts){const v=d[key];if(v!==undefined)return v}
 if(!warned.has(key)){warned.add(key);if(typeof console!=='undefined')console.warn('[i18n] missing key',key)}return undefined};
const fill=(s,vars)=>vars?s.replace(/\{(\w+)\}/g,(m,k)=>vars[k]??''):s;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* t('settings.title', {name}) – Platzhalter {name}; Plural-Objekt → 'other' */
export function t(key,vars){const v=find(key);if(v===undefined)return key;return fill(typeof v==='object'?(v.other??key):v,vars)}
/* tp('sync.waiting', 3, {…}) – wählt per Intl.PluralRules (zero/one/two/few/many/other); {count} ist automatisch gesetzt */
export function tp(key,count,vars){const v=find(key);if(v===undefined)return key;
 if(typeof v!=='object')return fill(v,{count:fmtNum(count),...vars});
 const s=v[String(count)]??v[count===0?'zero':'']??v[plural.select(count)]??v.other??key;return fill(s,{count:fmtNum(count),...vars})}
/* Wie t(), aber Variablen werden HTML-escaped (für Texte mit <b>/<i>-Markup in innerHTML) */
export function th(key,vars){const e={};for(const k in vars||{})e[k]=esc(vars[k]);return t(key,e)}

/* Formatierer (aktive Locale, Standard de-CH) */
const MONEY_TWEAK={'de-CH':{group:"'",space:' '}};
export function fmtMoney(cents,currency='CHF',{sign=false}={}){
 const c=Math.round(Number(cents)||0),tw=MONEY_TWEAK[loc]||{};
 const parts=new Intl.NumberFormat(loc,{style:'currency',currency}).formatToParts(Math.abs(c)/100);
 const s=parts.map(p=>p.type==='group'&&tw.group?tw.group:p.type==='literal'&&tw.space?tw.space:p.value).join('');
 return(c<0?'−':sign&&c>0?'+':'')+s}
export const fmtDate=(d,opts={day:'2-digit',month:'2-digit',year:'numeric'})=>new Intl.DateTimeFormat(loc,opts).format(d instanceof Date?d:new Date(d));
export const fmtNum=(n,opts)=>new Intl.NumberFormat(loc,opts).format(n);

/* Stabile interne IDs (Kategorien/Laden-Arten/Einheiten stehen als deutsche Namen in der DB) → Übersetzungsschlüssel. Nur Anzeige, DB-Werte bleiben unverändert. */
const CAT_SLUG={'Früchte & Gemüse':'fruit_veg','Brot & Gebäck':'bakery','Milch & Käse':'dairy','Fleisch & Fisch':'meat_fish','Vorräte':'pantry','Tiefkühl':'frozen','Getränke':'drinks','Snacks & Süsses':'snacks','Haushalt':'household','Körperpflege':'personal_care','Apotheke':'pharmacy','Küche & Haushaltswaren':'kitchenware','Werkzeug & Baumarkt':'tools','Elektro & Technik':'electronics','Papeterie & Büro':'stationery','Wohnen & Deko':'home_deco','Garten & Pflanzen':'garden','Tierbedarf':'pets','Kleidung & Textil':'clothing','Baby & Kind':'baby','Sport & Freizeit':'sports','Auto & Velo':'auto_bike','Sonstiges':'other'};
const KIND_SLUG={Lebensmittel:'food',Drogerie:'drugstore',Apotheke:'pharmacy',Baumarkt:'hardware',Wohnen:'home',Sonstige:'other'};
const UNIT_SLUG={Stk:'pcs',Pack:'pack',g:'g',kg:'kg',ml:'ml',l:'l'};
const via=(map,pre)=>id=>map[id]?t(pre+map[id]):id;
export const catName=via(CAT_SLUG,'cat.'),kindName=via(KIND_SLUG,'kind.'),unitName=via(UNIT_SLUG,'unit.');

if(IS_NODE)await setLang(DEFAULT_LANG,{save:false});
