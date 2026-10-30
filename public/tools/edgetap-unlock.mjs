// Offline decryption only. Never contacts a service or imports customer data.
import {readFile,open,stat} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
const args=process.argv.slice(2),options={};
try{
 for(let i=0;i<args.length;i+=2){if(!['--input','--output','--passphrase-file'].includes(args[i])||!args[i+1])throw new Error('Usage: node scripts/unlock-local-backup.mjs --input backup.etbackup --output unlocked.zip [--passphrase-file private-file]');options[args[i]]=args[i+1];}
 if(!options['--input']||!options['--output'])throw new Error('Specify --input and a new --output ZIP path.');
 const sourceInfo=await stat(options['--input']);if(sourceInfo.size>64*1024*1024)throw new Error('Backup exceeds the supported 64 MB limit.');
 const bytes=new Uint8Array(await readFile(options['--input'])),magic=new TextEncoder().encode('EDGETAP-BACKUP-1\n');
 if(bytes.length<magic.length+44||!magic.every((v,i)=>bytes[i]===v))throw new Error('Unsupported encrypted backup format.');
 let passphrase;
 if(options['--passphrase-file']){
  const info=await stat(options['--passphrase-file']);if(info.mode&0o077)throw new Error('Passphrase file must be private: chmod 600 before use.');
  passphrase=(await readFile(options['--passphrase-file'],'utf8')).replace(/\r?\n$/,'');
 }else{
  if(!process.stdin.isTTY)throw new Error('Use an interactive terminal or --passphrase-file. Never put the passphrase in command arguments.');
  process.stdout.write('Backup passphrase (hidden): ');process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
  passphrase=await new Promise((resolve,reject)=>{let value='';const stop=()=>{process.stdin.setRawMode(false);process.stdin.pause();process.stdin.removeListener('data',onData);process.stdout.write('\n');};const onData=chunk=>{for(const char of chunk){if(char==='\u0003'){stop();reject(new Error('Cancelled.'));return;}if(char==='\r'||char==='\n'){stop();resolve(value);return;}if(char==='\u007f'||char==='\b')value=value.slice(0,-1);else if(char>=' ')value+=char;}};process.stdin.on('data',onData);});
 }
 const salt=bytes.slice(magic.length,magic.length+16),iv=bytes.slice(magic.length+16,magic.length+28);
 const material=await webcrypto.subtle.importKey('raw',new TextEncoder().encode(passphrase),'PBKDF2',false,['deriveKey']);passphrase='';
 const key=await webcrypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
 let output;try{output=new Uint8Array(await webcrypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:magic},key,bytes.slice(magic.length+28)));}catch{throw new Error('Incorrect passphrase or damaged backup. Nothing was written.');}
 if(output[0]!==0x50||output[1]!==0x4b)throw new Error('Decrypted backup is not a ZIP archive.');
 const file=await open(options['--output'],'wx',0o600);try{await file.writeFile(output);}finally{await file.close();}
 console.log('Backup unlocked to a new private ZIP. No data was imported or sent.');
}catch(error){console.error(error.code==='EEXIST'?'Output already exists. Choose a new filename.':error.message);process.exitCode=1;}
