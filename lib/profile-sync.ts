import type {Profile} from './data/profile';
const fields=['displayName','firstName','lastName','title','bio','location','avatar','logo'] as const;
export function profileMatches(expected:Profile,actual:Profile):boolean{
 if(expected.username!==actual.username||fields.some(key=>(key==='displayName'?(expected[key]||'').trim():expected[key]||'')!==(actual[key]||'')))return false;
 return expected.links.length===actual.links.length&&expected.links.every((link,i)=>['type','label','url','icon','accent'].every(key=>(link[key as keyof typeof link]||'')===(actual.links[i][key as keyof typeof link]||'')));
}
export function notifyProfileChanged(username:string){window.dispatchEvent(new CustomEvent('edgetap-profile-changed',{detail:username}));if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel('edgetap-profiles');channel.postMessage(username);channel.close();}}
