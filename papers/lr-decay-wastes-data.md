# How Learning Rate Decay Wastes Your Best Data in Curriculum-Based LLM Pretraining

**Authors:** Kairong Luo, Zhenbo Sun, Haodong Wen, Xinyu Shi, Jiarui Cui, Chenyi Dang, Kaifeng Lyu, Wenguang Chen
**Venue / Year:** ICLR 2026 (Oral); arXiv preprint submitted November 24, 2025
**Source:** https://arxiv.org/abs/2511.18903
**OpenReview:** https://openreview.net/forum?id=T5wkZJqzkz
**Local copy:** papers/lr-decay-wastes-data.pdf (not downloaded)

---

## TL;DR

Data curriculum (sorting training examples by ascending quality) works well under a constant learning rate, but its gains largely vanish under standard LR decay schedules (WSD, cosine) because the high-quality data that arrives late in training receives the smallest learning rate. Two fixes — moderate LR decay and/or model averaging over final checkpoints — restore and amplify the curriculum gains, yielding up to +1.64% average benchmark improvement over random shuffling with standard decay.

---

## Problem & Motivation

High-quality data is scarce in LLM pre-training. *Data curriculum* — presenting data in ascending order of quality score during training — is a natural strategy to get the most out of scarce good data. Yet prior work has reported weak or even negative gains from curriculum learning.

The paper's central question: is the failure due to bad quality scores, or is the curriculum method itself fundamentally broken when combined with standard LR schedules?

The answer is the latter. Standard LR decay schedules (WSD, cosine) apply the largest LR updates to the early, low-quality data and the smallest updates to the late, high-quality data. The schedule directly inverts the intent of the curriculum: it gives the most learning capacity to the data you trust least.

---

## Key Contributions

- **Diagnosis:** First clear identification and empirical demonstration that LR decay schedules suppress curriculum gains, not quality metrics.
- **CMA (Curriculum Model Averaging):** A constant-LR curriculum training procedure that replaces LR decay with EMA-weighted checkpoint averaging.
- **CDMA (Curriculum with Decay + Model Averaging):** A combined approach using moderate LR decay (final LR ≈ 1/3 of peak LR) together with EMA model averaging, achieving the best of both worlds.
- **Theoretical bound (Section 6):** Under ascending data ordering + constant LR + SMA (simple moving average), the paper proves $\mathbb{E}[L(\bar{w}_M)] = \tilde{O}(M^{-2/3} L^2)$, improving over the $\Theta(L^2)$ rate achieved by aggressive WSD decay in the curriculum setting.
- **Generalization:** Results hold across multiple quality metrics (DCLM fasttext scores, PreSelect), datasets (DCLM-Baseline, WebOrganizer), and averaging strategies (EMA, SMA, WMA).

---

## Method

### Why LR decay hurts curriculum learning

Parameter updates are $\theta_{t+1} = \theta_t - \eta_t \cdot g_t$. With a descending quality curriculum:

- **Early training:** Low-quality data, high LR $\eta_t$ — large gradient steps, much noise.
- **Late training:** High-quality data, small LR $\eta_t$ — small gradient steps, high-quality signal suppressed.

Under constant LR, late high-quality data provides a high signal-to-noise ratio (the gradient noise from clean data is intrinsically lower than from noisy data). Aggressive LR decay cancels this advantage by capping the step size exactly when the data quality is highest.

The paper validates this with a controlled ablation (Figure 2): under constant LR, ascending-order curriculum substantially outperforms uniform shuffling. Under WSD or cosine schedules, the gap shrinks with more aggressive decay, and disappears entirely at very small ending LRs.

### CMA: Curriculum Model Averaging

Replace LR decay with model averaging:
- Train with constant LR throughout (after warmup).
- At the end of training, take an EMA over the last $M$ checkpoints:

$$M_\text{avg}^{(i)} = \alpha \cdot M_i + (1-\alpha) \cdot M_\text{avg}^{(i-1)}$$

EMA with non-decreasing weights toward recent checkpoints is preferred under curriculum training, since the last checkpoints have seen the best data.

### CDMA: Curriculum + Decay + Model Averaging

Use *moderate* LR decay (ending LR ≈ $1 \times 10^{-3}$, about 1/3 of the peak LR of $3 \times 10^{-3}$) combined with EMA averaging. This is the best-performing configuration, combining:

- Moderate noise reduction from light decay.
- Preservation of meaningful LR for late-stage, high-quality data.
- Variance reduction from checkpoint averaging.

Key insight: the optimal ending LR for curriculum + averaging is qualitatively different from that for uniform data + standard decay. For uniform data, aggressive decay (final LR → $10^{-5}$) works well. For curriculum data, ending at $10^{-3}$ is better.

The WSD LR schedule in the paper is:

$$\eta(t) = \eta_0 (1 - \sqrt{r(t)}) + \eta_T \sqrt{r(t)}, \quad r(t) = \frac{t - t_\text{decay}}{T - t_\text{decay}}$$

---

## Experimental Setup

**Model:** Qwen2.5-1.5B architecture.

**Training:** 30B tokens, peak LR $3 \times 10^{-3}$, standard ending LR $10^{-5}$ (baseline), AdamW.

**Data:** DCLM-Baseline dataset sorted by DCLM fasttext quality scores. Also validated on WebOrganizer (unfiltered web) with PreSelect scores.

