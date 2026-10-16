import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile('lib/nfc-link.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
const {normaliseDirectLink,directLinkError,nfcLinkSize}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));let checks=0;
function verify(v,m){assert(v,m);checks++;}
verify(normaliseDirectLink('example.com')==='https://example.com/','Bare website normalizes to HTTPS');
for(const input of ['https://example.com/','https://wa.me/923001234567','https://github.com/talha','https://example.com/پاکستان/🙂']){const normalized=normaliseDirectLink(input);verify(!directLinkError(input),'Valid website: '+input);verify(nfcLinkSize(input).urlBytes===Buffer.byteLength(normalized,'utf8'),'Counts actual encoded bytes');}
for(const input of ['javascript:alert(1)','data:text/html,test','file:///etc/passwd','https://user:password@example.com/','https://example.com/hello world','https://127.0.0.1/','https://10.0.0.1/','https://localhost/'])verify(!!directLinkError(input),'Blocks unsafe link');
const prefix='https://example.com/';const limit=prefix+'x'.repeat(483-prefix.length);
verify(nfcLinkSize(limit).bytes===496&&!directLinkError(limit),'Exact uncompressed NDEF/TLV boundary fits');
verify(nfcLinkSize(limit+'x').bytes===497&&!!directLinkError(limit+'x'),'One byte beyond NDEF capacity is rejected');
for(const size of [254,255,256,483,484]){const url=prefix+'x'.repeat(size-prefix.length),payload=1+Buffer.byteLength(url),record=(payload<=255?4:7)+payload,expected=record+(record<255?2:4)+1;verify(nfcLinkSize(url).bytes===expected,'Correct short/long NDEF and TLV overhead');}
console.log(`PASS ${checks} NFC link validation and encoded-capacity checks. Datasheet budget; not a physical-chip test.`);
