import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
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
    for (const route of ["/","/pricing","/order","/account","/privacy","/terms","/cookies","/admin"]) {
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
      assert(!/private beta|placeholder voices|coming soon|lifetime|24\/7|Admin Dashboard|Raast|Easypaisa|Meezan|NASTP/i.test(text),route); checks++;
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
    await page.getByRole("button",{name:"Continue →"}).click();
    await page.getByRole("button",{name:"Continue →"}).click();
    assert(await page.getByText("Please add your name.",{exact:true}).isVisible()); checks++;
    const nameInput=page.locator('input[placeholder="Ahmad Khan"]');
    await nameInput.fill("Launch QA");
    await page.getByRole("button",{name:"Continue →"}).click();
    await page.getByRole("button",{name:"Continue →"}).click();
    assert(await page.getByText("Add at least one way for people to contact you.",{exact:true}).isVisible()); checks++;
    const add=page.getByRole("button",{name:/Website|Portfolio/}).first();
    await add.click();
    const url=page.locator('input[placeholder="URL (https://…)"]').first();
    await url.fill("javascript:alert(1)");
    await page.getByRole("button",{name:"Continue →"}).click();
    assert(await page.getByText("Use a complete http(s), email or phone contact URL for every link.",{exact:true}).isVisible()); checks++;
    await url.fill("https://example.com");
    await page.getByRole("button",{name:"Continue →"}).click();
    assert(await page.getByRole("heading",{name:"Launch QA",exact:true}).isVisible()); checks++;
    const downloadPromise=page.waitForEvent("download");
    await page.getByRole("button",{name:"Save Contact"}).click();
    const download=await downloadPromise;
    const vcard=await readFile(await download.path(),"utf8");
    assert(vcard.includes("BEGIN:VCARD") && vcard.includes("FN:Launch QA") && vcard.includes("https://example.com")); checks++;
    await page.getByRole("button",{name:"Continue →"}).click();
    assert.equal(await page.getByRole("button",{name:/Pickup/}).count(),0); checks++;
    await page.getByRole("button",{name:"Continue →"}).click();
    assert(await page.getByText("Please add your full name.",{exact:true}).isVisible()); checks++;
    await page.getByLabel("Full name",{exact:true}).fill("Launch QA");
    await page.getByLabel("Phone number",{exact:true}).fill("03044149674");
    await page.getByLabel("Account email",{exact:true}).fill("launch-qa@example.com");
    await page.getByLabel("Delivery address",{exact:true}).fill("QA only address");
    await page.getByRole("button",{name:"Continue →"}).click();
    if (await page.getByRole("heading",{name:"Arrange your order on WhatsApp"}).isVisible()) {
      assert.equal(await page.getByRole("link",{name:"Contact EdgeTap to arrange an order"}).getAttribute("href"),"https://wa.me/923044149674"); checks++;
      assert.equal(await page.getByLabel("Payment receipt screenshot").count(),0); checks++;
      assert.equal(await page.getByRole("button",{name:"Review order →"}).count(),0); checks++;
      assert(await page.getByText(/Your selections have not been submitted/).isVisible()); checks++;
      assert(await page.getByRole("link",{name:"personalized-card terms"}).isVisible()); checks++;
      assert.equal(errors.length,0,errors.join("\n")); checks++;
      await context.close();
      console.log(`PASS: production browser QA at ${width}px (WhatsApp ordering; online payment paused)`);
      continue;
    }
    assert(await page.getByRole("button",{name:/Jazzcash/i}).isVisible()); checks++;
    assert.equal(await page.getByRole("button",{name:/Raast|Easypaisa|Meezan/i}).count(),0); checks++;
    await page.getByRole("button",{name:"Review order →"}).click();
    assert(await page.getByText("Use a password with at least 6 characters.",{exact:true}).isVisible()); checks++;
    await page.getByLabel("Password",{exact:true}).fill("EmulatorOnly-1234");
    await page.getByRole("button",{name:"Review order →"}).click();
    assert(await page.getByText("Upload your payment receipt before placing the order.",{exact:true}).isVisible()); checks++;
    await page.getByLabel("Payment receipt screenshot").setInputFiles("public/apple-touch-icon.png");
    await page.getByRole("button",{name:"Review order →"}).click();
    assert(await page.getByRole("heading",{name:"Ready to place order"}).isVisible()); checks++;
    assert(await page.getByText("Not submitted yet · Payment will be verified after submission",{exact:true}).isVisible()); checks++;
    await page.screenshot({path:`test-results/order-review-${width}.png`,fullPage:true});
    await page.getByRole("button",{name:"Edit order"}).click();
    assert(await page.getByRole("heading",{name:"How would you like to pay?"}).isVisible()); checks++;
    assert.equal(errors.length,0,errors.join("\n")); checks++;
    await context.close();
    console.log(`PASS: production browser QA at ${width}px`);
  }
  console.log(`PASS: ${checks} browser assertions; screenshots in test-results/`);
} finally { await browser.close(); }
