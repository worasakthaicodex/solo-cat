import React,{useSyncExternalStore} from 'react'
import {accountStorageState,subscribeAccountStorage} from './account-storage'
import {t as trUI} from './i18n'

export default function AccountStorageGate({children}){
 const state=useSyncExternalStore(subscribeAccountStorage,accountStorageState)
 if(!state.ready)return <div role={state.error?'alert':'status'} style={{padding:24,textAlign:'center'}}>{trUI(state.error||'กำลังเปิดข้อมูลในเครื่อง…')}{state.error&&<p><button onClick={()=>location.reload()}>{trUI('ลองอีกครั้ง')}</button></p>}</div>
 return children
}
