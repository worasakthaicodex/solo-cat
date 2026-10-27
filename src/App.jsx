import {resolveNotificationItem} from './notification-item'
import OwnerRetention from './OwnerRetention'
import {EmergencySharedView} from './EmergencySharing'
import {t as trUI,locale} from './i18n'
import {googleSignOut} from './firebase-auth'
import React, { useState, useEffect, useRef } from 'react'
import Notifications from './Notifications.jsx'
import {store,registerWorker} from './notifications'
import Welcome from './Welcome'
import Login from './Login'
import HomePage from './HomePage'
import Kao from './Kao'
import Family from './Family'
import OT from './OT'
import Planner from './Planner'
import Account from './Account'
import FinanceSummary from './FinanceSummary'
import Income from './Income'
import Savings from './Savings.jsx'
import Work from './Work'
import AllTasks from './AllTasks'
import More from './More'
import Vehicle from './Vehicle'
import AddEntry from './AddEntry'
import {
  Bell,
  MoreHorizontal,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  FileText,
  Heart,
  Home,
  House,
  ListTodo,
  Plus,
  Repeat2,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Wifi,
  X,
} from 'lucide-react'

const typeConfig = {
  task: { label: 'งาน', icon: ListTodo, tone: 'blue' },
  expense: { label: 'ค่าใช้จ่าย', icon: WalletCards, tone: 'orange' },
  subscription: { label: 'สมาชิก', icon: Repeat2, tone: 'purple' },
  asset: { label: 'ทรัพย์สิน', icon: House, tone: 'green' },
  health: { label: 'สุขภาพ', icon: Heart, tone: 'pink' },
  car: { label: 'การเดินทาง', icon: Car, tone: 'cyan' },
  document: { label: 'เอกสาร', icon: FileText, tone: 'sand' },
  other: { label: 'อื่น ๆ', icon: Sparkles, tone: 'gray' },
}

function formatMoney(value) {
  return new Intl.NumberFormat(locale()).format(value)
}

