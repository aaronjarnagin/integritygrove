// Regenerate public/og-default.png (1200x630 social share image: logo, hero headline, work photo).
// Update the headline lines below if the homepage hero changes. Run: node scripts/og-image.mjs
import sharp from "sharp";

const W = 1200, H = 630;
const NAVY = "#11252B", GREEN = "#66BF84";

// work photo: rounded 4:5 card on the right
const pw = 400, ph = 500, px = W - pw - 70, py = (H - ph) / 2;
const mask = Buffer.from(`<svg width="${pw}" height="${ph}"><rect width="${pw}" height="${ph}" rx="22" fill="#fff"/></svg>`);
const photo = await sharp("public/images/work/ucs-healthcare-iowa-marketing-and-social-media-partnership/cover.webp")
  .resize(pw, ph, { fit: "cover", position: "attention" })
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();
const logo = await sharp("public/images/logo-white.png").resize({ height: 72 }).toBuffer();

const font = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <g font-family="${font}" font-weight="700" font-size="58" letter-spacing="-1.6" fill="#fff">
    <text x="74" y="262">Social media marketing</text>
    <text x="74" y="332">that <tspan fill="${GREEN}">grows your</tspan></text>
    <text x="74" y="402"><tspan fill="${GREEN}">business.</tspan></text>
  </g>
  <text x="76" y="470" font-family="${font}" font-weight="400" font-size="25" fill="#C3D1D4">Social media, websites, photo &amp; video. Iowa.</text>
  <text x="76" y="552" font-family="${font}" font-weight="600" font-size="22" fill="${GREEN}">integritygrove.com</text>
</svg>`;

const info = await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 70, top: 70 }, { input: photo, left: px, top: py }])
  .png({ compressionLevel: 9 })
  .toFile("public/og-default.png");
console.log("og-default.png", info.width + "x" + info.height, Math.round(info.size / 1024) + "KB");
