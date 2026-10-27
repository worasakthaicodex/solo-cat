export const expenseCategories=[['food','อาหาร'],['home','บ้าน'],['transport','เดินทาง'],['shopping','ช้อปปิ้ง'],['subscription','สมาชิก'],['debt','หนี้สิน'],['general','อื่น ๆ']]
export function expenseCategory(item){
 if(expenseCategories.some(([key])=>key===item.expenseCategory))return item.expenseCategory
 if(item.type==='subscription')return 'subscription'
 if(['rent','electricity','water','internet'].includes(item.presetId))return 'home'
 return 'general'
}
export function summarizeExpenses(items){
 const rows=items.filter(i=>['expense','subscription'].includes(i.type))
 const cents=i=>Math.round((Number.isFinite(Number(i.amount))?Number(i.amount):0)*100)
 const total=rows.reduce((n,i)=>n+cents(i),0),paid=rows.filter(i=>i.done).reduce((n,i)=>n+cents(i),0)
 return {rows,total:total/100,paid:paid/100,pending:(total-paid)/100,categories:expenseCategories.map(([key,label])=>({key,label,total:rows.filter(i=>expenseCategory(i)===key).reduce((n,i)=>n+cents(i),0)/100,count:rows.filter(i=>expenseCategory(i)===key).length}))}
}
