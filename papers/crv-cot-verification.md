# Verifying Chain-of-Thought Reasoning via Its Computational Graph

**Authors:** Zheng Zhao, Yeskendir Koishekenov, Xianjun Yang, Naila Murray, Nicola Cancedda
**Affiliations:** FAIR at Meta; Meta Superintelligence Labs; University of Edinburgh
**Venue / Year:** ICLR 2026 (Oral)
**arXiv:** 2510.09312v2
**Code:** https://github.com/facebookresearch/CRV
**Local copy:** `papers/crv-cot-verification.pdf`

---

## TL;DR

CRV (Circuit-based Reasoning Verification) is a white-box method for detecting incorrect CoT reasoning steps by analyzing the structural properties of the *attribution graph* — a sparse computational graph extracted from a modified, interpretable version of the LLM. Correct and incorrect reasoning steps leave distinct structural fingerprints on this graph, enabling a gradient-boosted classifier to predict step correctness with AUROC 92.47 on synthetic arithmetic (vs. 76.45 for the best baseline). Beyond detection, CRV's diagnostic power extends to causal intervention: suppressing a single identified transcoder feature corrects a faulty arithmetic reasoning step, providing mechanistic evidence that these structural signatures are causally implicated in errors.

---

## Problem & Motivation

Chain-of-Thought reasoning is now central to frontier LLM performance, yet CoT traces are sometimes unfaithful or incorrect — even when the final answer is right. Existing verification approaches fall into two categories:

- **Black-box methods** (MaxProb, Perplexity, Entropy, Temperature Scaling, Energy score): operate on the final logit distribution. They have no access to *why* a computation failed.
- **Gray-box methods** (Chain-of-Embedding CoE-R/CoE-C, CoT-Kinetics, LR/MLP probes on hidden states): use raw activations or trajectory dynamics. They can detect correlations between internal states and errors but cannot explain the computational mechanism.

The paper's central hypothesis is that reasoning failures are not merely bad outputs — they are flaws in the execution of latent algorithms. These flaws should manifest as *structural anomalies* in the computational graph that produced the reasoning step. This motivates a mechanistic, white-box approach grounded in the circuits framework from mechanistic interpretability (Olah et al., 2020; Elhage et al., 2021).

---

## Key Contributions

- Introduction of CRV: the first method to operationalize attribution graphs for automated step-level reasoning verification.
- Empirical demonstration that structural graph signatures are predictive of reasoning errors, with AUROC 92.47 on Synthetic (Arithmetic) vs. best baseline 76.45 (Table 1).
- Finding that error signatures are **highly domain-specific**: a classifier trained on arithmetic data transfers poorly to boolean logic and vice versa (Table 2), revealing that different reasoning tasks fail through distinct computational patterns.
- Causal intervention proof-of-concept: suppressing a single transcoder feature identified by CRV corrects a faulty order-of-operations step (Table 4).
- Release of step-level correctness datasets for Boolean, Arithmetic, and GSM8K CoT reasoning, along with trained transcoders.

---

## Method

CRV is a four-stage pipeline applied to a modified, interpretable version of the target LLM (Figure 1).

### Stage 1: Replacing MLPs with Interpretable Transcoders (Section 3.2.1)

The foundation is replacing each MLP module in the LLM with a *transcoder* (Dunefsky et al., 2025) — a functional substitute trained to approximate the MLP's input-output mapping via a sparse, overcomplete basis. The transcoder architecture is a simple autoencoder with a single hidden layer and ReLU activation. Its training objective combines L2 reconstruction loss with a TopK activation function that enforces sparsity by preserving only the $k = 128$ largest feature activations.

For each MLP layer in Llama 3.1 8B Instruct, a per-layer transcoder (PLT) is trained on a 10B token subset of the RedPajama-V2 dataset, with latent dimension 131,072 (overcomplete by factor ~32 relative to the MLP hidden dimension of 4096). Training: 4 epochs, AdamW lr=7e-5, 8 × H100, batch size 4096, convergence at ~4000 steps. The original MLP is replaced with the trained transcoder for all subsequent analysis; dead neuron revival is applied if a feature has not activated in 10M tokens (auxiliary loss coefficient 1/32).

