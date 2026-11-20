// usage: node render.mjs <outdir> <frames: "a-b" or "1,2,3"> [step] [quality]
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const [,, outdir, spec, step = '1', qual = '0.96'] = process.argv;
fs.mkdirSync(outdir, { recursive: true });

let frames = [];
for (const part of spec.split(',')) {
  if (part.includes('-')) {
    const [a, b] = part.split('-').map(Number);
    for (let f = a; f <= b; f += +step) frames.push(f);
  } else {
    frames.push(+part);
  }
}

const root = process.env.WEB || path.resolve(import.meta.dirname, 'web');
const srv = http.createServer((q, s) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' });
  fs.createReadStream(p).pipe(s);
}).listen(0);

await new Promise(r => srv.on('listening', r));
const b = await chromium.launch({
  executablePath: '/home/exu/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist']
});
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('console', m => console.log('PAGE', m.text()));
pg.on('pageerror', e => console.log('ERR', e.message));

await pg.goto(`http://localhost:${srv.address().port}/index.html${process.env.HASH || ''}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 180000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }

const t0 = Date.now();
const total = frames.length;
let done = 0;
let skipped = 0;
let lastLog = 0;

for (let i = 0; i < frames.length; i++) {
  const f = frames[i];
  const outPath = path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`);
  if (process.env.RESUME && fs.existsSync(outPath)) {
    skipped++;
    continue;
  }
  const d = await pg.evaluate(([f, q]) => {
    if (window.location.hash === '#nd') window.DEBUG_ND = 1;
    if (window.location.hash === '#e') window.DEBUG_E = 1;
    window.renderFrame(f);
    return document.getElementById('c').toDataURL('image/jpeg', q);
  }, [f, +qual]);

  fs.writeFileSync(outPath, Buffer.from(d.split(',')[1], 'base64'));
  done++;

  const now = Date.now();
  if (now - lastLog >= 100 || i === frames.length - 1) {
    lastLog = now;
    const progress = (i + 1) / total;
    const elapsed = (now - t0) / 1000;
    const sPerFrame = done > 0 ? elapsed / done : 0;
    const remainingSec = Math.max(0, Math.round((total - (i + 1)) * sPerFrame));
    const eta = remainingSec >= 60
      ? `${Math.floor(remainingSec / 60)}m ${remainingSec % 60}s`
      : `${remainingSec}s`;
    const fps = sPerFrame > 0 ? (1 / sPerFrame).toFixed(1) : '0';

    const barWidth = 24;
    const filled = Math.round(barWidth * progress);
    const bar = '='.repeat(Math.max(0, filled - 1)) + (filled > 0 ? '>' : '') + ' '.repeat(barWidth - filled);
    const pct = (progress * 100).toFixed(1);

    const msg = `\r[${bar}] ${i + 1}/${total} (${pct}%) | ${sPerFrame.toFixed(2)}s/f (${fps} fps) | ETA: ${eta}  `;
    if (process.stdout.isTTY) {
      process.stdout.write(msg);
    } else {
      if ((i + 1) % 30 === 0 || i === frames.length - 1) {
        console.log(`[${bar}] ${i + 1}/${total} (${pct}%) | ${sPerFrame.toFixed(2)}s/frame (${fps} fps) | ETA: ${eta}`);
      }
    }
  }
}

if (process.stdout.isTTY) process.stdout.write('\n');
console.log(`\ndone ${done} frames (${skipped} skipped), ${((Date.now() - t0) / Math.max(1, done) / 1000).toFixed(2)} s/frame`);
await b.close();
srv.close();
