"use client";
import {useEffect,useState} from 'react';
import type {Order} from '@/lib/data/order';
import {REVIEW_LABELS,FULFILLMENT_LABELS} from '@/lib/application';
import {qrDataUrl} from '@/lib/qr';
import AdminOrderSummary from './AdminOrderSummary';
import PublishProfileModal from './PublishProfileModal';
import StaffOrderControls from './StaffOrderControls';
import Icon from '@/components/ui/Icon';

export default function OrdersView({orders,onChanged,initialOrderId=''}:{orders:Order[];onChanged:()=>Promise<void>;initialOrderId?:string}){
 const [selected,setSelected]=useState(initialOrderId),[query,setQuery]=useState(''),[filter,setFilter]=useState('all');
 const [error,setError]=useState(''),[publish,setPublish]=useState<Order|null>(null),[qr,setQr]=useState({url:'',value:''});
 const current=orders.find(o=>o.id===selected);
 const nfcUrl=current?.nfcUrl;
 useEffect(()=>{let active=true;if(nfcUrl)void qrDataUrl(nfcUrl).then(v=>{if(active)setQr({url:nfcUrl,value:v});}).catch(()=>{if(active)setError('QR generation failed.');});return()=>{active=false;};},[nfcUrl]);
 const filtered=orders.filter(o=>(filter==='all'||o.applicationStatus===filter||o.fulfillment.status===filter)&&(!query||[o.orderNumber,o.customer.fullName,o.customer.email,o.profileDraft.usernameSuggested].some(v=>(v||'').toLowerCase().includes(query.toLowerCase()))));
 return <div><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-2xl">Applications & orders</h1><p className="mt-2 text-sm">{orders.length} orders · Auto refresh</p></div><button onClick={onChanged} className="btn btn-ghost px-4 py-2"><Icon name="refresh" size={18}/>Refresh inbox</button></div>
  {error&&<p role="alert" className="mt-4 rounded-xl bg-[var(--coral)]/10 p-4">{error}</p>}
  <div className="mt-5 flex flex-wrap gap-3"><input aria-label="Search applications" placeholder="Customer, email, order or handle" value={query} onChange={e=>setQuery(e.target.value)} className="min-w-0 flex-1 rounded-xl border bg-white p-3"/><select aria-label="Filter applications" value={filter} onChange={e=>setFilter(e.target.value)} className="max-w-full rounded-xl border bg-white p-3"><option value="all">All applications</option>{Object.entries(REVIEW_LABELS).map(([key,label])=><option key={key} value={key}>{label}</option>)}{['printing','ready_for_pickup','ready_to_ship','shipped','delivered','picked_up','completed'].map(key=><option key={key} value={key}>{FULFILLMENT_LABELS[key]}</option>)}</select></div>
  <div className="admin-orders-grid"><ul className="admin-order-list space-y-3">{filtered.map(o=><li key={o.id}><button onClick={()=>{setSelected(o.id||'');setError('');requestAnimationFrame(()=>document.getElementById('selected-order')?.scrollIntoView({block:'start',behavior:'smooth'}));}} className={'card-paper w-full p-4 text-left '+(selected===o.id?'ring-2 ring-[var(--ink)]':'')}><div className="flex items-start justify-between gap-3"><div><p className="font-display font-bold">{o.customer.fullName}</p><p className="mt-1 text-xs text-[var(--ink-soft)]">{o.orderNumber}</p></div><Icon name={o.deliveryMethod==='delivery'?'truck':'pin'} size={20}/></div><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="admin-badge">{REVIEW_LABELS[o.applicationStatus||'']||'Review needed'}</span><span className="admin-badge"><Icon name={o.payment.status==='paid'?'check':'receipt'} size={14}/>{o.payment.status==='paid'?'Paid':o.payment.status==='failed'?'Rejected':'Payment pending'}</span></div><p className="mt-3 text-xs text-[var(--ink-soft)]">{o.productQuote?(o.productQuote.selection.hardware==='none'?'Digital profile service':o.card.quantity+' NFC '+o.productQuote.selection.hardware+(o.card.quantity>1?'s':'')):o.card.quantity+' card'+(o.card.quantity>1?'s':'')} · Rs. {(o.productQuote?.total??o.subtotal).toLocaleString("en",{useGrouping:false})} · {new Date(o.createdAt).toLocaleDateString()}</p></button></li>)}{!filtered.length&&<li className="card-paper p-6">No applications match.</li>}</ul>
  <article id="selected-order" data-order-id={current?.id} data-order-version={current?.version} className="card-paper min-w-0 scroll-mt-5 p-5 sm:p-7">{current?<><h2 className="mb-5 font-display text-xl">{current.orderNumber}</h2>
   <StaffOrderControls key={current.id} summary={<AdminOrderSummary order={current}/>} order={current} onChanged={onChanged} onPublish={()=>setPublish(current)} qr={qr.url===current.nfcUrl?qr.value:""}/>
  </>:<p>Select an order to review.</p>}</article></div>
  {publish&&<PublishProfileModal order={publish} onClose={()=>setPublish(null)} onDone={async()=>{await onChanged();setPublish(null);}}/>}
 </div>;
}
