// Exercise actual TypeScript services against local Firebase emulators.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import assert from "node:assert/strict";
import ts from "typescript";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { connectFirestoreEmulator, doc, setDoc, setLogLevel } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";
setLogLevel("silent");
const moduleRoot=resolve("test-results/service-modules");
await mkdir(moduleRoot,{recursive:true});
await writeFile(`${moduleRoot}/package.json`,'{"type":"module"}');
for (const file of ["firebase","firestore","storage","site","links","contact","qr","models","data/order","data/profile"]) {
  let source=await readFile(`lib/${file}.ts`,"utf8");
  let output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  output=output.replace(/(from\s+["']|import\(["'])(\.[^"']+)(["'])/g,(_,before,path,after)=>`${before}${path}.js${after}`);
  const path=`${moduleRoot}/${file}.js`; await mkdir(dirname(path),{recursive:true}); await writeFile(path,output);
}
Object.assign(process.env,{NEXT_PUBLIC_FIREBASE_API_KEY:"demo-key", NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:"demo-edgetap-qa.firebaseapp.com",NEXT_PUBLIC_FIREBASE_PROJECT_ID:"demo-edgetap-qa",NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:"demo-edgetap-qa.appspot.com",NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:"123",NEXT_PUBLIC_FIREBASE_APP_ID:"demo-app",NEXT_PUBLIC_APP_URL:"https://edgetapflow.web.app"});
const {auth,db,storage}=await import(pathToFileURL(`${moduleRoot}/firebase.js`));
connectAuthEmulator(auth,"http://127.0.0.1:9095",{disableWarnings:true});
connectFirestoreEmulator(db,"127.0.0.1",8085);
connectStorageEmulator(storage,"127.0.0.1",9195);
const service=await import(pathToFileURL(`${moduleRoot}/firestore.js`));
const uploads=await import(pathToFileURL(`${moduleRoot}/storage.js`));
const {canTransition}=await import(pathToFileURL(`${moduleRoot}/data/order.js`));
const {profileUrl,profileReturnPath}=await import(pathToFileURL(`${moduleRoot}/site.js`));
const {qrDataUrl}=await import(pathToFileURL(`${moduleRoot}/qr.js`));
const {contactVCard}=await import(pathToFileURL(`${moduleRoot}/contact.js`));
const {isSafeContactUrl}=await import(pathToFileURL(`${moduleRoot}/links.js`));
const env=await initializeTestEnvironment({projectId:"demo-edgetap-qa",firestore:{host:"127.0.0.1",port:8085},storage:{host:"127.0.0.1",port:9195}});
let checks=0;
const check=(condition,message)=>{assert(condition,message);checks++;};
try {
  const customer=(await createUserWithEmailAndPassword(auth,"service-customer@example.com","EmulatorOnly-1234")).user;
  const file=new File([new Uint8Array([137,80,78,71])],"receipt.png",{type:"image/png"});
  const receipt=await uploads.uploadPaymentReceipt(customer.uid,file);
  check(receipt.startsWith(`paymentReceipts/${customer.uid}/`),"Receipt must store private path");
  const art=await uploads.uploadCustomDesign(customer.uid,file);
  check(art.startsWith(`orderInbox/${customer.uid}/`),"Artwork must store private path");
  const now=Date.now();
  const order={ownerUid:customer.uid,orderNumber:"ET-SERVICE",plan:"standard",card:{template:"upload",quantity:2,customDesignUrl:art},profileDraft:{displayName:"Service Customer",links:[{type:"website",label:"Website",url:"https://example.com",icon:"globe",accent:"#100B4A"}]},customer:{fullName:"Service Customer",phone:"03044149674",email:"service-customer@example.com",address:"Emulator address"},deliveryMethod:"delivery",subtotal:1998,deliveryFee:null,total:null,payment:{method:"jazzcash",status:"pending",receiptUrl:receipt},fulfillment:{status:"new",history:[{status:"new",at:now}]},createdAt:now,updatedAt:now};
  const ids=await Promise.all([service.createOrder(order),service.createOrder({...order,orderNumber:"ET-SERVICE-2"})]);
  check(ids[0]!==ids[1],"Orders persisted");
  await assert.rejects(service.getOrder(ids[0]));checks++;
  const staff=(await createUserWithEmailAndPassword(auth,"service-staff@example.com","EmulatorOnly-1234")).user;
  await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),"config","admin_uids"),{uids:["staff",staff.uid]}));
  for (const id of ids) {
    const pending=await service.getOrder(id);
    check(pending.subtotal===1998 && pending.payment.status==="pending","Server rules protected price/payment");
    await assert.rejects(service.createClientProfileFromOrder(pending,"servicecustomer"));checks++;
    await service.confirmPayment(pending);
  }
  const orders=await Promise.all(ids.map(service.getOrder));
  const results=await Promise.allSettled(orders.map(order=>service.createClientProfileFromOrder(order,"servicecustomer")));
  check(results.filter(r=>r.status==="fulfilled").length===1,"Real service transaction must prevent collisions");
  const winning=await service.getOrder(ids[results.findIndex(r=>r.status==="fulfilled")]);
  check(winning.fulfillment.status==="profile_created" && winning.nfcUrl===profileUrl("servicecustomer"),"Profile and card destination agree");
  check(await qrDataUrl(winning.nfcUrl) .then(url=>url.startsWith("data:image/png;base64,")),"QR generation");
  for (const status of ["production_ready","printing","ready_for_nfc","nfc_programmed","qa_passed","ready_to_ship","shipped","delivered"]) {
    const current=await service.getOrder(winning.id); await service.advanceFulfillment(winning.id,current.fulfillment.status,status); checks++;
  }
  check(!canTransition("new","shipped") && !canTransition("printing","qa_passed"),"Must not skip production/QA");
  await signInWithEmailAndPassword(auth,"service-customer@example.com","EmulatorOnly-1234");
  const profile=await service.getProfile("servicecustomer");
  await service.saveProfile("servicecustomer",{...profile,displayName:"Updated Customer"});
  check((await service.getProfile("servicecustomer")).displayName==="Updated Customer","Owner save persists");
  await assert.rejects(service.saveProfile("servicecustomer",{...profile,links:[{...profile.links[0],url:"javascript:alert(1)"}]}));checks++;
  await signOut(auth);
  check((await service.getProfile("servicecustomer")).displayName==="Updated Customer","Anonymous public profile read");
  await assert.rejects(service.saveProfile("servicecustomer",profile));checks++;
  const vcard=contactVCard({...profile,displayName:"QA\nInjected:bad"});
  check(vcard.includes("FN:QA\\nInjected:bad") && !vcard.includes("\r\nInjected"),"vCard escaping");
  for(const url of ["javascript:alert(1)","data:text/html,test","//example.com","https://user:secret@example.com","https://example.com\nX"]) check(!isSafeContactUrl(url),"Unsafe URL rejected");
  check(profileReturnPath("/u/customer")==="/u/customer","Local customer return path");
  for (const value of ["//example.com", "https://example.com", "/\\example.com", "/admin", "/u/customer?next=//example.com"]) check(profileReturnPath(value)==="/","Unsafe return path rejected");
  console.log(`PASS: ${checks} actual-service assertions against local emulators`);
} finally { await env.cleanup(); }
process.exit(0);
