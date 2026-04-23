# MemAgent: Reshaping Long-Context LLMs with Multi-Conv RL Based Memory

**Authors:** Hongli Yu, Tinghong Chen, Jiangtao Feng, Jiangjie Chen, Weinan Dai, Qiying Yu, Ya-Qin Zhang, Wei-Ying Ma, Jingjing Liu, Mingxuan Wang, Hao Zhou
**Affiliations:** ByteDance Seed; Institute for AI Industry Research (AIR), Tsinghua University; SIA-Lab of Tsinghua AIR and ByteDance Seed
**Venue / Year:** ICLR 2026 (Oral)
**arXiv:** 2507.02259v1
**Local copy:** `papers/memagent-long-context.pdf`

---

## TL;DR

MemAgent trains a standard decoder-only LLM to process arbitrarily long documents by maintaining a fixed-length text memory that is iteratively overwritten as the model reads document chunks sequentially. Because memory length never grows, inference cost is strictly $O(N)$ in document length. An RL training algorithm (Multi-Conv DAPO) provides the supervision signal: the model is rewarded for retaining answer-relevant facts and discarding distractors. A 7B model trained on 32K documents with an 8K context window extrapolates to 3.5M tokens with less than 5% performance loss, surpassing 32B long-context models.

---

## Problem & Motivation

Three standard approaches to long-context LLMs each carry structural limitations:

1. **Length extrapolation** (NTK, PI, YaRN, DCA): shifts positional embeddings to extend the nominal context window. Suffers from $O(N^2)$ attention complexity and performance degradation at very long sequences despite continued pre-training.
2. **Sparse / linear attention** (Longformer, Mamba, RWKV, Griffin): achieves $O(N)$ complexity but requires training from scratch, is harder to parallelize, and often underperforms dense attention at moderate lengths.
3. **Context compression** (prompt compression, external memory plugins): typically disrupts the generation pipeline, requires additional modules, and struggles with generalization at extrapolation time.

The paper identifies three simultaneous requirements for a practical long-context solution: (1) unlimited input length, (2) no performance cliff during extrapolation, and (3) linear compute cost. The authors argue that none of the existing approaches satisfies all three simultaneously, and that the key gap is the absence of a principled *learning signal* for what to keep in a compressed memory.

---

## Key Contributions

- **MemAgent workflow:** A two-module inference procedure (Context-Processing + Answer-Generation) that processes text as a stream of fixed-size chunks while maintaining a fixed-length text memory written and overwritten between chunks. No architecture changes to the base LLM.
- **Multi-Conv DAPO:** An extension of the DAPO RL algorithm that treats each chunk-reading pass as an independent conversation, handles multi-conversation rollout generation, and backpropagates outcome rewards through all preceding memory-update conversations.
- **Demonstrated extrapolation:** 7B and 14B models trained on 32K text generalize to 3.5M token documents with less than 5% accuracy loss on RULER-HotpotQA (Table 2, Figure 1).
- **Theoretical reframing (Section 3.4):** MemAgent is shown to implement a recurrent factorization of the autoregressive likelihood, turning the transformer into a recurrent network whose state size is user-controllable.

---

## Method

### Workflow Design (Section 3.1)

MemAgent decomposes a long document $\mathbf{x}_{1:N}$ into $K$ contiguous chunks $\mathbf{c}^1, \ldots, \mathbf{c}^K$ (each of length $\leq C$ tokens). A fixed-length memory token sequence $\mathbf{m}^k \in \mathbb{V}^M$ is maintained throughout.

**Context-Processing module:** For each chunk $k$, the model receives the triple (problem statement, current memory $\mathbf{m}^{k-1}$, chunk $\mathbf{c}^k$) and generates an updated memory $\mathbf{m}^k$ (Table 1, top prompt template). This is an overwrite — the previous memory is fully replaced by the new one.

**Answer-Generation module:** After all chunks are processed, the model sees only (problem statement, final memory $\mathbf{m}^K$) and generates the boxed answer (Table 1, bottom prompt template).

The overwrite strategy is deliberately simple: because $|\mathbf{m}^k| = M$ is constant, each step processes a context of size $O(C + M)$, yielding strictly linear $O(N)$ end-to-end complexity. This is confirmed empirically in Appendix A (Figure 7), which shows MemAgent's FLOP curve remaining flat while the baseline's grows quadratically past 256K tokens.

In the paper's specific implementation: $M = 1024$ tokens (memory), $C = 5000$ tokens per chunk, query allocation = 1024 tokens, output = 1024 tokens, fitting within an 8K context window. A typical 32K document requires 5–7 conversational turns.

**Autoregressive factorization (Section 3.4):** The joint likelihood decomposes as:

