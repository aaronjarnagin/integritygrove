// Regenerate the favicons: the white tree mark (cropped from public/images/logo-white.png) on a navy tile.
// Writes public/favicon.ico (16/32/48), favicon-32.png, favicon-96.png, apple-touch-icon.png.
// Run: node scripts/favicons.mjs
import sharp from "sharp";
import fs from "fs";

const NAVY = "#11252B";
const dir = "public/";

// the mark is the first 370px of the inline logo
const mark = await sharp(dir + "images/logo-white.png").extract({ left: 0, top: 0, width: 370, height: 474 }).trim().png().toBuffer();

// rounded tile with transparent corners (browser tabs, Google results); square = full bleed for iOS
async function icon(s, rounded) {
  const r = rounded ? s * 0.22 : 0;
  const tile = Buffer.from(`<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><rect width="${s}" height="${s}" rx="${r}" fill="${NAVY}"/></svg>`);
  const mh = Math.round(s * (rounded ? 0.74 : 0.62));
  const m = await sharp(mark).resize({ height: mh }).toBuffer();
  const { width: mw } = await sharp(m).metadata();
  return sharp(tile).composite([{ input: m, left: Math.round((s - mw) / 2), top: Math.round((s - mh) / 2) }]).png().toBuffer();
}

const png = {};
for (const s of [16, 32, 48, 96]) png[s] = await icon(s, true);
fs.writeFileSync(dir + "favicon-32.png", png[32]);
fs.writeFileSync(dir + "favicon-96.png", png[96]);
fs.writeFileSync(dir + "apple-touch-icon.png", await icon(180, false));

// favicon.ico holding PNG-encoded 16/32/48 images
const imgs = [16, 32, 48].map((s) => ({ s, buf: png[s] }));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(imgs.length, 4);
let offset = 6 + 16 * imgs.length;
const entries = imgs.map(({ s, buf }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});
fs.writeFileSync(dir + "favicon.ico", Buffer.concat([header, ...entries, ...imgs.map((i) => i.buf)]));

for (const f of ["favicon.ico", "favicon-32.png", "favicon-96.png", "apple-touch-icon.png"]) {
  console.log(dir + f, fs.statSync(dir + f).size, "bytes");
}
