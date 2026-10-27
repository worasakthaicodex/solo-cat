import React,{useState} from 'react'
import {ArrowLeft,ChevronLeft,ChevronRight,Plus,Utensils,House,Car,ShoppingBag,Crown,Landmark,Wallet} from 'lucide-react'
import {t,locale} from './i18n'
import {useStoredState} from './persistent-state'
import {summarizeExpenses,expenseCategory} from './expense-summary'
import './expense-overview.css'
const icons={food:Utensils,home:House,transport:Car,shopping:ShoppingBag,subscription:Crown,debt:Landmark,general:Wallet}
const money=n=>new Intl.NumberFormat(locale(),{maximumFractionDigits:2}).format(n)
export default function ExpenseOverview({items,cursor,setCursor,onBack,onAll,onAdd,onOpen,onIncome,familyPerson,familyPersonName=familyPerson}){
 const summary=summarizeExpenses(items),month=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`
 const [budgets,setBudgets]=useStoredState('expense:monthly-budgets',{}),[editBudget,setEditBudget]=useState(false),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const budgetKey=familyPerson?`${month}:${familyPerson}`:month,budget=Number(budgets[budgetKey]||0),remaining=budget-summary.total,percent=budget>0?Math.round(summary.total/budget*100):0
 const months=[-1,0,1].map(offset=>new Date(cursor.getFullYear(),cursor.getMonth()+offset,1))
 const recent=[...summary.rows].sort((a,b)=>b.due.localeCompare(a.due)||String(b.id).localeCompare(String(a.id))).slice(0,5)
 return <section className="expense-overview"><header className="expense-overview-header"><button aria-label={t('กลับหน้าแรก')} onClick={onBack}><ArrowLeft/></button><h1>{t('ค่าใช้จ่าย')}{familyPerson&&<small>{familyPersonName}</small>}</h1><span/></header>
 <div className="expense-months"><button aria-label={t('เดือนก่อนหน้า')} onClick={()=>setCursor(months[0])}><ChevronLeft size={18}/></button>{months.map((d,i)=><button key={d.toISOString()} className={i===1?'active':''} onClick={()=>setCursor(d)}>{new Intl.DateTimeFormat(locale(),{month:'short',year:'2-digit',calendar:'gregory'}).format(d)}</button>)}<button aria-label={t('เดือนถัดไป')} onClick={()=>setCursor(months[2])}><ChevronRight size={18}/></button></div>
 <section className="expense-summary-card" aria-label={t('สรุปค่าใช้จ่าย')}><div className="expense-summary-top"><div><p>{t('รวมค่าใช้จ่ายเดือนนี้')}</p><strong data-testid="expense-total">฿{money(summary.total)}</strong></div><button className="expense-budget" onClick={()=>{setDraft(budget?String(budget):'');setEditBudget(v=>!v);setError('')}}>{budget?t(remaining<0?'เกินงบ':'เหลืองบ'):t('ตั้งงบเดือนนี้')}{budget>0&&<b>฿{money(Math.abs(remaining))}</b>}</button></div>
 {budget>0&&<><div className="expense-progress" role="progressbar" aria-label={t('สัดส่วนงบที่ใช้')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100,percent)}><i style={{width:Math.min(100,percent)+'%'}}/></div><small>{percent}% · {t('งบประมาณ')} ฿{money(budget)}</small></>}
 <div className="expense-summary-status"><span>{t('จ่ายแล้ว')} <b>฿{money(summary.paid)}</b></span><span>{t('รอจ่าย')} <b>฿{money(summary.pending)}</b></span></div>
 {editBudget&&<form className="expense-budget-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const ok=await setBudgets(old=>({...old,[budgetKey]:draft===''?null:Number(draft)}));if(ok===false)throw Error();setEditBudget(false)}catch{setError(t('บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'))}finally{setBusy(false)}}}><label>{t('งบประมาณ (บาท)')}<input type="number" min="0.01" step="0.01" value={draft} onChange={e=>setDraft(e.target.value)} placeholder={t('เว้นว่างเพื่อล้างงบ')}/></label><button disabled={busy}>{t('บันทึก')}</button><button type="button" onClick={()=>setEditBudget(false)}>{t('ยกเลิก')}</button>{error&&<p role="alert">{error}</p>}</form>}
 </section>
 <section className="expense-category-grid" aria-label={t('ค่าใช้จ่ายตามหมวด')}>{summary.categories.map(c=>{const Icon=icons[c.key];return <div className="expense-category-summary" key={c.key}><span className={'expense-category-icon '+c.key}><Icon size={22}/></span><span>{t(c.label)}</span><b>฿{money(c.total)}</b></div>})}</section>
 <header className="expense-recent-heading"><h2>{t('รายการล่าสุด')}</h2><button onClick={()=>onAll(null)}>{t('ดูทั้งหมด')}<ChevronRight size={16}/></button></header><p className="expense-summary-note">{t('รวมรายการที่จ่ายแล้วและรอจ่าย ตามวันที่ของรายการ')}</p>
 <section className="expense-recent-list">{recent.map(item=>{const key=expenseCategory(item),Icon=icons[key];return <button className="expense-recent-row" key={item.id} onClick={()=>onOpen(item)}><span className={'expense-category-icon '+key}><Icon size={21}/></span><span><strong>{item.title}</strong><small>{new Intl.DateTimeFormat(locale(),{day:'numeric',month:'short',year:'numeric',calendar:'gregory'}).format(new Date(item.due+'T12:00:00'))} · {t(item.done?'จ่ายแล้ว':'รอจ่าย')}</small></span><b>฿{money(item.amount||0)}</b></button>})}{!recent.length&&<p className="expense-overview-empty">{t('เดือนนี้ยังไม่มีค่าใช้จ่าย')}</p>}</section><button className="planner-add expense-overview-add" onClick={onAdd}><Plus/>{t('เพิ่มรายการค่าใช้จ่าย')}</button></section>
}

