# How Reliable is Language Model Micro-Benchmarking?

**Authors:** Gregory Yauney, Shahzaib Saqib Warraich, Swabha Swayamditta
**Venue / Year:** ICLR 2026 (Oral) / 2025–2026
**Source:** https://arxiv.org/abs/2510.08730
**Local copy:** papers/llm-microbenchmarking-reliability.pdf (not downloaded — HTML version read at https://arxiv.org/html/2510.08730v1)

---

## TL;DR

Micro-benchmarking — evaluating LLMs on small subsets of full benchmarks to save compute — is widely used but poorly understood in terms of reliability for model *ranking*, not just score estimation. This paper introduces MDAD (Minimum Detectable Accuracy Difference), a metric measuring the smallest performance gap between two models that a micro-benchmark can reliably distinguish (at 80% agreement) with the full benchmark. The key finding: no method can consistently distinguish models within 3.5 points on MMLU-Pro or 4 points on BIG-Bench Hard at small sizes; Anchor Points is best at small budgets; and random sampling becomes competitive at ≥250 examples. Prior work recommending as few as 10 examples is shown to be misleading.

---

## Problem & Motivation

Micro-benchmarking is appealing: evaluating a model on 10 examples instead of 10,000 is 1000× cheaper. Multiple methods have been proposed — random sampling, Item Response Theory (tinyBenchmarks), clustering-based anchor selection (Anchor Points), diversity sampling — and prior work has evaluated them primarily with two metrics:

1. **Mean estimation error**: average absolute error in predicted score for individual models.
2. **Rank correlation** (Kendall's $\tau$, Spearman's $\rho$): aggregate ordering fidelity across all model pairs.

The paper argues both metrics are **insufficient** for practical model comparison:

- Mean estimation error per model does not capture whether consistent overestimation (all models scored higher) produces wrong pairwise rankings.
- Rank correlation averages over all model pairs — a method that perfectly ranks well-separated models but fails on close ones scores highly despite being practically useless for distinguishing frontier models that differ by 1–3 points.

The motivating insight: **model pair difficulty is not uniform**. If Model A outperforms Model B by 20 points, any micro-benchmark will rank them correctly. If the gap is 2 points, the task requires near-perfect subset selection. A useful reliability metric should decompose reliability as a function of the performance gap.

---

## Key Contributions

1. **MDAD metric**: a novel meta-evaluation measure for micro-benchmarks that answers "for which model pairs does this micro-benchmark agree with the full benchmark at least 80% of the time?"
2. **Systematic comparison** of five micro-benchmarking strategies across four major benchmarks (MMLU, MMLU-Pro, BIG-Bench Hard, GPQA) with hundreds of models.
3. **Practical recommendations** grounded in MDAD rather than aggregate correlation: minimum 100–250 examples; Anchor Points preferred at small budgets; random sampling sufficient beyond 250.
4. **Demonstration that tinyBenchmarks' apparent strength under rank correlation is illusory under MDAD**: strong $\tau$ can coexist with very high MDAD (inability to distinguish model pairs within 150 accuracy points on MMLU under 10-example tinyBenchmarks).

---

## Method

### MDAD Definition

Given a full benchmark $\mathcal{B}$ with $N$ examples and a micro-benchmark $\mathcal{M}$ with $n \ll N$ examples, define:

$$\text{Agreement}(\delta) = \Pr\left[\text{rank}_{\mathcal{M}}(A, B) = \text{rank}_{\mathcal{B}}(A, B) \mid |\text{acc}_{\mathcal{B}}(A) - \text{acc}_{\mathcal{B}}(B)| \in [\delta - \epsilon, \delta + \epsilon]\right]$$

where the probability is over random model pairs $(A, B)$ drawn from the model pool whose full-benchmark accuracy difference falls in the bucket around $\delta$, with bucket resolution $\epsilon = 0.25$ points.

MDAD is then:

$$\text{MDAD} = \min \left\{ \delta : \text{Agreement}(\delta') \geq 0.80 \text{ for all } \delta' \geq \delta \right\}$$

Lower MDAD = more reliable micro-benchmark (can distinguish closer model pairs).

**Operationally**: 50 random train/test model splits; for each split, select a micro-benchmark on source models (300 of ~400 total), evaluate on target models (50 held-out); bucket pairwise accuracy differences at 0.5-point intervals; compute agreement per bucket; report MDAD as the minimum bucket centroid at which agreement exceeds 80%.

### Micro-Benchmarking Methods Evaluated

| Method | Description |
|--------|-------------|
| **Anchor Points** | Selects k-medoid cluster centers from examples grouped by cross-model prediction correlation |
| **tinyBenchmarks** | Uses Item Response Theory (IRT) embeddings, then clusters; designed to maximize score estimation accuracy |
| **Stratified by Confidence** | Clusters examples by average model confidence; samples proportionally |
| **Diversity** | Negatively-dependent sampling across example embedding space |
| **Uniform Random** | Independent random sampling; primary baseline |
| **Subtask-Stratified Random** | Samples equal numbers from each predefined subtask (e.g., MMLU subjects) |

---

## Experimental Setup

**Benchmarks**:
| Benchmark | Subtasks | Examples | Models |
|-----------|----------|----------|--------|
| MMLU | 47 | 10,631 | 366 |
| MMLU-Pro | 14 | 12,032 | 447 |
| BIG-Bench Hard (BBH) | 24 | 5,761 | 409 |
| GPQA | — | 448 | 420 |

**Model pool**: 300 source / 50 target split; models span 0.5B to 141B parameters (101 models at 0.5–3B; 39 at 70B+).

**Micro-benchmark sizes tested**: $n \in \{10, 25, 50, 100, 250, 500, 1000\}$ (GPQA: up to 200 due to dataset size).

**Data splitting**: each benchmark split 50/50; selection runs on the first half, generalization evaluated on the second half.

---

## Results

### MDAD at 10 Examples (Extreme Budget)

| Benchmark | Anchor Points | tinyBenchmarks | Uniform Random |
|-----------|:------------:|:--------------:|:--------------:|
| MMLU | 6.2 | 150.9 | 20.0 |
| MMLU-Pro | 7.7 | 164.5 | 20.0 |
| BBH | 6.0 | 58.9 | 15.0 |
| GPQA | 1.1 | 7.5 | 8.0 |

tinyBenchmarks has dramatically higher MDAD than random sampling at 10 examples despite competitive rank correlation ($\tau = 0.73$ for both tinyBenchmarks and random on MMLU-Pro at n=10). This is the key methodological lesson: $\tau$ can appear identical while MDAD differs by orders of magnitude.

Anchor Points is the clear winner at small budgets (MDAD ≈ 6–8 on most benchmarks), though even it cannot distinguish models within ~7 points on MMLU-Pro with only 10 examples.

### Competitive Threshold: ~250 Examples

At $n = 250$, all methods achieve MDAD $\leq 2.0$ points across benchmarks, including uniform random sampling. The specialized methods provide their largest advantage at $n \in \{10, 25, 50\}$; beyond 250, the benefit over random narrows to statistical noise.

### Practical Implication: State-of-the-Art Model Comparison

Contemporary frontier models (8B instruction-tuned) on MMLU-Pro have accuracy in the 27–40% range — a 13-point spread. 51% of pairwise comparisons among these models involve accuracy differences of ≤5 points. At $n = 25$, all methods have MDAD $\geq 5$, meaning they cannot reliably distinguish more than half of these comparisons. Even at $n = 1000$, MDAD ≈ 2 for most methods, still failing on the closest 21% of pairs.

### Generalization to Held-Out Examples

- Whole-benchmark selection generalizes well: MDAD on held-out set ≈ MDAD on training set.
- Subtask-stratified sampling shows 0.37–1.18 point MDAD increase on fresh draws.
- Anchor Points has the smallest generalization gap (0.37 increase at $n = 100$), suggesting its cluster-center examples are robustly representative.

### Effect of Source Model Count

Increasing source models from 10 to 300 improves MDAD, but improvement plateaus around 50 source models. Example count matters more than model pool diversity for achieving low MDAD.

---

## Limitations & Caveats

1. **Static benchmarks only**: the analysis covers standard multiple-choice and generation benchmarks; open-ended, agentic, or safety evaluations with softer metrics are not addressed.
2. **80% threshold is a choice**: the MDAD definition uses 80% agreement as the reliability threshold; the conclusions shift somewhat with different thresholds, though qualitative rankings of methods are stable.
3. **Model pool composition**: the 300 source models span a wide range; practitioners with narrowly-focused comparison populations (e.g., only 70B+ models) might see different results.
4. **IRT assumption in tinyBenchmarks**: IRT-based selection optimizes score estimation accuracy, not pairwise ranking reliability — MDAD is simply not what it was designed for. This is a mismatch of objective, not a flaw in tinyBenchmarks' design.
5. The paper does not evaluate task-specific micro-benchmarking (e.g., coding-only subsets) or dynamic/adaptive evaluation strategies.

---

## Why It Matters / Implications

The LLM evaluation ecosystem relies heavily on micro-benchmarks: researchers use small subsets to filter model variants during ablation studies, practitioners track model releases using single-digit example counts on leaderboards, and automated evaluation pipelines often run on budget-constrained sample sizes.

The practical guidance from this paper:
- **Do not use fewer than 100 examples for any reliability-sensitive comparison.** At 10 examples, even the best method (Anchor Points) cannot distinguish models within 6–8 points; random sampling cannot distinguish within 20 points.
- **At n ≥ 250, just use random sampling.** The computational overhead of Anchor Points, tinyBenchmarks, or diversity sampling is not justified.
- **If you must use n ≤ 25, use Anchor Points.** It provides the largest practical reliability improvement at extreme budget constraints.
- **Report MDAD alongside micro-benchmark results**, not just rank correlation or mean error. $\tau$ can look good while the micro-benchmark is practically useless for distinguishing frontier models.

For the blog audience specifically: anyone who has cited "tinyBenchmarks shows competitive rank correlation at 10 examples" as justification for tiny evaluation sets should revisit — the MDAD analysis shows this is misleading for close model comparisons.

---

## Related Work Context

- **tinyBenchmarks** (Polo et al., 2024): seminal paper proposing IRT-based micro-benchmark construction; optimizes score estimation, not pairwise ranking — this paper's MDAD reveals the gap.
- **Anchor Points** (Vivek et al., 2024): cluster-center selection method that turns out to perform best under MDAD; the paper provides a principled explanation for why (representative examples capture distributional variation).
- **BIG-bench, MMLU-Pro, GPQA**: standard evaluation benchmarks used as the full benchmark ground truth throughout.
- **Evaluation of evaluations** (meta-evaluation literature): this paper belongs to a growing line of work questioning whether benchmark methodology is itself reliable, alongside papers on benchmark saturation, contamination, and gaming.

---

## Notes on Rafael's Journal

Rafael's notes are correct and well-captured. A few clarifications for the blog post:

- He notes "80%" as the agreement threshold for MDAD — confirmed correct (the paper defines MDAD as the minimum gap achieving ≥80% agreement). Good to call out the threshold explicitly since it is a design choice.
- His characterization "previous experiments calculate mean estimation error for individual models, but that does not account for consistent overestimation across models" is the paper's precise critique — good to preserve this framing in the post.
- He spells out "Minimum Detectable Accuracy Difference (MDAD)" — note the paper title uses "Minimum Detectable Accuracy Difference" but the paper body abbreviates it as MDAD; the 80% threshold is part of the definition, not a separate parameter.
- Rafael's note "Select at least 100 examples. Anchor Points is best when size is small" — confirmed accurate per the paper's conclusions. The paper's full recommendation is: ≥100 examples minimum, use Anchor Points below 250, use random above 250.
- The title in Rafael's notes is "How reliable is LLM Microbenchmarking?" — the canonical title is "How Reliable is Language Model Micro-Benchmarking?" (hyphenated, "Language Model" not "LLM"). Minor difference, worth correcting in the blog post.
