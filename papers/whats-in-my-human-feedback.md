# What's In My Human Feedback? Learning Interpretable Descriptions of Preference Data

**Authors:** Rajiv Movva, Smitha Milli, Sewon Min, Emma Pierson

**Venue / Year:** ICLR 2026 (Oral) — arXiv v1 October 2025, v2 April 11, 2026

**Source:** https://arxiv.org/abs/2510.26202

**Local copy:** papers/whats-in-my-human-feedback.pdf (PDF download requires Bash access; see source URL)

---

## TL;DR

Human preference datasets drive RLHF but remain opaque: we know reward models can predict labels, yet we do not know *why* humans made those choices. WIMHF uses sparse autoencoders trained on response-embedding differences to automatically discover a small set of human-interpretable preference dimensions from any preference dataset — without pre-specifying hypothesis features. Applied to seven major datasets, the method reveals that preferences are highly dataset-specific, often in conflict across datasets, and occasionally encode actively harmful tendencies (LMArena annotators penalize safety refusals). A targeted data-curation intervention raises RewardBench2 safety accuracy from 8.9% to 46.2% with no aggregate performance cost.

---

## Problem & Motivation

Human feedback datasets — the training signal for RLHF and RLAIF — are treated as ground truth, but their content is largely unknown. The field knows reward models trained on these datasets generalize imperfectly and sometimes reward undesirable traits (verbosity, sycophancy, overconfidence), yet diagnosing *which* specific preferences are at fault requires labor-intensive human audits or pre-specified feature lists that constrain what can be discovered.

The paper distinguishes two conceptually important sub-problems (Section 1):

1. **Measurable preferences**: which attributes *could* be measured given the response pairs in the dataset — if responses never differ on some dimension, that preference cannot be learned from the data regardless of how it is analyzed.
2. **Expressed preferences**: the subset of measurable preferences that actually predict the human label $y$.

Prior work (InverseCAI, manually audited datasets) either pre-specifies features or requires heavy human labor. WIMHF is hypothesis-free and automated.

---

## Key Contributions

- **WIMHF**: a fully automated pipeline combining sparse autoencoders (SAEs) with LLM-based feature labeling to produce interpretable, validated preference descriptions.
- **Measurable vs. expressed preference** distinction: a conceptual framework clarifying why different datasets capture different things and why comparisons across datasets are non-trivial.
- **Seven-dataset audit**: the first systematic cross-dataset comparison of preference content at this scale (LMArena, Community Alignment, HH-RLHF, PRISM, Reddit, PKU-SafeRLHF, Tulu 3).
- **Data curation via label flipping**: +37.3 percentage point safety improvement (8.9% → 46.2% on RewardBench2) from flipping 1,000 anti-refusal Arena labels.
- **Annotator-level personalization**: identifies subjective preference axes and demonstrates AUC gains with as few as $k=16$ per-annotator examples.

---

## Method

### Formalization (Section 2)

The preference dataset distribution is:

$$(\mathbf{p}, r_A, r_B, y) \sim \Pr(\mathbf{p}) \cdot \Pr(r_A, r_B | \mathbf{p}) \cdot \Pr(y | r_A, r_B, \mathbf{p})$$

where $\mathbf{p}$ is the prompt, $r_A, r_B$ are candidate responses, and $y \in \{A, B\}$ is the preference label.

### Step 1: Feature Discovery via SAE (Section 3)

The key insight: any single response pair differs along only a *sparse* subset of possible dimensions. This sparsity structure is exactly what sparse autoencoders are designed to exploit.

**Embedding difference**: Compute $\mathbf{e}_\Delta = \mathbf{e}_{r_A} - \mathbf{e}_{r_B}$ using OpenAI `text-embedding-3-small` for each response pair. The difference captures what is *comparatively* different between responses, discarding shared content.

**SAE architecture**: A BatchTopK sparse autoencoder trained on $\{\mathbf{e}_\Delta\}$:
- Encoder maps $\mathbf{e}_\Delta \in \mathbb{R}^{d_\text{embed}}$ to sparse latent $\mathbf{z} \in \mathbb{R}^M$ with exactly $K$ non-zero entries per example.
- Decoder reconstructs $\hat{\mathbf{e}}_\Delta$ from $\mathbf{z}$.
- **Hyperparameters**: $(M, K) = (32, 4)$ across all datasets — 32 latent dimensions with 4 active per example.

