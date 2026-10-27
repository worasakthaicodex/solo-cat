import React from 'react'
import {language,setLanguage} from './i18n'
import {flushDomainWrites} from './persistent-state'
export default function LanguagePicker(){return <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:12,fontFamily:'Anuphan,sans-serif',fontSize:16}}>ภาษา / Language<select aria-label="ภาษา / Language" value={language()} onChange={async e=>{const next=e.target.value;try{await flushDomainWrites();setLanguage(next)}catch{alert('Please save your changes first / กรุณาบันทึกข้อมูลก่อนเปลี่ยนภาษา')}}} style={{border:'1px solid #efd9dc',borderRadius:12,padding:8,background:'#fff9f3',color:'#26313a'}}><option value="th">ไทย</option><option value="en">English</option></select></label>}
