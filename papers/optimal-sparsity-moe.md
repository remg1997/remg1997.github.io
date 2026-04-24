# Optimal Sparsity of Mixture-of-Experts Language Models for Reasoning Tasks

**Authors:** Taishi Nakamura, Satoki Ishikawa, Masaki Kawamura, Takumi Okamoto, Daisuke Nohara, Jun Suzuki, Rio Yokota
**Venue / Year:** ICLR 2026 (Oral); also presented at the AI for Math Workshop at ICML 2025
**Source:** https://arxiv.org/abs/2508.18672
**OpenReview:** https://openreview.net/forum?id=XFw2EPRUUR
**Code:** https://github.com/rioyokotalab/optimal-sparsity
**Local copy:** papers/optimal-sparsity-moe.pdf (not downloaded)

---

## TL;DR

MoE sparsity that minimizes pre-training loss is not the same as the sparsity that maximizes reasoning ability. This paper disentangles the two by training dozens of MoE families under fixed compute budgets, revealing an inverted-U relationship between sparsity and reasoning performance, an active-FLOPs requirement for reasoning that memorization does not share, and a tokens-per-parameter (TPP) optimum for reasoning near the Chinchilla point. Neither test-time compute scaling nor GRPO post-training eliminates these pre-training sparsity effects.

---

## Problem & Motivation

MoE models (e.g., Mixtral, Qwen-MoE, DeepSeek-MoE) achieve a larger total parameter count at a given FLOPs budget by routing each token to only $k$ of $E$ experts. This introduces *sparsity* $s = 1 - k/E$ as a free design axis orthogonal to model width, depth, and training tokens. Prior work has studied optimal sparsity using pre-training loss as the target metric, following Chinchilla-style scaling laws. The problem: **pre-training cross-entropy loss is not a reliable proxy for downstream reasoning accuracy.** A model can have lower validation loss than a competitor while being worse at GSM8K or HumanEval.

The key open question is therefore: under a fixed compute budget, what sparsity optimizes reasoning performance, and why does it differ from the loss-optimal sparsity?

---

## Key Contributions

- First systematic analysis of MoE sparsity specifically for reasoning tasks under fixed compute, separating it from memorization/recall tasks.
- Demonstration that the pre-training loss vs. reasoning accuracy relationship is **non-monotonic** (inverted-U), while the loss vs. memorization accuracy relationship is monotonic.
- Identification that **active FLOPs** (inference-time compute), not total parameters or pre-training loss, is the decisive factor for reasoning quality at iso-loss.
- Discovery that reasoning is **data-hungry** (benefits from high tokens-per-parameter, TPP ≈ 20), while memorization is **parameter-hungry** (benefits from low TPP, i.e., more parameters per token).
- Evidence that test-time compute (self-consistency with up to $2^7 = 128$ samples) and GRPO post-training **preserve** the sparsity ranking — they improve absolute scores but do not close the gap between optimal and sub-optimal sparsity configurations.

---

## Method

### MoE Architecture

Mixtral-style architecture with 16 layers (32 in depth ablations). The key swept variables are:

- Model width $d \in \{512, 1024, 2048\}$
- Number of experts per layer $E \in \{8, 16, 32, 64, 128, 256\}$
- Top-$k$ routing $k \in \{2, 4, 8, 16\}$
- Sparsity defined as $s = 1 - k/E$

All models are trained on a **fixed 125B-token corpus** (purposely Chinchilla-optimal for the dense baseline at comparable active parameters), with AdamW, peak LR $4 \times 10^{-4}$.

### Training Data

| Subset | Tokens |
|--------|--------|
| High-quality web text | 43B |
| Mathematics corpora | 32B |
| STEM literature | 49B |
| Stack-Edu Python (code) | 1B |
| **Total** | **125B** |

The high mathematics share (25.6% of data) is deliberate — it ensures reasoning benchmarks have meaningful signal. The authors note this may affect the magnitude of findings but report that qualitative trends hold across data compositions.

### Evaluation

Task loss is computed as cross-entropy over answer tokens only (not the full sequence), following the methodology from loss-to-loss prediction literature. This makes the task loss metric comparable across model sizes without benchmark-specific accuracy thresholds.

| Task type | Benchmarks | Shots |
|-----------|-----------|-------|
| Math reasoning | GSM8K, GSM-Plus | 4–5 |
| Reading comprehension | TriviaQA | 4 |
| Commonsense | HellaSwag | 4 |
| Code | HumanEval, MBPP | 0 / 3 |

---

## Results

### Finding 1: Non-monotonic loss vs. reasoning accuracy

Pre-training validation loss decreases monotonically as total parameters increase (moving to lower sparsity or larger models). But downstream task loss for GSM8K and GSM-Plus first decreases, then *increases*, forming an inverted-U as a function of sparsity. Memorization tasks (TriviaQA, HellaSwag) exhibit the expected monotonic improvement with lower loss.

**Practical implication:** You cannot select MoE sparsity using validation loss alone if your target is reasoning. A model with lower perplexity may be a worse reasoner.

