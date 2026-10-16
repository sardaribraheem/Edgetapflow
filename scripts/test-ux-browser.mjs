// UI behavior only: fresh device drafts, no sign-in, uploads, or order submission.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
await mkdir('test-results/ux', { recursive: true });
let checks = 0;
const verify = (value, message) => { assert(value, message); checks++; };
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
try {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(base + '/order');
    await page.getByRole('heading', { name: 'Choose your card', exact: true }).waitFor();
    verify((await page.locator('main').innerText()).split(/\s+/).length < 100, 'Initial ordering copy should stay concise.');
    verify(await fits(page), 'Ordering must fit the viewport.');
    const action = await page.getByRole('button', { name: 'Continue →', exact: true }).boundingBox();
    verify(action.y + action.height <= 900, 'Continue must remain visible.');
    const help = page.getByRole('button', { name: 'About card specifications', exact: true });
    await help.click();
    const dialog = page.getByRole('dialog', { name: 'Card specifications', exact: true });
    verify((await dialog.innerText()).includes('85.60 × 53.98 mm'), 'Specifications must remain available.');
    for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
    verify(await dialog.evaluate(node => node.contains(document.activeElement)), 'Popup must contain keyboard focus.');
    await page.keyboard.press('Escape');
    verify(await help.evaluate(node => node === document.activeElement), 'Closing must restore focus.');
    verify(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Closing must restore page scroll.');
    verify(await page.getByRole('progressbar',{name:'Card setup progress'}).getAttribute('aria-valuenow')==='0','Card setup starts before selection.');
    await page.getByRole('button',{name:/^Blue studio/}).click();
    verify(await page.getByRole('progressbar',{name:'Card setup progress'}).getAttribute('aria-valuenow')==='40','Selecting a card completes the first 40%.');
    await page.getByRole('button', { name: 'Continue →', exact: true }).click();
    await page.getByRole('img', { name: 'Default profile picture', exact: true }).waitFor({ state: 'visible' });
    verify(await page.getByRole('img', { name: 'Default profile picture', exact: true }).isVisible(), 'Empty photo must show the default avatar.');
    verify((await page.locator('main').innerText()).includes('Your photo is public after account upload.'), 'Photo privacy must be visible before uploading.');
    await page.getByLabel('Name or main heading', { exact: true }).fill('Local UX Fixture');
    verify(await page.getByLabel('Desired profile handle', { exact: true }).inputValue() === '', 'Requested handle must be optional.');
    await page.getByRole('button', { name: 'Continue →', exact: true }).click();
    await page.getByRole('button', { name: '+ Email', exact: true }).click();
    await page.getByLabel('Link 1 URL', { exact: true }).fill('fixture@example.test');
    await page.getByRole('button', { name: 'Continue →', exact: true }).click();

    await page.getByRole('img', { name: 'Default profile picture', exact: true }).waitFor({ state: 'visible' });
    verify(await page.getByRole('img', { name: 'Default profile picture', exact: true }).isVisible(), 'Preview must use the same default avatar.');
    verify(await fits(page), 'Profile preview must fit.');
    await page.getByRole('button', {name:'Continue →',exact:true}).click();
    verify(await page.getByLabel('Full name',{exact:true}).count() === 0, 'Customer name must not be collected twice.');
    await page.getByLabel('Phone number',{exact:true}).fill('03044149674');
    await page.getByLabel('Delivery address',{exact:true}).fill('Local UX fixture address');
    await page.getByLabel('Delivery city',{exact:true}).fill('Fixture city');
    await page.getByRole('button',{name:'Continue to save profile',exact:true}).click();
    const cachedEmail=page.getByLabel('Email',{exact:true});
    verify(await cachedEmail.inputValue()==='fixture@example.test','Checkout must reuse the contact email.');
    await cachedEmail.fill('changed@example.test');
    await page.getByRole('button',{name:'I already have an account',exact:true}).click();
    verify(await cachedEmail.inputValue()==='changed@example.test','The cached email must remain editable.');
    await page.goto(base + '/account');
    verify(await page.getByLabel('Email',{exact:true}).inputValue()==='fixture@example.test','Standalone sign-in must reuse the device contact email.');
    await page.goto(base + '/');
    verify(await fits(page), 'Reduced-motion landing page must fit.');
    verify(await page.locator('#solutions').getAttribute('data-pinned') !== 'true', 'Reduced motion must disable pinning.');
    verify(await page.locator('.offer-track').evaluate(node=>getComputedStyle(node).transform==='none'), 'Reduced motion must disable autoplay.');
    verify(await page.locator('.offer-controls').count()===0, 'No playback controls should clutter the offers.');
    verify(await page.locator('.offer-card:visible').count() === 3, 'Static mode must not repeat cards.');
    await context.close();
  }

  for (const [width, height] of [[320, 640], [390, 844], [1440, 900], [1920, 900]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    if (width === 1440) await page.clock.install();
    await page.goto(base + '/');
    await page.waitForFunction(() => document.querySelector('#solutions')?.dataset.pinned === 'true');
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    const geometry = await page.evaluate(() => ({ start: document.querySelector('#solutions').getBoundingClientRect().top + scrollY, width: document.querySelector('.usecase-viewport').clientWidth }));
    const headings = page.locator('.usecase-panel h3');
    for (let i = 0; i < 4; i++) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), geometry.start + geometry.width * i);
      await page.waitForTimeout(800);
      const box = await headings.nth(i).boundingBox();
      verify(box.x >= -1 && box.x + box.width <= width + 1 && box.y >= 75 && box.y + box.height < height, 'Every story heading must be readable while pinned.');
      if (i < 3) verify(Math.abs((await page.locator('.usecase-viewport').boundingBox()).y) < 2, 'Story must remain pinned through the slides.');
    }
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), geometry.start + geometry.width * 3 + height);
    verify((await page.locator('#how-to-order').boundingBox()).y < height, 'Downward scroll must leave the completed story.');
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), geometry.start + geometry.width);
    await page.waitForTimeout(800);
    verify((await headings.nth(1).boundingBox()).x >= -1, 'Reverse scroll must restore previous slides.');
    const row = page.locator('.offer-carousel');
    await row.scrollIntoViewIfNeeded();
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).hover();
    await page.waitForTimeout(250);
    const start = await row.evaluate(node => node.scrollLeft-(getComputedStyle(node.querySelector('.offer-track')).transform==='none'?0:new DOMMatrixReadOnly(getComputedStyle(node.querySelector('.offer-track')).transform).m41));
    await page.waitForTimeout(600);
    verify(await row.evaluate(node => node.scrollLeft-(getComputedStyle(node.querySelector('.offer-track')).transform==='none'?0:new DOMMatrixReadOnly(getComputedStyle(node.querySelector('.offer-track')).transform).m41)) > start + 5, 'Features must move without input.');
    if (width === 1440) {
      const geometry=await row.evaluate(node=>{const cards=node.querySelectorAll('.offer-slot');return cards[3].offsetLeft-cards[0].offsetLeft;});
      const position=await row.evaluate(node=>node.scrollLeft-new DOMMatrixReadOnly(getComputedStyle(node.querySelector('.offer-track')).transform).m41);
      await page.clock.runFor(Math.ceil((geometry-position)/32*1000)+200);
      verify(await row.evaluate(node=>-new DOMMatrixReadOnly(getComputedStyle(node.querySelector('.offer-track')).transform).m41)<50,'The wide carousel must wrap without running out of cards.');
      verify(await row.evaluate(node=>node.querySelector('.offer-track').getBoundingClientRect().right>=node.getBoundingClientRect().right),'The loop must fill the viewport across its seam.');
    }
    await row.hover();
    await page.waitForTimeout(80);
    const hold = await row.evaluate(node => node.scrollLeft-(getComputedStyle(node.querySelector('.offer-track')).transform==='none'?0:new DOMMatrixReadOnly(getComputedStyle(node.querySelector('.offer-track')).transform).m41));
    await page.waitForTimeout(300);
    verify(Math.abs(await row.evaluate(node => node.scrollLeft-(getComputedStyle(node.querySelector('.offer-track')).transform==='none'?0:new DOMMatrixReadOnly(getComputedStyle(node.querySelector('.offer-track')).transform).m41)) - hold) < 1, 'Hover must pause the loop.');
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).hover();
    await row.focus();
    await page.waitForTimeout(80);
    const focusHold = await row.evaluate(node => node.scrollLeft-(getComputedStyle(node.querySelector('.offer-track')).transform==='none'?0:new DOMMatrixReadOnly(getComputedStyle(node.querySelector('.offer-track')).transform).m41));
    await page.waitForTimeout(300);
    verify(Math.abs(await row.evaluate(node => node.scrollLeft-(getComputedStyle(node.querySelector('.offer-track')).transform==='none'?0:new DOMMatrixReadOnly(getComputedStyle(node.querySelector('.offer-track')).transform).m41)) - focusHold) < 1, 'Keyboard focus must pause the loop.');
    verify(await page.locator('.offer-controls').count()===0, 'Automatic features must have no visible playback controls.');
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).hover();
    await page.waitForTimeout(300);
    verify(await row.getAttribute('data-moving')==='false', 'A keyboard stop must persist after leaving the carousel.');
    verify(await fits(page), 'Animated landing page must fit.');
    await page.screenshot({ path: `test-results/ux/motion-${width}.png` });
    await context.close();
  }
  console.log(`PASS ${checks} UX checks: concise ordering, modal focus/escape, persistent actions, default avatar/preview, visible photo privacy, reduced motion, complete pinned story, reverse scrolling, autoplay, hover/focus pause and loop continuity. No sign-in, uploads or production writes.`);
} finally { await browser.close(); }
