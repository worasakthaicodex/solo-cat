import React,{useSyncExternalStore} from 'react'
import {privacyChoice,observePrivacy,choosePrivacy} from './privacy-consent'
import {language} from './i18n'
import './privacy-consent.css'
export default function PrivacyConsent({settings=false}){
 const choice=useSyncExternalStore(observePrivacy,privacyChoice),en=language()==='en'
 if(!settings&&choice)return null
 return <section className={settings?'privacy-settings':'privacy-banner'} aria-label={en?'Privacy choices':'ตัวเลือกความเป็นส่วนตัว'}>
 <h2>{en?'Your privacy, your choice':'ความเป็นส่วนตัว คุณเลือกได้'}</h2>
 <p>{en?'We use essential storage for sign-in, your records and offline use. Optional statistics (Google Analytics and anonymous guest/member return counts) help us improve Solo Cat.':'เราใช้พื้นที่เก็บข้อมูลที่จำเป็นสำหรับเข้าสู่ระบบ บันทึกรายการ และใช้งานออฟไลน์ ส่วนสถิติ Google Analytics และการนับ Guest/สมาชิกที่กลับมาใช้ จะเก็บเมื่อคุณอนุญาตเท่านั้น'}</p>
 <p>{en?'Your records and backups work with either choice. Sharing personal information is a separate choice.':'เลือกแบบไหนก็ยังบันทึกและสำรองข้อมูลได้ การแชร์ข้อมูลส่วนตัวต้องเลือกอนุญาตแยกต่างหาก'}</p>
 <p>{en?'Guest statistics use a random browser ID and milestones only, never task, expense or note contents.':'สถิติ Guest ใช้รหัสสุ่มของเบราว์เซอร์และเหตุการณ์ใช้งานเท่านั้น ไม่ส่งเนื้อหางาน รายจ่าย หรือโน้ต'}</p>
 <a href={en?'/about-en.html#privacy':'/about-th.html#privacy'} target="_blank" rel="noreferrer">{en?'Storage and statistics details':'รายละเอียดการเก็บข้อมูลและสถิติ'}</a>
 {settings&&<p role="status">{en?'Current choice: ':'ตัวเลือกปัจจุบัน: '}{choice==='statistics'?(en?'Statistics allowed':'อนุญาตสถิติ'):choice==='essential'?(en?'Essential only':'เฉพาะที่จำเป็น'):(en?'Not chosen':'ยังไม่ได้เลือก')}</p>}
 <div className="privacy-actions"><button onClick={()=>choosePrivacy('essential')}>{en?'Essential only':'ใช้เฉพาะที่จำเป็น'}</button><button onClick={()=>choosePrivacy('statistics')}>{en?'Allow statistics':'อนุญาตสถิติ'}</button></div>
 <small>{settings?(en?'Withdrawing stops future collection; it does not delete statistics already sent.':'เมื่อถอนอนุญาตจะหยุดเก็บสถิติใหม่ แต่ไม่ลบสถิติที่ส่งไปแล้ว'):(en?'Change this anytime in Profile → Settings.':'เปลี่ยนใจได้ที่ โปรไฟล์ → การตั้งค่า')}</small>
 </section>
}
