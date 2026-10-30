// Read-only publication verification. Uses public RPCs and fresh anonymous
// browsers; never signs in, creates media, changes profiles or sends messages.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const origin='https://edgetap.tech';
const backend=process.env.NEXT_PUBLIC_SUPABASE_URL;
assert.equal(backend,'https://dxyxvervvlxhwwbcbttd.supabase.co');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
let checks=0;
const check=(value,label)=>{assert(value,label);checks++;console.log('PASS '+label);};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const get=url=>fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});
async function rpc(name,body={}){
 const response=await fetch(backend+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 assert(response.ok,'Public RPC unavailable: '+name);
 return response.json();
}

for(const host of [origin,'https://edgetapflow.web.app','https://edgetapflow.firebaseapp.com']){
 const pages=host===origin?[['/','index.html'],['/pricing','pricing.html'],['/profile','profile.html'],['/admin','admin.html'],['/account/profile','account/profile.html'],['/u/ibraheem','u/ibraheem.html'],['/u/tarsilpk','profile.html']]:[['/pricing','pricing.html'],['/profile','profile.html']];
 for(const [path,file] of pages){
  const response=await get(host+path);
  check(response.ok&&hash(Buffer.from(await response.arrayBuffer()))===hash(await readFile('out/'+file)),'Reviewed '+path+' bytes live on '+host);
  check(/max-age=0.*must-revalidate/.test(response.headers.get('cache-control')||''),'HTML revalidates: '+host+path);
  if(/^\/(profile|admin|account|u)(\/|$)/.test(path))check(/noindex/.test(response.headers.get('x-robots-tag')||''),'Private/profile noindex: '+host+path);
 }
}
const html=await readFile('out/profile.html','utf8');
const asset=html.match(/src="([^"?]*\/_next\/static\/[^"?]+\.js)/)?.[1];
assert(asset,'No hashed framework asset found');
const assetResponse=await get(new URL(asset,origin));
check(assetResponse.ok&&/max-age=31536000.*immutable/.test(assetResponse.headers.get('cache-control')||''),'Hashed scripts retain immutable caching');
const media=await rpc('get_profile_media_policy');
check(media.freePhotos===5&&media.freeVideos===1&&media.maxInputMb===10&&media.maxPhotoBytes===256000,'Gallery limits are available from the hosted policy');
check(media.premiumPurchasable===false,'Premium media sales stay disabled');
const plans=await rpc('get_profile_plan_policy'),catalog=await rpc('get_product_catalog'),settings=await rpc('get_order_settings');
check(plans.futureAccountTrial===false&&catalog.available.annual===false,'Annual sales and future trials stay disabled');
check(settings.emailNotificationsEnabled===false,'Order email sending stays disabled');

const browser=await chromium.launch({headless:true});
const errors=[];
let emailRequests=0;
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 context.on('request',request=>{if(/functions\/v1\/.*(?:email|notification)/.test(request.url()))emailRequests++;});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 for(const handle of ['ibraheem','tarsilpk']){
  const profile=await rpc('get_public_profile',{p_username:handle});
  assert.equal(profile?.username,handle,'Protected profile unavailable');
  await page.goto(origin+'/u/'+handle);
  await page.getByRole('heading',{name:profile.displayName,exact:true}).waitFor();
  if(profile.bio)check(await page.locator('.card-paper header .profile-bio').innerText()===profile.bio,'Saved About text stays with the identity: '+handle);
  const contacts=page.getByRole('region',{name:'Contact actions',exact:true});
  await contacts.waitFor();
  const rendered=await contacts.locator('a').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
  check(profile.links.every(link=>rendered.includes(link.url)),'Saved public contact links render: '+handle);
  check(await page.locator('main').getByText('Edit profile',{exact:true}).count()===0,'Public profile has no owner edit control: '+handle);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   const fits=await page.evaluate(()=>{
    const card=document.querySelector('.card-paper').getBoundingClientRect(),actions=document.querySelector('[aria-label="Contact actions"]');
    const details=document.querySelector('.profile-details');
    const bounds=actions.getBoundingClientRect();
    return document.documentElement.scrollWidth<=innerWidth+1&&bounds.left>=card.left&&bounds.right<=card.right&&(!details||bounds.bottom<=details.getBoundingClientRect().top);
   });
   check(fits,'Links precede optional content and fit at '+width+'px: '+handle);
  }
 }
 await page.goto(origin+'/u/qa-absent-'+crypto.randomUUID().slice(0,8));
 await page.getByRole('heading',{name:'Profile not found',exact:true}).waitFor();
 check(true,'Unknown handle never falls back to the founder');
 await page.goto(origin+'/pricing');
 check(!await page.locator('.price-details-table').isVisible()&&!await page.locator('.profile-media-offer').isVisible(),'Detailed catalog and premium previews stay hidden on initial pricing view');
 check(await page.locator('.pricing-option').count()===3,'Pricing leads with three main offers');
 check((await page.locator('.pricing-page').innerText()).split(/\s+/).length<280,'Default pricing copy stays concise');
 await page.getByRole('button',{name:'Show detailed prices',exact:true}).click();
 await page.getByRole('heading',{name:'Show the work behind your links.',exact:true}).waitFor();
 check((await page.locator('.profile-media-offer').innerText()).includes('Premium checkout is not open'),'Live gallery offer discloses the premium preview');
 check(await page.getByRole('button',{name:'Hide detailed prices',exact:true}).getAttribute('aria-expanded')==='true','Detailed-price control reports its expanded state');
 await page.getByRole('button',{name:'Hide detailed prices',exact:true}).click();
 check(!await page.locator('.price-details-table').isVisible(),'Visitors can hide the catalog again');
 await page.goto(origin+'/pricing#price-details');
 await page.getByRole('heading',{name:'Every option, priced clearly.',exact:true}).waitFor();
 check(true,'Existing detailed-price links open the catalog directly');
 check(errors.length===0,'No uncaught browser errors');
 check(emailRequests===0,'No email worker requests');
 await context.close();
 console.log(`PASS ${checks} live profile/media publication checks. No sign-in, upload, customer mutation or messages; real customer uploads/private bytes and physical acceptance remain separate.`);
}finally{await browser.close();}