function Dashboard({ onLogout }) {
  const [page, setPageState] = useState(new URLSearchParams(location.search).has('notifications')?'notifications':'home')
  const [hydrated,setHydrated]=useState(false),[storageError,setStorageError]=useState(''),[unread,setUnread]=useState(0),[notificationItem,setNotificationItem]=useState(null)
  function setPage(next){setNotificationItem(null);setPageState(next)}
  const [items, setItemsView] = useState([])
  const itemsRead=useRef(0);
  const refreshItems=()=>{const read=++itemsRead.current;return store.get('items').then(saved=>{if(read===itemsRead.current)setItemsView(Array.isArray(saved)?saved:[])})};
  const notifyItems=()=>{window.dispatchEvent(new Event('items-committed'));if('BroadcastChannel' in window){const channel=new BroadcastChannel('solo-items');channel.postMessage('changed');channel.close()}};
  function setItems(change){return store.mutateItems(current=>typeof change==='function'?change(current):change).then(saved=>{++itemsRead.current;setItemsView(Array.isArray(saved)?saved:[]);setStorageError('');notifyItems();return true}).catch(()=>{setStorageError('บันทึกไม่สำเร็จ กรุณาลองใหม่ ข้อมูลเดิมยังอยู่');return false})}
  const [showAdd, setShowAdd] = useState(false)

  const [selectedType, setSelectedType] = useState('expense')
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('2026-09-25')
  const [newTime, setNewTime] = useState('10:00')
  const [newAmount, setNewAmount] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(()=>{let active=true;store.get('items').then(saved=>{if(active){if(Array.isArray(saved))setItemsView(saved);setHydrated(true)}}).catch(()=>{if(active)setStorageError('เปิดข้อมูลในเครื่องไม่สำเร็จ กรุณาโหลดหน้าใหม่ก่อนบันทึก')});return()=>{active=false}},[])
  useEffect(()=>{const refresh=()=>refreshItems().catch(()=>setStorageError('อ่านข้อมูลล่าสุดไม่สำเร็จ'));const channel='BroadcastChannel' in window?new BroadcastChannel('solo-items'):null;if(channel)channel.onmessage=refresh;window.addEventListener('focus',refresh);window.addEventListener('items-committed',refresh);return()=>{channel?.close();window.removeEventListener('focus',refresh);window.removeEventListener('items-committed',refresh)}},[])
  useEffect(()=>{const refresh=()=>store.inbox().then(rows=>setUnread(rows.filter(r=>!r.read).length)).catch(()=>{});const message=e=>{refresh();if(e.data?.type==='open-inbox')setPage('notifications')};refresh();window.addEventListener('focus',refresh);window.addEventListener('inbox-updated',refresh);navigator.serviceWorker?.addEventListener('message',message);return()=>{window.removeEventListener('focus',refresh);window.removeEventListener('inbox-updated',refresh);navigator.serviceWorker?.removeEventListener('message',message)}},[page])

  function saveManualItem() {
    if (!newTitle.trim()) return
    setItems((current) => [
      {
        id: Date.now(),
        type: selectedType,
        title: newTitle.trim(),
        subtitle: newTime ? `เวลา ${newTime}` : 'เพิ่มใหม่',
        amount: newAmount ? Number(newAmount) : undefined,
        due: newDate,
        done: false,
      },
      ...current,
    ])
    setNewTitle('')
    setNewAmount('')
    setShowAdd(false)
    setPage('home')
    setNotice('บันทึกรายการแล้ว ✓')
    setTimeout(() => setNotice(''), 1800)
  }

  if (!hydrated) return <p role="status">{storageError || 'กำลังเปิดข้อมูลในเครื่อง…'}</p>
  if (showAdd) return <div className="app-shell solo-dashboard"><div className="app-card"><AddEntry initialType={selectedType} onClose={() => setShowAdd(false)} onSave={async (item,files) => { const saved=await SoloStore.saveItem(item,files);setItemsView(saved);notifyItems(); setShowAdd(false); setNotice('บันทึกรายการแล้ว ✓'); setTimeout(() => setNotice(''),1800) }} /></div></div>

  return (
    <div className="app-shell solo-dashboard">
      <div className="app-card">
        <div className="soft-orb orb-one" />
        <div className="soft-orb orb-two" />
        {page === 'home' && (
          <HomePage



            onGoItems={() => setPage('items')}
            onGoIncome={() => setPage('income')}
            onGoKao={() => setPage('kao')}
            onGoFamily={() => setPage('family')}
            onGoOT={() => setPage('ot')}
            onGoWork={() => setPage('work')}
            onGoMore={() => setPage('more')}
            onNotifications={() => setPage('notifications')}
            unread={unread}
            onOpenAdd={() => setShowAdd(true)}
            onGoCalendar={() => setPage('calendar')}
          />
        )}
        {['calendar', 'items'].includes(page) && <Planner initialItem={page==='calendar'?notificationItem:null} key={page} mode={page} items={items} setItems={setItems} onExit={() => setPage('home')} />}
        {page === 'finance' && <FinanceSummary items={items} onBack={()=>setPage('more')} onGo={setPage}/>}
        {page === 'income' && <Income onBack={()=>setPage('home')}/>}
        {page === 'savings' && <Savings onBack={()=>setPage('more')}/>}
        {page === 'profile' && <Account onLogout={onLogout} onNotifications={() => setPage('notifications')} />}
        {page === 'notification-settings' && <Notifications settingsOnly onBack={() => setPage('notifications')} />}
        {page === 'notifications' && <Notifications onSettings={() => setPage('notification-settings')} onBack={() => setPage('home')} onOpen={item=>{const latest=resolveNotificationItem(items,item);setNotificationItem(latest);setPageState('calendar');if(!latest){setNotice(trUI('รายการนี้ถูกลบหรือย้ายแล้ว'));setTimeout(()=>setNotice(''),3000)}}} />}
        {page === 'more' && <More onGo={setPage} />}
        {page === 'all-tasks' && <AllTasks items={items} setItems={setItems} onBack={() => setPage('work')} onAdd={() => { setSelectedType('task'); setShowAdd(true) }} />}
        {['car','bike'].includes(page) && <Vehicle key={page} bike={page==='bike'} onBack={() => setPage('more')} />}
        {page === 'work' && <Work onAll={() => setPage('all-tasks')} items={items} setItems={setItems} onExit={() => setPage('home')} onCalendar={() => setPage('calendar')} onExpenses={() => setPage('items')} onAdd={() => { setSelectedType('task'); setShowAdd(true) }} />}

        {page === 'kao' && <Kao onSavings={()=>setPage('savings')} items={items} setItems={setItems} onExit={() => setPage('home')} />}
        {page === 'family' && <Family items={items} setItems={setItems} onExit={() => setPage('home')} />}
        {page === 'ot' && <OT onExit={() => setPage('home')} />}
        {!['kao', 'family', 'ot'].includes(page) && <BottomNav page={page} setPage={setPage} onAdd={() => setShowAdd(true)} />}
        {showAdd && (
          <AddSheet
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newDate={newDate}
            setNewDate={setNewDate}
            newTime={newTime}
            setNewTime={setNewTime}
            newAmount={newAmount}
            setNewAmount={setNewAmount}
            onClose={() => setShowAdd(false)}
            onSave={saveManualItem}
          />
        )}
        {notice && <div className="toast">{trUI(notice)}</div>}
        {storageError && <div role="alert" className="toast">{storageError}</div>}
      </div>
    </div>
  )
}

