import {t as trUI,locale} from './i18n'
import React,{useState} from 'react'
export default function FamilyMember({member,onDelete}){
 const [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function remove(){if(busy)return;setBusy(true);setError('');try{const ok=await onDelete();if(ok===false)throw Error('ลบไม่สำเร็จ กรุณาลองอีกครั้ง')}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <div><h2>{member.name}</h2><p>{member.role}</p>{member.id!==1&&(confirm?<section><p>{trUI("ลบ “")}{member.name}{trUI("” ออกจากรายชื่อสมาชิกในเครื่องนี้?")}</p><small>{trUI("รายการดูแลและประวัติที่บันทึกไว้ยังอยู่")}</small><button className="family-primary" disabled={busy} onClick={remove}>{busy?trUI("กำลังลบ…"):trUI("ยืนยันลบสมาชิก")}</button><button className="family-outline" disabled={busy} onClick={()=>setConfirm(false)}>{trUI("เก็บสมาชิกไว้")}</button></section>:<button className="family-outline" onClick={()=>setConfirm(true)}>{trUI("ลบสมาชิก")}</button>)}{error&&<p role="alert">{trUI(error)}</p>}</div>
}
