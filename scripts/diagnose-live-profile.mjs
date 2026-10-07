// Read-only, fresh unauthenticated production browser. Never logs keys, tokens or documents.
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
const env = Object.fromEntries((await readFile(".env.local", "utf8")).split(/\r?\n/).filter(line => line.includes("=") && !line.trim().startsWith("#")).map(line => {
  const at = line.indexOf("="); return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, "")];
}));
function safeMessage(message) {
  let result = String(message || "");
  for (const value of Object.values(env)) if (value) result = result.replaceAll(value, "[configuration]");
  return result.replace(/AIza[\w-]+/g, "[web-key]").slice(0, 1500);
}
const origin = "https://edgetapflow.web.app";
for (const database of ["(default)", "default"]) {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)}/databases/${encodeURIComponent(database)}/documents/profiles/ibraheem?key=${encodeURIComponent(env.NEXT_PUBLIC_FIREBASE_API_KEY)}`;
  const response = await fetch(url, { headers: { Referer: origin + "/" }, signal: AbortSignal.timeout(20000) });
  const data = await response.json();
  console.log(JSON.stringify({ probe: "anonymous founder read", database, http: response.status, error: safeMessage(data.error?.message), status: data.error?.status }));
}
const storageResponse = await fetch(`https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)}/o?maxResults=1`, { signal: AbortSignal.timeout(20000) });
const storageData = await storageResponse.json();
console.log(JSON.stringify({ probe: "anonymous Storage list", http: storageResponse.status, error: safeMessage(storageData.error?.message) }));
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const pending = [];
  const targets = new Set();
  const responses = new Set();
  page.on("request", request => {
    const url = new URL(request.url());
    if (url.hostname !== "firestore.googleapis.com") return;
    const database = url.searchParams.get("database") || request.postData()?.match(/projects[^\s"&]*\/databases\/[^\s"&]*/)?.[0];
    if (database && !targets.has(database)) {
      targets.add(database);
      console.log("Browser Firestore target:", safeMessage(decodeURIComponent(database)));
    }
  });
  page.on("response", response => {
    const url = new URL(response.url());
    if (!/firestore\.googleapis\.com|firebasestorage\.googleapis\.com/.test(url.hostname)) return;
    pending.push((async () => {
      const body = await response.text().catch(() => "");
      // Extract service errors only; never print profile data or full network bodies.
      const messages = [...body.replaceAll('\\"', '"').matchAll(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map(match => safeMessage(match[1])).filter(message => /billing|permission|app.?check|unauth|quota/i.test(message));
      const summary = JSON.stringify({ service: url.hostname, path: url.pathname, http: response.status(), messages });
      if (!responses.has(summary)) { responses.add(summary); console.log(summary); }
    })());
  });
  page.on("pageerror", error => console.log("Browser exception:", safeMessage(error.message)));
  for (const route of ["/", "/u/ibraheem", "/u/launch-audit-missing", "/order"]) {
    const response = await page.goto(origin + route, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(8000);
    console.log(JSON.stringify({ route, http: response.status(), title: await page.title(), headings: await page.locator("h1").allTextContents(), unavailable: await page.getByText("Profile unavailable", { exact: true }).count(), missing: await page.getByText("Profile not found", { exact: true }).count() }));
  }
  await context.close();
  await Promise.allSettled(pending);
} finally { await browser.close(); }
