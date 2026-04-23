---
name: Papers directory — enriched summaries + PDFs
description: The papers/ directory contains paired enriched summaries and source PDFs produced by the paper-enricher upstream agent.
type: reference
---

The `papers/` directory is the upstream input from the paper-enricher agent in the pipeline. Layout:

- `papers/<slug>.md` — enriched summary. Trustworthy; has TL;DR, key claims, figure references, limitations, and sometimes a "Notes on Rafael's Journal" section that reconciles the author's notes against the paper text.
- `papers/<slug>.pdf` — the source paper (gitignored via `papers/*.pdf` rule).
- `papers/figures/<slug>/` — target folder for extracted figures (created by image-curator, populated by writer or a shell-permissive extraction step).
- `papers/image-plan-<post-slug>.md` — the image-curator's output, consumed by the blog-post-crafter downstream.

**Useful pattern in the enriched summaries:** the "Key Contributions" bullets and the "Method" section typically reference figure numbers by name ("Figure 3", "Figure 1"). When mapping a post section to a figure, use these references as a first-pass guide — they are usually correct.

**Figure-number-to-page lookups are not in the summaries.** You have to open the PDF (via the Read tool with `pages:`) to find which page a given figure lives on. Do that before writing the plan; don't guess.
