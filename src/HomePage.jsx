import incomeIcon from './assets/income-wallet-v1.webp'
import {t as trUI,locale} from './i18n'
import otIcon from './assets/ot-icon-hd.webp'
import React, { useState } from 'react'
import { X, Heart, Bell } from 'lucide-react'
import { BrandLogo } from './Welcome'
import { KaoIcon } from './KaoArt'
import reference from './assets/menu-icons-hd.webp'
import homeCat from './assets/home-cat-hd.webp'
import './home.css'

function HomeArtwork({ viewBox, className, label }) {
  return <svg viewBox={viewBox} className={className} role="img" aria-label={trUI(label)}>
    <image href={reference} width="1536" height="1024" />
  </svg>
}

export default function HomePage({ onOpenAdd, onGoCalendar, onGoItems, onGoIncome, onGoKao, onGoFamily, onGoOT, onGoWork, onGoMore, onNotifications, unread=0 }) {
  const [panel, setPanel] = useState(null)
  const menus = [
    { label: 'งาน', crop: '90 70 390 390', action: onGoWork },
    { label: 'รายรับ', icon: 'money', action: onGoIncome },
    { label: 'ค่าใช้จ่าย', crop: '575 70 390 390', action: onGoItems },
    { label: 'OT', icon: 'clock', action: onGoOT },
    { label: 'บ้าน', icon: 'house', action: onGoFamily },
    { label: 'เพิ่มเติม', crop: '1060 550 390 390', action: onGoMore },
  ]
  return <main className="page home-page cat-home">
    <header className="cat-home-heading">
      <button className="home-bell" aria-label={`การแจ้งเตือน${unread?' ยังไม่อ่าน '+unread:''}`} onClick={onNotifications}><Bell size={25}/>{unread>0&&<i>{unread}</i>}</button>
      <h1><BrandLogo /></h1>
      <p>{trUI("ชีวิตง่ายขึ้น")}<br />{trUI("เพราะคุณสำคัญเสมอ")}</p>
    </header>
    <section className="cat-home-artwork">
      <p className="cat-greeting">{trUI("สวัสดีตอนเช้า")}<br />{trUI("วันนี้สู้ไหวนะ? ♡")}</p>
      <img src={homeCat} className="cat-home-hero" width="1536" height="1024" alt={trUI("แมวน้อยนั่งข้างคอมพิวเตอร์และแก้ว Good Day")} />
    </section>
    <section className="cat-home-menu" aria-label={trUI("เมนูหลัก")}>
      {menus.map(menu => <button key={trUI(menu.label)} className="cat-menu-button" onClick={menu.action}>
        {menu.label === 'รายรับ' ? <img src={incomeIcon} className="cat-menu-icon" alt=""/> : menu.label === 'OT' ? <img src={otIcon} className="cat-menu-icon ot-menu-icon" alt="" /> : menu.icon ? <KaoIcon name={menu.icon} /> : <HomeArtwork viewBox={menu.crop} className="cat-menu-icon" label="" />}
        <span>{trUI(menu.label)}</span>
      </button>)}
    </section>
    {panel && <div className="home-dialog-backdrop" onClick={() => setPanel(null)}>
      <section role="dialog" aria-modal="true" aria-label={panel} className="home-dialog" onClick={event => event.stopPropagation()} onKeyDown={event => { if (event.key === 'Escape') setPanel(null) }}>
        <button autoFocus className="home-dialog-close" aria-label={trUI("ปิด")} onClick={() => setPanel(null)}><X size={22} /></button>
        <Heart size={30} color="#ff7897" />
        <h2>{panel}</h2>
        <p>{panel === 'OT' ? trUI("บันทึกเวลาทำงานล่วงเวลา") : panel === 'แมวเก๋า' ? trUI("พักสักนิด แล้วค่อยไปต่อด้วยกันนะ ♡") : trUI("พื้นที่เล็ก ๆ สำหรับเรื่องสำคัญของคุณ")}</p>
        <small>{trUI("หน้าตัวอย่าง · กำลังเตรียมให้ใช้งาน")}</small>
        {panel === 'งาน' && <button className="wide-add-button" onClick={() => { setPanel(null); onOpenAdd() }}>{trUI("เพิ่มรายการใหม่")}</button>}
        {panel === 'เพิ่มเติม' && <button className="wide-add-button" onClick={() => { setPanel(null); onOpenAdd() }}>{trUI("เพิ่มรายการ")}</button>}
      </section>
    </div>}
  </main>
}



