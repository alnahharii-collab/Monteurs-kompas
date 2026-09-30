// Maakt screenshots en layoutmetingen van de gebouwde app (npm run build && npx vite preview).
const { chromium } = require(process.env.PW_PATH || 'playwright');
const fs = require('fs');
const URL = process.env.APP_URL || 'http://localhost:4173/';
const OUT = process.argv[2] || 'screenshots';

async function metrics(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const r = (el) => (el ? el.getBoundingClientRect() : null);
    const main = q('main .container');
    const h1 = q('h1');
    const btns = [...document.querySelectorAll('button.btn, button.choice, button.option')].map((b) => Math.round(b.getBoundingClientRect().height));
    const small = [...document.querySelectorAll('button, input, label.checkline')].filter((b) => {
      const x = b.getBoundingClientRect();
      return x.width > 0 && (x.height < 44 || x.width < 44);
    }).map((b) => b.textContent.trim().slice(0, 30));
    return {
      view: q('main').dataset.view,
      docScroll: document.documentElement.scrollWidth,
      vw: document.documentElement.clientWidth,
      headerH: Math.round(r(q('header')).height),
      contentLeft: Math.round(r(main).left + parseFloat(getComputedStyle(main).paddingLeft)),
      contentWidth: Math.round(main.clientWidth - parseFloat(getComputedStyle(main).paddingLeft) - parseFloat(getComputedStyle(main).paddingRight)),
      h1: h1 && getComputedStyle(h1).fontSize,
      body: getComputedStyle(document.body).fontSize,
      minBtn: btns.length ? Math.min(...btns) : null,
      smallTargets: small,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const results = [];
  for (const width of [360, 390, 430, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: width > 500 ? 900 : 800 }, deviceScaleFactor: width > 500 ? 1 : 2, isMobile: width < 500, hasTouch: width < 500 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const shot = async (name) => {
      await page.waitForTimeout(80);
      const m = await metrics(page);
      results.push({ width, name, ...m, errors: [...errors] });
      await page.screenshot({ path: `${OUT}/${width}-${name}.png`, fullPage: true });
    };
    const btn = (n) => page.getByRole('button', { name: n, exact: typeof n === 'string' }).first().click();
    const radio = (n) => page.getByRole('radio', { name: n }).click();

    await page.goto(URL);
    await shot('01-start');
    await btn(/Snel opzoeken/);
    await radio(/Oefenmerk CV-24/);
    await radio('Uitvoering A');
    await radio('Storing 5');
    await shot('10-snel-opzoeken');
    await page.getByRole('button', { name: /naar start/ }).click();
    await btn(/Storing oplossen/);
    await shot('02-toestel-kiezen-leeg');
    await radio(/Oefenmerk CV-24/);
    await radio('Uitvoering A');
    await page.getByRole('checkbox').check();
    await shot('02b-toestel-kiezen');
    await btn('Ga verder');
    await shot('03-storing-kiezen');
    await btn(/Storing 5/);
    await radio('Nee');
    await shot('04-diagnose');
    await btn('Ga verder');
    await btn('Ga verder'); // leeg veld -> foutmelding
    await shot('05-meetinvoer-fout');
    await page.getByRole('textbox').fill('4,2');
    await shot('05b-meetinvoer');
    await btn('Bekijk bron');
    await shot('06-bron');
    await btn('Klaar met lezen');
    await btn('Ga verder');
    await shot('07-uitkomst');
    await btn('Maak servicerapport');
    await shot('08-rapport');
    await page.getByRole('button', { name: /naar start/ }).click();
    await btn('Meer');
    await btn(/Documentenbeheer/);
    await shot('11-documentenbeheer');
    // Veiligheidsstop
    await page.getByRole('button', { name: /naar start/ }).click();
    await btn('Meer');
    await btn('Nieuwe case starten');
    await btn('Ja, wis en begin opnieuw');
    await btn(/Storing oplossen/);
    await radio(/Oefenmerk CV-24/);
    await radio('Uitvoering A');
    await page.getByRole('checkbox').check();
    await btn('Ga verder');
    await btn(/Storing 4/);
    await radio('Ja');
    await btn('Ga verder');
    await shot('09-veiligheidsstop');
    await page.getByRole('button', { name: /naar start/ }).click();
    await btn(/Snel opzoeken/);
    await shot('12-snel-opzoeken-tijdens-stop');
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/metrics.json`, JSON.stringify(results, null, 1));
  for (const r of results) {
    console.log(`${r.width}\t${r.name.padEnd(30)} scroll=${r.docScroll}/${r.vw} header=${r.headerH} left=${r.contentLeft} w=${r.contentWidth} h1=${r.h1} body=${r.body} minBtn=${r.minBtn} small=${JSON.stringify(r.smallTargets)} err=${r.errors.length}`);
  }
})();
