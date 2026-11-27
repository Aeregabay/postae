import assert from 'node:assert/strict';
import {allocate,settle,simplify,fmtCHF,parseAmount,periodRange,inPeriod,summaryText,breakdown} from './finance.js';
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
// allocate: largest remainder, sums exactly
assert.deepEqual(allocate(100,{a:1,b:1,c:1}),{a:34,b:33,c:33});
for(const t of [1,2,99,100,101,1000,12345,-100,-101]){const r=allocate(t,{a:1,b:2,c:3.5});assert.equal(sum(r),t)}
assert.deepEqual(allocate(1000,{a:1,b:1}),{a:500,b:500});
assert.deepEqual(allocate(1001,{a:1,b:1}),{a:501,b:500});
assert.deepEqual(allocate(-1001,{a:1,b:1}),{a:-501,b:-500});
assert.deepEqual(allocate(1000,{a:3,b:1,c:0}),{a:750,b:250});
assert.deepEqual(allocate(500,{}),{});
const A='a@x',B='b@x',C='c@x';
// 50/50 expense: A pays 100 → B owes 50
let p=settle([{kind:'expense',amount_cents:10000,payer:A,shares:{[A]:1,[B]:1}}],[A,B]);
assert.deepEqual([p[A].paid,p[A].share,p[A].bal,p[B].bal],[10000,5000,5000,-5000]);
assert.deepEqual(simplify(p),[{from:B,to:A,cents:5000}]);
// only partner affected: A pays 30 for B alone
p=settle([{kind:'expense',amount_cents:3000,payer:A,shares:{[B]:1}}],[A,B]);assert.deepEqual([p[A].bal,p[B].bal],[3000,-3000]);
// weighted 1:3
p=settle([{kind:'expense',amount_cents:10000,payer:A,shares:{[A]:1,[B]:3}}],[A,B]);assert.equal(p[B].share,7500);assert.equal(p[A].bal,7500);
// income: A receives 100, split A/B → A holds money, owes B 50
p=settle([{kind:'income',amount_cents:10000,payer:A,shares:{[A]:1,[B]:1}}],[A,B]);
assert.deepEqual([p[A].bal,p[B].bal],[-5000,5000]);assert.deepEqual(simplify(p),[{from:A,to:B,cents:5000}]);
// settlement zeroes debt
const ex={kind:'expense',amount_cents:10000,payer:A,shares:{[A]:1,[B]:1}};
p=settle([ex,{kind:'settlement',amount_cents:5000,payer:B,shares:{[A]:1}}],[A,B]);
assert.deepEqual([p[A].bal,p[B].bal],[0,0]);assert.deepEqual(simplify(p),[]);
// partial settlement
p=settle([ex,{kind:'settlement',amount_cents:2000,payer:B,shares:{[A]:1}}],[A,B]);assert.deepEqual(simplify(p),[{from:B,to:A,cents:3000}]);
// 3 persons: balances sum to 0, ≤ n−1 transfers, transfers settle everything
const E=[{kind:'expense',amount_cents:10001,payer:A,shares:{[A]:1,[B]:1,[C]:1}},{kind:'expense',amount_cents:4590,payer:B,shares:{[A]:2,[C]:1}},{kind:'income',amount_cents:777,payer:C,shares:{[A]:1,[B]:1}}];
p=settle(E,[A,B,C]);assert.equal(p[A].bal+p[B].bal+p[C].bal,0);
const tr=simplify(p);assert.ok(tr.length<=2);const bal={...Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v.bal]))};
for(const t of tr){bal[t.from]+=t.cents;bal[t.to]-=t.cents}assert.deepEqual(Object.values(bal),[0,0,0]);
// greedy: largest debtor ↔ largest creditor
assert.deepEqual(simplify({a:500,b:300,c:-600,d:-200}),[{from:'c',to:'a',cents:500},{from:'d',to:'b',cents:200},{from:'c',to:'b',cents:100}]);
assert.equal(simplify({a:500,b:300,c:-600,d:-200}).reduce((s,t)=>s+t.cents,0),800);
// formatting / parsing
assert.equal(fmtCHF(123450),"CHF 1'234.50");assert.equal(fmtCHF(4230),'CHF 42.30');assert.equal(fmtCHF(5),'CHF 0.05');assert.equal(fmtCHF(-123456700),"−CHF 1'234'567.00");assert.equal(fmtCHF(100,{sign:true}),'+CHF 1.00');
assert.equal(parseAmount('12,5'),1250);assert.equal(parseAmount('12.50'),1250);assert.equal(parseAmount("1'234.50"),123450);assert.equal(parseAmount('CHF 9'),900);assert.equal(parseAmount('0,05'),5);assert.equal(parseAmount(''),null);assert.equal(parseAmount('abc'),null);assert.equal(parseAmount('1.234,56'),123456);
// period
assert.deepEqual(periodRange('month',new Date(2026,10,15)),{from:'2026-11-01',to:'2026-12-01'});assert.deepEqual(periodRange('month',new Date(2026,11,15)),{from:'2026-12-01',to:'2027-01-01'});
assert.equal(periodRange('all',new Date()),null);assert.ok(inPeriod('2026-11-30',periodRange('month',new Date(2026,10,1))));assert.ok(!inPeriod('2026-12-01',periodRange('month',new Date(2026,10,1))));
// text + breakdown
const nm=e=>({[A]:'Arik',[B]:'Erika'}[e]);
assert.match(summaryText([{from:B,to:A,cents:4230}],settle([ex],[A,B]),nm),/Erika → Arik CHF 42\.30/);assert.match(summaryText([],{},nm),/Alles ausgeglichen/);
assert.deepEqual(breakdown([{kind:'expense',amount_cents:5,store_id:'s'},{kind:'expense',amount_cents:7,store_id:'t'},{kind:'income',amount_cents:99,store_id:'t'}],x=>x.store_id),[{key:'t',cents:7},{key:'s',cents:5}]);
console.log('finance tests ok');
