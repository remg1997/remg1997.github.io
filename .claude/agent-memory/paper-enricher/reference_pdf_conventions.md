---
name: PDF conventions for this repo
description: How PDFs are stored and read in this project
type: reference
---

**Storage path:** `/Users/rafael/Masters/remg1997.github.io/papers/<slug>.pdf`

**Summary path:** `/Users/rafael/Masters/remg1997.github.io/papers/<slug>.md`

**Reading strategy:** The Read tool requires a `pages` parameter for PDFs > 20 pages. For typical 8-12 page conference papers, pages 1-10 cover all main content (abstract through conclusion + references start). Appendices typically start on page 11+. Request pages 1-10 first; fetch 11-20 only if appendix content is needed for the summary.

**Preferred sources (in order):** arXiv PDF → OpenReview → ACL Anthology → author pages → Semantic Scholar.

**arXiv URL pattern:** `https://arxiv.org/abs/<id>` (abstract), `https://arxiv.org/pdf/<id>` (PDF direct).
