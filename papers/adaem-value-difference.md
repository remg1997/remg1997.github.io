# AdAEM: An Adaptively and Automated Extensible Measurement of LLMs' Value Difference

**Authors:** Jing Yao, Shitong Duan, Xiaoyuan Yi, Dongkuan Xu, Peng Zhang, Tun Lu, Ning Gu, Zhicheng Dou, Xing Xie

**Venue / Year:** ICLR 2026 (Oral) — arXiv v1 May 2025, v2 March 2026

**Source:** https://arxiv.org/abs/2505.13531

**Local copy:** papers/adaem-value-difference.pdf (PDF download requires Bash access; see source URL)

---

## TL;DR

Existing LLM value benchmarks use static, increasingly contaminated question sets that produce near-identical scores across models — making them useless for distinguishing alignment profiles. AdAEM solves this with a self-extensible framework that *automatically generates* new value-evoking questions by iteratively optimizing a Jensen–Shannon divergence objective over a diverse ensemble of LLMs, co-evolving with models across cultures and time. The resulting AdAEM Bench (12,310 questions) exposes significant, stable value differences that static benchmarks cannot surface.

---

## Problem & Motivation

Evaluating the values of LLMs — their latent dispositions toward power, hedonism, universalism, and so on — matters for alignment, cultural adaptation audits, and bias detection. Existing instruments (SVS, ValueBench, ValueDCG) are:

- **Static and contaminated**: questions predate the models being tested; scores saturate toward uninformative similarity.
- **Generic**: questions target safety values shared by almost all modern LLMs, yielding negligible variance.
- **Temporally blind**: they cannot capture recently emergent social controversies that plausibly differentiate models trained at different times or on different corpora.

A well-designed evaluation should yield *discriminative* results — distinguishable scores across meaningfully different respondents. AdAEM frames this as an informativeness problem and attacks it via dynamic question synthesis (Section 1).

---

## Key Contributions

- **Self-extensible evaluation algorithm**: automatically generates and iteratively refines test questions using in-context optimization, requiring no manually curated data or fine-tuning.
- **Information-theoretic objective**: maximizes Jensen–Shannon divergence between model value distributions, with a disentanglement regularizer to prevent question-level bias from dominating.
- **Multi-arm bandit exploration**: selects candidate topics efficiently using UCB-style scoring over a large topic pool.
- **AdAEM Bench**: 12,310 questions grounded in Schwartz Value Theory, covering 10 dimensions, with demonstrated superior semantic diversity (Self-BLEU 13.42 vs. 52.68 for SVS).
- **Extensibility on two axes**: cultural (questions seeded from models built in China, US, Europe reveal distinct topic clusters) and temporal (question vintage tracks the knowledge cutoff of the generating model).

---

## Method

### Problem Formulation (Section 3.1)

Values are treated as latent variables. For a set of K LLMs with parameters $\theta_i$, the value vector $\mathbf{v} \in \mathbb{R}^d$ (over $d$ Schwartz dimensions) is estimated via:

$$p_{\theta_i}(\mathbf{v}) \approx \mathbb{E}_{\hat{p}(\mathbf{x})}\, \mathbb{E}_{p_{\theta_i}(\mathbf{y}|\mathbf{x})}\left[p_\omega(\mathbf{v}|\mathbf{y})\right]$$

where $\mathbf{x}$ is a test question, $\mathbf{y}$ is the model's response, and $p_\omega$ is a value extractor (itself an LLM).

### Core Optimization Objective (Equations 1–2)

The question generation problem is:

$$\mathbf{x}^* = \arg\max_{\mathbf{x}}\; \text{JSD}_\alpha\!\left[p_{\theta_1}(\mathbf{v}|\mathbf{x}),\ldots,p_{\theta_K}(\mathbf{v}|\mathbf{x})\right] + \frac{\beta}{K}\sum_{i=1}^K \text{JS}\!\left[\hat{p}(\mathbf{v}|\mathbf{x})\;\|\;p_{\theta_i}(\mathbf{v}|\mathbf{x})\right]$$

- **Informativeness term** (first): maximize the divergence between model value distributions — questions that cause models to disagree reveal genuine differences.
- **Disentanglement term** (second): penalize questions that already have a "correct" answer baked in (i.e., where $\hat{p}(\mathbf{v}|\mathbf{x})$ strongly resembles one specific model). This prevents cultural or ideological bias in the question itself from dominating the measured differences.

### Algorithm: Two-Phase Iterative Optimization (Algorithm 1)

Over a budget $B$ iterations:

**Phase 1 — Response Generation.** For current question $\mathbf{x}^{(t-1)}$: sample values $\mathbf{v}^i \sim p^{(t-1)}_i(\mathbf{v})$, then opinions $\mathbf{y}^{i,t}_j \sim p^{(t-1)}_i(\mathbf{y}|\mathbf{v}^i)$. Score each response via:

$$\mathcal{S}(\mathbf{y}) = \sum_i p_i(\mathbf{y}|\mathbf{v}^i)\left[\log p_i(\mathbf{v}^i|\mathbf{y}) + \log p_i(\mathbf{y}) - \log p^M(\mathbf{v}^i|\mathbf{y}) - \log p^M(\mathbf{y})\right]$$

capturing value conformity, semantic coherence, and cross-model divergence.

**Phase 2 — Question Refinement.** Fix the sampled responses and optimize $\mathbf{x}^t$ to maximize an analogous scoring function over the fixed response pool, emphasizing context coherence, value diversity, and opinion diversity.

**Exploration.** Topics are selected via UCB: $i^* = \arg\max_i\!\left(Q_i + \sqrt{2\ln B / C_i}\right)$, balancing estimated quality $Q_i$ against under-exploration.

