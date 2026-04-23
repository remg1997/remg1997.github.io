---
name: Blog caption voice for The Artificial Engineer
description: Tone cues for captions and alt text on the engineer-track posts.
type: user
---

Rafael's voice on the engineer track: **factual, lightly wry, never clickbaity, no emojis**. Captions are usually 1-2 sentences. Match the CLAUDE.md instruction that disallows emojis in repo files.

Patterns that read well:
- Lead with the figure's authority ("Figure 3 from Huang et al., ICLR 2026.") then the one-line interpretation.
- Use precise technical nouns where the paper uses them (Belief Trap Region, transcoder, in-batch attention, null-space projection) — Rafael's readers know them.
- One dry aside per caption is fine ("Pick two.", "decent sample of where LLM reasoning research lives right now."). Don't stack them.

Patterns to avoid:
- Marketing voice ("game-changing", "revolutionary", "cutting-edge").
- Unnecessary hedging ("arguably the best method to date"). Rafael is direct.
- Emoji. The repo's CLAUDE.md bans them and so does project convention.
- Placeholder text ("TODO", "figure TK"). Plans are shipped to the writer verbatim.

Alt text rule: describe the image for a screen-reader user. It should be useful to someone who cannot see the figure, and therefore not identical to the caption. Caption says *what it means*; alt says *what it is*.
