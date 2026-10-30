"use client";

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import type {User} from '@/lib/auth';
import {NfcWaves,SparkleDoodle} from '@/components/doodles';
import {getOrders,listReviews} from '@/lib/data-service';
import type {Order} from '@/lib/data/order';
import type {Review} from '@/lib/models';
import {orderCustomerKey} from '@/lib/admin-account';
import {getBackupOverview,type BackupOverview,type BackupScope} from '@/lib/admin-backup';
import OrdersView from './OrdersView';
import ProfilesView from './ProfilesView';
import OrderSettingsPanel from './OrderSettings';
import ProfilePlanSettings from './ProfilePlanSettings';
import ProductCatalogSettings from './ProductCatalogSettings';
import PricingSettings from './PricingSettings';
import BackupTools,{ExportBackupDialog} from './BackupTools';
import Icon,{type IconName} from '@/components/ui/Icon';
import InfoHelp from '@/components/ui/InfoHelp';
import DefaultAvatar from '@/components/ui/DefaultAvatar';

export type AdminView='dashboard'|'orders'|'clients'|'profiles'|'reviews'|'pricing'|'backups'|'settings';
const VIEWS:{id:AdminView;label:string;icon:IconName;group:string}[]=[
 {id:'dashboard',label:'Dashboard',icon:'eye',group:'Workspace'},
 {id:'orders',label:'Orders',icon:'card',group:'Workspace'},
 {id:'clients',label:'Clients',icon:'user',group:'Workspace'},
 {id:'profiles',label:'Profiles',icon:'avatar',group:'Workspace'},
 {id:'reviews',label:'Reviews',icon:'star',group:'Workspace'},
 {id:'pricing',label:'Pricing',icon:'receipt',group:'Manage'},
 {id:'backups',label:'Data & backups',icon:'save',group:'Manage'},
 {id:'settings',label:'Settings',icon:'shield',group:'Manage'},
];
function initialRoute(){
 if(typeof window==='undefined')return {view:'dashboard' as AdminView,order:''};
 const params=new URLSearchParams(window.location.search),value=params.get('view');
 const candidate=params.get('order')||'',order=/^[a-zA-Z0-9_-]{1,128}$/.test(candidate)?candidate:'';
 return {view:order?'orders' as AdminView:VIEWS.find(v=>v.id===value)?.id||'dashboard',order};
}
function AdminNavigation({view,count,onNavigate}:{view:AdminView;count:number;onNavigate:(id:AdminView)=>void}){
 return <nav aria-label="Admin sections">{['Workspace','Manage'].map(group=><div className="admin-nav-group" key={group}><p className="admin-nav-label">{group}</p>{VIEWS.filter(v=>v.group===group).map(v=><button type="button" key={v.id} onClick={()=>onNavigate(v.id)} className="admin-nav-button" aria-current={view===v.id?'page':undefined}><Icon name={v.icon} size={18}/><span>{v.label}</span>{v.id==='orders'&&count>0&&<span className="admin-nav-count">{count}</span>}</button>)}</div>)}</nav>;
}
function Brand(){return <Link href="/" className="admin-brand"><span className="admin-brand-mark"><NfcWaves className="h-5 w-5"/></span><span className="font-display font-bold">EdgeTap <span className="font-normal opacity-60">Admin</span></span></Link>;}

