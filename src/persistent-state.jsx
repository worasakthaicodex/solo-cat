import {accountStorageState} from './account-storage'
import {t as trUI,locale} from './i18n'
import React,{useEffect,useState,useSyncExternalStore} from 'react'
const values=new Map(),defaults=new Map(),listeners=new Map(),pending=new Map();let writes=Promise.resolve();const failedWrites=new Map();
const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('solo-domains'):null;
function publish(key){for(const fn of listeners.get(key)||[])fn()}
function report(){window.dispatchEvent(new CustomEvent('local-save',{detail:failedWrites.size?'บันทึกบางรายการไม่สำเร็จ ข้อมูลที่แก้ยังอยู่ในหน้านี้':'saved'}))}
async function refresh(){const account=accountStorageState();if(!account.ready)return;const all=await SoloStore.allStates();if(accountStorageState()!==account)return;const keys=new Set(all.map(row=>row.id));for(const key of values.keys())if(!keys.has(key)&&!pending.get(key)&&!failedWrites.has(key)){values.set(key,defaults.get(key));publish(key)}for(const row of all)if(row.id.startsWith('domain:')&&!pending.get(row.id)&&!failedWrites.has(row.id)){values.set(row.id,row.value);publish(row.id)}}
if(channel)channel.onmessage=()=>refresh().catch(()=>{});
window.addEventListener('pet-records-committed',()=>refresh().catch(()=>{}));
export const hydrateDomainState=refresh;
export const refreshDomainState=refresh;
function enqueue(key,next){pending.set(key,(pending.get(key)||0)+1);const operation=writes.then(async()=>{try{if(failedWrites.has(key))throw Error('Previous write pending');const saved=await SoloStore.mutateState(key,current=>typeof next==='function'?next(current):next,defaults.get(key));if(pending.get(key)===1){values.set(key,saved);publish(key)}channel?.postMessage(key);return true}catch{const failed=failedWrites.get(key)||[];failed.push(next);failedWrites.set(key,failed);return false}finally{pending.set(key,pending.get(key)-1);report()}});writes=operation.then(()=>{});return operation}
export function useStoredState(key,initial){key='domain:'+key;if(!defaults.has(key))defaults.set(key,typeof initial==='function'?initial():initial);if(!values.has(key))values.set(key,defaults.get(key));const value=useSyncExternalStore(fn=>{const set=listeners.get(key)||new Set();listeners.set(key,set);set.add(fn);return()=>set.delete(fn)},()=>values.get(key));return [value,next=>{values.set(key,typeof next==='function'?next(values.get(key)):next);publish(key);return enqueue(key,next)}]}
async function retry(){await writes;const failures=[...failedWrites];failedWrites.clear();for(const [key,operations] of failures)for(const operation of operations)enqueue(key,operation);await writes;report()}
export function StorageGate({children}){const [ready,setReady]=useState(false),[error,setError]=useState(''),[retrying,setRetrying]=useState(false);useEffect(()=>{let active=true;hydrateDomainState().then(()=>{if(active){setReady(true);window.dispatchEvent(new Event('solo-ready'))}}).catch(()=>{if(active)setError('เปิดฐานข้อมูลในเครื่องไม่สำเร็จ กรุณาโหลดใหม่')});const handler=e=>setError(e.detail==='saved'?'':e.detail),focus=()=>refresh().catch(()=>{});window.addEventListener('local-save',handler);window.addEventListener('focus',focus);return()=>{active=false;window.removeEventListener('local-save',handler);window.removeEventListener('focus',focus)}},[]);if(!ready)return <p role="status">{trUI(error||'กำลังเปิดข้อมูลในเครื่อง…')}</p>;return <>{children}{error&&<div className="toast" role="alert">{trUI(error)} <button disabled={retrying} onClick={async()=>{setRetrying(true);try{await retry()}finally{setRetrying(false)}}}>{retrying?trUI("กำลังลองใหม่…"):trUI("ลองบันทึกอีกครั้ง")}</button></div>}</>}
export const flushDomainWrites=async()=>{await writes;if(failedWrites.size)throw Error('มีข้อมูลที่ยังบันทึกไม่สำเร็จ กรุณาลองบันทึกอีกครั้งก่อนสำรอง')};
export async function deleteStoredRecord(key,id,owner){await flushDomainWrites();await SoloStore.deleteRecord('domain:'+key,id,owner);await refresh();channel?.postMessage(key)}


