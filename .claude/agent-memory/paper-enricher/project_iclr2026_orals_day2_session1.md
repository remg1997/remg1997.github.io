---
name: ICLR 2026 Day 2 Oral Session #1 ML Architectures and Training I
description: Canonical IDs, summary file locations, and key details for all five papers in Day 2 Oral Session #1 (ML Architectures and Training I)
type: project
---

All five papers from ICLR 2026 Day 2 Oral Session #1 (ML Architectures and Training I). PDFs at `/Users/rafael/Masters/remg1997.github.io/papers/`. Journal notes at `/Users/rafael/Masters/remg1997.github.io/src/content/journal/iclr-2026.md` under "Oral Session # 1 ML Architectures and Training I" inside "Day 2 - 2026-04-24".

**Agent assignment:** Papers 1–3 (WSM, Optimal Sparsity MoE, LR Decay) handled by the other parallel agent. Papers 4–5 handled by this agent.

| # | Slug | Title | arXiv | OpenReview | Summary |
|---|---|---|---|---|---|
| 1 | (other agent) | WSM Decay Free Learning Rate Schedule | — | — | — |
| 2 | (other agent) | Optimal Sparsity of MoE Language Models for Reasoning Tasks | — | — | — |
| 3 | (other agent) | How LR Decay Wastes Your Best Data in Curriculum Learning | — | — | — |
| 4 | softmax-transformers-turing | Softmax Transformers are Turing-Complete | arXiv:2511.20038 | openreview.net/forum?id=FdkPOHlChS | papers/softmax-transformers-turing.md (DONE) |
| 5 | pretraining-infinite-compute | Pre-training Under Infinite Compute | arXiv:2509.14786 | openreview.net/forum?id=ck0aZTAnwK | papers/pretraining-infinite-compute.md (DONE) |

**Paper 4 — Softmax Transformers are Turing-Complete:**
- Authors: Hongjian Jiang, Michael Hahn, Georg Zetzsche, Anthony Widjaja Lin
- Key result: Softmax CoT transformers are Turing-complete. Without RPE: complete for unary alphabets and letter-bounded languages. With RPE: complete for arbitrary alphabets. Negative result: without RPE, binary languages are not Turing-complete.
- Framework: C-RASP (Counting RASP) with log-n scaled softmax; routes through Minsky counter machines rather than Turing machines
- Learnability guarantee: constructions are length-generalizably learnable (Huang et al. 2025 framework)
- Empirical: LLaMA trained on arithmetic tasks (primes, GCD, etc.) in unary/binary; binary without RPE fails at test lengths >100

**Paper 5 — Pre-training Under Infinite Compute:**
- Authors: Konwoo Kim, Suhas Kotha, Percy Liang, Tatsunori Hashimoto
- Key result: With fixed 200M tokens and unlimited compute, joint regularization + ensemble scaling achieves 5.17× data efficiency vs. standard baseline
- Weight decay: optimal is 0.8–3.2 (vs. standard 0.1); 30× larger for biggest models
- Ensemble: Two 300M models beat one 600M model. Asymptote 3.27 (ensemble) vs 3.43 (single regularized) vs 3.17 (joint scaling)
- Distillation: 83% of ensemble benefit retained in single model (8× inference cost reduction)
- Downstream: +9% accuracy on PIQA/SciQ/ARC Easy; 17.5× data efficiency on math continued pretraining
- Scaling law: L_hat = 0.05/N^1.02 + 3.43 (exponent 1.02 vs. Chinchilla's 0.34)
- Directly applicable to BabyLM-style data-constrained training

**Why:** Rafael is at ICLR 2026 and will write a polished blog post summarizing Day 2 orals for "The Artificial Engineer". The .md summaries feed that post.

**How to apply:** Check existing .md summaries first. Do not modify the journal file.
