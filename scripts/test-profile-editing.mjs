import assert from 'node:assert/strict';
import {createTestDatabase} from './supabase-test-db.mjs';
const db=await createTestDatabase();let checks=0;
const owner='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333',staff='11111111-1111-4111-8111-111111111111';
const profileId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const query=(sql,args=[])=>db.query(sql,args);
const as=async(uid,work)=>{await db.exec(uid?'set role authenticated':'set role anon');await query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);try{return await work();}finally{await db.exec('reset role');}};
const rpc=async(name,args=[]) => (await query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as value`,args)).rows[0].value;
const test=async(name,work)=>{await work();checks++;console.log('PASS '+name);};
try{
 await query('insert into auth.users values($1,$2),($3,$4),($5,$6)',[owner,'customer@example.test',other,'other@example.test',staff,'staff@example.test']);
 await query('insert into public.customers(id,auth_user_id) values($1,$1),($2,$2)',[owner,other]);
 await query("insert into private.admin_members(user_id,provenance) values($1,'Local profile test')",[staff]);
 await query("insert into public.profiles(id,username,display_name) values($1,'editing-fixture','Fixture')",[profileId]);
 await query('insert into private.profile_owners values($1,$2)',[profileId,owner]);
 await query("insert into storage.objects(bucket_id,name) values('avatars',$1),('avatars',$2)",[owner+'/photo.png',other+'/photo.png']);
 await test('profile discovery requires sign-in and returns only the active owner profiles',async()=>{await as(null,()=>assert.rejects(()=>rpc('get_my_profiles')));await as(other,async()=>assert.equal((await rpc('get_my_profiles')).length,0));await as(owner,async()=>assert.equal((await rpc('get_my_profiles'))[0].username,'editing-fixture'));});
 const photo='https://edgetap-migration-test.supabase.co/storage/v1/object/public/avatars/'+owner+'/photo.png';
 let current;
 await test('owner can publish name, bio, title, location, links and an owned avatar',()=>as(owner,async()=>{current=await rpc('get_public_profile',['editing-fixture']);await rpc('update_profile',['editing-fixture',{...current,displayName:'Updated Fixture',firstName:'Updated',lastName:'Fixture',bio:'New bio',title:'Designer',location:'Fixture city',avatar:photo,links:[{type:'email',label:'Email',url:'mailto:fixture@example.test',icon:'mail',accent:'#100B4A'}]}]);current=await rpc('get_public_profile',['editing-fixture']);assert.equal(current.avatar,photo);assert.equal(current.bio,'New bio');assert.equal(current.firstName,'Updated');assert.equal(current.links.length,1);}));
 await test('handle, owner, stable ID and publication changes are rejected',()=>as(owner,async()=>{for(const patch of [{username:'renamed'},{ownerUid:other},{profileId:other},{active:false}])await assert.rejects(()=>rpc('update_profile',['editing-fixture',{...current,...patch}]));assert.equal((await rpc('get_public_profile',['editing-fixture'])).version,current.version);}));
 await test('foreign, non-storage and insecure avatar URLs fail without changing the profile',()=>as(owner,async()=>{for(const avatar of [photo.replace(owner,other),'https://example.test/photo.png',photo.replace('https:','http:')])await assert.rejects(()=>rpc('update_profile',['editing-fixture',{...current,avatar}]));}));
 await test('unsafe links roll back the whole profile change and stale saves cannot overwrite',()=>as(owner,async()=>{await assert.rejects(()=>rpc('update_profile',['editing-fixture',{...current,displayName:'Do not save',links:[{type:'website',label:'Bad',url:'javascript:alert(1)'}]}]));assert.equal((await rpc('get_public_profile',['editing-fixture'])).displayName,'Updated Fixture');await rpc('update_profile',['editing-fixture',{...current,avatar:''}]);await assert.rejects(()=>rpc('update_profile',['editing-fixture',current]));current=await rpc('get_public_profile',['editing-fixture']);assert.equal(current.avatar,'');}));
 await test('unrelated accounts cannot edit; staff can manage an active profile',async()=>{await as(other,()=>assert.rejects(()=>rpc('update_profile',['editing-fixture',current])));await as(staff,()=>rpc('update_profile',['editing-fixture',{...current,bio:'Reviewed by local staff'}]));});
 await test('hidden profiles stay inaccessible and cannot be republished by their owner',async()=>{await query('update public.profiles set active=false where id=$1',[profileId]);await as(owner,async()=>{assert.equal((await rpc('get_my_profiles')).length,0);await assert.rejects(()=>rpc('update_profile',['editing-fixture',{...current,active:true}]));});});
 console.log(`PASS ${checks} profile editing security checks. Local SQL only; no hosted profile changed.`);
}finally{await db.close();}
