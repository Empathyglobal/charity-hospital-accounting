// Copyright (c) 2026 Eric Gonzalez-Payne. MIT License.
import test from 'node:test';import assert from 'node:assert/strict';
import {parseMoney,formatMoney,reconcileCash} from '../src/money.mjs';
import {tableFromItems,reviewedCsv,cell} from '../src/pharmacy-core.mjs';
import {minor,validateRecord,dailyReport,transition,validateRate,rateDate,csvCell,usdCents,countDenominations,reconcile,formatMinor} from '../src/accounting-usd-khr.mjs';
test('currency scales are explicit and exact, including large amounts',()=>{
 for(const n of [0,2,3,6])assert.equal(formatMoney(parseMoney('12',n),n),n?'12.'+'0'.repeat(n):'12');
 assert.equal(parseMoney('9007199254740993.25'),900719925474099325n);
 assert.throws(()=>parseMoney('1.001',2));assert.throws(()=>parseMoney('-1'));assert.throws(()=>parseMoney('1e3'));
 assert.equal(reconcileCash(100n,90n).difference,-10n);
});
test('PDF text table keeps data as text and requires review',()=>{
 const item=(str,x,y,width=20)=>({str,width,transform:[1,0,0,1,x,y]});
 const table=tableFromItems([[item('001',10,100),item('Synthetic item',100,100),item('002',10,80),item('Another',100,80)]]);
 assert.equal(table.rows.length,2);assert.equal(table.rows[0].values[0],'001');
 assert.throws(()=>reviewedCsv(table.headers,table.rows),/Review/);
 table.rows.forEach(r=>r.reviewed=true);assert.match(reviewedCsv(table.headers,table.rows),/001/);
 assert.throws(()=>reviewedCsv(['x','x'],table.rows),/unique/);
});
test('PDF geometry and resource bounds reject malformed or oversized inputs',()=>{
 const item=(y)=>({str:'Synthetic',width:10,transform:[1,0,0,1,10,y]});
 assert.equal(tableFromItems([Array.from({length:1000},(_,i)=>item(i*10))]).rows.length,1000);
 assert.throws(()=>tableFromItems([Array.from({length:1001},(_,i)=>item(i*10))]),/1,000/);
 assert.throws(()=>tableFromItems([[{str:'Synthetic',transform:[]}]]),/coordinates/);
 assert.throws(()=>tableFromItems([],NaN),/gap/);assert.throws(()=>tableFromItems(Array(9).fill([])),/8 pages/);
});
test('spreadsheet formula injection is escaped',()=>{
 for(const s of ['=1+1','\t@SUM(A1)','-1','+cmd']){assert.ok(cell(s).startsWith('"\''));assert.ok(csvCell(s).startsWith('"\''));}
 assert.equal(cell('001'),'"001"');assert.equal(cell('a"b'),'"a""b"');
});
const receipt=()=>validateRecord({kind:'receipt',number:'DEMO-001',date:'2026-11-02',party:'Synthetic person',description:'Synthetic service',preparedBy:'Synthetic preparer',rateBasis:'income',lines:[{amount:'10.25',currency:'USD',method:'cash'}]});
test('regional accounting validates amounts, zero receipt reasons and draft review',()=>{
 assert.equal(minor('10.25','USD'),1025);assert.throws(()=>minor('1.1','KHR'));
 const r={...receipt(),status:'draft'};assert.equal(r.usdCents,1025);
 const p=transition(r,'prepare','Synthetic preparer','Synthetic review');
 assert.throws(()=>transition(p,'check','Synthetic preparer','Synthetic review'));
 const checked=transition(p,'check','Synthetic checker','Synthetic review');assert.equal(checked.status,'checked');
 assert.equal(transition(checked,'approve','Synthetic supervisor','Synthetic review').status,'approval_requested');
});
test('daily reports exclude void and distinguish tender from reporting equivalents',()=>{
 const r=receipt();const report=dailyReport([r,{...r,status:'void'}],'2026-11-02');
 assert.equal(report.totals.USD,1025);assert.equal(report.usdCents,1025);assert.equal(report.records.length,1);
});
test('large regional reports fail before any monetary precision is lost',()=>{
 const r={...receipt(),usdCents:999999999999,lines:[{amountMinor:999999999999,currency:'USD',method:'cash'}]};
 assert.equal(dailyReport(Array(9000).fill(r),'2026-11-02').totals.USD,8999999999991000);
 assert.throws(()=>dailyReport(Array(10000).fill(r),'2026-11-02'),/safe integer/);
 assert.throws(()=>usdCents(Number.MAX_SAFE_INTEGER,'KHR','1'),/safe integer/);
 assert.throws(()=>usdCents(1000000000000,'KHR','0.000001'),/rate/);
 assert.throws(()=>usdCents(100,'KHR','100001'),/rate/);
 assert.throws(()=>usdCents(100,'EUR','1'),/currency/);
 assert.equal(usdCents(1,'KHR','1'),100);
 assert.equal(usdCents(100000,'KHR','100000'),100);
 assert.throws(()=>usdCents(Number.MAX_SAFE_INTEGER+1,'USD'),/safe integer/);
 assert.throws(()=>formatMinor(Number.MAX_SAFE_INTEGER+1,'USD'),/safe integer/);
 assert.throws(()=>reconcile({methods:{cash:{USD:Number.MAX_SAFE_INTEGER+1,KHR:0}}},{USD:'0',KHR:'0'}),/safe integer/);
 assert.equal(formatMinor(Number.MAX_SAFE_INTEGER,'USD'),'90071992547409.91');
});
test('regional negative/refund inputs reject explicitly; signed differences remain exact',()=>{
 assert.throws(()=>minor('-1.00','USD'));assert.throws(()=>usdCents(-100,'USD'),/nonnegative/);
 const r=receipt();assert.throws(()=>dailyReport([{...r,lines:[{amountMinor:-100,currency:'USD',method:'cash'}]}],'2026-11-02'),/nonnegative/);
 const difference=reconcile(dailyReport([r],'2026-11-02'),{USD:'9.25',KHR:'0'}).USD.difference;
 assert.equal(difference,-100);assert.equal(formatMinor(difference,'USD'),'-1.00');
 assert.throws(()=>countDenominations({USD:{1:-1}}),/nonnegative/);
});
test('mixed denominations and tender retain separate exact currencies',()=>{
 const counts=countDenominations({USD:{100:2,5:3,1:4},KHR:{100000:1,1000:2,100:3}});
 assert.deepEqual(counts,{USD:21900,KHR:102300});
 const r=validateRecord({kind:'receipt',number:'DEMO-MIXED',date:'2026-11-02',party:'Synthetic person',description:'Synthetic service',preparedBy:'Synthetic preparer',rateBasis:'income',lines:[{amount:'1.25',currency:'USD',method:'cash'},{amount:'4000',currency:'KHR',method:'cash'}]},[{date:'2026-11-02',khrPerUsd:4000}]);
 const report=dailyReport([r],'2026-11-02');assert.deepEqual(report.totals,{USD:125,KHR:4000});assert.equal(report.usdCents,225);
});
test('regional rates require dated verified official reference',()=>{
 assert.equal(rateDate('2026-11-01'),'2026-10-30');
 assert.throws(()=>validateRate({date:'2026-11-02',khrPerUsd:4000,source:'https://example.invalid',confirmed:true,verifiedBy:'Synthetic reviewer'}));
 const rate=validateRate({date:'2026-11-02',khrPerUsd:'4000',source:'https://www.nbc.gov.kh/',confirmed:true,verifiedBy:'Synthetic reviewer'});
 assert.equal(rate.khrPerUsd,4000);
});
