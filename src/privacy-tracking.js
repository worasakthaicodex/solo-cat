import {privacyChoice,observePrivacy,clearActivityQueue} from './privacy-consent'
import {setAnalyticsAllowed} from './firebase-auth'
import {startMemberActivity} from './member-activity'
import {startGuestActivity,clearGuestActivity} from './guest-activity'
export function startPrivacyTracking(){
 let stopActivity,stopGuest
 function apply(){const allowed=privacyChoice()==='statistics';setAnalyticsAllowed(allowed).catch(()=>{});if(allowed){if(!stopActivity)stopActivity=startMemberActivity();if(!stopGuest)stopGuest=startGuestActivity()}else{stopActivity?.();stopGuest?.();stopActivity=null;stopGuest=null;clearActivityQueue();clearGuestActivity()}}
 apply();return observePrivacy(apply)
}
