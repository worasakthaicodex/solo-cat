import {summarizeExpenses} from './expense-summary.js'
const cents=value=>Math.round((Number(value)||0)*100)
// Derive carryover from the ledger, never create synthetic income entries.
// Editing a historical payment therefore updates every subsequent month.
export function financeMonth(items,incomes,month,recurrence=globalThis.SoloRecurrence){
 const from=month+'-01',end=new Date(from+'T12:00:00Z');end.setUTCMonth(end.getUTCMonth()+1,0);const to=end.toISOString().slice(0,10)
 const dates=items.flatMap(i=>[i.due,...Object.values(i.occurrences||{}).map(o=>o.due)]).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&d<from)
 const first=dates.sort()[0],past=first?recurrence.expand(items,first,recurrence.shift(from,-1)):[]
 const priorIncome=incomes.filter(i=>i.date<from).reduce((n,i)=>n+cents(i.amount),0)
 const priorPaid=summarizeExpenses(past).paid,carryover=(priorIncome-cents(priorPaid))/100
 const income=incomes.filter(i=>i.date?.slice(0,7)===month).reduce((n,i)=>n+cents(i.amount),0)/100
 const expenses=summarizeExpenses(recurrence.expand(items,from,to)),balance=(cents(carryover)+cents(income)-cents(expenses.paid))/100
 return {carryover,income,expenses,balance,available:(cents(balance)-cents(expenses.pending))/100}
}
