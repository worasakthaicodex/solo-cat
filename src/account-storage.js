// Keep account readiness separate from React and cloud sync to avoid startup races.
let state={ready:false,error:''}
const listeners=new Set()
export const accountStorageState=()=>state
export const subscribeAccountStorage=fn=>{listeners.add(fn);return()=>listeners.delete(fn)}
export function setAccountStorage(ready,error=''){
 state={ready,error};for(const fn of listeners)fn()
 window.dispatchEvent(new Event('solo-account-storage'))
}

export function accountDatabase(user,storage=localStorage){
 const map=JSON.parse(storage.getItem('solo-cat.account-databases')||'{}')
 if(!map||typeof map!=='object'||Array.isArray(map)||Object.values(map).some(v=>typeof v!=='string'||!v))throw Error('ไม่สามารถยืนยันฐานข้อมูลของบัญชีนี้ได้')
 const current=storage.getItem('solo-cat.database')||'solo-cat-local'
 const owner=storage.getItem('solo-cat.database-owner')
 // Preserve older installations whose owner marker predates the registry.
 if(owner&&!Object.hasOwn(map,owner))map[owner]=current
 if(new Set(Object.values(map)).size!==Object.keys(map).length)throw Error('พบฐานข้อมูลผูกกับหลายบัญชี จึงหยุดซิงก์เพื่อป้องกันข้อมูลปะปน')
 let database
 if(user){
  database=Object.hasOwn(map,user.uid)?map[user.uid]:null
  if(!database){
   database=!owner&&!Object.keys(map).length?current:'solo-cat-user-'+user.uid
   if(Object.values(map).includes(database))throw Error('ไม่สามารถยืนยันเจ้าของฐานข้อมูลได้')
   map[user.uid]=database
  }
 }else{
  database=!owner&&!Object.keys(map).length?current:'solo-cat-guest'
  while(Object.values(map).includes(database))database+='-guest'
 }
 return {database,map,owner:user?.uid||owner}
}
