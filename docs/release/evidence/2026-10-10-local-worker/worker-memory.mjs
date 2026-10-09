import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import WebSocket from 'ws';
const origin = 'http://127.0.0.1:43177';
const targets = await (await fetch('http://127.0.0.1:43178/json/list')).json();
const target = targets.find(t => t.title === 'Cloudflare Worker');
assert.ok(target?.webSocketDebuggerUrl.startsWith('ws://127.0.0.1:43178/'));
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
let id=0; const pending=new Map();
socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(!m.id)return;const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);});
function call(method,params={}) {return new Promise((resolve,reject)=>{const next=++id;const timer=setTimeout(()=>{pending.delete(next);reject(new Error('Inspector timeout: '+method));},10000);pending.set(next,{resolve,reject,timer});socket.send(JSON.stringify({id:next,method,params}));});}
const records=[];let sampling=true,sampleError,phase='cold';
async function sample(){const m=await call('Runtime.getHeapUsage');records.push({...m,phase,at:performance.now()});return m;}
async function collect(){return sample();}
const metrics=m=>({heapMiB:m.usedSize/1048576,backingMiB:(m.backingStorageSize??0)/1048576,embedderMiB:(m.embedderHeapUsedSize??0)/1048576,heapAndBackingMiB:(m.usedSize+(m.backingStorageSize??0))/1048576});
async function request(route){const start=performance.now();const r=await fetch(origin+route,{signal:AbortSignal.timeout(30000)});const body=await r.text();assert.equal(r.status,200,route);assert.equal(r.headers.get('x-robots-tag'),'noindex, nofollow');assert.ok(!body.includes('We couldn')&&!/\\n[0-9a-f]+:E\{/.test(body),'streamed error: '+route);assert.ok(body.includes('OKELOM')||route.startsWith('/_geo/'));return {route,ms:Math.round(performance.now()-start),bytes:Buffer.byteLength(body)};}
try {
  await call('Runtime.enable');
  const cold=await collect();
  const sampler=(async()=>{while(sampling){try{await sample();}catch(e){sampleError=e;return;}await new Promise(r=>setTimeout(r,20));}})();
  const steady=[];
  for(const route of ['/','/search?q=ZCTA&page=999999','/zip/10001','/state/ca','/county/ny/new-york-county','/city/tx/austin-city','/compare?left=00601&right=10001','/_geo/manifest.json']){phase='steady:'+route;steady.push(await request(route));}
  const retained=await collect();
  const concurrent={};
  for(const level of [2,4,8]) {phase='concurrent:'+level;concurrent[level]=await Promise.all(Array.from({length:level},(_,i)=>request(i%2?'/search?q=Austin+TX':'/zip/10001')));}
  const beforeRepeated=await collect();
  phase='repeated';for(let n=0;n<25;n++){await request('/search?q=CA');await request('/zip/10001');}
  const afterRepeated=await collect();
  sampling=false;await sampler;if(sampleError)throw sampleError;
  const peak=Math.max(...records.map(m=>metrics(m).heapAndBackingMiB));
  const growth=metrics(afterRepeated).heapAndBackingMiB-metrics(beforeRepeated).heapAndBackingMiB;
  const phasePeaks=Object.fromEntries([...new Set(records.map(m=>m.phase))].map(p=>[p,Math.max(...records.filter(m=>m.phase===p).map(m=>metrics(m).heapAndBackingMiB))]));
  const report={checkedAt:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'LOCAL_WORKER_CDP_SAMPLED_NOT_CLOUD_CAPACITY',definition:'V8 used heap plus backing storage; embedder separately reported, not total isolate or RSS; sampling is a lower bound; no forced GC during stress; growth is NOT retained/leak proof',samples:records.length,cold:metrics(cold),afterSteady:metrics(retained),peakHeapAndBackingMiB:peak,maxEmbedderMiB:Math.max(...records.map(m=>metrics(m).embedderMiB)),phasePeaks,beforeRepeated:metrics(beforeRepeated),afterRepeated:metrics(afterRepeated),repeatedRequests:50,repeatedUncollectedGrowthMiB:growth,steady,concurrent,localTargetMiB:96,status:peak<=96?'PASS_LOCAL_SAMPLED_PROXY':'FAIL'};
  writeFileSync('.artifacts/runtime-adaptation/worker-memory.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));assert.equal(report.status,'PASS_LOCAL_SAMPLED_PROXY');
}finally{sampling=false;socket.terminate();}
