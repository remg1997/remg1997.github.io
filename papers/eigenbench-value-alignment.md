# EigenBench: A Comparative Behavioral Measure of Value Alignment

**Authors:** Jonathan Chang, Leonhard Piff, Suvadip Sana, Jasmine X. Li, Lionel Levine

**Venue / Year:** ICLR 2026 (Oral) — arXiv v1 September 2025, v4 (latest) March 1, 2026

**Source:** https://arxiv.org/abs/2509.01938

**Local copy:** papers/eigenbench-value-alignment.pdf (PDF download requires Bash access; see source URL)

---

## TL;DR

Evaluating whether a language model is aligned with a given value system is hard when no ground-truth labels exist for subjective moral questions. EigenBench sidesteps this by having models judge *each other* across diverse scenarios, then aggregating those judgments with EigenTrust — the same algorithm used for decentralized trust networks — to produce Elo-style alignment scores that down-weight self-serving and unreliable judges. Human validation confirms that the resulting rankings closely match human evaluator consensus, and a robustness suite shows the scores are largely stable across scenario distributions, model populations, and adversarial manipulation attempts.

---

## Problem & Motivation

Standard LLM benchmarks for values (Ethics, Machiavelli, etc.) and leaderboards (Chatbot Arena / LMArena) face a fundamental scalability problem: human evaluation does not scale, and "LLM-as-a-judge" is unreliable because judges are themselves candidates for alignment (Section 1). Specific failure modes:

- A single LLM judge may have systematic biases favoring its own family or training style.
- Self-report surveys ("How aligned are you?") show inverse correlation with observed behavior — models that report perfect alignment score lower in behavioral tests (Table 4, Section 5).
- Ground-truth labels require human consensus, which is expensive and unavailable for genuinely contested value questions.

EigenBench's key insight: rather than asking one judge, ask *all* models to judge *all* other models, then weight each judge's contribution by a trust score derived from whether the full ensemble agrees with them. Self-promotion and systematic bias become detectable and down-weightable.

---

## Key Contributions

- **EigenBench methodology**: black-box comparative benchmarking using mutual model judgments aggregated via EigenTrust, requiring no external labels.
- **Bradley-Terry-Davidson latent model**: learns per-judge *lenses* and per-model *dispositions* as embeddings, enabling interpretable visualization of value space.
- **Judge scaffold**: a structured reflection protocol (models first reflect on constitutional alignment before comparing) that reduces order bias and intransitivity rates.
- **Empirical finding**: 79% of alignment score variance is explained by prompted *persona*, only 21% by the underlying model — suggesting EigenBench measures dispositional tendencies more than fixed model identity.
- **Robustness validation**: scores are stable across three scenario distributions, model population changes, and adversarial "greenbeard" agents.
- **Human–LM agreement**: average human–human interjudge distance approximately equals average human–LM interjudge distance.

---

## Method

### Inputs (Section 3)

Given:
- A **model population** $\mathcal{M} = \{M_1, \ldots, M_N\}$ — models serve as both candidates and judges.
- A **constitution** $\mathcal{C} = \{C_1, \ldots, C_K\}$ — natural language criteria describing a value system (e.g., Universal Kindness, Deep Ecology, Conservatism).
- A **scenario dataset** $\mathcal{S}$ — diverse prompts from r/AskReddit, OASST, or AIRiskDilemmas.

### Data Collection Pipeline (Section 3.4)

For each scenario $S_l$ and evaluee pair $(M_j, M_k)$:

1. Each evaluee generates a response $R_j, R_k$ to $S_l$.
2. Each judge $M_i$ generates reflections $\hat{R}_j, \hat{R}_k$ — written assessments of how well each response aligns with constitution $\mathcal{C}$.
3. Judge $M_i$ then produces a comparison $r_{ijkl} \in \{0, 1, 2\}$ (tie, prefer $j$, prefer $k$).
4. Transposed comparisons are also collected (swapping $j$ and $k$) to measure order/position bias.

The reflection step (judge scaffold) is critical: it forces judges to reason about alignment *before* comparing, reducing recency and primacy bias (Appendix E).

### Bradley-Terry-Davidson Model (Section 3.5)

EigenBench fits a latent model to the comparison matrix by maximizing log-likelihood:

$$\mathcal{L} = \sum_{i,j,k,l}\left[\mathbf{1}\{r_{ijkl}=0\}\log\Pr_i(j\approx k) + \mathbf{1}\{r_{ijkl}=1\}\log\Pr_i(j\succ k) + \mathbf{1}\{r_{ijkl}=2\}\log\Pr_i(k\succ j)\right]$$

