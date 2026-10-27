import {t as trUI,locale} from './i18n'
import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import reference from '../Solo cat/9522f433-1532-49bb-ae4b-e43737d3230a.webp'
import sittingCat from '../Solo cat/0ce32280-b531-485c-a2c3-6f624195a1be.webp'
import peekingCat from '../Solo cat/586625f0-3fa1-44d0-a780-8903a744c7d5.webp'
import './welcome.css'
import logo from './assets/solo-cat-logo-hd.webp'
import welcomeCat from './assets/welcome-cat-hd.webp'
export function BrandLogo() { return <img src={logo} className="welcome-logo" alt="Solo Cat ♥" width="2172" height="724" /> }

// View boxes isolate the original artwork without recreating the illustrations.
export function OriginalArtwork({ viewBox, className, label }) {
  return (
    <svg className={className} viewBox={viewBox} role="img" aria-label={trUI(label)}>
      <image href={reference} width="1448" height="1086" />
    </svg>
  )
}

const slides = [
  { heading: <>{trUI("ชีวิตง่ายขึ้น")}<br />{trUI("เพราะมีแมวอยู่ข้างๆ")}</>, label: 'มีแมวอยู่ข้าง ๆ' },
  { heading: <>{trUI("ดูแลเรื่องเล็ก ๆ ในทุกวัน")}<br />{trUI("ไปด้วยกันนะ")}</>, label: 'ดูแลทุกวัน' },
  { heading: <>{trUI("เริ่มต้นวันใหม่สบาย ๆ")}<br />{trUI("ทีละเรื่องก็เก่งแล้ว")}</>, label: 'เริ่มต้นวันใหม่' },
]

export default function Welcome({ onStart }) {
  const [slide, setSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(null)

  function swipe(event) {
    if (touchStart === null) return
    const distance = touchStart - event.changedTouches[0].clientX
    if (Math.abs(distance) > 45) setSlide(current => Math.max(0, Math.min(2, current + (distance > 0 ? 1 : -1))))
    setTouchStart(null)
  }

  return (
    <div className="welcome-shell">
      <main className="welcome-page" aria-label={trUI("ยินดีต้อนรับสู่ Solo Cat")}>
        <header className="welcome-heading">
          <h1><BrandLogo /></h1>
          <p aria-live="polite">{slides[slide].heading}</p>
        </header>

        <section className="welcome-carousel" aria-label={trUI("แนะนำ Solo Cat")} onTouchStart={event => setTouchStart(event.touches[0].clientX)} onTouchEnd={swipe}>
          <div className="welcome-illustration" key={slide}>
            {slide === 0 ? (
              <div className="welcome-cat-scene"><p className="welcome-cat-message">{trUI("พักก่อนก็ได้")}<br />{trUI("เดี๋ยวค่อยไปต่อนะ ♡")}</p><img src={welcomeCat} className="welcome-cat-hd" width="1536" height="1024" alt={trUI("แมวนอนพักบนหมอนสีชมพูข้างแก้ว Good Day")} /></div>
            ) : (
              <img className="welcome-alternate-cat" src={slide === 1 ? sittingCat : peekingCat} alt={slide === 1 ? trUI("แมวน้อยนั่งเป็นเพื่อนคุณ") : trUI("แมวน้อยแอบมาส่งกำลังใจ")} />
            )}
          </div>
          <div className="welcome-dots" aria-label={trUI("เลือกหน้าแนะนำ")}>
            {slides.map((item, index) => (
              <button key={trUI(item.label)} type="button" aria-label={`หน้า ${index + 1}: ${item.label}`} aria-current={slide === index ? 'step' : undefined} onClick={() => setSlide(index)}><span /></button>
            ))}
          </div>
        </section>

        <footer className="welcome-footer">
          <button type="button" className="welcome-start" onClick={onStart}>{trUI("เริ่มใช้งานเลย")}<ArrowRight size={25} strokeWidth={1.8} /></button>
          <p>{trUI("ให้แมวหนึ่งตัวช่วยจัดการชีวิตคุณ")}</p>
        <nav aria-label="About Solo Cat"><a href="/about-th.html">รู้จัก Solo Cat</a> · <a href="/about-en.html">About Solo Cat</a></nav></footer>
      </main>
    </div>
  )
}

