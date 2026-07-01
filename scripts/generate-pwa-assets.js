const fs = require('node:fs');
const path = require('node:path');
const sharp = require('../../backend/node_modules/sharp');
const TextToSVG = require('../../backend/node_modules/text-to-svg');

const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'frontend/public');
const font = TextToSVG.loadSync(path.join(root, 'backend/assets/fonts/NotoSansArabic-Bold.ttf'));
const word = '\u0648\u0635\u0644\u0629';
const metrics = font.getMetrics(word, { fontSize: 170, anchor: 'left top' });
const d = font.getD(word, {
  x: (512 - metrics.width) / 2,
  y: 172,
  fontSize: 170,
  anchor: 'left top',
});

const logoSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="وصلة">
  <defs>
    <linearGradient id="bg" x1="68" y1="58" x2="446" y2="456" gradientUnits="userSpaceOnUse">
      <stop stop-color="#042f2e"/>
      <stop offset="0.5" stop-color="#0d9488"/>
      <stop offset="1" stop-color="#fbbf24"/>
    </linearGradient>
    <linearGradient id="word" x1="116" y1="178" x2="420" y2="316" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff"/>
      <stop offset="0.62" stop-color="#ecfdf5"/>
      <stop offset="1" stop-color="#fff7d6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="#f8fafa"/>
  <rect x="42" y="42" width="428" height="428" rx="98" fill="url(#bg)"/>
  <circle cx="398" cy="118" r="42" fill="#fbbf24" opacity="0.22"/>
  <circle cx="116" cy="390" r="58" fill="#99f6e4" opacity="0.18"/>
  <path d="${d}" fill="url(#word)"/>
  <path d="M108 330C158 374 232 398 310 374C346 363 380 342 406 318" fill="none" stroke="#fbbf24" stroke-width="18" stroke-linecap="round" opacity="0.82"/>
</svg>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'favicon.svg'), logoSvg);

Promise.all([
  sharp(Buffer.from(logoSvg)).resize(192, 192).png().toFile(path.join(outDir, 'icon-192.png')),
  sharp(Buffer.from(logoSvg)).resize(512, 512).png().toFile(path.join(outDir, 'icon-512.png')),
  sharp(Buffer.from(logoSvg)).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png')),
  sharp(Buffer.from(logoSvg)).resize(512, 512).png().toFile(path.join(outDir, 'maskable-icon.png')),
]).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
