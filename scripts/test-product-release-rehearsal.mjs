// Rehearse the exact private operator transaction against synthetic data only.
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createTestDatabase} from './supabase-test-db.mjs';
const db=await createTestDatabase({migrate:false});
try{
 await db.exec('alter table auth.users add column email_confirmed_at timestamptz default now();alter table auth.users add column created_at timestamptz default now();create schema supabase_migrations;create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[])');
 for(const p of (await readdir('supabase/migrations')).filter(p=>p.endsWith('.sql')&&p<'202610300028'&&!p.includes('0016_')).sort()){await db.exec(await readFile('supabase/migrations/'+p,'utf8'));await db.query('insert into supabase_migrations.schema_migrations(version) values($1)',[p.split('_')[0]]);if(p.includes('0018_')){await db.exec(await readFile('../EdgeTapApp/docs/proposals/202610200019_mobile_digital_profiles.sql','utf8'));await db.query("insert into supabase_migrations.schema_migrations(version) values('202610200019')");}}
 const uid='22222222-2222-4222-8222-222222222222';await db.query("insert into auth.users(id,email) values($1,'release-fixture@example.test')",[uid]);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.query('select public.create_free_website_profile($1,$2)',[{username:'release-fixture',displayName:'Preserved Release Fixture',title:'Original title',bio:'Original biography',location:'Original location',avatar:'',links:[]},crypto.randomUUID()]);await db.query("select set_config('request.jwt.claim.sub','',false)");
 await db.exec(await readFile(process.argv[2]||process.env.EDGETAP_RELEASE_SQL||'REQUIRED_OPERATOR_SQL_FILE','utf8'));
 assert.equal((await db.query('select count(*)::int n from public.profiles')).rows[0].n,1);await db.exec(await readFile('supabase/verify-ordering-upgrade.sql','utf8'));
 console.log('PASS exact operator transaction and hosted read-only verifier rehearsed with synthetic existing customer/Auth/Storage/app state. No live writes.');
}catch(e){console.error('FAIL '+e.message);process.exitCode=1;}finally{await db.close();}
