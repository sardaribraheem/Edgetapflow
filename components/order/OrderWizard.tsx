"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged, type User } from '@/lib/auth';
import { usesSupabase } from '@/lib/backend';
import { deliverOrderNotifications, applicationPayload, suggestProfileHandle, blankApplication, getMyApplications, getMyOrders, getOrderSettings, supportsCardEditor, supportsProofReview, isOrderingUnavailable, saveApplicationDraft, submitApplication, wizardFromApplication, type OrderSettings, type WizardDraft } from '@/lib/application';
import { uploadCustomDesign, uploadPaymentReceipt, uploadPublicAvatar } from '@/lib/upload-service';
import { isSafeContactUrl } from '@/lib/links';
import { calculateSubtotal } from '@/lib/data/order';
import type { Profile } from '@/lib/data/profile';
import { CardStep, ProfileStep, LinksStep, PreviewStep, DeliveryStep } from './OrderSteps';
import { OrderProgress, OrderNotes } from './OrderChrome';
import { OrderInformation, OrderHelp as InfoHelp } from './OrderInformation';
import PaymentStep from './PaymentStep';
import { SUPPORT_URL } from '@/lib/site';
import { findOrderSubmission } from '@/lib/data-service';
import GuestOrderWizard from './GuestOrderWizard';
import DirectLinkStep from './DirectLinkStep';
import {directLinkError} from '@/lib/nfc-link';
import {physicalCardError} from '@/lib/physical-card';
import {clearCardArtworkCache} from '@/lib/card-renderer';

