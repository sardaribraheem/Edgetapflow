import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createTestDatabase} from './supabase-test-db.mjs';
const db=await createTestDatabase({migrate:false});let checks=0;
const rpc=async(name,args=[])=>(await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) value`,args)).rows[0].value;
async function as(uid,work){await db.exec(uid?'set role authenticated':'set role anon');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);try{return await work();}finally{await db.exec('reset role');}}
async function test(label,fn){await fn();checks++;console.log('PASS '+label);}
const users=Array.from({length:18},(_,i)=>'22222222-2222-4222-8222-'+String(i+1).padStart(12,'0'));
const ratings=[3,5,4.5,5,4,5,4.5,1,5,4.5,2,5,4.5,3.5,4,4.5,5,4.5];
try{
 for(const f of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')&&!f.includes('0016')).sort())await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 for(let i=0;i<users.length;i++){await db.query('insert into auth.users values($1,$2)',[users[i],'review'+i+'@example.test']);await as(users[i],()=>rpc('submit_website_review',['Reviewer '+i,'My public experience '+i,ratings[i]]));}
 await as(users[0],()=>rpc('submit_feedback',['PRIVATE feedback must stay private',1]));
 await db.query("insert into public.reviews(username,rating,text,author_name) values('legacy',5,'Already public legacy review','Legacy reviewer')");
 await test('anonymous listing has a strict eight-review first page sorted by rating',()=>as(null,async()=>{const p=await rpc('list_website_reviews',[999]);assert.equal(p.reviews.length,8);assert(p.hasMore);assert.deepEqual(p.reviews.map(r=>r.rating),[5,5,5,5,5,5,5,4.5]);assert(!JSON.stringify(p).includes('author_id'));assert(!JSON.stringify(p).includes('@example.test'));assert(!JSON.stringify(p).includes('PRIVATE'));}));
 await test('cursor pages contain all reviews once, in descending rating order',()=>as(null,async()=>{let c=null,all=[];do{const p=await rpc('list_website_reviews',[8,c?.rating??null,c?.createdAt??null,c?.id??null]);assert(p.reviews.length<=8);all.push(...p.reviews);c=p.hasMore?p.nextCursor:null;}while(c);assert.equal(all.length,19);assert.equal(new Set(all.map(r=>r.id)).size,19);assert(all.every((r,i)=>!i||all[i-1].rating>=r.rating));assert(all.some(r=>r.rating===1));assert(all.some(r=>r.rating===4.5));}));
 await test('anonymous publication and direct table access are denied',()=>as(null,async()=>{await assert.rejects(()=>rpc('submit_website_review',['Someone','Attempt to publish',5]));await assert.rejects(()=>db.query('select * from private.website_reviews'));}));
 await test('ratings and names are validated; review spam is rejected',()=>as(users[0],async()=>{for(const args of [['A','Valid review',5],['Valid name','x',5],['Valid name','Valid review',4.75],['Valid name','Valid review',6],['Valid name','Valid review',null]])await assert.rejects(()=>rpc('submit_website_review',args));await assert.rejects(()=>rpc('submit_website_review',['Repeat name','Immediate duplicate',5]));await assert.rejects(()=>db.query("update private.website_reviews set body='tampered'"));}));
 await test('an account updates only its own single published review',async()=>{await db.query("update private.website_reviews set created_at=created_at-interval '2 minutes' where author_id=$1",[users[0]]);await as(users[0],()=>rpc('submit_website_review',['Updated public name','Updated public review',4.5]));const rows=(await db.query('select author_name,rating,body from private.website_reviews where author_id=$1',[users[0]])).rows;assert.equal(rows.length,1);assert.equal(rows[0].author_name,'Updated public name');assert.equal(Number(rows[0].rating),4.5);assert.equal((await db.query('select count(*)::int n from private.website_reviews')).rows[0].n,18);});
 await test('legacy public review API and private feedback remain independent',()=>as(null,async()=>{const legacy=await rpc('list_reviews',[20]);assert.equal(legacy.length,1);assert.equal(legacy[0].authorName,'Legacy reviewer');}));
 assert.equal((await db.query('select count(*)::int n from private.customer_feedback')).rows[0].n,1);
 await test('partial pagination cursors are rejected',()=>as(null,()=>assert.rejects(()=>rpc('list_website_reviews',[8,5,null,null]))));
 console.log(`PASS ${checks} public review privacy, ranking and pagination scenarios. Local fixtures only.`);
}catch(error){console.error(error.message,error.where||'');process.exitCode=1;}finally{await db.close();}
