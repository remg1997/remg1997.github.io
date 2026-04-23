# RAIN-Merging: A Gradient-Free Method to Enhance Instruction Following in Large Reasoning Models with Preserved Thinking Format

**Authors:** Zhehao Huang, Yuhang Liu, Baijiong Lin, Yixin Lou, Zhengbao He, Hanling Tian, Tao Li, Xiaolin Huang
**Affiliations:** Shanghai Jiao Tong University; HKUST (Guangzhou); MoE Key Lab of System Control and Information Processing (Shanghai)
**Venue / Year:** ICLR 2026 (Oral)
**arXiv:** 2602.22538v1 (submitted 26 Feb 2026)
**Source:** https://arxiv.org/abs/2602.22538
**Local copy:** papers/rain-merging.pdf
**Code:** https://github.com/Klnght/RAIN-Merging

---

## TL;DR

Large reasoning models (e.g., DeepSeek-R1 distillates) excel at multi-step reasoning but chronically fail to follow output format and constraint instructions. RAIN-Merging merges an instruction-tuned model (ITM) into the LRM via task-vector arithmetic, but does so with two targeted corrections: (1) it projects the ITM task vector onto the null space of thinking-token forward features, preserving the LRM's structured `<think>...</think>` format; and (2) it re-scales the projected vector per-module using attention statistics that amplify instruction-relevant components and suppress leakage. The entire procedure is gradient-free, requires only ~500 calibration examples, and runs in about 21 minutes for a 7B model — while improving instruction adherence by substantial margins without sacrificing reasoning quality.

---

## Problem & Motivation

Large reasoning models (OpenAI-o1, DeepSeek-R1) produce elaborate thinking traces but routinely ignore format constraints, length limits, and structural requirements in the response (Fu et al., 2025a; Li et al., 2025a). The failure is structural: LRMs separate reasoning from answering using special tokens (`<think>`, `</think>`), whereas ITMs produce answers-only, so naive parameter merging disrupts the thinking-format boundary. The straightforward fix — SFT on instruction-following data — is expensive (large labeled datasets, long training, capability regression risk). Model merging is cheap, but:

- **Data-free merging** (Task Arithmetic, SLERP, TIES, DARE) prunes or scales task vectors from parameter statistics alone, ignoring the output-distribution mismatch between LRM and ITM formats.
- **Data-dependent but gradient-free merging** (ACM, LEWIS, AIM) uses forward activations but lacks an explicit mechanism to protect thinking format, so they still corrupt structured outputs.

RAIN-Merging's diagnosis (Section 2): the LRM's thinking format is encoded in forward features at thinking special-token positions. Any parameter perturbation that alters these features will break the format. The solution is to project the ITM perturbation into the null space of those features before applying it.

---

## Key Contributions

- **Reasoning-aware Null-space Projection (Stage 1):** Projects each submodule's ITM task vector onto the orthogonal complement of the thinking-token forward feature space, guaranteeing that the merged model's intermediate representations at `<think>`/`</think>` positions are unchanged.
- **Instruction-attention Guided Merging Coefficients (Stage 2):** Derives per-head, per-module scaling coefficients via a forward-pass quadratic approximation that maximizes instruction-attention alignment (attention mass on instruction tokens in the response) while minimizing leakage (attention to unrelated tokens).
- **End-to-end gradient-free pipeline:** The full method only requires two small calibration sets (~150 reasoning examples, ~365 instruction examples), forward passes, and closed-form optimization.
- **Theoretical grounding (Proposition 1):** A second-order expansion of softmax KL divergence shows that the null-space projection keeps the KL on thinking-token output distributions bounded by $O(\|\Delta_I^\perp\|_2^2) \approx 0$.

---

## Method

### Notation and Setup (Section 3)

Let $\theta_R$ be the LRM parameters, $\theta_I$ the ITM parameters, and $\theta_B$ the shared base model. Define task vectors $\Delta_R = \theta_R - \theta_B$ and $\Delta_I = \theta_I - \theta_B$. The goal is to find a merged model $\theta_\star = \theta_R + \Delta$ (starting from the LRM as anchor) that maximizes instruction-following surrogate $\mathcal{J}_I$ subject to:

$$\mathcal{L}_\text{think}(\theta) \leq \delta, \tag{3}$$

where $\mathcal{L}_\text{think}(\theta)$ is the per-step KL divergence between the merged model and $\theta_R$ at thinking special-token positions $\Omega_\text{think}$.

