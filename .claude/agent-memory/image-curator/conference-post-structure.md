---
name: Conference-post section structure convention
description: How ICLR/conference session posts are structured and what image picks tend to work per section role.
type: reference
---

The user's convention for ICLR / conference session posts on the engineer track:

- **One `##` section per paper**, in the order the papers appeared in the session.
- **Optional opening paragraph** before the first `##` — short framing, one or two sentences. A small agenda card (`diagram_spec`) works as the hero image if no venue photo exists.
- **No closing section by default.** The post ends on the last paper. A closing is only added if the draft specifically synthesizes across papers.
- **Paper-section picks should prefer the method-overview figure** (usually Figure 1 or Figure 2 on pages 1-3 of the PDF) over results-only plots. Engineer-track readers want to see the technique, not just the bars.
- **When a paper has both a narrative example figure and a method diagram**, prefer the method diagram for sections that explain the technique, and the example figure for sections that open with a motivating anecdote.

**Hero-figure patterns that recur:**
- For evaluation / benchmark papers: the method-comparison figure (old metric vs new metric side-by-side) tends to beat pure results tables.
- For RL / training papers: the framework figure with a concrete example embedded beats the abstract architecture diagram.
- For interpretability / alignment papers with cross-dataset findings: the cross-dataset-conflict plot is more memorable than the pipeline diagram.

**When an agenda card is worth it:** only when there is no venue photo and the writer wants visual structure for the reader. Score the agenda card at 55 by default — it's a placeholder that the writer might drop. Never score an agenda card above 60 unless it's carrying information that genuinely doesn't belong in the prose (e.g., a Best Paper star badge).

**When a closing image is worth it:** only when a genuine upright atmospheric user photo exists (Revela-style) AND the draft has a written closing paragraph. Otherwise, omit.