function MiniStat({ tone, icon, value, label }) {
  return (
    <div className="mini-stat">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{trUI(label)}</span>
      </div>
    </div>
  )
}

function TaskRow({ item }) {
  const cfg = typeConfig[item.type] || typeConfig.other
  const Icon = cfg.icon
  return (
    <div className={`task-row ${item.done ? 'done' : ''}`}>
      <span className={`task-type ${cfg.tone}`}><Icon size={18} /></span>
      <div className="task-copy">
        <strong>{item.title}</strong>
        <span>{item.subtitle}</span>
      </div>
      {item.amount ? <strong className="amount">{trUI("฿")}{formatMoney(item.amount)}</strong> : <ChevronRight size={18} />}
    </div>
  )
}

function CalendarPage({ items }) {
  const days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
  return (
    <main className="page">
      <header className="page-titlebar">
        <h1>{trUI("ปฏิทิน")}</h1>
        <button className="icon-button"><Search size={20} /></button>
      </header>
      <section className="calendar-card">
        <div className="calendar-month">
          <button><ChevronLeft size={18} /></button>
          <strong>{trUI("กันยายน 2026")}</strong>
          <button><ChevronRight size={18} /></button>
        </div>
        <div className="weekday-row">
          {['อา','จ','อ','พ','พฤ','ศ','ส'].map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="calendar-grid">
          {days.map((day) => <button key={day} className={day === 25 ? 'selected-day' : ''}>{day}</button>)}
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading"><h2>{trUI("รายการของวันที่ 25 ก.ย.")}</h2></div>
        <div className="task-list">{items.filter(i => i.due === '2026-09-25').map(item => <TaskRow key={item.id} item={item} />)}</div>
      </section>
    </main>
  )
}

function ProfilePage({ onLogout }) {
  const rows = [
    ['ข้อมูลส่วนตัว', CircleUserRound],
    ['การแจ้งเตือน', Bell],
    ['ธีมและการแสดงผล', Sparkles],
    ['ความปลอดภัย', ShieldCheck],
    ['การตั้งค่า', Settings],
  ]
  return (
    <main className="page">
      <section className="profile-head">
        <div className="big-avatar">🐱</div>
        <div>
          <h1>{trUI("คุณไอดี")}</h1>
          <span>solo@example.com</span>
          <small>💗 Solo Member</small>
        </div>
      </section>
      <section className="settings-list">
        {rows.map(([label, Icon]) => (
          <button key={trUI(label)}>
            <span className="settings-icon"><Icon size={19}/></span>
            <strong>{trUI(label)}</strong>
            <ChevronRight size={18}/>
          </button>
        ))}
      </section>
      <button className="logout-button" onClick={onLogout}>{trUI("ออกจากระบบ")}</button>
      <p className="version">{trUI("เวอร์ชัน 1.0.0 · ดูแลชีวิตวันนี้ เพื่อวันพรุ่งนี้ที่ดีกว่า ♡")}</p>
    </main>
  )
}

function BottomNav({ page, setPage, onAdd }) {
  const nav = [
    ['home', 'หน้าแรก', Home],
    ['calendar', 'ปฏิทิน', CalendarDays],
    ['items', 'รายการ', ListTodo],
    page === 'more' ? ['more', 'เพิ่มเติม', MoreHorizontal] : ['profile', 'โปรไฟล์', CircleUserRound],
  ]
  return (
    <nav className="bottom-nav">
      {nav.slice(0,2).map(([key, label, Icon]) => (
        <button key={key} className={page === key ? 'active' : ''} onClick={() => setPage(key)}><Icon size={20}/><span>{trUI(label)}</span></button>
      ))}
      <button className="nav-plus" aria-label={trUI("เพิ่มรายการ")} onClick={onAdd}><Plus size={28}/></button>
      {nav.slice(2).map(([key, label, Icon]) => (
        <button key={key} className={page === key ? 'active' : ''} onClick={() => setPage(key)}><Icon size={20}/><span>{trUI(label)}</span></button>
      ))}
    </nav>
  )
}

function AddSheet({ selectedType, setSelectedType, newTitle, setNewTitle, newDate, setNewDate, newTime, setNewTime, newAmount, setNewAmount, onClose, onSave }) {
  return (
    <div className="sheet-backdrop" onMouseDown={onClose}>
      <section className="add-sheet" onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <button className="icon-button" onClick={onClose}><X size={22}/></button>
          <h2>{trUI("เพิ่มรายการ")}</h2>
          <span />
        </header>
        <div className="type-grid">
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <button key={key} className={selectedType === key ? 'selected' : ''} onClick={() => setSelectedType(key)}>
                <span className={`type-icon ${cfg.tone}`}><Icon size={20}/></span>
                <small>{trUI(cfg.label)}</small>
              </button>
            )
          })}
        </div>
        <div className="form-stack">
          <label><span>{trUI("ชื่อรายการ")}</span><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={trUI("เช่น จ่ายค่าเน็ต AIS")} /></label>
          <div className="two-col">
            <label><span>{trUI("วันที่")}</span><input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} /></label>
            <label><span>{trUI("เวลา")}</span><input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} /></label>
          </div>
          <label><span>{trUI("จำนวนเงิน (ถ้ามี)")}</span><input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0" /></label>
          <label><span>{trUI("เตือนล่วงหน้า")}</span><select defaultValue="1"><option value="0">{trUI("ไม่เตือน")}</option><option value="1">{trUI("1 วัน")}</option><option value="3">{trUI("3 วัน")}</option><option value="7">{trUI("7 วัน")}</option></select></label>
          <label><span>{trUI("ทำซ้ำ")}</span><select defaultValue="none"><option value="none">{trUI("ไม่ทำซ้ำ")}</option><option value="monthly">{trUI("ทุกเดือน")}</option><option value="yearly">{trUI("ทุกปี")}</option></select></label>
        </div>
        <button className="save-button" onClick={onSave}>{trUI("บันทึก")}</button>
      </section>
    </div>
  )
}

