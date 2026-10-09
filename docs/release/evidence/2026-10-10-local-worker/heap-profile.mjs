import WebSocket from 'ws';
import {writeFileSync} from 'node:fs';
const s=new WebSocket('ws://127.0.0.1:43178/ws');
await new Promise((r,j)=>{s.once('open',r);s.once('error',j)});
let id=200;const waiting=new Map();
s.on('message',d=>{const m=JSON.parse(d),p=waiting.get(m.id);if(p){waiting.delete(m.id);clearTimeout(p.timer);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);}});
function call(method,params={}){return new Promise((resolve,reject)=>{const next=++id;const timer=setTimeout(()=>reject(new Error('timeout '+method)),10000);waiting.set(next,{resolve,reject,timer});s.send(JSON.stringify({id:next,method,params}));if(method.startsWith('HeapProfiler.'))setTimeout(()=>tick().catch(reject),250);});}
async function tick(){await(await fetch('http://127.0.0.1:43177/about')).text();}
try {
await call('HeapProfiler.enable');
const gc=call('HeapProfiler.collectGarbage');await tick();await gc;
console.log('AFTER_GC',await call('Runtime.getHeapUsage'));
await call('HeapProfiler.startSampling',{samplingInterval:32768,includeObjectsCollectedByMajorGC:true,includeObjectsCollectedByMinorGC:true});
for(let n=0;n<4;n++) await(await fetch('http://127.0.0.1:43177'+(n%2?'/search?q=CA':'/zip/10001'))).text();
const {profile}=await call('HeapProfiler.stopSampling');
writeFileSync('.artifacts/runtime-adaptation/allocation-profile.json',JSON.stringify(profile));
const rows=[];function visit(n){if(n.selfSize)rows.push({bytes:n.selfSize,...n.callFrame});for(const c of n.children??[])visit(c);}visit(profile.head);console.log(JSON.stringify(rows.sort((a,b)=>b.bytes-a.bytes).slice(0,18),null,2));
}finally{s.terminate();}
