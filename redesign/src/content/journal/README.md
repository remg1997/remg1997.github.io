# Journal — local-only notes

This folder is **gitignored** (see `.gitignore`). Only this README is tracked.
Everything else stays on your machine and never reaches GitHub or the production build.

## How it renders

- `npm run dev` → entries show up at `/journal` and `/journal/<slug>/`, plus a "Journal" link appears in the header.
- `npm run build` → the `[...slug].astro` route returns `[]` from `getStaticPaths`, so **no journal HTML is emitted and no journal images are bundled**. The `/journal/` index page still exists in the build output but renders "Not available." and ships `<meta name="robots" content="noindex,nofollow">`.

## Creating an entry

One markdown file per event. Filename becomes the slug.

```
src/content/journal/iclr-2026.md        ← entry, gitignored
src/content/journal/iclr-2026/          ← photos for this entry, gitignored
  keynote.jpg
  poster-session.jpg
```

Frontmatter schema (see `src/content.config.ts`):

```yaml
---
title: "ICLR 2026"           # required
event: "ICLR 2026"           # required — used to group entries on the index
date: 2026-04-23             # required
location: "Vienna, Austria"  # optional
tags: [conference, iclr]     # optional
status: active               # active | archived | remixed
---
```

## Photos

Reference them with relative paths from the markdown file. Astro's image pipeline optimizes them automatically:

```md
![Keynote room](./iclr-2026/keynote.jpg)
```

Because the `[...slug].astro` page isn't built in prod, the images it references are never bundled either.

## Multi-machine workflow

If you want your notes across machines, you need a private sync outside git:
- A private Gist / separate private repo that you clone into this folder
- iCloud / Dropbox symlink
- `rsync` between machines

Whatever you pick, don't `git add -f` this folder into the public repo.
