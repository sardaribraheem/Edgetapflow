// Read-only checks with the application's public key. No signup, upload, seed,
// order, email, staff enrollment or data mutation. Never uses operator credentials.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import nextEnv from '@next/env';
import { readFile } from 'node:fs/promises';
import { transpileModule,ModuleKind } from 'typescript';
nextEnv.loadEnvConfig(process.cwd());
const js=transpileModule(await readFile('lib/supabase-config.ts','utf8'),{compilerOptions:{module:ModuleKind.ES2022}}).outputText;
const {validateSupabaseConfig}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
let checks=0;
try{
 const {url,key}=validateSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
 const destination=JSON.parse(await readFile('supabase/project.json','utf8'));
 assert.equal(new URL(url).hostname,`${destination.project_ref}.supabase.co`,'Refuse any destination other than the confirmed EdgeTap project.');
 assert(/^[a-z]{20}[.]supabase[.]co$/.test(new URL(url).hostname),'Select an actual hosted project, not a local/mock endpoint.');
 assert(!/local_test|fixture/i.test(key),'Refuse a test fixture key.');
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const probe=async(name,args,deny=false)=>{
  const {data,error}=await client.rpc(name,args);if(deny)assert(error&&['42501','PGRST301','PGRST302'].includes(error.code),`${name}: expected permission denial`);else assert(!error,`${name}: RPC unavailable`);
  checks++;return data;
 };
 const missing=await probe('get_public_profile',{p_username:`qa-absent-${crypto.randomUUID().slice(0,8)}`});assert.equal(missing,null);
 const reviews=await probe('list_reviews',{p_limit:1});assert(Array.isArray(reviews));
 const ordering=await probe('get_order_settings');
 assert.equal(ordering.cardPrice,999);assert.equal(ordering.jazzcashNumber,'0304 4149674');
 assert.equal(ordering.emailNotificationsEnabled,false);assert.equal(ordering.designProofScope,'all_personalized');
 const legacyCatalog=await probe('get_pricing_catalog',{p_version:null});assert.deepEqual(ordering.offerPrices,{direct_link:legacyCatalog.direct_link.price,profile:legacyCatalog.profile.price},'Order settings must match the current immutable legacy offer catalog.');
 assert.equal(ordering.cardEditorVersion,4,'Released artwork/editor capability is missing.');
 assert.equal(ordering.designReviewVersion,1,'Released private-proof review capability is missing.');checks++;
 await probe('confirm_link_destination',{p_id:'nonexistent',p_version:1},true);
 await probe('share_design_proof',{p_id:'nonexistent',p_version:1},true);
 await probe('respond_to_design_proof',{p_id:'nonexistent',p_revision:1,p_action:'confirm',p_note:'',p_version:1},true);
 await probe('record_design_edit_payment',{p_id:'nonexistent',p_amount_minor:100,p_note:'anonymous denial probe',p_version:1},true);
 for(const name of ['get_my_orders','get_my_applications'])await probe(name,{},true);
 await probe('save_application_draft',{p_id:crypto.randomUUID(),p_payload:{},p_step:0,p_version:0},true);
 await probe('submit_application',{p_id:crypto.randomUUID(),p_version:1},true);
 await probe('verify_application_payment',{p_id:'nonexistent',p_version:1},true);
 await probe('dispatch_rider',{p_id:'nonexistent',p_fee_minor:0,p_message:'',p_version:1},true);
 for(const name of ['list_orders','is_staff'])await probe(name,{},true);
 await probe('find_order_submission',{p_request_key:crypto.randomUUID()},true);
 for(const [name,args] of [
  ['create_order',{p_order:{},p_request_key:crypto.randomUUID()}],
  ['confirm_payment',{p_id:'nonexistent'}],
  ['update_order_quote',{p_id:'nonexistent',p_delivery_fee_minor:0,p_version:1}],
  ['publish_order_profile',{p_id:'nonexistent',p_username:'ibraheem',p_version:1}],
  ['update_profile',{p_username:'ibraheem',p_profile:{}}]
 ])await probe(name,args,true);
 await probe('get_print_package',{p_id:'nonexistent',p_version:1},true);
 await probe('prepare_print_proof',{p_id:'nonexistent',p_physical:{},p_settings:{},p_front:'nonexistent',p_back:'nonexistent',p_pdf:'nonexistent',p_version:1},true);
 await probe('can_read_print_file',{p_name:'qa-absent.png'},true);
 for(const table of ['profiles','customers','orders','payments','reviews','order_applications']){
  const {error}=await client.from(table).select('*').limit(1);assert(error&&['42501','PGRST301','PGRST302'].includes(error.code),`${table}: unexpected anonymous table access`);checks++;
 }
 const detailed=await probe('get_product_catalog',{});assert(detailed.version>0);assert(!('costs' in detailed));for(const value of Object.values(detailed.prices))assert(Number.isFinite(value)&&value>0);
 const tagQuote=await probe('get_product_quote',{p_selection:{hardware:'tag',finish:'unprinted',destination:'unprogrammed',service:'none',quantity:1,assisted:false,delivery:'pickup'},p_catalog_version:detailed.version});assert.equal(tagQuote.total,detailed.prices.tagBlank);
 const plans=await probe('get_profile_plan_policy',{});assert.equal(plans.trialDays,14);assert.equal(plans.annualPrice,detailed.prices.profileAnnual);
 for(const [name,args] of [
  ['admin_backup_overview',{}],['admin_export_business_data',{p_scope:'all',p_id:null}],['admin_product_catalog',{}],
  ['admin_save_product_catalog',{p_data:{},p_expected_version:0,p_publish:false}],['admin_save_product_costs',{p_data:{},p_version:0}],
  ['admin_public_image_policy',{}],['admin_set_public_image_limit',{p_strict:true,p_expected_limit:0,p_confirmation:''}],
  ['admin_profile_plan_policy',{}],['admin_set_profile_plan_policy',{p_enabled:true,p_version:0,p_confirmation:''}],
  ['create_product_order',{p_selection:{},p_contact:{},p_payment:{},p_catalog_version:0,p_request_key:crypto.randomUUID()}],
  ['create_website_profile',{p_profile:{},p_request_key:crypto.randomUUID(),p_accept_trial:true}],
  ['get_my_profile_sections',{p_id:crypto.randomUUID()}],['save_my_profile_sections',{p_id:crypto.randomUUID(),p_data:{},p_version:0}]
 ])await probe(name,args,true);
 const deniedSchema=await fetch(`${url}/rest/v1/profiles?limit=1`,{headers:{apikey:key,'Accept-Profile':'private'}});
 assert.equal(deniedSchema.status,406);assert.equal((await deniedSchema.json()).code,'PGRST106');checks++;
 const invalidJwt=await fetch(`${url}/rest/v1/rpc/get_public_profile`,{method:'POST',headers:{apikey:key,Authorization:'Bearer invalid-verification-probe','Content-Type':'application/json'},body:JSON.stringify({p_username:'ibraheem'})});
 assert.equal(invalidJwt.status,401);checks++;
 const settingsResponse=await fetch(`${url}/auth/v1/settings`,{headers:{apikey:key}});
 assert.equal(settingsResponse.status,200);const settings=await settingsResponse.json();
 assert.equal(settings.disable_signup,false);assert.equal(settings.mailer_autoconfirm,false);assert.equal(settings.external.email,true);assert.equal(settings.external.anonymous_users,false);checks++;
 const jwksResponse=await fetch(`${url}/auth/v1/.well-known/jwks.json`);assert.equal(jwksResponse.status,200);assert((await jwksResponse.json()).keys.length>0);checks++;
 for(const bucket of ['payment-receipts','order-artwork','print-packages']){
  const response=await fetch(`${url}/storage/v1/object/public/${bucket}/qa-absent.png`,{headers:{apikey:key}});
  assert([400,403,404].includes(response.status),`${bucket}: private public URL should fail`);checks++;
 }
 console.log(`HOSTED VERIFIED: ${checks} read-only RPC/anonymous-denial/absent-object checks. Missing profile returns null; no profile or asset was created. This does not verify real profile rendering, private-existing-byte isolation, signup/email, staff or order/payment flows.`);
}catch(error){console.error(`HOSTED VERIFICATION INCOMPLETE: ${error.message}`);process.exitCode=1;}
