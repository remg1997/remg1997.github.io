# Pre-training Under Infinite Compute

**Authors:** Konwoo Kim, Suhas Kotha, Percy Liang, Tatsunori Hashimoto
**Venue / Year:** ICLR 2026
**arXiv:** https://arxiv.org/abs/2509.14786
**Source:** https://arxiv.org/pdf/2509.14786
**Local copy:** PDF download not attempted (Bash denied); full content retrieved from https://arxiv.org/html/2509.14786v1

---

## TL;DR

Web text grows at ~1.03× per year while compute grows at ~4×. The day when compute vastly outstrips available data is approaching. This paper asks: given a fixed dataset and unlimited compute, what is the best achievable pre-training loss, and how do you get there? The answer involves aggressively tuned regularization ($30\times$ the standard weight decay), ensemble scaling, and careful asymptotic analysis — together achieving a **5.17× data efficiency improvement** over standard baselines at 200M tokens.

---

## Problem & Motivation

The standard framing of pre-training scaling laws (Kaplan et al. 2020, Hoffmann/Chinchilla 2022) asks: given a fixed compute budget $C$, how should you allocate it between model size $N$ and token count $D$? This implicitly assumes data is abundant.

The paper argues this framing will soon be wrong. With web data growth at ~1.03×/year and compute at ~4×/year, the data-unconstrained regime is closing. The question becomes:

$$\mathcal{L}^*_D = \min_H \mathcal{L}(\mathcal{A}(D, H))$$

where $D$ is a *fixed* token budget, $H$ is the full hyperparameter and training algorithm specification (model size, epochs, weight decay, learning rate, ensemble count), and $\mathcal{A}$ is the training procedure. The compute to evaluate $\mathcal{L}^*_D$ is treated as unlimited.

The paper uses **asymptotic loss** — the loss as some axis (parameters or ensemble size) goes to infinity — as the primary evaluation metric, arguing this is more meaningful than loss at a single compute point when measuring algorithm quality.

---

## Key Contributions