export default function AdminApp({user,onLogout}:{user:User;onLogout:()=>void}){
 const [initial]=useState(initialRoute),[view,setView]=useState<AdminView>(initial.view),[selectedOrder,setSelectedOrder]=useState(initial.order);
 const [orders,setOrders]=useState<Order[]>([]),[reviews,setReviews]=useState<Review[]>([]),[overview,setOverview]=useState<BackupOverview|null>(null);
 const [loadError,setLoadError]=useState(''),[loadedOnce,setLoadedOnce]=useState(false),[refreshing,setRefreshing]=useState(false);
 const [commandQuery,setCommandQuery]=useState(''),[exportScope,setExportScope]=useState<BackupScope|null>(null);
 const menu=useRef<HTMLDialogElement>(null),command=useRef<HTMLDialogElement>(null),search=useRef<HTMLInputElement>(null);
 const refreshLock=useRef(false);
 const applyData=(o:Order[],r:Review[])=>{setOrders(current=>o.map(next=>{const known=current.find(row=>row.id===next.id);return known&&Number(known.version)>Number(next.version)?known:next;}));setReviews(r);setLoadError('');};
 const failData=(error:unknown)=>{setLoadError(error instanceof Error?error.message:'Could not load service data. Check staff access and retry.');};
 async function refresh(){
  if(refreshLock.current)return;refreshLock.current=true;setRefreshing(true);
  try{const [o,r]=await Promise.all([getOrders(),listReviews(20)]);applyData(o,r);void getBackupOverview().then(setOverview).catch(()=>{});}
  catch(error){failData(error);}finally{setLoadedOnce(true);setRefreshing(false);refreshLock.current=false;}
 }
 useEffect(()=>{let active=true;void Promise.all([getOrders(),listReviews(20)]).then(([o,r])=>{if(active)applyData(o,r);}).catch(error=>{if(active)failData(error);}).finally(()=>{if(active)setLoadedOnce(true);});void getBackupOverview().then(value=>{if(active)setOverview(value);}).catch(()=>{});return()=>{active=false;};},[]);
 useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},20000);const focus=()=>{void refresh();};window.addEventListener('focus',focus);return()=>{clearInterval(timer);window.removeEventListener('focus',focus);};
 // These handlers use account-scoped calls and state setters only.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{const pop=()=>{const route=initialRoute();setView(route.view);setSelectedOrder(route.order);};const shortcut=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();menu.current?.close();if(command.current?.open)command.current.close();else{setCommandQuery('');command.current?.showModal();search.current?.focus();}}};window.addEventListener('popstate',pop);window.addEventListener('keydown',shortcut);return()=>{window.removeEventListener('popstate',pop);window.removeEventListener('keydown',shortcut);};},[]);
 function navigate(id:AdminView,order?:string){
  setView(id);if(order!==undefined)setSelectedOrder(order);menu.current?.close();command.current?.close();
  const url=new URL(window.location.href);url.searchParams.set('view',id);url.searchParams.delete('order');if(id==='orders'&&(order||selectedOrder))url.searchParams.set('order',order||selectedOrder);window.history.pushState({},'',url.pathname+url.search);window.scrollTo({top:0});
 }
 const pending=orders.filter(o=>['submitted','under_review','changes_required'].includes(o.applicationStatus||'')).length;
 const current=VIEWS.find(v=>v.id===view)!;
 const normalized=commandQuery.toLowerCase().trim();
 const foundSections=VIEWS.filter(v=>!normalized||v.label.toLowerCase().includes(normalized));
 const foundOrders=normalized?orders.filter(o=>[o.orderNumber,o.customer.fullName,o.customer.email,o.profileDraft.usernameSuggested].some(v=>v?.toLowerCase().includes(normalized))).slice(0,8):[];
 const navigation=<AdminNavigation view={view} count={pending} onNavigate={navigate}/>;
 return <div className="admin-workspace"><a href="#admin-content" className="admin-skip-link">Skip to admin content</a>
  <aside className="admin-sidebar"><Brand/>{navigation}<div className="admin-sidebar-footer"><Link href="/u/ibraheem" target="_blank" className="admin-site-link"><Icon name="link" size={16}/>View live profile</Link><p className="admin-signed-in" title={user.email||''}>{user.email}</p><button type="button" onClick={onLogout} className="admin-sign-out">Sign Out</button></div></aside>
  <div className="admin-main-shell"><header className="admin-topbar"><button type="button" className="admin-menu-trigger btn btn-ghost px-3 py-2" aria-label="Open admin menu" aria-haspopup="dialog" onClick={()=>menu.current?.showModal()}>Menu</button><p className="admin-current-section">{current.label}</p><div className="admin-topbar-actions"><button type="button" className="admin-search-trigger" onClick={()=>{setCommandQuery('');command.current?.showModal();search.current?.focus();}} aria-label="Search admin"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><span>Search admin…</span><kbd>⌘K</kbd></button><button type="button" className="icon-button" aria-label="Refresh dashboard" disabled={refreshing} onClick={()=>{void refresh();}}><Icon name="refresh" size={18}/></button></div></header>
   <main id="admin-content" className="admin-content" tabIndex={-1}>
    {!loadedOnce?<div className="card-paper p-10" role="status">Loading dashboard…</div>:loadError?<div className="card-paper p-7" role="alert"><h1 className="font-display text-2xl">Dashboard data unavailable</h1><p className="mt-3 text-sm">{loadError}</p><button className="btn btn-ink mt-5 px-5 py-3" onClick={()=>{void refresh();}}>Retry</button></div>:
     view==='dashboard'?<DashboardView orders={orders} reviews={reviews} overview={overview} onOpenOrder={id=>navigate('orders',id)} onNavigate={navigate}/>:view==='orders'?<OrdersView key={selectedOrder} orders={orders} onChanged={refresh} initialOrderId={selectedOrder}/>:view==='clients'?<ClientsView orders={orders} onOpenOrder={id=>navigate('orders',id)} onExport={setExportScope}/>:view==='profiles'?<ProfilesView user={user} onChanged={refresh}/>:view==='reviews'?<ReviewsView reviews={reviews}/>:view==='pricing'?<div><p className="admin-eyebrow">Your offers</p><h1 className="font-display text-3xl">Pricing</h1><p className="mt-2 text-sm text-[var(--ink-soft)]">Control current selling prices. Submitted orders keep their agreed quotes.</p><ProductCatalogSettings/><ProfilePlanSettings/><details className="mt-6"><summary className="cursor-pointer font-display text-xl">Customizable card and website offers</summary><PricingSettings/></details></div>:view==='backups'?<BackupTools/>:<SettingsView user={user}/>}
   </main>
  </div>
  <dialog ref={menu} aria-label="Admin menu" className="admin-menu-dialog"><div className="admin-mobile-brand"><Brand/><button className="icon-button" aria-label="Close admin menu" onClick={()=>menu.current?.close()}><Icon name="close"/></button></div>{navigation}<div className="admin-sidebar-footer"><p className="admin-signed-in">{user.email}</p><button className="admin-sign-out" onClick={onLogout}>Sign Out</button></div></dialog>
  <dialog ref={command} aria-label="Search admin" className="admin-command-dialog"><div className="admin-command-input"><input ref={search} aria-label="Search sections and orders" placeholder="Search sections, customer or order…" value={commandQuery} onChange={event=>setCommandQuery(event.target.value)}/><button className="icon-button" aria-label="Close search" onClick={()=>command.current?.close()}><Icon name="close" size={18}/></button></div><div className="admin-command-results">{foundSections.length>0&&<p className="admin-nav-label">Sections</p>}{foundSections.map(v=><button key={v.id} onClick={()=>navigate(v.id)}><Icon name={v.icon} size={18}/>{v.label}</button>)}{foundOrders.length>0&&<p className="admin-nav-label">Orders</p>}{foundOrders.map(o=><button key={o.id} onClick={()=>navigate('orders',o.id)}><Icon name="card" size={18}/><span>{o.customer.fullName}<small>{o.orderNumber}</small></span></button>)}{!foundSections.length&&!foundOrders.length&&<p className="p-5 text-sm">No matching sections or loaded orders. Search the profile directory for profiles.</p>}</div></dialog>
  {exportScope&&<ExportBackupDialog scope={exportScope} onClose={()=>setExportScope(null)}/>}
 </div>;
}

