import {initializeApp,getApps,getApp} from 'firebase/app'
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,getAdditionalUserInfo} from 'firebase/auth'
const config={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID,storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,measurementId:import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID};
export const firebaseConfigured=[config.apiKey,config.authDomain,config.projectId,config.appId].every(Boolean);
function auth(){if(!firebaseConfigured)throw Error('ยังไม่ได้เชื่อม Firebase สำหรับ Google กรุณาเข้าใช้งานโดยไม่สมัครก่อน');return getAuth(getApps().length?getApp():initializeApp(config))}
export async function googleSignIn(){const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});const result=await signInWithPopup(auth(),provider);if(getAdditionalUserInfo(result)?.isNewUser)window.dispatchEvent(new Event('solo-signup'));return result.user}
export async function googleSignOut(){if(firebaseConfigured)await signOut(auth())}
export async function firebaseToken(expectedUid){const instance=auth();await instance.authStateReady();if(!instance.currentUser||(expectedUid&&instance.currentUser.uid!==expectedUid)){const e=Error('กรุณาเข้าสู่ระบบ Google');e.code=401;throw e}const user=instance.currentUser,token=await user.getIdToken();if(instance.currentUser?.uid!==user.uid)throw Error('บัญชีเปลี่ยนแล้ว');return token}

export function observeGoogleAccount(callback){if(!firebaseConfigured){callback(null);return ()=>{}}return onAuthStateChanged(auth(),callback)}

let analyticsAllowed=false,analyticsSdk,analyticsInstance
function clearAnalyticsCookies(){
 const names=document.cookie.split(';').map(x=>x.trim().split('=')[0]).filter(x=>/^(_ga($|_)|_gid$|_gat($|_))/.test(x))
 const parts=location.hostname.split('.'),domains=['',location.hostname,...parts.map((_,i)=>'.'+parts.slice(i).join('.'))]
 for(const name of names)for(const domain of domains)document.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'')
}
export async function setAnalyticsAllowed(allowed){
 analyticsAllowed=allowed
 if(config.measurementId)window['ga-disable-'+config.measurementId]=!allowed
 if(!allowed){if(analyticsInstance)analyticsSdk.setAnalyticsCollectionEnabled(analyticsInstance,false);clearAnalyticsCookies();return}
 if(!import.meta.env.PROD||!firebaseConfigured||!config.measurementId)return
 const sdk=await import('firebase/analytics')
 if(!analyticsAllowed||!await sdk.isSupported()||!analyticsAllowed)return
 analyticsSdk=sdk
 sdk.setConsent({analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})
 analyticsInstance=sdk.getAnalytics(getApps().length?getApp():initializeApp(config))
 sdk.setAnalyticsCollectionEnabled(analyticsInstance,analyticsAllowed)
}
