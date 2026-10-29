import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeImgSize from './src/plugins/rehype-img-size.mjs';

export default defineConfig({
  site: 'https://integritygrove.com',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeImgSize],
  },
});
