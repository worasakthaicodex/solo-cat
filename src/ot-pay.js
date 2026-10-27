import {interval} from './ot-time.js'
export const defaultPolicy={basis:'hourly',salary:0,hourly:0,daily:0,daysPerMonth:30,hoursPerDay:8,weekdayMultiplier:1,holidayMultiplier:1,weekdays:[],saturdays:[],holidays:[]};
export function hourlyRate(p){return p.basis==='salary'?Number(p.salary)/Number(p.daysPerMonth)/Number(p.hoursPerDay):p.basis==='daily'?Number(p.daily)/Number(p.hoursPerDay):Number(p.hourly)}
export function holiday(date,p){const d=new Date(date+'T12:00:00Z');return p.holidays.includes(date)||p.weekdays.includes(d.getUTCDay())||(d.getUTCDay()===6&&p.saturdays.includes(Math.ceil(d.getUTCDate()/7)))}
export function calculateOT(entry,policy){
 if(entry.workKind==='job'){const hours=Number(entry.durationHours),amount=Number(entry.fixedAmount);if(!Number.isFinite(hours)||hours<=0||hours>24||!Number.isFinite(amount)||amount<0)throw Error('จำนวนชั่วโมงหรือยอดเงินไม่ถูกต้อง');return {hours,amount:Math.round(amount*100)/100,segments:[{date:entry.date,hours,amount:Math.round(amount*100)/100,multiplier:1,isHoliday:false}]}}
 const p=entry.payPolicy||policy,rate=entry.hourlyPay!=null?Number(entry.hourlyPay):hourlyRate(p);if(!Number.isFinite(rate)||rate<0)throw Error('อัตราค่าจ้างไม่ถูกต้อง');
 const multiplierFor=isHoliday=>{const value=Number(entry.otMultiplier??(isHoliday?p.holidayMultiplier:p.weekdayMultiplier));if(!Number.isFinite(value)||value<0||value>10)throw Error('ตัวคูณ OT ไม่ถูกต้อง');return value};
 const segments=[];
 if(entry.durationHours!=null){const hours=Number(entry.durationHours);if(!Number.isFinite(hours)||hours<=0||hours>24)throw Error('จำนวนชั่วโมง OT ต้องมากกว่า 0 และไม่เกิน 24');const isHoliday=holiday(entry.date,p),multiplier=multiplierFor(isHoliday);segments.push({date:entry.date,hours,isHoliday,multiplier,amount:hours*rate*multiplier})}
 else{const span=interval(entry);let cursor=span.start;while(cursor<span.end){const stop=Math.min(span.end,(Math.floor(cursor/1440)+1)*1440),date=new Date(cursor*60000).toISOString().slice(0,10),isHoliday=holiday(date,p),multiplier=multiplierFor(isHoliday),hours=(stop-cursor)/60;segments.push({date,hours,isHoliday,multiplier,amount:hours*rate*multiplier});cursor=stop}}
 return {hours:segments.reduce((n,s)=>n+s.hours,0),amount:Math.round(segments.reduce((n,s)=>n+s.amount,0)*100)/100,segments}
}
const iso=d=>d.toISOString().slice(0,10);
function dayInMonth(year,month,day){return new Date(Date.UTC(year,month,Math.min(day,new Date(Date.UTC(year,month+1,0)).getUTCDate()),12))}
export function payrollPeriod(month,policy){const [year,m]=month.split('-').map(Number),cutoff=Number(policy.cutoffDay??31),payDay=Number(policy.payDay??28),offset=Number(policy.payMonthOffset??1);if(![cutoff,payDay].every(n=>Number.isInteger(n)&&n>=1&&n<=31)||![0,1,2].includes(offset))throw Error('รอบจ่ายไม่ถูกต้อง');const end=dayInMonth(year,m-1,cutoff),start=dayInMonth(year,m-2,cutoff);start.setUTCDate(start.getUTCDate()+1);const payment=dayInMonth(year,m-1+offset,payDay);return {from:iso(start),to:iso(end),payDate:iso(payment)}}
export function payrollTotal(entries,policy,period){let hours=0,amount=0;for(const entry of entries){if(entry.workKind==='job')continue;for(const segment of calculateOT(entry,policy).segments){if(segment.date>=period.from&&segment.date<=period.to){hours+=segment.hours;amount+=segment.amount}}}return {hours,amount:Math.round(amount*100)/100}}

export function payrollRounds(policy){const end=Number(policy.cutoffDay??31)>1?Number(policy.cutoffDay??31):31;return policy.payrollRounds??[{cutoffDay:Math.min(15,end-1,27),payDay:15,payMonthOffset:0},{cutoffDay:end,payDay:policy.payDay??28,payMonthOffset:policy.payMonthOffset??1}]}
export function validatePayrollPolicy(policy){
 if(policy.payCycle!=='semimonthly')return;
 const rounds=payrollRounds(policy);if(rounds.length!==2)throw Error('ต้องมีรอบจ่าย 2 ชุด');
 const [first,second]=rounds.map(r=>Number(r.cutoffDay));
 if(!Number.isInteger(first)||first<1||first>27||!Number.isInteger(second)||second<=first||second>31)throw Error('วันตัดรอบแรกต้องเป็นวันที่ 1–27 และรอบสองต้องอยู่หลังรอบแรก');
 for(const r of rounds){if(!Number.isInteger(Number(r.payDay))||r.payDay<1||r.payDay>31||![0,1,2].includes(Number(r.payMonthOffset)))throw Error('รอบจ่ายไม่ถูกต้อง');if(Number(r.payMonthOffset)===0&&Number(r.payDay)<Number(r.cutoffDay))throw Error('วันเงินออกต้องไม่ก่อนวันตัดยอด กรุณาเลือกเดือนที่จ่ายให้ถูกต้อง')}
}
export function payrollPeriods(month,policy){
 if(policy.payCycle!=='semimonthly')return [payrollPeriod(month,policy)];
 validatePayrollPolicy(policy);const rounds=payrollRounds(policy),[year,m]=month.split('-').map(Number);
 return rounds.map((round,i)=>{const end=dayInMonth(year,m-1,Number(round.cutoffDay)),start=i===0?dayInMonth(year,m-2,Number(rounds[1].cutoffDay)):dayInMonth(year,m-1,Number(rounds[0].cutoffDay));start.setUTCDate(start.getUTCDate()+1);return {from:iso(start),to:iso(end),payDate:iso(dayInMonth(year,m-1+Number(round.payMonthOffset),Number(round.payDay)))}})
}
