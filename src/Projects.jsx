import React,{useRef,useState} from 'react'
import {ArrowLeft,Plus,ChevronRight,CalendarDays,Check,Pencil,Trash2,FolderHeart,Flag,Heart,Layers} from 'lucide-react'
import {t,locale} from './i18n'
import {projectProgress,phaseProgress,validateProject,asPhasedProject} from './project-progress'
import restCat from './assets/work-rest-reference.webp'
import {CatSticker} from './KaoArt'
import './projects.css'

const uid=()=>crypto.randomUUID()
const percent=value=>new Intl.NumberFormat(locale(),{maximumFractionDigits:6}).format(value)
const dateLabel=date=>date?new Intl.DateTimeFormat(locale(),{day:'numeric',month:'short',year:'numeric',calendar:'gregory'}).format(new Date(date+'T12:00:00')):''
function Progress({value,phase=false,large=false}){return <div className={'project-progress'+(large?' large':'')} role="progressbar" aria-label={t(phase?'ความคืบหน้าเฟส':'ความคืบหน้าโครงการ')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><i style={{width:value+'%'}}/></div>}
function Header({title,onBack,action}){return <header className="project-header"><button aria-label={t('ย้อนกลับ')} onClick={onBack}><ArrowLeft/></button><h1>{title}</h1>{action||<span/>}</header>}
function Empty({children}){return <div className="project-empty-small"><CatSticker pose="peek"/><p>{children}</p></div>}

export default function Projects({projects,setProjects,onBack}){
 const [selected,setSelected]=useState(null),[phaseId,setPhaseId]=useState(null),[form,setForm]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[filter,setFilter]=useState('active'),[confirmDelete,setConfirmDelete]=useState(false)
 const saving=useRef(false),all=projects.map(asPhasedProject)
 const project=all.find(p=>p.id===selected),phase=project?.phases.find(p=>p.id===phaseId),stats=project&&projectProgress(project)
 function openForm(kind,value){setError('');setConfirmDelete(false);setForm({kind,value:{...value}})}
 function changeForm(patch){setError('');setConfirmDelete(false);setForm(current=>({...current,value:{...current.value,...patch}}))}
 function back(){if(busy)return;setError('');setConfirmDelete(false);if(form)setForm(null);else if(phaseId)setPhaseId(null);else setSelected(null)}
 async function commit(change,after){
  if(saving.current)return
  saving.current=true;setBusy(true);setError('')
  try{if(await setProjects(change)===false)throw Error(t('บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'));after?.()}
  catch(e){setError(e.message)}finally{saving.current=false;setBusy(false)}
 }
 function updateProject(change,after){commit(rows=>{if(!rows.some(p=>p.id===selected))throw Error(t('ไม่พบโครงการนี้'));return rows.map(row=>{if(row.id!==selected)return row;const next=change(asPhasedProject(row)),problem=validateProject(next);if(problem)throw Error(t(problem));return next})},after)}
 function updatePhase(change,after){updateProject(current=>{if(!current.phases.some(p=>p.id===phaseId))throw Error(t('ไม่พบเฟสนี้'));return {...current,phases:current.phases.map(p=>p.id===phaseId?change(p):p)}},after)}
 function create(){openForm('project',{id:uid(),title:'',note:'',due:'',phases:[]})}
 const errorView=error&&<p className="project-error" role="alert">{t(error)}</p>

 if(form?.kind==='project'){
  const draft=form.value,existing=all.some(p=>p.id===draft.id)
  return <section className="projects-page"><Header title={t(existing?'แก้ไขโครงการ':'สร้างโครงการ')} onBack={back}/>
   <div className="project-form-intro"><span><FolderHeart/><strong>{t('เรื่องใหญ่ เริ่มจากก้าวเล็ก ๆ')}</strong><small>{t('สร้างโครงการ → แบ่งเฟส → ลงงานย่อย')}</small></span><CatSticker pose="peek"/></div>
   <form onSubmit={e=>{e.preventDefault();const fields={title:draft.title.trim(),note:draft.note.trim(),due:draft.due};const problem=validateProject({...draft,...fields});if(problem){setError(problem);return}if(existing)updateProject(current=>({...current,...fields}),()=>setForm(null));else commit(rows=>[{...draft,...fields},...rows],()=>{setSelected(draft.id);setPhaseId(null);setForm(null)})}}><fieldset disabled={busy}>
    <label>{t('ชื่อโครงการ')}<input autoFocus required maxLength={120} placeholder={t('เช่น เปิดร้านเล็ก ๆ ของฉัน')} value={draft.title} onChange={e=>changeForm({title:e.target.value})}/></label>
    <label>{t('วันเป้าหมาย (ไม่บังคับ)')}<input type="date" value={draft.due} onChange={e=>changeForm({due:e.target.value})}/></label>
    <label>{t('อยากทำอะไรให้สำเร็จ?')}<textarea maxLength={1000} rows={2} placeholder={t('เขียนสั้น ๆ ให้ตัวเองจำได้')} value={draft.note} onChange={e=>changeForm({note:e.target.value})}/></label>
    {!existing&&<div className="project-tip"><Layers/><p>{t('บันทึกโครงการก่อน แล้วค่อยแบ่งเฟสและเพิ่มงานในแต่ละเฟส')}</p></div>}
    {errorView}<button className="project-primary" type="submit">{t(busy?'กำลังบันทึก…':existing?'บันทึกการแก้ไข':'สร้างโครงการ')}<Heart size={17}/></button>
   </fieldset></form>
  </section>
 }
 if(form&&project&&(form.kind==='phase'||phase)){
  const isPhase=form.kind==='phase',draft=form.value,collection=isPhase?project.phases:phase.plans||[],existing=collection.some(p=>p.id===draft.id)
  const remaining=projectProgress({plans:collection.filter(p=>p.id!==draft.id)}).remaining,weightLabel=isPhase?'เฟสนี้คิดเป็นกี่ % ของโครงการ':'งานนี้คิดเป็นกี่ % ของเฟส'
  function save(e){
   e.preventDefault();const fields={title:draft.title.trim(),weight:Number(draft.weight)}
   const revise=rows=>{if(existing&&!rows.some(p=>p.id===draft.id))throw Error(t('ไม่พบรายการนี้'));return existing?rows.map(p=>p.id===draft.id?{...p,...fields}:p):[...rows,{...draft,...fields}]}
   const after=()=>{setForm(null);if(isPhase)setPhaseId(draft.id)}
   if(isPhase)updateProject(current=>({...current,phases:revise(current.phases)}),after)
   else updatePhase(current=>({...current,plans:revise(current.plans||[])}),after)
  }
  function remove(){
   if(!confirmDelete){setConfirmDelete(true);return}
   if(isPhase)updateProject(current=>({...current,phases:current.phases.filter(p=>p.id!==draft.id)}),()=>{setForm(null);setPhaseId(null);setConfirmDelete(false)})
   else updatePhase(current=>({...current,plans:(current.plans||[]).filter(p=>p.id!==draft.id)}),()=>{setForm(null);setConfirmDelete(false)})
  }
  return <section className="projects-page"><Header title={t(isPhase?(existing?'แก้ไขเฟส':'เพิ่มเฟส'):(existing?'แก้ไขแผนงาน':'เพิ่มแผนงาน'))} onBack={back}/>
   <div className="project-parent"><FolderHeart size={19}/><span>{project.title}{!isPhase&&<small>{phase.title}</small>}</span></div>
   <form onSubmit={save}><fieldset disabled={busy}>
    <label>{t(isPhase?'ชื่อเฟส':'ชื่อแผนงาน')}<input required autoFocus maxLength={120} placeholder={isPhase?t('เช่น เตรียมงาน ออกแบบ ลงมือทำ'):t('เช่น หารูปอ้างอิง 30 รูป')} value={draft.title} onChange={e=>changeForm({title:e.target.value})}/></label>
    <label>{t(weightLabel)}<div className="project-weight-input single"><input aria-label={t(weightLabel)} type="number" required min="0.01" max={Math.max(0.01,remaining)} step="0.01" inputMode="decimal" value={draft.weight} onChange={e=>changeForm({weight:e.target.value})}/><span>%</span></div><small>{t('ยังแบ่งน้ำหนักได้อีก')} {percent(remaining)}%</small></label>
    <div className="project-tip"><CatSticker pose="peek"/><p>{t(isPhase?'แบ่งน้ำหนักให้เฟสก่อน แล้วค่อยเพิ่มงานข้างใน ♡':'ติ๊กงานเสร็จ ความคืบหน้าจะรวมขึ้นไปที่เฟสและโครงการ')}</p></div>
    {errorView}<button className="project-primary" type="submit">{t(busy?'กำลังบันทึก…':isPhase?'บันทึกเฟส':'บันทึกแผนงาน')}<Check size={18}/></button>
    {existing&&<div className="project-delete">{confirmDelete&&<p>{t(isPhase?'ลบเฟสนี้และงานข้างในทั้งหมด?':'ลบงานนี้และคำนวณความคืบหน้าใหม่?')}</p>}<button type="button" onClick={remove}><Trash2 size={15}/>{t(confirmDelete?'ยืนยันการลบ':isPhase?'ลบเฟสนี้':'ลบแผนงาน')}</button>{confirmDelete&&<button type="button" onClick={()=>setConfirmDelete(false)}>{t('ยกเลิก')}</button>}</div>}
   </fieldset></form>
  </section>
 }
 if(project&&phase){
  const progress=phaseProgress(phase),contribution=projectProgress({phases:[phase]}).progress
  return <section className="projects-page"><Header title={t('งานในเฟส')} onBack={back} action={<button disabled={busy} aria-label={t('แก้ไขเฟส')} onClick={()=>openForm('phase',phase)}><Pencil size={19}/></button>}/>
   <button className="project-parent project-breadcrumb" onClick={back}><FolderHeart size={18}/><span>{project.title}</span><ChevronRight size={16}/></button>
   <div className="project-detail-hero project-phase-hero"><span className="project-eyebrow"><Layers size={16}/>{percent(phase.weight)}% {t('ของโครงการ')}</span><h2>{phase.title}</h2><div className="project-big-progress"><strong>{percent(progress.progress)}<span>%</span></strong><img src={restCat} alt=""/></div><Progress value={progress.progress} phase large/><footer><span>{t('ความคืบหน้าเฟส')}</span><span>{t('เสร็จแล้ว')} {progress.completed}/{progress.total} {t('งาน')}</span></footer></div>
   <div className="project-phase-contribution"><span>{t('ช่วยให้โครงการคืบหน้า')} <b>{percent(contribution)}%</b></span><small>{t('รวมทั้งโครงการ')} {percent(stats.progress)}%</small></div>
   <div className="project-section-heading"><h2>{t('งานย่อยในเฟส')}</h2><span>{t('น้ำหนักรวม')} {percent(progress.allocated)}%</span></div>
   {progress.remaining>0&&<p className="project-hint">{t('ยังแบ่งน้ำหนักได้อีก')} {percent(progress.remaining)}% {t('ในเฟสนี้')}</p>}
   <div className="project-plan-list">{(phase.plans||[]).map((plan,index)=><article key={plan.id} className={plan.done?'done':''}><label><input type="checkbox" checked={!!plan.done} disabled={busy} aria-label={t('ทำเสร็จแล้ว')+' '+plan.title} onChange={()=>updatePhase(current=>({...current,plans:current.plans.map(row=>row.id===plan.id?{...row,done:!row.done}:row)}))}/><span className="project-check" aria-hidden="true">{plan.done?<Check size={16}/>:index+1}</span><span className="project-plan-copy"><strong>{plan.title}</strong><small>{t(plan.done?'เสร็จแล้ว เก่งมาก!':'รอทำ ทีละอย่างก็ได้นะ')}</small></span></label><b>{percent(plan.weight)}%</b><button disabled={busy} aria-label={t('แก้ไขแผนงาน')+' '+plan.title} onClick={()=>openForm('task',plan)}><Pencil size={16}/></button></article>)}</div>
   {!progress.total&&<Empty>{t('เฟสพร้อมแล้ว เพิ่มงานแรกกัน ♡')}</Empty>}
   {errorView}<button className="project-outline" disabled={busy||progress.remaining===0} onClick={()=>openForm('task',{id:uid(),title:'',weight:Math.min(25,progress.remaining),done:false})}><Plus size={18}/>{t('เพิ่มแผนงาน')}</button>
   {progress.remaining===0&&<p className="project-full-hint">{t('ปรับน้ำหนักงานเดิมก่อนเพิ่มงานใหม่')}</p>}
   <p className="project-footer-note"><Heart size={14}/>{t('งานเสร็จหนึ่งชิ้น ก็ใกล้เป้าหมายอีกนิด ♡')}</p>
  </section>
 }
 if(project){
  return <section className="projects-page"><Header title={t('โครงการของฉัน')} onBack={back} action={<button disabled={busy} aria-label={t('แก้ไขโครงการ')} onClick={()=>openForm('project',{...project,note:project.note||'',due:project.due||''})}><Pencil size={19}/></button>}/>
   <div className="project-detail-hero"><span className="project-eyebrow"><FolderHeart size={16}/>{t(stats.progress===100?'สำเร็จแล้ว เก่งมาก!':'ค่อย ๆ ทำ ทีละก้าว')}</span><h2>{project.title}</h2>{project.note&&<p>{project.note}</p>}{project.due&&<small><CalendarDays size={15}/>{t('เป้าหมาย')} {dateLabel(project.due)}</small>}<div className="project-big-progress"><strong>{percent(stats.progress)}<span>%</span></strong><img src={restCat} alt=""/></div><Progress value={stats.progress} large/><footer><span>{t('ความคืบหน้าโครงการ')}</span><span>{t('เสร็จแล้ว')} {stats.completedPhases}/{stats.phaseCount} {t('เฟส')}</span></footer></div>
   <div className="project-section-heading"><h2>{t('เฟสของโครงการ')}</h2><span>{t('น้ำหนักรวม')} {percent(stats.allocated)}%</span></div>
   {stats.remaining>0&&<p className="project-hint">{t('ยังแบ่งน้ำหนักได้อีก')} {percent(stats.remaining)}% · {t('แตะเฟสเพื่อเพิ่มงานย่อย')}</p>}
   <div className="project-cards project-phase-cards">{project.phases.map((p,index)=>{const state=phaseProgress(p);return <button className="project-card" key={p.id} onClick={()=>{setPhaseId(p.id);setError('')}}><div><span className="project-phase-number">{String(index+1).padStart(2,'0')}</span><strong>{p.title}</strong><ChevronRight size={17}/></div><div className="project-phase-weight">{percent(p.weight)}% {t('ของโครงการ')}</div><div className="project-card-numbers"><span>{t('เสร็จแล้ว')} {state.completed}/{state.total} {t('งาน')}</span><b>{percent(state.progress)}%</b></div><Progress value={state.progress} phase/></button>})}</div>
   {!project.phases.length&&<Empty>{t('แบ่งเฟสแรก แล้วค่อยลงงานข้างใน ♡')}</Empty>}
   {errorView}<button className="project-outline" disabled={busy||stats.remaining===0} onClick={()=>openForm('phase',{id:uid(),title:'',weight:Math.min(25,stats.remaining),plans:[]})}><Plus size={18}/>{t('เพิ่มเฟส')}</button>
   {stats.remaining===0&&<p className="project-full-hint">{t('แบ่งครบ 100% แล้ว แตะเฟสเพื่อเพิ่มงานหรือปรับน้ำหนัก')}</p>}
   <p className="project-footer-note"><Heart size={14}/>{t(stats.progress===100?'ครบ 100% แล้ว ให้รางวัลตัวเองหน่อย ♡':'สร้างโครงการ → แบ่งเฟส → ลงงานย่อย')}</p>
  </section>
 }
 const complete=all.filter(p=>projectProgress(p).progress===100),active=all.filter(p=>projectProgress(p).progress<100),visible=filter==='done'?complete:active
 return <section className="projects-page project-overview"><Header title={t('โครงการของฉัน')} onBack={onBack} action={<button aria-label={t('สร้างโครงการ')} onClick={create}><Plus/></button>}/>
  <div className="project-welcome"><div><small>ONE LITTLE STEP</small><h2>{t('เป้าหมายใหญ่')}<br/>{t('ค่อย ๆ ไปด้วยกัน ♡')}</h2></div><img src={restCat} alt={t('แมวนอนพักบนเบาะสีชมพู')}/></div>
  <div className="project-counters"><button className={filter==='active'?'selected':''} onClick={()=>setFilter('active')}><FolderHeart/><span><strong>{active.length}</strong>{t('กำลังทำ')}</span></button><button className={filter==='done'?'selected':''} onClick={()=>setFilter('done')}><Flag/><span><strong>{complete.length}</strong>{t('สำเร็จแล้ว')}</span></button></div>
  <div className="project-section-heading"><h2>{t(filter==='done'?'โครงการที่สำเร็จ':'โครงการของฉัน')}</h2><span>{visible.length} {t('โครงการ')}</span></div>
  <div className="project-cards">{visible.map(p=>{const state=projectProgress(p);return <button className="project-card" key={p.id} onClick={()=>{setSelected(p.id);setPhaseId(null);setError('')}}><div><span className="project-card-icon"><FolderHeart size={21}/></span><strong>{p.title}</strong><ChevronRight size={17}/></div><div className="project-card-numbers"><span>{state.phaseCount} {t('เฟส')} · {t('เสร็จแล้ว')} {state.completed}/{state.total} {t('งาน')}</span><b>{percent(state.progress)}%</b></div><Progress value={state.progress}/>{p.due&&<small><CalendarDays size={13}/>{dateLabel(p.due)}</small>}</button>})}</div>
  {!visible.length&&<Empty>{t(filter==='done'?'ทำทีละนิด เดี๋ยวก็มีโครงการสำเร็จ ♡':'เริ่มโครงการแรก ให้แมวช่วยดูความคืบหน้า')}</Empty>}
  <button className="project-primary" onClick={create}><Plus size={19}/>{t('สร้างโครงการ')}</button><p className="project-footer-note">{t('สร้างโครงการ → แบ่งเฟส → ลงงานย่อย')}</p>
 </section>
}
