import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.preprocess((val) => {
      if (typeof val === 'string') return [val];
      if (Array.isArray(val)) return val;
      return [];
    }, z.array(z.string())).default([]),
    location: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { posts };