The authors confirm empirically (Figure 4) that using full prompt-response embeddings provides no accuracy gain over response-only differences, supporting the focus on $\mathbf{e}_\Delta$.

### Step 2: Natural Language Feature Labeling (Section 3, Appendix A.3)

For each of the $M$ latent dimensions $z_j$:

1. Sample 5 response pairs with highest $z_j$ activation values.
2. Prompt GPT (`gpt-5-low`) to describe the distinguishing concept.
3. **Fidelity validation**: annotate 300 held-out examples with `gpt-5-mini-low`; compute Pearson correlation between the LLM annotation score and $z_j$ activation.
4. Retain only features with $p < 0.05$ after Bonferroni correction.

This two-step approach (SAE discovery + LLM labeling) avoids the circularity of hand-specifying features while providing interpretable outputs that can be communicated to non-technical stakeholders.

### Step 3: Expressed Preference Identification (Section 3)

For each retained feature $z_j$, fit a logistic regression:

$$\Pr(y=1) = \sigma\!\left(\alpha + \beta_j z_j + \gamma \cdot \ell_\Delta\right)$$

where $\ell_\Delta = \ell_{r_A} - \ell_{r_B}$ controls for response-length differences (a known confounder). Standardize $z_j$ and $\ell_\Delta$ to mean 0, std 1. Report $\beta_j$ (coefficient) and $\Delta\text{win-rate}$ (average marginal effect on predicted win-rate) as the effect size.

---

## Experimental Setup

**Datasets**: Seven preference datasets, filtered to remove examples whose outcomes depend on objective correctness (math, coding), isolating subjective preference signal:

| Dataset | Domain |
|---------|--------|
| LMArena | Open-domain, crowd-sourced model comparison |
| Community Alignment (CA) | Diverse values; single LLM responses |
| HH-RLHF | Helpfulness + harmlessness |
| PRISM | Multicultural, values-focused conversations |
| Reddit (SHP) | Diverse Reddit discussions |
| PKU-SafeRLHF | Safety-oriented alignment |
| Tulu 3 | Post-training mixture |

**Baselines**:
- Black-box reward model: Llama-3.2-3B fine-tuned on each dataset (upper bound on preference prediction).
- Dense embedding baseline: OpenAI embeddings directly (no SAE).
- Inverse Constitutional AI (ICAI): feature-discovery competitor.

**Metric**: AUC for preference prediction; Pearson correlation for feature fidelity; $\Delta\text{win-rate}$ for effect size.

---

## Results

### Feature Quality (Section 4.1)

- SAE features achieve AUC **0.672** on average, vs. **0.766** for the black-box reward model and ~0.500 for random — recovering **67% of the learnable preference signal** while remaining fully interpretable.
- SAE achieves **84%** of the dense embedding AUC gain, meaning very little is lost by imposing the sparse interpretable structure.
- Annotator explanation match: **60.4%** of human-written explanations in the Community Alignment dataset match at least one active SAE feature, vs. 33.3% for random features ($p < 0.001$).
- External reviewer validation: 41/47 features (87%) rated helpful; all 47 rated interpretable.

### Measurable Preferences Differ Across Datasets (Section 4.2)

PRISM responses come from multiple LLMs at high temperature, so pairs differ primarily in style/tone/refusals. Community Alignment uses a single LLM with diverse prompts, so pairs differ primarily in topic/values. This structural difference explains why PRISM features cluster around communication style while CA features cluster around subject matter (Table 1).

### Expressed Preferences Are Conflicting (Section 4.3, Figure 2)

| Feature | Dataset | $\Delta$win-rate |
|---------|---------|-----------------|
| Jokes / humor | Reddit | +10% |
| Jokes / humor | Arena | +3% |
| Flippant jokes | HH-RLHF | negative |
| Flippant jokes | PRISM | negative |
| Safety refusals | LMArena | **-31%** |
| Sustainability discussion | Community Alignment | -34% |
| Markdown formatting | LMArena | +19% |
| Markdown formatting | CA | +48% |

