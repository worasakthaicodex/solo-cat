import React,{useState} from 'react'
import {ArrowLeft,ChevronLeft,ChevronRight,PiggyBank,Wallet,TrendingUp,TrendingDown} from 'lucide-react'
import {useStoredState} from './persistent-state'
import {financeMonth} from './finance-summary'
import {savingsTotal} from './savings'
import {t,locale} from './i18n'
const money=n=>new Intl.NumberFormat(locale(),{maximumFractionDigits:2}).format(n)
export default function FinanceSummary({items,onBack,onGo}){
 const [cursor,setCursor]=useState(new Date()),[incomes]=useStoredState('expense:income',[]),[savings]=useStoredState('savings:entries',[])
 const month=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`,{carryover,income,expenses,balance,available}=financeMonth(items,incomes,month)
 const cards=[['เงินเก็บปัจจุบัน',savingsTotal(savings),PiggyBank,'savings'],['เงินคงเหลือเดือนนี้',balance,Wallet,'items'],['รายรับเดือนนี้',income,TrendingUp,'income'],['จ่ายแล้ว',expenses.paid,TrendingDown,'items']]
 return <main className="planner-page finance-summary"><header className="expense-overview-header"><button aria-label={t('ย้อนกลับ')} onClick={onBack}><ArrowLeft/></button><h1>{t('สรุปการเงิน')}</h1><span/></header><div className="expense-months"><button aria-label={t('เดือนก่อนหน้า')} onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()-1,1))}><ChevronLeft/></button><strong>{new Intl.DateTimeFormat(locale(),{month:'long',year:'numeric',calendar:'gregory'}).format(cursor)}</strong><button aria-label={t('เดือนถัดไป')} onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()+1,1))}><ChevronRight/></button></div><section className="finance-grid">{cards.map(([label,value,Icon,page])=><button key={label} onClick={()=>onGo(page)}><Icon/><span>{t(label)}</span><strong>฿{money(value)}</strong></button>)}</section><section className="expense-summary-card"><p>{t('ยอดยกมาจากเดือนก่อน')} <b data-testid="finance-carryover">฿{money(carryover)}</b></p><p>{t('รวมค่าใช้จ่ายเดือนนี้')} <b>฿{money(expenses.total)}</b></p><p>{t('รอจ่าย')} <b>฿{money(expenses.pending)}</b></p><p>{t('เหลือหลังหักรอจ่าย')} <b>฿{money(available)}</b></p></section><p className="expense-summary-note">{t('เงินคงเหลือ = ยอดยกมา + รายรับเดือนนี้ − รายจ่ายที่จ่ายแล้ว ไม่รวมการโอนเงินเก็บ')}</p><p className="expense-summary-note">{t('เงินเก็บแสดงยอดปัจจุบันทุกเดือน แยกจากเงินคงเหลือ')}</p></main>
}
