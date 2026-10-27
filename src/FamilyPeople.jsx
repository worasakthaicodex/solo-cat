import React,{useState} from 'react'
import {CatSticker} from './KaoArt'
import {t} from './i18n'
export const defaultPeople=[{id:'พ่อ',name:'พ่อ',avatar:'sit'},{id:'แม่',name:'แม่',avatar:'cheer'}]
export function PersonForm({onSave}){
 const [name,setName]=useState(''),[avatar,setAvatar]=useState('sit'),[busy,setBusy]=useState(false),[error,setError]=useState('')
 return <form onSubmit={async e=>{e.preventDefault();if(busy||!name.trim())return;setBusy(true);setError('');try{if(await onSave({id:crypto.randomUUID(),name:name.trim(),avatar})===false)throw Error();}catch{setError(t('บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'))}finally{setBusy(false)}}}><h2>{t('เพิ่มคนที่ดูแล')}</h2><div className="family-person-presets">{['แฟน','พี่','น้อง','ปู่','ย่า','ตา','ยาย','อื่น ๆ'].map(n=><button type="button" key={n} onClick={()=>setName(n==='อื่น ๆ'?'':t(n))}>{t(n)}</button>)}</div><label>{t('ชื่อ')}<input autoFocus required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label><fieldset className="family-avatar-picker"><legend>{t('เลือกรูป')}</legend>{['sit','cheer','work','travel','relax','tired','hope','peek'].map((pose,i)=><button key={pose} type="button" aria-label={`${t('รูป')} ${i+1}`} aria-pressed={avatar===pose} onClick={()=>setAvatar(pose)}><CatSticker pose={pose}/></button>)}</fieldset>{error&&<p role="alert">{error}</p>}<button className="family-primary" disabled={busy}>{t('บันทึก')}</button></form>
}

