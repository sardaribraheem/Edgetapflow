// Real ZIP/encryption/offline recovery tests using synthetic data only.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const js=ts.transpileModule(await readFile('lib/backup-format.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {createBackupZip,encryptBackup,decryptBackup,sha256}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const dir=await mkdtemp(join(tmpdir(),'edgetap-backup-test-'));let checks=0;
function pass(name){checks++;console.log('PASS '+name);}
try{
 const entries=[{path:'backup.json',data:new TextEncoder().encode('{"customer":"Synthetic only"}')},{path:'files/avatars/fixture/photo.bin',data:Uint8Array.from([0,1,127,255])},{path:'files/avatars/fixture/نام.txt',data:new TextEncoder().encode('Unicode path')}];
 const zip=createBackupZip(entries);await writeFile(join(dir,'test.zip'),zip);
 execFileSync('python3',['-c',"import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; assert z.read('files/avatars/fixture/photo.bin')==bytes([0,1,127,255]); assert z.read('files/avatars/fixture/نام.txt')==b'Unicode path'",join(dir,'test.zip')]);pass('An independent ZIP reader verifies CRC, binary bytes and Unicode filenames');
 for(const path of ['../escape','/absolute','files/../escape','files\\escape','files//empty','files/\0bad'])assert.throws(()=>createBackupZip([{path,data:new Uint8Array()}]));assert.throws(()=>createBackupZip([entries[0],entries[0]]));pass('Traversal, absolute, duplicate and unsafe archive paths are rejected');
 const passphrase='Fixture backup passphrase';const encrypted=await encryptBackup(zip,passphrase);assert.deepEqual(await decryptBackup(encrypted,passphrase),zip);assert(!Buffer.from(encrypted).includes(Buffer.from('Synthetic only')));pass('AES-GCM encryption round-trips without readable customer data');
 const again=await encryptBackup(zip,passphrase);assert.notDeepEqual(again,encrypted);await assert.rejects(()=>decryptBackup(encrypted,'Wrong passphrase'));const damaged=encrypted.slice();damaged[damaged.length-1]^=1;await assert.rejects(()=>decryptBackup(damaged,passphrase));await assert.rejects(()=>decryptBackup(new Uint8Array(3),passphrase));await assert.rejects(()=>encryptBackup(zip,'short'));pass('Fresh encryption is randomized and wrong keys/tampering/truncation fail closed');
 assert.equal(await sha256(new TextEncoder().encode('abc')),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');pass('Manifest SHA-256 matches a known independent vector');
 await writeFile(join(dir,'backup.etbackup'),encrypted);await writeFile(join(dir,'passphrase'),passphrase,{mode:0o600});
 const args=['scripts/unlock-local-backup.mjs','--input',join(dir,'backup.etbackup'),'--output',join(dir,'restored.zip'),'--passphrase-file',join(dir,'passphrase')];
 execFileSync(process.execPath,args,{stdio:'pipe'});assert.deepEqual(new Uint8Array(await readFile(join(dir,'restored.zip'))),zip);assert.equal((await stat(join(dir,'restored.zip'))).mode&0o777,0o600);assert.throws(()=>execFileSync(process.execPath,args,{stdio:'pipe'}));pass('Offline Node recovery matches exact ZIP bytes, uses private permissions and refuses overwrite');
 await writeFile(join(dir,'wrong-key'),'Wrong fixture password',{mode:0o600});const wrong=[...args];wrong[wrong.indexOf('--passphrase-file')+1]=join(dir,'wrong-key');wrong[wrong.indexOf('--output')+1]=join(dir,'must-not-exist.zip');assert.throws(()=>execFileSync(process.execPath,wrong,{stdio:'pipe'}));await assert.rejects(()=>stat(join(dir,'must-not-exist.zip')));pass('Failed offline decryption creates no output');
 console.log(`PASS ${checks} ZIP, encryption and offline recovery groups.`);
}finally{await rm(dir,{recursive:true,force:true});}
