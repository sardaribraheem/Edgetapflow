"use client";
import {useEffect,useState} from 'react';
import {getPrivateUploadBlob,downloadPrivateUpload} from '@/lib/upload-service';
export default function PrivateFile({path,label}:{path:string;label:string}){
 const pdf=path.toLowerCase().endsWith('.pdf');
 const [url,setUrl]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
 const view=async()=>{setBusy(true);setError('');try{const blob=await getPrivateUploadBlob(path);setUrl(URL.createObjectURL(blob));}catch{setError('Private file unavailable. Check your session and permissions.');}finally{setBusy(false);}};
 return <div className="mt-2"><div className="flex flex-wrap gap-3">{!pdf&&<button type="button" disabled={busy} onClick={()=>{void view();}} className="font-bold underline">View {label}</button>}<button type="button" disabled={busy} onClick={()=>{setError('');void downloadPrivateUpload(path).catch(()=>setError('Download unavailable.'));}} className="underline">Download {label}</button>{url&&<button type="button" className="underline" onClick={()=>setUrl('')}>Close preview</button>}</div>{error&&<p role="alert" className="mt-2 text-sm">{error}</p>}{url&&<img src={url} alt={'Private '+label+' preview'} className="mt-3 max-h-96 max-w-full rounded-xl object-contain"/>}</div>;
}
