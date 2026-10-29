import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* Case studies. Each file is served at the site root (/<slug>/) to keep the old WordPress URLs. */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    location: z.string().optional(),
    date: z.coerce.date(),
    summary: z.string(),
    // websites, social, photo, video: match the chips on /work/
    filters: z.array(z.enum(['websites', 'social', 'photo', 'video'])),
    cover: z.string(),
    coverAlt: z.string(),
    videos: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };
