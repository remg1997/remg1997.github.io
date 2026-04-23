---
name: Journal folder layout for event photos
description: How Rafael organizes his own photography under src/content/journal for per-event, per-talk photos.
type: reference
---

Photos live under `src/content/journal/<event-slug>/<talk-or-topic>/<timestamp>.jpg`.

- Event slug is plain lowercase with hyphens or snake_case (e.g., `iclr-2026`, `the_challenges_of_human_centered_AI`).
- Talk subfolders are **title-cased, spaces preserved** (e.g., `Reducing Belief Deviation in RL/`, `Verifying COT/`, `Rain Merging/`, `Memagent/`, `Revela/`). Quote the path when passing it to shell tools.
- Per-talk folders have ~2-7 JPGs. Filenames are timestamps in `YYYYMMDD_HHMMSS.jpg` format (e.g., `20260423_104700.jpg`). The previous post's folder also has descriptive renames like `title-slide.jpg` and `hall-before-keynote.jpg` — that's the convention Rafael or the writer applies once a photo has been committed to a post.
- `.DS_Store` files show up — ignore them.
- One venue/atmosphere photo per event is typical (e.g., `hall-before-keynote.jpg` in the Mataric folder). It tends to be scoped to the first post of the event, so reusing it across multiple posts needs explicit permission.
