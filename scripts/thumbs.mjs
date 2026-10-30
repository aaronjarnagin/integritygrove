// Small 480px thumbnails of every case study cover (public/images/work/<slug>/thumb.webp),
// used by the homepage work wall where 16 images are on screen at once. Run: node scripts/thumbs.mjs
import sharp from 'sharp';
import { readdirSync, readFileSync, statSync } from 'node:fs';

const root = 'public/images/work/';
let total = 0;
for (const slug of readdirSync(root)) {
  const buf = readFileSync(`${root}${slug}/cover.webp`);
  await sharp(buf).resize({ width: 480 }).webp({ quality: 70 }).toFile(`${root}${slug}/thumb.webp`);
  total += statSync(`${root}${slug}/thumb.webp`).size;
}
console.log('thumbs written; total', Math.round(total / 1024) + 'KB');
