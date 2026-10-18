// Version the URLs in lib/data/order.ts whenever the source artwork changes.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
await mkdir('public/card-previews', { recursive: true });
for (const name of ['maincard','photography','studio','botanical','honeycomb']) {
  await sharp(name === 'maincard' ? 'assets/edgetapcard/maincard.png' : `public/card-designs/${name}.png`)
    .resize({ width:640, withoutEnlargement:true }).webp({ quality:86 })
    .toFile(`public/card-previews/${name}-v${name === 'maincard' ? 2 : 1}.webp`);
}

await sharp('assets/edgetapcard/maincard.png').webp({quality:92}).toFile('public/card-designs/maincard-v2.webp');
await sharp('assets/edgetapcard/Umarpic.jpeg').resize({width:360,withoutEnlargement:true}).webp({quality:88}).toFile('public/umar-story.webp');
