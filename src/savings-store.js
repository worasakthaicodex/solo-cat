import {flushDomainWrites,refreshDomainState} from './persistent-state'
import {updateSavings} from './savings'
export async function saveSavings(entry,deleteId){
 await flushDomainWrites()
 await SoloStore.mutateState('domain:savings:entries',rows=>updateSavings(rows,entry,deleteId),[])
 await refreshDomainState()
 if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel('solo-domains');channel.postMessage('savings:entries');channel.close()}
 return true
}
