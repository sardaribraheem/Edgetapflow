import {getSupabase} from './supabase';
import {BACKUP_MAX_BYTES,createBackupZip,safeArchivePath,sha256,type BackupEntry} from './backup-format';
export type BackupScope={kind:'all'|'customer'|'profile';id?:string;label?:string};
export type BackupOverview={profiles:number;customers:number;accounts:number;orders:number;files:number;formatVersion:number};
export type BusinessBackup={format:'edgetap-business-backup';formatVersion:number;createdAt:string;scope:BackupScope;accounts:unknown[];records:Record<string,unknown[]>;files:{id:string;bucket:string;name:string;bytes:number|null}[];coverage:{fileBytesIncluded:boolean;excludes:string[]}};
export async function getBackupOverview():Promise<BackupOverview>{const {data,error}=await getSupabase().rpc('admin_backup_overview');if(error)throw new Error('Backup tools are unavailable. Reload or contact the site operator.');return data;}
export async function getBusinessBackup(scope:BackupScope):Promise<BusinessBackup>{
 const {data,error}=await getSupabase().rpc('admin_export_business_data',{p_scope:scope.kind,p_id:scope.id||null});
 if(error)throw new Error('The records could not be exported. Check staff access and try again.');
 if(data?.format!=='edgetap-business-backup'||data?.formatVersion!==1||!Array.isArray(data.files)||!data.records)throw new Error('The backup response could not be validated. No download was saved.');
 return data as BusinessBackup;
}
export async function buildBusinessArchive(snapshot:BusinessBackup,includeFiles:boolean,progress:(message:string)=>void,signal:AbortSignal):Promise<Uint8Array>{
 const encode=(value:unknown)=>new TextEncoder().encode(JSON.stringify(value,null,2)+'\n');
 const document={...snapshot,coverage:{...snapshot.coverage,fileBytesIncluded:includeFiles}};
 const entries:BackupEntry[]=[{path:'backup.json',data:encode(document)}];let size=entries[0].data.length;
 const manifest:{path:string;bytes:number;sha256:string}[]=[];
 if(includeFiles&&snapshot.files.length>1498)throw new Error('Too many files for the browser. Export one customer at a time.');
 if(includeFiles)for(let i=0;i<snapshot.files.length;i++){
  signal.throwIfAborted();const file=snapshot.files[i];
  if(!['avatars','order-artwork','payment-receipts','print-packages'].includes(file.bucket))throw new Error('The export contains an unsupported file bucket.');
  const path=safeArchivePath('files/'+file.bucket+'/'+file.name);
  if(file.bytes!==null&&size+file.bytes>BACKUP_MAX_BYTES-1024*1024)throw new Error('The files exceed the 64 MB browser limit. Export one customer at a time.');
  progress(`Downloading file ${i+1} of ${snapshot.files.length}…`);
  const {data,error}=await getSupabase().storage.from(file.bucket).download(file.name);signal.throwIfAborted();
  if(error||!data)throw new Error(`File ${i+1} could not be downloaded. The complete backup was not saved; retry or export records only.`);
  const bytes=new Uint8Array(await data.arrayBuffer());size+=bytes.length;
  if(size>BACKUP_MAX_BYTES-1024*1024)throw new Error('The files exceed the 64 MB browser limit. Export one customer at a time.');
  entries.push({path,data:bytes});
 }
 for(const entry of entries){signal.throwIfAborted();manifest.push({path:entry.path,bytes:entry.data.length,sha256:await sha256(entry.data)});}
 entries.push({path:'manifest.json',data:encode({format:'edgetap-backup-manifest',formatVersion:1,createdAt:snapshot.createdAt,fileBytesIncluded:includeFiles,entries:manifest})});
 progress('Preparing your local archive…');signal.throwIfAborted();return createBackupZip(entries);
}
export function downloadBackup(bytes:Uint8Array,name:string,type='application/octet-stream'){
 const url=URL.createObjectURL(new Blob([bytes as BlobPart],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30000);
}
