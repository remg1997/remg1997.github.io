---
name: Rafael's voice rules (em dashes, rhetorical structure, terseness)
description: Hard editorial rules derived from user edits to the first ICLR 2026 post. Apply to every draft; the system prompt's "Non-Negotiable Voice Rules" section is the canonical source and this memory shows the evidence.
type: feedback
---

After the first ICLR 2026 keynote post, Rafael rewrote substantial portions of the draft. The pattern across his edits is consistent and was stated verbatim: no em dashes, no "not X, it's Y" rhetorical structures, and a strong preference for terseness over authorial color.

**Why:** Rafael finds these patterns stylistically distasteful. He edited them out systematically, then asked for the agent's instructions to be updated so the next run doesn't require the same manual pass.

**How to apply:** Enforce on every draft. These aren't suggestions; they are hard rules. Run a self-check pass before delivering: search your own output for `—`, for `isn't … it's`, for `not … but rather`. Rewrite any hit.

## Evidence from the diff (cb37f38 → 4c91ffa)

### Em dashes replaced with commas or split sentences

| Agent draft (bad) | Rafael's edit (good) |
|---|---|
| `intellectual curiosity — the discovery drive` | `intellectual curiosity, the discovery drive` |
| `tokens — they emerged` | `tokens, they emerged` |
| `a physical robot — the kind of imitation` | `a physical robot, the kind of imitation` |
| `expect of it — and the harder it crashes` | `expect of it, and the harder it crashes` |
| `**Socially Assistive Robotics (SAR)** — machines that help` | `**Socially Assistive Robotics (SAR)**, machines that help` |

### "Not X, it's Y" deleted outright

Whole passages were cut rather than reworded, because the negate-then-affirm structure is the problem, not the content.

- Cut: `The design question isn't "how do we make robots that people like?" It's "how do we design for the full, ugly range of how people actually behave around things that seem alive?"` → Rafael kept only the second question, stated directly.
- Cut: `The bottleneck in most health and education outcomes isn't information and it isn't even access — it's behavior.` → Removed entirely; both constructs were problems (em dash + `isn't … it's`).
- Cut: `The body isn't decoration. It's what the social brain is actually reaching for.` → Rewritten as `The body isn't decoration, but rather what the social brain is actually reaching for.`

  Note: the "but rather" variant *survived* once in his edits, so "not X, but rather Y" may be slightly less offensive than "not X. It's Y." But he explicitly named it as undesirable. Treat both as banned.

- Cut: `Not a little better. Consistently better, across studies, across domains.` (this is the same rhetorical move across two sentences) → Rafael kept it this once, but flag it as borderline in future drafts.

### Flourishy color and meta-commentary cut

- `Her next move was the one I keep thinking about.` → deleted
- `Most of us, she said, tell ourselves we're doing both. Most of the time, we're really only doing the first.` → deleted
- `The line she used — "AI is like us but not like us" — explains a lot. We run our in-group and out-group machinery on anything that behaves like an agent. A robot that's close enough to human to feel social is also close enough to become a target for the less generous parts of how we treat each other.` → whole paragraph deleted
- `plus the connections I couldn't stop drawing while she was on stage. The ideas are hers. The emphasis is mine.` → reduced to `plus some thoughts.`
- `I wanted a seat where I could see the slides without craning.` → deleted
- Closing paragraph: `I came in expecting a robotics talk. I left with a homework assignment for the rest of the week…` → deleted
- `More notes as the conference goes on.` → deleted

### First-person experiential framing minimized

A small amount at the opening to situate the reader is fine (`I got to the room early on purpose`). After that, the post should foreground ideas, not the author's internal experience of encountering them.

### Filler intensifiers cut

- `Her answer was disarmingly honest: nobody knows.` → `The answer is nobody knows.`

## Edge cases and tension

- A few em dashes survived the edit (`"greater good" — human-centered technologies`). Execution was imperfect; the stated rule is stronger than the observed edit. Don't use Rafael's one missed em dash as permission to add one back.
- The "not X, but rather Y" variant survived once. Banned going forward per his explicit statement.
- Closing should land on an idea or a quote, not on a meta-teaser about "more to come."
