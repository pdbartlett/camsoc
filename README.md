# Berkshire and Oxfordshire Cambridge Society Website

Website for the Berkshire and Oxfordshire Cambridge Society (official alumni group of the University of Cambridge).

Built with **[Astro](https://astro.build/)**, **[Bun](https://bun.sh/)**, and **[Tailwind CSS](https://tailwindcss.com/)**.

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)

## Getting Started

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Start the local development server**:
   ```bash
   bun dev
   ```
   Open [http://localhost:4321](http://localhost:4321) in your browser.

3. **Build for production**:
   ```bash
   bun run build
   ```
   The static output will be generated in `./dist`.

4. **Preview the production build locally**:
   ```bash
   bun preview
   ```

## Deployment

The website is configured for continuous static site deployment to **GitHub Pages** using GitHub Actions (`.github/workflows/deploy.yml`).

Every push to the `main` branch automatically:
1. Installs the Bun runtime via `oven-sh/setup-bun`
2. Installs dependencies using `bun install --frozen-lockfile`
3. Builds the static site with `bun run build`
4. Deploys the `./dist` artifact to GitHub Pages
