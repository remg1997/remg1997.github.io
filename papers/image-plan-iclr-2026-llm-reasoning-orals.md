# Image Plan: "Notes from ICLR 2026: Five Orals on LLMs and Reasoning"

**Post path:** `src/content/posts/iclr-2026-llm-reasoning-orals.md`
**Track:** engineers
**Sections planned:** 7 (1 opening + 5 paper sections + 1 synthesized closing beat)
**Choice counts:** `user_photo` = 1 · `pdf_figure` = 5 · `diagram_spec` = 1
**Below-60 flags:** Opening section (diagram_spec, 55) — no in-scope venue photo exists and the section is a single-sentence framing paragraph; the writer may want to either drop the image or wait for a venue shot in a future pass.

**Headline verdict on the existing images (all flagged for replacement):**
- Every current in-post image is a user photo from the journal folder, and every one is rotated 90° with visible lens flare and HVAC ductwork. Three of the four are also **mislabeled** against the caption the draft wrote — e.g., the current `belief-trap-region.jpg` is the T3 title slide, not the BTR formulation slide; `memagent-results.jpg` is a background slide about the impossible trinity, not the main experiment.
- PDF figures exist for each paper that cleanly encapsulate the exact claim the draft is making. All five paper sections should switch to PDF figures with citations.
- The one user photo worth keeping is from Revela (`20260423_112002.jpg`) — an upright, non-rotated title-slide shot with the speaker at the podium and full venue context. It's the only photo that photographs well.

---

## Opening section (untitled intro before the first `##`)

```yaml
section: opening
anchor: intro
choice: diagram_spec
source: null
fitness_score: 55
caption: "Session 1, Day 1 of ICLR 2026: five orals, five very different takes on reasoning."
alt_text: "A simple session agenda card listing the five oral-session papers in order: T3 (Belief Trap), MemAgent, CRV, Revela, RAIN-Merging, with the ICLR 2026 header."
rationale: "No in-scope user photo works here — the ICLR hall shot that opened the previous post is explicitly out of scope, and every per-talk photo from this session is a rotated in-session slide capture. A compact agenda card gives the reader the session's shape at a glance and sets up the five headings that follow, which is genuinely informative for an engineer-track reader. Scored 55 because a real venue photo would beat this; flagged so the writer can drop it if a better shot surfaces later."
runners_up:
  - source: src/content/journal/iclr-2026/Reducing Belief Deviation in RL/20260423_104700.jpg
    fitness_score: 45
    note: "T3 title slide on the oral-session stage. Captures the 'session starting' moment but is rotated 90° with heavy lens flare; also implicitly scoped to the first paper rather than the whole session."
diagram_spec: |
  Textual spec (not a flowchart — a layout card, suitable for an image-generation or SVG step):
  - Format: 16:9 landscape card, light background (#F7F5F2 or similar paper-neutral), matching the blog's muted palette.
  - Header (top, small): "ICLR 2026 · Day 1 · Oral Session 1 · LLMs and Reasoning"
  - Body: five numbered rows, each with a short title and a one-line hook:
      1. T3 — Reducing Belief Deviation in RL (active reasoning, POMDPs)
      2. MemAgent — Reshaping Long-Context LLMs (trained memory via RL)
      3. CRV — Verifying CoT via its Computational Graph (transcoders + attribution graphs)
      4. Revela — Dense Retriever Learning via Language Modeling (no query-doc pairs)
      5. RAIN-Merging — Instruction Following for LRMs (gradient-free task-vector merging)
  - Typography: monospace or technical serif for the numbered rows; plain prose for the hook. No icons, no gradients.
  - Aspect ratio target: 1600x900.
```

---

## Section 1 — "Reducing Belief Deviation in RL for Active Reasoning of LLM Agents"