The forward pass of the modified model is now:

$$\text{MLP}(x) \approx \text{Transcoder}(x) = \sum_{k \in \text{TopK}} f_k(x) \cdot d_k$$

where $f_k(x)$ are sparse scalar feature activations and $d_k$ are decoder directions. This makes the computation interpretable: each intermediate feature has a semantic meaning that can be inspected.

### Stage 2: Constructing Step-Level Attribution Graphs (Section 3.2.2)

For each CoT step $s_i$, a sparse weighted directed attribution graph $G_i = (\mathcal{V}, \mathcal{E})$ is constructed by adapting the greedy path-finding algorithm of Dunefsky et al. (2025) (implementation from Hanna et al., 2025).

- **Nodes** $\mathcal{V}$: disjoint union of input tokens, active transcoder features (from all layers), and output logits.
- **Edges** $\mathcal{E}$: directed causal pathways from final logits backward through the network, weighted by attribution strength (contribution to logit probability).

The algorithm traces high-attribution connections from the final logits back to input tokens, yielding the *core computational subgraph* for that reasoning step. This graph represents the execution trace of the latent reasoning algorithm.

### Stage 3: Extracting Interpretable Graph Features (Section 3.2.3)

The graph is pruned to retain nodes and edges accounting for a threshold (e.g., 80%) of total influence to the final logits. A fixed-size feature vector $\mathbf{x}_i = \phi(G_i)$ is extracted from the pruned graph across three hierarchical families:

**Global Graph Statistics:** Count of active feature nodes, final logit probability, entropy. Coarse measure of computational complexity and uncertainty.

**Node Influence and Activation Statistics:** Mean, max, std of activation values and influence scores; histogram of active features by layer. Distinguishes computations driven by a few highly active features from diffuse computations.

**Topological and Path-Based Features:** Graph density, degree/betweenness centrality measures, connectivity metrics. Characterizes information flow structure and computational hubs.

### Stage 4: Diagnostic Classifier (Section 3.2.4)

A Gradient Boosting Classifier (GBC) $f_\theta(\mathbf{x}_i) = \hat{y}_i \in \{\text{correct}, \text{incorrect}\}$ is trained on the extracted feature vectors. GBC is chosen for its robustness on heterogeneous tabular features and its ability to provide feature importance scores for interpretability. Alternative classifiers are benchmarked in Appendix C.4.

### Dataset Construction (Section 3.1)

A critical requirement for CRV is step-level correctness labels on the *same model* whose computation is being analyzed (Llama 3.1 8B Instruct). Existing datasets (PRM800K, REVEAL) provide text-only labels incompatible with this white-box requirement.

**Synthetic (Boolean):** 126,624 steps, 99.8% correct. Boolean expression evaluation with operators {and, or, not}, operands {True, False}, complexity $n \in \{3,5,7,10\}$ operators. Labeling: intersection of LLM-as-a-Judge (Llama 3.3 70B Instruct) and programmatic state verification.

**Synthetic (Arithmetic):** 155,434 steps, 98.8% correct. Multi-step arithmetic with single-digit integers and operators $\{+, -, \times\}$, same complexity range. Same dual-annotation protocol.

**GSM8K:** 8,737 steps, 93.4% correct. Official test split; LLM-as-a-Judge only (programmatic verification not applicable to natural language). Human validation: inter-annotator Cohen's $\kappa = 0.42$ (87.3% agreement); human-to-LLM-judge $\kappa = 0.26$ (84.1% agreement).

A strict truncation policy is applied: for any CoT trace, only steps up to and including the *first* incorrect step are retained; subsequent steps are discarded (Appendix A.4). This avoids ambiguity from error propagation.

---

## Experimental Setup

**Target model:** Llama 3.1 8B Instruct (instruction-tuned for reliable CoT elicitation).

