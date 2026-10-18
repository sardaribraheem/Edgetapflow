// Read-only site interactions; guest navigation writes only this temporary browser's device draft.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4178';
const browser = await chromium.launch({headless:true});
const errors = []; let checks = 0;
const verify = (condition,label) => {assert(condition,label);checks++;console.log('PASS '+label);};
await mkdir('test-results/refinements',{recursive:true});
try {
  for (const [width,height] of [[320,680],[390,844],[768,900],[1440,900]]) {
    const context = await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'});
    const page = await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/#how-to-order');await page.evaluate(()=>document.fonts.ready);
    await page.waitForFunction(()=>document.querySelector('#solutions')?.dataset.pinned==='true');
    await page.waitForFunction(()=>Math.abs(document.querySelector('.usecase-viewport').getBoundingClientRect().top)<2);
    await page.waitForTimeout(700);
    verify(await page.getByRole('link',{name:'EdgeTap home',exact:true}).locator('img').evaluate(e=>e.complete&&e.naturalWidth>0&&e.getAttribute('src')==='/favicon-96.png'),'Navbar uses the supplied EdgeTap logo at '+width);
    for (const scene of ['story-tap-demo','story-qr-demo']) {
      if(scene==='story-qr-demo') {await page.getByRole('button',{name:'How it works: slide 2',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.story-count')?.textContent==='2 / 4');await page.waitForTimeout(900);}
      const geometry = await page.locator('.'+scene).evaluate(root=>{
        const p=root.closest('.story-content').querySelector(':scope>p').getBoundingClientRect();
        return [...root.querySelectorAll('.story-labels')].map(label=>{
          const target=label.parentElement.querySelector('.tap-demo-card,.scan-demo-card,.tap-demo-phone,.scan-demo-phone').getBoundingClientRect();
          const text=label.querySelector('span').getBoundingClientRect(),svg=label.querySelector('svg');
          const tip=new DOMPoint(52,12).matrixTransform(svg.getScreenCTM());
          return {textTop:text.top,textBottom:text.bottom,left:text.left,right:text.right,paragraphBottom:p.bottom,tipX:tip.x,tipY:tip.y,targetTop:target.top,targetLeft:target.left,targetRight:target.right};
        });
      });
      verify(geometry.every(g=>g.textTop>=g.paragraphBottom+3&&g.left>=6&&g.right<=width-6),scene+' labels clear the copy and fit the screen at '+width);
      verify(geometry.every(g=>g.tipX>g.targetLeft&&g.tipX<g.targetRight&&Math.abs(g.tipY-g.targetTop)<18),scene+' arrow tips point to their actual card/phone at '+width);
      const status=await page.locator('.'+scene+' .story-tap-status').boundingBox(),controls=await page.locator('.story-controls').boundingBox();
      verify(status.y+status.height<controls.y+2,scene+' instructions stay above controls at '+width);
      await page.screenshot({path:`test-results/refinements/${scene}-${width}.png`});
    }
    await page.getByRole('button',{name:'How it works: slide 3',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.story-count')?.textContent==='3 / 4');await page.waitForTimeout(900);
    const text=await page.locator('.connection-phone-right').innerText();
    verify(['Umar Khan','WhatsApp','Instagram','Portfolio','Save profile'].every(label=>text.includes(label)),'Umar phone has the requested profile boxes at '+width);
    verify(await page.locator('.connected-phones>.story-device').evaluateAll(es=>es.every(e=>getComputedStyle(e).transformOrigin.endsWith(' 0px'))),'Both phones pivot at their connected top corners at '+width);
    verify(await page.locator('.connection-phone-right a').count()===0,'Illustration invents no real Umar contact destinations at '+width);
    await page.screenshot({path:`test-results/refinements/connection-${width}.png`});
    await page.goto(base+'/order?product=profile');await page.getByRole('button',{name:'Black photography',exact:true}).waitFor();
    await page.getByRole('button',{name:'Continue →',exact:true}).click();await page.getByRole('heading',{name:'Let’s build your EdgeTap',exact:true}).waitFor();await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    const decor=await page.locator('.order-floating-icons').evaluate(e=>({pointer:getComputedStyle(e).pointerEvents,hidden:e.getAttribute('aria-hidden'),children:[...e.children].map(icon=>({top:icon.getBoundingClientRect().top,bottom:icon.getBoundingClientRect().bottom,left:icon.getBoundingClientRect().left,right:icon.getBoundingClientRect().right,opacity:Number(getComputedStyle(icon).opacity),animation:getComputedStyle(icon).animationName}))}));
    const panel=await page.locator('.order-builder .card-paper').first().boundingBox();
    verify(decor.pointer==='none'&&decor.hidden==='true'&&decor.children.every(e=>e.animation==='order-icon-float'),'Doodles float without intercepting profile input at '+width);
    verify(decor.children.filter(e=>e.bottom>0&&e.top<height&&e.opacity>=.28&&(width<=1000?e.bottom<panel.y:e.right<panel.x||e.left>panel.x+panel.width)).length>=2,'At least two doodles remain visibly outside the profile panel at '+width);
    verify(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Profile builder has no horizontal overflow at '+width);
    await page.screenshot({path:`test-results/refinements/profile-builder-${width}.png`});
    await page.emulateMedia({reducedMotion:'reduce'});
    verify(await page.locator('.order-floating-icons>svg').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationName==='none')),'Reduced motion stops ordering doodles at '+width);
    await context.close();
  }
  verify(errors.length===0,'No uncaught browser errors');
  console.log(`PASS ${checks} annotation, logo, connection and profile-builder checks. No server data submitted.`);
} finally {await browser.close();}
