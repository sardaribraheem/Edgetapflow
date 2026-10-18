"use client";
import { useRef, useState } from 'react';
import type { Order } from '@/lib/data/order';
import { getCurrentUser } from '@/lib/auth';
import { getPrintPackage } from '@/lib/application';
import { printPackageHold } from '@/lib/physical-card';
import { getPrivateUploadBlob } from '@/lib/upload-service';
import { downloadCardFile } from '@/lib/card-renderer';
import { printJobPdf } from '@/lib/print-job';
import Icon from '@/components/ui/Icon';
export default function AdminOrderSheet({ order }: { order: Order }) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');const lock=useRef(false);
  const hold=printPackageHold(order);
  async function generate(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const user=await getCurrentUser();if(!user)throw new Error('Sign in as staff.');const snapshot=await getPrintPackage(order);const [front,back]=await Promise.all([getPrivateUploadBlob(snapshot.frontPath),getPrivateUploadBlob(snapshot.backPath)]);const pdf=await printJobPdf(snapshot.name||order.customer.fullName,order.orderNumber,front,back);if((await getCurrentUser())?.uid!==user.uid)throw new Error('Account changed. Reopen this order.');downloadCardFile(pdf,`${order.orderNumber}-print-order-r${snapshot.revision}.pdf`);}catch(e){setError(e instanceof Error?e.message:'Could not generate print order.');}finally{lock.current=false;setBusy(false);}}
  return <section className="border-t pt-5"><h3 className="font-display text-xl">Print order</h3><p className="mt-2 text-sm">Order name and approved front/back artwork, on one printable sheet.</p><button type="button" disabled={busy||!!hold} className="btn btn-ink mt-4 px-5 py-3" onClick={()=>{void generate();}}><Icon name="receipt" size={18}/>{busy?'Generating…':'Generate print order'}</button>{hold&&<p className="mt-2 text-sm">{hold}</p>}{error&&<p role="alert" className="mt-3 text-sm">{error}</p>}</section>;
}
