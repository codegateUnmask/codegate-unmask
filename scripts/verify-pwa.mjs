import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const iconSizes = new Map([
  ['public/icons/icon-192.png', 192],
  ['public/icons/icon-512.png', 512],
  ['public/icons/icon-maskable-512.png', 512],
  ['app/apple-icon.png', 180],
]);

for (const [path, expectedSize] of iconSizes) {
  const icon = await readFile(path);
  assert.equal(icon.toString('ascii', 1, 4), 'PNG');
  assert.equal(icon.readUInt32BE(16), expectedSize);
  assert.equal(icon.readUInt32BE(20), expectedSize);
}

const manifest = await readFile('app/manifest.ts', 'utf8');
const worker = await readFile('public/sw.js', 'utf8');

for (const path of iconSizes.keys()) {
  if (path.startsWith('public/')) {
    assert.match(manifest, new RegExp(path.slice('public'.length).replaceAll('/', '\\/')));
  }
}

assert.match(manifest, /display: 'standalone'/);
assert.match(worker, /request\.method !== 'GET'/);
assert.match(worker, /url\.origin !== self\.location\.origin/);
assert.match(worker, /url\.pathname\.startsWith\('\/api\/'\)/);
assert.match(worker, /url\.pathname\.startsWith\('\/_next\/static\/'\)/);
assert.match(worker, /SHELL_ROUTES\.has\(url\.pathname\)/);
assert.match(worker, /status: 503/);

console.log('PWA assets and cache boundaries verified');
