// Read-only release checks. Run from the matching reviewed export directory.
// No signup, upload, order, feedback or email submission.
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const project = JSON.parse(await readFile('supabase/project.json','utf8')).project_ref;
const backend = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.equal(backend, `https://${project}.supabase.co`);
const base = 'https://edgetap.tech';
let checks = 0;
const verify = (condition, label) => { assert(condition, label); checks++; console.log('PASS '+label); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const origin of [base,'https://edgetapflow.web.app']) {
  const response = await fetch(origin+'/', { headers:{'Cache-Control':'no-cache'} });
  verify(response.status === 200 && hash(Buffer.from(await response.arrayBuffer())) === hash(await readFile('out/index.html')), 'Reviewed homepage is live at '+origin);
}
for (const path of ['/card-designs/maincard-v2.webp','/umar-story.webp','/icons/streamline/star.svg','/favicon.ico']) {
  const response = await fetch(base+path);
  verify(response.status === 200 && hash(Buffer.from(await response.arrayBuffer())) === hash(await readFile('out'+path)), 'Published asset matches reviewed bytes: '+path);
}
const preview = await fetch(base+'/card-previews/maincard-v2.webp');
verify(preview.ok && /immutable/.test(preview.headers.get('cache-control')), 'Chooser artwork has immutable browser caching');
const settingsResponse = await fetch(backend+'/rest/v1/rpc/get_order_settings', {method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:'{}'});
verify(settingsResponse.ok, 'Anonymous public settings RPC responds');
const settings = await settingsResponse.json();
verify(settings.checkoutVersion === 2 && settings.paymentMethods.map(m=>m.id).join(',') === 'jazzcash,easypaisa,bank' && settings.extraLinkPrice === 50, 'Live checkout has version 2, three methods and the confirmed extra-link fee');
verify(settings.emailNotificationsEnabled === false, 'Actual email delivery remains inactive');
const browser = await chromium.launch({headless:true});
const errors = [];
await mkdir('test-results/uiux-live', {recursive:true});
try {
  for (const width of [390,1440]) {
    const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'});
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(base+'/#how-to-order');
    await page.waitForFunction(() => document.querySelector('#solutions')?.dataset.pinned === 'true');
    await page.waitForTimeout(900);
    verify(await page.locator('.usecase-panel').count() === 4 && await page.locator('.tap-demo-stage').isVisible(), 'Four-slide story opens at the public anchor, width '+width);
    verify(await page.locator('.story-tap-demo .story-labels svg').count() === 2, 'Curved card/phone annotations hydrate, width '+width);
    await page.getByRole('button',{name:'Try a tap',exact:true}).click();
    await page.getByRole('button',{name:'Try again',exact:true}).waitFor();
    verify(await page.locator('.tap-demo-phone .phone-profile').count() === 1, 'Contact demo reveals founder profile, width '+width);
    await page.getByRole('button',{name:'How it works: slide 2',exact:true}).click();
    await page.waitForFunction(() => document.querySelector('.story-count')?.textContent === '2 / 4');
    await page.waitForTimeout(800); await page.locator('.story-qr-demo .story-tap-button').click();
    verify(await page.locator('.scan-line.is-scanning').isVisible(), 'QR camera scan runs, width '+width);
    await page.locator('.scan-demo-phone .phone-profile').waitFor();
    verify(true, 'QR scan opens the same profile, width '+width);
    await page.getByRole('button',{name:'How it works: slide 3',exact:true}).click();
    await page.waitForFunction(() => document.querySelector('.story-count')?.textContent === '3 / 4'); await page.waitForTimeout(900);
    verify((await page.locator('.connection-phone-right').innerText()).includes('Umar Khan') && await page.locator('.connected-phones .phone-profile').count() === 2, 'Two connected profile phones render, width '+width);
    await page.screenshot({path:`test-results/uiux-live/connected-${width}.png`});
    await page.goto(base+'/pricing');
    verify((await page.locator('.pricing-standard-price del').allTextContents()).join('|') === 'Rs. 1,399|Rs. 1,899|Rs. 36,999', 'Confirmed standard price comparisons are live, width '+width);
    await page.goto(base+'/#custom'); await page.getByRole('radio',{name:'5 stars',exact:true}).waitFor();
    verify(await page.getByRole('radio',{name:'5 stars',exact:true}).isChecked() && await page.locator('.feedback-stars .ui-icon').count() === 5, 'Compact default-five rating is live, width '+width);
    await page.goto(base+'/order?product=profile'); await page.getByRole('button',{name:'Black photography',exact:true}).waitFor();
    verify(await page.locator('.order-floating-icons').count() === 1 && await page.locator('.builder-heading .selected-card-summary').count() === 0, 'Builder doodles and clean progress area are live, width '+width);
    verify(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), 'Order builder has no horizontal overflow, width '+width);
    await context.close();
  }
  const page = await browser.newPage(); page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/u/ibraheem'); await page.getByRole('heading',{name:'Ibraheem Anwar',exact:true}).waitFor();
  verify(true, 'Founder public profile still loads');
  await page.goto(base+'/u/qa-absent-release-profile'); await page.getByRole('heading',{name:'Profile not found',exact:true}).waitFor();
  verify(!await page.getByRole('heading',{name:'Ibraheem Anwar',exact:true}).count(), 'Unknown handles never substitute the founder');
  verify(errors.length === 0, 'No uncaught browser errors');
  console.log(`PASS ${checks} read-only live release checks. No customer data or email created.`);
} finally { await browser.close(); }