const STEPS=['Card','Profile','Links','Profile preview','Fulfillment','Payment','Submit'];
export default function OrderWizard(){
 const [user,setUser]=useState<User|null>(null),[checked,setChecked]=useState(false),[cloudId,setCloudId]=useState('');
 useEffect(()=>onAuthStateChanged(auth,value=>{setCloudId(new URLSearchParams(window.location.search).get('draft')||'');setUser(value);setChecked(true);}),[]);
 const onCloudReady=useCallback((id:string)=>setCloudId(id),[]);
 if(!checked)return <main className="min-h-screen px-4 py-28"><p role="status">Opening your card builder…</p></main>;
 if(!usesSupabase)return <main className="min-h-screen px-4 py-28">Applications require the configured Supabase backend.</main>;
 return cloudId?<CloudOrderWizard/>:<GuestOrderWizard user={user} onCloudReady={onCloudReady}/>;
}
function CloudOrderWizard(){
 const router=useRouter();
 const [savedOnce,setSavedOnce]=useState(false);
 const [user,setUser]=useState<User|null>(null),[authReady,setAuthReady]=useState(false);
 const [ready,setReady]=useState(false),[draft,setDraft]=useState<WizardDraft>(blankApplication('')),[step,setStep]=useState(0);
 const [settings,setSettings]=useState<OrderSettings|null>(null),[error,setError]=useState(''),[saveError,setSaveError]=useState('');
 const [saving,setSaving]=useState(false),[dirty,setDirty]=useState(false),[uploading,setUploading]=useState(false),[submitting,setSubmitting]=useState(false);
 const [navigating,setNavigating]=useState(false);
 const navigationLock=useRef(false);
 const meta=useRef({id:'',version:0,uid:''}),latest=useRef({draft,step}),chain=useRef<Promise<unknown>>(Promise.resolve()),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),lock=useRef(false);
 const accountUid=useRef<string|undefined>(undefined);
 useEffect(()=>{latest.current={draft,step};},[draft,step]);
 useEffect(()=>onAuthStateChanged(auth,u=>{if(accountUid.current!==u?.uid){meta.current={id:'',version:0,uid:u?.uid||''};if(timer.current)clearTimeout(timer.current);setSaving(false);setUploading(false);setReady(false);clearCardArtworkCache();setDraft(blankApplication(u?.email||''));setStep(0);setDirty(false);setSavedOnce(false);setSaveError('');setError('');accountUid.current=u?.uid;}setUser(u);setAuthReady(true);}),[]);
 useEffect(()=>{
  if(!user||!usesSupabase)return;
  let active=true;
  void Promise.all([getMyApplications(),getOrderSettings(),getMyOrders()]).then(([apps,config,orders])=>{
   if(!active)return;
   const requested=new URLSearchParams(window.location.search).get('draft');
   const fresh=new URLSearchParams(window.location.search).get('new')==='true';
   const saved=requested?apps.find(a=>a.id===requested):fresh?undefined:apps[0];
   if(requested&&!saved)throw new Error('This draft is unavailable. View your submitted applications on My orders.');
   meta.current={id:saved?.id||crypto.randomUUID(),version:saved?.version||0,uid:user.uid};
   setDraft(saved?{...wizardFromApplication(saved.payload),...(!saved.orderId||orders.find(o=>o.id===saved.orderId)?.plan==='profile'?{product:saved.payload.product||'profile',physical:{...wizardFromApplication(saved.payload).physical,schemaVersion:2 as const}}:{})}:{...blankApplication(user.email||''),size:config.cardSizes[0]});setStep(saved?.step||0);setSavedOnce(!!saved);setSettings(config);setReady(true);
  }).catch(e=>{if(active)setError(isOrderingUnavailable(e)?'You are signed in, but saved applications are temporarily unavailable. Try again later or contact EdgeTap.':e.message==='This draft is unavailable. View your submitted applications on My orders.'?e.message:'Could not recover your application. Reload to try again.');});
  return()=>{active=false;};
  // Token refresh must not overwrite unsaved fields.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[user?.uid]);
 const flush=useCallback(()=>{
  if(timer.current)clearTimeout(timer.current);
  const snapshot=latest.current,payload=applicationPayload(snapshot.draft),target=meta.current;
  const work=chain.current.catch(()=>{}).then(async()=>{
   if(target!==meta.current||target.uid!==accountUid.current)throw new Error('Account changed; reopen your own saved application.');
   setSaving(true);
   try{
    const saved=await saveApplicationDraft(target.id,payload,snapshot.step,target.version);
    target.version=saved.version;if(target!==meta.current)return;setSaveError('');setSavedOnce(true);
    window.history.replaceState(null,'','/order?draft='+target.id);
    if(JSON.stringify(applicationPayload(latest.current.draft))===JSON.stringify(payload)&&latest.current.step===snapshot.step)setDirty(false);
   }catch(e){if(target===meta.current)setSaveError(e instanceof Error?e.message:'Draft could not be saved.');throw e;}
   finally{if(target===meta.current)setSaving(false);}
  });chain.current=work;return work;
 },[]);
 useEffect(()=>{
  if(!ready||!dirty||uploading||submitting)return;
  timer.current=setTimeout(()=>{void flush().catch(()=>{});},600);
  return()=>{if(timer.current)clearTimeout(timer.current);};
 },[draft,step,dirty,ready,uploading,submitting,flush]);
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty||saving||uploading){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty,saving,uploading]);
 const patch=(p:Partial<WizardDraft>)=>{setDraft(d=>({...d,...p,...(p.displayName!==undefined&&d.product!=='direct_link'?{customer:{...d.customer,fullName:p.displayName}}:{})}));setDirty(true);setError('');};
 const upload=async(kind:'avatar'|'logo'|'artwork'|'backArtwork'|'receipt',file:File|null)=>{
  if(!user)return;if(!file){setDraft(d=>{if(kind==='logo'){const physical={...d.physical};delete physical.logoUrl;return {...d,physical,logoPreview:undefined};}if(kind==='receipt')return {...d,payment:{...d.payment,receiptUrl:undefined}};if(kind==='artwork')return {...d,customDesignUrl:undefined,customDesignPreview:undefined};if(kind==='backArtwork')return {...d,backDesignPreview:undefined,physical:{...d.physical,standardBack:false,backDesignUrl:undefined}};return {...d,avatarUrl:undefined,avatarPreview:undefined};});setDirty(true);return;}
  const uploadUid=user.uid;const uploadDraft=meta.current;setUploading(true);setError('');
  try{
   const path=(kind==='avatar'||kind==='logo')?await uploadPublicAvatar(user.uid,file):(kind==='artwork'||kind==='backArtwork')?await uploadCustomDesign(user.uid,file):await uploadPaymentReceipt(user.uid,file);
   if(accountUid.current!==uploadUid||meta.current!==uploadDraft)return;
   setDraft(d=>({...d,...(kind==='avatar'?{avatarUrl:path,avatarUploadPending:false}:kind==='logo'?{physical:{...d.physical,logoUrl:path},logoUploadPending:false}:kind==='artwork'?{customDesignUrl:path}:kind==='backArtwork'?{physical:{...d.physical,standardBack:false,backDesignUrl:path}}:{payment:{...d.payment,receiptUrl:path}})}));setDirty(true);
  }catch(e){if(accountUid.current===uploadUid)setError(e instanceof Error?e.message:'Upload failed.');throw e;}
  finally{setUploading(false);}
 };
 const preview=useMemo<Profile>(()=>({username:draft.usernameSuggested||suggestProfileHandle(draft.displayName)||'yourprofile',displayName:draft.displayName||'Your Name',firstName:draft.customer.fullName.split(' ')[0]||'',lastName:'',title:draft.title,bio:draft.bio,location:draft.location||'',avatar:draft.avatarPreview||draft.avatarUrl||'',logo:draft.logoPreview||draft.physical.logoUrl,links:draft.links.filter(l=>isSafeContactUrl(l.url))}),[draft]);
 const direct=draft.product==='direct_link',sequence=direct?[2,0,1,3,4,5,6]:[0,1,2,3,4,5,6],position=sequence.indexOf(step),steps=direct?['Link','Card','Details','Review','Fulfillment','Payment','Submit']:STEPS;
 const offerAvailable=(settings?.checkoutVersion||0)>=2&&(!draft.product||settings?.offerPrices?.[draft.product]===({direct_link:999,profile:1499})[draft.product])&&supportsCardEditor(settings,draft)&&supportsProofReview(settings,draft);
 const validate=(s:number)=>{
  if(s===1&&!draft.displayName.trim())return 'Add a name or main heading.';
  if(direct&&s===2)return directLinkError(draft.directLink||'');
  if(s===5&&!offerAvailable)return 'This offer is temporarily unavailable for payment. Contact EdgeTap.';
  if(s===0||s===3){const problem=physicalCardError(draft.physical,draft.cardTemplate,draft.customDesignUrl);if(problem)return problem;}
  if(s===0&&(!draft.size.trim()||(draft.cardTemplate==='upload'&&(!draft.customDesignUrl||draft.customDesignUrl==='pending'))))return 'Use the standard card size and upload your artwork if using your own design.';
  if(!direct&&s===1&&(!draft.displayName.trim()||(!!draft.usernameSuggested&&(!/^[a-z0-9._-]{1,30}$/.test(draft.usernameSuggested)||['.','..'].includes(draft.usernameSuggested)))))return 'Add your name. If requesting a handle, use letters, numbers, dots, hyphens or underscores.';
  if(!direct&&s===2&&(!draft.links.length||draft.links.some(l=>!isSafeContactUrl(l.url))))return 'Add complete contact links before continuing.';
  if(s===4&&(!draft.customer.fullName.trim()||!/^\+?[\d ()-]{7,30}$/.test(draft.customer.phone)||(draft.deliveryMethod==='delivery'&&(!draft.customer.address.trim()||!draft.customer.city?.trim()))))return 'Enter your name, phone and delivery address/city where applicable.';
  if(s===5&&!draft.payment.receiptUrl)return 'Upload your private JazzCash payment proof before submitting.';
  return '';
 };
 const move=async(next:number)=>{
  if(uploading||submitting||lock.current||navigationLock.current)return;
  const invalid=sequence.indexOf(next)>position?validate(step):'';if(invalid)return setError(invalid);
  navigationLock.current=true;setNavigating(true);
  const navigatingDraft=meta.current;
  try{await flush();if(navigatingDraft!==meta.current)return;setStep(next);setDirty(true);setError('');}catch{setError('Save your draft or reload to resolve the save error before continuing.');}
  finally{navigationLock.current=false;setNavigating(false);}
 };
 const submit=async()=>{
  if(lock.current||uploading)return;
  const invalid=sequence.filter(s=>s<6).map(validate).find(Boolean);if(invalid)return setError(invalid);
  const submittingDraft=meta.current;lock.current=true;setSubmitting(true);setError('');
  try{
   // Reconcile a committed submission before attempting another write.
   const editable=(await getMyApplications()).some(a=>a.id===meta.current.id);
   if(submittingDraft!==meta.current)throw new Error('Account changed; reopen your own application.');
   if(!editable){
    const received=await findOrderSubmission(meta.current.id);
    if(received&&submittingDraft===meta.current){router.push('/order/thank-you?order='+encodeURIComponent(received.id));return;}
    throw new Error('Application changed; reload your saved draft before submitting.');
   }
   await flush();if(submittingDraft!==meta.current)throw new Error('Account changed; reopen your own application.');const id=await submitApplication(submittingDraft.id,submittingDraft.version);if(submittingDraft!==meta.current)return;void deliverOrderNotifications({id} as import('@/lib/data/order').Order).catch(()=>{});router.push('/order/thank-you?order='+encodeURIComponent(id));
  }
  catch(e){setError((e instanceof Error?e.message:'Submission could not be confirmed.')+' Check My orders before paying again; retry uses this same application.');}
  finally{lock.current=false;setSubmitting(false);}
 };
 if(!authReady)return <main className="min-h-screen p-8 pt-28">Checking your account…</main>;
 if(!usesSupabase)return <main className="min-h-screen p-8 pt-28">Applications require the configured Supabase backend.</main>;
 if(!user)return <main className="min-h-screen bg-[var(--cream)] px-4 py-28"><section className="card-paper mx-auto max-w-xl p-8"><h1 className="font-display text-3xl">Resume your saved application</h1><p className="mt-4">This link opens a private account draft. Sign in to My orders and choose your saved application.</p><Link className="btn btn-ink mt-6 px-5 py-3" href="/account?next=/account/orders">Sign in to My orders</Link><p className="mt-4">Building a new card? <Link href="/pricing" className="underline">Choose a plan and start without an account</Link>.</p></section></main>;
 if(!ready||!settings)return <main className="min-h-screen px-4 py-28"><section className="card-paper mx-auto max-w-xl p-8"><p role={error?'alert':'status'}>{error||'Recovering your saved application…'}</p>{error&&<button className="btn btn-ink mt-4 px-5 py-3" onClick={()=>window.location.reload()}>Reload</button>}<Link href="/account/orders" className="block mt-4 underline">My orders</Link></section></main>;
 return <main className="order-builder min-h-screen bg-[var(--cream)] px-4 py-10 sm:py-14"><div className="mx-auto max-w-3xl">
  <div className="mb-6 flex flex-wrap justify-between gap-3"><Link href="/" className="font-display font-bold">EdgeTap</Link><Link href="/account/orders" className="underline">My orders & applications</Link></div>
  <div className="builder-heading"><OrderProgress steps={[...steps.slice(0,5),direct?'Save order':'Save profile',...steps.slice(5)]} step={position+(position>=5?1:0)}/></div>

  {saveError&&<div role="alert" className="mb-4 rounded-xl bg-[var(--coral)]/10 p-4"><p>Draft save failed: {saveError}</p><p>Do not close this page until saving succeeds. If another session changed this draft, reload to recover the saved version.</p><button className="mt-2 underline" onClick={()=>window.location.reload()}>Reload saved draft</button></div>}
  {error&&<p role="alert" className="mb-4 rounded-xl bg-[var(--coral)]/10 p-4">{error}</p>}
  <fieldset disabled={submitting||uploading} className="min-w-0"><OrderInformation>
   {step===0&&<CardStep draft={draft} onChange={patch} onFileChange={(f,face)=>upload(face==='back'?'backArtwork':'artwork',f)}/>}
   {step===1&&<ProfileStep draft={draft} onChange={patch} onFileChange={f=>upload('avatar',f)} onLogoChange={f=>upload('logo',f)}/>}
   {step===2&&(direct?<DirectLinkStep draft={draft} onChange={patch}/>:<LinksStep links={draft.links} onChange={links=>patch({links})}/>)}
   {step===3&&<PreviewStep profile={preview} draft={draft} onChange={patch}/>}
   {step===4&&<DeliveryStep collectName={direct} customer={draft.customer} deliveryMethod={draft.deliveryMethod} pickupDetails={settings.pickupDetails} deliveryDetails={settings.deliveryDetails} onDeliveryMethodChange={deliveryMethod=>patch({deliveryMethod,customer:{...draft.customer,...(deliveryMethod==='nastp_pickup'?{address:'',city:'',postalCode:''}:{})}})} onChange={customer=>patch({customer:{...customer,email:user.email||''}})}/>}
   {step===5&&!offerAvailable&&<p role="alert" className="card-paper p-6">This offer is temporarily unavailable for payment. Your design is saved. Contact EdgeTap.</p>}{step===5&&offerAvailable&&<PaymentStep draft={draft} onChange={patch} onFile={file=>upload('receipt',file)}/>}
   {step===6&&<section className="card-paper mb-6 p-7 sm:p-10"><h1 className="font-display text-3xl">Submit your application</h1><dl className="mt-5 space-y-2"><div>Name: {draft.customer.fullName}</div>{direct?<div className="break-all">Link: {draft.directLink}</div>:<div>Profile: /u/{draft.usernameSuggested||suggestProfileHandle(draft.displayName)}</div>}<div>Card: {draft.cardTemplate} · {draft.size} · {draft.quantity}</div><div>Fulfillment: {draft.deliveryMethod==='nastp_pickup'?'NASTP Pickup':'Delivery'}</div><div>Payment: {draft.payment.method==='bank'?'Meezan Bank':draft.payment.method==='easypaisa'?'Easypaisa':'JazzCash'} · awaiting verification</div><div>Card subtotal: Rs. {calculateSubtotal(draft.quantity,draft.product||'standard',draft.links.length).toLocaleString()}</div>{draft.deliveryMethod==='delivery'&&<div className="font-bold">Delivery is extra and paid directly to the rider. It is not included in the card subtotal. The fare is provided when EdgeTap books the rider.</div>}</dl><label className="mt-5 block font-bold">Customer notes<textarea aria-label="Customer notes" value={draft.customerNotes} maxLength={2000} onChange={e=>patch({customerNotes:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/></label><p className="mt-4 text-sm">Payment awaits staff verification. Follow progress in My orders.</p><InfoHelp title="After you submit" label="What happens next?"><p>Submitting sends the saved application to the EdgeTap staff inbox. It does not confirm payment, acceptance, production or dispatch. Follow decisions and requests on My orders.</p></InfoHelp><button type="button" onClick={()=>{void submit();}} disabled={submitting||uploading} className="btn btn-ink mt-6 px-6 py-3">{submitting?'Submitting…':'Submit application'}</button></section>}
   <div className="order-navigation flex justify-between gap-3">{position>0?<button type="button" disabled={navigating} className="btn btn-ghost px-5 py-3" onClick={()=>{void move(sequence[position-1]);}}>← Back</button>:<span/>}{step<6&&<button type="button" disabled={navigating} className="btn btn-ink px-5 py-3" onClick={()=>{void move(sequence[position+1]);}}>Continue →</button>}</div>
   <OrderNotes/></OrderInformation></fieldset>{uploading&&<p role="status" className="mt-4">Uploading securely. Wait until the upload and draft save finish.</p>}
 </div></main>;
}
