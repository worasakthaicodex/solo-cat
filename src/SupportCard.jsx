import React from 'react'
import {Heart,ArrowUpRight} from 'lucide-react'
import {t} from './i18n'
export function supportUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&['buy.stripe.com','donate.stripe.com'].includes(url.hostname)&&!url.username&&!url.password&&!url.port&&url.pathname.length>1?url.href:null}catch{return null}}
export default function SupportCard(){
 const link=supportUrl(import.meta.env.VITE_STRIPE_SUPPORT_URL)
 if(!link)return null
 return <section className="support-card" aria-labelledby="support-title"><span className="support-heart" aria-hidden="true"><Heart/></span><div><h2 id="support-title">{t('สนับสนุน Solo Cat')}</h2><p>{t('ชอบที่มีแมวอยู่ข้าง ๆ ไหม? ส่งกำลังใจให้เราพัฒนา Solo Cat ต่อได้เลย ♡')}</p></div><a href={link} target="_blank" rel="noopener noreferrer">{t('ส่งกำลังใจให้ Solo Cat')}<ArrowUpRight size={18}/></a><small>{t('สนับสนุนตามใจคุณ ผ่าน Stripe · เปิดในหน้าต่างใหม่')}</small></section>
}
