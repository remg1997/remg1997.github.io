# Revela: Dense Retriever Learning via Language Modeling

**Authors:** Fengyu Cai, Tong Chen, Xinran Zhao, Sihao Chen, Hongming Zhang, Sherry Tongshuang Wu, Iryna Gurevych, Heinz Koeppl
**Venue / Year:** ICLR 2026 (Oral)
**arXiv:** 2506.16552v3 (submitted 20 Feb 2026)
**Source:** https://arxiv.org/abs/2506.16552
**Local copy:** papers/revela-retriever.pdf
**Code / Model:** https://github.com/TRUMANCFY/Revela — https://huggingface.co/trumancai/Revela-3b

---

## TL;DR

Revela trains dense retrievers without any annotated query-document pairs by embedding retrieval inside next-token prediction. A novel in-batch attention mechanism lets a language model condition each token's prediction on all other documents in the batch, weighted by retriever-computed similarity scores — so the retriever and LM are jointly optimized via a single NTP loss. On CoIR (code retrieval), BRIGHT (reasoning-intensive retrieval), and BEIR (general retrieval), a 3B Revela checkpoint surpasses supervised models and commercial embedding APIs using roughly 1000x less training data and 10x fewer compute hours than E5-PT.

---

## Problem & Motivation

Dense retrievers underpin RAG pipelines, but conventional training requires high-quality annotated (query, document) pairs plus hard negatives — a bottleneck that is expensive in general-domain settings and nearly intractable for domain-specific or reasoning-heavy ones (law, code, multi-hop questions). Self-supervised alternatives like Contriever (Izacard et al., 2022) rely on structural heuristics (Inverse Cloze Task, Independent Cropping) that introduce distributional biases. Distillation-based methods like REPLUG (Shi et al., 2024) align a trainable retriever to a frozen LM's perplexity signal, but a frozen LM's perplexity is poorly calibrated for retrieval (Geng et al., 2024). Revela's core observation is that next-token prediction already implicitly learns cross-sequence dependencies — if we expose those dependencies to the retriever during training, the retriever can be optimized for free.

---

## Key Contributions

- **Revela framework:** A self-supervised retriever training paradigm that couples NTP with an in-batch attention mechanism; no query-document pairs, no hard-negative mining, no synthetic data generation.
- **In-batch attention mechanism:** A new transformer block augmentation where each token attends to the self-attention outputs of all other sequences in the batch, with cross-document weights derived from retriever similarity scores; backpropagation flows through both the LM and the retriever jointly.
- **Scalability evidence:** Performance scales with retriever backbone size (135M to 3B), LM backbone size (SmolLM2-135M to LLaMA-3.2-1B), and batch size — establishing Revela as a practically scalable paradigm.
- **Cross-domain generalization:** A model trained solely on code-related corpora matches its Wikipedia-trained counterpart on general-domain BEIR tasks.

---

## Method

### Training Objective

Classical NTP for a document $D_i = \{x_1^i, \ldots, x_L^i\}$ computes

$$P(x_l^i) = P_\Phi(x_l^i \mid x_{<l}^i). \tag{1}$$

Revela conditions this prediction on the other documents in the batch $\{D_j\}_{j \neq i}$:

$$P_R(x_l^i) = P_{\Phi,\Theta}(x_l^i \mid x_{<l}^i, \{D_j\}_{j \neq i}), \tag{2}$$

where $\Phi$ are LM parameters and $\Theta$ are retriever parameters. A single NTP loss back-propagates into both sets of parameters simultaneously.

### In-Batch Attention (Section 3.2)

Each transformer block is augmented with a parallel in-batch attention path. Let $[e_i^l; h_i^l]$ denote the outputs of the self-attention and in-batch attention modules at layer $l$ for document $D_i$.

**Standard self-attention** computes the familiar causal output $e_i^l$ from the per-sequence key/value matrices $Q_i^e, K_i^e, V_i^e$.

**In-batch attention cross-document component:** For document $D_i$, the cross-document attention to $D_j$ is

$$b_{ij}^l = \text{softmax}\!\left(\frac{Q_i^h (K_j^e)^\top}{\sqrt{d_H}}\right) V_j^e \tag{5}$$

using $D_i$'s query but $D_j$'s cached keys and values (full attention mask). These cross-document outputs are aggregated by the retriever-computed similarity:

$$b_i^l = \sum_{j=1, j \neq i}^B \text{Sim}(D_i, D_j)\, b_{ij}^l. \tag{6}$$

The combined in-batch output is

$$h_i^l = s_i^l + b_i^l, \tag{7}$$

where $s_i^l$ is the self-attention output from the in-batch path's prefix of $D_i$.

