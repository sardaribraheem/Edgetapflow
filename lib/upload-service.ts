import { usesSupabase } from './backend';
import { getSupabase } from './supabase';

async function upload(bucket: string, uid: string, file: File, maxMb: number): Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Use a JPEG, PNG or WebP image.');
  if (file.size<=0 || file.size>maxMb*1024*1024) throw new Error(`Image must be under ${maxMb} MB.`);
  const extension = { 'image/jpeg':'jpg','image/png':'png','image/webp':'webp' }[file.type];
  const path = `${uid}/${crypto.randomUUID()}.${extension}`;
  const { error } = await getSupabase().storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('You are offline. Reconnect, then choose the image again.');
    const status = String(error.statusCode || '');
    if (status === '401' || status === '403') throw new Error('Your upload access could not be confirmed. Sign in again, then retry the image.');
    if (status === '413') throw new Error(`Image must be under ${maxMb} MB.`);
    if (status === '429') throw new Error('Too many upload attempts. Wait a moment, then choose the image again.');
    throw new Error('Image upload could not reach storage. Check your connection, then choose the image again.');
  }
  return `${bucket}/${path}`;
}
export async function uploadPublicAvatar(uid: string, file: File): Promise<string> {
  if (!usesSupabase) return (await import('./storage')).uploadPublicAvatar(uid,file);
  const path = await upload('avatars',uid,file,5);
  return getSupabase().storage.from('avatars').getPublicUrl(path.slice('avatars/'.length)).data.publicUrl;
}
export async function uploadCustomDesign(uid: string, file: File): Promise<string> {
  return usesSupabase ? upload('order-artwork',uid,file,25) : (await import('./storage')).uploadCustomDesign(uid,file);
}
export async function uploadPaymentReceipt(uid: string, file: File): Promise<string> {
  return usesSupabase ? upload('payment-receipts',uid,file,8) : (await import('./storage')).uploadPaymentReceipt(uid,file);
}
export async function uploadPrintFile(uid:string,blob:Blob,face:'front'|'back'|'pdf'):Promise<string>{
  const mime=face==='pdf'?'application/pdf':'image/png';
  if(blob.type!==mime||blob.size<=0||blob.size>32*1024*1024)throw new Error('Print export must be a PNG or PDF within 32 MB.');
  const path=`${uid}/${crypto.randomUUID()}-${face}.${face==='pdf'?'pdf':'png'}`;
  const {error}=await getSupabase().storage.from('print-packages').upload(path,blob,{contentType:mime,upsert:false});
  if(error)throw new Error('Could not save the private print export. Retry when your connection is available.');
  return 'print-packages/'+path;
}
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve,reject)=>{ const reader=new FileReader(); reader.onload=()=>resolve(reader.result as string); reader.onerror=()=>reject(new Error('Could not read the image file.')); reader.readAsDataURL(file); });
}
export async function downloadPrivateUpload(path: string): Promise<void> {
  if (!usesSupabase) return (await import('./storage')).downloadPrivateUpload(path);
  const data = await getPrivateUploadBlob(path);
  const url=URL.createObjectURL(data); const anchor=document.createElement('a'); anchor.href=url; anchor.download=path.split('/').at(-1)||'upload'; anchor.click(); window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function getPrivateUploadBlob(path: string): Promise<Blob> {
  const match=/^(payment-receipts|order-artwork|print-packages|migration-quarantine)\/(.+)$/.exec(path);
  if (!match || match[2].includes('..')) throw new Error('Invalid private upload path.');
  const { data, error } = await getSupabase().storage.from(match[1]).download(match[2]);
  if(error || !data) throw new Error('Download unavailable. Check your account access.');
  return data;
}