function DashboardView({orders,reviews,overview,onOpenOrder,onNavigate}:{orders:Order[];reviews:Review[];overview:BackupOverview|null;onOpenOrder:(id:string)=>void;onNavigate:(id:AdminView)=>void}){
 const finished=['delivered','picked_up','completed'];
 const active=orders.filter(o=>!['rejected','cancelled'].includes(o.applicationStatus||'')&&!finished.includes(o.fulfillment.status));
 const awaiting=active.filter(o=>['new','payment_pending','paid','cod_pending_confirmation'].includes(o.fulfillment.status));
 const production=active.filter(o=>['profile_created','production_ready','printing','ready_for_nfc','nfc_programmed','qa_passed'].includes(o.fulfillment.status));
 const completed=orders.filter(o=>finished.includes(o.fulfillment.status));
 const metrics:{label:string;value:number|string;icon:IconName;view:AdminView}[]=[
  {label:'Orders awaiting action',value:awaiting.length,icon:'card',view:'orders'},
  {label:'In production',value:production.length,icon:'edit',view:'orders'},
  {label:'Completed orders',value:completed.length,icon:'check',view:'orders'},
  {label:'Ordering clients',value:new Set(orders.map(orderCustomerKey)).size,icon:'user',view:'clients'},
  {label:overview?'Profiles':'Order profiles',value:overview?.profiles??new Set(orders.map(o=>o.profileId).filter(Boolean)).size,icon:'avatar',view:'profiles'},
  {label:'Reviews loaded',value:reviews.length,icon:'star',view:'reviews'},
 ];
 return <div><div className="admin-page-heading"><div><p className="admin-eyebrow">Workspace overview</p><h1 className="font-display text-3xl">Your EdgeTap workspace</h1><p className="mt-2 text-sm text-[var(--ink-soft)]">{active.length} open orders in your inbox. Keep the next step easy to find.</p></div><button className="btn btn-ink px-4 py-3" onClick={()=>onNavigate('orders')}>Open orders <span aria-hidden="true">→</span></button></div>
  <div className="admin-metrics-grid">{metrics.map(m=><button key={m.label} onClick={()=>onNavigate(m.view)} className="card-paper admin-metric"><span className="admin-metric-label">{m.label}<Icon name={m.icon} size={18}/></span><strong>{m.value}</strong></button>)}</div>
  <div className="admin-overview-grid"><section className="card-paper p-6"><div className="admin-panel-heading"><div><h2 className="font-display text-lg">Open orders</h2><p className="mt-1 text-xs text-[var(--ink-soft)]">Profile, payment and fulfillment remain separate.</p></div><button className="admin-text-link" onClick={()=>onNavigate('orders')}>View all</button></div><div className="admin-order-rows">{active.slice(0,6).map(o=><button key={o.id} onClick={()=>onOpenOrder(o.id||'')}><span><strong>{o.customer.fullName}</strong><small>{o.orderNumber}</small></span><span className="admin-badge">{o.fulfillment.status.replaceAll('_',' ')}</span></button>)}{!active.length&&<p className="py-6 text-sm text-[var(--ink-soft)]">No open orders. New applications will appear here.</p>}</div></section>
   <section className="card-paper p-6"><h2 className="font-display text-lg">Workspace tools</h2><div className="admin-tool-list"><button onClick={()=>onNavigate('profiles')}><Icon name="avatar"/><span><strong>Manage profiles</strong><small>Edit details, visibility and account access.</small></span></button><button onClick={()=>onNavigate('pricing')}><Icon name="receipt"/><span><strong>Prices and offers</strong><small>Update selling prices for new orders.</small></span></button><button onClick={()=>onNavigate('backups')}><Icon name="save"/><span><strong>Local backups</strong><small>Keep your business records and files.</small></span></button></div></section>
   <section className="card-paper p-6"><h2 className="font-display text-lg">Recently completed</h2><div className="admin-order-rows">{completed.slice(0,5).map(o=><button key={o.id} onClick={()=>onOpenOrder(o.id||'')}><span><strong>{o.customer.fullName}</strong><small>{o.orderNumber}</small></span><span className="admin-badge">{o.fulfillment.status.replaceAll('_',' ')}</span></button>)}{!completed.length&&<p className="py-6 text-sm text-[var(--ink-soft)]">No completed orders in the loaded inbox.</p>}</div></section>
   <section className="card-paper p-6"><h2 className="font-display text-lg">Latest profile reviews</h2><div className="admin-review-rows">{reviews.slice(0,3).map(r=><div key={r.id}><p className="text-xs font-bold">{r.authorName} · {r.rating}/5</p><p className="mt-2 text-sm text-[var(--ink-soft)]">{r.text.slice(0,150)}</p></div>)}{!reviews.length&&<p className="py-6 text-sm text-[var(--ink-soft)]">No profile reviews yet.</p>}</div></section>
  </div><p className="mt-5 text-xs text-[var(--ink-soft)]">Order activity reflects the loaded inbox, up to 200 recent orders. These are operational records, not traffic analytics.</p>
 </div>;
}

