---
name: Voice rules apply to body prose, not necessarily to frontmatter
description: Observation that Rafael left em dashes in excerpt/frontmatter while systematically removing them from body prose. Narrow scope note for the hard voice rules.
type: feedback
---

The hard voice rules in `feedback_voice_style.md` (no em dashes, no "not X, it's Y") apply to **body prose and captions**. The `excerpt:` field of the edited ICLR post still contains an em dash:

```
excerpt: "Opening keynote at ICLR 2026 from USC and Google DeepMind's Maja Mataric — a case that intelligence without a body misses the point, and that the robots we actually need aren't the ones trying hardest to look human."
```

**Why:** Rafael cleaned the body prose carefully. The excerpt survived unchanged. This could be oversight, or it could reflect that SEO-blurb prose is a different register than body prose. Either way, the signal is: the voice rules are load-bearing in the main text, not in metadata fields.

**How to apply:**
- Body prose and image captions: enforce the no-em-dash, no-"not X it's Y" rules strictly, per `feedback_voice_style.md`.
- `excerpt:` / `description:` fields: prefer to follow the same rules (safer), but do not rewrite the body to avoid what the excerpt gets away with. If Rafael pushes back on a frontmatter em dash in the future, tighten this rule.
- Frontmatter field names and YAML syntax are not prose at all; ignore the rules there.
