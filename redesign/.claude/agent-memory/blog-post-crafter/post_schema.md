---
name: Post frontmatter schema (Astro)
description: Exact required/optional fields for posts collection, defined in redesign/src/content.config.ts.
type: reference
---

Schema source of truth: `/Users/rafael/Masters/remg1997.github.io/redesign/src/content.config.ts` (posts collection).

Required:
- `title`: string
- `date`: YYYY-MM-DD (coerced to Date)
- `track`: enum — `"engineers"` or `"everyone"` (NOT `categories`, not an array)
- `excerpt`: string, 1–2 sentence hook

Optional:
- `category`: string (separate from track; rarely needed)
- `tags`: string[] (defaults to [])
- `image`: relative path to co-located image, processed by Astro image pipeline (e.g., `./<slug>/hero.jpg`)
- `readingTime`: string
- `author`: string (defaults to `"Rafael Mosquera"`)
- `draft`: boolean (defaults to false)

Before writing a new post, re-read `content.config.ts` — schema may evolve. If the schema has changed since this memory was written, trust the file, not the memory.
