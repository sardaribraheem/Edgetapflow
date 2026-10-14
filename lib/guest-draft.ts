import { applicationPayload, blankApplication, type ApplicationPayload, type WizardDraft } from './application';

// Device-only storage. Never contains passwords, session tokens or payment proof.
const DATABASE='edgetap-device-drafts';
const STORE='drafts';
const KEY='current';
export const GUEST_DRAFT_TTL=7*24*60*60*1000;
export type GuestDraft={id:string;revision:number;updatedAt:number;step:number;cardChosen?:boolean;payload:ApplicationPayload;files:{artwork?:File;avatar?:File};claimEmail?:string;transfer?:{uid:string;artworkPath?:string;avatarUrl?:string}};
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(new Error('Device saving is unavailable in this browser.'));const request=indexedDB.open(DATABASE,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('Device saving is unavailable. Check your browser storage settings.'));});}
export async function readGuestDraft():Promise<GuestDraft|null>{
 const db=await open();
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite'),request=tx.objectStore(STORE).get(KEY);let value:GuestDraft|null=null;request.onsuccess=()=>{const item=request.result as GuestDraft|undefined;if(item&&typeof item.updatedAt==='number'&&Date.now()-item.updatedAt<GUEST_DRAFT_TTL&&item.payload&&item.files){value=item;}else if(item)tx.objectStore(STORE).delete(KEY);};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(new Error('Could not recover this device draft.'));tx.onabort=()=>reject(new Error('Could not recover this device draft.'));});}finally{db.close();}
}
export function localPayload(draft:WizardDraft):ApplicationPayload{
 const payload=applicationPayload(draft);
 payload.profileDraft.usernameSuggested=draft.usernameSuggested;
 delete payload.card.customDesignUrl;delete payload.profileDraft.avatarUrl;
 payload.customer.email='';payload.payment={method:'jazzcash'};
 return payload;
}
export async function writeGuestDraft(value:GuestDraft):Promise<GuestDraft>{
 const db=await open();
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),request=store.get(KEY);let result:GuestDraft;let conflict=false;
 request.onsuccess=()=>{const old=request.result as GuestDraft|undefined;if((old&&(old.id!==value.id||old.revision!==value.revision))||(!old&&value.revision!==0)){conflict=true;tx.abort();return;}result={...value,revision:value.revision+1,updatedAt:Date.now(),step:Math.max(0,Math.min(5,value.step))};result.payload.payment={method:'jazzcash'};store.put(result,KEY);};
 tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(new Error('Could not save on this device. Storage may be full or blocked.'));tx.onabort=()=>reject(new Error(conflict?'This device draft changed in another tab. Reload to recover it.':'Could not save on this device. Storage may be full or blocked.'));});}finally{db.close();}
}
export async function clearGuestDraft(id:string):Promise<void>{const db=await open();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),request=store.get(KEY);request.onsuccess=()=>{if(request.result?.id===id)store.delete(KEY);};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Could not clear the device draft.'));tx.onabort=()=>reject(new Error('Could not clear the device draft.'));});}finally{db.close();}}
export function newGuestDraft():GuestDraft{return {id:crypto.randomUUID(),revision:0,updatedAt:Date.now(),step:0,payload:localPayload(blankApplication('')),files:{}};}
