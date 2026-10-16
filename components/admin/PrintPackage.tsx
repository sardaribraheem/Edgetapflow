"use client";
import {useEffect,useRef,useState} from 'react';
import type {Order} from '@/lib/data/order';
import {getCurrentUser} from '@/lib/auth';
import {getPrintPackage,preparePrintProof,wizardFromApplication} from '@/lib/application';
import {blankPhysicalCard,DEFAULT_PRINT_SETTINGS,printedWords,printerMessage,printPackageHold,type PrintSettings,type PrintSnapshot} from '@/lib/physical-card';
import {renderPrintFiles,downloadCardFile,clearCardArtworkCache} from '@/lib/card-renderer';
import {uploadPrintFile,getPrivateUploadBlob} from '@/lib/upload-service';
import PhysicalCardControls from '@/components/order/PhysicalCardControls';
import Icon from '@/components/ui/Icon';
import InfoHelp from '@/components/ui/InfoHelp';
import {uploadPreparedArtwork} from '@/lib/card-artwork';
export default function PrintPackage({order,onChanged}:{order:Order;onChanged:()=>Promise<void>}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false),[checked,setChecked]=useState(false);
 const [settings,setSettings]=useState<PrintSettings>(order.printSnapshot?.settings||DEFAULT_PRINT_SETTINGS);
 const [draft,setDraft]=useState(()=>wizardFromApplication({product:order.plan==='direct_link'?'direct_link':order.plan==='profile'?'profile':undefined,directLink:order.directLink,card:{...order.card,size:order.card.size||'',physical:order.card.physical||blankPhysicalCard(order.card.template)},customer:order.customer,profileDraft:{...order.profileDraft,title:order.profileDraft.title||'',bio:order.profileDraft.bio||'',usernameSuggested:order.profileDraft.usernameSuggested||''},deliveryMethod:order.deliveryMethod,payment:{method:'jazzcash'}}));
 const mounted=useRef(true),lock=useRef(false);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;clearCardArtworkCache();};},[]);
 const original=JSON.stringify({physical:order.card.physical,settings:order.printSnapshot?.settings||DEFAULT_PRINT_SETTINGS});
 const changed=JSON.stringify({physical:draft.physical,settings})!==original;
 const snapshot=order.printSnapshot;
 const hold=changed?'Save and review the changed proof first.':printPackageHold(order);
 const editable=['new','paid','profile_created','production_ready'].includes(order.fulfillment.status);
 const canPrepare=order.applicationStatus==='accepted'&&(order.plan==='direct_link'?order.nfcUrl===order.directLink:!!order.profileId)&&!!order.nfcUrl&&['profile_created','production_ready'].includes(order.fulfillment.status);
 const run=async(work:(uid:string)=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const user=await getCurrentUser();if(!user)throw new Error('Sign in as authorized staff.');await work(user.uid);}catch(e){if(mounted.current)setError(e instanceof Error?e.message:'Print package unavailable.');}finally{lock.current=false;if(mounted.current)setBusy(false);}};
 const stillSignedIn=async(uid:string)=>{if(!mounted.current||(await getCurrentUser())?.uid!==uid)throw new Error('Account changed. Reopen this order.');};
 const generate=(proof:boolean)=>{const words=printedWords(draft.physical,draft.displayName||draft.customer.fullName,draft.title);return renderPrintFiles({templateId:draft.cardTemplate,physical:draft.physical,name:words.name,title:words.title,profileUrl:order.nfcUrl,frontSource:draft.physical.preparedFrontSource||draft.customDesignUrl,backSource:draft.physical.preparedBackSource||(draft.physical.standardBack?undefined:draft.physical.backDesignUrl),settings,proof});};
 const save=()=>run(async uid=>{
  if(!checked)throw new Error('Check the artwork and all visible QR codes before saving.');
  const files=await generate(false);await stillSignedIn(uid);
  const [front,back,pdf]=await Promise.all([uploadPrintFile(uid,files.front,'front'),uploadPrintFile(uid,files.back,'back'),uploadPrintFile(uid,files.pdf,'pdf')]);await stillSignedIn(uid);
  const words=printedWords(draft.physical,draft.displayName||draft.customer.fullName,draft.title);
  await preparePrintProof(order,{...draft.physical,printedName:words.name,printedTitle:words.title,useProfileName:false,useProfileTitle:false},settings,{front,back,pdf});await stillSignedIn(uid);await onChanged();
 });
 const download=(face:'front'|'back'|'pdf',proof:boolean)=>run(async uid=>{
  if(proof&&!snapshot){const files=await generate(true);await stillSignedIn(uid);downloadCardFile(files[face],`${order.orderNumber}-draft${face==='pdf'?'':'-'+face}.${face==='pdf'?'pdf':'png'}`);return;}
  const current:PrintSnapshot=proof?snapshot!:await getPrintPackage(order);await stillSignedIn(uid);
  if(changed)throw new Error('Save the revised artwork before downloading its proof.');
  const blob=await getPrivateUploadBlob(face==='front'?current.frontPath:face==='back'?current.backPath:current.pdfPath);await stillSignedIn(uid);
  downloadCardFile(blob,`${order.orderNumber}-r${current.revision}${proof?'-proof':''}${face==='pdf'?'':'-'+face}.${face==='pdf'?'pdf':'png'}`);
 });
 const message=snapshot?printerMessage(order,snapshot,!!hold):'';
 return <section><button type="button" className="btn btn-ghost px-4 py-2" aria-expanded={open} onClick={()=>setOpen(!open)}><Icon name="card" size={18}/>Print package</button>{open&&<div className="print-package-sheet">
  {error&&<p role="alert" className="mb-4 text-sm text-[var(--coral-ink)]">{error}</p>}
  <fieldset disabled={busy} className="min-w-0"><PhysicalCardControls draft={draft} profileUrl={order.nfcUrl} settings={settings} readOnly={!editable} onChange={patch=>{setDraft(d=>({...d,...patch}));setChecked(false);}}/>
  {editable&&order.card.template==='upload'&&<details className="mt-4"><summary className="cursor-pointer text-sm font-bold">Replace prepared artwork</summary><p className="mt-2 text-xs">Upload corrected backgrounds at card proportions. The original uploads remain unchanged; the QR is added in its selected position.</p>{(['front','back'] as const).map(face=><label className="mt-3 block text-sm" key={face}>Prepared {face}<input aria-label={'Prepared '+face+' background'} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)void run(async uid=>{const path=await uploadPreparedArtwork(uid,file);await stillSignedIn(uid);setDraft(d=>({...d,physical:{...d.physical,[face==='front'?'preparedFrontSource':'preparedBackSource']:path}}));setChecked(false);});}} className="mt-2 block w-full"/></label>)}<button type="button" className="mt-3 text-sm underline" onClick={()=>{setDraft(d=>({...d,physical:{...d.physical,preparedFrontSource:undefined,preparedBackSource:undefined}}));setChecked(false);}}>Use original artwork</button></details>}
  <fieldset disabled={!editable}><details className="mt-5"><summary className="cursor-pointer text-sm font-bold">Printer settings</summary><div className="print-settings mt-3"><label>Resolution<select aria-label="Print resolution" value={settings.dpi} onChange={e=>{setSettings(s=>({...s,dpi:Number(e.target.value) as 300|600,confirmed:false}));setChecked(false);}}><option value={300}>300 dpi</option><option value={600}>600 dpi</option></select></label><label>Bleed (mm)<input aria-label="Print bleed" type="number" min={0} max={5} step={.1} value={settings.bleedMm} onChange={e=>{setSettings(s=>({...s,bleedMm:Number(e.target.value),confirmed:false}));setChecked(false);}}/></label><label>Safe area (mm)<input aria-label="Print safe area" type="number" min={2} max={8} step={.1} value={settings.safeMm} onChange={e=>{setSettings(s=>({...s,safeMm:Number(e.target.value),confirmed:false}));setChecked(false);}}/></label><label>Back orientation<select aria-label="Print orientation" value={settings.orientation} onChange={e=>{setSettings(s=>({...s,orientation:e.target.value as PrintSettings['orientation'],confirmed:false}));setChecked(false);}}><option value="long-edge">Upright / long edge</option><option value="short-edge">Rotate back 180° / short edge</option></select></label></div><label className="mt-4 flex gap-3 text-sm"><input type="checkbox" checked={settings.confirmed} onChange={e=>setSettings(s=>({...s,confirmed:e.target.checked}))}/>Printer confirmed these RGB file settings</label><InfoHelp title="Print output"><p>Trim: 85.60 × 53.98 mm. PNG and PDF artwork are RGB. Confirm bleed, resolution, orientation and colour requirements with your printer. CMYK/PDF-X requires their verified conversion; this exporter does not certify it.</p></InfoHelp></details></fieldset>
  {canPrepare&&<><label className="mt-5 flex gap-3 text-sm"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>I checked both faces, spelling, quality and every visible QR. All codes open this card’s confirmed link, or this card intentionally has no QR.</label><button type="button" className="btn btn-ink mt-4 px-4 py-2" disabled={!checked} onClick={()=>{void save();}}>Save front & back proof</button></>}
  <div className="mt-4 flex flex-wrap gap-2"><button type="button" className="btn btn-ghost px-4 py-2" disabled={!!snapshot&&changed} onClick={()=>{void download('pdf',true);}}>Download {snapshot?'saved':'draft'} proof PDF</button></div>
  {snapshot&&<><p className="mt-4 text-sm">Revision {snapshot.revision}{hold?' · '+hold:' · Approved for printing'}</p><textarea aria-label="Printer message" readOnly value={message} className="print-message mt-3"/><div className="mt-3 flex flex-wrap gap-2"><button type="button" className="btn btn-ghost px-4 py-2" disabled={!!hold} onClick={()=>{void run(async uid=>{const latest=await getPrintPackage(order);await stillSignedIn(uid);await navigator.clipboard.writeText(printerMessage(order,latest));setCopied(true);});}}>{copied?'Copied':'Copy printer message'}</button>{(['pdf','front','back'] as const).map(face=><button type="button" key={face} className="btn btn-ghost px-4 py-2" disabled={!!hold} onClick={()=>{void download(face,false);}}>Download {face==='pdf'?'PDF':face==='front'?'front PNG':'back PNG'}</button>)}</div></>}
  </fieldset>{busy&&<p role="status" className="mt-3 text-sm">Preparing private artwork…</p>}
 </div>}</section>;
}
