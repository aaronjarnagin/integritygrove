// Make a 1200x630 JPG share image for every case study from its cover (Facebook and LinkedIn don't render WebP).
// Also re-encodes any cover over 300KB. Run: node scripts/share-jpgs.mjs
import sharp from 'sharp';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';

const root = 'public/images/work/';
for (const slug of readdirSync(root)) {
  const cover = `${root}${slug}/cover.webp`;
  const buf = readFileSync(cover);
  await sharp(buf).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${root}${slug}/share.jpg`);
  if (statSync(cover).size > 300 * 1024) {
    writeFileSync(cover, await sharp(buf).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer());
    console.log('re-encoded', slug, Math.round(statSync(cover).size / 1024) + 'KB');
  }
}
console.log('share images written for', readdirSync(root).length, 'case studies');