### Finding 2: Active FLOPs matter, not just total parameters

At identical training loss, models with a larger top-$k$ value (more active experts per token, lower sparsity) consistently score higher on reasoning tasks. This is an iso-loss comparison — the memorization advantage of having more total parameters does not help reasoning if those parameters are not activated at inference time.

GSM8K examples from the paper: models with $E=8$, top-$k=2$ reach ~70–75% accuracy; equivalent-loss models with $E=32$, top-$k=2$ (higher sparsity) drop to ~60–65%, despite having a lower pre-training loss.

### Finding 3: Tokens-per-parameter optimality is task-dependent

Under the Chinchilla framework, ~20 tokens per (active) parameter is optimal for dense models. This paper shows that this optimum is **task-dependent** in MoE settings:

- **Memorization tasks:** Performance improves monotonically as TPP decreases (more parameters relative to tokens) — adding parameters always helps recall.
- **Reasoning tasks:** Performance peaks near TPP ≈ 20 and degrades when TPP is either too low (over-parameterized relative to data) or too high (data-starved). This makes reasoning fundamentally different: it needs enough data per parameter to generalize, not just to memorize.

### Finding 4: Test-time compute and GRPO do not close the gap

Self-consistency decoding (up to 128 samples at temperatures 0.6–1.0) improves absolute GSM8K accuracy for all models, but sparser models do not catch up to denser ones through TTC alone. The relative ranking is preserved.

GRPO post-training (15 epochs, $10^5$ steps, actor LR $5 \times 10^{-6}$, trained on GSM8K training set, batch 1024) similarly improves all models but does not alter the sparsity ranking. The same pattern holds on MATH 500.

**Implication:** The sparsity configuration locked in during pre-training is not recoverable through post-training methods at the compute scales studied.

### Finding 5: Iso-FLOP analysis

Under a fixed active parameter (FLOP) budget, the optimal sparsity depends on the active compute level:

- At **low active parameter budgets:** Increasing sparsity (more experts, lower top-$k$) improves all tasks.
- At **high active parameter budgets:** Reasoning tasks shift their optimum toward denser configurations. The benefit of adding experts reverses once active compute is sufficient.

This compute-dependent reversal contradicts the monotonic "more experts = better" assumption.

### Coding tasks

HumanEval and MBPP show the same non-monotonic density-performance relationship as mathematical reasoning, in experiments trained on 95B Stack-Edu Python + 30B DCLM-dedup tokens. This suggests the finding generalizes beyond math to structured reasoning tasks more broadly.

---

## Limitations & Caveats

- **Fixed token budget (125B):** Training longer might shift the optimal sparsity for reasoning toward sparser configurations. The authors acknowledge this and note the finding may be scale-dependent on training data.
- **Architecture specificity:** Uses a Mixtral-style architecture. Production MoE models (Qwen3, DeepSeek-V3) use additional techniques (QK-norm, shared experts, fine-grained experts) that are not studied here.
- **High mathematics data fraction:** 32B/125B = 25.6% mathematics content in pre-training. Different corpus compositions might shift the absolute magnitude of findings.
- **Learning rate sensitivity:** Ablations show reasoning performance is more sensitive to LR and weight initialization than memorization performance. The Fisher information analysis (K-FAC) suggests flatter minima correlate with worse reasoning transfer — an interesting but unexplained finding.
- **No checkpoints released** due to file size; code and logs are available.

---

## Why It Matters / Implications

For practitioners designing MoE architectures for reasoning-focused tasks (code generation, math, multi-step problem solving):

1. **Don't minimize loss; minimize reasoning task loss.** Optimizing for validation perplexity may steer you toward sparsity levels that are sub-optimal for the actual use case.
2. **Active FLOPs are load-bearing.** When a reasoning task fails at inference time, increasing top-$k$ (reducing sparsity) may help more than adding more experts.
3. **TPP ≈ 20 is a useful target for reasoning.** Unlike memorization tasks where you want as many parameters as possible, reasoning tasks have a data-coverage requirement per parameter.
4. **Post-training is not a fix.** GRPO and self-consistency help, but the sparsity choice during pre-training sets a ceiling that post-training cannot raise, at least at the compute scales tested.

---

## Related Work Context

- **Chinchilla (Hoffmann et al., 2022):** Established optimal tokens-per-parameter for dense models at ~20:1. This paper shows the concept applies differently for memorization vs. reasoning in MoE models.
- **Mixtral (Jiang et al., 2024):** Architecture this paper's experiments are based on. Mixtral itself uses $E=8$, top-$k=2$ (sparsity 0.75).
- **DeepSeek-MoE / Qwen-MoE:** Represent production MoE systems the paper's findings could inform, though they use architectural features not studied here.
- **Loss-to-loss prediction (Ye et al., 2024):** Prior work that used task loss (not accuracy) as a proxy metric — a methodology this paper adopts and extends.
- **Scaling laws for MoE (Clark et al., 2022; Artetxe et al., 2021):** Prior analyses used pre-training loss as the target; this paper's contribution is specifically the task-type decomposition.