$$p(\mathbf{x}_{1:N}) = \sum_{\mathbf{m}^{1:K-1}} \prod_{k=1}^{K} \underbrace{p(\mathbf{c}^k \mid \mathbf{m}^{k-1})}_{\text{read}} \underbrace{p(\mathbf{m}^k \mid \mathbf{c}^k, \mathbf{m}^{k-1})}_{\text{write}}$$

This is precisely the factorization of a recurrent network, where $\mathbf{m}^k$ is the hidden state. The state size $M$ is a user-controlled hyperparameter, making MemAgent architecturally equivalent to a recurrent model built from a standard dense-attention transformer.

### Training Algorithm: Multi-Conv DAPO (Section 3.2 and Appendix A)

Standard GRPO/DAPO cannot be applied directly because MemAgent generates multiple independent conversations per sample (one per chunk) rather than a single output sequence. The policy optimization objective must be extended.

**Standard GRPO** for a single conversation:

$$\hat{A}_{i,t} = \frac{r_i - \text{mean}(\{R_i\}_{i=1}^G)}{\text{std}(\{R_i\}_{i=1}^G)}$$

**Multi-Conv DAPO** extends advantage computation to the (group, conversation, token) structure. For group $i$, conversation $j$, token $t$:

$$\hat{A}_{i,j,t} = r_i - \text{mean}(\{R_i\}_{i=1}^G)$$

where $r_i$ is the outcome reward from the final answer conversation. The reward is distributed uniformly across all conversations originating from the same sample. Following DrGRPO, advantage is not normalized by standard deviation.

The Multi-Conv DAPO loss (Equation 5):

$$\mathcal{J}_{\text{DAPO}}(\theta) = \mathbb{E}_{(q,a) \sim \mathcal{D}} \left[ \frac{1}{\sum_i^G \sum_j^{n_i} |o_{i,j}|} \sum_{i=1}^G \sum_{j=1}^{n_i} \sum_{t=1}^{|o_{i,j}|} \left( \mathcal{C}_{i,j,t} - \beta D_{\text{KL}}(\pi_\theta || \pi_{\text{ref}}) \right) \right]$$

where $\mathcal{C}_{i,j,t} = \min(r_{i,j,t}(\theta) \hat{A}_{i,j,t}, \text{clip}(r_{i,j,t}(\theta), 1-\varepsilon_{\text{low}}, 1+\varepsilon_{\text{high}}) \hat{A}_{i,j,t})$.

### Reward Modeling (Section 3.3)

For single-answer tasks (most QA), the reward function is:

$$R(\hat{y}, Y) = \max_{y \in Y} \mathbb{I}(\text{is\_equiv}(y, \hat{y}))$$

For multi-value extraction tasks (e.g., Multi-Value Needle in a Haystack), the reward is recall-based:

$$R(\hat{y}, Y) = \frac{|y \in Y \mid \mathbb{I}(y \in \hat{y})|}{|Y|}$$

Crucially, rewards are computed only from the final Answer-Generation conversation; no intermediate rewards are assigned to memory-update conversations.

---

## Experimental Setup

**Base models:** Qwen2.5-7B-Instruct and Qwen2.5-14B-Instruct.

**Training data:** 32,768 samples from HotpotQA training split, synthesized using RULER's Needle-in-a-Haystack methodology; documents ~28K tokens. Samples where Qwen2.5-7B/14B-Base achieves 100% Best-of-2 without context (pure memorization) are filtered out (~50% removal).

**Context window during training:** 8K tokens (query 1024 + chunk 5000 + memory 1024 + output 1024).

**Baselines:** QwenLong-L1-32B, Qwen2.5-Instruct-14B-1M, Qwen2.5-Instruct-7B-1M (using DCA extrapolation to 1M), DeepSeek-R1-Distill-Qwen-32B/14B/7B (context set to 128K).

**Evaluation:** RULER benchmark (10 synthetic tasks including NIAH variants, Variable Tracking, Frequent Words Extraction) and RULER-QA from SQuAD; context lengths from 7K to 3.5M tokens. In-domain test set uses 128 HotpotQA validation samples at 7K, 14K, and up to 3.5M token contexts.

**Hyperparameters:** GRPO algorithm; KL factor 1e-3; entropy loss disabled; AdamW with lr=1e-6 and linear warmup; rollout batch size 128 (7B) / 256 (14B); group size 16; sample-to-backprop batch ratio 16.

---

## Results

**Main results (Table 2):** Across context lengths 7K–896K on RULER-HotpotQA:

