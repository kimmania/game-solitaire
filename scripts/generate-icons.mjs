#!/usr/bin/env node
/**
 * Regenerate PWA PNGs from public/favicon.svg and public/icon-maskable.svg.
 * Requires: npm install --no-save @resvg/resvg-js
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');

const { Resvg } = await import('@resvg/resvg-js');

function rasterize(svgPath, outPath, size) {
  const svg = readFileSync(join(publicDir, svgPath));
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  writeFileSync(join(publicDir, outPath), resvg.render().asPng());
  console.log(`wrote public/${outPath} (${size}×${size})`);
}

rasterize('favicon.svg', 'pwa-192.png', 192);
rasterize('favicon.svg', 'pwa-512.png', 512);
rasterize('icon-maskable.svg', 'pwa-512-maskable.png', 512);
