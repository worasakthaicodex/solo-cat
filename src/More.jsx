import Reading from './Reading'
import ReadingArt from './ReadingArt'
import PetArt from './PetArt'
import Pets from './Pets'
import incomeIcon from './assets/income-wallet-v1.webp'
import SupportCard from './SupportCard'
import {t as trUI,locale} from './i18n'
import Emergency from './Emergency'
import Contacts from './Contacts'
import React,{useState,useEffect} from 'react'
import {observeGoogleAccount} from './firebase-auth'
import {ChartNoAxesCombined,PiggyBank,Car, Bike,Siren,Phone,ArrowLeft,ChevronLeft,ChevronRight,PawPrint,LockKeyhole} from 'lucide-react'
import {BrandLogo} from './Welcome'
import {KaoIcon,CatSticker} from './KaoArt'
import icons from './assets/menu-icons-hd.webp'
import clock from './assets/ot-icon-hd.webp'
import sleep from './assets/profile-sleep-reference.webp'
import './more.css'
function MenuArt({crop}){return <svg viewBox={crop} aria-hidden="true"><image href={icons} width="1536" height="1024"/></svg>}
export default function More({onGo}){
 const [panel,setPanel]=useState(null),[notice,setNotice]=useState(''),[menuPage,setMenuPage]=useState(1),[member,setMember]=useState(undefined)
 useEffect(()=>observeGoogleAccount(user=>setMember(Boolean(user))),[])
 const menus=[['เงินเก็บ','savings',<PiggyBank/>],['งาน','work',<MenuArt crop="90 70 390 390"/>],['ค่าใช้จ่าย','items',<MenuArt crop="575 70 390 390"/>],['บ้าน','family',<KaoIcon name="house"/>],['OT','ot',<img src={clock} alt=""/>],['แมวเก๋า','kao',<MenuArt crop="575 550 390 390"/>],['รถคันโปรด','car',<Car/>],['มอเตอร์ไซค์คันโปรด','bike',<Bike/>],['ฉุกเฉิน','emergency',<Siren/>],['เบอร์สำคัญ','contacts',<Phone/>],['รายรับ','income',<img src={incomeIcon} alt=""/>],['สรุปการเงิน','finance',<ChartNoAxesCombined/>]]
 if(panel==='reading')return <Reading onBack={()=>setPanel(null)}/>;
 if(panel==='pets')return <Pets onBack={()=>setPanel(null)}/>;
 if(panel==='emergency')return <Emergency onBack={()=>setPanel(null)}/>;
 if(panel==='contacts')return <Contacts onBack={()=>setPanel(null)}/>;
 return <main className="more-page">{panel?<><header className="more-subhead"><button aria-label={trUI("กลับหน้าเพิ่มเติม")} onClick={()=>{setPanel(null);setNotice('')}}><ArrowLeft/></button><h1>{menus.find(m=>m[1]===panel)?.[0]}</h1><span/></header><div className="more-placeholder"><CatSticker pose="peek"/><h2>{['car','bike'].includes(panel)?trUI("ดูแลคันโปรดไปด้วยกัน"):trUI("เรื่องสำคัญ อยู่ใกล้มือ")}</h2><p>{['car','bike'].includes(panel)?trUI("รวมข้อมูลรถ วันต่อประกัน และวันนัดเข้าศูนย์"):trUI("รวมข้อมูลติดต่อที่คุณอยากเก็บไว้")}</p><small>{trUI("หน้าตัวอย่าง · ยังไม่มีข้อมูลจริง")}</small></div><div className="more-detail-list">{(['car','bike'].includes(panel)?['ข้อมูลรถของฉัน','ประกันและภาษี','ประวัติการดูแล']:panel==='emergency'?['ผู้ติดต่อฉุกเฉิน','ข้อมูลสุขภาพของฉัน','ข้อมูลสำหรับขอความช่วยเหลือ']:['ครอบครัว','คนที่ไว้ใจ','บริการที่ใช้ประจำ']).map(t=><button key={t} onClick={()=>setNotice(`${t} — ยังไม่มีข้อมูลในตัวอย่างนี้`)}>{trUI(t)}<ChevronRight size={18}/></button>)}</div>{notice&&<p role="status" className="more-notice">{trUI(notice)}</p>}</>:<><header className="more-heading"><BrandLogo/><div className="more-pagination"><button aria-label={locale().startsWith('en')?'Previous page':'หน้าก่อนหน้า'} disabled={menuPage===1} onClick={()=>setMenuPage(1)}><ChevronLeft/></button><h1>{trUI("เพิ่มเติม")} <small>{menuPage}/2</small></h1><button aria-label={locale().startsWith('en')?'Next page':'หน้าถัดไป'} disabled={menuPage===2} onClick={()=>setMenuPage(2)}><ChevronRight/></button></div></header><section className="more-grid" aria-label={trUI("เมนูทั้งหมด")}>{(menuPage===1?menus:[[locale().startsWith('en')?'My Pets':'นายท่าน','pets',<PetArt name="heart"/>],[locale().startsWith('en')?'Reading corner':'มุมหนังสือ','reading',<ReadingArt/>]]).map(([label,key,art])=><button key={key} onClick={()=>['emergency','contacts','pets','reading'].includes(key)?setPanel(key):onGo(key)}><span className={'more-icon '+key}>{art}</span><span>{trUI(label)}</span>{['pets','reading'].includes(key)&&member===false&&<small><LockKeyhole size={12}/> {locale().startsWith('en')?'Members':'สำหรับสมาชิก'}</small>}</button>)}</section><SupportCard/><aside className="more-footer"><img src={sleep} alt={trUI("แมวนอนพักอยู่ข้าง ๆ")}/><p>{trUI("มี Solo Cat")}<br/>{trUI("อยู่ข้าง ๆ เสมอ")}<br/>♡</p></aside></>}</main>
}


