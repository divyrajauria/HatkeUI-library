// Builds dist/index.html from components/*.html. The snippet files are the only source:
// the live demo runs them and "Copy code" copies them byte for byte.
const fs = require('fs');
const path = require('path');
const root = __dirname;
const list = JSON.parse(fs.readFileSync(path.join(root, 'components/index.json'), 'utf8'));
const tpl = fs.readFileSync(path.join(root, 'site/template.html'), 'utf8');

let css = '', js = '', cards = '', nav = '';
const codes = {};
list.forEach((c, i) => {
  const code = fs.readFileSync(path.join(root, 'components', c.id + '.html'), 'utf8');
  codes[c.id] = code;
  const style = (code.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
  const script = (code.match(/<script>([\s\S]*?)<\/script>/) || [, ''])[1];
  const html = code.replace(/<!--[\s\S]*?-->/, '').replace(/<style>[\s\S]*?<\/style>/, '').replace(/<script>[\s\S]*?<\/script>/, '').trim();
  css += style + '\n';
  if (script.trim()) js += script + '\n';
  const no = String(i + 1).padStart(2, '0');
  const p = (x, y) => (x * 30).toFixed(1) + ',' + (22 - y * 22).toFixed(1);
  const e = c.ease;
  const curve = `<svg viewBox="0 0 30 22" aria-hidden="true"><path d="M0,22 L30,0" stroke="var(--line)" fill="none"/><path d="M0,22 C${p(e[0], e[1])} ${p(e[2], e[3])} 30,0" stroke="var(--accent)" stroke-width="1.6" fill="none"/></svg>`;
  const ms = /ms|frame|delay/.test(c.ms) ? c.ms : c.ms + 'ms';
  nav += `<a href="#${c.id}">${c.name}</a>`;
  cards += `
<article class="card" id="${c.id}" aria-labelledby="${c.id}-h">
  <div class="card-h"><span class="no">${no}</span><h2 id="${c.id}-h">${c.name}</h2></div>
  <div class="stage"><div class="stage-inner">${html}${c.extra || ''}</div></div>
  <div class="card-b">
    <p class="idea">${c.idea}</p>
    <div class="specs">${curve}<span>${ms}</span></div>
    <div class="states">${c.states.map(s => `<span>${s}</span>`).join('')}</div>
    <div class="actions">
      <button type="button" class="btn primary copy" data-id="${c.id}"><span class="ico"><svg class="cp" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path class="ck" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="lbl">Copy code</span></button>
      <button type="button" class="btn view" aria-expanded="false" aria-controls="${c.id}-code">View code</button>
    </div>
    <pre class="code" id="${c.id}-code" tabindex="0" hidden></pre>
  </div>
</article>`;
});

const out = tpl
  // function replacers: component code contains "$'" and "$&", which string replacers would expand
  .replace('/*@COMPONENT_CSS@*/', () => css)
  .replace('<!--@NAV@-->', () => nav)
  .replace('<!--@CARDS@-->', () => cards)
  .replace('/*@COMPONENT_JS@*/', () => js)
  .replace('/*@CODES@*/', () => 'var CODES = ' + JSON.stringify(codes).replace(/<\//g, '<\\/') + ';');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
// artifact.html is the body-only page published to claude.ai; index.html is a full document for any static host.
fs.writeFileSync(path.join(root, 'dist/artifact.html'), out);
fs.writeFileSync(path.join(root, 'dist/index.html'),
  '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n' + out + '\n</body>\n</html>\n');
console.log('Built dist/index.html with ' + list.length + ' components (' + Math.round(out.length / 1024) + ' KB)');