The LMArena anti-refusal finding is the most alarming: Arena annotators strongly penalize responses that decline unsafe requests. This is not an artifact — Table 11 in the paper shows concrete examples where the winning response assists with harm.

Other recovered preferences:
- **HH-RLHF**: uncertainty language penalized (-14%), consistent with reward models learning to over-state confidence.
- **PRISM**: neutral evidence-based discussion rewarded (+9%), but complete deflection penalized (-14%) — a nuanced tradeoff.

### Data Curation (Section 5.1, Figure 3a)

Flipping the 1,000 Arena examples with highest anti-refusal feature activation:
- RewardBench2 **safety: 8.9% → 46.2%** (+37.3 pp).
- Overall benchmark performance unchanged (within 95% CI).
- 16 of 30 evaluated reward models shift ≥50 Elo ranks under the corrected evaluation.

### Personalization (Section 5.2, Figure 3b, Table 7)

Community Alignment dataset, fitting a mixed-effects model to identify the most annotator-subjective features:
- Paragraph vs. bullet-point format: $\tau_j = 0.42$ (highest inter-annotator subjectivity).
- Although paragraphs are disfavored overall ($\beta_j$ strongly negative), 18% of individual annotators prefer them.
- Personalizing paragraph preference with $k=16$ per-annotator examples: **+1.1% AUC gain**.
- Active sampling (selecting high feature-activation examples) is more efficient than random sampling of examples.

---

## Limitations & Caveats

1. **Prompt conditioning**: method operates on response differences, ignoring the prompt context — features may conflate effects that depend on prompt type.
2. **Gap to full reward model**: recovers 67% of signal, not 100%; the remaining 33% is not fully explained.
3. **English only**: no multilingual evaluation.
4. **Personalization downstream evaluation**: the paper measures AUC gain on preference prediction, not whether fine-tuning on personalized labels actually changes model behavior as intended.
5. **LLM-based feature labeling**: the quality of natural-language descriptions depends on the labeling model, introducing its own biases.

---

## Why It Matters / Implications

This paper is a practical tool for dataset stewardship. Before training or fine-tuning on any preference dataset, running WIMHF gives practitioners a fast, automated audit that surfaces:

- What variation exists to learn from (measurable preferences).
- What annotators are actually rewarding (expressed preferences), including potentially harmful tendencies.
- Which examples to flip or remove to fix safety properties without broad performance regressions.

The Arena anti-refusal finding is an immediate engineering concern: any reward model trained on LMArena data without this correction is learning a safety-suppressing signal. The +37 pp safety recovery from flipping 1,000 examples (~0.1% of a typical dataset) suggests the fix is cheap once the problematic cluster is identified.

For personalization researchers, the identification of subjective axes (paragraph vs. bullets) as interpretable "knobs" is a promising direction toward annotator-adaptive RLHF without requiring large per-annotator datasets.

---

## Related Work Context

- **Reward model analysis** (Gao et al. 2023, Shen et al. 2023): prior work shows reward models learn spurious correlates like length; WIMHF provides the mechanism to identify *which* spurious correlates.
- **Inverse Constitutional AI** (Findeis et al. 2025): closest prior method; WIMHF produces >1.5× as many statistically significant features and surfaces the Arena anti-refusal preference that ICAI misses.
- **SAEs in interpretability** (Cunningham et al. 2023, Bricken et al. 2023): WIMHF adapts the SAE toolkit — originally developed for model internals — to *dataset* interpretation, a novel application domain.
- **Data curation for alignment** (Wang et al. 2023): WIMHF adds a principled, preference-aware curation step grounded in interpretable features rather than heuristic filters.
- **Personalized RLHF** (Jang et al. 2023): WIMHF's annotator-subjective features provide a data-driven basis for deciding which axes are worth personalizing at all.

---

**Note on Rafael's journal notes vs. paper:** Notes are accurate. One clarification: the notes say "they use sparse autoencoders to automatically understand what preferences are encoded." More precisely, the SAE is trained on *differences* of response embeddings (not on full responses), which is the key methodological choice enabling sparse, comparative feature discovery. The notes correctly capture the measurable/realized (expressed) preference distinction.
