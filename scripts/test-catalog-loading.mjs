import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
let signal;
const raw=ts.transpileModule(await readFile('lib/rpc-read.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const code=raw.replace(/import \{ getSupabase \} from '.\/supabase';/, 'const getSupabase=()=>globalThis.__edgetapCatalogTestClient;');
const {boundedRpcRead}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
try{
 globalThis.__edgetapCatalogTestClient={rpc:()=>({abortSignal:s=>{signal=s;return new Promise(()=>{});}})};
 await assert.rejects(()=>boundedRpcRead('read_only_fixture',{},25),/timed out/);assert.equal(signal.aborted,true);
 globalThis.__edgetapCatalogTestClient={rpc:()=>({abortSignal:()=>Promise.resolve({data:{price:1499},error:null})})};assert.deepEqual(await boundedRpcRead('read_only_fixture',{},25),{price:1499});
 globalThis.__edgetapCatalogTestClient={rpc:()=>({abortSignal:()=>Promise.resolve({data:null,error:new Error('Simulated backend failure')})})};await assert.rejects(()=>boundedRpcRead('read_only_fixture',{},25),/Simulated backend/);
 console.log('PASS stalled catalog/Auth reads time out and abort; successful retry and backend errors resolve correctly.');
}finally{delete globalThis.__edgetapCatalogTestClient;}
