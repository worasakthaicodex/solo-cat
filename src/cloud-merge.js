const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b)
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)
const identified=x=>Array.isArray(x)&&x.every(v=>object(v)&&['string','number'].includes(typeof v.id))
export class SyncConflict extends Error{constructor(path){super('ข้อมูลรายการเดียวกันถูกแก้จากหลายเครื่อง ข้อมูลทั้งสองฝั่งยังอยู่');this.path=path}}
export function mergeValue(base,local,remote,path='data'){
 if(same(local,remote))return local
 if(same(base,local))return remote
 if(same(base,remote))return local
 if(identified(local)&&identified(remote)&&(base===undefined||identified(base))){
  const b=new Map((base||[]).map(x=>[String(x.id),x])),l=new Map(local.map(x=>[String(x.id),x])),r=new Map(remote.map(x=>[String(x.id),x]))
  return [...new Set([...l.keys(),...r.keys(),...b.keys()])].map(k=>mergeValue(b.get(k),l.get(k),r.get(k),path+'.'+k)).filter(v=>v!==undefined)
 }
 if(object(local)&&object(remote)&&(base===undefined||object(base))){const result={};for(const k of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){const value=mergeValue(base?.[k],local[k],remote[k],path+'.'+k);if(value!==undefined)result[k]=value}return result}
 throw new SyncConflict(path)
}
export const emptyCloud=()=>({schema:1,state:[],inbox:[],files:[]})
export function mergeSnapshots(base,local,remote){const result={schema:1};for(const key of ['state','files','inbox'])result[key]=mergeValue(base?.[key]||[],local[key],remote[key],key);const petPhotos=new Map();for(const f of result.files){if(f.owner?.startsWith('pet:')){const n=(petPhotos.get(f.owner)||0)+1;petPhotos.set(f.owner,n);if(n>3)throw new SyncConflict('files.'+f.owner)}}return result}