function App() {
  const [ownerReport,setOwnerReport]=useState(()=>location.hash==='#owner-retention');
  useEffect(()=>{const update=()=>setOwnerReport(location.hash==='#owner-retention');window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[])
  const [shareToken,setShareToken]=useState(()=>new URLSearchParams(location.hash.slice(1)).get('emergency-share'));
  useEffect(()=>{const update=()=>setShareToken(new URLSearchParams(location.hash.slice(1)).get('emergency-share'));window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[])
  const [screen, setScreen] = useState(() => {
    try { if(new URLSearchParams(location.search).has('notifications'))return 'dashboard'; return localStorage.getItem('solo-cat.mock-login') === 'yes' ? 'dashboard' : 'welcome' }
    catch { return 'welcome' }
  })
  function enter(remember) {
    if(!remember){window.soloGuestStarted=true;window.dispatchEvent(new Event('solo-guest-started'))}
    if (remember) {
      try { localStorage.setItem('solo-cat.mock-login', 'yes') } catch { /* Browsing without storage still works. */ }
    }
    setScreen('dashboard')
  }
  async function logout() {
    try{await googleSignOut()}catch{ return window.alert('ออกจากบัญชี Google ไม่สำเร็จ กรุณาลองอีกครั้ง') }
    try { localStorage.removeItem('solo-cat.mock-login') } catch { /* Storage may be unavailable. */ }
    setScreen('login')
  }
  if(ownerReport)return <OwnerRetention/>
  if(shareToken)return <EmergencySharedView token={shareToken} onClose={()=>{history.replaceState(null,'',location.pathname+location.search);setShareToken(null)}}/>
  if (screen === 'dashboard') return <Dashboard onLogout={logout} />
  if (screen === 'login') return <Login onLogin={() => enter(true)} onGuest={() => enter(false)} />
  return <Welcome onStart={() => setScreen('login')} />
}

export default App







