import LanguagePicker from './LanguagePicker'
import {t as trUI,locale} from './i18n'
import {googleSignIn} from './firebase-auth'
import React, { useState } from 'react'
import { PawPrint } from 'lucide-react'
import { OriginalArtwork, BrandLogo } from './Welcome'
import './login.css'
import loginCat from './assets/login-cat-hd.webp'

function GoogleMark() {
  return <svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.61 0-4.82-1.76-5.61-4.12H3.05v2.59A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.39 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.34-2.59Z" />
    <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.88-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.34 2.59C7.18 7.72 9.39 5.96 12 5.96Z" />
  </svg>
}

export default function Login({ onLogin, onGuest }) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function login(){if(busy)return;setBusy(true);setError('');try{const user=await googleSignIn();await onLogin(user)}catch(e){setError(e.code==='auth/popup-closed-by-user'?'ยกเลิกการเข้าสู่ระบบแล้ว':e.code==='auth/popup-blocked'?'กรุณาอนุญาตป๊อปอัปแล้วลองอีกครั้ง':e.code?'เข้าสู่ระบบ Google ไม่สำเร็จ กรุณาตรวจการเชื่อมต่อและลองอีกครั้ง':e.message)}finally{setBusy(false)}}
  return <div className="welcome-shell">
    <main className="welcome-page login-page" aria-label={trUI("เข้าสู่ระบบ Solo Cat")}>
      <header className="welcome-heading login-heading">
        <h1><BrandLogo /></h1>
        <p>{trUI("จัดการชีวิตในแบบของคุณ")}<br />{trUI("เรื่องเล็กก็สำคัญ")}</p>
      </header>
      <div className="login-art-scene">
        <img src={loginCat} width="1536" height="1024" className="login-art" alt={trUI("แมวใส่แว่นกันแดดนั่งบนหมอนชมพู ใช้แล็ปท็อปข้างแก้ว Good Day")} />
        <p className="login-art-caption">Life<br />is better<br />with<br />a cat ♡</p>
      </div>
      <LanguagePicker/><section className="login-actions" aria-label={trUI("เลือกวิธีเข้าใช้งาน")}>
        <button className="login-button google-login" disabled={busy} onClick={login}><GoogleMark /> {busy?trUI("กำลังเข้าสู่ระบบ…"):trUI("เข้าสู่ระบบด้วย Google")}</button>
        {error&&<p role="alert">{trUI(error)}</p>}
        <button className="login-button email-login guest-login" disabled={busy} onClick={onGuest}>{trUI("เข้าใช้งานโดยไม่สมัคร")}<span aria-hidden="true">♡</span></button>
      </section>
      <footer className="login-footer">
        <PawPrint className="login-paw left-paw" size={30} aria-hidden="true" />
        <OriginalArtwork viewBox="650 507 84 32" className="login-friends" label="เพื่อนแมวสองตัว" />
        <p>{trUI("ครอบครัวของคนใช้ชีวิตคนเดียว")}<br />Solo Cat ♡</p>
        <PawPrint className="login-paw right-paw" size={33} aria-hidden="true" />
      </footer>
    </main>
  </div>
}


