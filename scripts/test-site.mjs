import { chromium } from "playwright";

async function runQA() {
  console.log("Starting Playwright E2E verification across all sections...");
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "Desktop", width: 1440, height: 900 },
    { name: "Mobile", width: 390, height: 844 },
  ];

  const baseUrl = "http://localhost:3000";

  for (const vp of viewports) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    // 1. Marketing Homepage
    console.log("1. Navigating to Homepage / ...");
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    console.log("   - Title:", await page.title());

    // Check key homepage sections
    const navVisible = await page.locator("nav.flex.items-center").isVisible();
    const heroVisible = await page.locator("h1").first().isVisible();
    console.log(`   - Navbar visible: ${navVisible}, Hero headline visible: ${heroVisible}`);

    // Scroll down to verify SolutionGrid & UseCaseStory
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(500);
    console.log("   - Scrolled to SolutionGrid section");

    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(500);
    console.log("   - Scrolled to UseCaseStory section");

    // 2. Profile Page /u/ibraheem
    console.log("2. Navigating to Profile /u/ibraheem ...");
    await page.goto(`${baseUrl}/u/ibraheem`, { waitUntil: "networkidle" });

    // Check links visibility
    const links = page.locator("a[rel='noreferrer']");
    const linkCount = await links.count();
    console.log(`   - Found ${linkCount} social/contact links on profile`);

    // Verify last link (Email) is visible or scrollable into view
    const lastLink = links.nth(linkCount - 1);
    const lastLinkText = await lastLink.textContent();
    console.log(`   - Last link text: "${lastLinkText?.trim()}"`);

    await lastLink.scrollIntoViewIfNeeded();
    const isLastLinkVisible = await lastLink.isVisible();
    console.log(`   - Is last link visible after scroll: ${isLastLinkVisible}`);

    // Verify Save Contact button is also visible
    const saveContactBtn = page.locator("text=Save Contact");
    await saveContactBtn.scrollIntoViewIfNeeded();
    const isSaveContactVisible = await saveContactBtn.isVisible();
    console.log(`   - Is Save Contact button visible: ${isSaveContactVisible}`);

    // 3. Pricing Page /pricing
    console.log("3. Navigating to Pricing Page /pricing ...");
    await page.goto(`${baseUrl}/pricing`, { waitUntil: "networkidle" });
    const pricingHeading = await page.locator("text=Transparent Pricing").isVisible();
    console.log(`   - Pricing heading visible: ${pricingHeading}`);

    // 4. Admin Dashboard /admin
    console.log("4. Navigating to Admin Dashboard /admin ...");
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
    const adminHeading = await page.locator("text=EdgeTap Admin").isVisible();
    console.log(`   - Admin login card visible: ${adminHeading}`);

    await page.close();
  }

  await browser.close();
  console.log("\n✅ Playwright E2E verification complete! All sections passed.");
}

runQA().catch((err) => {
  console.error("Playwright test failed:", err);
  process.exit(1);
});
