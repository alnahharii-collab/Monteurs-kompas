// Zet Start, Toestel kiezen en Snel opzoeken op dezelfde viewport naast elkaar.
const { chromium } = require(process.env.PW_PATH || 'playwright');
const path = require('path');
const dir = path.resolve(process.argv[2] || 'screenshots');
(async () => {
  const b = await chromium.launch();
  for (const w of [360, 390, 430]) {
    const names = [['01-start', 'Start'], ['02b-toestel-kiezen', 'Toestel kiezen'], ['10-snel-opzoeken', 'Snel opzoeken']];
    const html = `<body style="margin:0;background:#cbd5e1;font:600 20px system-ui;display:flex;gap:24px;padding:24px;align-items:flex-start">${names
      .map(([f, t]) => `<figure style="margin:0"><figcaption style="padding:0 0 8px">${t} · ${w}px</figcaption><div style="width:${w}px;height:800px;overflow:hidden;border:1px solid #64748b;background:#fff"><img src="file://${dir}/${w}-${f}.png" style="width:${w}px;display:block"></div></figure>`)
      .join('')}</body>`;
    const p = await b.newPage({ viewport: { width: w * 3 + 24 * 4 + 6, height: 880 } });
    const file = path.join(dir, `vergelijk-${w}.html`);
    require('fs').writeFileSync(file, html);
    await p.goto('file://' + file);
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${dir}/vergelijk-${w}.png` });
    require('fs').unlinkSync(file);
  }
  await b.close();
})();
