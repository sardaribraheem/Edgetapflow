import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, runTransaction, setLogLevel } from "firebase/firestore";
import { ref, uploadBytes, getBytes, getMetadata, deleteObject } from "firebase/storage";

setLogLevel("silent");
const projectId = "demo-edgetap-qa";
const env = await initializeTestEnvironment({ projectId,
  firestore: { host: "127.0.0.1", port: 8085, rules: await readFile("firestore.rules", "utf8") },
  storage: { host: "127.0.0.1", port: 9195, rules: await readFile("storage.rules", "utf8") },
});
const link = { type: "website", label: "Website", url: "https://example.com", icon: "globe", accent: "#100B4A" };
const profile = { username: "customer", displayName: "QA Customer", firstName: "QA", lastName: "Customer", title: "Tester", bio: "QA", location: "Pakistan", avatar: "", links: [link], ownerUid: "customer", active: true, profileId: "qa-profile" };
const customer = env.authenticatedContext("customer", { email: "qa@example.com" });
const other = env.authenticatedContext("other", { email: "other@example.com" });
const staff = env.authenticatedContext("staff", { email: "staff@example.com" });
const anon = env.unauthenticatedContext();
let checks = 0;
async function pass(promise) { await assertSucceeds(promise); checks++; }
async function deny(promise) { await assertFails(promise); checks++; }
try {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "config", "admin_uids"), { uids: ["staff"] });
    await setDoc(doc(ctx.firestore(), "profiles", "customer"), profile);
    await setDoc(doc(ctx.firestore(), "profiles", "hidden"), { ...profile, username: "hidden", active: false });
    await setDoc(doc(ctx.firestore(), "handles", "customer"), { profileId: "qa-profile" });
  });
  await pass(getDoc(doc(anon.firestore(), "profiles", "customer")));
  await pass(getDoc(doc(anon.firestore(), "profiles", "missing")));
  await deny(getDoc(doc(anon.firestore(), "profiles", "hidden")));
  await deny(getDoc(doc(customer.firestore(), "config", "admin_uids")));
  await pass(getDoc(doc(staff.firestore(), "config", "admin_uids")));
  await pass(getDoc(doc(staff.firestore(), "handles", "customer")));
  await deny(getDoc(doc(customer.firestore(), "handles", "customer")));
  await deny(setDoc(doc(customer.firestore(), "profiles", "unclaimed"), { ...profile, username: "unclaimed" }));
  await pass(updateDoc(doc(customer.firestore(), "profiles", "customer"), { displayName: "Updated", links: [link] }));
  await pass(updateDoc(doc(customer.firestore(), "profiles", "customer"), { links: Array(10).fill(link) }));
  await pass(updateDoc(doc(customer.firestore(), "profiles", "customer"), { links: [link] }));
  await deny(updateDoc(doc(other.firestore(), "profiles", "customer"), { displayName: "Hijacked" }));
  for (const patch of [{ownerUid: "other"}, {active: false}, {username: "other"}, {profileId: "other"}, {links: Array(11).fill(link)}, {links: [{...link, url:"javascript:alert(1)"}]}]) {
    await deny(updateDoc(doc(customer.firestore(), "profiles", "customer"), patch));
  }
  await deny(deleteDoc(doc(customer.firestore(), "profiles", "customer")));
  const order = { ownerUid: "customer", orderNumber: "ET-QA", plan: "standard", card: { template: "simple", quantity: 1 },
    profileDraft: { displayName: "QA", links: [link] }, customer: { fullName: "QA Customer", email: "qa@example.com", phone: "03044149674", address: "QA address" },
    deliveryMethod: "delivery", subtotal: 999, deliveryFee: null, total: null,
    payment: { method: "jazzcash", status: "pending", receiptUrl: "paymentReceipts/customer/receipt.png" },
    fulfillment: { status: "new", history: [{ status: "new", at: 1 }] }, createdAt: 1, updatedAt: 1 };
  await pass(setDoc(doc(customer.firestore(), "orders", "valid"), order));
  await pass(setDoc(doc(customer.firestore(), "orders", "ten-links"), { ...order, profileDraft: { ...order.profileDraft, links: Array(10).fill(link) } }));
  await deny(getDoc(doc(customer.firestore(), "orders", "valid")));
  await deny(getDoc(doc(anon.firestore(), "orders", "valid")));
  await pass(getDoc(doc(staff.firestore(), "orders", "valid")));
  await deny(updateDoc(doc(customer.firestore(), "orders", "valid"), { payment: { ...order.payment, status: "paid" } }));
  for (const [i, patch] of [{ownerUid:"other"}, {subtotal:1}, {plan:"business"}, {payment:{...order.payment,status:"paid"}}, {payment:{...order.payment,receiptUrl:"paymentReceipts/other/file.png"}}, {profileId:"injected"}, {fulfillment:{status:"delivered",history:[]}}, {deliveryMethod:"pickup"}].entries()) {
    await deny(setDoc(doc(customer.firestore(), "orders", `invalid-${i}`), {...order,...patch}));
  }
  await deny(setDoc(doc(anon.firestore(), "orders", "anonymous"), order));
  await deny(setDoc(doc(customer.firestore(), "reviews", "spoof"), { rating:5, authorUid:"other" }));
  // Concurrent reservation: exactly one transaction can claim the handle.
  const reserve = (id) => runTransaction(staff.firestore(), async tx => {
    const profileRef = doc(staff.firestore(), "profiles", "race");
    const handleRef = doc(staff.firestore(), "handles", "race");
    const [existing, handle] = await Promise.all([tx.get(profileRef),tx.get(handleRef)]);
    if (existing.exists() || handle.exists()) throw new Error("Taken");
    tx.set(profileRef, {...profile, username:"race", profileId:id});
    tx.set(handleRef, {profileId:id});
  });
  const results = await Promise.allSettled([reserve("one"), reserve("two")]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1); checks++;
  const bytes = new Uint8Array([137,80,78,71]);
  for (const folder of ["avatars", "paymentReceipts", "orderInbox"]) {
    const path = `${folder}/customer/file.png`;
    await pass(uploadBytes(ref(customer.storage(), path), bytes, { contentType:"image/png" }));
    await deny(uploadBytes(ref(other.storage(), path), bytes, { contentType:"image/png" }));
    await pass(getMetadata(ref(customer.storage(), path)));
    if (folder === "avatars") await pass(getBytes(ref(anon.storage(), path)));
    else { await deny(getBytes(ref(anon.storage(), path))); await deny(getBytes(ref(other.storage(), path))); await pass(getBytes(ref(staff.storage(), path))); }
    await pass(deleteObject(ref(customer.storage(), path)));
  }
  await deny(uploadBytes(ref(customer.storage(), "avatars/customer/unsafe.svg"), bytes, {contentType:"image/svg+xml"}));
  await deny(uploadBytes(ref(anon.storage(), "orderInbox/anonymous/file.png"), bytes, {contentType:"image/png"}));
  console.log(`PASS: ${checks} Firebase rule/collision checks`);
} finally { await env.cleanup(); }
