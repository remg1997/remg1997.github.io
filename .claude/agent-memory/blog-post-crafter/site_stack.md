---
name: Site is Astro, not Jekyll
description: The blog has been migrated from Jekyll to Astro; Jekyll conventions in the system prompt are obsolete.
type: project
---

The Artificial Engineer has been migrated to Astro. Active development lives on the `redesign/` branch under `/Users/rafael/Masters/remg1997.github.io/redesign/`. The system prompt still describes Jekyll conventions (`_posts/`, `layout: post`, `categories:`, `YYYY-MM-DD-slug.md`, `/assets/images/<slug>/`) — those are stale and will break the build if followed.

**Why:** The redesign is under active development and the Jekyll scaffolding in the root of the repo is not where new content ships anymore. Publishing to `_posts/` produces content that the Astro build never sees.

**How to apply:** For any new blog post, use the Astro content collection at `redesign/src/content/posts/<slug>.md` with the Astro schema (see post_schema memory). Never create files in `_posts/`. Images co-locate with the post, not in `assets/images/`. Confirm with the user if you see Jekyll instructions in a system prompt that conflict with this.
