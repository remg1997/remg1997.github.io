---
name: Image handling for Astro posts
description: Co-locate images next to the post markdown, reference via relative paths, rename from raw timestamps.
type: project
---

Rule: For a post at `redesign/src/content/posts/<slug>.md`, put its images in a sibling folder `redesign/src/content/posts/<slug>/`. Reference them in markdown as `./<slug>/<filename>.jpg` — Astro's image pipeline will optimize them automatically. Same for the `image:` frontmatter field.

**Why:** Astro only runs its image optimization on relative paths that the content loader can resolve; absolute paths bypass it. Co-location also keeps the post self-contained and makes cleanup trivial.

**How to apply:**
- Copy (don't move) source images from journals — the journal retains its originals.
- Rename from timestamp filenames (e.g., `20260423_091139.jpg`) to human-readable slugs (e.g., `title-slide.jpg`, `cbt-study-slide.jpg`) before referencing. Descriptive filenames help when scanning git diffs and when images are later reused.
- Add alt text on every image. Brief italicized captions below images are an established convention in this blog and read well.
