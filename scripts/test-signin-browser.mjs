// Real local SQL/RLS and the installed Auth SDK; simulated Auth/Storage HTTP only.
// No production credentials, accounts, orders, email or money.
import assert from 'node:assert/strict';
import { createBrowserFixture } from './supabase-browser-fixture.mjs';
const f = await createBrowserFixture();
const { browser, setup, base, flags, errors, owner, rpc, query } = f;
let checks = 0;
const size = 'Standard — 85.60 × 53.98 mm';
const device = page => page.evaluate(() => new Promise(resolve => {
  const request = indexedDB.open('edgetap-device-drafts', 1);
  request.onsuccess = () => {
    const db = request.result, get = db.transaction('drafts').objectStore('drafts').get('current');
    get.onsuccess = () => { resolve(get.result || null); db.close(); };
  };
}));
const fillLogin = async page => {
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test');
  await page.getByLabel('Password', { exact: true }).fill('LocalOnly-1234');
};
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  await setup(context);
  const page = await context.newPage();
  await page.goto(base + '/account');
  await page.getByRole('heading', { name: 'Sign in to EdgeTap', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Sign out this browser', exact: true }).count(), 0);
  checks++;

  await page.getByRole('button', { name: 'Create a new account', exact: true }).click();
  await fillLogin(page);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.getByRole('status').getByText(/Confirm your email, then sign in here/).waitFor();
  await page.getByRole('heading', { name: 'Sign in to EdgeTap', exact: true }).waitFor();
  assert.equal(await page.getByLabel('Password', { exact: true }).inputValue(), '');
  assert.equal((await query('select count(*)::int as n from public.orders')).rows[0].n, 0);
  checks++;

  for (const [code, text] of [['email_not_confirmed', 'Confirm your email using the signup message before signing in.'], ['invalid_credentials', 'That email and password do not match an EdgeTap account.']]) {
    flags.signinError = code; flags.expectedNetworkError = true;
    await fillLogin(page); await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('alert').getByText(text, { exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: "You're signed in", exact: true }).count(), 0);
    checks++;
  }
  flags.signinError = null; flags.expectedNetworkError = false;
  const draftId = crypto.randomUUID();
  await rpc(owner, 'save_application_draft', [draftId, {
    card: { template: 'simple', quantity: 1, size }, customer: { fullName: '', phone: '', email: 'customer@example.test', address: '' },
    profileDraft: { displayName: 'Retained sign-in fixture', usernameSuggested: 'retained-signin', title: '', bio: '', links: [] }, deliveryMethod: 'delivery', payment: { method: 'jazzcash' }
  }, 1, 0]);
  await page.evaluate(() => { window.__QA_SAME_DOCUMENT = true; });
  await fillLogin(page); await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/account/orders');
  await page.getByRole('link', { name: 'Resume draft: Retained sign-in fixture', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.__QA_SAME_DOCUMENT), true, 'Sign-in must not reload the entire document');
  checks++;

  const otherTab = await context.newPage(); await otherTab.goto(base + '/account');
  await otherTab.getByRole('heading', { name: "You're signed in", exact: true }).waitFor();
  assert.equal(await otherTab.getByLabel('Password', { exact: true }).count(), 0);
  await otherTab.evaluate(() => {
    const channel = new BroadcastChannel('sb-edgetap-migration-test-auth-token');
    channel.postMessage({ event: 'SIGNED_IN', session: JSON.parse(localStorage.getItem('sb-edgetap-migration-test-auth-token')) });
    channel.close();
  });
  await page.waitForTimeout(300); // Deliver the actual SDK cross-tab auth event.
  assert.equal(await page.getByRole('link', { name: 'Resume draft: Retained sign-in fixture', exact: true }).count(), 1);
  checks++;
  flags.delayOrdersReadOnceMs = 1200;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  for(let n=0;n<200&&!flags.delayedOrdersReadStarted;n++)await new Promise(resolve=>setTimeout(resolve,10));
  assert(flags.delayedOrdersReadStarted,'Fixture must actually hold an owner response during the account change');
  await otherTab.getByRole('button', { name: 'Sign out this browser', exact: true }).click();
  await otherTab.getByLabel('Email', { exact: true }).waitFor();
  await page.getByRole('link', { name: 'Sign in to view your private orders', exact: true }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Resume draft: Retained sign-in fixture', exact: true }).count(), 0);
  checks++;
  await otherTab.getByLabel('Email', { exact: true }).fill('other@example.test');
  await otherTab.getByLabel('Password', { exact: true }).fill('LocalOnly-1234');
  await otherTab.getByRole('button', { name: 'Sign in', exact: true }).click();
  await otherTab.waitForURL('**/account/orders');
  await page.getByText('No submitted applications yet. Saved drafts are not submitted orders.', { exact: true }).waitFor();
  await page.waitForTimeout(1300);
  assert.equal(await page.getByRole('link', { name: 'Resume draft: Retained sign-in fixture', exact: true }).count(), 0);
  checks++;
  await context.close();

  const guest = await browser.newContext({ viewport: { width: 320, height: 900 } });
  await setup(guest); const card = await guest.newPage();
  await card.goto(base + '/pricing'); await card.getByRole('link', { name: 'Build my card', exact: false }).click();
  await card.getByRole('heading', { name: 'Choose your card', exact: true }).waitFor();
  await card.getByRole('button', { name: 'Continue →', exact: true }).click();
  await card.getByLabel('Name', { exact: true }).fill('Sign-in journey fixture');
  await card.getByLabel('Desired profile handle', { exact: true }).fill('signin-journey');
  await card.getByRole('button', { name: 'Continue →', exact: true }).click();
  await card.getByRole('button', { name: /Website|Portfolio/ }).first().click();
  await card.getByLabel('Link 1 URL', { exact: true }).fill('https://example.test');
  await card.getByRole('button', { name: 'Continue →', exact: true }).click();
  await card.getByRole('button', { name: 'Continue →', exact: true }).click();
  await card.getByRole('button', { name: /^NASTP Pickup/ }).click();
  await card.getByLabel('Full name', { exact: true }).fill('Local fixture');
  await card.getByLabel('Phone number', { exact: true }).fill('03044149674');
  await card.getByRole('button', { name: 'Continue to save profile', exact: true }).click();
  await card.getByRole('button', { name: 'I already have an account', exact: true }).click();
  await fillLogin(card); flags.signinError = 'email_not_confirmed'; flags.expectedNetworkError = true;
  await card.getByRole('button', { name: 'Sign in and continue', exact: true }).click();
  await card.getByRole('alert').getByText('Confirm your email before continuing.', { exact: true }).waitFor();
  const pending = await device(card);
  assert.equal(pending.payload.profileDraft.displayName, 'Sign-in journey fixture');
  assert(!JSON.stringify(pending).includes('LocalOnly-1234'));
  checks++;
  flags.signinError = null; flags.expectedNetworkError = false;
  await card.getByRole('button', { name: 'Forgot your password?', exact: true }).click();
  await card.getByRole('status').getByText(/If this address has an account, check your email for recovery instructions/).waitFor();
  assert.equal((await device(card)).id, pending.id); checks++;

  await card.goto(base + '/account');
  await card.getByRole('heading', { name: 'Sign in to EdgeTap', exact: true }).waitFor();
  flags.orderingUnavailable = true; flags.expectedNetworkError = true;
  await card.evaluate(() => { window.__QA_SAME_DOCUMENT = true; });
  await fillLogin(card); await card.getByRole('button', { name: 'Sign in', exact: true }).click();
  await card.waitForURL('**/order');
  await card.getByRole('alert').filter({hasText:'You are signed in, but online ordering is temporarily unavailable. Your card is still saved on this device. Try again later or contact EdgeTap.'}).waitFor();
  assert.equal(await card.evaluate(() => window.__QA_SAME_DOCUMENT), true);
  assert.equal((await device(card)).id, pending.id);
  assert.equal(await card.getByLabel('Payment receipt screenshot', { exact: true }).count(), 0);
  assert.equal((await query('select count(*)::int as n from storage.objects')).rows[0].n, 0);
  checks++;

  await card.getByRole('link', { name: 'My orders', exact: true }).click();
  await card.waitForURL('**/account/orders');
  await card.getByRole('alert').getByText(/You are signed in, but online ordering is temporarily unavailable/).waitFor();
  assert(!(await card.locator('body').innerText()).includes('No submitted applications yet'));
  assert(!/PGRST202|schema|function detail/.test(await card.locator('body').innerText()));
  flags.orderingUnavailable = false; flags.expectedNetworkError = false;
  await card.getByRole('button', { name: 'Retry loading orders', exact: true }).click();
  await card.getByRole('link', { name: 'Resume draft: Retained sign-in fixture', exact: true }).waitFor();
  checks++;
  await card.goto(base + '/account');
  await card.getByRole('link', { name: 'Continue your saved card', exact: true }).click();
  await card.getByRole('heading', { name: 'Manual JazzCash payment', exact: true }).waitFor();
  assert.equal(await device(card), null);
  await card.getByLabel('Payment receipt screenshot', { exact: true }).setInputFiles('public/apple-touch-icon.png');
  await card.getByText('Private proof saved to your account. You can replace it while editing.', { exact: true }).waitFor();
  await card.getByRole('button', { name: 'Continue →', exact: true }).click();
  await card.getByRole('button', { name: 'Submit application', exact: true }).click();
  await card.waitForURL('**/account/orders?order=*');
  const orders = await rpc(owner, 'get_my_orders');
  assert.equal(orders.length, 1); assert.equal(orders[0].payment.status, 'pending');
  assert.equal(orders[0].applicationId, pending.id); checks++;
  await guest.close();
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(`PASS ${checks} sign-in/order checks: confirmation/invalid credentials, SPA redirect, signed-in view, same-account event stability, cross-tab sign-out isolation, device draft/recovery retention, callback resume, missing ordering service boundaries and retry, manual receipt/submission. Local fixtures only; no real email/payment or hosted order.`);
} catch(error) {
  console.error('LOCAL SIGN-IN FIXTURE FAILURE:',error.message);
  for(const context of browser.contexts())for(const page of context.pages())console.error('Local fixture visible alerts:',await page.getByRole('alert').allTextContents());
  throw error;
} finally { await f.close(); }
