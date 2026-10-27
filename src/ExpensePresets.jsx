import {t as trUI,locale} from './i18n'
import React from 'react'
import {Landmark,Wifi,Zap,Droplets,House,Music2,Utensils,Car,ShoppingBag,Crown,Wallet} from 'lucide-react'
import './expense-presets.css'
import {expensePresets} from './expense-presets'
export {expensePresets} from './expense-presets'
export function ExpenseIcon({presetId,title=''}){
 const preset=expensePresets.find(p=>p.id===presetId)||expensePresets.find(p=>p.name.toLowerCase()===title.toLowerCase());if(!preset)return null;
 const I={food:Utensils,home:House,transport:Car,shopping:ShoppingBag,subscription:Crown,general:Wallet,debt:Landmark,internet:Wifi,electricity:Zap,water:Droplets,rent:House,music:Music2}[preset.id];
 return <span className="expense-brand-icon" style={{color:preset.color,background:preset.background}} aria-hidden="true">{preset.id==='netflix'?<svg viewBox="0 0 32 32"><path fill="currentColor" d="M7 4h6v24H7zm12 0h6v24h-6z"/><path fill="#ff3045" d="M7 4h6l12 24h-6z"/></svg>:preset.id==='spotify'?<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="currentColor"/><path d="M8 12c6-2 11-1 16 1M9 17c5-2 10-1 14 1M10 22c4-1 8-1 11 1" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>:preset.id==='youtube'?<svg viewBox="0 0 32 32"><rect x="2" y="6" width="28" height="20" rx="6" fill="currentColor"/><path d="m13 11 9 5-9 5z" fill="white"/></svg>:<I/>}</span>
}
export default function ExpensePresets({selected,onSelect}){return <section className="expense-presets" aria-label={trUI("เลือกหมวดและรายการค่าใช้จ่าย")}><div className="expense-presets-heading"><strong>{trUI("หมวดและรายการค่าใช้จ่าย")}</strong><small>{trUI("เลือกเพื่อเติมข้อมูล")}</small></div><div className="expense-presets-grid">{expensePresets.map(p=><button type="button" key={p.id} aria-pressed={selected===p.id} onClick={()=>onSelect(p)}><ExpenseIcon presetId={p.id}/><span>{trUI(p.name)}</span></button>)}</div><p>{trUI("กรอกยอดตามแพ็กเกจหรือบิลของคุณ")}</p></section>}
