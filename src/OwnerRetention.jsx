import React,{useState,useEffect} from 'react'
import {PawPrint,RefreshCw,ArrowUpRight,ShieldCheck,Users,LogOut} from 'lucide-react'
import {Metrics,number,reportDate} from './OwnerReportUI'
import './owner-report.css'
import OwnerGuestStats from './OwnerGuestStats'
import {observeGoogleAccount,firebaseToken,googleSignIn,googleSignOut} from './firebase-auth'
export default function OwnerRetention(){
 const [user,setUser]=useState(null),[result,setResult]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[reload,setReload]=useState(0)
 useEffect(()=>observeGoogleAccount(setUser),[])
 useEffect(()=>{let active=true;setResult(null);setError('');if(!user)return;setLoading(true)
  ;(async()=>{try{const token=await firebaseToken(user.uid);const r=await fetch('/api/owner/retention',{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(55000)});if(!r.ok)throw Error(r.status===403?'บัญชีนี้ไม่มีสิทธิ์ดูรายงาน':r.status===401?'กรุณาเข้าสู่ระบบอีกครั้ง':'โหลดรายงานไม่สำเร็จ กรุณาลองใหม่');const data=await r.json();if(active)setResult({uid:user.uid,data})}catch(e){if(active)setError(e.message)}finally{if(active)setLoading(false)}})()
  return()=>{active=false}
 },[user?.uid,reload])
 const data=user&&result&&result.uid===user.uid?result.data:null
 const count=(value,total)=>value==null?'ยังไม่ถึงวัน':`${value} บัญชี${total?' · '+(100*value/total).toFixed(1)+'%':''}`
 const jump=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})
 return <div className="owner-report">
  <header className="owner-topbar"><div className="owner-topbar-inner"><a href="/" className="owner-brand"><span><PawPrint size={23}/></span>Solo Cat<small>รายงานเจ้าของเว็บ</small></a>{user&&<div className="owner-account"><span>{user.email}</span><button className="owner-button quiet" onClick={()=>googleSignOut().catch(()=>setError('ออกจากระบบไม่สำเร็จ'))}><LogOut size={14}/>ออกจากระบบ / เปลี่ยนบัญชี</button></div>}</div></header>
  <main className="owner-shell"><div className="owner-title-row"><div><span className="owner-eyebrow">Solo Cat · Usage report</span><h1>ภาพรวมการใช้งาน</h1><p>ดูการเริ่มใช้และการกลับมาใช้งาน · เวลาไทย (GMT+7)</p></div><div className="owner-actions">{user&&<button className="owner-button primary" disabled={loading} onClick={()=>setReload(x=>x+1)}><RefreshCw size={16}/>โหลดรายงานใหม่</button>}<a className="owner-button" href="/">กลับไป Solo Cat<ArrowUpRight size={16}/></a></div></div>
  {!user?<section className="owner-login"><ShieldCheck/><h2>รายงานสำหรับเจ้าของ Solo Cat</h2><p>เข้าสู่ระบบด้วยบัญชีเจ้าของเพื่อดูสถิติสมาชิกและ Guest<br/>ข้อมูลรายงานไม่เปิดให้บุคคลทั่วไป</p><button className="owner-button primary" onClick={()=>googleSignIn().catch(()=>setError('เข้าสู่ระบบไม่สำเร็จ'))}>เข้าสู่ระบบ Google</button>{error&&<p className="owner-status owner-error" role="alert">{error}</p>}</section>:<>
   <nav className="owner-overview-nav" aria-label="ส่วนของรายงาน"><a href="#owner-retention" onClick={e=>{e.preventDefault();jump('owner-guests')}}>Guest และการเริ่มใช้</a><a href="#owner-retention" onClick={e=>{e.preventDefault();jump('owner-members')}}>สมาชิกที่กลับมา</a><span><ShieldCheck size={15}/>นับเฉพาะผู้อนุญาตสถิติ</span></nav>
   <OwnerGuestStats user={user} refreshKey={reload}/>
   <section className="owner-section owner-members" id="owner-members"><div className="owner-section-head"><div className="owner-section-title"><span className="owner-section-icon"><Users size={22}/></span><div><h2>สมาชิกที่กลับมา</h2><p>นับตามบัญชีที่เข้าสู่ระบบ · แยกจากเบราว์เซอร์ Guest</p></div></div>{data&&<span className="owner-date">เริ่มเก็บ {reportDate(data.trackingSince)}</span>}</div>
    {loading&&<p role="status" className="owner-status">กำลังโหลด…</p>}{error&&<p role="alert" className="owner-status owner-error">{error}</p>}{data&&<>
     <Metrics unit="บัญชี" items={[["สมาชิกสะสม",data.totalMembers,"บัญชีที่ระบบเคยพบ"],["เคยกลับมาใช้ซ้ำ",data.returnedMembers,"ใช้งานอย่างน้อย 2 วันต่างกัน"],["ใช้งานใน 7 วันล่าสุด",data.active7],["ใช้งานใน 30 วันล่าสุด",data.active30]]}/>
     <p className="owner-inline-note">วันนี้มีสมาชิกมาใช้งาน <strong>{number(data.activeToday)} บัญชี</strong> · ไม่นับบัญชีเจ้าของเว็บ</p>
     <section className="owner-panel"><div className="owner-panel-heading"><div><h3>การกลับมา แยกตามวันสมัคร</h3><p>ดูว่าสมาชิกกลุ่มเดียวกันกลับมาในวันถัดไปหรือวันที่ 7 กี่บัญชี</p></div></div><div className="owner-table-scroll" tabIndex="0" role="region" aria-label="ตารางสมาชิกตามวันสมัคร"><table className="owner-table"><thead><tr>{['วันสมัคร','สมาชิกที่พบ','กลับมาวันถัดไป','กลับมาวันที่ 7','กลับมาวันนี้'].map(x=><th scope="col" key={x}>{x}</th>)}</tr></thead><tbody>{(data.cohorts||[]).filter(r=>data.trackingSince&&r.date>=data.trackingSince).map(r=><tr key={r.date}>{[reportDate(r.date),number(r.members)+' บัญชี',count(r.day1,r.members),count(r.day7,r.members),r.date===data.today?'—':count(r.returnedToday,r.members)].map((x,i)=><td key={i}>{x}</td>)}</tr>)}{!(data.cohorts||[]).some(r=>data.trackingSince&&r.date>=data.trackingSince)&&<tr><td colSpan="5">ยังไม่มีข้อมูลตามวันสมัคร</td></tr>}</tbody></table></div><p className="owner-table-note">“ยังไม่ถึงวัน” หมายถึงยังวัดผลไม่ได้ ไม่ใช่ไม่มีคนกลับมา</p></section>
     <details className="owner-help"><summary>วิธีนับสมาชิกและข้อควรทราบ</summary><ul><li>กลับมาใช้ซ้ำ = พบการใช้งานอย่างน้อย 2 วันต่างกัน ไม่จำเป็นต้องติดกัน นับบัญชีเดิมครั้งเดียวและสะสมข้ามเดือน</li><li>สมาชิกสะสมคือบัญชีที่ระบบพบตั้งแต่เริ่มติดตาม ไม่ใช่ยอดบัญชีเก่าทั้งหมด ช่วงหลังเพิ่มตัวเลือกความเป็นส่วนตัวจะนับเฉพาะผู้อนุญาตสถิติ</li><li>ออฟไลน์เก็บวันใช้งานในเครื่องแล้วส่งเมื่อออนไลน์ ตัวเลขสมาชิกอาจเพิ่มย้อนหลังได้ แคชและสำรองเบื้องหลังไม่นับเป็นการกลับมา</li><li>กลุ่มวันสมัครนับสมาชิกที่พบในวันสมัครตั้งแต่เริ่มติดตาม ไม่เติมประวัติที่ไม่เคยเก็บ และไม่ใช่ตัวเลข GA4</li></ul></details>
    </>}
   </section>
  </>}
  <footer className="owner-footer">Solo Cat · ข้อมูลเพื่อเข้าใจการใช้งาน ไม่มีเนื้อหางาน รายจ่าย หรือโน้ตในรายงานนี้</footer></main>
 </div>
}