```yaml
section: "Reducing Belief Deviation in RL for Active Reasoning of LLM Agents"
anchor: t3-belief-trap
choice: pdf_figure
source:
  pdf: t3-belief-trap.pdf
  page: 2
  figure: "Figure 1"
  extract_path: papers/figures/t3-belief-trap/figure-1-framework.png
fitness_score: 92
caption: "Figure 1 from Zou et al., ICLR 2026 (arXiv:2510.12264). Left: a vanilla rollout slides into the Belief Trap Region and gets penalized for its informative prefix. Right: T3 truncates at BTR entry so credit lands where it belongs."
alt_text: "Two side-by-side trajectory diagrams. On the left, a vanilla method, an agent's belief, action, and observation sequence descends into a shaded 'BTR Entry' region. On the right, the same trajectory is cut off with a green 'Early Truncation' marker, and the prefix actions are checkmarked."
rationale: "The paper's Figure 1 is the canonical framework diagram and maps 1:1 to the draft's explanation of BTR entry and truncation. The current post image is actually the T3 title slide misfiled as the BTR formulation — a direct mismatch between caption and image. Replacing it with Figure 1 fixes the mismatch and tightens the section."
runners_up:
  - source:
      pdf: t3-belief-trap.pdf
      page: 3
      figure: "Figure 2"
    fitness_score: 72
    note: "Empirical verification panels (lower-bound fitting + token-wise GAE). Stronger evidentiary figure but less narrative — the prose section doesn't yet reference Theorem 1/2 empirically, so the framework figure fits the current text better."
  - source: src/content/journal/iclr-2026/Reducing Belief Deviation in RL/20260423_105316.jpg
    fitness_score: 50
    note: "Speaker's 'BTR Tails Suppresses Informative Actions' slide — contains the right content but rotated 90°, with ceiling HVAC visible. Would need de-rotation and cropping to be usable."
```

---

## Section 2 — "MemAgent: Reshaping Long-Context LLMs with Multi-Conv RL Based Memory"

```yaml
section: "MemAgent: Reshaping Long-Context LLMs with Multi-Conv RL Based Memory"
anchor: memagent
choice: pdf_figure
source:
  pdf: memagent-long-context.pdf
  page: 3
  figure: "Figure 2"
  extract_path: papers/figures/memagent/figure-2-workflow.png
fitness_score: 94
caption: "Figure 2 from Yu et al., ICLR 2026 (arXiv:2507.02259). MemAgent reads a document as a stream of chunks, rewriting a fixed-length memory between each step, then answers from the final memory only."
alt_text: "An architecture diagram comparing standard long-context LLMs (top, a single LLM consuming the entire sequence 1..N plus a question) with MemAgent (bottom, four LLM boxes in a chain, each receiving one chunk plus the prior memory slot and emitting an updated memory; the final LLM outputs the answer)."
rationale: "Figure 2 is the cleanest visualization of MemAgent's 'three moves' that the draft enumerates: chunk-by-chunk reading, fixed-length memory overwrite, end-to-end training. It tells the whole story in one diagram. The current post image (labeled 'main experiment') is actually a background slide about the impossible trinity — wrong content for the caption."
runners_up:
  - source:
      pdf: memagent-long-context.pdf
      page: 1
      figure: "Figure 1"
    fitness_score: 88
    note: "The headline near-lossless-extrapolation accuracy plot (7K to 3.5M tokens). Very strong atmospheric fit for 'MemAgent achieves near-lossless extrapolation in the main experiment' — a good second image if the post later gets two slots for this section."
  - source: src/content/journal/iclr-2026/Memagent/20260423_110221.jpg
    fitness_score: 42
    note: "Presenter's 'impossible trinity' slide. Relevant to the draft's framing sentence but rotated and heavy with text; the paper figure is better."
```

---

## Section 3 — "Verifying CoT Reasoning via its Computational Graph"

