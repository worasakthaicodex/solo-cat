import {startInboxTracking} from './inbox-tracking'
import {startPrivacyTracking} from './privacy-tracking'
import PrivacyConsent from './PrivacyConsent'
import {startSyncTracking} from './sync-tracking'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {StorageGate} from './persistent-state.jsx'
import AccountStorageGate from './AccountStorageGate'
import {accountStorageState,subscribeAccountStorage} from './account-storage'
import './styles.css'
import '@fontsource/itim/thai-400.css'
import '@fontsource/itim/latin-400.css'
import '@fontsource/anuphan/thai-400.css'
import '@fontsource/anuphan/thai-500.css'
import '@fontsource/anuphan/thai-600.css'
import '@fontsource/anuphan/thai-700.css'
import '@fontsource/anuphan/latin-400.css'
import '@fontsource/anuphan/latin-600.css'
import {registerWorker} from './notifications'
registerWorker().catch(()=>{ /* The notification screen explains unsupported/offline states. */ })

startSyncTracking()
let stopInbox
subscribeAccountStorage(()=>{stopInbox?.();stopInbox=accountStorageState().ready?startInboxTracking():null})
startPrivacyTracking()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccountStorageGate><StorageGate><App /></StorageGate></AccountStorageGate><PrivacyConsent />
  </React.StrictMode>,
)

import './mobile-layout.css'
import {trackVisualViewport} from './mobile-viewport'
trackVisualViewport()

