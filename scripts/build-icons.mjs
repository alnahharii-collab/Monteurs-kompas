// Rendert public/icons/icon.svg naar PNG's voor manifest en iOS. Eenmalig draaien na een icoonwijziging.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/icons/icon.svg', import.meta.url), 'utf8');
const targets = [
  { file: 'icon-192.png', size: 192, pad: 0, radius: true },
  { file: 'icon-512.png', size: 512, pad: 0, radius: true },
  { file: 'icon-maskable-512.png', size: 512, pad: 0.12, radius: false },
  { file: 'apple-touch-icon.png', size: 180, pad: 0, radius: false },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const t of targets) {
  const inner = t.radius ? svg : svg.replace('rx="112"', 'rx="0"');
  const pad = Math.round(t.size * t.pad);
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(
    `<body style="margin:0;background:${t.radius ? 'transparent' : '#141a22'}"><div style="width:${t.size}px;height:${t.size}px;padding:${pad}px;box-sizing:border-box">${inner.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body>`,
  );
  await page.screenshot({ path: new URL(`../public/icons/${t.file}`, import.meta.url).pathname, omitBackground: t.radius });
}
await browser.close();
console.log('icons ok');