**Evaluation:**
- Validation loss on a high-quality DCLM subset (100K documents).
- Core downstream benchmarks: MMLU, ARC-Easy, ARC-Challenge, CommonSenseQA.
- Extended benchmarks: OBQA, PIQA, SocialIQA, WinoGrande.

**Baselines:**
- WSD + Uniform (random shuffle, standard decay): 50.56 average score.
- Cosine + Uniform.
- Descending-order curriculum (serves as an ablation, consistently hurts performance).

---

## Results

### Full pre-training scenario (Table 1, 30B tokens)

| Configuration | Avg benchmark score |
|---------------|---------------------|
| WSD + Uniform (baseline) | 50.56 |
| CMA (EMA + Ascending + Const LR) | 50.95 (+0.39) |
| Best CDMA variant | up to +0.81 (core benchmarks) |

### Mid-training scenario (Table 2) — higher-impact setting

When high-quality data is even more scarce (mid-training scenario where quality data appears at the tail), the gains are larger:

| Configuration | Avg score |
|---------------|-----------|
| WSD + Uniform baseline | 47.49 |
| EMA + Ascending (A-T) | 48.69 (+1.20) |
| Core benchmark improvement | +2.29% |

### Moderate decay analysis (Figure 5)

Optimal ending LR for curriculum + averaging: ~$10^{-3}$ (100× less aggressive than the standard $10^{-5}$).
Combining moderate decay + EMA over ascending curriculum achieves **+1.64–1.68% average improvement** on core benchmarks over the WSD + Uniform baseline.

### Model averaging strategy ablation

Under curriculum training, EMA and SMA (with non-decreasing weights toward recent checkpoints) outperform WMA (weighted moving average). The intuition: under curriculum, the most recent checkpoints have been trained on the best data and should be weighted more heavily.

### Dataset / quality metric generalization

- DCLM fasttext scores: Full gains as reported above.
- PreSelect scores: Suboptimal results (curriculum + averaging still helps but by a smaller margin), suggesting DCLM scores better align with downstream benchmark distribution.
- WebOrganizer dataset: CMA achieves **+1.87% core benchmark improvement** over the baseline.

---

## Limitations & Caveats

- **Scale:** All experiments are at 1.5B parameters, 30B tokens. The paper does not validate at 7B, 13B, or 70B scale, so the magnitude of gains at production scale is uncertain.
- **Sorting overhead:** Global end-to-end sorting of a pre-training corpus is operationally expensive. The paper notes that per-phase sorting (A, A) provides partial benefits, but this is an approximation.
- **Quality metric sensitivity:** The method's effectiveness depends on the quality score accurately reflecting relevance to target benchmarks. PreSelect scores performed worse than DCLM scores in experiments; practitioners need to validate metric alignment.
- **Hyperparameter sensitivity:** The optimal ending LR differs between curriculum and uniform training, requiring re-tuning. A practitioner cannot simply take their existing training config and add a curriculum sort.
- **Theoretical bound:** The $\tilde{O}(M^{-2/3} L^2)$ bound applies to SMA, not EMA. The gap between theory and the empirically best variant (EMA) is not bridged.

---

## Why It Matters / Implications

This paper reframes a longstanding negative result. Prior work that reported "curriculum learning doesn't work" was likely running curriculum with standard aggressive LR decay — exactly the setup that suppresses curriculum gains. The actual failure mode is a scheduling mismatch, not a flaw in the curriculum idea.

Practically:
1. **Diagnostic:** If you tried data curriculum and it didn't help, check whether you used aggressive LR decay. The fix may be as simple as raising your ending LR.
2. **Two-lever framework:** Practitioners now have a clear interaction to optimize: data ordering × LR schedule. These must be co-designed, not chosen independently.
3. **Model averaging synergy:** The combination of moderate decay + EMA averaging + curriculum is stronger than any component alone. This is a rarely-explored pretraining regime that the paper opens up.
4. **Connection to WSM:** This work is directly related to the WSM paper (also in this session). WSM shows that constant-LR + checkpoint merging is theoretically equivalent to decay. This paper provides complementary empirical evidence for *why* constant LR is preferable when data quality is non-uniform across training time.

---

## Related Work Context

- **WSD (MiniCPM, 2024):** The dominant flexible scheduling baseline, shown here to suppress curriculum gains when decay is aggressive.
- **Curriculum learning in NLP:** Long history (Bengio et al., 2009 foundational work on CL; recent attempts with quality filters). Prior work inconsistently reports gains, often attributing failures to quality metric quality. This paper offers an alternative explanation.
- **Model averaging / SWA (Izmailov et al., 2018):** Stochastic Weight Averaging used here as a tool; the novelty is applying it specifically in the curriculum context to replace LR decay.
- **DCLM (DataComp for Language Models, 2024):** Dataset and quality scoring used in the main experiments.
- **WSM (Tian et al., 2025 / ICLR 2026):** Parallel work showing checkpoint merging emulates LR decay theoretically; complementary to this paper's empirical focus on curriculum interaction.

---

## Note on Rafael's Raw Notes

Rafael's notes contain a typo: "How LR Decay Wasters yout Best Data in Curriculum Learning LLM Pretraining." The correct title is "How Learning Rate Decay Wastes Your Best Data in Curriculum-Based LLM Pretraining." The notes also refer to the methods as "CMA for Curriculum Model Average, and CDM for Curriculum LR Decay Model Averaging" — the paper uses **CMA** (Curriculum Model Averaging) and **CDMA** (Curriculum Decay Model Averaging), not CDM. The core description in the notes is otherwise accurate.
