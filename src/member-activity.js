import {observeGoogleAccount,firebaseToken} from './firebase-auth'
export function startMemberActivity(){
 if(!import.meta.env.PROD)return
 let user=null,busy=false,retryTimer,stopped=false,nextRetry=0,requestController
 const memory=new Map(),prefix=uid=>'solo-cat.activity:'+uid+':'
 const date=(value=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(value)
 function get(key){try{return localStorage.getItem(key)||memory.get(key)}catch{return memory.get(key)}}
 function set(key,value){memory.set(key,value);try{localStorage.setItem(key,value)}catch{}}
 function pending(uid){const keys=new Set(memory.keys());try{for(let i=0;i<localStorage.length;i++)keys.add(localStorage.key(i))}catch{}const end=date(),start=date(new Date(Date.now()-365*86400000));return [...keys].filter(k=>k?.startsWith(prefix(uid))&&get(k)==='pending').map(k=>k.slice(prefix(uid).length)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=start&&d<=end).sort().slice(0,31)}
 async function flush(){
  if(stopped||!user||busy||!navigator.onLine||Date.now()<nextRetry)return
  const uid=user.uid,days=pending(uid);if(!days.length)return
  busy=true;let succeeded=false
  try{const token=await firebaseToken(uid);if(stopped||user?.uid!==uid)return
   requestController=new AbortController();const timeout=setTimeout(()=>requestController?.abort(),20000);let response;try{response=await fetch('/api/member-activity',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({days}),signal:requestController.signal,cache:'no-store'})}finally{clearTimeout(timeout)}
   if(stopped)return
   if(!response.ok)throw Error('Activity unavailable')
   for(const day of days)set(prefix(uid)+day,'sent');succeeded=true
  }catch{if(stopped)return;nextRetry=Date.now()+120000;clearTimeout(retryTimer);retryTimer=setTimeout(flush,120000)}finally{busy=false;if(!stopped&&(succeeded||user?.uid!==uid))queueMicrotask(flush)}
 }
 function record(){if(stopped||!user||document.visibilityState!=='visible')return;const key=prefix(user.uid)+date();if(!get(key))set(key,'pending');flush()}
 const stop=observeGoogleAccount(value=>{user=value;record();flush()})
 document.addEventListener('visibilitychange',record);window.addEventListener('online',flush);window.addEventListener('focus',record);window.addEventListener('pointerdown',record);window.addEventListener('keydown',record)
 return()=>{stopped=true;requestController?.abort();memory.clear();stop();clearTimeout(retryTimer);document.removeEventListener('visibilitychange',record);window.removeEventListener('online',flush);window.removeEventListener('focus',record);window.removeEventListener('pointerdown',record);window.removeEventListener('keydown',record)}
}