Parameters are flattened per-submodule via the Kronecker-vectorization form $W^k h^k = \Phi^k_{\{t\}} \text{vec}(W^k)$ (Eq. 1), where $\Phi^k_{\{t\}}$ is the forward feature operator built from input activations at sampled token positions $t$.

### Stage 1 — Reasoning-aware Null-space Projection (Eqs. 4–8)

For each submodule $k$, construct the orthogonal projector onto the null space of the thinking-token forward features:

$$P^\perp(\Phi^k_{\Omega_\text{think}}) = \text{diag}(1) - \Phi^k_{\Omega_\text{think}}{}^\top \!\left(\Phi^k_{\Omega_\text{think}} \Phi^k_{\Omega_\text{think}}{}^\top\right)^+ \Phi^k_{\Omega_\text{think}}, \tag{4}$$

then project the ITM task vector:

$$\text{vec}(\Delta_I^{\perp,k}) = P^\perp(\Phi^k_{\Omega_\text{think}})\, \text{vec}(\Delta_I^k). \tag{5}$$

Stacking across submodules gives $\Delta_I^\perp = \bigoplus_{k=1}^K \Delta_I^{\perp,k}$, and by construction $\Phi_{\Omega_\text{think}} \text{vec}(\Delta_I^\perp) = 0$ — the forward features at thinking positions are unaffected.

This projection approximately removes the thinking-format constraint from the optimization problem, reducing it to (Eq. 9):

$$\max_{\Delta^\perp} \mathcal{J}_I(\theta_R + \Delta^\perp), \quad \Delta^\perp = f(\Delta_I^\perp).$$

### Stage 2 — Instruction-attention Guided Merging Coefficients (Eqs. 10–16)

Introduce per-module scaling coefficients $\alpha = \{\alpha^k\} \in \mathbb{R}_+^K$ so the merged model is $\theta = \theta_R + \sum_{k=1}^K \alpha^k \Delta_I^{\perp,k}$.

For each attention head $\bar{k}$, define per-sample:
- **Alignment** $a^{\bar{k}}(x, \bar{\alpha})$: normalized attention mass from output response tokens $\mathcal{R}(x)$ to instruction input tokens $\mathcal{I}(x)$ (Eq. 10, first term).
- **Leakage** $u^{\bar{k}}(x, \bar{\alpha})$: normalized attention mass to unrelated output tokens $\mathcal{U}(x)$ (Eq. 10, second term).

The instruction-attention proxy objective to maximize is (Eq. 11):

$$\mathcal{J}_I^\text{Proxy}(\bar{\alpha}) := \bar{a}(\bar{\alpha}) - \rho\, \bar{u}(\bar{\alpha}),$$

where $\rho > 0$ is a trade-off hyperparameter.

**Quadratic approximation (Eqs. 12–15):** Expand $\mathcal{J}_I^\text{Proxy}$ around the direct-merge point $\bar{\alpha}_{(0)} = \mathbf{1}$ to second order. The first-order gradient is estimated from current alignment/leakage metric values:

$$g^{\bar{k}} \approx \mathbb{E}_{x \sim \mathcal{D}_I}\!\left[a^{\bar{k}}(x, \bar{\alpha}_{(0)}) - \rho\, u^{\bar{k}}(x, \bar{\alpha}_{(0)})\right]. \tag{14}$$

The Hessian is approximated diagonally as $\tilde{H}^{\bar{k}} = \text{diag}(1) + \mathbb{E}[u^{\bar{k}}(x, \bar{\alpha}_{(0)})]$ (penalizes heads with high leakage more strongly). This yields the closed-form optimal per-head coefficient:

$$\alpha_\star^{\bar{k}} = \text{clip}_{[\bar{\alpha}_l, \bar{\alpha}_u]}\!\left(\frac{g^{\bar{k}}}{\tilde{H}^{\bar{k}}}\right). \tag{15}$$

FFN modules use the layer-wise average of attention head coefficients.

### Final Merged Model (Eq. 16)

$$\theta_\star = \theta_R + \lambda \bigoplus_{k=1}^K \alpha_\star^k \Delta_I^{\perp,k},$$

where $\lambda$ is a global merging strength hyperparameter.

### Calibration Data (Section 4 / Implementation Details)

- **Stage 1 (reasoning calibration):** 150 examples from Mixture-of-Thoughts dataset (Face, 2025), distilled from DeepSeek-R1.
- **Stage 2 (instruction calibration):** 365 samples, obtained by distilling DeepSeek-R1 on IFEval, filtered with LLaMA-as-Judge and manual screening.
- **Modules merged:** Q, K, V, O (attention), and FFN Up/Gate/Down parameters — for compute and storage efficiency, only core modules.