// ── Clients ──────────────────────────────────────────────────────
function ClientsView({ orders, onOpenOrder,onExport }: { orders: Order[]; onOpenOrder:(id:string)=>void;onExport:(scope:BackupScope)=>void }) {
  const [query, setQuery] = useState('');
  const clients: (Order["customer"] & { customerKey:string; account:Order['account']; orderId: string; orderNumber: string; createdAt: number })[] = [];
  for (const o of orders) {
    const entry = { ...o.customer, customerKey:orderCustomerKey(o), account:o.account, orderId: o.id || "", orderNumber: o.orderNumber, createdAt: o.createdAt };
    if (!clients.some((x) => x.customerKey === entry.customerKey)) clients.push(entry);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Clients</h1>
      <p className="text-sm text-[var(--ink-soft)]">{clients.length} customer records · Grouped by customer identity</p>
      <input aria-label="Search clients" placeholder="Find a client" value={query} onChange={event=>setQuery(event.target.value)} className="mt-5 w-full rounded-xl border bg-white p-3"/>
      <div className="mt-6 space-y-3">
        {clients.filter(c=>[c.fullName,c.email,c.phone,c.account?.email||''].some(value=>value.toLowerCase().includes(query.toLowerCase()))).map((c) => (
          <div key={c.orderId} className="card-paper flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-11 w-11 shrink-0"><DefaultAvatar size={28}/></div><div className="min-w-0">
              <p className="font-display font-bold text-[var(--ink)]">{c.fullName}</p>
              <p className="break-all text-[13px] text-[var(--ink-soft)]">{c.account?.kind==='staff_managed'?'Staff-managed · No login':c.account?.email?'Login: '+c.account.email:'Login unavailable'}</p>
              <p className="break-all text-xs text-[var(--ink-soft)]">Order contact: {c.email||'Email not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {c.account?.customerId&&<button type="button" aria-label={"Export "+c.fullName+" records"} title="Export customer records" className="icon-button" onClick={()=>onExport({kind:"customer",id:c.account!.customerId,label:c.fullName})}><Icon name="save"/></button>}
              <InfoHelp title={'Contact '+c.fullName}><p>{c.email}</p><p>{c.phone}</p>{c.city&&<p>{c.city}</p>}<p>Latest order: {c.orderNumber}</p><p>{new Date(c.createdAt).toLocaleDateString()}</p></InfoHelp>
              <button type="button" aria-label={'Open order '+c.orderNumber} title="Open order" className="icon-button" onClick={()=>onOpenOrder(c.orderId)}><Icon name="card"/></button>
            </div>
          </div>
        ))}
        {clients.length === 0 && <p className="card-paper p-6 text-sm text-[var(--ink-faint)]">No clients yet.</p>}
      </div>
    </div>
  );
}

// ── Reviews ──────────────────────────────────────────────────────
function ReviewsView({ reviews }: { reviews: Review[] }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Reviews</h1>
      <p className="text-sm text-[var(--ink-soft)]">Public reviews left for client profiles.</p>
      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="card-paper p-5">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-[var(--ink)]">{r.authorName}</p>
              <span className="font-display text-[var(--yellow)]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{r.text}</p>
            <p className="mt-2 text-[11px] text-[var(--ink-faint)]">
              /u/{r.username} · reviewed {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="card-paper p-6 text-sm text-[var(--ink-faint)] flex items-center gap-3">
            <SparkleDoodle className="h-5 w-5 text-[var(--yellow)]" />
            No reviews yet. Review cards go out after delivery.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────
function SettingsView({ user }: { user: User }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Settings</h1>
      <OrderSettingsPanel />
      <div className="card-paper mt-6 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--ink)]">Signed in as</p>
            <p className="text-sm text-[var(--ink-soft)]">{user.email}</p>
          </div>
          <span className="rounded-full bg-[var(--mint-soft)] px-3 py-1 text-[11px] font-bold text-[var(--ink)]">Admin UID: {user.uid.slice(0, 12)}…</span>
        </div>
        <div className="border-t border-[var(--ink)]/10 pt-4">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">Admin authorization</p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Staff access requires an operator-managed membership linked to your authenticated account. Account metadata cannot grant staff access.
          </p>
        </div>
      </div>
      <div className="card-paper mt-4 p-6">
        <p className="text-sm font-bold text-[var(--ink)]">Service readiness</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">
          Orders, profiles, reviews and uploads require configured authentication, database and storage services;
          customer checkout requires an account so profile ownership remains secure. <Link className="font-bold text-[var(--sky)] hover:underline" href="/pricing">See pricing</Link> for the available card.
        </p>
      </div>
    </div>
  );
}
