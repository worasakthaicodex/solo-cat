import React,{useEffect,useRef,useState} from 'react'
import {BookOpen,Search,Upload,Check} from 'lucide-react'
import {language} from './i18n'
import {prepareReadingCover} from './reading-api'
import {bookLanguages,editionCover,findBookCovers} from './reading-catalogue'
import ReadingArt from './ReadingArt'

const t=(th,en)=>language()==='en'?en:th
export default function ReadingAddBook({initial,genres,busy,onSave}){
 const [book,setBook]=useState({...initial,bookLanguage:initial.bookLanguage||(language()==='en'?'eng':'tha'),isbn:''})
 const [image,setImage]=useState(''),[edition,setEdition]=useState(null),[results,setResults]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[failed,setFailed]=useState({})
 const request=useRef(null),active=useRef(true)
 useEffect(()=>{active.current=true;return()=>{active.current=false;request.current?.abort()}},[])
 function edit(key,value){request.current?.abort();request.current=null;setLoading(false);setResults(null);setError('');setBook(b=>({...b,[key]:value}));if(['title','author','bookLanguage','isbn'].includes(key))setEdition(null)}
 async function lookup(){
  request.current?.abort();const controller=new AbortController();request.current=controller
  setLoading(true);setError('');setResults(null);setFailed({});const timer=setTimeout(()=>controller.abort(),15000)
  try{const found=await findBookCovers(book,controller.signal);if(active.current&&request.current===controller)setResults(found)}
  catch(e){if(active.current&&request.current===controller)setError(e.message==='isbn'?t('กรอก ISBN 10 หรือ 13 หลัก','Enter a 10- or 13-digit ISBN.'):t('ค้นหาปกไม่ได้ตอนนี้ ลองอีกครั้งหรืออัปโหลดเองได้เลย','Cover search is unavailable. Try again or upload your cover.'))}
  finally{clearTimeout(timer);if(active.current&&request.current===controller)setLoading(false)}
 }
 async function upload(file){if(!file)return;setLoading(true);setError('');try{const data=await prepareReadingCover(file);if(active.current){setImage(data);setEdition(null);setResults(null)}}catch(e){if(active.current)setError(e.message)}finally{if(active.current)setLoading(false)}}
 const preview=image?'data:image/jpeg;base64,'+image:editionCover(edition?.edition)
 return <form className="reading-add-form" onSubmit={e=>{e.preventDefault();onSave(book,image,edition)}}>
  <fieldset disabled={busy||loading}>
   <section className="reading-add-cover">
    <div className="reading-cover-preview">{preview?<img src={preview} alt={t('ปกที่เลือก','Selected cover')} referrerPolicy="no-referrer"/>:<><BookOpen/><small>{t('ปกหนังสือ','Book cover')}</small></>}</div>
    <div><ReadingArt name="read"/><strong>{t('เพื่อนใหม่บนชั้นหนังสือ ♡','A new friend for your shelf ♡')}</strong><label className="reading-upload-button"><Upload size={15}/>{t('อัปโหลดปก','Upload cover')}<input className="reading-file-input" type="file" accept="image/jpeg,image/png" onChange={e=>{upload(e.target.files?.[0]);e.target.value=''}}/></label><small>JPG / PNG · {t('ไม่เกิน 2 MB','Up to 2 MB')}</small>{preview&&<button type="button" className="reading-text-link" onClick={()=>{setImage('');setEdition(null)}}>{t('เอาปกออก','Remove cover')}</button>}</div>
   </section>
   <label>{t('ชื่อหนังสือ','Book title')}<input required maxLength="160" value={book.title} onChange={e=>edit('title',e.target.value)}/></label>
   <label>{t('ผู้เขียน','Author')}<input required maxLength="120" value={book.author} onChange={e=>edit('author',e.target.value)}/></label>
   <div className="reading-add-pair"><label>{t('ภาษาของหนังสือ','Book language')}<select aria-label={t('ภาษาของหนังสือ','Book language')} value={book.bookLanguage} onChange={e=>edit('bookLanguage',e.target.value)}>{bookLanguages.map(([value,th,en])=><option key={value} value={value}>{t(th,en)}</option>)}</select></label><label>{t('จำนวนหน้าทั้งหมด','Total pages')}<input required type="number" min="1" max="100000" value={book.total} onChange={e=>edit('total',e.target.value)}/></label></div>
   <label>{t('หมวดหนังสือ','Category')}<select value={book.genre} onChange={e=>edit('genre',e.target.value)}>{genres.map(([key,th,en])=><option key={key} value={key}>{t(th,en)}</option>)}</select></label>
   <details className="reading-cover-search">
    <summary><Search size={16}/>{t('หาปกจริงจากชื่อหรือ ISBN','Find a real cover by title or ISBN')}</summary>
    <label>{t('ISBN (ถ้ามี ช่วยหาฉบับที่ตรงกัน)','ISBN (optional, for an exact edition)')}<input value={book.isbn} maxLength="24" placeholder="978…" onChange={e=>edit('isbn',e.target.value)}/></label>
    <button type="button" className="reading-secondary" disabled={(!book.title.trim()&&!book.isbn.trim())||loading} onClick={lookup}>{t('ค้นหาปก','Find covers')}</button>
    <small>{t('ค้นจาก Open Library ไม่ใช้ AI · ตรวจภาษาและฉบับก่อนเลือก บางเล่มอาจไม่มีปก','From Open Library, not AI. Check the language and edition; some books have no cover.')}</small>
    {results&&<div className="reading-cover-results">{results.filter(b=>!failed[b.edition]).map(b=><article key={b.edition}><img src={editionCover(b.edition)} alt={b.title} referrerPolicy="no-referrer" onError={()=>setFailed(old=>({...old,[b.edition]:true}))}/><div><strong>{b.title}</strong><small>{b.author}</small><small>{bookLanguages.find(x=>x[0]===b.bookLanguage)?.[language()==='en'?2:1]||b.bookLanguage} · {[b.publisher,b.year].filter(Boolean).join(' · ')}</small><a href={'https://openlibrary.org/books/'+b.edition} target="_blank" rel="noreferrer">{t('ดูฉบับนี้','View edition')}</a><button type="button" aria-pressed={edition?.edition===b.edition} onClick={()=>{setEdition(b);setImage('')}}>{edition?.edition===b.edition?<><Check size={13}/>{t('เลือกแล้ว','Selected')}</>:t('ใช้ปกนี้','Use this cover')}</button></div></article>)}</div>}
    {results&&!results.some(b=>!failed[b.edition])&&<p role="status">{t('ยังไม่พบปก ลอง ISBN หรืออัปโหลดเองได้เลย ♡','No cover found. Try an ISBN or upload your own ♡')}</p>}
   </details>
   {edition&&<small className="reading-cover-credit">{t('ปกจาก','Cover from')} <a href={'https://openlibrary.org/books/'+edition.edition} target="_blank" rel="noreferrer">Open Library</a> · {edition.title}</small>}
   <small className="reading-cover-sharing">{image?t('ปกที่อัปโหลดและชื่อหนังสือจะใช้ร่วมกันในชั้นหนังสือสมาชิก · โควตาไฟล์รวม 20 MB','Your uploaded cover and book details join the shared member shelf. Total file quota: 20 MB.'):t('เพิ่มได้แม้ยังไม่มีปก แล้วค่อยเติมทีหลังนะ ♡','You can add your book without a cover, too ♡')}</small>
   <button className="reading-primary" disabled={busy||loading}>{busy?t('กำลังบันทึก…','Saving…'):t('เพิ่มในรายการของฉัน','Add to my library')}</button>
  </fieldset>
  {loading&&<p role="status">{t('กำลังเตรียมปก…','Getting your cover…')}</p>}
  {error&&<p role="alert">{error}</p>}
 </form>
}
