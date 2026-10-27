// Exact fixtures shipped by the September 20 prototype. Never match by title
// alone: edited fixtures and all UUID-based user entries must remain intact.
const fixtures=[
 {id:1,type:'expense',title:'จ่ายค่าเน็ต AIS',subtitle:'ครบกำหนดวันนี้',amount:699,due:'2026-09-25',done:false},
 {id:2,type:'car',title:'ต่อประกันรถ',subtitle:'ครบกำหนดวันนี้',due:'2026-09-25',done:false},
 {id:3,type:'health',title:'ออกกำลังกาย',subtitle:'เสร็จแล้ว 07:30',due:'2026-09-25',done:true},
 {id:4,type:'subscription',title:'Netflix',subtitle:'ครบกำหนด 28 ก.ย. 2026',amount:419,due:'2026-09-28',done:false},
 {id:5,type:'expense',title:'ค่าไฟฟ้า',subtitle:'ครบกำหนด 5 ต.ค. 2026',amount:1250,due:'2026-10-05',done:false},
 {id:6,type:'subscription',title:'Spotify',amount:139,due:'2026-10-01',done:false},
 {id:7,type:'expense',title:'ค่าน้ำประปา',amount:280,due:'2026-10-07',done:false},
 ...[
  ['ตอบอีเมลลูกค้า','2026-09-25','09:00','10:00',true],
  ['ประชุมทีมโปรเจกต์','2026-09-25','13:00','14:00',false],
  ['สรุปรายงานประจำสัปดาห์','2026-09-25','16:00','17:00',false],
  ['วางแผนงานเดือนหน้า','2026-09-26','','',false],
  ['เช็กเอกสารภาษี','2026-09-26','','',false],
 ].map(([title,due,time,endTime,done],i)=>({id:100+i,type:'task',title,due,time,endTime,done})),
]
export const legacyDemoArchiveKey='domain:system:legacy-demo-archive'
export function isLegacyDemo(item){
 const fixture=fixtures.find(row=>row.id===item.id)
 return !!fixture&&Object.keys(item).length===Object.keys(fixture).length&&Object.entries(fixture).every(([key,value])=>item[key]===value)
}
export function archiveLegacyDemo(snapshot){
 const itemsRow=snapshot.state.find(row=>row.id==='items'),items=itemsRow?.value
 if(!Array.isArray(items))return snapshot
 const oldArchive=snapshot.state.find(row=>row.id===legacyDemoArchiveKey)?.value||[]
 if(!Array.isArray(oldArchive))throw Error('Cannot safely preserve old sample records')
 const demos=items.filter(item=>isLegacyDemo(item)&&!(snapshot.files||[]).some(file=>file.owner==='item:'+item.id||file.owner?.startsWith('item:'+item.id+'@')))
 const archive=[...oldArchive]
 for(const record of demos)if(!archive.some(entry=>entry.id==='number:'+record.id))archive.push({id:'number:'+record.id,source:'demo-2026-09-20',record})
 const archived=new Map(archive.map(entry=>[entry.record.id,entry.record]))
 const inbox=snapshot.inbox.map(row=>{
  if(!Array.isArray(row.items))return row
  const filtered=row.items.filter(item=>{const old=archived.get(item.id);return !old||item.title!==old.title||item.due!==old.due||item.type!==old.type||item.amount!==old.amount})
  return filtered.length===row.items.length?row:{...row,items:filtered}
 }).filter(row=>!Array.isArray(row.items)||row.items.length>0||!snapshot.inbox.find(old=>old.id===row.id)?.items?.length)
 if(!demos.length&&JSON.stringify(inbox)===JSON.stringify(snapshot.inbox))return snapshot
 const ids=new Set(demos.map(item=>item.id))
 return {...snapshot,inbox,state:[...snapshot.state.filter(row=>row.id!==legacyDemoArchiveKey).map(row=>row.id==='items'?{...row,value:items.filter(item=>!ids.has(item.id))}:row),{id:legacyDemoArchiveKey,value:archive}]}
}
