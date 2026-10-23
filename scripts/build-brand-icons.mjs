// Package the owner's existing logo for browser tabs, search and home screens.
import sharp from 'sharp';
import QRCode from 'qrcode';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../assets/Logo/Gold and navy ET tap logo-3.png', import.meta.url);
const publicDirectory = new URL('../public/', import.meta.url);
const sizes = [48, 96, 180, 512];
for (const size of sizes) {
  const filename = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}.png`;
  await sharp(fileURLToPath(source)).resize(size, size).png().toFile(fileURLToPath(new URL(filename, publicDirectory)));
}

const entries = await Promise.all([16, 32, 48, 96, 256].map(async size => ({
  size,
  bytes: await sharp(fileURLToPath(source)).resize(size, size).png().toBuffer(),
})));
const header = Buffer.alloc(6 + 16 * entries.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = header.length;
entries.forEach(({ size, bytes }, index) => {
  const at = 6 + index * 16;
  header[at] = size === 256 ? 0 : size;
  header[at + 1] = size === 256 ? 0 : size;
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(bytes.length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += bytes.length;
});
await writeFile(new URL('favicon.ico', publicDirectory), Buffer.concat([header, ...entries.map(entry => entry.bytes)]));
await QRCode.toFile(fileURLToPath(new URL('brand-profile-qr.png',publicDirectory)), 'https://edgetap.tech', {width:256,margin:2,errorCorrectionLevel:'M'});
console.log('Packaged ET monogram: stable public ICO (16/32/48/96/256), PNG (48/96/512), Apple touch icon (180).');
