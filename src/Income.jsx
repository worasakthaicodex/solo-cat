import React,{useState} from 'react'
import {ArrowLeft,ChevronLeft,ChevronRight} from 'lucide-react'
import ExpenseIncome from './ExpenseIncome'
import {t,locale} from './i18n'
import './planner.css'
import './expense-overview.css'
export default function Income({onBack,initialMonth,familyPerson,familyPersonName}){
 const [cursor,setCursor]=useState(initialMonth||new Date()),month=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`
 const months=[-1,0,1].map(n=>new Date(cursor.getFullYear(),cursor.getMonth()+n,1))
 return <main className="planner-page income-page"><header className="expense-overview-header"><button aria-label={t('ย้อนกลับ')} onClick={onBack}><ArrowLeft/></button><h1>{t('รายรับ')}{familyPersonName&&<small>{familyPersonName}</small>}</h1><span/></header><div className="expense-months"><button aria-label={t('เดือนก่อนหน้า')} onClick={()=>setCursor(months[0])}><ChevronLeft size={18}/></button>{months.map((d,i)=><button key={d.toISOString()} className={i===1?'active':''} onClick={()=>setCursor(d)}>{new Intl.DateTimeFormat(locale(),{month:'short',year:'2-digit',calendar:'gregory'}).format(d)}</button>)}<button aria-label={t('เดือนถัดไป')} onClick={()=>setCursor(months[2])}><ChevronRight size={18}/></button></div><ExpenseIncome ledger month={month} familyPerson={familyPerson} onDateSaved={date=>setCursor(new Date(date+'T12:00:00'))}/></main>
}