---

## Experimental Setup

**Instruction-following benchmarks (4):** IFEval (format/constraint accuracy), CELLO (compositional instruction), InfoBench (diverse instruction following), ComplexBench (complex instructions).

**Reasoning & general benchmarks (9):** Math (aggregated from 6 datasets), GPQA (science), Aider (code editing), Arena-Hard-v2 (open-ended generation), plus agentic: ALFWorld and WebShop.

**Models evaluated:**
- DeepSeek-R1-Distill-Qwen-1.5B/7B/14B/32B (LRM) merged with Qwen2.5-1.5B/7B/14B/32B-Instruct (ITM)
- DeepSeek-R1-Distill-Llama-8B (LRM) merged with Llama-3.1-8B-Instruct (ITM)

**Baselines:**
- *Data-free:* Task Arithmetic, SLERP, Karcher, TIES, DARE-TIES
- *Data-dependent:* ACM-TIES, LEWIS-TIES, AIM-TIES
- *Training baseline:* SFT on the same 365 instruction calibration examples

---

## Results

### Main comparison — Qwen-7B (Table 1)

Merging Qwen2.5-7B-Instruct into DeepSeek-R1-Distill-Qwen-7B:

| Method | IF Avg. | R Avg. | RT (min) |
|---|---|---|---|
| LRM (baseline) | 44.12 | 51.03 | — |
| ITM (baseline) | 45.96 | 43.32 | — |
| SFT | 45.08 | 49.51 | 120.32 |
| Task Arithmetic | 45.96 | 49.59 | 0.93 |
| DARE-TIES | 46.38 | 51.51 | 2.21 |
| AIM-TIES | 47.02 | 53.10 | 18.51 |
| **RAIN-Merging** | **48.11** | **55.59** | **20.96** |

RAIN-Merging achieves the best instruction-following average (48.11) and the best reasoning average (55.59) among all methods, including SFT — while training takes 120 minutes vs. 21 minutes for RAIN-Merging. Notably, RAIN-Merging also **improves reasoning above the unmerged LRM** (55.59 vs. 51.03), while SFT degrades it slightly (49.51). The paper hypothesizes that stronger instruction adherence improves the quality of internal chain-of-thought reasoning, which in turn benefits final answer quality.

### Scalability (Table 2)

Consistent gains across all four model sizes/architectures tested:

| Configuration | IF relative gain | R relative gain |
|---|---|---|
| Qwen2.5-1.5B | +6.09% | +8.20% |
| Llama-3.1-8B | +5.86% | +7.78% |
| Qwen2.5-14B | +6.11% | (varies) |
| Qwen2.5-32B | +1.57% | +3.83% |

Relative instruction-following improvements range from 1.57% (32B) to 8.20% (1.5B), with reasoning gains in the same range.

### Agentic scenarios (Table 3)

Merging Qwen2.5-7B-Instruct into DeepSeek-R1-Distill-Qwen-7B:

| Model | ALFWorld | WebShop |
|---|---|---|
| ITM | 17.50 | 10.45 |
| LRM | 22.00 | 26.63 |
| RAIN-Merging | 25.00 | 29.42 |

RAIN-Merging outperforms both the ITM and the LRM on both agentic tasks.

### Thinking format preservation (Figure 5)

Task Arithmetic: $\mathcal{L}_\text{think} = 0.1224$, 6.4% of generations missing `</think>` token.
RAIN-Merging: $\mathcal{L}_\text{think} = 0.0065$, 0.0% missing `</think>` token.

### Ablation of two stages (Table 4)

- Without Stage 2 (null-space projection only): IF Avg. 46.58, R Avg. 54.92
- Without Stage 1 (instruction-attention only): IF Avg. 47.62, R Avg. 52.44
- Full RAIN-Merging: IF Avg. 48.11, R Avg. 55.59

Both stages are necessary; Stage 1 protects reasoning, Stage 2 boosts instruction following; they are complementary.

### Joint reasoning + instruction following — MathIF (Table 5)

Both correct and format-compliant ("Both Acc."):
- LRM: 12.62%
- ITM: 19.76%
- RAIN-Merging: 20.48% (+62.26% relative over LRM)

Math accuracy (content only): LRM 40.95%, RAIN-Merging 41.72% — essentially unchanged, confirming reasoning is preserved.

### Memory efficiency (Figure 4)

GPU memory for 7B model (in GB):
- ACM-TIES: 16.7 | LEWIS-TIES: 16.8 | AIM-TIES: 18.2 | RAIN-Merging: 22.1 | SFT: 112.6

