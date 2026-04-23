---
name: Technical posts must link to each paper
description: For engineers-track posts that discuss research papers, every paper must be linked to its canonical source (arXiv/OpenReview/publisher) with a short explicit "read the full paper here" handoff.
type: feedback
---

When the post is on the **engineers** track and discusses one or more research papers, each paper must include a direct link to its canonical source with an explicit read-more handoff.

**Why:** Rafael's technical readers will want to verify claims, check method details, and go deeper. A post that names papers without linking them makes the reader do the search. The enrichment pipeline (paper-enricher) captures these URLs in `papers/<slug>.md` frontmatter under `**Source:**` and `**Local copy:**`, so the information is already at hand, there is no excuse to omit the link.

**How to apply:**

- Check `papers/<slug>.md` for the canonical URL when writing about a paper. The field is labeled `**Source:**`. Prefer arXiv if available, then OpenReview, then publisher/venue, then authors' page.
- Place the link at the end of the paper's section, as a one-line handoff. Suggested phrasings, pick whichever reads best:
  - `You can read the full paper here: [title or arXiv ID](URL).`
  - `Full paper: [arXiv:2510.xxxxx](URL).`
  - `Paper here: [Author et al., Year](URL).`
- Use markdown link syntax. The visible link text should be specific (paper title, arXiv ID, or author + year), not generic "click here."
- For "everyone" track posts, paper links are optional but recommended when a specific paper is named. The hard rule applies only to the engineers track.
- If no `papers/<slug>.md` exists for a paper mentioned in the notes, flag this in your delivery report, do not invent a URL. The enrichment step should have produced a summary; its absence is a signal to the user.

**Applies to:** Every engineers-track post that cites research work by name. Survey posts with many references can use a "References" section at the end instead of inline handoffs, but each paper still gets a link.
