import {firebaseToken} from './firebase-auth'
import {cloudMeta,downloadedFile,clearDownloads} from './cloud-meta'
import {mergeSnapshots,emptyCloud} from './cloud-merge'
import {pendingSync,acknowledgeSync} from './sync-queue'
import {refreshDomainState} from './persistent-state'
import {accountDatabase} from './account-storage'
import {archiveLegacyDemo} from './legacy-demo'
const LIMIT=20*1024*1024
let state={phase:'guest'},raw,activeUid=null,running=false,timer,retry=0,epoch=0
export function cloudStatus(){return state}
function status(patch){state={...state,...patch};window.dispatchEvent(new Event('solo-cloud-status'))}
const lock=fn=>navigator.locks?navigator.locks.request('solo-local-sync',fn):fn()
async function request(uid,path,options={}){const token=await firebaseToken(uid);const response=await fetch('/api/backup'+path,{...options,headers:{Authorization:'Bearer '+token,...options.headers},signal:AbortSignal.timeout(55000)});if(!response.ok){let message;try{message=(await response.json()).message}catch{}const e=Error(message||'สำรองคลาวด์ไม่สำเร็จ');e.code=response.status;throw e}return response}
const hashes=new Map()
async function snapshot(){const local=await raw.snapshot();const blobs=new Map();const files=[];for(const file of local.files){const cacheKey=JSON.stringify([file.id,file.created,file.size]);let hash=hashes.get(cacheKey);if(!hash){hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.blob.arrayBuffer())),v=>v.toString(16).padStart(2,'0')).join('');hashes.set(cacheKey,hash)}const {blob,...meta}=file;files.push({...meta,hash});blobs.set(hash,blob)}return {data:{schema:1,state:local.state.filter(r=>r.id==='items'||r.id.startsWith('domain:')),inbox:local.inbox.filter(r=>!r.localDaily),files},blobs,device:local.state.filter(r=>r.id!=='items'&&!r.id.startsWith('domain:'))}}
async function completeFiles(uid,data,blobs){for(const f of data.files){if(blobs.has(f.hash))continue;const cached=await downloadedFile(uid,f.hash);const blob=cached||await (await request(uid,'/files/'+f.hash)).blob();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==f.hash||blob.size!==f.size)throw Error('ตรวจสอบไฟล์สำรองไม่ผ่าน');if(!cached)await downloadedFile(uid,f.hash,blob);blobs.set(f.hash,blob)}}
export function scheduleCloud(delay=4000){clearTimeout(timer);if(activeUid)timer=setTimeout(()=>void synchronize(),delay)}
export async function synchronize(){const uid=activeUid;if(!uid||running)return;return navigator.locks?navigator.locks.request("solo-cloud-"+uid,()=>syncOnce(uid)):syncOnce(uid)}
async function syncOnce(expectedUid){
 if(running||!activeUid||activeUid!==expectedUid)return;if(!navigator.onLine){status({phase:'offline'});return}
 running=true;const uid=activeUid,runEpoch=epoch;status({phase:'syncing',error:null})
 try{
  const jobs=await pendingSync(uid);const baseline=await cloudMeta(uid),local=await lock(snapshot),remote=await (await request(uid,'')).json();if(uid!==activeUid||epoch!==runEpoch)return
  const merged=archiveLegacyDemo(mergeSnapshots(baseline?.snapshot||emptyCloud(),local.data,remote.snapshot||emptyCloud()))
  const bytes=merged.files.reduce((n,f)=>n+f.size,0);if(bytes>LIMIT)throw Error('ไฟล์สำรองรวมเกิน 20 MB')
  const blobs=new Map(local.blobs);await completeFiles(uid,merged,blobs)
  const available=new Set(remote.availableFiles);for(const f of merged.files){if(uid!==activeUid||epoch!==runEpoch)return;if(!available.has(f.hash)){await request(uid,'/files/'+f.hash,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:blobs.get(f.hash)});available.add(f.hash)}}
  if(uid!==activeUid||epoch!==runEpoch)return
  const changed=JSON.stringify(merged)!==JSON.stringify(remote.snapshot)
  const saved=changed?await (await request(uid,'',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({baseRevision:remote.revision,snapshot:merged})})).json():remote
  await lock(async()=>{
   if(uid!==activeUid||epoch!==runEpoch)return
   const latest=await snapshot(),combined=archiveLegacyDemo(mergeSnapshots(local.data,latest.data,merged))
   for(const [hash,blob]of latest.blobs)blobs.set(hash,blob)
   if(JSON.stringify(combined)!==JSON.stringify(latest.data)){
    await raw.restore({...combined,state:[...combined.state,...latest.device],files:combined.files.map(({hash,...f})=>({...f,blob:blobs.get(hash)}))})
    await refreshDomainState();window.dispatchEvent(new Event('items-committed'))
   }
   await cloudMeta(uid,{snapshot:merged,revision:saved.revision,updated:saved.updated||Date.now()})
   for(const job of jobs)await acknowledgeSync(job)
   status({phase:JSON.stringify(combined)===JSON.stringify(merged)?'saved':'pending',updated:saved.updated||Date.now(),bytes,error:null})
   if(JSON.stringify(combined)!==JSON.stringify(merged))scheduleCloud()
  });await clearDownloads(uid);retry=0
 }catch(e){if(uid===activeUid){status({phase:e.name==='SyncConflict'?'conflict':e.path?'conflict':e.code===401?'signin':'error',error:e.message});retry++;if(!e.path)scheduleCloud(Math.min(300000,15000*2**Math.min(retry,4)))}}
 finally{running=false;if(activeUid&&activeUid!==uid)scheduleCloud(250)}
}
export function pauseCloudAccount(){clearTimeout(timer);activeUid=null;epoch++;hashes.clear()}
export async function cloudAccount(user,store){
 pauseCloudAccount();raw=store
 await lock(async()=>{
  const {database,map,owner}=accountDatabase(user)
  // Record ownership before changing the active database; interrupted switches
  // must never make the previous account's data eligible for adoption.
  localStorage.setItem('solo-cat.account-databases',JSON.stringify(map))
  if(owner)localStorage.setItem('solo-cat.database-owner',owner)
  await store.useDatabase(database)
  const before=await store.snapshot(),clean=archiveLegacyDemo(before)
  if(clean!==before)await store.restore(clean)
 })
 if(!user){state={phase:'guest'};status({error:null});return}
 activeUid=user.uid;const meta=await cloudMeta(user.uid);status({phase:navigator.onLine?'pending':'offline',updated:meta?.updated,email:user.email,error:null});scheduleCloud(250)
}
export function changedCloud(){if(activeUid){status({phase:navigator.onLine?'pending':'offline'});scheduleCloud()}}
window.addEventListener('online',()=>scheduleCloud(250))
window.addEventListener('offline',()=>{if(activeUid)status({phase:'offline'})})
window.addEventListener('focus',()=>scheduleCloud(1000))
export const withCloudLock=lock

