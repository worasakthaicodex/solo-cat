import Projects from './Projects'
import {projectProgress} from './project-progress'
import {useStoredState} from './persistent-state'
import {t as trUI,locale} from './i18n'
import useLocalDay from './useLocalDay'
import React,{useState} from 'react'
import {ArrowLeft,ChevronRight,CalendarDays,Clock,Wallet,Repeat2,Wifi,Car,Check,Plus,X,ListTodo,FolderHeart} from 'lucide-react'
import {CatSticker} from './KaoArt'
import './work.css'
import workRest from './assets/work-rest-reference.webp'

export default function Work({items:masters,setItems:updateMasters,onExit,onCalendar,onExpenses,onAdd,onAll,initialView='tasks'}){
 const [view,setView]=useState(initialView),[projects,setProjects]=useStoredState('work:projects',[])
 const today=useLocalDay(),through=SoloRecurrence.shift(today,3);
 const items=SoloRecurrence.expand(masters,today,through);
 const setItems=fn=>updateMasters(current=>{const before=SoloRecurrence.expand(current,today,through);return SoloRecurrence.apply(current,before,fn(before))});
 const [all,setAll]=useState(false),[nearOnly,setNearOnly]=useState(false),[detail,setDetail]=useState(null)
 const daily=items.filter(i=>i.due===today),pending=daily.filter(i=>!i.done),near=items.filter(i=>!i.done&&i.due>today&&i.due<=through),visible=nearOnly?near:all?items:daily
 function complete(item){setItems(a=>a.map(i=>i.id===item.id?{...i,done:!i.done}:i));setDetail(null)}
 if(view==='projects')return <Projects projects={projects} setProjects={setProjects} onBack={()=>setView('tasks')}/>
 return <main className="work-page"><header className="work-header"><button aria-label={trUI("กลับหน้าแรก")} onClick={onExit}><ArrowLeft/></button><h1>{trUI("งานของฉัน")}</h1><button aria-label={trUI("เพิ่มงาน")} onClick={onAdd}><Plus/></button></header><button className="work-date" onClick={onCalendar}><Clock size={17}/><strong>{new Intl.DateTimeFormat(locale(),{weekday:'long',day:'numeric',month:'short',year:'numeric'}).format(new Date(today+'T12:00:00'))}</strong><ChevronRight size={20}/></button><section className="work-banner"><p>{trUI("ค่อย ๆ ไปนะ")}<br/>{trUI("ทุกอย่างจะดีขึ้นเสมอ")}<br/>{trUI("สู้ ๆ นะ! ♡")}</p><img className="work-reference-cat" src={workRest} alt={trUI("แมวนอนพักบนเบาะสีชมพู")}/></section><section className="work-stats"><button onClick={()=>{setAll(false);setNearOnly(false)}}><CalendarDays/><span><b>{pending.length}</b>{trUI("รายการวันนี้")}</span></button><button onClick={()=>{setNearOnly(true);setAll(false)}}><Clock/><span><b>{near.length}</b>{trUI("ใกล้ครบกำหนด")}</span></button><button onClick={()=>setView('projects')}><FolderHeart/><span><b>{projects.filter(p=>projectProgress(p).progress<100).length}</b>{trUI("โครงการ")}</span></button><button onClick={onExpenses}><Wallet/><span><b>{items.filter(i=>!i.done&&['expense','subscription'].includes(i.type)).length}</b>{trUI("ค่าใช้จ่ายรอจ่าย")}</span></button></section><div className="work-section"><h2>{nearOnly?trUI("ใกล้ครบกำหนด"):all?trUI("รายการทั้งหมด"):trUI("สิ่งที่ต้องทำวันนี้")}</h2><button onClick={onAll}>{all?trUI("ดูวันนี้"):trUI("ดูทั้งหมด")}<ChevronRight size={17}/></button></div><section className="work-list">{visible.map(i=>{const Icon=i.type==='expense'?Wifi:i.type==='car'?Car:i.done?Check:ListTodo;return <article className={i.done?'done':''} key={i.id}><button className="work-item-main" onClick={()=>setDetail(i)}><span className={'work-icon '+i.type}><Icon/></span><span><strong>{i.title}</strong><small>{i.done?trUI("เสร็จแล้ว เก่งมาก!"):i.due===today?<>{trUI("ครบกำหนด")}<span>{trUI("วันนี้")}</span></>:`ครบกำหนด ${i.due}`}</small></span></button>{i.done?<button className="work-done-cat" aria-label={'ดูรายละเอียด '+i.title} onClick={()=>setDetail(i)}><CatSticker pose="cheer"/></button>:<button className={'work-action '+(i.amount?'pay':'')} onClick={()=>setDetail(i)}>{i.amount?trUI("จ่ายเลย"):trUI("ดูรายละเอียด")}</button>}</article>})}{!visible.length&&<p className="work-empty">{trUI("ไม่มีรายการแล้ว พักได้เลยนะ ♡")}</p>}</section><button className="work-add" onClick={onAdd}><Plus size={20}/>{trUI("เพิ่มงานใหม่")}</button>{detail&&<div className="work-overlay" onClick={()=>setDetail(null)}><section role="dialog" aria-modal="true" aria-label={trUI("รายละเอียดงาน")} className="work-dialog" onClick={e=>e.stopPropagation()}><button className="work-close" aria-label={trUI("ปิด")} onClick={()=>setDetail(null)}><X/></button><CatSticker pose="sit"/><h2>{detail.title}</h2><p>{trUI("วันที่")}{detail.due}</p>{detail.amount&&<h2>{trUI("฿")}{new Intl.NumberFormat(locale()).format(detail.amount)}</h2>}<button className="work-add" onClick={()=>complete(detail)}>{detail.done?trUI("เปลี่ยนเป็นยังไม่เสร็จ"):detail.amount?trUI("ทำเครื่องหมายว่าจ่ายแล้ว"):trUI("ทำเครื่องหมายว่าเสร็จแล้ว")}</button>{detail.amount&&<small>{trUI("บันทึกสถานะการจ่ายของคุณ ไม่ได้โอนเงินผ่านแอป")}</small>}</section></div>}</main>
}