**Baselines:**
- Black-box: MaxProb, PPL, Entropy, Temperature Scaling (Shih et al., 2023), Energy (Liu et al., 2020)
- Gray-box: CoE-R, CoE-C (Wang et al., 2025a), CoT-Kinetics (Bi et al., 2025), LR Probe, MLP Probe (both trained on average hidden states)

**Metrics:** AUROC (ranking quality), AUPR (precision-recall for the minority incorrect class), FPR@95 (false positive rate when 95% of true positives are detected — lower is better). Incorrect steps treated as the positive class throughout.

**Cross-domain evaluation (Table 2):** CRV classifiers are trained on each dataset individually, then evaluated zero-shot on the other two datasets and on the union.

---

## Results

### Verification Performance (Table 1)

CRV consistently outperforms all black-box and gray-box baselines:

| Dataset | CRV AUROC | Best Baseline AUROC | CRV FPR@95 | Best Baseline FPR@95 |
|---|---|---|---|---|
| Synthetic (Boolean) | **75.87** | 58.81 (MaxProb) | **79.17** | 91.02 (LR Probe) |
| Synthetic (Arithmetic) | **92.47** | 76.45 (Energy) | **37.09** | 63.33 (CoE-C) |
| GSM8K | **70.17** | 62.55 (Energy) | **79.61** | 86.34 (MaxProb) |

On Arithmetic, CRV achieves AUROC 92.47 vs. 76.45 (+16 points), and FPR@95 of 37.09% vs. 63.33% (-26 points). This means CRV can identify 95% of incorrect arithmetic steps while raising a false alarm on only 37% of correct steps, vs. 63% for the best baseline.

**Robustness to difficulty (Figure 2):** CRV maintains a consistent advantage across arithmetic complexity levels ($n \in \{5, 7, 10\}$ operators). Most methods' AUROC is stable but CRV's absolute lead is preserved.

### Feature Ablation (Table 3, Arithmetic)

Leave-one-out ablation on the three feature families:
- Without Node Influence & Activation Stats: AUROC drops from 92.47 to 88.31, FPR@95 rises from 37.09 to 49.07 (+12 points).
- Without Global Stats: AUROC drops to 89.62, FPR@95 to 44.54.
- Without Topological Stats: smallest drop (AUROC 90.89), suggesting local node statistics dominate over global graph structure.

### Cross-Domain Generalization (Table 2)

CRV trained on Arithmetic and tested on Boolean achieves AUROC 69.59 — above the MaxProb baseline of 58.81 for Boolean but well below the in-domain CRV of 75.87. The Combined (trained on union) model achieves AUROC 61.58 on Boolean and 90.51 on Arithmetic, matching the specialist on Arithmetic while improving over out-of-domain transfer on Boolean.

Critically, a CRV model trained on Arithmetic and tested on GSM8K achieves only AUROC 57.04 — *below* the Energy baseline of 62.55. This domain specificity is a key scientific finding: boolean logic errors and arithmetic errors leave structurally different patterns in the computational graph.

### Structural Fingerprints (Figure 4)

