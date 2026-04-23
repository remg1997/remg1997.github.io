# The Artificial Engineer — redesign

Astro + Tailwind v4 rebuild of theartificialengineer.ai. Lives on the `redesign` branch in a subdirectory so it can coexist with the current Jekyll site on `main`.

## Commands

```bash
cd redesign
npm install
npm run dev     # http://localhost:4321
npm run build   # produces dist/
npm run preview # serves dist/
```

## Layout

- `src/content/posts/` — blog posts (markdown/mdx), with frontmatter: `title`, `date`, `track` (`engineers` \| `everyone`), `excerpt`, `tags`, optional `image`, `category`, `readingTime`
- `src/content/projects/` — publications / datasets / competitions, with frontmatter: `title`, `kind` (`publication` \| `dataset` \| `competition`), `date`, `link`, optional `image`, `venue`, `description`
- `src/layouts/BaseLayout.astro` — the page shell (head, header, footer)
- `src/components/` — shared UI (header, footer, cards, CTA)
- `src/pages/` — route files

## Deploying the preview

Connect this repo to Vercel, set the project root to `redesign/`, target the `redesign` branch. Every push to the branch produces a preview URL. The production domain stays on the Jekyll site until we flip it.
