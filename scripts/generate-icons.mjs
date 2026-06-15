// Render the brand SVG into the PNG icons referenced by the manifest.
// Run with: npm run icons
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
const sizes = [16, 32, 48, 128];

const svg = `<svg width="128" height="128" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="24" height="24" rx="6" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="9.5" width="12" height="8" rx="2.2"/>
    <path d="M12 9.5V6.5M9.5 6.5h5"/>
    <circle cx="10" cy="13.5" r="0.9" fill="#fff" stroke="none"/>
    <circle cx="14" cy="13.5" r="0.9" fill="#fff" stroke="none"/>
  </g>
</svg>`;

await mkdir(outDir, { recursive: true });

await Promise.all(
  sizes.map(async (size) => {
    const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
    await writeFile(join(outDir, `icon${size}.png`), png);
    console.log(`✓ icon${size}.png`);
  }),
);

console.log('Icons generated in public/icons/');
