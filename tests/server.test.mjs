// Copyright (c) 2026 Eric Gonzalez-Payne. MIT License.
import test from 'node:test';import assert from 'node:assert/strict';import {server} from '../server.mjs';
test('server serves only allowlisted assets and refuses every write/API route',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const home=await fetch(base+'/');assert.equal(home.status,200);assert.equal(home.headers.get('x-frame-options'),'DENY');
  assert.match(await home.text(),/connect-src 'none'/);
  for(const path of ['/package.json','/.env','/src/accounting-usd-khr.mjs','/accounting/api/state','/..%2Fpackage.json'])assert.equal((await fetch(base+path)).status,404);
  assert.equal((await fetch(base+'/',{method:'POST',body:'synthetic'})).status,404);
  assert.equal((await fetch(base+'/src/vendor/pdf.worker.min.mjs')).status,200);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