The comparison probabilities are parameterized by:
- **Model dispositions** $\mathbf{v}_j \in \mathbb{R}^d$ — latent embedding of each model's value behavior.
- **Judge lenses** $\mathbf{u}_i \in \mathbb{R}^d$ — how each judge weights model behavior.
- **Tie propensity** $\lambda_i \in \mathbb{R}$ — judge-specific tendency to declare ties.

The pairwise preference probability under judge $i$ depends on $\exp(\mathbf{u}_i^\top \mathbf{v}_j)$ vs. $\exp(\mathbf{u}_i^\top \mathbf{v}_k)$. Embedding dimension $d$ is chosen by validation loss; ablations show $d=2$ captures most signal even for diverse populations (Appendix G).

### Trust Matrix and EigenTrust Aggregation (Section 3.6)

From the fitted latent strengths $s_{ij} = \exp(\mathbf{u}_i^\top \mathbf{v}_j)$, build a trust matrix $T$ with entries:

$$T_{ij} = \frac{s_{ij} + \frac{1}{2}\lambda_i \sum_{k\neq j}\sqrt{s_{ij}s_{ik}}}{\sum_l\!\left[s_{il} + \frac{1}{2}\lambda_i\sum_{k\neq l}\sqrt{s_{il}s_{ik}}\right]}$$

The trust score vector $\mathbf{t}$ is the **left principal eigenvector** of $T$: $\mathbf{t} = \mathbf{t}T$. This is exactly EigenTrust's computation — the steady-state probability of landing on a node in a random walk over the trust graph. Judges whose preferences align with the weighted ensemble consensus receive higher trust; self-promoting or idiosyncratic judges are discounted.

Final alignment scores are converted to Elo ratings:

$$\text{Elo}_j = 1500 + 400\log_{10}(N t_j)$$

---

## Experimental Setup

- **Primary scenario dataset**: 1,000 r/AskReddit prompts (24,000 total pairwise comparisons).
- **Secondary datasets**: OpenAssistant Conversations (OASST), AIRiskDilemmas.
- **Constitutions**: Universal Kindness (8 criteria), Deep Ecology (11), Conservatism (11), Claude's Constitution, OpenAI Model Spec.
- **Models**: Claude 4 Sonnet, Claude 3.5 Haiku, GPT-4.1, GPT-4o, GPT-4.1 Nano, Gemini 2.5 Pro, Grok 4, DeepSeek v3.
- **Baselines for validation**: human annotator panel; GPQA objective rankings.

---

## Results

### Model Rankings (Section 4.1, Figure 3)

**Universal Kindness** (Elo):

| Model | Elo |
|-------|-----|
| Gemini 2.5 Pro | 1567 |
| Claude 4 Sonnet | 1530 |
| GPT-4.1 | 1478 |
| Grok 4 | 1468 |
| DeepSeek v3 | 1419 |

**Conservatism** (Elo):

| Model | Elo |
|-------|-----|
| Gemini 2.5 Pro | 1557 |
| Claude 4 Sonnet | 1508 |
| GPT-4.1 | 1495 |
| DeepSeek v3 | 1461 |
| Grok 4 | 1459 |

Rankings shift meaningfully across constitutions — models are not uniformly aligned across value systems.

### Persona Dominates Model Identity (Section 4.2)

With $N=5$ models $\times$ $5$ prompted personas = 25 conditions:
- **Model variance: 21%** of alignment score variance.
- **Persona variance: 79%**.

This is a significant finding: the same base model prompted with different personas produces larger alignment score swings than switching between entirely different frontier models. System prompts matter more than model choice for alignment as measured here.

### Self-Report vs. Revealed Values (Section 5, Table 4)

Self-report surveys produce *inverted* rankings compared to EigenBench behavioral scores. Grok 4 self-rates Universal Kindness alignment at 7.0/7.0 but achieves Elo 1468; Claude 4 Sonnet self-rates 6.13/7.0 but achieves Elo 1530. This underscores that behavioral measures and survey measures are not interchangeable.

### Human–LM Agreement

The average human–human interjudge distance is approximately equal to the average human–LM interjudge distance. No evidence that LM judges are systematically more biased than human judges relative to group consensus.

### Cross-Dataset Robustness (Section 6.1, Table 5)

Universal Kindness scores across scenario distributions (same models):

| Model | r/AskReddit | AIRiskDilemmas | OASST |
|-------|:-----------:|:--------------:|:-----:|
| Gemini 2.5 Pro | 1567 | 1543 | 1568 |
| Claude 4 Sonnet | 1530 | 1538 | 1460 |
| GPT-4.1 | 1478 | 1433 | 1403 |
| Grok 4 | 1468 | 1493 | 1559 |
| DeepSeek v3 | 1419 | 1468 | 1448 |

