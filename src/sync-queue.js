// Durable coalescing outbox. Acknowledgements cannot erase newer local changes.
const database=()=>new Promise((resolve,reject)=>{const request=indexedDB.open('solo-cat-sync',1);request.onupgradeneeded=()=>request.result.createObjectStore('jobs',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
async function transaction(mode,operation){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('jobs',mode);let result;operation(tx.objectStore('jobs'),value=>{result=value});tx.oncomplete=()=>{db.close();resolve(result)};tx.onabort=tx.onerror=()=>{db.close();reject(tx.error||Error('Sync queue write failed'))}})}
const jobId=(uid,key)=>JSON.stringify([uid,key]);
export async function enqueueSync(uid,key){if(!uid||!key)throw Error('Sync requires an account and record key');const job={id:jobId(uid,key),uid,key,revision:crypto.randomUUID(),updated:Date.now(),attempts:0,nextAttempt:0};await transaction('readwrite',store=>store.put(job));return job}
export const pendingSync=uid=>transaction('readonly',(store,done)=>{store.getAll().onsuccess=e=>done(e.target.result.filter(job=>job.uid===uid).sort((a,b)=>a.updated-b.updated))});
export const acknowledgeSync=job=>transaction('readwrite',(store,done)=>{store.get(job.id).onsuccess=e=>{if(e.target.result?.revision===job.revision){store.delete(job.id);done(true)}else done(false)}});
export const retrySync=(job,now=Date.now())=>transaction('readwrite',store=>{store.get(job.id).onsuccess=e=>{const latest=e.target.result;if(latest?.revision!==job.revision)return;const attempts=latest.attempts+1;store.put({...latest,attempts,nextAttempt:now+Math.min(300000,1000*2**Math.min(attempts,9))})}});
export async function drainSync(uid,send,{isCurrent=()=>true,now=()=>Date.now()}={}){
 const jobs=await pendingSync(uid);let sent=0;
 for(const job of jobs){if(!isCurrent()||!navigator.onLine)break;if(job.nextAttempt>now())continue;
  try{await send(job);await acknowledgeSync(job);sent++}catch{await retrySync(job,now());break}
 }
 return sent;
}