Two LLM tiers are used: a cheaper set $\mathbb{P}_1$ (LLaMA-3.1-8B, Qwen2.5-7B, Mistral-7B, DeepSeek-V2.5) for question generation and an augmented set $\mathbb{P}_2$ ($\mathbb{P}_1$ + GPT-4-Turbo, Mistral-Large, Claude-3.5-Sonnet, GLM-4, LLaMA-3.3-70B) for scoring.

### Evaluation Metrics (Section 3.3)

Two measurement modes:

1. **Opinion-based**: extract multiple discrete opinions per response, identify expressed Schwartz values via $p_\omega$, aggregate across opinions with logical OR.
2. **Relative ranking**: aggregate value vectors with TrueSkill to produce model win rates for each value dimension.

---

## Experimental Setup

- **Value framework**: Schwartz's 10-dimensional model (Power, Achievement, Hedonism, Stimulation, Self-Direction, Universalism, Benevolence, Tradition, Conformity, Security).
- **Benchmark construction**: $B=1500$ budget iterations; $\beta=1$, $N=1$; initialized from $N_1=1535$ generic seed topics.
- **Benchmarked models**: 16 LLMs including GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, GLM-4, various Mistral/LLaMA variants, o3-mini.
- **Baseline benchmarks**: SVS (57 questions), ValueBench (40), ValueDCG (4,561).
- **Human evaluation**: crowd-sourced annotation with Cohen's $\kappa = 0.93$ (strong inter-rater agreement).

---

## Results

### Benchmark Quality (Table 1, Section 4.2)

| Benchmark | Questions | Self-BLEU ↓ | Cosine Sim ↓ |
|-----------|----------:|------------:|-------------:|
| SVS | 57 | 52.68 | 0.61 |
| ValueBench | 40 | 26.27 | 0.60 |
| ValueDCG | 4,561 | 13.93 | 0.36 |
| **AdAEM** | **12,310** | **13.42** | **0.44** |

AdAEM has the lowest Self-BLEU (highest lexical diversity) and competitive cosine diversity, while being 2.7× larger than ValueDCG.

### Validity via Controlled Priming (Section 4.2)

Testing on o3-mini with explicit value-nudge prompts: target value activated +31% ($p < 0.01$), conflicting values suppressed -58%, grouped values increased +17%. Demonstrates questions genuinely probe value orientations rather than surface-level preferences.

### Reliability

Cronbach's $\alpha = 0.8991$ ("good") and Coefficient of Variation $= 0.2845$ across 5-fold partitioning — stable, reproducible measurements.

### Human evaluation

AdAEM questions improve reasonableness by 6.7% and value differentiation by 31.6% over baseline questions.

### Model-Level Findings (Section 5, Figure 9)

Across 16 LLMs:
- Advanced safety-tuned models cluster toward Universalism.
- Same-family models (e.g., LLaMA 8B/70B/405B) converge to similar orientations regardless of scale — but larger models within the family show stronger Tradition/Universalism.
- Reasoning-oriented models (o3-mini) exhibit elevated Self-Direction and Stimulation.
- Value profiles are topic-sensitive: "Technology & Innovation" vs. "Philosophy & Beliefs" produces visibly different radar-chart shapes (Figure 10b).

### Extensibility (Sections 4.3)

Cultural axis: questions seeded from GLM-4 (China), GPT-4-Turbo (US), Mistral-Large (Europe) cluster distinctly in topic space, validating cross-cultural question diversity.

Temporal axis: GPT-4o questions reference Ukraine war events; earlier GPT versions do not — question content tracks model training cutoffs.

---

## Limitations & Caveats

- **Theory scope**: only Schwartz's framework; Moral Foundations Theory, Hofstede's dimensions, and Kohlberg's stages are not covered.
- **Language**: English only; multilingual extension needed.
- **Model budget**: only 16 models benchmarked due to API cost.
- **Malicious use risk**: generating controversial questions could be misused to provoke or manipulate.
- **LLM-in-the-loop filtering**: question curation relies on LLM judgment, inheriting those models' own biases.

---

## Why It Matters / Implications

For alignment engineers, AdAEM offers a rigorous alternative to static questionnaires that have become saturated and gameable. The dynamic generation approach means the benchmark can track value drift as models are updated — something no fixed dataset can do. The cultural and temporal extensibility axes are particularly valuable for auditing models deployed in non-English-speaking markets or benchmarking successive versions of the same base model.

The finding that same-family models cluster in value space despite scale differences is practically important: scale-up alone does not diversify value orientations. Engineers building multi-model pipelines expecting value diversity from scale should not assume it exists.

The open-source release at https://github.com/ValueCompass/AdAEM makes it straightforward to extend the benchmark to new value frameworks or new model populations.

---

## Related Work Context

- **ValueBench / SVS / ValueDCG**: static predecessors with contamination and saturation problems; AdAEM is explicitly designed to supersede them on discriminativeness.
- **RLHF alignment evaluation**: AdAEM is complementary — it measures *internal value dispositions* expressed in free responses, whereas RLHF-focused evaluations typically test behavior under instructed constraints.
- **Automated red-teaming** (Perez et al. 2022, Mehrabi et al. 2023): related in spirit (using LLMs to generate adversarial probes), but those target safety failures; AdAEM targets value *differentiation* across a Schwartz framework.
- **Schwartz Value Theory** in NLP: a growing body of work applies psychological value frameworks to LLMs; AdAEM is the first to make the benchmark self-extending rather than hand-curated.

---

**Note on Rafael's journal notes vs. paper:** No significant discrepancies. The notes correctly identify the dynamic schema, the 12,310-question benchmark, and the cross-model variance result. The notes abbreviate "AdAEM" as "AdaEM" — the canonical spelling in the paper title uses mixed case "AdAEM."
