// General /u/<handle> behavior against local PostgreSQL/RLS; no hosted writes.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBrowserFixture } from './supabase-browser-fixture.mjs';

const f = await createBrowserFixture();
const { browser, base, backend, setup, query, owner, other, profileId, flags, errors } = f;
let checks = 0;
try {
  await query('insert into public.profile_links(profile_id,position,type,label,url) values($1,0,$2,$3,$4),($1,1,$5,$6,$7),($1,2,$8,$9,$10)', [profileId, 'portfolio', 'Portfolio', 'https://example.test/work', 'mail', 'Email', 'mailto:fixture@example.test', 'phone', 'Phone', 'tel:+923000000000']);
  const secondId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  await query('insert into public.customers(id,auth_user_id) values($1,$1)', [other]);
  await query('insert into public.profiles(id,username,display_name) values($1,$2,$3)', [secondId, 'second-fixture', 'Second Fixture']);
  await query('insert into private.profile_owners values($1,$2)', [secondId, other]);

  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await setup(context);
    const page = await context.newPage();
    await page.goto(base + '/u/real-fixture');
    await page.getByRole('heading', { name: 'Fixture Customer', exact: true }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); checks++;
    assert.equal(await page.getByRole('button', { name: /Save Changes/ }).count(), 0); checks++;
    assert.equal(await page.getByRole('link', { name: 'Portfolio', exact: false }).getAttribute('href'), 'https://example.test/work'); checks++;
    assert.equal(await page.getByRole('link', { name: 'Email', exact: false }).getAttribute('target'), null); checks++;
    assert.equal(await page.getByRole('link', { name: 'Phone', exact: false }).getAttribute('target'), null); checks++;
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /Save Contact/ }).click();
    const file = await download;
    const card = await readFile(await file.path(), 'utf8');
    assert.equal(file.suggestedFilename(), 'real-fixture.vcf');
    assert(card.includes('FN:Fixture Customer') && card.includes('EMAIL:fixture@example.test') && card.includes('TEL:+923000000000'));
    assert(card.includes('/u/real-fixture')); checks++;
    await page.goto(base + '/u/second-fixture');
    await page.getByRole('heading', { name: 'Second Fixture', exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Fixture Customer', exact: true }).count(), 0); checks++;
    await page.goto(base + '/u/missing-fixture');
    await page.getByRole('heading', { name: 'Profile not found', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: /Save Contact/ }).count(), 0); checks++;
    await context.close();
  }

  const context = await browser.newContext();
  await setup(context);
  const page = await context.newPage();
  const signIn = async email => {
    await page.goto(base + '/account?next=' + encodeURIComponent('/u/real-fixture'));
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill('LocalOnly-1234');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL('**/u/real-fixture');
  };
  await signIn('customer@example.test');
  await page.getByLabel('Display name', { exact: true }).waitFor();
  await page.getByLabel('Display name', { exact: true }).fill('Updated Fixture');
  await page.getByLabel('Link 1 URL', { exact: true }).fill('javascript:alert(1)');
  await page.getByRole('button', { name: /Save Changes/ }).click();
  await page.getByRole('status').getByText(/valid contact URLs/).waitFor();
  assert.equal((await f.rpc(owner, 'get_public_profile', ['real-fixture'])).displayName, 'Fixture Customer'); checks++;
  await page.getByLabel('Link 1 URL', { exact: true }).fill('https://example.test/updated');
  await page.getByRole('button', { name: /Save Changes/ }).click();
  await page.getByRole('status').getByText('Profile updated.', { exact: true }).waitFor();
  assert.equal((await f.rpc(owner, 'get_public_profile', ['real-fixture'])).displayName, 'Updated Fixture'); checks++;
  await page.goto(base + '/account');
  await page.getByRole('button', { name: 'Sign out this browser', exact: true }).click();
  await signIn('other@example.test');
  await page.getByRole('heading', { name: 'Updated Fixture', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: /Save Changes/ }).count(), 0);
  assert.equal(await page.getByRole('link', { name: 'Sign in to edit', exact: true }).count(), 0); checks++;
  await context.close();

  const retryContext = await browser.newContext();
  await setup(retryContext);
  let failOnce = true;
  await retryContext.route(backend + '/rest/v1/rpc/get_public_profile', route => {
    if (failOnce) { failOnce = false; return route.fulfill({ status: 403, json: { message: 'Local fixture transport failure' } }); }
    return route.fallback();
  });
  flags.expectedNetworkError = true;
  const retryPage = await retryContext.newPage();
  await retryPage.goto(base + '/u/real-fixture');
  await retryPage.getByRole('heading', { name: 'Profile unavailable', exact: true }).waitFor();
  assert(!(await retryPage.locator('body').innerText()).includes('Local fixture transport failure')); checks++;
  await retryPage.getByRole('button', { name: 'Try again', exact: true }).click();
  await retryPage.getByRole('heading', { name: 'Updated Fixture', exact: true }).waitFor(); checks++;
  flags.expectedNetworkError = false;
  await query('update public.profiles set active=false where id=$1', [secondId]);
  await retryPage.goto(base + '/u/second-fixture');
  await retryPage.getByRole('heading', { name: 'Profile not found', exact: true }).waitFor(); checks++;
  await retryContext.close();

  const staffContext = await browser.newContext();
  await setup(staffContext);
  const admin = await staffContext.newPage();
  await admin.goto(base + '/admin');
  await admin.getByLabel('Email', { exact: true }).fill('staff@example.test');
  await admin.getByLabel('Password', { exact: true }).fill('LocalOnly-1234');
  await admin.getByRole('button', { name: 'Sign In to Dashboard', exact: true }).click();
  await admin.getByRole('navigation', { name: 'Admin sections' }).getByRole('button', { name: 'Profiles', exact: true }).click();
  await admin.getByRole('status').getByText(/owner profile hasn’t been created/).waitFor();
  assert.equal(await admin.getByRole('link', { name: /View live/ }).count(), 0); checks++;
  await admin.getByLabel('Display Name', { exact: true }).fill('Founder Fixture');
  await admin.getByLabel('Title / Subtitle', { exact: true }).fill('Local test profile');
  await admin.getByRole('button', { name: 'Save All Changes', exact: true }).click();
  await admin.getByText('Profile saved ✓', { exact: true }).waitFor();
  assert.equal((await f.rpc(null, 'get_public_profile', ['ibraheem'])).displayName, 'Founder Fixture'); checks++;
  const popup = admin.waitForEvent('popup');
  await admin.getByRole('link', { name: /View live/ }).click();
  await (await popup).getByRole('heading', { name: 'Founder Fixture', exact: true }).waitFor(); checks++;
  await staffContext.close();
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(`PASS ${checks} profile browser checks: independent handles, responsive published profiles, contact links/vCard, owner edit, unsafe URL rejection, unrelated-user guards, missing/hidden profiles and transient-error retry. Local SQL/RLS; Auth/Storage simulated; no production profile created.`);
} finally { await f.close(); }
