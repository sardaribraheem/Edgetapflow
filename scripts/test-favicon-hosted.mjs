// Public response checks with user-agent strings; this does not trigger or verify a real Google crawl.
import assert from 'node:assert/strict';
import sharp from 'sharp';
const base = 'https://edgetap.tech';let checks = 0;
const verify = (condition,label) => {assert(condition,label);checks++;console.log('PASS '+label);};
for (const agent of ['Mozilla/5.0','Googlebot','Googlebot-Image/1.0']) {
  const get = async path => {
    const response = await fetch(base+path,{headers:{'User-Agent':agent,'Cache-Control':'no-cache'}});
    verify(response.status===200&&!/noindex|none/i.test(response.headers.get('x-robots-tag')||''),agent+' can fetch '+path);
    return response;
  };
  const html=await (await get('/')).text();
  const icons=[...html.matchAll(/<link[^>]+rel="icon"[^>]*>/g)].map(match=>match[0]);
  verify(icons[0]?.includes('href="'+base+'/favicon-96.png"')&&icons[0]?.includes('sizes="96x96"')&&icons.every(tag=>!tag.includes('?')),agent+' sees the stable 96px logo without JavaScript');
  const robots=await (await get('/robots.txt')).text();
  verify(robots.includes('User-Agent: *')&&robots.includes('Allow: /')&&!/^Disallow:\s*\//m.test(robots),agent+' icon and homepage are not blocked by robots');
  for(const size of [96,512]) {
    const response=await get('/favicon-'+size+'.png');
    const info=await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    verify(info.width===size&&info.height===size&&response.headers.get('content-type')?.startsWith('image/png'),agent+' receives a square '+size+'px PNG logo');
  }
  const ico=Buffer.from(await (await get('/favicon.ico')).arrayBuffer());
  verify(ico.readUInt16LE(0)===0&&ico.readUInt16LE(2)===1,'Root favicon has a valid ICO header for '+agent);
  const sizes=Array.from({length:ico.readUInt16LE(4)},(_,index)=>ico[6+16*index]||256);
  verify(sizes.includes(96)&&sizes.includes(256),'Root ICO includes larger frames for '+agent);
}
console.log(`PASS ${checks} public favicon checks. Search-result refresh and recrawl remain controlled by Google.`);