Relative rankings are mostly consistent across datasets, though Grok 4 and Claude 4 Sonnet swap positions on OASST — suggesting some scenario-type sensitivity.

### Adversarial Robustness: Greenbeard Attack (Section 6.3, Figure 5)

A "greenbeard" scenario: $G$ adversarial models added to the ensemble, all trained to prefer responses containing a secret keyword. Even as greenbeards become the majority of judges, legitimate models' scores remain relatively stable. Trust weighting successfully identifies and down-weights the colluding judges.

### Confidence Intervals (Appendix F)

Trust score confidence follows a power law in dataset size: $C_i \propto n^\alpha$, $\alpha \approx -0.575$, $R^2 \approx 0.964$. At 24,000 comparisons, confidence interval width is approximately ±0.08 Elo.

### GPQA Recovery (Section 5)

On a subset of GPQA questions (objective benchmark), EigenBench recovers correct model rankings without access to ground-truth answers — validating that the mutual judgment aggregation can surface objective ability differences even in a framework designed for subjective value evaluation.

---

## Limitations & Caveats

1. **Persona effects dominate (79%)**: EigenBench measures disposition under a system prompt, not an intrinsic property of model weights. This may limit its use for comparing models with fixed deployment prompts vs. varied prompts.
2. **Order bias persists**: even with the judge scaffold, primacy/recency bias rates remain ~2–26% across models (Appendix E, Table 7). The scaffold reduces but does not eliminate position effects.
3. **Scenario sensitivity**: Grok 4's rank changes significantly across scenario datasets (Table 5), suggesting robustness is not universal.
4. **LM constitution authorship bias**: if LMs are used to write constitutions (common in practice), those models may receive an unfair scoring advantage.
5. **Average-case only**: no assessment of worst-case alignment failures; a model could score well on average while being vulnerable to adversarial prompts.
6. **Population sensitivity**: adding new models modestly shifts existing scores (Section 6.2, Table 6), so EigenBench scores are not absolute and should be interpreted relative to a defined ensemble.

---

## Why It Matters / Implications

EigenBench offers a practical, scalable alternative to human evaluation for custom value alignment assessment. For teams wanting to evaluate models against a specific company policy, ethical constitution, or cultural value system, the only inputs needed are: (1) a natural-language constitution, (2) a scenario set, and (3) a model ensemble (which can include the models being evaluated). No annotations required.

The persona-dominance finding has an immediate engineering implication: before spending effort selecting a "more aligned" model, check whether the current model with a better system prompt already achieves the desired alignment profile. The 79% persona variance suggests that prompt engineering is likely the higher-leverage intervention.

The self-report inversion (models that claim highest alignment score lowest) is a concrete reminder not to use self-assessment as a proxy for behavioral alignment — which is relevant for any workflow using LLMs to assess their own outputs.

---

## Related Work Context

- **Chatbot Arena / LMArena**: crowd-sourced comparative evaluation; EigenBench replaces human crowd with a model ensemble plus trust weighting, enabling arbitrary custom constitutions.
- **EigenTrust** (Kamvar et al. 2003): the trust aggregation algorithm, originally designed for peer-to-peer file sharing networks; EigenBench is the first application to LLM alignment evaluation.
- **Bradley-Terry models in NLP** (Chen et al. 2023, Elo ranking systems): standard pairwise ranking frameworks; EigenBench extends with judge-specific lens embeddings and tie propensity parameters.
- **Constitutional AI** (Anthropic 2022): constitutions as natural-language specifications for alignment; EigenBench provides a *measurement* tool for how well models satisfy a given constitution, complementing CAI's training approach.
- **Value alignment benchmarks** (Hendrycks et al. 2021 ETHICS, Du et al. 2022 Machiavelli): static, ground-truth-labeled datasets; EigenBench operates without ground truth and generalizes to any value system.

---

**Note on Rafael's journal notes vs. paper:** The notes are accurate. One minor clarification: the notes describe the scoring as "weighted average" — more precisely, it is the left principal eigenvector of a trust matrix derived from Bradley-Terry latent strengths, which is a weighted-consensus operation but with specific mathematical structure (not a simple mean). The notes also mention recovering objective rankings on GPQA, which is confirmed in Section 5. The name in the notes is "EigenBench" — confirmed canonical spelling. The notes also note "pre-prompting functions as well as fine-tuning" for constitution adherence — this refers to the character-training experiment in Section 5 where persona-prompted models show alignment shifts comparable to fine-tuned ones, consistent with the 79% persona variance finding.
