# WSM: Decay-Free Learning Rate Schedule via Checkpoint Merging for LLM Pre-training

**Authors:** Changxin Tian, Jiapeng Wang, Qian Zhao, Kunlong Chen, Jia Liu, Ziqi Liu, Jiaxin Mao, Wayne Xin Zhao, Zhiqiang Zhang, Jun Zhou
**Venue / Year:** ICLR 2026 (Oral)
**Source:** https://arxiv.org/abs/2507.17634
**OpenReview:** https://openreview.net/forum?id=HhThhjKyfw
**Local copy:** papers/wsm-decay-free-lr.pdf (not downloaded)

---

## TL;DR

WSM (Warmup-Stable and Merge) eliminates the learning rate decay phase entirely by replacing it with principled checkpoint merging. The authors prove that averaging checkpoints from a constant-LR run is mathematically equivalent to applying a decay schedule, and show that this formulation consistently outperforms Warmup-Stable-Decay (WSD), with gains of +3.5% on MATH, +2.9% on HumanEval, and +5.5% on MMLU-Pro.

---

## Problem & Motivation

Standard LR schedules for LLM pre-training — cosine decay, linear decay — require knowing the total training duration upfront. The Warmup-Stable-Decay (WSD) scheduler improved flexibility by separating the decay phase from the stable phase, but it still forces practitioners to decide three things in advance: when to begin decay, how long to decay for, and which decay curve to use. These are non-trivial choices that typically require re-running training from scratch to explore.

WSM poses the question: can we eliminate the decay phase entirely while maintaining its optimization benefits, and without committing to a schedule ahead of time?

---

## Key Contributions

- **Theorem 3.1 (inverse mapping):** Given any set of desired, monotonically-decreasing gradient decay coefficients $\{w_i\}$ (as produced by cosine, linear, inverse-sqrt, etc.), there exist unique checkpoint merge weights $\{c_j\}$ that reproduce the same effective gradient weighting. This provides a principled translation from any decay strategy to a merging recipe.
- **Empirical demonstration** that merge duration (the training window covered by merged checkpoints) is the dominant hyperparameter — more important than checkpoint interval or the number of checkpoints.
- **WSM framework** that enables fully autonomous, continuous pre-training at constant LR, with asynchronous offline merging.
- Evidence that merging and decay are **not complementary**: combining them (merge-then-decay or decay-then-merge) yields no improvement over either alone, because they solve the same underlying optimization problem.
- Improved MoE load balancing as a side effect of constant-LR training (lower mean global max/min expert utilization violations than WSD).

---

## Method

### Algorithm

WSM operates in two phases:

1. **Warmup:** LR increases linearly from near-zero to $\eta_\text{peak}$ over $T_\text{warmup}$ steps.
2. **Stable phase:** LR is held constant at $\eta_\text{peak}$ indefinitely. Checkpoints are saved at regular intervals and merged asynchronously.

The LR schedule is:

$$\eta(t) = \begin{cases} \eta_\text{peak} \cdot \frac{t}{T_\text{warmup}} & t < T_\text{warmup} \\ \eta_\text{peak} & t \geq T_\text{warmup} \end{cases}$$

### Theoretical connection to LR decay

Each checkpoint can be written as the initial state plus accumulated gradient updates:

$$\theta_{n+k} = \theta_n - \eta \sum_{i=1}^{k} g_{n+i-1}$$

A weighted average of checkpoints $\{\theta_n, \ldots, \theta_{n+k}\}$ with weights $\{c_j\}$ produces:

$$\hat{\theta}_{n+k} = \theta_n - \sum_{i=1}^{k} w_i \cdot g_{n+i-1}, \quad w_i = \sum_{j=i}^{k} c_j$$

The $w_i$ are effective per-gradient decay coefficients. **Theorem 3.1** gives the inverse: for any target monotonically-decreasing $\{w_i\}$ with $w_i \in [0, 1]$, the merge weights are uniquely:

$$c_k = w_k, \quad c_j = w_j - w_{j+1}\ \text{for}\ j \in [1, k-1], \quad c_0 = 1 - w_1$$

This lets practitioners specify a target decay curve and derive the corresponding merge weights — or vice versa.

### Key design factors (ablations)

| Factor | Finding |
|--------|---------|
| Merge duration | Dominant factor; larger window → better, with diminishing returns |
| Checkpoint interval | Finer granularity helps moderately (5B > 10B > 20B > 40B > 80B token intervals at fixed 80B window) |
| Number of checkpoints | $n=4$ effective within an 80B-token window is a good operating point |
| Merge algorithm | Mean averaging (≈linear decay) beats EMA; theoretically-derived 1-sqrt weights are marginally better still |

The paper tests three merge algorithms: EMA (worst), mean/uniform (equivalent to linear decay), and theoretically-derived $1-\sqrt{\cdot}$ weights (best, equivalent to cosine-like decay).

---

## Experimental Setup

