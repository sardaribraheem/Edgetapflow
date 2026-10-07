import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless:true });
await mkdir("test-results",{recursive:true});
let checks = 0;
try {
  for (const asset of ["/robots.txt", "/sitemap.xml", "/brand-icon.svg", "/apple-touch-icon.png", "/social-card.png", "/favicon.ico"]) {
    const response = await fetch(baseUrl+asset);
    assert.equal(response.status, 200, asset); checks++;
  }
  for (const width of [320,360,390,768,1440]) {
    const context = await browser.newContext({viewport:{width,height:900}, reducedMotion:"reduce"});
    const page = await context.newPage();
    const errors = [];
    let expectedNetworkErrors = false;
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", msg => { if (msg.type()==="error" && !expectedNetworkErrors) errors.push(msg.text()); });
    // Deterministic backend failure regression; no writes to production services.
    await context.route(/firestore\.googleapis\.com/, route => route.abort());
    await context.route(/https:\/\/[^/]+[.]supabase[.]co\/rest\//, route => route.abort());
    for (const route of ["/","/pricing","/order","/account","/account/orders","/privacy","/terms","/cookies","/admin"]) {
      const response = await page.goto(baseUrl+route,{waitUntil:"load"});
      assert.equal(response.status(),200,route); checks++;
      await page.locator("h1, form").first().waitFor({state:"visible"});
      if (["/", "/pricing", "/privacy", "/terms", "/cookies"].includes(route)) {
        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        assert.equal(new URL(canonical).href, new URL(`https://edgetapflow.web.app${route}`).href); checks++;
      } else {
        assert((await page.locator('meta[name="robots"]').getAttribute("content")).includes("noindex")); checks++;
      }
      const text = await page.locator("body").innerText();
      assert(!/private beta|placeholder voices|coming soon|lifetime|24\/7|Admin Dashboard|Raast|Easypaisa|Meezan/i.test(text),route); checks++;
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route}: overflow at ${width}`); checks++;
      assert.equal(await page.locator('a[href="#"]').count(),0,route+" dead link"); checks++;
      if (route === "/" || route === "/pricing") {
        assert.equal(await page.locator('a[href="/admin"]').count(),0); checks++;
        const hrefs = await page.locator('a[href^="/#"],a[href^="#"]').evaluateAll(nodes => nodes.map(n=>n.getAttribute("href")));
        if (route === "/") for (const href of hrefs) {
          const id=href.split("#")[1];
          if (id) { assert.equal(await page.locator(`[id="${id}"]`).count(),1,href); checks++; }
        }
      }
      if (route === "/" && width < 1024) {
        await page.getByRole("button",{name:"Open menu"}).click();
        assert(await page.getByRole("dialog").isVisible()); checks++;
        await page.keyboard.press("Escape");
        assert.equal(await page.getByRole("button",{name:"Open menu"}).getAttribute("aria-expanded"),"false"); checks++;
      }
      if (route === "/" || route === "/pricing" || route === "/order") await page.screenshot({path:`test-results/${route==="/"?"home":route.slice(1)}-${width}.png`,fullPage:true});
    }
    assert.equal(errors.length,0,errors.join("\n")); checks++;
    expectedNetworkErrors = true; // 404 and deliberately aborted Firebase requests below are expected.
    const missing = await page.goto(baseUrl+"/no-such-page");
    assert.equal(missing.status(),404); checks++;
    for (const name of ["qa-customer-one","qa-customer-two"]) {
      await page.goto(baseUrl+"/u/"+name,{waitUntil:"load"});
      assert.equal(await page.getByRole("heading",{name:"Ibraheem Anwar"}).count(),0,"Founder flashed for customer"); checks++;
      // Mocked network failure must produce a generic customer error rather than internal Firebase details.
      await page.getByRole("heading",{name:"Profile unavailable"}).waitFor({timeout:30000});
      const text=await page.locator("body").innerText();
      assert(!/FirebaseError|permission-denied|projects\/|api.key/i.test(text)); checks++;
      assert(text.includes(name)); checks++;
    }
    expectedNetworkErrors = false;
    await page.goto(baseUrl+"/order");
    await page.getByRole("heading",{name:"Choose your card",exact:true}).waitFor();
    assert.equal(await page.getByLabel("Password",{exact:true}).count(),0); checks++;
    assert((await page.locator("body").innerText()).includes("No account needed yet")); checks++;
    assert.equal(await page.getByLabel("Payment receipt screenshot").count(),0); checks++;
    assert.equal(errors.length,0,errors.join("\n")); checks++;
    await context.close();
    console.log(`PASS: production browser QA at ${width}px`);
  }
  console.log(`PASS: ${checks} browser assertions; screenshots in test-results/`);
} finally { await browser.close(); }