### Similarity Computation (Section 3.3)

The retriever $E_\Theta$ maps each document to an embedding $\mathbf{h}_i \in \mathbb{R}^{d_E}$, L2-normalizes it, then computes temperature-softmax cosine similarities:

$$\text{Sim}(D_i, D_j) = \frac{\exp(S_{ij}/\tau)}{\sum_{k \neq i} \exp(S_{ik}/\tau)}, \quad S_{ij} = \hat{\mathbf{h}}_i^\top \hat{\mathbf{h}}_j.$$

The temperature $\tau = 10^{-4}$ is kept fixed during training.

### Implementation (Section 3.4)

Revela is implemented by duplicating document inputs and adjusting the attention mask so that (a) the self-attention outputs $\{e_i^l\}$ capture per-sequence information and (b) the in-batch attention outputs $\{h_i^l\}$ are obtained by applying full attention over the self-attention outputs. LoRA (rank 256) is applied to both the LM and retriever. Training uses the WarmupDecayLR schedule, learning rate $10^{-4}$, 100 warmup steps, bf16 mixed precision. Passages are truncated at 160 tokens; inference truncation is 2048.

---

## Experimental Setup

**Benchmarks:**
- **CoIR** (Li et al., 2025): 10-task code retrieval benchmark.
- **BRIGHT** (Hongjin et al., 2025): 12-task reasoning-intensive retrieval.
- **BEIR** (Thakur et al., 2021): 13-task heterogeneous general retrieval.

**Training corpora:**
- CoIR training: StackOverflow posts, online tutorials, library documentation — chunked to 120 words, batch size 16, ~358K batches.
- BRIGHT/BEIR training: Wikipedia NQ corpus — chunks interleaved across documents, batch size 16, ~320K batches from 339K documents.

**LM backbone:** LLaMA-3.2-1B (primary). Also SmoLLM2-135M and Qwen2.5-0.5B for scaling experiments.

**Retriever backbones:** SmoLLM2-135M, Qwen2.5-0.5B, LLaMA-3.2-1B, LLaMA-3.2-3B.

**Key baselines:**
- *E5-PT* (Wang et al., 2022): weakly supervised contrastive pretraining on 1.3B raw pairs (filtered to 270M), covering Revela's training data. Trains on the same data Revela uses as a subset.
- *REPLUG* (Shi et al., 2024): frozen-LM perplexity distillation, decoder-only, same architectural family; LLaMA-3.2-1B frozen LM.
- *Contriever* (Izacard et al., 2022): unsupervised contrastive with ICT and independent cropping.
- *Supervised:* UniXcoder (code-specific fine-tuned), BGE-M3, E5-Mistral-7B-Instruct.
- *Commercial APIs:* OpenAI Ada-2, Voyage-2 (CoIR); OpenAI text-embedding-3-large, Cohere cohere-embed-english-v3.0, VoyageAI voyage-large-2-instruct (BRIGHT).

**Compute:** 4 × A100 80 GB GPUs, gradient accumulation step 8. Training time: ~44 h (Wikipedia), ~48 h (code).

---

## Results

### CoIR (Table 1, nDCG@10)

Without any query-document pairs, Revela$_{3B}$ achieves **mean nDCG@10 = 60.1** across 10 tasks, compared to:
- E5-Mistral-7B-Instruct (supervised, 7B params): 57.3
- Ada-2 (OpenAI API): 45.6
- Voyage-2 (Voyage API): 56.3
- REPLUG$_{3B}$: 53.9
- E5-PT$_{0.5B}$: 49.1

At 0.1B scale, Revela already outperforms UniXCoder (the supervised code-specific model) by 11.1 points on nDCG@10.

### BRIGHT (Figure 3, left)

Revela$_{3B}$ achieves **20.1 nDCG@10** (mean across 12 tasks), compared to:
- E5-Mistral (supervised 7B): 17.9
- Commercial APIs (Cohere, Voyage): 17.9
- REPLUG$_{3B}$: 13.3
- BM25: 12.2

Revela$_{0.5B}$ exceeds E5-PT by 3.1 points (23.7% relative), which is notable given E5-PT's potential overlap with BRIGHT's domain.

### BEIR (Figure 3, right)

Revela$_{3B}$ achieves **45.6 nDCG@10** with approximately 1000x less training data and 10x fewer compute hours than E5-PT, which scores 45.6 at the same metric. Revela$_{1B}$ surpasses Contriever and LaPraDoR by over 3 absolute points; margins over REPLUG are 8.9% (3B) and 7.0% (1B).

### Ablation and Analysis (Section 5)