Distributions of five graph features (Total Active Features, Mean Node Influence, Pruned Feature Node Count, Mean Edge Weights, Graph Density) are statistically significantly different between correct and incorrect GSM8K steps (independent t-test, $p < 0.001$, medium-to-large effect sizes, Cohen's $d$ ranging from 0.329 to 0.855).

PCA of the full feature vectors (Figure 3) shows that incorrect steps form a *dense subset within* the correct step distribution — "near misses" — rather than a cleanly separable cluster. CRV learns the boundary of the *zone of computational integrity* rather than separating two simple clusters.

### Causal Intervention (Section 4.4, Table 4)

For the expression `7 * ((5+9) + 7)`, the model incorrectly computes Step 2 as `7 * 14 = 98` (applying multiplication before completing addition). CRV flags Step 2 as incorrect and traces the signal to transcoder feature ID 91814 (a late-layer feature strongly associated with multiplication).

Direct intervention: the generation is re-run up to the point of failure; a forward hook clamps feature 91814's activation to zero. Result: the model correctly generates `14 + 7 = 21` and proceeds to the correct final answer (147 vs. the erroneous 105). A complementary experiment corrects an error by *amplifying* an under-active feature (Appendix C.5), providing bidirectional causal evidence.

---

## Limitations & Caveats

- **Model-specific pipeline.** Transcoders must be trained per-model (4 epochs on 10B tokens, 8 × H100). CRV's verification is tied to the specific model it was trained on; it cannot be applied off-the-shelf to a new model without transcoder training.
- **Domain-specific error signatures.** The cross-domain results show limited zero-shot transfer between tasks. A CRV verifier for production use would require training data from each target reasoning domain.
- **Computationally intensive inference.** Attribution graph construction requires a full forward pass through the transcoder-modified model plus the greedy path-finding algorithm. This is too expensive to be a drop-in inference-time verifier; the paper frames CRV as a scientific instrument and debugging tool rather than a practical production verifier.
- **Evaluated on standard instruction-tuned models.** Modern reasoning models (DeepSeek-R1, o1) use search and backtracking, whose convoluted traces may obscure the simple step-level circuit analysis. The paper deliberately focuses on standard autoregressive CoT to study primitive computations.
- **Step-level annotation at scale is hard.** The Boolean and Arithmetic datasets achieve high label quality through dual annotation (LLM-judge + programmatic verifier), but this protocol is expensive to replicate for arbitrary domains.
- **Class imbalance.** Boolean steps are 99.8% correct (only 0.2% incorrect), which depresses AUPR and makes AUROC less informative. This is an inherent property of CoT datasets where models are generally competent.

---

## Why It Matters / Implications

CRV represents a qualitative shift in how we think about CoT verification — from output-level statistics to mechanistic analysis of the computation that produced the output. Its three main insights are actionable:

1. **Verification is feasible at the circuit level.** Structural graph features from attribution graphs are more predictive of step correctness than any black-box or gray-box baseline tested, establishing that the circuits framework is not merely descriptive but has practical verification utility.

2. **Error signatures are domain-specific.** This is a scientific finding with implications for how we build multi-task verifiers: a single classifier cannot cover all reasoning domains, but a combined-domain training regime partially bridges the gap.

3. **Diagnosis enables prescription.** The causal intervention results suggest that CRV-style analysis could serve as a foundation for *targeted model repair* — not just flagging errors but identifying and suppressing the specific computational feature causing them. This is a step toward white-box debugging of LLM reasoning at inference time.

For practitioners building process reward models or verifiers, CRV shows that the internal computational structure contains more signal than the hidden states alone. The practical bottleneck is transcoder training cost (~4 epochs, 10B tokens) and attribution graph construction at inference, which makes CRV most useful as a development-time debugging tool rather than a production serving component.

---

## Related Work Context

- **Process Reward Models (PRMs):** Lightman et al. (2024) and Wang et al. (2024) train PRMs on text features to assess step-level correctness. CRV differs by operating on the computational graph rather than the text, providing structural rather than semantic verification.
- **Sparse Autoencoders / Transcoders:** Cunningham et al. (2023) introduced SAEs for interpretable feature decomposition. Dunefsky et al. (2025) extended this to transcoders as functional MLP substitutes. CRV is the first work to use transcoders for automated verification rather than qualitative interpretation.
- **Attribution graphs:** Ameisen et al. (2025) introduced attribution graphs for visualizing computational flow in LLMs. CRV operationalizes this visualization into a quantitative, automated classification task.
- **CoT faithfulness:** Turpin et al. (2023), Arcuschin et al. (2025), and Bentham et al. (2024) document that CoT traces are often unfaithful to the model's actual computation. CRV provides a mechanism-level explanation for *why* specific steps are incorrect, moving beyond the faithfulness question to causal diagnosis.
- **Gray-box verifiers:** CoE-R/CoE-C (Wang et al., 2025a) and CoT-Kinetics (Bi et al., 2025) are the strongest gray-box baselines and were designed specifically for full CoT evaluation. CRV outperforms them on all datasets and metrics while also providing mechanistic insight — the two types of information are complementary.