RAIN-Merging stores hidden states for the calibration set, so it uses modestly more memory than simpler merging methods, but is 5x more memory-efficient than SFT.

---

## Limitations & Caveats

- **Calibration set dependency:** Although small (~500 examples total), the quality and coverage of the two calibration sets matters. The instruction calibration set was constructed by distilling DeepSeek-R1 on IFEval specifically — it is not clear how well the coefficients generalize to out-of-distribution instruction types.
- **Stage 1 pseudo-inverse cost:** Computing the Moore-Penrose pseudoinverse for the null-space projector per submodule scales with the number of modules and the size of the feature matrix; for very large models (>30B), this could become expensive.
- **Global scaling $\lambda$:** The merging strength $\lambda$ is a hyperparameter not optimized by the method itself; the paper does not detail its sensitivity or how to choose it without a dev set.
- **Evaluated only on R1-distilled LRMs:** All experiments use DeepSeek-R1 distillates. Whether the method transfers to other LRM families (e.g., Qwen-QwQ, Kimi-k1.5) is not validated.
- **Gains shrink at larger scale (32B):** Instruction-following gain drops to +1.57% average at 32B vs. +6–8% at smaller scales; the reason is not analyzed.
- **No evaluation on extremely long reasoning tasks:** The paper evaluates standard benchmarks but not scenarios where the thinking chain is very long (e.g., competitive math olympiad chains of hundreds of steps).

---

## Why It Matters / Implications

**For LRM deployment:** The persistent gap between reasoning ability and instruction adherence is a real blocker for production agentic systems. RAIN-Merging offers a training-free path to close this gap in under 30 minutes, compatible with any LRM/ITM pair sharing a base model.

**Engineering practicality:** The method requires only forward passes (no backward passes, no optimizer state), 500 labeled calibration examples, and 22 GB GPU memory at 7B scale — all well within standard inference infrastructure. This makes it a plug-in upgrade to an existing LRM deployment.

**Conceptual insight — null-space projection for format preservation:** The idea of projecting parameter perturbations onto the null space of a behavior-critical activation subspace is broadly applicable. Any scenario where two fine-tunes share a base model but differ in structured output format (e.g., chain-of-thought vs. direct answer, code vs. prose) could benefit from this technique.

**Attention as a surrogate for capability alignment:** Using attention mass on instruction-relevant tokens as a proxy for instruction-following quality — without training — is a practically powerful signal. This connects to interpretability work on attention as a routing mechanism.

**The reasoning improvement puzzle:** The observation that merging an ITM into an LRM can *improve* reasoning performance (not just preserve it) is striking. The paper's hypothesis — that better instruction following leads to tighter reasoning chains — is plausible and worth tracking in follow-up work.

---

## Related Work Context

| Prior work | How RAIN-Merging differs |
|---|---|
| Task Arithmetic (Ilharco et al., 2023) | Linear addition of task vectors; no protection for thinking format; damages structured outputs |
| TIES / DARE-TIES (Yadav et al., 2023; Yu et al., 2024) | Prune + merge from parameter statistics; same format-preservation gap |
| SLERP / Karcher | Interpolation-based; no data-informed weighting |
| ACM (Yao et al., 2025) | Uses activation statistics but no explicit null-space constraint; still shifts thinking distributions |
| LEWIS (Chopra et al., 2025) | Layer-wise importance weighting; gradient-free but no format constraint |
| AIM (Nobari et al., 2025) | Most similar: activation-guided merging; lacks null-space projection for thinking tokens; 18 min runtime vs. 21 min |
| REPLUG / Atlas | Retrieval-focused; not directly comparable, different problem |

The null-space projection idea draws from weight-space geometry literature (Wang et al., 2021), and the attention-guided coefficient estimation is related to recent interpretability work on instruction following (Guardieiro et al., 2025).

---

## Notes on Rafael's Journal

Rafael's notes (journal entry "5. RAIN-Merging") capture the core setup well: orthogonal task vectors, direct merging breaks thinking format, two-stage fix. One precision note: Rafael wrote "Observation 1: It seems like the LRM and the ITM model have orthogonal parameters" — more precisely, their *principal subspaces* are nearly orthogonal (cosine similarity < 0.1 across all layers and modules per Figure 2), not the full parameter vectors. This is an important distinction because the near-orthogonality of subspaces motivates the lightweight merging approach but does not alone guarantee format preservation — which is why Stage 1 is needed. No substantive factual discrepancies in Rafael's notes, though the notes are sparse on the Stage 2 mechanism (the attention-alignment objective and its quadratic approximation are not mentioned).
