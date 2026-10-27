export function minutes(value){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value||''))throw Error('กรุณาระบุเวลาให้ครบ');return Number(value.slice(0,2))*60+Number(value.slice(3))}
export function attendanceOT({clockIn,clockOut,threshold,nextDay=false}){
 const incoming=minutes(clockIn),out=minutes(clockOut)+(nextDay?1440:0),cutoff=minutes(threshold);
 if(out<=incoming)throw Error('เวลาออกต้องหลังเวลาเข้า หากออกหลังเที่ยงคืนให้เลือกวันถัดไป');
 if(out-incoming>1440)throw Error('ช่วงเข้างานต้องไม่เกิน 24 ชั่วโมง');
 const start=Math.max(incoming,cutoff);if(out<=start)throw Error('ยังไม่มี OT หลังเวลาเริ่มนับที่ตั้งไว้');
 if(out-start>=1440)throw Error('กรุณาแยกบันทึก OT ที่ยาวตั้งแต่ 24 ชั่วโมง');
 const time=n=>String(Math.floor(n/60)%24).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
 return {start:time(start),end:time(out),hours:(out-start)/60};
}
export function interval(entry){const date=new Date(entry.date+'T00:00:00Z').getTime()/60000;if(!Number.isFinite(date))throw Error('วันที่ไม่ถูกต้อง');const start=date+minutes(entry.start);let end=date+minutes(entry.end);if(end<start)end+=1440;return {start,end}}
export function overlaps(candidate,entries){if(candidate.durationHours!=null)return false;const a=interval(candidate);return entries.some(entry=>{if(entry.id===candidate.id||entry.durationHours!=null)return false;const b=interval(entry);return a.start<b.end&&b.start<a.end})}
