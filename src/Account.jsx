import PrivacyConsent from './PrivacyConsent'
import CloudStatus from './CloudStatus'
import LanguagePicker from './LanguagePicker'
import {t as trUI,locale} from './i18n'
import Notifications from './Notifications.jsx'
import {useStoredState,flushDomainWrites} from './persistent-state.jsx'
import React,{useState} from 'react'
import {UserRound,Bell,Palette,ShieldCheck, CircleHelp,Info,ChevronRight,ArrowLeft,LockKeyhole,Heart} from 'lucide-react'
import avatar from './assets/profile-avatar-reference.webp'
import sleeping from './assets/profile-sleep-reference.webp'
function ProfileCat(){return <img src={avatar} alt={trUI("แมวใส่แว่นเท้าคาง")}/>}
function RestCat(){return <img className="account-sleep-cat" src={sleeping} alt={trUI("แมวนอนพักบนเบาะ")}/>}
import './account.css'
import Backup from './Backup.jsx'
export default function Account({onLogout,onNotifications}){
 const guideUrl=locale().startsWith('en')?'/about-en.html':'/about-th.html';
 const [saving,setSaving]=useState(false);
 const [section,setSection]=useState(null),[name,setName]=useStoredState('account:name','คุณ'),[email,setEmail]=useStoredState('account:email',''),[draft,setDraft]=useState({name:'',email:''}),[alerts,setAlerts]=useState([true,true,false]),[theme,setTheme]=useStoredState('account:theme','ครีมอบอุ่น'),[large,setLarge]=useStoredState('account:large',false),[lock,setLock]=useState(false),[notice,setNotice]=useState(''),[faq,setFaq]=useState(null)
 const rows=[['การตั้งค่า',Info],['สำรองและกู้คืน',ShieldCheck],['ข้อมูลส่วนตัว',UserRound],['การแจ้งเตือน',Bell],['ธีมและการแสดงผล',Palette],['ความปลอดภัย',ShieldCheck],['ช่วยเหลือและคำถามที่พบบ่อย',CircleHelp],['เกี่ยวกับ Solo Cat',Info]]
 function open(label){setDraft({name,email});setNotice('');setSection(label)}
 if(section==='การแจ้งเตือน')return <Notifications settingsOnly onBack={()=>setSection(null)}/>
 if(section==='สำรองและกู้คืน')return <Backup onBack={()=>setSection(null)}/>
 return <main className={`account-page ${theme==='ชมพูอ่อน'?'account-pink':''} ${large?'account-large':''}`}>
 {section?<><header className="account-subhead"><button aria-label={trUI("กลับหน้าโปรไฟล์")} onClick={()=>{setSection(null);setNotice('')}}><ArrowLeft/></button><h1>{trUI(section)}</h1><span/></header>
 {section==='การตั้งค่า'&&<section className="account-panel"><h2>{trUI('รีเฟรชแอป')}</h2><p className="account-muted">{trUI('เปิดแอปใหม่เพื่อใช้เวอร์ชันล่าสุด ข้อมูลที่บันทึกไว้จะยังอยู่')}</p><button className="account-primary" disabled={saving} onClick={async()=>{setSaving(true);setNotice('');try{await flushDomainWrites();await window.soloRefreshApp()}catch{setNotice('รีเฟรชไม่สำเร็จ กรุณาลองอีกครั้ง');setSaving(false)}}}>{trUI(saving?'กำลังเปิดใหม่…':'รีเฟรชแอป')}</button></section>}
 {section==='การตั้งค่า'&&<PrivacyConsent settings/>}
 {section==='ข้อมูลส่วนตัว'&&<form className="account-panel account-form" onSubmit={async e=>{e.preventDefault();if(saving||!draft.name.trim())return;setSaving(true);setNotice('');try{const results=await Promise.all([setName(draft.name.trim()),setEmail(draft.email.trim())]);setNotice(results.every(Boolean)?'บันทึกข้อมูลแล้ว ♡':'บันทึกไม่สำเร็จ กรุณาลองบันทึกอีกครั้ง')}finally{setSaving(false)}}}><div className="account-edit-avatar"><ProfileCat/></div><label>{trUI("ชื่อที่แสดง")}<input required maxLength={40} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>{trUI("อีเมล")}<input type="email" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})}/></label><button className="account-primary" type="submit" disabled={saving}>{saving?trUI("กำลังบันทึก…"):trUI("บันทึกข้อมูล")}</button></form>}
 {section==='ธีมและการแสดงผล'&&<section className="account-panel"><h2>{trUI("สีที่ทำให้รู้สึกดี")}</h2><div className="account-themes">{['ครีมอบอุ่น','ชมพูอ่อน'].map(t=><button aria-pressed={theme===t} className={theme===t?'selected':''} key={t} onClick={()=>setTheme(t)}><i style={{background:t==='ครีมอบอุ่น'?'#fff2df':'#ffcfdf'}}/>{trUI(t)}</button>)}</div><label className="account-toggle"><span>{trUI("ตัวอักษรขนาดใหญ่")}</span><input role="switch" type="checkbox" checked={large} onChange={()=>setLarge(v=>!v)}/></label><p className="account-muted">{trUI("แสดงตัวอย่างธีมและขนาดตัวอักษรในหน้าโปรไฟล์นี้")}</p></section>}
 {section==='ความปลอดภัย'&&<section className="account-panel"><div className="account-security-icon"><ShieldCheck/></div><h2>{trUI("พื้นที่ส่วนตัวของคุณ")}</h2><p><a href={guideUrl+'#security'}>{trUI("การเข้ารหัสและการป้องกันข้อมูล")}</a></p><p className="account-muted">{trUI("ยังไม่มีระบบล็อกแอป ข้อมูลในเครื่องเข้าถึงได้จากโปรไฟล์เบราว์เซอร์นี้")}</p><button className="account-primary" onClick={()=>setSection('สำรองและกู้คืน')}>{trUI("สำรองข้อมูลแบบเข้ารหัส")}</button></section>}
 {section==='ช่วยเหลือและคำถามที่พบบ่อย'&&<section className="account-panel account-faq"><p><a href={guideUrl}>{trUI("คู่มือการใช้งานทุกฟังก์ชัน")}</a></p>{[['เพิ่มรายการได้อย่างไร?','แตะปุ่ม + ด้านล่าง แล้วกรอกชื่อ วันที่ และรายละเอียดของรายการ'],['ค่าใช้จ่ายอยู่ในปฏิทินไหม?','รายการค่าใช้จ่ายจะแสดงในปฏิทินตามวันที่ครบกำหนดที่เลือกไว้'],['ข้อมูลถูกบันทึกถาวรไหม?','ข้อมูลเก็บในเครื่องและสำรองอัตโนมัติเมื่อเข้าสู่ระบบ Google ตรวจสถานะสำรองสำเร็จก่อนล้างข้อมูลเว็บไซต์']].map(([q,a],i)=><div key={q}><button aria-expanded={faq===i} onClick={()=>setFaq(faq===i?null:i)}>{trUI(q)}<ChevronRight/></button>{faq===i&&<p>{trUI(a)}</p>}</div>)}</section>}
 {section==='เกี่ยวกับ Solo Cat'&&<section className="account-panel account-about"><ProfileCat/><p><a href={guideUrl}>{trUI("คู่มือการใช้งานทุกฟังก์ชัน")}</a></p><h2>Solo Cat <span>♥</span></h2><p>{trUI("ชีวิตง่ายขึ้น เพราะมีแมวอยู่ข้าง ๆ")}</p><p className="account-muted">{trUI("เวอร์ชัน 1.0.0 · เวอร์ชันตัวอย่าง")}<br/>{trUI("พื้นที่เล็ก ๆ สำหรับจัดการเรื่องสำคัญของคุณ")}</p></section>}
 {notice&&<p className="account-notice" role="status">{trUI(notice)}</p>}<p className="account-muted account-session">{trUI("ข้อมูลโปรไฟล์เก็บในเครื่องนี้ อีเมลเป็นข้อมูลติดต่อ ยังไม่ได้ยืนยันบัญชี")}</p></>:<><header className="account-profile"><div className="account-avatar"><ProfileCat/></div><div className="account-identity"><h1>{name} <span>♥</span></h1><p>{email}</p><small><LockKeyhole size={12}/>{trUI("โปรไฟล์ในเครื่อง")}</small></div><p className="account-welcome">{trUI("คุณสำคัญเสมอ")}<br/>{trUI("ให้เราช่วย")}<br/>{trUI("ดูแลนะ! ♡")}</p></header><LanguagePicker/><CloudStatus/><section className="account-menu" aria-label={trUI("เมนูโปรไฟล์")}>{rows.map(([label,Icon])=><button key={trUI(label)} onClick={()=>open(label)}><Icon size={23}/><span>{trUI(label)}</span><ChevronRight size={18}/></button>)}</section><aside className="account-banner"><p>{trUI("ขอบคุณที่อยู่ด้วยกันนะ")}<br/>{trUI("แมวพร้อมอยู่ข้าง ๆ เสมอ")}<br/><small>— Solo Cat ♡</small></p><RestCat/></aside><button className="account-logout" onClick={onLogout}>{trUI("ออกจากระบบ")}</button><footer className="account-footer">{trUI("เวอร์ชัน 1.0.0")}<br/>{trUI("ใช้ชีวิตคนเดียว... แต่ไม่เคยเดียวดาย")}<Heart size={12}/></footer></>}
 </main>
}




