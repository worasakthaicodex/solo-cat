const KEY='solo-cat.privacy.v1'
let choice=read()
const listeners=new Set()
function read(){try{const value=localStorage.getItem(KEY);return ['essential','statistics'].includes(value)?value:null}catch{return null}}
export const privacyChoice=()=>choice
export function observePrivacy(callback){listeners.add(callback);return()=>listeners.delete(callback)}
function publish(value){choice=value;for(const listener of listeners)listener()}
export function choosePrivacy(value){if(!['essential','statistics'].includes(value))return;try{localStorage.setItem(KEY,value)}catch{}publish(value)}
window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null)publish(read())})
export function clearActivityQueue(){try{const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith('solo-cat.activity:'))keys.push(key)}for(const key of keys)localStorage.removeItem(key)}catch{}}
