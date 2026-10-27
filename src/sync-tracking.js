import {observeGoogleAccount} from './firebase-auth'
import {enqueueSync} from './sync-queue'
import {cloudAccount,changedCloud,withCloudLock,pauseCloudAccount} from './cloud-sync'
import {flushDomainWrites} from './persistent-state'
import {setAccountStorage} from './account-storage'
export function startSyncTracking(store=globalThis.SoloStore){
 let account=null,accounts=Promise.resolve();const raw={...store};
 const mutations=['reconcilePets','put','mutateState','mutateItems','deleteRecord','saveItem','addFiles','fileDelete','restore','read','readAll','claim','delivered'];
 for(const key of mutations){const original=raw[key];store[key]=(...args)=>withCloudLock(async()=>{const result=await original(...args);if(account){try{await enqueueSync(account,'snapshot')}catch{/* Startup reconciles the durable local database. */}changedCloud()}return result})}
 let initialized=false,identity,version=0,leaving=false
 const reload=()=>{leaving=true;account=null;pauseCloudAccount();setAccountStorage(false);location.reload()}
 const storageChanged=e=>{if(e.key==='solo-cat.database'&&e.oldValue!==e.newValue)reload()}
 window.addEventListener('storage',storageChanged)
 const unsubscribe=observeGoogleAccount(user=>{
  const uid=user?.uid||null
  if(leaving||(initialized&&uid===identity))return
  const run=++version
  account=null;pauseCloudAccount();setAccountStorage(false)
  accounts=accounts.then(async()=>{
   await flushDomainWrites()
   if(run!==version||leaving)return
   // A live account change discards the old React tree before selecting a new
   // database. Delayed handlers can only finish against the old database.
   if(initialized){if(user)localStorage.setItem('solo-cat.mock-login','yes');else localStorage.removeItem('solo-cat.mock-login');reload();return}
   await cloudAccount(user,raw)
   if(run!==version||leaving){pauseCloudAccount();return}
   identity=uid;initialized=true;account=uid;setAccountStorage(true)
  }).catch(error=>{pauseCloudAccount();setAccountStorage(false,error.message)})
 })
 return()=>{unsubscribe();window.removeEventListener('storage',storageChanged)}
}
