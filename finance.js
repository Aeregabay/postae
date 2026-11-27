/* Finanzen (optional) – Abrechnung für Fetchy. Reine Logik oben (ohne DOM, testbar), UI unten (createFinance). */

import { t as T, tp as TP, fmtMoney, fmtDate, catName } from './i18n.js';

/* ---------- Reine Logik ---------- */
export const DEFAULT_MEMBERS=[
 {email:'a.gabay94@gmail.com',name:'Arik',color:'#3E6B9E',sort:1},
 {email:'erika.ogol@gmail.com',name:'Erika',color:'#C0567A',sort:2}];

/* Rappen → «CHF 1'234.50» (de-CH); negativ mit Minus, optional «+» bei positiv. Formatierung via i18n.fmtMoney (aktive Locale) */
export function fmtCHF(c,{sign=false}={}){return fmtMoney(c,'CHF',{sign})}
export const fmtPlain=c=>{c=Math.round(Number(c)||0);const a=Math.abs(c);return(c<0?'-':'')+Math.floor(a/100)+'.'+String(a%100).padStart(2,'0')};

/* Eingabe («12,5», «1'234.50», «CHF 9») → Rappen oder null */
export function parseAmount(s){
 if(s==null)return null;let t=String(s).trim().replace(/CHF|Fr\.?/gi,'').replace(/[\s'’`´]/g,'');if(!t)return null;
 const ls=Math.max(t.lastIndexOf(','),t.lastIndexOf('.'));let ip=t,fp='';
 if(ls>=0){ip=t.slice(0,ls).replace(/[.,]/g,'');fp=t.slice(ls+1);if(fp.length>2){ip+=fp;fp=''}}
 if(!/^\d*$/.test(ip)||!/^\d*$/.test(fp)||(ip===''&&fp===''))return null;
 return(parseInt(ip||'0',10))*100+parseInt((fp+'00').slice(0,2),10)}

/* Betrag exakt nach Gewichten verteilen, auf Rappen gerundet (Largest-Remainder): Summe der Anteile == total.
   weights: {key: Gewicht>0}. Negative Totale (Einnahmen) werden gespiegelt. */
export function allocate(total,weights){
 const keys=Object.keys(weights||{}).filter(k=>Number(weights[k])>0),out={};if(!keys.length)return out;
 total=Math.round(total||0);const s=total<0?-1:1,a=Math.abs(total);
 const w=keys.map(k=>Math.max(1,Math.round(Number(weights[k])*1000))),W=w.reduce((x,y)=>x+y,0);
 const rows=keys.map((k,i)=>{const num=a*w[i],fl=Math.floor(num/W);return{k,i,fl,rem:num-fl*W}});
 let left=a-rows.reduce((x,r)=>x+r.fl,0);
 [...rows].sort((x,y)=>y.rem-x.rem||x.i-y.i).forEach(r=>{if(left>0){r.fl++;left--}});
 for(const r of rows)out[r.k]=r.fl?s*r.fl:0;return out}

/* Salden über alle Einträge. Ausgabe: Zahler zahlt amount, Betroffene tragen Anteile.
   Einnahme: negativer Betrag (Empfänger hält Geld, Betroffene werden gutgeschrieben).
   Ausgleich: Zahler = Sender, shares {Empfänger:1} → Sender zahlt, Empfänger trägt. */
export function settle(expenses,emails=[]){
 const P={};const g=e=>P[e]||(P[e]={paid:0,share:0,bal:0});emails.forEach(g);
 for(const x of expenses||[]){const amt=Math.round(x.amount_cents||0);if(!amt||!x.payer)continue;
  const signed=x.kind==='income'?-amt:amt;g(x.payer).paid+=signed;
  const al=allocate(signed,x.shares&&Object.keys(x.shares).length?x.shares:{[x.payer]:1});
  if(Object.keys(al).length)for(const k in al)g(k).share+=al[k];else g(x.payer).share+=signed}
 for(const e in P)P[e].bal=P[e].paid-P[e].share;return P}

/* Gierig: grösster Schuldner → grösster Gläubiger (≤ n−1 Überweisungen) */
export function simplify(bals){
 const c=[],d=[];for(const[k,v]of Object.entries(bals)){const b=typeof v==='object'?v.bal:v;if(b>0)c.push([k,b]);else if(b<0)d.push([k,-b])}
 const srt=(x,y)=>y[1]-x[1]||(x[0]<y[0]?-1:x[0]>y[0]?1:0),out=[];
 while(c.length&&d.length){c.sort(srt);d.sort(srt);const t=Math.min(c[0][1],d[0][1]);out.push({from:d[0][0],to:c[0][0],cents:t});c[0][1]-=t;d[0][1]-=t;if(!c[0][1])c.shift();if(!d[0][1])d.shift()}
 return out}

/* Klartext für WhatsApp / Zwischenablage */
export function summaryText(transfers,people,nameOf,date=new Date()){
 const L=[T('fin.sum_title',{date:fmtDate(date)}),''];
 if(!transfers.length)L.push(T('fin.sum_even'));else transfers.forEach(t=>L.push(T('fin.sum_line',{from:nameOf(t.from),to:nameOf(t.to),amt:fmtCHF(t.cents)})));
 L.push('');for(const[e,p]of Object.entries(people))L.push(T('fin.sum_person',{name:nameOf(e),paid:fmtCHF(p.paid),share:fmtCHF(p.share),bal:fmtCHF(p.bal,{sign:true})}));
 return L.join('\n')}

/* Zeitraum: Monat/Jahr/Alles. Rückgabe {from,to} (to exklusiv) als YYYY-MM-DD oder null für alles. */
export const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function periodRange(mode,ref){
 if(mode==='all')return null;const y=ref.getFullYear(),m=ref.getMonth();
 return mode==='year'?{from:ymd(new Date(y,0,1)),to:ymd(new Date(y+1,0,1))}:{from:ymd(new Date(y,m,1)),to:ymd(new Date(y,m+1,1))}}
export const inPeriod=(date,r)=>!r||(String(date||'')>=r.from&&String(date||'')<r.to);
export function shiftRef(mode,ref,dir){return mode==='year'?new Date(ref.getFullYear()+dir,ref.getMonth(),1):new Date(ref.getFullYear(),ref.getMonth()+dir,1)}
export const cmpEntries=(a,b)=>String(b.date).localeCompare(String(a.date))||String(b.created_at||'').localeCompare(String(a.created_at||''));
/* Summe pro Schlüssel (nur Ausgaben), absteigend */
export function breakdown(list,keyFn){const m=new Map();for(const x of list)if(x.kind==='expense'){const k=keyFn(x);m.set(k,(m.get(k)||0)+x.amount_cents)}return[...m].map(([key,cents])=>({key,cents})).sort((a,b)=>b.cents-a.cents)}

/* ---------- UI ---------- */
const CSS=`
#tabbar{position:fixed;left:0;right:0;bottom:0;z-index:90;display:none;justify-content:center;padding:6px 16px calc(6px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--bg) 86%,transparent);-webkit-backdrop-filter:saturate(1.6) blur(18px);backdrop-filter:saturate(1.6) blur(18px);border-top:1px solid var(--line)}
body.fin-on #tabbar{display:flex}#tabbar button{flex:1;max-width:200px;min-height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:11px;font-weight:600;color:var(--mut)}
#tabbar button[aria-current=page]{color:var(--acc-d)}#tabbar svg,.fin svg.fi{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
body.fin-on .wrap{padding-bottom:calc(150px + env(safe-area-inset-bottom))}body.fin-on #toast{bottom:calc(72px + env(safe-area-inset-bottom))}body.fcard-on #toast{bottom:calc(80px + env(safe-area-inset-bottom) + var(--fch,200px))}
#finview{position:fixed;inset:0;z-index:80;display:none;overflow-y:auto;overscroll-behavior:contain;background:var(--bg);padding:calc(14px + env(safe-area-inset-top)) 16px calc(160px + env(safe-area-inset-bottom))}
body.fin-tab #finview{display:block}#finview>div{max-width:560px;margin:0 auto}
.fin h2{margin:4px 0 12px;font-size:28px;font-weight:700;letter-spacing:-.01em}
.fseg{display:flex;background:color-mix(in srgb,var(--fg) 7%,transparent);border-radius:10px;padding:2px;gap:2px}.fseg button{flex:1;min-height:34px;border-radius:8px;font-weight:600;font-size:14px;color:var(--mut)}.fseg button.on{background:var(--card);color:var(--fg);box-shadow:var(--sh)}
.fnav{display:flex;align-items:center;justify-content:space-between;margin:10px 0 0}.fnav b{font-weight:650}.fnav button{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;color:var(--acc-d)}.fnav button[hidden]{display:block;visibility:hidden}
.fc{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:16px;margin-top:14px}.fc h4{margin:0 0 10px;font-size:12px;font-weight:650;color:var(--mut);text-transform:uppercase;letter-spacing:.05em}
.fbig{font-size:32px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.fsub{font-size:13px;color:var(--mut);margin-top:2px}
.fpp{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px}.fpp div{display:flex;align-items:center;gap:8px;font-size:14px;font-variant-numeric:tabular-nums}.fpp .av,.fe .av{width:26px;height:26px;font-size:10px}
.ft{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}.ft th{font-size:12px;color:var(--mut);font-weight:600;text-align:right;padding:0 0 6px}.ft th:first-child,.ft td:first-child{text-align:left}.ft td{text-align:right;padding:7px 0;border-top:1px solid var(--line)}.ft td:first-child{display:flex;align-items:center;gap:8px}.ft .av{width:24px;height:24px;font-size:9px}
.fpos{color:var(--acc-d);font-weight:650}.fneg{color:var(--danger);font-weight:650}
.ftr{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line)}.ftr:first-of-type{border-top:0}.ftr .tx{flex:1;font-weight:600;font-variant-numeric:tabular-nums}.ftr .btn{min-height:38px;padding:0 12px;font-size:13px}
.fok{display:flex;align-items:center;gap:10px;color:var(--acc-d);font-weight:650;padding:6px 0}.fok svg.fi{width:22px;height:22px}
.fact{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}.fact .btn{flex:1;min-height:42px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;text-decoration:none;color:var(--fg);white-space:nowrap}
.fb2{display:grid;grid-template-columns:minmax(70px,110px) 1fr auto;gap:10px;align-items:center;margin:9px 0;font-size:14px}.fb2 span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fb2 em{display:block;height:10px;border-radius:5px;background:color-mix(in srgb,var(--fg) 7%,transparent)}.fb2 em i{display:block;height:100%;border-radius:5px;background:var(--c,var(--acc))}.fb2 b{font-weight:600;font-variant-numeric:tabular-nums;font-size:13px}
.fdh{margin:20px 4px 6px;font-size:13px;font-weight:650;color:var(--mut)}.fgrp{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:0 14px}
.fe{display:flex;align-items:center;gap:12px;width:100%;text-align:left;min-height:60px;padding:8px 0;border-top:1px solid var(--line)}.fe:first-child{border-top:0}
.fei{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--cc,var(--acc)) 18%,transparent)}.fei .ico,.fei svg.fi{width:22px;height:22px}.fei svg.fi{color:color-mix(in srgb,var(--cc,var(--acc)) 58%,#000)}
.fet{flex:1;min-width:0}.fet b{display:block;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fet small{display:block;color:var(--mut);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fea{font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap}.fea.in{color:var(--acc-d)}.fea.st{color:var(--mut)}
.fempty{text-align:center;color:var(--mut);padding:28px 0}
#ffab{position:fixed;right:18px;bottom:calc(78px + env(safe-area-inset-bottom));z-index:85;display:none;align-items:center;gap:6px;min-height:50px;padding:0 20px 0 16px;border-radius:999px;background:var(--acc);color:var(--on);font-weight:650;box-shadow:0 6px 18px rgba(20,30,25,.25)}body.fin-tab #ffab{display:flex}#ffab svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.fch{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--bg);font-size:14px;font-weight:550;color:var(--fg)}.fch.on{background:var(--acc-s);border-color:var(--acc);color:var(--acc-d)}.fch i{width:10px;height:10px;border-radius:50%;background:var(--c)}
.fcc{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
#fcard{position:fixed;left:12px;right:12px;bottom:calc(72px + env(safe-area-inset-bottom));max-width:520px;margin:0 auto;z-index:95;background:var(--card);border-radius:20px;padding:14px 16px 14px;box-shadow:0 10px 34px rgba(0,0,0,.2),0 0 0 1px var(--line);transform:translateY(140%);opacity:0;pointer-events:none;transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .2s}
#fcard.show{transform:none;opacity:1;pointer-events:auto}#fcard b.t{display:block;font-size:16px;font-weight:650;margin-bottom:10px;padding-right:4px}
.fci{display:flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--bg);border-radius:12px;padding:0 14px;height:48px}.fci:focus-within{border-color:var(--acc)}.fci span{color:var(--mut);font-weight:600}.fci input{flex:1;min-width:0;height:100%;border:0;background:transparent;outline:0;font-size:20px;font-weight:650;color:var(--fg);font-variant-numeric:tabular-nums}
#fcard .row{margin-top:12px}#fcard .btn{min-height:44px}
.fsr{display:flex;align-items:center;gap:10px;margin-top:8px}.fsr .fch{flex:1;justify-content:flex-start}.fsr .fw{display:flex;align-items:center;gap:6px;color:var(--mut);font-size:13px}.sh .fsr input.fwi{width:72px;flex:none;text-align:center}
.fm{display:flex;align-items:center;gap:12px;padding:8px 16px}.fm input[type=color]{flex:none;width:36px;height:36px;border:0;padding:0;background:none;border-radius:50%;overflow:hidden}.fm input[type=color]::-webkit-color-swatch-wrapper{padding:0}.fm input[type=color]::-webkit-color-swatch{border:0;border-radius:50%}.sh .fm input.fmn{flex:1;min-width:0}
.fdet{margin:16px 0 0;padding:12px 14px;border-radius:12px;background:var(--acc-s);color:var(--acc-d);font-size:14px;font-weight:550}
`;
const SVG={
 list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".6"/><circle cx="4" cy="12" r=".6"/><circle cx="4" cy="18" r=".6"/>',
 fin:'<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16.5 14.5h1"/>',
 prev:'<path d="M15 5l-7 7 7 7"/>',next:'<path d="M9 5l7 7-7 7"/>',plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
 inc:'<path d="M12 4v13M6 12l6 6 6-6"/>',swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>'};
const svg=n=>`<svg class="fi" viewBox="0 0 24 24" aria-hidden="true">${SVG[n]}</svg>`;

export function createFinance(ctx){
 const{sb,S,$,$$,esc,LS,uid,now,toast,sheet,closeSheet,enqueue,avHTML,ICO,ecat,categoryColor,categoryIcon,guessCategory,inShop,shHead,askConfirm,who,pending}=ctx;
 const F={settings:{enabled:false,prompt_on_check:true,currency:'CHF'},members:[],expenses:[],tab:'list',mode:'month',ref:new Date(),dom:null,card:null,recent:[]};
 {const c=LS.get('pq.fin',null);if(c){F.settings={...F.settings,...(c.settings||{})};F.members=c.members||[];F.expenses=c.expenses||[]}}
 const save=()=>LS.set('pq.fin',{settings:F.settings,members:F.members,expenses:F.expenses});
 const money=(c,o)=>fmtMoney(c,F.settings.currency||'CHF',o),cur=()=>F.settings.currency||'CHF';
 const me=()=>S.user?.email||'';
 const MEM=()=>F.members.length?F.members:DEFAULT_MEMBERS;
 const mem=e=>MEM().find(m=>m.email===e)||{email:e,name:who(e),color:'#8a928d'};
 const emails=()=>MEM().map(m=>m.email);
 const partner=()=>MEM().find(m=>m.email!==me())||null;
 const nm=e=>e===me()?mem(e).name:mem(e).name;
 const av=e=>{const m=mem(e);return avHTML({color:m.color,name:m.name})};
 const today=()=>ymd(new Date());
 const storeOf=id=>S.stores.find(s=>s.id===id);
 const sorted=()=>[...F.expenses].sort(cmpEntries);
 const rafQ=(k,fn)=>{if(F[k])return;F[k]=requestAnimationFrame(()=>{F[k]=0;fn()})};

 /* --- Daten --- */
 async function load(){
  try{const[s,m,x]=await Promise.all([sb.from('settings').select('*').eq('key','finance').maybeSingle(),sb.from('members').select('*').order('sort'),sb.from('expenses').select('*').order('date',{ascending:false}).order('created_at',{ascending:false})]);
   if(s.error||m.error||x.error)throw new Error('fin');
   if(s.data?.value)F.settings={...F.settings,...s.data.value};if(m.data?.length)F.members=m.data;if(!pending?.())F.expenses=x.data||[];save()}catch{}
  apply()}
 function subscribe(chan){
  chan.on('postgres_changes',{event:'*',schema:'public',table:'expenses'},p=>{
   if(p.eventType==='DELETE'){F.expenses=F.expenses.filter(x=>x.id!==p.old.id)}
   else{const i=F.expenses.findIndex(x=>x.id===p.new.id);if(i>=0)F.expenses[i]=p.new;else F.expenses.push(p.new)}changed()});
  chan.on('postgres_changes',{event:'*',schema:'public',table:'settings'},p=>{if(p.new?.key==='finance'&&p.new.value){F.settings={...F.settings,...p.new.value};changed()}});
  chan.on('postgres_changes',{event:'*',schema:'public',table:'members'},p=>{
   if(p.eventType==='DELETE')F.members=F.members.filter(m=>m.email!==p.old.email);
   else{const i=F.members.findIndex(m=>m.email===p.new.email);if(i>=0)F.members[i]=p.new;else F.members.push(p.new);F.members.sort((a,b)=>(a.sort||0)-(b.sort||0))}changed()})}
 const changed=()=>{save();apply()};
 function reset(){F.expenses=[];F.members=[];F.settings={enabled:false,prompt_on_check:true,currency:'CHF'};F.tab='list';F.recent=[];LS.set('pq.fin',null);apply()}

 function addEntry(o){const t=now(),row={id:uid(),kind:'expense',note:null,store_id:null,category:null,item_ids:[],created_by:me(),created_at:t,updated_at:t,...o};
  F.expenses.push(row);enqueue({t:'expenses',o:'insert',d:row});changed();return row}
 function editEntry(id,patch){const x=F.expenses.find(e=>e.id===id);if(!x)return;Object.assign(x,patch,{updated_at:now()});enqueue({t:'expenses',o:'update',id,d:{...patch,updated_at:x.updated_at}});changed()}
 function delEntry(id){F.expenses=F.expenses.filter(e=>e.id!==id);enqueue({t:'expenses',o:'delete',id});changed()}
 function setSettings(patch){F.settings={...F.settings,...patch};enqueue({t:'settings',o:'upsert',k:'key',d:{key:'finance',value:F.settings}});changed()}

 /* --- Grundgerüst --- */
 function ensureDOM(){if(F.dom)return;
  const st=document.createElement('style');st.textContent=CSS;document.head.append(st);
  const nav=document.createElement('nav');nav.id='tabbar';
  const view=document.createElement('div');view.id='finview';view.className='fin';view.setAttribute('role','region');
  const fab=document.createElement('button');fab.id='ffab';fab.type='button';fab.className='fin';
  const card=document.createElement('div');card.id='fcard';card.setAttribute('role','group');
  document.body.append(view,fab,nav,card);F.dom={nav,view,fab};F.card=card;relabel();
  nav.onclick=e=>{const b=e.target.closest('[data-tab]');if(b)setTab(b.dataset.tab)};
  fab.onclick=()=>openEntry();
  view.onclick=viewClick;initCard()}
 function relabel(){if(!F.dom)return;const{nav,view,fab}=F.dom;
  nav.setAttribute('aria-label',T('fin.nav_aria'));nav.innerHTML=`<button type="button" data-tab="list">${svg('list')}<span>${esc(T('fin.tab_list'))}</span></button><button type="button" data-tab="fin">${svg('fin')}<span>${esc(T('fin.tab_fin'))}</span></button>`;renderNav();
  view.setAttribute('aria-label',T('fin.title'));fab.innerHTML=`${svg('plus')}<span>${esc(T('fin.fab'))}</span>`;F.card.setAttribute('aria-label',T('fin.card_aria'));
  if(F.tab==='fin'&&F.settings.enabled)renderView();if(C.cur)drawCard()}
 function setTab(t){F.tab=t;if(t==='fin')closeCard();document.body.classList.toggle('fin-tab',t==='fin'&&F.settings.enabled);renderNav();if(t==='fin')renderView()}
 function renderNav(){$$('#tabbar button').forEach(b=>{if(b.dataset.tab===F.tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
 function apply(){const on=!!S.user&&!!F.settings.enabled;
  document.body.classList.toggle('fin-on',on);
  if(!on){F.tab='list';document.body.classList.remove('fin-tab','fcard-on');if(F.card)closeCard()}
  else{ensureDOM();document.body.classList.toggle('fin-tab',F.tab==='fin');renderNav();if(F.tab==='fin')rafQ('vq',renderView)}
  F.redraw?.()}

 /* --- Finanzen-Tab --- */
 const MON={format:d=>fmtDate(d,{month:'long',year:'numeric'})},DAY={format:d=>fmtDate(d,{weekday:'long',day:'numeric',month:'long'})};
 const parseYmd=s=>{const[y,m,d]=String(s).split('-').map(Number);return new Date(y,(m||1)-1,d||1)};
 const dayLabel=s=>{if(s===today())return T('day.today');const y=new Date();y.setDate(y.getDate()-1);if(s===ymd(y))return T('day.yesterday');return DAY.format(parseYmd(s))};
 const bar=(label,cents,max,color)=>`<div class="fb2"><span>${esc(label)}</span><em><i style="width:${max?Math.max(3,cents/max*100):0}%;--c:${color}"></i></em><b>${money(cents)}</b></div>`;
 function entryRow(x){
  const cat=x.category||'Sonstiges',st=storeOf(x.store_id);let ico,sub,amt,cls='';
  if(x.kind==='settlement'){const to=Object.keys(x.shares||{})[0];ico=svg('swap');sub=esc(T('fin.row_settlement',{from:nm(x.payer),to:nm(to)}));amt=money(x.amount_cents);cls=' st'}
  else if(x.kind==='income'){ico=svg('inc');sub=`${esc(T('fin.row_income'))}${st?' · '+esc(st.name):''}`;amt=money(x.amount_cents,{sign:true});cls=' in'}
  else{ico=ICO(categoryIcon(cat));const ks=Object.keys(x.shares||{}),all=emails().every(e=>ks.includes(e));
   sub=[st?esc(st.name):'',esc(all?T('fin.row_shared'):ks.length===1?T('fin.row_only',{name:nm(ks[0])}):T('fin.row_split'))].filter(Boolean).join(' · ');amt=money(x.amount_cents)}
  const c=x.kind==='expense'?categoryColor(cat):'var(--acc)';
  return`<button type="button" class="fe" data-e="${x.id}" aria-label="${esc(T('fin.row_aria',{desc:x.description,amt}))}"><span class="fei" style="--cc:${c}">${ico}</span><span class="fet"><b>${esc(x.description)}</b><small>${sub}</small></span>${av(x.payer)}<span class="fea${cls}">${amt}</span></button>`}
 function renderView(){const v=F.dom?.view;if(!v||!F.settings.enabled)return;
  const sc=v.scrollTop,all=sorted(),R=periodRange(F.mode,F.ref),per=all.filter(x=>inPeriod(x.date,R)&&x.kind!=='settlement');
  const exp=per.filter(x=>x.kind==='expense'),inc=per.filter(x=>x.kind==='income'),sE=exp.reduce((a,x)=>a+x.amount_cents,0),sI=inc.reduce((a,x)=>a+x.amount_cents,0);
  const people=settle(all,emails()),tr=simplify(people);
  const label=F.mode==='month'?MON.format(F.ref):F.mode==='year'?String(F.ref.getFullYear()):T('fin.period_all');
  const paid=emails().map(e=>`<div>${av(e)}<span>${esc(nm(e))} <b>${money(exp.filter(x=>x.payer===e).reduce((a,x)=>a+x.amount_cents,0))}</b></span></div>`).join('');
  const text=summaryText(tr,people,nm);
  let h=`<div><h2>${esc(T('fin.title'))}</h2><div class="fseg" role="group" aria-label="${esc(T('fin.period_aria'))}">${['month','year','all'].map(k=>`<button type="button" data-m="${k}" aria-pressed="${F.mode===k}" class="${F.mode===k?'on':''}">${esc(T('fin.mode_'+k))}</button>`).join('')}</div>
<div class="fnav"><button type="button" data-n="-1" aria-label="${esc(T('fin.prev'))}"${F.mode==='all'?' hidden':''}>${svg('prev')}</button><b>${esc(label)}</b><button type="button" data-n="1" aria-label="${esc(T('fin.next'))}"${F.mode==='all'?' hidden':''}>${svg('next')}</button></div>
<section class="fc"><h4>${esc(T('fin.total'))}</h4><div class="fbig">${money(sE-sI)}</div><div class="fsub">${esc(TP('fin.count',exp.length))}${sI?esc(T('fin.minus_income',{amt:money(sI)})):''}</div><div class="fpp">${paid}</div></section>
<section class="fc"><h4>${esc(T('fin.settle'))}</h4>`;
  if(tr.length)h+=tr.map((t,i)=>`<div class="ftr"><span class="tx">${esc(nm(t.from))} → ${esc(nm(t.to))} ${money(t.cents)}</span><button type="button" class="btn" data-pay="${i}">${esc(T('fin.mark_paid'))}</button></div>`).join('');
  else h+=`<div class="fok">${svg('check')}${esc(T('fin.all_even'))}</div>`;
  h+=`<table class="ft" style="margin-top:12px"><thead><tr><th></th><th>${esc(T('fin.col_paid'))}</th><th>${esc(T('fin.col_share'))}</th><th>${esc(T('fin.col_balance'))}</th></tr></thead><tbody>${emails().map(e=>{const p=people[e];return`<tr><td>${av(e)}${esc(nm(e))}</td><td>${money(p.paid)}</td><td>${money(p.share)}</td><td class="${p.bal>0?'fpos':p.bal<0?'fneg':''}">${money(p.bal,{sign:true})}</td></tr>`}).join('')}</tbody></table>
<div class="fsub" style="margin-top:8px">${esc(T('fin.balance_hint'))}</div>
<div class="fact"><a class="btn" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${esc(T('fin.whatsapp'))}</a><button type="button" class="btn" data-copy>${esc(T('fin.copy_text'))}</button></div></section>`;
  const bs=breakdown(per,x=>x.store_id||''),bc=breakdown(per,x=>x.category||'Sonstiges');
  if(bs.length)h+=`<section class="fc"><h4>${esc(T('fin.by_store'))}</h4>${bs.map(r=>{const s=storeOf(r.key);return bar(s?s.name:T('fin.no_store'),r.cents,bs[0].cents,s?.color&&/^#[0-9a-f]{6}$/i.test(s.color)?s.color:'var(--mut)')}).join('')}</section>`;
  if(bc.length)h+=`<section class="fc"><h4>${esc(T('fin.by_cat'))}</h4>${bc.map(r=>bar(catName(r.key),r.cents,bc[0].cents,categoryColor(r.key))).join('')}</section>`;
  const list=all.filter(x=>inPeriod(x.date,R));
  if(!list.length)h+=`<div class="fempty">${esc(T('fin.empty'))}</div>`;
  else{const g=new Map();for(const x of list)(g.get(x.date)||g.set(x.date,[]).get(x.date)).push(x);
   for(const[d,a]of g)h+=`<div class="fdh">${esc(dayLabel(d))}</div><div class="fgrp">${a.map(entryRow).join('')}</div>`}
  v.innerHTML=h+'</div>';v.scrollTop=sc;F.tr=tr;F.text=text}
 async function viewClick(e){const b=e.target.closest('button');if(!b)return;
  if(b.dataset.m){F.mode=b.dataset.m;renderView()}
  else if(b.dataset.n){F.ref=shiftRef(F.mode,F.ref,+b.dataset.n);renderView()}
  else if(b.dataset.e)openEntry(b.dataset.e);
  else if(b.dataset.copy!==undefined){try{await navigator.clipboard.writeText(F.text);toast(T('fin.copied'))}catch{toast(T('common.copy_failed'))}}
  else if(b.dataset.pay!==undefined){const t=F.tr?.[+b.dataset.pay];if(!t)return;
   if(await askConfirm(T('fin.confirm_paid',{from:nm(t.from),amt:money(t.cents),to:nm(t.to)}),T('common.confirm'))){addEntry({kind:'settlement',description:T('fin.settle'),amount_cents:t.cents,payer:t.from,shares:{[t.to]:1},date:today()});toast(T('fin.settled'))}}}

 /* --- Eintrag bearbeiten / neu --- */
 function openEntry(id){
  const ex=id?F.expenses.find(x=>x.id===id):null,isS=ex?.kind==='settlement',M=MEM();
  const st={kind:ex?.kind||'expense',payer:ex?.payer||me(),on:{},w:{}};
  for(const m of M){const has=ex?ex.shares?.[m.email]>0:true;st.on[m.email]=!!has;st.w[m.email]=ex&&has?String(ex.shares[m.email]):'1'}
  const b=sheet(`${shHead(T(ex?'fin.entry_edit':'fin.entry_new_expense'),T('common.save'))}
${isS?'':`<div class="fseg" id="ek" role="group" aria-label="${esc(T('fin.kind_aria'))}" style="margin-top:8px"><button type="button" data-k="expense">${esc(T('fin.kind_expense'))}</button><button type="button" data-k="income">${esc(T('fin.kind_income'))}</button></div>`}
<label for="ed">${esc(T('fin.entry_desc'))}</label><input id="ed" value="${esc(ex?.description||'')}" maxlength="100" autocomplete="off">
<label for="ea">${esc(T('fin.entry_amount',{cur:cur()}))}</label><input id="ea" inputmode="decimal" value="${ex?fmtPlain(ex.amount_cents):''}" placeholder="0.00" autocomplete="off">
<label for="ec">${esc(T('fin.entry_date'))}</label><input id="ec" type="date" value="${esc(ex?.date||today())}">
<div class="lbl" id="epl"></div><div class="fcc" id="ep">${M.map(m=>`<button type="button" class="fch" data-p="${esc(m.email)}" style="--c:${esc(m.color)}"><i></i>${esc(m.name)}</button>`).join('')}</div>
${isS?`<div class="lbl">${esc(T('fin.entry_recipient'))}</div><div class="sf" style="margin:0">${esc(nm(Object.keys(ex.shares||{})[0]))}</div>`
 :`<div class="lbl" id="esl">${esc(T('fin.entry_split'))}</div><div id="es">${M.map(m=>`<div class="fsr" data-e="${esc(m.email)}"><button type="button" class="fch" aria-pressed="true" style="--c:${esc(m.color)}"><i></i>${esc(m.name)}</button><span class="fw">${esc(T('fin.entry_weight'))}<input class="fwi" inputmode="decimal" value="1" aria-label="${esc(T('fin.entry_weight_aria',{name:m.name}))}"></span></div>`).join('')}</div><div class="sf" id="eprev" style="margin:6px 0 0"></div>
<label for="est">${esc(T('fin.entry_store'))}</label><select id="est"><option value="">–</option>${S.stores.map(s=>`<option value="${esc(s.id)}"${ex?.store_id===s.id?' selected':''}>${esc(s.name)}</option>`).join('')}</select>`}
<label for="en">${esc(T('fin.entry_note'))}</label><input id="en" value="${esc(ex?.note||'')}" maxlength="200" autocomplete="off">
${ex?`<button type="button" class="btn danger" id="edel" style="width:100%;margin-top:20px">${esc(T('common.delete'))}</button>`:''}`);
  const prev=()=>{const pv=$('#eprev',b);if(!pv)return;const a=parseAmount($('#ea',b).value),wts={};
   for(const m of M)if(st.on[m.email]){const w=parseAmount($(`[data-e="${m.email}"] .fwi`,b).value.replace(',','.'));wts[m.email]=w==null?0:w}
   // Gewichte als Dezimalzahl lesen (parseAmount liefert Hundertstel)
   const ww={};for(const k in wts)ww[k]=wts[k]/100;
   const al=a?allocate(st.kind==='income'?-a:a,ww):{};
   pv.textContent=a&&Object.keys(al).length?T('fin.entry_shares',{list:Object.keys(al).map(k=>`${nm(k)} ${money(Math.abs(al[k]))}`).join(' · ')}):''};
  const sync=()=>{const inc=st.kind==='income';
   $('#epl',b).textContent=T(inc?'fin.entry_received_from':'fin.entry_paid_by');const sl=$('#esl',b);if(sl)sl.textContent=T(inc?'fin.entry_in_favor':'fin.entry_split');
   if(!ex)$('h3',b).textContent=T(inc?'fin.entry_new_income':'fin.entry_new_expense');
   $$('#ek button',b).forEach(x=>{const on=x.dataset.k===st.kind;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});
   $$('#ep .fch',b).forEach(x=>{const on=x.dataset.p===st.payer;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});
   for(const m of M){const r=$(`[data-e="${m.email}"]`,b);if(!r)continue;const on=st.on[m.email];const c=$('.fch',r);c.classList.toggle('on',on);c.setAttribute('aria-pressed',on);$('.fwi',r).disabled=!on}
   prev()};
  for(const m of M){const r=$(`[data-e="${m.email}"]`,b);if(r)$('.fwi',r).value=st.w[m.email]}
  b.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
   if(t.dataset.k){st.kind=t.dataset.k;sync()}else if(t.dataset.p){st.payer=t.dataset.p;sync()}
   else if(t.closest('.fsr')){const em=t.closest('.fsr').dataset.e;st.on[em]=!st.on[em];sync()}});
  b.addEventListener('input',prev);sync();
  $('#ax',b).onclick=()=>closeSheet();
  if($('#edel',b))$('#edel',b).onclick=async()=>{if(await askConfirm(T('fin.entry_confirm_delete'))){delEntry(ex.id);closeSheet();toast(T('common.deleted'))}};
  $('#ao',b).onclick=()=>{
   const amt=parseAmount($('#ea',b).value),date=$('#ec',b).value||today(),note=$('#en',b).value.trim()||null;
   if(!amt){$('#ea',b).setAttribute('aria-invalid','true');$('#ea',b).focus();return}
   if(isS){editEntry(ex.id,{amount_cents:amt,date,note,payer:st.payer});closeSheet();return}
   const desc=$('#ed',b).value.trim()||T(st.kind==='income'?'fin.kind_income':'fin.kind_expense'),shares={};
   for(const m of M)if(st.on[m.email]){const w=parseAmount($(`[data-e="${m.email}"] .fwi`,b).value);if(w>0)shares[m.email]=w/100}
   if(!Object.keys(shares).length){toast(T('fin.entry_pick_one'));return}
   const store_id=$('#est',b).value||null,patch={kind:st.kind,description:desc,amount_cents:amt,payer:st.payer,shares,date,note,store_id,category:ex?.category||guessCategory(desc)};
   if(ex)editEntry(ex.id,patch);else addEntry(patch);closeSheet()};
  if(!ex)setTimeout(()=>$('#ed',b)?.focus(),260)}

 /* --- Abhak-Karte --- */
 const C={cur:null,timer:0,group:false};
 const kbFit=()=>{const vv=window.visualViewport;if(!vv||!F.card)return;const kb=Math.max(0,window.innerHeight-vv.height-vv.offsetTop);F.card.style.bottom=kb>80?(kb+8)+'px':''};
 function initCard(){const c=F.card;
  c.onclick=e=>{const b=e.target.closest('button');if(!b)return;const cur=C.cur;if(!cur)return;
   if(b.dataset.pp){cur.payer=b.dataset.pp;drawCard();return}
   if(b.dataset.sp){cur.split=b.dataset.sp;drawCard();return}
   if(b.dataset.grp!==undefined){C.group=!C.group;drawCard();return}
   if(b.id==='fcs')cardSave();else if(b.id==='fcx')closeCard()};
  c.addEventListener('input',()=>{disarm();kbFit()});
  c.addEventListener('pointerdown',disarm);c.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='fca'){e.preventDefault();cardSave()}else if(e.key==='Escape')closeCard()});
  window.visualViewport?.addEventListener('resize',kbFit);window.visualViewport?.addEventListener('scroll',kbFit)}
 const disarm=()=>{clearTimeout(C.timer);C.timer=0};
 function arm(){disarm();C.timer=setTimeout(()=>{const i=$('#fca',F.card);if(document.activeElement===i||i?.value)return;closeCard()},8000)}
 function closeCard(){disarm();C.cur=null;if(!F.card)return;F.card.classList.remove('show');F.card.style.bottom='';document.body.classList.remove('fcard-on');if(document.activeElement&&F.card.contains(document.activeElement))document.activeElement.blur()}
 function openCard(cur){C.group=false;C.cur={payer:me(),split:'both',...cur};drawCard('');
  F.card.classList.add('show');document.body.classList.add('fcard-on');requestAnimationFrame(()=>document.body.style.setProperty('--fch',F.card.offsetHeight+'px'));arm()}
 function drawCard(amount){const cur=C.cur,F2=F.card;if(!cur)return;const p=partner(),M=MEM(),v=amount!==undefined?amount:$('#fca',F2)?.value||'';
  const grp=cur.group&&cur.group.length>1;if(!grp)C.group=false;
  const names=C.group&&grp?cur.group.map(i=>i.name):[cur.name],title=cur.shop?esc(T('fin.card_title_shop',{shop:cur.shop})):esc(TP('fin.card_title_q',names.length,{names:names.join(', ')}));
  const chip=(a,k,l,on,c)=>`<button type="button" class="fch${on?' on':''}" data-${a}="${esc(k)}" aria-pressed="${on}"${c?` style="--c:${esc(c)}"`:''}>${c?'<i></i>':''}${esc(l)}</button>`;
  F2.innerHTML=`<b class="t">${title}</b><div class="fci"><input id="fca" inputmode="decimal" enterkeyhint="done" autocomplete="off" placeholder="0.00" value="${esc(v)}" aria-label="${esc(T('fin.card_amount_aria',{cur:cur()}))}"><span>${esc(cur())}</span></div>
<div class="fcc" role="group" aria-label="${esc(T('fin.entry_paid_by'))}">${chip('pp',me(),T('fin.card_me'),cur.payer===me(),mem(me()).color)}${p?chip('pp',p.email,p.name,cur.payer===p.email,p.color):''}</div>
<div class="fcc" role="group" aria-label="${esc(T('fin.entry_split'))}">${p?chip('sp','both',T('fin.card_both'),cur.split==='both'):''}${chip('sp','me',T('fin.card_only_me'),cur.split==='me'||(!p&&true))}${p?chip('sp','other',T('fin.row_only',{name:p.name}),cur.split==='other'):''}</div>
${grp&&!cur.shop?`<div class="fcc"><button type="button" class="fch${C.group?' on':''}" data-grp aria-pressed="${C.group}">${esc(TP('fin.card_group',cur.group.length))}</button></div>`:''}
<div class="row"><button type="button" class="btn" id="fcx">${esc(T('fin.card_skip'))}</button><button type="button" class="btn pri" id="fcs">${esc(T('common.save'))}</button></div>`;
  document.body.style.setProperty('--fch',F2.offsetHeight+'px')}
 function cardSave(){const cur=C.cur;if(!cur)return;const i=$('#fca',F.card),a=parseAmount(i.value);
  if(!a){i.setAttribute('aria-invalid','true');i.focus();return}
  const p=partner(),M=MEM(),shares=cur.split==='me'||!p?{[me()]:1}:cur.split==='other'?{[p.email]:1}:Object.fromEntries(M.map(m=>[m.email,1]));
  const grp=C.group&&cur.group?.length>1&&!cur.shop,items=grp?cur.group:[cur];
  addEntry({kind:'expense',description:cur.shop?T('fin.shop_desc',{shop:cur.shop}):items.map(x=>x.name).join(', ').slice(0,100),amount_cents:a,payer:cur.payer,shares,date:today(),item_ids:cur.shop?cur.ids:items.map(x=>x.id),store_id:cur.store_id||null,category:cur.category||null});
  const ids=new Set(items.map(x=>x.id));F.recent=F.recent.filter(r=>!ids.has(r.id));closeCard();toast(T('fin.card_saved',{amt:money(a)}))}
 const cheap=()=>F.settings.enabled&&F.settings.prompt_on_check&&!!S.user;
 function storeFor(it){const ids=it.store_ids||[];return ids.length===1?ids[0]:(S.filter||null)}
 function checked(it){if(!cheap()||inShop())return;const t=Date.now();
  F.recent=F.recent.filter(r=>t-r.t<=20000&&r.id!==it.id);F.recent.push({id:it.id,name:it.name.trim(),t,category:ecat(it),store_id:storeFor(it)});
  const g=[...F.recent],sids=new Set(g.map(r=>r.store_id||''));
  openCard({payer:me(),split:'both',name:it.name.trim(),group:g,category:ecat(it),store_id:storeFor(it),ids:null,id:it.id});
  if(C.cur.group.length>1&&sids.size===1)C.cur.store_id=C.cur.group[0].store_id}
 function shopEnd(storeId,ids){if(!cheap()||!ids?.length)return;const items=ids.map(id=>S.items.find(i=>i.id===id)).filter(i=>i&&i.done);if(!items.length)return;
  const st=storeOf(storeId),cats={};items.forEach(i=>{const c=ecat(i);cats[c]=(cats[c]||0)+1});
  const cat=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;F.recent=[];
  openCard({payer:me(),split:'both',name:T('fin.shop_name'),shop:st?.name||'',ids:items.map(i=>i.id),store_id:storeId||null,category:cat,group:null})}

 /* --- Einstellungen --- */
 function settingsMount(host){
  if(!host){F.redraw=null;return}
  const tg=(k,l,sm,on,dis)=>`<div class="sr"><span class="tx" style="margin-left:16px"><span id="fs-${k}">${l}</span><small>${sm}</small></span><button type="button" class="tgl" role="switch" data-fs="${k}" aria-checked="${on}" aria-labelledby="fs-${k}"${dis?' disabled':''}><i></i></button></div>`;
  const draw=()=>{host.innerHTML=`<div class="rows">${tg('enabled',esc(T('fin.set_enable')),esc(T('fin.set_enable_sub')),!!F.settings.enabled)}${tg('prompt_on_check',esc(T('fin.set_prompt')),esc(T('fin.set_prompt_sub')),!!F.settings.prompt_on_check,!F.settings.enabled)}</div>
<div class="gl">${esc(T('fin.set_names'))}</div><div class="rows">${MEM().map(m=>`<div class="sr"><div class="fm" data-em="${esc(m.email)}"><input type="color" value="${esc(/^#[0-9a-f]{6}$/i.test(m.color)?m.color:'#999999')}" aria-label="${esc(T('fin.set_color_aria',{name:m.name}))}"><input class="fmn" value="${esc(m.name)}" maxlength="24" aria-label="${esc(T('fin.set_name_aria'))}"></div></div>`).join('')}</div>
<div class="sf">${esc(T('fin.set_hint'))}</div>`;
   const s=$('#ds-fin');if(s)s.textContent=sum()};
  host.onclick=e=>{const t=e.target.closest('[data-fs]');if(!t||t.disabled)return;{const v=t.getAttribute('aria-checked')!=='true';t.setAttribute('aria-checked',v);setSettings({[t.dataset.fs]:v});draw()}};
  host.onchange=async e=>{const row=e.target.closest('[data-em]');if(!row)return;const email=row.dataset.em,name=$('.fmn',row).value.trim()||mem(email).name,color=$('[type=color]',row).value,m=F.members.find(x=>x.email===email)||MEM().find(x=>x.email===email);
   if(!m)return;const upd={name,color};
   if(!F.members.length)F.members=DEFAULT_MEMBERS.map(x=>({...x}));Object.assign(F.members.find(x=>x.email===email),upd);
   const{error}=await sb.from('members').update(upd).eq('email',email);if(error)toast(T('common.save_failed'));changed()};
  F.redraw=()=>{if(host.isConnected&&!(host.contains(document.activeElement)&&document.activeElement.matches('input')))draw();else if(!host.isConnected)F.redraw=null};draw()}
 const sum=()=>T(F.settings.enabled?'common.on':'common.off');

 /* --- Artikel-Detail --- */
 function detail(b,id){const ex=F.expenses.filter(x=>x.kind==='expense'&&x.item_ids?.includes(id));if(!ex.length||!F.settings.enabled)return;
  const el=document.createElement('div');el.className='fdet';el.textContent=T('fin.detail_paid',{list:ex.map(x=>`${money(x.amount_cents)} (${nm(x.payer)})`).join(' · ')});
  const dd=$('#dd',b);if(dd)dd.before(el);else b.append(el)}

 return{load,subscribe,apply,reset,checked,shopEnd,settingsMount,sum,detail,relabel,F}}
