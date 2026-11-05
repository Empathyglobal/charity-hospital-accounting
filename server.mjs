// Copyright (c) 2026 Eric Gonzalez-Payne. MIT License.
// Local-only static server. No backend, uploads, persistence or outbound requests.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const allowed=new Map([
 ['/', ['index.html','text/html']],['/index.html',['index.html','text/html']],
 ['/main.mjs',['main.mjs','text/javascript']],['/style.css',['style.css','text/css']],
 ...['pharmacy.mjs','pharmacy-core.mjs','pdf-safety.mjs','vendor/pdf.min.mjs','vendor/pdf.worker.min.mjs'].map(p=>['/src/'+p,['src/'+p,'text/javascript']])
]);
export const server=http.createServer(async(req,res)=>{
 const entry=allowed.get(req.url);
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Frame-Options','DENY');
 if(!['GET','HEAD'].includes(req.method)||!entry){res.writeHead(404);return res.end('Not found');}
 try{const bytes=await readFile(new URL(entry[0],import.meta.url));res.writeHead(200,{'Content-Type':entry[1]+'; charset=utf-8'});res.end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(500);res.end('Asset unavailable');}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(8788,'127.0.0.1',()=>console.log('Local evaluation: http://127.0.0.1:8788'));
