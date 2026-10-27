export function startInboxTracking(store=globalThis.SoloStore){
 let timer,stopped=false
 const refresh=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(!stopped)store.refreshDueInbox().catch(()=>{})},80)}
 const visible=()=>{if(document.visibilityState==='visible')refresh()}
 // Rebuild projections for existing pet records before the first daily summary.
 store.reconcilePets().then(refresh).catch(refresh)
 window.addEventListener('items-committed',refresh)
 window.addEventListener('focus',refresh)
 window.addEventListener('solo-cloud-status',refresh)
 document.addEventListener('visibilitychange',visible)
 const interval=setInterval(visible,60000)
 return()=>{stopped=true;clearTimeout(timer);clearInterval(interval);window.removeEventListener('items-committed',refresh);window.removeEventListener('focus',refresh);window.removeEventListener('solo-cloud-status',refresh);document.removeEventListener('visibilitychange',visible)}
}
