(function(root){
 const parse=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))throw Error('Invalid date');const d=new Date(s+'T12:00:00Z');if(d.toISOString().slice(0,10)!==s)throw Error('Invalid date');return d};
 const iso=d=>d.toISOString().slice(0,10);
 const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
 const shift=(s,n)=>{const d=parse(s);d.setUTCDate(d.getUTCDate()+n);return iso(d)};
 function expandOne(item,from,to){
  parse(from);parse(to);if(from>to)return [];if(!item.due)return [];parse(item.due);
  const frequency=item.repeat||'none';if(frequency==='none')return item.due>=from&&item.due<=to?[item]:[];
  const dates=[],start=parse(item.due),limit=item.repeatUntil&&item.repeatUntil<to?item.repeatUntil:to;
  const add=day=>{if(day>=item.due&&day>=from&&day<=limit){const override=item.occurrences?.[day];if(!override?.deleted)dates.push({...item,...override,id:String(item.id)+'@'+day,seriesId:item.id,occurrenceDate:day,due:override?.due||day,done:override?.done??(day===item.due?!!item.done:false)})}};
  if(frequency==='daily'||frequency==='weekly'){
   const step=frequency==='daily'?1:7;const offset=Math.max(0,Math.ceil((parse(from)-start)/86400000/step))*step;
   for(let d=shift(item.due,offset);d<=limit;d=shift(d,step))add(d);
  }else if(frequency==='monthly'||frequency==='yearly'){
   const first=parse(from),end=parse(limit),anchor=Number(item.monthDay)||start.getUTCDate();
   for(let y=first.getUTCFullYear();y<=end.getUTCFullYear();y++)for(let m=0;m<12;m++){
    if(frequency==='yearly'&&m!==start.getUTCMonth())continue;
    const last=new Date(Date.UTC(y,m+1,0,12)).getUTCDate();if(anchor>last&&item.shortMonth==='skip')continue;
    add(iso(new Date(Date.UTC(y,m,Math.min(anchor,last),12))));
   }
  }
  for(const [day,override] of Object.entries(item.occurrences||{})){
   if(override.due&&override.due>=from&&override.due<=to&&!override.deleted&&!dates.some(i=>i.occurrenceDate===day)){
    const original=expandOne({...item,occurrences:{}},day,day)[0];
    if(original)dates.push({...original,...override,id:original.id,seriesId:item.id,occurrenceDate:day});
   }
  }
  return dates.filter(i=>i.due>=from&&i.due<=to);
 }
 function debtInfo(master){
  if(master.expenseCategory!=='debt'||!(Number(master.debtInitial)>0))return null;
  const initial=Math.round(Number(master.debtInitial)*100);let paid=0;
  const records=master.repeat&&master.repeat!=='none'?new Set([master.due,...Object.keys(master.occurrences||{})]):new Set([master.due]);
  for(const day of records){const row=master.repeat&&master.repeat!=='none'?master.occurrences?.[day]||{}:{};if(row.deleted)continue;if(row.done??(day===master.due&&master.done))paid+=Math.round(Number(row.principalAmount??master.principalAmount??0)*100)}
  return {initial:initial/100,paid:paid/100,remaining:Math.max(0,initial-paid)/100,overpaid:paid>initial};
 }
 function debtRows(master,rows){const debt=debtInfo(master);if(!debt)return rows;return rows.filter(row=>row.done||debt.remaining>0).map(row=>{if(row.done)return row;const principal=Math.min(Number(row.principalAmount||0),debt.remaining);return {...row,principalAmount:principal,amount:(Math.round(principal*100)+Math.round(Number(row.interestAmount||0)*100))/100}})}
 const expand=(items,from,to)=>items.flatMap(i=>debtRows(i,expandOne(i,from,to))).sort((a,b)=>a.due.localeCompare(b.due)||String(a.id).localeCompare(String(b.id)));
 function apply(items,before,after){
  const previous=new Map(before.map(i=>[String(i.id),i])),next=new Map(after.map(i=>[String(i.id),i]));let result=items.map(i=>({...i}));
  for(const [id,old] of previous){const updated=next.get(id);if(JSON.stringify(old)===JSON.stringify(updated))continue;
   if(old.seriesId!==undefined){result=result.map(master=>{if(master.id!==old.seriesId)return master;const override=updated?Object.fromEntries(['done','title','amount','expenseCategory','principalAmount','interestAmount','time','endTime','due','note'].filter(k=>updated[k]!==old[k]||(updated.done&&!old.done)).map(k=>[k,updated[k]])):{deleted:true};return {...master,occurrences:{...master.occurrences,[old.occurrenceDate]:{...master.occurrences?.[old.occurrenceDate],...override}}}})}
   else result=updated?result.map(i=>String(i.id)===id?updated:i):result.filter(i=>String(i.id)!==id);
  }
  for(const [id,item]of next)if(!previous.has(id))result.push(item);
  for(const item of result)if(debtInfo(item)?.overpaid)throw Error('ยอดเงินต้นที่จ่ายแล้วเกินเงินต้นตั้งต้น');
  return result;
 }
 // Freeze paid history before changing a recurring bill's default values.
 function editSeries(master,patch){
  const occurrences={...master.occurrences};
  const days=new Set(Object.keys(occurrences));if(master.done)days.add(master.due);
  for(const day of days){
   const override=occurrences[day]||{};
   if(override.deleted||!(override.done??(day===master.due&&master.done)))continue;
   const snapshot={};for(const key of ['title','amount','expenseCategory','principalAmount','interestAmount','note','time','endTime'])snapshot[key]=Object.prototype.hasOwnProperty.call(override,key)?override[key]:master[key];
   snapshot.expenseCategory??='general';snapshot.principalAmount??=null;snapshot.interestAmount??=null;
   occurrences[day]={...snapshot,...override};
  }
  const result={...master,...patch,occurrences};if(debtInfo(result)?.overpaid)throw Error('ยอดเงินต้นที่จ่ายแล้วเกินเงินต้นตั้งต้น');return result;
 }
 function validateSchedule(item){
  parse(item.due);
  if(!['none','daily','weekly','monthly','yearly'].includes(item.repeat||'none'))throw Error('ความถี่ไม่ถูกต้อง');
  if(!item.repeat||item.repeat==='none')return;
  if(item.repeatUntil){parse(item.repeatUntil);if(item.repeatUntil<item.due)throw Error('วันสิ้นสุดต้องไม่ก่อนวันเริ่ม');}
  if(['monthly','yearly'].includes(item.repeat)&&(!Number.isInteger(Number(item.monthDay))||Number(item.monthDay)<1||Number(item.monthDay)>31))throw Error('วันที่ของรอบต้องอยู่ระหว่าง 1 ถึง 31');
  if(!expandOne({...item,occurrences:{},done:false},item.due,shift(item.due,1461)).length)throw Error('ไม่มีรอบรายการในช่วงที่เลือก กรุณาเปลี่ยนวันเริ่ม วันสิ้นสุด หรือวันที่ของรอบ');
 }
 function stopAfter(master,day){
  parse(day);if(day<master.due)throw Error('วันสิ้นสุดต้องไม่ก่อนวันเริ่ม');
  if(Object.entries(master.occurrences||{}).some(([date,row])=>date>day&&row.done&&!row.deleted))throw Error('มีรอบถัดไปที่จ่ายแล้ว กรุณาเลือกรอบสุดท้ายที่จ่ายไว้ก่อนหยุดรายการประจำ');
  return {...master,repeatUntil:master.repeatUntil&&master.repeatUntil<day?master.repeatUntil:day};
 }
 root.SoloRecurrence={expand,apply,today,shift,editSeries,validateSchedule,stopAfter,debtInfo};
 if(typeof module!=='undefined')module.exports=root.SoloRecurrence;
})(globalThis);
