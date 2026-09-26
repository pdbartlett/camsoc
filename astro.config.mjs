import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// When deploying to GitHub Pages:
// - If BASE_PATH is provided (e.g. from GitHub Actions configure-pages), use it.
// - In CI fallback to '/camsoc'.
// - In local development fallback to '/' for convenience.
const base = process.env.BASE_PATH !== undefined
  ? (process.env.BASE_PATH || '/')
  : (process.env.CI ? '/camsoc' : '/');

const site = process.env.SITE || 'https://pdbartlett.github.io';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },
});
