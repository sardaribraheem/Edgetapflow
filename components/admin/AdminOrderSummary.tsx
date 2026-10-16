"use client";

import Link from 'next/link';
import type { Order } from '@/lib/data/order';
import { CARD_TEMPLATES } from '@/lib/data/order';
import { FULFILLMENT_LABELS, REVIEW_LABELS } from '@/lib/application';
import { isSafeContactUrl } from '@/lib/links';
import { PrivateFile } from '@/components/orders/OrderSummary';
import Icon from '@/components/ui/Icon';

export default function AdminOrderSummary({order:o}:{order:Order}) {
  const delivery = o.deliveryMethod === 'delivery';
  return <section className="admin-order-summary space-y-4 break-words">
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="admin-badge"><Icon name="eye" size={14}/>{REVIEW_LABELS[o.applicationStatus||'']||'Review needed'}</span>
      <span className="admin-badge"><Icon name="receipt" size={14}/>{o.payment.status==='paid'?'Payment verified':o.payment.status==='failed'?'Payment rejected':'Payment pending'}</span>
      <span className="admin-badge"><Icon name="card" size={14}/>{FULFILLMENT_LABELS[o.fulfillment.status]||o.fulfillment.status}</span>
    </div>
    <div className="admin-client-heading"><Icon name="user" size={24}/><div><h3 className="font-display text-xl">{o.customer.fullName}</h3><p className="text-xs text-[var(--ink-soft)]">{new Date(o.createdAt).toLocaleString()}</p></div></div>
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div><dt className="sr-only">Email</dt><dd className="flex items-start gap-2"><Icon name="mail" size={16}/><span>{o.customer.email}</span></dd></div>
      <div><dt className="sr-only">Phone</dt><dd className="flex items-start gap-2"><Icon name="phone" size={16}/><span>{o.customer.phone}</span></dd></div>
      <div><dt className="font-bold">Card</dt><dd>{CARD_TEMPLATES.find(t=>t.id===o.card.template)?.name||o.card.template} × {o.card.quantity}</dd><dd className="text-xs text-[var(--ink-soft)]">{o.approvedCardSize ? 'Specification confirmed' : 'Specification pending'}</dd></div>
      <div><dt className="font-bold">Card payment</dt><dd>Rs. {o.subtotal.toLocaleString()} · JazzCash</dd>{o.payment.reference&&<dd className="text-xs">Reference: {o.payment.reference}</dd>}</div>
      <div className="sm:col-span-2"><dt className="flex items-center gap-2 font-bold"><Icon name={delivery?'truck':'pin'} size={16}/>{delivery?'Delivery':'NASTP pickup'}</dt>{delivery&&<dd>{o.customer.address}, {o.customer.city} {o.customer.postalCode}</dd>}<dd className="text-xs text-[var(--ink-soft)]">{!delivery?'Collect when ready':o.deliveryPaymentRecipient==='rider_direct'?(o.riderFee==null?'Fare extra · paid to rider':'Rs. '+o.riderFee.toLocaleString()+' · paid to rider'):(o.deliveryFee==null?'Delivery fee pending':'Delivery fee: Rs. '+o.deliveryFee.toLocaleString())}</dd></div>
    </dl>
    {o.plan==='direct_link'?<div className="text-sm"><strong>Link Card</strong><p className="break-all">{o.directLink}</p></div>:<details className="admin-details"><summary><Icon name="user" size={18}/>Profile & links<span className="ml-auto text-xs">{o.profileDraft.links.length}</span></summary><div className="space-y-3 p-4 text-sm"><p className="font-bold">{o.profileDraft.displayName}</p>{o.profileDraft.title&&<p>{o.profileDraft.title}</p>}{o.profileDraft.bio&&<p className="whitespace-pre-wrap">{o.profileDraft.bio}</p>}<p>Suggested handle: /u/{o.profileDraft.usernameSuggested||'Staff will confirm'}</p><ul className="flex flex-wrap gap-2">{o.profileDraft.links.map((l,i)=><li key={i}>{isSafeContactUrl(l.url)?<a className="admin-badge underline" href={l.url} target={/^https?:/i.test(l.url)?'_blank':undefined} rel="noreferrer">{l.label}</a>:<span>{l.label} · Invalid link</span>}</li>)}</ul><p className="text-xs">Requested: {o.card.template} · {o.card.size}</p>{o.approvedCardSize&&<p className="text-xs">Approved: {o.approvedCardTemplate} · {o.approvedCardSize}</p>}</div></details>}
    {o.customerNotes&&<p className="rounded-xl bg-white p-3 text-sm whitespace-pre-wrap"><strong>Customer note: </strong>{o.customerNotes}</p>}
    {o.payment.receiptUrl&&<PrivateFile key={o.payment.receiptUrl} path={o.payment.receiptUrl} label="receipt"/>}
    {o.card.customDesignUrl&&<PrivateFile key={o.card.customDesignUrl} path={o.card.customDesignUrl} label="original artwork"/>}
    {o.card.physical?.backDesignUrl&&!o.card.physical.standardBack&&<PrivateFile key={o.card.physical.backDesignUrl} path={o.card.physical.backDesignUrl} label="original back artwork"/>}
    {o.preparedArtworkUrl&&<PrivateFile key={o.preparedArtworkUrl} path={o.preparedArtworkUrl} label="prepared artwork"/>}
    {o.nfcUrl&&o.usernameFinal&&<Link href={'/u/'+encodeURIComponent(o.usernameFinal)} target="_blank" className="admin-badge underline"><Icon name="eye" size={18}/>Open /u/{o.usernameFinal}</Link>}
    {!!o.events?.length&&<details className="admin-details"><summary><Icon name="receipt" size={18}/>Order history<span className="ml-auto text-xs">{o.events.length}</span></summary><ol className="space-y-3 p-4 text-sm">{o.events.map(e=><li key={e.id}><strong>{REVIEW_LABELS[e.kind]||FULFILLMENT_LABELS[e.kind]||e.kind.replaceAll('_',' ')}</strong><time className="ml-2 text-xs">{new Date(e.at).toLocaleString()}</time>{e.message&&<p className="mt-1 whitespace-pre-wrap">{e.message}</p>}</li>)}</ol></details>}
  </section>;
}