- Identifies that standard pre-training recipes catastrophically fail in the data-constrained / infinite-compute regime (overfitting with epochs, near-zero gains from naively scaling parameters).
- Proposes a **regularized parameter scaling recipe** with carefully tuned weight decay ($0.8$–$3.2$, vs. the standard $0.1$), achieving a clean power-law scaling curve with exponent $1.02$ (vs. Chinchilla's $0.34$).
- Shows **ensemble scaling** achieves a lower loss asymptote than any single regularized model, and that training two smaller models beats training one larger model.
- Jointly optimizing regularization and ensemble size achieves a **3.17 loss asymptote** at 200M tokens, a **5.17× data efficiency improvement** over the unregularized baseline.
- Demonstrates **distillation** can recover 83% of ensemble gains at $8\times$ lower inference cost.
- Validates results on **downstream benchmarks** (+9% accuracy improvement) and **continued pre-training** on math data (17.5× data efficiency).

---

## Method

### Step 1: Diagnose Failure of Standard Recipes

The paper runs standard pre-training at 300M parameters on 200M tokens (already a $140\times$ overparameterized ratio compared to the Chinchilla-optimal point). Findings:

- **Epoch scaling** (Figure 2, left): loss decreases then increases. Standard early-stopping is necessary; there is no free lunch from more passes over data with default hyperparameters.
- **Parameter scaling** (Figure 2, right): increasing from 150M to 1.4B parameters ($10\times$) yields less than 0.1 loss improvement, and loss increases at extreme parameter counts. Standard recipes plateau badly.

### Step 2: Regularized Parameter Scaling

The central insight is that **optimal weight decay scales with model size** in the data-constrained regime, and needs to be dramatically larger than the conventional value.

The paper uses **coordinate descent** over hyperparameters (learning rate, epoch count, weight decay) for each parameter count, seeking the locally optimal recipe. Optimal values found (Figure 3 table):

| Parameters | Learning Rate | Epochs | Weight Decay |
|---|---|---|---|
| 150M | 3e-3 | 16 | 0.8 |
| 300M | 3e-3 | 16 | 1.6 |
| 600M | 1e-3 | 8 | 3.2 |
| 1.4B | 1e-3 | 8 | 3.2 |

Note that the largest models use weight decay $3.2$, compared to a standard value of $\sim 0.1$ — a **30× increase**.

With this tuning, parameter scaling follows a clean power law:

$$\hat{\mathcal{L}}_{200\text{M}, N} = \frac{0.05}{N^{1.02}} + 3.43$$

The exponent $1.02$ far exceeds Chinchilla's $0.34$, indicating that with proper regularization the model is leveraging each additional parameter much more effectively. The asymptote is $3.43$ (i.e., best achievable loss with a single infinitely large regularized model on 200M tokens).

### Step 3: Ensemble Scaling

$K$ independently trained models are combined via logit averaging:

$$\text{LogitAvg}(M_{i \in [K]})(x) \propto \exp\!\left(\frac{1}{K} \sum_{i \in [K]} \log M_i(x)\right)$$

Key findings from Figure 4:
- Ensemble member count scales loss with exponent $\propto 1/K$.
- **Ensemble asymptote** (300M models, $K \to \infty$): **3.34 loss** — better than the single-model asymptote of 3.43.
- Critically: **training two 300M models outperforms training one 600M model** on the same token budget.

The hyperparameters optimal for single-model training are not optimal for ensemble training. When tuning specifically for $K \to \infty$ asymptote, the optimal recipe uses $2\times$ epochs and $0.5\times$ weight decay relative to the single-model optimum, pushing the ensemble asymptote further to **3.27 loss** (Figure 5).

### Step 4: Joint Scaling (Full Recipe)

Taking both limits simultaneously — scaling parameters to infinity and ensemble count to infinity with jointly tuned hyperparameters:

$$\lim_{N \to \infty} \lim_{K \to \infty} \min_H \mathcal{L}(\mathcal{E}_\mathcal{A}(D, N, K, H))$$

This achieves an asymptote of **3.17 loss** at 200M tokens.

**Data efficiency summary** (all at 200M tokens):

| Recipe | Asymptote | Data efficiency vs. standard |
|---|---|---|
| Standard (unregularized) | — | 1× (baseline) |
| Regularized, single model | 3.43 | 2.29× |
| Ensemble + ensemble-tuned HPs | 3.27 | ~3.5× |
| Joint (parameter + ensemble) | 3.17 | **5.17×** |

### Step 5: Data Scaling Laws

The authors fit scaling laws across token counts $D \in \{200\text{M}, 400\text{M}, 800\text{M}, 1.6\text{B}\}$:

$$\hat{\mathcal{L}}_D = \frac{A}{D^\alpha} + E$$

All recipes (standard and improved) follow similar data scaling exponents ($\alpha \approx 0.23$–$0.24$) and asymptotes ($E \approx 1.89$–$1.96$), suggesting the efficiency gains from regularization and ensembling persist as data scales.

### Step 6: Distillation

Ensemble inference is expensive. The paper tests two distillation approaches:

- **Ensemble distillation**: Teacher is 8×300M ensemble (loss 3.32). Student is a single 300M model trained on teacher soft labels. Result: loss **3.36** — retains 83% of the ensemble benefit at $8\times$ lower inference cost. Importantly, this beats the regularized single-model asymptote (3.43).
- **Self-distillation**: Teacher is a single 300M model. Student is a fresh model trained on a mix of real and synthetic tokens. Result: student matches the regularized asymptote (3.43). Interpreted as implicit ensembling via teacher-student diversity (Allen-Zhu & Li 2023).

---

## Experimental Setup

- **Corpus:** 200M tokens from DCLM web data (primary); scales up to 1.6B tokens for data scaling experiments.
- **Architecture:** Llama-style, context length 4096, AdamW optimizer, cosine LR schedule.
- **Parameter counts:** 150M, 300M, 600M, 1.4B.
- **Ensemble sizes $K$:** 1, 2, 4, 8.
- **Evaluation:** Held-out i.i.d. validation loss (primary); downstream benchmarks PIQA, SciQ, ARC Easy; continued pre-training on MegaMath-Web-Pro.
- **Hyperparameter search:** Coordinate descent per (parameter count, ensemble count) combination.

---

## Results

**Pretraining loss (200M tokens, 300M params baseline):**
- Standard recipe: overfits with multi-epoch, near-flat with parameter scaling.
- Regularized single model: loss asymptote 3.43.
- Best joint recipe: loss asymptote 3.17 (5.17× data efficiency).

**Downstream benchmarks (Figure 10):**
- Best regularized ensemble: +9% accuracy vs. standard on PIQA/SciQ/ARC Easy.
- Best distilled model: +7% accuracy vs. standard.

**Continued pre-training on math (Table 1, Llama 3.2 3B + MegaMath):**

| Method | Tokens | GSM8K | MATH | MathQA | Avg |
|---|---|---|---|---|---|
| CPT default | 73B | 49.51 | 23.40 | 44.79 | 39.23 |
| CPT $K=8$ ensemble | 4B | 52.99 | 23.50 | 45.26 | 40.58 |

The ensemble on 4B tokens outperforms the default recipe on 73B tokens: **17.5× data efficiency** in the continued pre-training setting.

---

## Limitations & Caveats

- **Scale range**: primary results at 200M tokens; data scaling experiments extend to 1.6B but fitting noise is acknowledged. Extrapolation to GPT-4-scale data is speculative.
- **Architecture**: Llama-style only. Generalization to other architectures (e.g., mixture-of-experts, state space models) is not explored.
- **Tiered limit-taking**: the joint asymptote is computed as $\lim_N \lim_K$, not $\lim_{N,K}$ simultaneously. The paper notes alternative orderings are discussed in Appendix C.4 but the primary result uses this specific order.
- **Hyperparameter sensitivity**: asymptote estimates vary $\pm 0.02$ loss across seeds (Appendix H.1), which is small but non-trivial relative to the improvement margins.
- **Classical techniques not exhaustively explored**: dropout, layer normalization variants, data augmentation — the paper identifies these as open directions.
- **Distillation methods**: sequence-level distillation was used; the paper notes logit-based methods may be superior.
- The ensemble inference cost (K=8) is impractical for deployment at scale, though distillation partially addresses this.

---

## Why It Matters / Implications

This paper directly reframes the ML engineer's optimization problem for an increasingly common real-world scenario: you have a domain-specific corpus of limited size (medical records, code, legal documents) and can afford significant compute. Standard wisdom says "compute-optimal" means Chinchilla ratio — but that recipe was designed for the compute-constrained case.

Practical takeaways:

1. **Dramatically increase weight decay when training data-constrained models.** The default $0.1$ is wrong by an order of magnitude in this regime. Tune weight decay per model size.
2. **Train multiple smaller models and ensemble them** rather than training one larger model. Two 300M models > one 600M model on 200M tokens.
3. **Use asymptotic loss as a yardstick** when evaluating new training recipes in data-constrained settings. A recipe that looks good at a single compute point may not be best asymptotically.
4. **Ensemble then distill** for deployment: the gap to a pure ensemble is small (83% benefit retained), and you get single-model inference cost.
5. **BabyLM and data-constrained benchmarks** (as Rafael notes) are an excellent testbed for these ideas. The setup here (200M tokens, unlimited compute) is structurally identical to BabyLM constraints.

---

## Related Work Context

| Work | Focus | Relationship |
|---|---|---|
| Kaplan et al. (2020) | Compute-optimal scaling | This paper targets the orthogonal data-constrained axis |
| Hoffmann et al. / Chinchilla (2022) | Compute-optimal token/parameter ratio | Baseline this paper supersedes in data-constrained settings |
| Muennighoff et al. (2023) | Repeated token scaling | Excluded overfitting cases; this paper addresses them directly via regularization |
| Allen-Zhu & Li (2023) | Theory of ensemble/distillation | Provides theoretical backing for self-distillation mechanism |
| BabyLM (Warstadt et al., ongoing) | Data-constrained LM training | Same structural problem; this paper's recipes are directly applicable |

The paper's approach of combining classical techniques (heavy regularization, ensembling) with modern scaling law analysis is the key move. The insight that these techniques look weak individually but shine asymptotically recasts them as under-explored tools for the data-constrained era.

---

## Notes on Rafael's Journal

Rafael's notes are broadly accurate. One precision point: the notes say the recipe "monotonically decreases loss following a clean power law" — this is correct for the regularized recipe, but the unregularized baseline does *not* follow a monotonic power law (it overfits). Rafael's note "ensembling has a much lower asymptote than regularized model scaling" is confirmed by the numbers: 3.27 (ensemble-tuned) vs. 3.43 (single regularized model). The note about re-thinking the stack from classical DL is accurate — the paper explicitly frames this as a revival of dropout-era regularization and ensemble techniques.

Rafael's BabyLM observation is well-placed: the 200M token fixed-data setting is structurally identical, and the paper's regularization tuning and ensemble strategies would translate directly.
