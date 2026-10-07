// Uses the existing CLI login. No tokens/passwords are accepted on the command
// line, printed or committed. Does not create/resume projects or enable billing.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [ref,mode='--inspect',...extra]=process.argv.slice(2);
if(!/^[a-z]{20}$/.test(ref||'')||!['--inspect','--apply'].includes(mode)||extra.length){
 console.error('Usage: node scripts/setup-clean-supabase.mjs <confirmed-project-ref> [--inspect|--apply]');process.exit(1);
}
const run=(args,{capture=false}={})=>{
 const result=spawnSync('supabase',args,{cwd:root,encoding:'utf8',maxBuffer:10*1024*1024,stdio:capture?'pipe':'inherit'});
 if(result.error||result.status!==0)throw new Error('Supabase CLI command failed. No reset/retry/provisioning will be attempted.');
 return result.stdout;
};
try{
 const projects=JSON.parse(run(['projects','list','--output','json'],{capture:true}));
 const project=projects.find(p=>(p.id||p.ref)===ref);
 if(!project)throw new Error('Confirmed project is not accessible through this CLI login.');
 if(project.status!=='ACTIVE_HEALTHY')throw new Error('Destination is not active/healthy; this script will not resume or provision it.');
 console.log(`Inspecting confirmed destination ${project.name} (${ref}). No seed/import or Firebase operations.`);
 run(['db','query','--project-ref',ref,'--file','supabase/inspect-target.sql']);
 if(mode==='--inspect')process.exit(0);
 run(['db','query','--project-ref',ref,'--file','supabase/require-clean-target.sql']);
 console.log('Setup commands: link selected project, db push --dry-run, db push. No --include-seed/--include-roles, no reset.');
 run(['link','--project-ref',ref]);
 run(['db','push','--dry-run']);
 run(['db','push']);
 run(['db','query','--project-ref',ref,'--file','supabase/verify-clean-bootstrap.sql']);
 console.log('Additive migrations applied. Hosted Auth/Storage/customer-flow verification remains required.');
}catch(error){console.error(error.message);process.exitCode=1;}
