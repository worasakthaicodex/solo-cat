import React,{useEffect,useState} from 'react'
import {firebaseToken} from './firebase-auth'
import {editionCover} from './reading-catalogue'
export default function ReadingCover({uid,book,children}){
 const [src,setSrc]=useState(null)
 const [failedEdition,setFailedEdition]=useState('')
 useEffect(()=>{setSrc(null);if(!book.cover||editionCover(book.coverEdition))return;let active=true,url;const abort=new AbortController();(async()=>{const token=await firebaseToken(uid);const r=await fetch('/api/reading/cover/'+book.id,{headers:{Authorization:'Bearer '+token},signal:abort.signal});if(!r.ok)throw Error('Cover unavailable');const blob=await r.blob();await firebaseToken(uid);url=URL.createObjectURL(blob);if(active)setSrc(url);else URL.revokeObjectURL(url)})().catch(()=>{});return()=>{active=false;abort.abort();if(url)URL.revokeObjectURL(url)}},[uid,book.id,book.cover,book.coverEdition])
 const external=editionCover(book.coverEdition)
 return external&&failedEdition!==book.coverEdition?<img className="reading-cover reading-uploaded-cover" src={external} alt={book.title} referrerPolicy="no-referrer" onError={()=>setFailedEdition(book.coverEdition)}/>:src?<img className="reading-cover reading-uploaded-cover" src={src} alt={book.title}/>:children
}
