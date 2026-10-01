// Bouwt dist/ om tot één zelfstandig HTML-bestand (CSS, JS en logo inline).
const fs = require('fs');
const path = require('path');
const dist = path.resolve('dist');
const out = process.argv[2] || 'dist/monteur-kompas.html';
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const logo = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(dist, 'logo.svg')).toString('base64');
const css = html.match(/href="\.\/(assets\/[^"]+\.css)"/)[1];
const js = html.match(/src="\.\/(assets\/[^"]+\.js)"/)[1];
const read = (p) => fs.readFileSync(path.join(dist, p), 'utf8');
const page = `<title>Monteur Kompas</title>
<meta name="theme-color" content="#F4F7FB" />
<link rel="icon" href="${logo}" />
<style>${read(css)}</style>
<div id="root"></div>
<script type="module">${read(js).replaceAll('"./logo.svg"', JSON.stringify(logo)).replace(/<\/script/gi, '<\\/script')}</script>
`;
fs.writeFileSync(out, page);
console.log(out, (page.length / 1024).toFixed(0) + ' KB');
