export function savingsCents(value){
 const text=String(value??'').trim();
 if(!/^\d+(\.\d{1,2})?$/.test(text))throw Error('กรอกจำนวนเงินให้ถูกต้อง ไม่เกิน 2 ตำแหน่ง')
 const cents=Math.round(Number(text)*100)
 if(!Number.isSafeInteger(cents)||cents<0||cents>100000000000)throw Error('จำนวนเงินมากเกินไป')
 return cents
}
export function savingsTotal(entries){return entries.reduce((sum,item)=>sum+(item.kind==='withdrawal'?-1:1)*Math.round(Number(item.amount||0)*100),0)/100}
export function updateSavings(entries,entry,deleteId){
 const next=deleteId?entries.filter(i=>i.id!==deleteId):entries.some(i=>i.id===entry.id)?entries.map(i=>i.id===entry.id?entry:i):[...entries,entry]
 if(savingsTotal(next)<0)throw Error('ยอดเงินเก็บไม่พอสำหรับรายการนี้')
 return next
}
export function retirementEstimate(saved,goal,monthly,today){
 const remaining=Math.max(0,Math.round(Number(goal||0)*100)-Math.round(Number(saved||0)*100))
 if(!(Number(goal)>0))return {status:'unset',remaining:0}
 if(!remaining)return {status:'reached',remaining:0,days:0,date:today,months:0}
 if(!(Number(monthly)>0))return {status:'no-monthly',remaining:remaining/100}
 const months=Math.ceil(remaining/Math.round(Number(monthly)*100))
 if(months>12000)return {status:'distant',remaining:remaining/100}
 const [y,m,d]=today.split('-').map(Number),last=new Date(Date.UTC(y,m-1+months+1,0)).getUTCDate()
 const date=new Date(Date.UTC(y,m-1+months,Math.min(d,last)))
 const days=Math.round((date-new Date(today+'T00:00:00Z'))/86400000)
 return {status:'projected',remaining:remaining/100,months,days,date:date.toISOString().slice(0,10)}
}
