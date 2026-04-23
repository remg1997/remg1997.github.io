# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Astro 5 personal site + blog ("The Artificial Engineer") deployed to GitHub Pages at `theartificialengineer.ai` via a custom domain (see `public/CNAME`). Styled with Tailwind v4 through the `@tailwindcss/vite` plugin and the `@theme` CSS directive. Type-safe content via Astro content collections.

The previous Jekyll-based site is preserved on the `legacy` branch — check it out if you need to see the old setup or reference historical content.

## Common commands

```bash
npm ci                  # first-time setup / after package-lock changes
npm run dev             # local dev server with HMR (http://localhost:4321)
npm run build           # production build into dist/
npm run preview         # preview the built dist/ locally
```

No lint / test suite. CI (`.github/workflows/pages.yml`) runs `npm run build` on push to `main` and deploys `dist/` to GitHub Pages.

## Architecture

### Content collections

Three Zod-typed collections defined in `src/content.config.ts`:

- **`posts`** (`src/content/posts/`) — blog posts. Required: `title`, `date`, `track`, `excerpt`. `track: "engineers" | "everyone"` is the routing field for this site's two-audience model. Optional: `category`, `tags`, `image` (relative path, optimized via `astro:assets`), `readingTime`, `author`, `draft`.
- **`projects`** (`src/content/projects/`) — publications / datasets / competitions. Required: `title`, `kind`, `date`, `description`. `kind: "publication" | "dataset" | "competition"`.
- **`journal`** (`src/content/journal/`) — private, dev-only notes. Gitignored (only `README.md` is tracked). See "Private journal" below.

### Two-track content model

Posts route into the "For Engineers" or "For Everyone" track via the `track:` front-matter enum. Filtering happens on the archive + index pages by reading `post.data.track`. The URL pattern is flat: `/posts/<slug>/` — the track is metadata, not part of the path.

### Routing

File-based via Astro. Key routes:

- `src/pages/index.astro` — home
- `src/pages/posts/index.astro` — archive + filter tabs
- `src/pages/posts/[...slug].astro` — individual post (generated from the collection)
- `src/pages/projects/*` — same pattern for projects
- `src/pages/journal/*` — dev-only (see below)
- `src/pages/rss.xml.ts` — RSS feed via `@astrojs/rss`

### Private journal (dev-only)

`src/content/journal/` holds scratch notes for conferences / travel that never ship to production. Gating, in order of defense:

- Entries: `src/pages/journal/[...slug].astro` returns `[]` from `getStaticPaths` when `!import.meta.env.DEV`, so no HTML is built in prod and no referenced images are bundled.
- Index: `src/pages/journal/index.astro` renders "Not available." in prod and ships `<meta name="robots" content="noindex,nofollow">`.
- Nav link: the "Journal" entry in `src/components/Header.astro` is conditional on `import.meta.env.DEV`.
- Sitemap: `astro.config.mjs` filters `/journal*` via the sitemap integration's `filter` option.
- Git: `.gitignore` excludes `src/content/journal/**` except `README.md`.

Workflow: jot notes into a per-event markdown file during the conference, drop photos into a sibling folder, then use the `blog-post-crafter` agent to remix the notes into a publishable post under `src/content/posts/`.

### Subagents

- `.claude/agents/blog-post-crafter.md` — opus-grade editorial agent that turns journal notes + photos into Astro-format blog posts. Its persistent project-scope memory lives in `.claude/agent-memory/blog-post-crafter/`.

### Styling

- Tailwind v4 via `@tailwindcss/vite`; design tokens defined in `src/styles/global.css` with the `@theme` directive.
- Fonts: Inter (sans) + Kumbh Sans (display) via `@fontsource-variable/*`.
- Prose styles via `@tailwindcss/typography`.

### Deploy

- GitHub Actions workflow: `.github/workflows/pages.yml`. Node 20, `npm ci`, `npm run build`, upload `dist/` as a Pages artifact, deploy via `actions/deploy-pages`.
- Custom domain: `public/CNAME` contains `theartificialengineer.ai`. Astro copies it into `dist/` verbatim at build time.
- DNS lives at Namecheap, pointed at GitHub Pages (A records + `www` CNAME). No Vercel.