```yaml
section: "Verifying CoT Reasoning via its Computational Graph"
anchor: crv
choice: pdf_figure
source:
  pdf: crv-cot-verification.pdf
  page: 3
  figure: "Figure 1"
  extract_path: papers/figures/crv/figure-1-pipeline.png
fitness_score: 95
caption: "Figure 1 from Zhao et al., ICLR 2026 (arXiv:2510.09312). The four stages of Circuit-based Reasoning Verification: swap MLPs for transcoders, build an attribution graph per CoT step, extract graph features, and classify correctness."
alt_text: "A four-panel pipeline diagram. Left panel shows three transformer layers where each MLP is replaced with a transcoder block. Center panel shows an attribution graph of active features connected by arrows between layers on the tokens '3 + 5 ='. Right panel shows three feature buckets (Global Stats, Node Stats, Topological Features) feeding into a diagnostic classifier that outputs correct or incorrect."
rationale: "This figure matches the draft's 4-step numbered list almost verbatim — the same four stages, in the same order. The presenter also used this figure in the talk, and the user's photo of that slide captures the same content (just rotated and angled). Using the clean paper version removes the venue artifacts."
runners_up:
  - source: src/content/journal/iclr-2026/Verifying COT/20260423_114923.jpg
    fitness_score: 68
    note: "User's capture of the same CRV pipeline slide during the talk. Content-correct but rotated 90° and angled; PDF figure is cleaner. Worth keeping in mind as 'here's the room' alt if the writer wants a narrative beat."
  - source: src/content/journal/iclr-2026/Verifying COT/20260423_115135.jpg
    fitness_score: 58
    note: "Results table slide with the speaker visible at the podium — good atmosphere shot for a future 'results' paragraph, but the current draft doesn't have one."
```

---

## Section 4 — "Revela: Dense Retriever Learning via Language Modeling"

```yaml
section: "Revela: Dense Retriever Learning via Language Modeling"
anchor: revela
choice: pdf_figure
source:
  pdf: revela-retriever.pdf
  page: 2
  figure: "Figure 1"
  extract_path: papers/figures/revela/figure-1-framework.png
fitness_score: 96
caption: "Figure 1 from Cai et al., ICLR 2026 (arXiv:2506.16552). A batch of raw chunks goes through a dense retriever, whose similarity scores reweight the in-batch attention inside the LM. A single next-token loss backpropagates into both."
alt_text: "A horizontal architecture diagram. On the left, a flame icon marks a trainable dense retriever consuming four text chunks from a batch. Its similarity scores feed into the 'In-batch Attention' block of a stack of transformer layers on the right, which produces a next-token prediction and a perplexity loss. A dashed backpropagation arrow runs back from the loss through both the LM and the retriever."
rationale: "This figure is arguably the highest-fidelity match in the entire plan: the draft's four-step enumeration ('input raw chunks → retriever encodes and computes similarity → similarity reweights cross-chunk attention → single NTP loss backpropagates into both') is literally a caption for this figure. The current post image is the speaker's spoken comparison table — much lower utility."
runners_up:
  - source: src/content/journal/iclr-2026/Revela/20260423_112002.jpg
    fitness_score: 74
    note: "The only non-rotated, speaker-at-podium user photo in the whole folder. Clean, atmospheric, shows the Revela title slide from a distance with ICLR venue signage. Strong candidate if the writer decides they want a narrative/venue shot for this section; paper figure still wins on technical content."
  - source:
      pdf: revela-retriever.pdf
      page: 4
      figure: "Figure 2"
    fitness_score: 80
    note: "Lower-level architecture with the attention-map detail. More technical, less narrative — good if the section grows to cover the in-batch attention math."
```

---

## Section 5 — "RAIN-Merging: A Gradient-Free Method to Enhance Instruction Following"

```yaml
section: "RAIN-Merging: A Gradient-Free Method to Enhance Instruction Following"
anchor: rain-merging
choice: pdf_figure
source:
  pdf: rain-merging.pdf
  page: 5
  figure: "Figure 3"
  extract_path: papers/figures/rain-merging/figure-3-two-stages.png
fitness_score: 90
caption: "Figure 3 from Huang et al., ICLR 2026 (arXiv:2602.22538). RAIN-Merging's two stages: null-space projection preserves the LRM's thinking format (left), then attention-score coefficients amplify instruction-relevant heads (right)."
alt_text: "A two-panel figure. Left panel contrasts a vanilla merge (top row: task vectors added directly, output missing the thinking-end token) with RAIN-Merging's Stage 1 projection onto the null space of thinking-token features (bottom row: output satisfies the length constraint). Right panel shows Stage 2: instruction calibration produces attention outputs that are analyzed for alignment vs leakage, yielding per-head merging coefficients via a quadratic approximation."
rationale: "Figure 3 is a direct visual of the 'two-step fix' the draft describes. The current post has no image for this section at all (the post currently stops at four images), so this is a net new pick. Figure 3 beats Figure 1 because the draft walks through the two stages explicitly and Figure 1 is more narrative-illustrative."
runners_up:
  - source:
      pdf: rain-merging.pdf
      page: 2
      figure: "Figure 1"
    fitness_score: 82
    note: "The more narrative 'before/after' user-experience illustration with checkmarks. Very readable for non-experts, but the draft is engineer-track and explicitly names the two stages — Figure 3 matches that framing."
  - source: src/content/journal/iclr-2026/Rain Merging/20260423_113426.jpg
    fitness_score: 48
    note: "User's capture of the Figure 1 background slide with red 'lack of instruction-following hinders applications' text. Rotated, angled, and text-heavy; also shows only half of the figure."
```