**Architecture:** MoE with 20 layers, hidden dim 2048, 256 experts per MoE layer, 8 activated per token (top-8), GQA attention, RoPE for 8K context. 16.3B total parameters, 1.43B active.

**Optimizer:** AdamW ($\beta_1=0.9$, $\beta_2=0.95$, weight decay $0.1$), peak LR $4.78 \times 10^{-4}$, batch size 2048 sequences (16M tokens per step), gradient clipping at norm 1.0.

**Data:** Multilingual corpus of 10.2T tokens (English, Chinese, web text, math, code, literature). Experiments continue training for 400B additional tokens using high-quality annealing data.

**Baselines:** WSD (Warmup-Stable-Decay) with 1-sqrt decay curve, as representative of state-of-the-art flexible scheduling.

**Evaluation — base model:** 20+ benchmarks across five categories: General Knowledge (ARC, AGIEval, PIQA, HellaSwag, BBH), Language Understanding (RACE, SQuAD 2.0, TriviaQA, NQ), Professional Knowledge (MMLU, CMMLU, C-Eval, MMLU-Pro, GPQA), Mathematics (GSM8K, MATH, Gaokao, GSM-Plus), Code (HumanEval, LiveCodeBench, MBPP).

**Evaluation — instruction-tuned model:** SFT applied to the base model; evaluated on language, knowledge, math, code, reasoning, and agent tasks.

---

## Results

### Base model (Table 1 / Figure 3) — best checkpoint comparison

| Category | WSD | WSM (Mean avg) | Delta |
|----------|-----|----------------|-------|
| General Knowledge | 69.06 | 70.22 | +1.68% |
| Language Modeling | 67.78 | 68.67 | +1.31% |
| Mathematics | 57.49 | 58.81 | +2.30% |
| Code | 64.88 | 65.58 | +1.08% |
| Professional Knowledge | 53.46 | 56.04 | +4.83% |
| **Overall average** | **62.67** | **63.95** | **+2.04%** |

Headline improvements on specific benchmarks: **+3.5% on MATH**, **+2.9% on HumanEval**, **+5.5% on MMLU-Pro**.

### Instruction-tuned model (Table 2)

WSM advantages persist through SFT: +4.51% on Language, +2.74% on Reasoning, +2.88% on Knowledge. Code shows a negligible −0.48% regression.

### Merge granularity ablation (Table 4, 80B-token merge window)

| Save interval | # Checkpoints merged | Avg score |
|---------------|----------------------|-----------|
| 5B | 16 | 63.63 |
| 10B | 8 | **63.78** |
| 20B | 4 | 63.36 |
| 40B | 2 | 62.77 |
| 80B | 1 | 60.33 |

### MoE load balancing (Table 5)

At slightly higher language modeling loss, WSM achieves better expert utilization: mean global max violation drops from 0.601 (WSD) to 0.545, mean global min violation from 0.322 to 0.201.

---

## Limitations & Caveats

- **Storage overhead:** Offline merging requires retaining a window of checkpoints. Authors argue this is a minor fraction of a typical pre-training budget, but at 16.3B-parameter scale it is non-trivial.
- **Online merging approximation:** For extreme storage constraints, a sliding-window online variant is available, but it sacrifices the ability to retrospectively explore different annealing strategies.
- **Hybrid approaches fail:** The paper only tests combining merging with decay on a single architecture; it is possible that different architectures or training regimes could yield different interactions.
- **Single architecture:** All experiments use a MoE model at 1.43B active parameters. Generalization to dense models or different scales is asserted theoretically but not systematically validated at scale.
- **No comparison to cosine with re-starting:** The direct competitor for flexible long-run training (cosine with periodic restarts / SGDR) is not benchmarked.

---

## Why It Matters / Implications

For practitioners, WSM removes the need to decide on a decay schedule before training begins. The offline nature of the merging step means you can run a single constant-LR training job and then experiment post-hoc with different "effective decay profiles" simply by varying which checkpoints you average and with what weights. This is a significant operational improvement over WSD or cosine schedules that require restarting if you want to change the decay shape.

The theoretical equivalence result (Theorem 3.1) is also a useful conceptual bridge: it explains *why* model averaging at the end of training (a common practitioner trick) works — it is implicitly applying a decay schedule.

The improved MoE load balancing under constant LR is an interesting side result worth investigating further for very large MoE deployments where expert collapse is a concern.

---

## Related Work Context

- **WSD (MiniCPM, 2024):** The direct predecessor. WSM can be seen as "WSD without the D." WSM consistently beats WSD in experiments.
- **Li et al. (2025) — concurrent work:** Also proposes using checkpoint merging to eliminate decay, but without the formal theoretical connection via Theorem 3.1 and without demonstrating improvement over WSD (only matching it).
- **Model averaging / EMA in training:** Used in various contexts (Polyak averaging, SWA) but not previously formalized as an equivalent to LR decay in the LLM pre-training regime.
- **Cosine / linear / inv-sqrt decay:** All shown to be special cases of the WSM framework under different merge weight choices.