- **RL-MemAgent-14B** scores: 83.59, 82.03, 84.38, 80.47, 76.56, 81.25, 75.00, 77.34, 76.56, 78.12 (7K through 3.5M). Performance at 3.5M (78.12) is within ~5% of the 7K score (83.59), demonstrating near-lossless extrapolation.
- **RL-MemAgent-7B** scores similarly: from 82.03 at 7K to 71.09 at 3.5M.
- **QwenLong-L1-32B** (largest baseline): 72.66 at 7K, drops to 11.72 at 896K — a 60+ point collapse before even reaching 1M tokens.
- **Qwen2.5-Instruct-7B-1M:** starts at 61.72, degrades to 0.00 at 896K.
- **DS-Distill-Qwen-7B:** 30.47 at 7K, 0.00 at 224K.

**MemAgent-7B outperforms all non-RL baselines including the 32B model from 112K tokens onward** (Table 2).

**Ablation — RL vs. no RL (Figure 5):** Memory-equipped models without RL training improve over truncation but still degrade after 112K. RL training is essential: RL-MemAgent-14B maintains ~80% accuracy at 896K while the corresponding no-RL variant drops to ~48%.

**OOD generalization (Figure 6, Appendix B):** RL-MemAgent-14B achieves >95% average accuracy on the 10 RULER tasks for context lengths 8K–512K. On SQuAD-based QA (Figure 6b), the 14B model maintains 77–79% accuracy from 8K to 256K, well above all baselines. Variable Tracking and Frequent Words Extraction show similar dominance (Figures 10–11).

**Compute efficiency (Appendix A, Figure 7):** MemAgent FLOPs grow linearly with context length at roughly $10^{14}$ operations, vs. the standard model's $O(N^2)$ curve that crosses $2 \times 10^{19}$ at 4M tokens — five orders of magnitude difference.

---

## Limitations & Caveats

- **Fixed memory size is a design choice with task-sensitivity.** The paper uses 1024 tokens; tasks requiring dense aggregation of many facts over 3.5M tokens may lose information that a larger memory could preserve. No ablation over memory size $M$ is reported in the main paper.
- **Training data is HotpotQA-only.** Generalization to very different task types (code, mathematical reasoning, narrative comprehension) is demonstrated through RULER OOD results but not tested on production benchmarks like SCROLLS or LongBench.
- **Evaluation does not include open-ended generation tasks.** All reported metrics are QA accuracy or exact-match variants. Long-document summarization or instruction-following degradation is not measured.
- **The reward signal requires verifiable ground truths.** The RLVR recipe (rule-based reward) constrains applicability to tasks with checkable answers. Subjective tasks would require a learned reward model, with associated reliability risks.
- **No comparison to RAG.** Retrieval-Augmented Generation is a common engineering solution for long-context QA that would be a natural baseline; the paper does not include it.

---

## Why It Matters / Implications

MemAgent provides a compelling existence proof that a standard dense-attention transformer, trained on short contexts, can be taught to handle arbitrarily long documents through RL-supervised memory management — without any architectural changes or continued pre-training on long data.

For practitioners:
- The method is compatible with any instruction-tuned model that can follow the memory-update prompt format.
- Training on 32K documents with an 8K context is computationally tractable on modest GPU clusters (8 × H100 or equivalent for the 7B model).
- The linear compute advantage becomes practically significant above ~128K tokens, where standard attention costs become prohibitive.
- The human-readable token-space memory (as opposed to hidden-state compression) allows inspection, debugging, and even manual editing of intermediate states — a significant transparency benefit for agentic systems.
- The 14B MemAgent outperforming a 32B long-context model from 112K tokens onward suggests that RL-shaped memory is a more sample-efficient path to long-context capability than pure scale or positional extrapolation.

---

## Related Work Context

- **Length extrapolation (NTK, PI, YaRN):** Extend positional encodings but do not address the quadratic attention cost or the degradation at extreme lengths. MemAgent sidesteps both.
- **Linear/recurrent models (Mamba, RWKV, Griffin, Mamba-2):** Achieve $O(N)$ complexity but require training from scratch and sacrifice the dense-attention quality that transformers provide at moderate lengths. MemAgent converts a dense-attention transformer into a recurrent network without retraining from scratch.
- **Retrieval-Augmented Generation:** Addresses long contexts via external retrieval, but requires a separate retrieval index and does not perform end-to-end reasoning over the full document.
- **Memory-augmented transformers (Titans, Memformer, RMT):** Add external memory modules, typically requiring architectural modifications. MemAgent achieves memory behavior purely through in-weights RL without changing the architecture.
- **Multi-turn RL for agents (Search-R1, Agent-R1, RAGEN):** Train agents to use tools across turns via RL. These interleave tool calls and model responses in a single conversation with causal attention masks. MemAgent's multi-conversation formulation (independent context windows per chunk) is architecturally distinct and specifically designed for the memory-update problem.
- **GiGPO:** Explores multiple independent contexts in agent training with environment feedback and a sliding window approach; MemAgent extends this to the memory update setting.
