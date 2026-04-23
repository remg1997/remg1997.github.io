---
name: Conference-journal → post workflow
description: Rafael keeps raw conference notes in src/content/journal/; posts are remixed from specific sections, with empty template sections ignored.
type: project
---

Rafael keeps raw conference notes in `redesign/src/content/journal/<event>.md` and photos in `redesign/src/content/journal/<event>/<topic>/`. The journal file follows a structured template (Day 1/2/3, Talks, Posters, People met, Quotes, Open questions, Remix notes).

**Why:** The journal is his private dev-only scratchpad during the event. It's deliberately messy, has typos, and has many empty template sections that get filled in as the conference progresses. Posts get produced incrementally from whichever sections are populated — not at the end of the conference in one big dump.

**How to apply:**
- When remixing, only use sections that actually have content. Empty bullets, empty quote blocks, and "Remix notes" placeholders are skeleton, not material.
- Photos live in a topic-specific subfolder of the journal dir (e.g., `iclr-2026/the_challenges_of_human_centered_AI/`). Copy, don't move — the journal keeps originals for his own record.
- A single conference can generate multiple posts over the week (one per big talk, or themed across days). Don't try to force everything into one post.
- Raw-note artifacts to silently fix: typos, "IDK" placeholders, half-finished sentences, fragment bullets.
