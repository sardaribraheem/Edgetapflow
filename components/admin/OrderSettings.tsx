"use client";
import { useEffect, useState } from 'react';
import { getOrderSettings, saveOrderSettings, type OrderSettings } from '@/lib/application';
export default function OrderSettingsPanel(){
 const [settings,setSettings]=useState<OrderSettings|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{void getOrderSettings().then(setSettings).catch(()=>setMessage('Could not load order settings.'));},[]);
 if(!settings)return <p role="status">{message||'Loading order settings…'}</p>;
 return <section className="card-paper mt-5 p-6"><h2 className="font-display text-xl">Order & fulfillment instructions</h2><p className="mt-3 text-sm">Only publish details that EdgeTap has confirmed. These instructions do not set a universal delivery fee; quotes remain per order.</p><form className="mt-4 space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await saveOrderSettings(settings);setSettings(await getOrderSettings());setMessage('Order settings saved.');}catch{setMessage('Could not save settings. Refresh if another staff member changed them.');}finally{setBusy(false);}}}>
  {(['pickupDetails','deliveryDetails','hostingDetails'] as const).map(key=><label key={key} className="block font-bold">{key==='pickupDetails'?'NASTP pickup details':key==='deliveryDetails'?'Delivery instructions':'Profile hosting / update instructions'}<textarea aria-label={key==='pickupDetails'?'NASTP pickup details':key==='deliveryDetails'?'Delivery instructions':'Profile hosting / update instructions'} value={settings[key]} maxLength={1000} onChange={e=>setSettings({...settings,[key]:e.target.value})} className="mt-2 w-full rounded-xl border p-3"/></label>)}
  <label className="block font-bold">Card size options (one per line)<textarea aria-label="Card size options (one per line)" value={settings.cardSizes.join('\n')} onChange={e=>setSettings({...settings,cardSizes:e.target.value.split('\n')})} className="mt-2 w-full rounded-xl border p-3"/></label><p className="text-sm">JazzCash: {settings.jazzcashNumber}. Email notifications disabled until a verified transport is configured.</p><button disabled={busy} className="btn btn-ink px-5 py-3">Save order settings</button>{message&&<p role="status">{message}</p>}
 </form></section>;
}
