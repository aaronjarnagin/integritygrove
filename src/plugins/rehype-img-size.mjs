// Adds width/height to Markdown images that point into public/, so case study pages don't shift as images load.
import { visit } from 'unist-util-visit';
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = fileURLToPath(new URL('../../public/', import.meta.url));
const cache = new Map();

export default function rehypeImgSize() {
  return async (tree) => {
    const jobs = [];
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' || node.properties.width) return;
      const src = node.properties.src;
      if (typeof src !== 'string' || !src.startsWith('/')) return;
      const file = join(PUBLIC, src);
      if (!existsSync(file)) return;
      jobs.push((async () => {
        if (!cache.has(file)) cache.set(file, sharp(file).metadata().then((m) => [m.width, m.height]));
        const [w, h] = await cache.get(file);
        node.properties.width = w;
        node.properties.height = h;
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
      })());
    });
    await Promise.all(jobs);
  };
}
