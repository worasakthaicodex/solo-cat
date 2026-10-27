import messages from './translations-en.json'
export function language(){try{const saved=localStorage.getItem('solo-cat.language');if(saved==='th'||saved==='en')return saved}catch{}return navigator.language?.toLowerCase().startsWith('th')?'th':'en'}
export const locale=()=>language()==='en'?'en-GB':'th-TH'
export function t(text){return language()==='en'&&typeof text==='string'?(messages[text]??text):text}
export function setLanguage(value){if(!['th','en'].includes(value))return;localStorage.setItem('solo-cat.language',value);location.reload()}
document.documentElement.lang=language()

globalThis.SoloStore?.put('ui-language',language()).catch(()=>{})
