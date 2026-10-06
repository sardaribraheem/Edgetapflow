import { chromium } from "playwright";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:320,height:850}});
await page.goto("http://127.0.0.1:4173/order");
console.log(await page.evaluate(()=>Array.from(document.querySelectorAll("body *")).map(el=>({tag:el.tagName,text:el.textContent?.slice(0,70),class:el.className,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})).filter(x=>x.right>321 || x.left<0).slice(0,25)));
await page.screenshot({path:"test-results/order-overflow.png",fullPage:true});
await browser.close();
