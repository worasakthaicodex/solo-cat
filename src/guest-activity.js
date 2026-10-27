import {observeGoogleAccount,firebaseToken} from './firebase-auth'
const KEY='solo-cat.guest-statistics.v1'
const sources=new Set(['google','bing','facebook','instagram','line','tiktok','youtube','direct','other'])
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
export function clearGuestActivity(){try{localStorage.removeItem(KEY)}catch{}}
export function startGuestActivity({enabled=import.meta.env.PROD}={}){
 if(!enabled)return()=>{}
 const excluded=()=>{try{return localStorage.getItem('solo-cat.statistics-excluded')==='yes'}catch{return false}}
 let stopped=false,user,busy=false,timer,controller,memory,nextRetry=0
 function read(){try{return JSON.parse(localStorage.getItem(KEY))||memory}catch{return memory}}
 function write(value){memory=value;try{localStorage.setItem(KEY,JSON.stringify(value))}catch{}}
 function state(){let value=read();if(value?.session_id)return value;const params=new URLSearchParams(location.search);let source=params.get('utm_source')?.toLowerCase();if(!sources.has(source)){try{const host=new URL(document.referrer).hostname;source=['google','bing','facebook','instagram','tiktok','youtube'].find(s=>host===s+'.com'||host.endsWith('.'+s+'.com'))||'other'}catch{source='direct'}}const campaign=params.get('utm_campaign')||'';value={session_id:crypto.randomUUID(),first_visit_at:new Date().toISOString(),source,campaign:/^[a-zA-Z][a-zA-Z0-9_-]{0,47}$/.test(campaign)?campaign:'',guest_started:false,first_item_created:false,signup:false};write(value);return value}
 async function flush(){
  if(stopped||excluded()||busy||!navigator.onLine||Date.now()<nextRetry||user===undefined)return
  const value=read();if(!value||(!value.pending&&!value.signupPending)||user&&!value.signupPending)return
  if(value.signupPending&&!user)return
  busy=true;const payload={session_id:value.session_id,first_visit_at:value.first_visit_at,source:value.source,campaign:value.campaign,guest_started:value.guest_started,first_item_created:value.first_item_created,signup:!!value.signupPending}
  try{const headers={'Content-Type':'application/json'};if(payload.signup){if(!user)return;headers.Authorization='Bearer '+await firebaseToken(user.uid)}if(stopped)return;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);let response;try{response=await fetch('/api/guest-activity',{method:'POST',headers,body:JSON.stringify(payload),signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'})}finally{clearTimeout(timeout)}if(!response.ok)throw Error('retry');if(stopped)return;const latest=read();if(latest?.session_id===value.session_id){const unchanged=latest.guest_started===payload.guest_started&&latest.first_item_created===payload.first_item_created;write({...latest,pending:!unchanged,signupPending:payload.signup?false:latest.signupPending,sentDay:day()})}}
  catch{if(!stopped){nextRetry=Date.now()+60000;timer=setTimeout(flush,60000)}}finally{busy=false;if(!stopped&&(read()?.pending||read()?.signupPending)&&Date.now()>=nextRetry)queueMicrotask(flush)}
 }
 function visit(){if(stopped||excluded()||document.visibilityState!=='visible'||location.hash==='#owner-retention')return;if(user!==null){flush();return;}const value=state();if(value.sentDay!==day())write({...value,pending:true});flush()}
 function mark(name){if(stopped||excluded()||user!==null)return;const value=state();if(value[name]){visit();return}write({...value,[name]:true,guest_started:['guest_started','first_item_created'].includes(name)?true:value.guest_started,pending:true});flush()}
 const guest=()=>mark('guest_started'),created=()=>mark('first_item_created')
 const signup=()=>{if(stopped||excluded())return;const value=read();if(!value||value.signup)return;write({...value,signup:true,signupPending:true,pending:true});flush()}
 const stopAuth=observeGoogleAccount(value=>{user=value;if(value===null&&window.soloGuestStarted)guest();visit();flush()})
 window.addEventListener('solo-guest-started',guest);window.addEventListener('solo-first-item-created',created);window.addEventListener('solo-signup',signup)
 document.addEventListener('visibilitychange',visit);window.addEventListener('focus',visit);window.addEventListener('pointerdown',visit);window.addEventListener('keydown',visit);window.addEventListener('online',visit)
 // Consent accepted after entering Guest: count using an in-memory flag, never inspect records.
 if(window.soloGuestStarted)guest()
 return()=>{stopped=true;controller?.abort();clearTimeout(timer);stopAuth();window.removeEventListener('solo-guest-started',guest);window.removeEventListener('solo-first-item-created',created);window.removeEventListener('solo-signup',signup);document.removeEventListener('visibilitychange',visit);for(const event of ['focus','pointerdown','keydown','online'])window.removeEventListener(event,visit)}
}