---

## Closing section (synthesized — post currently ends at RAIN-Merging with no conclusion)

```yaml
section: closing
anchor: closing
choice: user_photo
source: src/content/journal/iclr-2026/Revela/20260423_112002.jpg
fitness_score: 78
caption: "The Revela title slide going up on the oral-session stage. Five papers, one afternoon, a decent sample of where LLM reasoning research lives right now."
alt_text: "A long view of the ICLR 2026 oral-session stage with dark walls and ICLR venue signage. The Revela title slide is projected on the screen; the speaker is visible at the podium on the lower left."
rationale: "The post doesn't have a written closing section today, but if the writer adds even a one-paragraph wrap, this is the image for it: the single clean, upright, in-focus user photo from the whole session folder. It's atmospheric rather than technical, which is exactly what a closing beat wants. If the writer doesn't add a closing paragraph, skip this entry — don't force it."
runners_up:
  - source: src/content/journal/iclr-2026/Verifying COT/20260423_115135.jpg
    fitness_score: 58
    note: "Speaker at the podium with the CRV results table behind. Would need rotation fix and crop to be usable."
  - choice: diagram_spec
    fitness_score: 50
    note: "A simple 2x3 grid card recapping the five papers with one takeaway each. Useful if the writer adds a 'takeaways' section, but feels redundant with the opening agenda card."
```

---

## Extraction log

No PDF extractions were run in this pass — the sandboxed bash environment denied `pdftoppm` and `pdfimages`. All figure picks were verified by opening the PDF pages directly with the Read tool (page-range render), visually confirming the figure number, content, and page. The `extract_path` entries in each `source` block are the **target paths** the writer (or a subsequent extraction pass with shell permissions) should populate:

- `papers/figures/t3-belief-trap/figure-1-framework.png` — from `t3-belief-trap.pdf` page 2, Figure 1 (framework comparison with BTR entry vs early truncation).
- `papers/figures/memagent/figure-2-workflow.png` — from `memagent-long-context.pdf` page 3, Figure 2 (standard LLM vs MemAgent streaming-memory workflow).
- `papers/figures/crv/figure-1-pipeline.png` — from `crv-cot-verification.pdf` page 3, Figure 1 (four-stage CRV pipeline).
- `papers/figures/revela/figure-1-framework.png` — from `revela-retriever.pdf` page 2, Figure 1 (batch → retriever → in-batch attention → NTP loss with backprop).
- `papers/figures/rain-merging/figure-3-two-stages.png` — from `rain-merging.pdf` page 5, Figure 3 (Stage 1 null-space projection + Stage 2 attention-guided coefficients).

Recommended extraction commands for whoever runs this (not executed here):

```bash
pdftoppm -png -r 200 -f 2 -l 2 papers/t3-belief-trap.pdf        papers/figures/t3-belief-trap/page
pdftoppm -png -r 200 -f 3 -l 3 papers/memagent-long-context.pdf papers/figures/memagent/page
pdftoppm -png -r 200 -f 3 -l 3 papers/crv-cot-verification.pdf  papers/figures/crv/page
pdftoppm -png -r 200 -f 2 -l 2 papers/revela-retriever.pdf      papers/figures/revela/page
pdftoppm -png -r 200 -f 5 -l 5 papers/rain-merging.pdf          papers/figures/rain-merging/page
```

Then crop each page-render to the figure bounding box and rename to the `extract_path` above. If any paper has a vector-embedded figure that comes out blurry at 200 dpi, bump to 300 dpi or use `pdfimages -all` to try for the embedded raster.

The empty directories (`papers/figures/<slug>/`) were created earlier in this run.
