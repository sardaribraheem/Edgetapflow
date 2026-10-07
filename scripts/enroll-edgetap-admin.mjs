// Never signup/invite/auto-confirm. Deliberately enroll the verified real owner.
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const mode=process.argv[2]||'--inspect';
if(!['--inspect','--apply'].includes(mode)||process.argv.length>3)throw new Error('Use --inspect or --apply');
const project=JSON.parse(await readFile('supabase/project.json','utf8'));
if(project.project_ref!=='dxyxvervvlxhwwbcbttd'||(await readFile('supabase/.temp/project-ref','utf8')).trim()!==project.project_ref)throw new Error('Refuse any destination other than the linked approved EdgeTap project.');
const run=file=>{const result=spawnSync('supabase',['db','query','--linked','--project-ref',project.project_ref,'--file',file],{stdio:'inherit'});if(result.status!==0)throw new Error('Operator query failed; no signup/reset/retry attempted.');};
run('supabase/inspect-owner-account.sql');
if(mode==='--apply')run('supabase/enroll-owner-account.sql');
