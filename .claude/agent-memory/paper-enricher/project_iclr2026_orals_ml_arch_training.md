---
name: ICLR 2026 Oral Session ML Architectures and Training I (Day 2)
description: Canonical IDs, summary file locations, and key findings for the ML Architectures and Training I oral session at ICLR 2026, Day 2
type: project
---

Five papers presented at ICLR 2026 Oral Session "ML Architectures and Training I" (Day 2, 2026-04-24). PDFs at `/Users/rafael/Masters/remg1997.github.io/papers/`. Summaries at same path as .md files. Journal notes at `/Users/rafael/Masters/remg1997.github.io/src/content/journal/iclr-2026.md` under "Oral Session # 1 ML Architectures and Training I".

**Agent assignment:** Papers 1–3 handled by this agent; papers 4–5 (Softmax Turing-completeness + Pretraining under infinite compute) handled by the other parallel agent.

| # | Slug | Title | arXiv | Summary |
|---|---|---|---|---|
| 1 | wsm-decay-free-lr | WSM: Decay-Free Learning Rate Schedule via Checkpoint Merging for LLM Pre-training | arXiv:2507.17634v2 | papers/wsm-decay-free-lr.md (DONE) |
| 2 | optimal-sparsity-moe | Optimal Sparsity of Mixture-of-Experts Language Models for Reasoning Tasks | arXiv:2508.18672 | papers/optimal-sparsity-moe.md (DONE) |
| 3 | lr-decay-wastes-data | How Learning Rate Decay Wastes Your Best Data in Curriculum-Based LLM Pretraining | arXiv:2511.18903 | papers/lr-decay-wastes-data.md (DONE) |
| 4 | softmax-turing-complete | Softmax Transformers are Turing Complete | TBD | TBD (other agent) |
| 5 | pretraining-infinite-compute | Pretraining under Infinite Compute | TBD | TBD (other agent) |

**Key thematic connection across papers 1–3:** All three papers are about LR scheduling and its interaction with training dynamics. WSM shows checkpoint merging is theoretically equivalent to LR decay. The LR-decay-wastes-data paper shows why constant LR is better for curriculum learning. These papers are closely related and should be cross-referenced in any blog post.

**Why:** Rafael is attending ICLR 2026 and writing content for "The Artificial Engineer" blog.

**How to apply:** When asked to update or extend these summaries, check the existing .md files first. Do not modify the journal file directly.
