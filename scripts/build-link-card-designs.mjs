// Owner-supplied perspective screenshots are references, never printable card faces.
// Clean vector artwork omits stock QR destinations, names and contact details.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
const families=[['whatsapp','WhatsApp','Connect with me',4,'#ffffff','#168b48','#62c65d'],['instagram','Instagram','Follow along',3,'#ffffff','#a32b7c','#f5aa30'],['linkedin','LinkedIn','Let’s connect',3,'#ffffff','#0a66a0','#126dbb'],['tiktok','TikTok','Follow me',1,'#191919','#ffffff','#25f4ee']];
const file='lib/data/card-templates.json',templates=JSON.parse(await readFile(file,'utf8')).filter(t=>!t.id.startsWith('social-'));
await mkdir('public/link-card-designs',{recursive:true});
for(const [family,brand,line,count,paper,colour,accent] of families)for(let i=1;i<=count;i++){
 const id=`social-${family}-${i}`,filled=i===2||i===3&&family==='instagram'||family==='tiktok',bg=family==='tiktok'?paper:filled?colour:paper,ink=family==='tiktok'?colour:filled?'#ffffff':colour;
 const grad=family==='instagram'&&filled;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1011" height="638" viewBox="0 0 1011 638"><defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#f5aa30"/><stop offset=".48" stop-color="#de2568"/><stop offset="1" stop-color="#6c45a7"/></linearGradient></defs><rect width="1011" height="638" fill="${grad?'url(#g)':bg}"/>${i===3?`<path d="M0 0H1011V50H0Z" fill="${accent}"/><path d="M0 575H1011V638H0Z" fill="${accent}"/>`:''}${i===4?`<path d="M0 0H260L520 638H0Z" fill="${accent}" opacity=".18"/>`:''}<text x="505.5" y="230" font-family="Arial,sans-serif" font-size="30" text-anchor="middle" fill="${ink}" opacity=".85">${line}</text><text x="505.5" y="316" font-family="Arial,sans-serif" font-weight="700" font-size="${family==='instagram'?79:83}" text-anchor="middle" fill="${ink}">${brand}</text><path d="M427 353H584" stroke="${ink}" stroke-width="3" opacity=".5"/></svg>`;
 await writeFile(`public/link-card-designs/${id}.svg`,svg);
 // Gallery front is the actual blank printable design, with safe sample wording.
 const preview=svg.replace('</svg>',`<text x="505.5" y="448" text-anchor="middle" font-family="Arial,sans-serif" font-size="39" fill="${ink}">Your name</text><text x="505.5" y="504" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="${ink}">Tap to connect</text></svg>`);
 await sharp(Buffer.from(preview)).resize({width:640}).webp({quality:88}).toFile(`public/link-card-designs/${id}.webp`);
 templates.push({id,name:`${brand} ${['Classic','Colour','Connect','Signature'][i-1]}`,tagline:`Your ${brand} link`,tone:'bg-white',description:`A ${brand} design based on the supplied reference, personalized with your wording.`,version:1,background:bg,ink,accent,font:'Arial',nameSlot:{x:.5,y:.7,width:.8,size:4.5},titleSlot:{x:.5,y:.79,width:.8,size:2.5},texture:'plain',frontBackground:`/link-card-designs/${id}.svg`,preview:`/link-card-designs/${id}.webp`,artworkMode:'social'});
}
await writeFile(file,JSON.stringify(templates,null,2)+'\n');
