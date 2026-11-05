import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const logo = fs.readFileSync(path.join(root, 'src/assets/logo.svg'));
const hero = path.join(root, 'public/images/control-center.png');

if (!fs.existsSync(hero)) {
  throw new Error('Run npm run sync:docs before generating the OG image.');
}

await sharp(logo).resize(180, 180).png().toFile(path.join(root, 'public/apple-touch-icon.png'));

const overlay = Buffer.from(`
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#070a12" stop-opacity=".96"/>
      <stop offset=".58" stop-color="#070a12" stop-opacity=".8"/>
      <stop offset="1" stop-color="#070a12" stop-opacity=".18"/>
    </linearGradient>
    <radialGradient id="glow" cx=".72" cy=".3" r=".7">
      <stop offset="0" stop-color="#e2684f" stop-opacity=".32"/>
      <stop offset="1" stop-color="#e2684f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#fade)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(78 70)" fill="#e2684f">
    <circle cx="0" cy="-22" r="11"/><circle cx="21" cy="-7" r="11"/><circle cx="13" cy="18" r="11"/>
    <circle cx="-13" cy="18" r="11"/><circle cx="-21" cy="-7" r="11"/>
  </g>
  <text x="78" y="148" fill="#eef2f8" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="600" letter-spacing="8">TESSA</text>
  <text x="78" y="286" fill="#eef2f8" font-family="Inter, system-ui, sans-serif" font-size="80" font-weight="600" letter-spacing="-4">A quiet desktop</text>
  <text x="78" y="372" fill="#e2684f" font-family="Inter, system-ui, sans-serif" font-size="80" font-weight="600" letter-spacing="-4">with sharp edges.</text>
  <text x="82" y="448" fill="#9aa7ba" font-family="Inter, system-ui, sans-serif" font-size="24">Tiling Wayland compositor and shell, written in Zig.</text>
  <text x="82" y="548" fill="#64748b" font-family="JetBrains Mono, monospace" font-size="17" letter-spacing="2">WLROOTS 0.20  ·  ZIG 0.17  ·  keychrom.github.io</text>
</svg>`);

await sharp(hero)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .modulate({ brightness: 0.62 })
  .composite([{ input: overlay }])
  .png()
  .toFile(path.join(root, 'public/og.png'));

console.log('Generated public/og.png and public/apple-touch-icon.png');
