---
name: Post image path convention
description: Where images land for a post and the naming pattern to use.
type: reference
---

Post images for a Jekyll post live in a folder named after the post slug:

- Post file: `src/content/posts/<slug>.md`
- Image folder: `src/content/posts/<slug>/`
- Image references in the markdown use **relative** paths: `./<slug>/image-name.jpg`

**Naming inside the post folder:** descriptive-kebab-case, not timestamps. E.g., `belief-trap-region.jpg`, `memagent-results.jpg`, `crv-attribution-graph.jpg`, `hall-before-keynote.jpg`, `title-slide.jpg`. When images originate from the journal (timestamped filenames), they get renamed on the way into the post folder.

**Figures extracted from PDFs** are staged under `papers/figures/<paper-slug>/<figure-name>.png`. That directory tree is gitignored today (parent `papers/*.pdf` rule). If a figure survives into the final post, it moves to `src/content/posts/<slug>/` and the `.gitignore` may need updating.

**Frontmatter `image:` field** uses the same relative path, e.g., `image: ./iclr-2026-llm-reasoning-orals/belief-trap-region.jpg`. It drives the post card's hero image.
