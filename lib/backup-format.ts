// Browser/Node-compatible local backup format. No network or cloud writes.
export type BackupEntry={path:string;data:Uint8Array};
const encoder=new TextEncoder();
const MAX_BYTES=64*1024*1024;
export const BACKUP_MAX_BYTES=MAX_BYTES;
export function safeArchivePath(path:string){
 if(!path||path.length>1000||path.startsWith('/')||/[\\\x00-\x1f]/.test(path)||path.split('/').some(p=>!p||p==='.'||p==='..'))throw new Error('A file has an unsafe archive path. No backup was saved.');
 return path;
}
export async function sha256(bytes:Uint8Array){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes as BufferSource)),n=>n.toString(16).padStart(2,'0')).join('');}
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes:Uint8Array){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
function header(size:number){const bytes=new Uint8Array(size);return {bytes,view:new DataView(bytes.buffer)};}
function join(parts:Uint8Array[]){const length=parts.reduce((n,p)=>n+p.length,0);if(length>MAX_BYTES)throw new Error('This backup exceeds the 64 MB browser limit. Export one customer or use an operator backup.');const out=new Uint8Array(length);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
export function createBackupZip(entries:BackupEntry[]):Uint8Array {
 if(entries.length>1500)throw new Error('Too many files for a browser backup. Export one customer at a time.');
 const seen=new Set<string>(),local:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0;
 for(const entry of entries){
  const path=safeArchivePath(entry.path);if(seen.has(path))throw new Error('Duplicate backup file path.');seen.add(path);
  const name=encoder.encode(path),crc=crc32(entry.data),h=header(30),c=header(46);
  h.view.setUint32(0,0x04034b50,true);h.view.setUint16(4,20,true);h.view.setUint16(6,0x800,true);
  h.view.setUint16(12,33,true);h.view.setUint32(14,crc,true);h.view.setUint32(18,entry.data.length,true);h.view.setUint32(22,entry.data.length,true);h.view.setUint16(26,name.length,true);
  c.view.setUint32(0,0x02014b50,true);c.view.setUint16(4,20,true);c.view.setUint16(6,20,true);c.view.setUint16(8,0x800,true);c.view.setUint16(14,33,true);
  c.view.setUint32(16,crc,true);c.view.setUint32(20,entry.data.length,true);c.view.setUint32(24,entry.data.length,true);c.view.setUint16(28,name.length,true);c.view.setUint32(42,offset,true);
  local.push(h.bytes,name,entry.data);central.push(c.bytes,name);offset+=30+name.length+entry.data.length;
  if(offset>MAX_BYTES)throw new Error('This backup exceeds the 64 MB browser limit. Export one customer at a time.');
 }
 const end=header(22),centralSize=central.reduce((n,b)=>n+b.length,0);
 end.view.setUint32(0,0x06054b50,true);end.view.setUint16(8,entries.length,true);end.view.setUint16(10,entries.length,true);end.view.setUint32(12,centralSize,true);end.view.setUint32(16,offset,true);
 return join([...local,...central,end.bytes]);
}
const magic=encoder.encode('EDGETAP-BACKUP-1\n');
const iterations=250000;
async function key(passphrase:string,salt:Uint8Array,usage:KeyUsage[]){
 const material=await crypto.subtle.importKey('raw',encoder.encode(passphrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt as BufferSource,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,usage);
}
export async function encryptBackup(bytes:Uint8Array,passphrase:string){
 if(passphrase.length<12)throw new Error('Use a backup passphrase of at least 12 characters.');
 if(bytes.length>MAX_BYTES-64)throw new Error('This backup is too large for browser encryption.');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:magic},await key(passphrase,salt,['encrypt']),bytes as BufferSource));
 return join([magic,salt,iv,encrypted]);
}
export async function decryptBackup(bytes:Uint8Array,passphrase:string){
 if(bytes.length>MAX_BYTES||bytes.length<magic.length+44||!magic.every((n,i)=>bytes[i]===n))throw new Error('Choose a valid EdgeTap encrypted backup.');
 const salt=bytes.slice(magic.length,magic.length+16),iv=bytes.slice(magic.length+16,magic.length+28);
 try{return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:magic},await key(passphrase,salt,['decrypt']),bytes.slice(magic.length+28)));}
 catch{throw new Error('The passphrase is incorrect or the backup is damaged. No data was restored.');}
}
