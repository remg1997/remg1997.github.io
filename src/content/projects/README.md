# projects/

Each project is a single Markdown file whose filename is the slug. Routed to `/projects/<slug>/` via `src/pages/projects/[...slug].astro`. Kind-filtered archives at `/projects/{publications,datasets,competitions}/`.

## Frontmatter schema (from `src/content.config.ts`)

```yaml
---
title: "Project title"                        # required
kind: "publication" | "dataset" | "competition"  # required
date: 2024-12-10                              # required
venue: "NeurIPS D&B 2024"                     # optional, conference/venue
description: "One-sentence summary."          # required
link: "https://..."                           # optional, canonical URL
image: ./<slug>/hero.jpg                      # optional
tags: [alignment, evaluation]                 # optional
featured: false                               # optional, promotes to the featured slot
---

Long-form write-up goes in the Markdown body.
```

## Conventions

- Slug doubles as the filename and the URL path segment.
- Co-locate images in `src/content/projects/<slug>/<filename>.<ext>` and reference with a relative path in the body or frontmatter.
- `featured: true` puts the project at the top of `/projects/` under a "featured" treatment; otherwise it lands in the grid.
