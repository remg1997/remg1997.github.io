---
name: No "X is where/what Y" framing sentences
description: Delete sentences that editorialize about what's coming next ("X is what made the talk click", "X is where the machinery earns its name"). They add no information and prime the reader to admire the framing instead of engage the idea.
type: feedback
---

Rafael finds a specific flavor of content-level framing annoying. Examples he flagged from the Day 1 Oral #2 post:

- "Their conceptual split is what made the talk click."
- "The aggregation step is where the machinery earns its name."

**Why:** Same root as the existing no-authorial-color rule, but applied to content instead of to the writing process. Both examples *promise* insight without delivering. The actual insight sits in the sentences that follow; the framing sentence is decorative and can be deleted with zero information loss. Rafael's reaction: "I hate adding a weird comment where unnecessary."

**How to apply:**

Before delivering a post, grep your output for these patterns and rewrite every hit:

- `is where .* (earns|makes|works|clicks|lands|rules)`
- `is what (made|makes|rules|earns|clicks)`
- `is the (real|key|whole|actual|core|central) (point|insight|trick|move|contribution|idea|thing)`
- `earns its (name|place|keep|keeping)`
- `makes (it|the X) (click|work|tick|land|matter)`
- `[Tt]he meta-?point`
- `[Ww]hat matters is`
- `[Tt]he (real|whole) point is`

When you find one:
1. If the sentence contains a fact, fold it into the paragraph that follows. Then delete the framing.
2. If the sentence is pure framing, delete it. The content stands.

**Examples of the fix (from the Day 1 Oral #2 post):**

- Before: "The aggregation step is where the machinery earns its name. From the fitted latent strengths..."
- After: "From the fitted latent strengths..."

- Before: "Their conceptual split is what made the talk click. **Measurable preferences** are what could be learned..."
- After: "**Measurable preferences** are what could be learned..."

- Before: "The Concat mode is what rules out the alternative hypothesis. Concatenate all shards into a single bulleted list..."
- After: "The Concat mode (concatenate all shards into a single bulleted list, one turn) stays within 5% of Full. Rephrasing noise is ruled out; the degradation in Sharded is genuine multi-turn confusion."

**Relation to existing rules:** combines with `feedback_voice_style.md` (no authorial color about the writing process) and `feedback_conference_post_structure.md` (end on speaker's quote). Net principle: present content; never narrate about content.