- **Same backbone comparison** (Table 2): Revela$_{\text{wiki-1B}}$ scores BEIR 42.7 / CoIR 53.2 / AVG 48.0 vs. Contriever$_{\text{wiki-1B}}$ at 42.4 / 50.3 / 46.4. Out-of-distribution margin grows wider.
- **Batch size** (Figure 4): Performance scales monotonically with batch size on both CoIR and BEIR across all three retriever sizes.
- **LM size** (Figure 5): Larger LMs consistently improve CoIR performance; the benefit on BEIR is less consistent, suggesting LM capacity matters more for specialized domains.
- **Mixed-domain training:** Mixing Wikipedia with code corpora maintains or improves performance across diverse domains with only raw texts.
- **LM capacity preserved:** The co-trained LM retains its NTP ability, plausibly due to LoRA and retention of the NTP objective (Appendix C.6).

---

## Limitations & Caveats

- **Batch construction complexity:** Interleaving chunks from different documents into a single batch (as done for BRIGHT/BEIR) is a non-trivial implementation detail; the flexible batch construction is noted as a strength but adds engineering overhead.
- **Computational cost of in-batch attention:** The in-batch mechanism requires caching keys/values for all B documents in a batch, increasing memory usage at training time. Appendix C.7 discusses this efficiency gap vs. REPLUG, but in-batch attention still has quadratic cost in batch size.
- **Iterative indexing not yet explored:** Revela uses static chunking; on-the-fly iterative indexing (as in Atlas, REPLUG) could further improve performance but remains expensive.
- **Inference truncation at 2048 tokens:** Longer documents are truncated, which may hurt very long-form retrieval scenarios.
- **Evaluation limited to English text and code:** The paradigm's generalization to other languages or modalities (mentioned as future work) is unverified.
- **LM backbone generalization:** Most results use LLaMA-3.2-1B as the LM. Whether conclusions hold for other LM families at larger scales is not fully explored in the main paper.

---

## Why It Matters / Implications

**For RAG practitioners:** Revela removes the most expensive part of retriever training — annotation and hard-negative mining — without sacrificing (and often improving) retrieval quality. A 1B or 3B retriever trained on raw Wikipedia or StackOverflow dumps competes with or beats models trained on hundreds of millions of curated pairs. This is immediately useful for domain adaptation: drop in raw domain text, train Revela, deploy.

**For the architecture toolbox:** The in-batch attention mechanism is a clean, reusable primitive. Any setting where you have a batch of semantically related text sequences and want to model inter-sequence dependencies during training could benefit from this pattern.

**For scaling intuitions:** The three axes of scaling — retriever size, LM size, and batch size — all yield gains, but the shape of the benefit differs across tasks (LM size matters more for specialized domains). This is actionable guidance for practitioners choosing compute allocation.

**Efficiency story:** Matching E5-PT's BEIR score with 1000x less training data and 10x fewer GPU hours is a strong practical result, especially given that E5-PT's 1.3B-pair training corpus already covers Revela's entire training data.

---

## Related Work Context

| Prior work | How Revela differs |
|---|---|
| Contriever (Izacard et al., 2022) | Uses ICT/independent-cropping heuristics that introduce structural bias; Revela uses NTP, no heuristics |
| E5 / E5-PT (Wang et al., 2022) | Requires massive curated pair datasets (1.3B → 270M); Revela trains on raw text only |
| REPLUG (Shi et al., 2024) | Frozen LM perplexity as distillation signal; poorly calibrated (Geng et al., 2024); Revela jointly updates both |
| Atlas (Izacard et al., 2023) | Encoder-decoder; cross-attention scores as retrieval signal; requires periodic reindexing; Revela is decoder-only with static chunking |
| RetroMAE (Xiao et al., 2022) | Autoencoding lacks pairwise supervision; can overfit to low-level details |
| LaPraDoR (Xu et al., 2022) | Distillation from BM25 + LM; Revela avoids any pre-existing retrieval signal |

The conceptual lineage runs from Contriever (unsupervised contrastive) through REPLUG (LM-signal distillation) to Revela (joint LM-retriever NTP). Revela's key departure is making the retriever a first-class participant in language modeling rather than a downstream consumer of LM signals.

---

## Notes on Rafael's Journal

Rafael's notes (journal entry "4. Revela") capture the framework accurately: batch of raw chunks → retriever similarity → reweights cross-chunk attention inside LM → single NTP loss back-propagates into both. His characterization "this architecture is game changing, does much better that all of the providers" is consistent with Table 1 results (Revela$_{3B}$ mean 60.1 vs. Ada-2 45.6, Voyage-2 56.3 on CoIR). No factual discrepancies identified.
