import React,{useEffect,useRef,useState} from 'react'

export const number=value=>Number(value||0).toLocaleString('th-TH')
export const reportDate=value=>value?new Date(value+'T12:00:00').toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'}):'—'
export function Metrics({items,unit='เบราว์เซอร์',className=''}){
 return <div className={'owner-metrics '+className}>{items.map(([label,value,hint])=><article className="owner-metric" key={label}><h3>{label}</h3><div><strong>{number(value)}</strong><span>{unit}</span></div>{hint&&<small>{hint}</small>}</article>)}</div>
}
const series=[['visitors','เข้าเว็บ','#c64276'],['returning','กลับมาใช้ซ้ำ','#2d8279'],['firstItems','สร้างรายการแรก','#927046'],['signups','สมัครใหม่','#6b61b8']]
export function GuestTrend({rows}){
 const [metric,setMetric]=useState('visitors'),[point,setPoint]=useState(null)
 const plot=useRef(null),[width,setWidth]=useState(1000)
 useEffect(()=>{const element=plot.current;if(!element)return;const observer=new ResizeObserver(([entry])=>setWidth(Math.max(250,Math.round(entry.contentRect.width))));observer.observe(element);return()=>observer.disconnect()},[])
 const ordered=[...rows].reverse(),selected=series.find(s=>s[0]===metric),max=Math.max(1,...ordered.map(r=>r[metric]||0)),top=Math.max(2,Math.ceil(max/4)*4)
 const x=i=>ordered.length<=1?width/2:42+i*(width-62)/(ordered.length-1),y=value=>195-160*value/top
 const selectedPoint=ordered.find(row=>row.date===point),shown=selectedPoint||ordered.at(-1)
 return <section className="owner-panel owner-trend"><div className="owner-panel-heading"><div><h3>แนวโน้มการใช้งาน Guest</h3><p>แต่ละวันนับเบราว์เซอร์เดิมครั้งเดียว</p></div>{shown&&<div className="owner-chart-value"><strong>{number(shown[metric])}</strong><span>{selected[1]} · {reportDate(shown.date)}</span></div>}</div>
  <div className="owner-chart-series" aria-label="ตัวเลขในกราฟ">{series.map(([key,label,color])=><button key={key} aria-pressed={metric===key} onClick={()=>{setMetric(key);setPoint(null)}}><i style={{background:color}}/>{label}</button>)}</div>
  <div ref={plot}>{ordered.length?<svg viewBox={`0 0 ${width} 235`} role="img" aria-label={'กราฟ'+selected[1]+' รายวัน ดูตัวเลขทั้งหมดในตารางด้านล่าง'}>
   {[0,1,2,3,4].map(i=><g key={i}><line x1="42" x2={width-20} y1={y(i*top/4)} y2={y(i*top/4)} stroke="#ece5e8" strokeDasharray="4 5"/><text x="30" y={y(i*top/4)+4} textAnchor="end">{number(i*top/4)}</text></g>)}
   <polyline points={ordered.map((r,i)=>x(i)+','+y(r[metric]||0)).join(' ')} fill="none" stroke={selected[2]} strokeWidth="3" strokeLinejoin="round"/>
   {ordered.map((row,i)=><circle key={row.date} cx={x(i)} cy={y(row[metric]||0)} r={point===row.date?6:ordered.length>30?2:3} fill={selected[2]} tabIndex="0" aria-label={`${reportDate(row.date)} ${selected[1]} ${number(row[metric])}`} onMouseEnter={()=>setPoint(row.date)} onFocus={()=>setPoint(row.date)}><title>{reportDate(row.date)} · {number(row[metric])}</title></circle>)}
   {[...new Set([0,Math.floor((ordered.length-1)/2),ordered.length-1])].map(i=><text key={i} x={x(i)} y="225" textAnchor="middle">{ordered[i].date.slice(5).split('-').reverse().join('/')}</text>)}
  </svg>:<p className="owner-status">ยังไม่มีข้อมูลในช่วงนี้</p>}</div>
 </section>
}
