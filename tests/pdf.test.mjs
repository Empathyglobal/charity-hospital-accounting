// Copyright (c) 2026 Eric Gonzalez-Payne. MIT License.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import * as pdfjs from '../src/vendor/pdf.min.mjs';
import {assertPassivePdf} from '../src/pdf-safety.mjs';
import {tableFromItems,reviewedCsv} from '../src/pharmacy-core.mjs';
pdfjs.GlobalWorkerOptions.workerSrc=new URL('../src/vendor/pdf.worker.min.mjs',import.meta.url).href;
function syntheticPdf(pageAction=false){
 const stream='BT /F1 12 Tf 20 100 Td (001) Tj 100 0 Td (Synthetic item) Tj ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R '+(pageAction==='document'?'/OpenAction << /S /JavaScript /JS (synthetic) >> ':'')+'>>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R '+(pageAction===true?'/AA << /O << /S /JavaScript /JS (synthetic) >> >> ':'')+(pageAction==='annotation'?'/Annots [6 0 R] ':'')+'>>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
 if(pageAction==='annotation')objects.push('<< /Type /Annot /Subtype /Widget /Rect [10 10 20 20] /FT /Btn /T (Synthetic) /AA << /E << /S /JavaScript /JS (synthetic) >> >> >>');
 let body='%PDF-1.7\n';const offsets=[0];
 objects.forEach((o,i)=>{offsets.push(Buffer.byteLength(body));body+=`${i+1} 0 obj\n${o}\nendobj\n`;});
 const xref=Buffer.byteLength(body);body+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('');
 body+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;return new Uint8Array(Buffer.from(body));
}
test('real synthetic PDF extracts using the shipped main/worker pair',async()=>{
 assert.equal(pdfjs.version,'6.5.438');
 const task=pdfjs.getDocument({data:syntheticPdf(),isEvalSupported:false,disableFontFace:true,useSystemFonts:false,stopAtErrors:true});
 try{
  const doc=await task.promise;await assertPassivePdf(doc);assert.equal(doc.numPages,1);assert.equal(await doc.getJSActions(),null);
  const page=await doc.getPage(1),content=await page.getTextContent();
  assert.ok(content.items.some(x=>x.str==='001'));assert.ok(content.items.some(x=>x.str==='Synthetic item'));
  const table=tableFromItems([content.items]);assert.equal(table.rows[0].values[0],'001');
  table.rows.forEach(row=>row.reviewed=true);assert.match(reviewedCsv(table.headers,table.rows),/Synthetic item/);
 }finally{await task.destroy();}
});
test('invalid PDF is rejected and loading task can be destroyed',async()=>{
 const task=pdfjs.getDocument({data:new Uint8Array(Buffer.from('%PDF-not-valid')),isEvalSupported:false});
 try{await assert.rejects(task.promise);}finally{await task.destroy();}
});
test('vendored parser, worker and license match the locked installed official package',async()=>{
 const lock=JSON.parse(await readFile(new URL('../package-lock.json',import.meta.url)));
 const dep=lock.packages['node_modules/pdfjs-dist'];assert.equal(dep.version,'6.5.438');
 assert.equal(dep.resolved,'https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.5.438.tgz');
 assert.equal(dep.integrity,'sha512-vg8Pw1x+AFKy4AMDvhuWl5cOYV8d698UoEANoFFhc79hqXDnZQqnOXoxw3HG907WHOg1JYOvLhP756boddFxpA==');
 for(const [vendor,source] of [['pdf.min.mjs','legacy/build/pdf.min.mjs'],['pdf.worker.min.mjs','legacy/build/pdf.worker.min.mjs'],['pdfjs-license','LICENSE']]){
  const digest=async path=>createHash('sha256').update(await readFile(new URL(path,import.meta.url))).digest('hex');
  assert.equal(await digest('../src/vendor/'+vendor),await digest('../node_modules/pdfjs-dist/'+source));
 }
});

test('page-open JavaScript rejects even when document-level actions are absent',async()=>{
 const task=pdfjs.getDocument({data:syntheticPdf(true),isEvalSupported:false});
 try{const doc=await task.promise;assert.equal(await doc.getJSActions(),null);const actions=await(await doc.getPage(1)).getJSActions();assert.ok(actions instanceof Map?actions.size>0:Object.keys(actions).length>0);await assert.rejects(assertPassivePdf(doc),/scripts/);}finally{await task.destroy();}
});

test('document-open and annotation JavaScript both reject in real synthetic PDFs',async()=>{
 for(const location of ['document','annotation']){
  const task=pdfjs.getDocument({data:syntheticPdf(location),isEvalSupported:false});
  try{const doc=await task.promise;await assert.rejects(assertPassivePdf(doc),/scripts/);}finally{await task.destroy();}
 }
});
