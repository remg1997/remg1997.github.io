# Reducing Belief Deviation in Reinforcement Learning for Active Reasoning of LLM Agents

**Authors:** Deyu Zou, Yongqiang Chen, Jianxiang Wang, Haochen Yang, Mufei Li, James Cheng, Pan Li, Yu Gong
**Venue / Year:** ICLR 2026 (Oral)
**arXiv:** 2510.12264v2
**Local copy:** `papers/t3-belief-trap.pdf`

---

## TL;DR

LLM agents doing multi-turn active reasoning (asking questions, receiving observations) frequently enter a failure mode the authors call a *Belief Trap Region* (BTR): their internal beliefs diverge from the true problem state, actions become uninformative, and errors compound. Standard RL training is actively harmed by these tail segments because they corrupt credit assignment for earlier exploratory actions. T3 (Truncating Belief-Trapped Trajectories) detects BTR entry via observable proxy signals and cuts trajectories early, producing lower-variance gradient estimates. Across 5 tasks and 3 RL algorithms, T3 delivers gains of up to 30 points while cutting token cost by up to 34%.

---

## Problem & Motivation

Active reasoning requires an LLM agent to interact with an external environment over multiple turns, strategically posing questions to narrow down a latent state $s^* \in \mathcal{S}$ that it cannot directly observe. This is formalized as a Partially Observable Markov Decision Process (POMDP) $(\mathcal{S}, \mathcal{A}, \mathcal{O}, T, O, R, \gamma)$, where the agent maintains a belief state $b_t \in \Delta(\mathcal{S})$ — a distribution over latent states — and updates it through its own LLM belief-update rule $B_\theta$ rather than exact Bayesian filtering.

The trouble is that LLMs are imperfect belief updaters. The paper introduces the *belief-update discrepancy*:

$$c_\theta(b_t) := \mathbb{E}_{a_t, o_t} \left[ \Psi(B_\theta(b_t, a_t, o_t)) - \Psi(B^*(b_t, a_t, o_t)) \right]$$

where $\Psi(b) := -\log b(s^*)$ is a truth-anchored potential measuring how concentrated the belief is on the true state, and $B^*$ is the ideal Bayesian update. Under Assumption 1 (update-error growth: $c_\theta(b) \geq m_\theta \Psi(b) - c_0$ for high-uncertainty beliefs), the authors prove (Theorem 1) that once this potential exceeds a threshold $U$, the expected task progress becomes non-positive — the trajectory has entered a BTR.

The secondary problem is that standard RL (e.g., PPO with GAE) receives the full trajectory to compute advantage estimates. Theorem 2 shows that a sufficiently long uninformative tail causes the expected advantage $\mathbb{E}[\hat{A}_t]$ for pre-BTR actions to go negative, effectively inverting the gradient direction. This actively discourages the good exploratory behavior that preceded the trap.

---

## Key Contributions

- Formal POMDP-based theory of belief trapping: definitions of the BTR, proof that LLM belief-update errors cause absorbing dynamics (Theorem 1), and proof that uninformative tails corrupt credit assignment by inverting advantages (Theorem 2).
- The T3 condition (Definition 2): a practical, task-agnostic principle for detecting BTR entry via observable proxy signals measuring *epistemic progress stalls* over a sliding window of $k$ steps.
- Corollary 1: truncating at $t_S$ yields a less biased gradient estimate, providing formal justification for the truncation.
- Empirical validation of the theoretical components (Figure 2): fitted lower-bound slopes for Assumption 1, token-wise mean GAE values confirming advantage inversion.
- A drop-in implementation compatible with PPO, GRPO, and GSPO without modifying the underlying optimization algorithm.

---

## Method

### Theoretical Framework

Active reasoning is modeled as a POMDP where $s^*$ is fixed within an episode (the problem answer), observations come from the environment, and the agent's belief $b_t$ is its internal LLM-encoded estimate. An *oracle* reasoner would use exact Bayes; the LLM reasoner uses $B_\theta$.

The truth-anchored potential $\Psi(b) = -\log b(s^*)$ equals 0 when belief is fully concentrated on $s^*$ (task solved) and grows with uncertainty. The belief-trap region $\mathcal{R}_\theta$ is formally an absorbing set where $\mathbb{E}[\Psi(b_{t+1}) | b_t = b] \geq \Psi(b)$ for all $b \in \mathcal{R}_\theta$ — progress is expected to stall or regress (Definition 1 / Definition B.5).

### The T3 Condition (Definition 2)

Since the exact BTR onset is unobservable (it depends on $b_t$, which is only implicitly encoded in the LLM's activations), T3 uses a measurable proxy. Let $\mathcal{H}_t$ be the *hypothesis space* at step $t$ — the set of states consistent with the interaction history so far — and let $d(\cdot, \cdot)$ be a refinement measure capturing how much $\mathcal{H}$ contracts between steps. The T3 condition triggers at step $t$ if:

$$\forall \tau \in [t-k, t]: \ d(\mathcal{H}_\tau, \mathcal{H}_{\tau+1}) \leq \Delta_{\min}$$

i.e., no meaningful hypothesis-space contraction has occurred in the last $k$ steps. Proposition 1 shows this rule keeps the false-truncation probability bounded below $\delta$ under a biased Gaussian noise model, with exponential decay in $k$.

### Task-Specific Proxy Instantiations (Section 3.1)

The abstract $\mathcal{H}_t$ and $d(\cdot, \cdot)$ are instantiated per task:

- **GuessNumbers (GN):** $\mathcal{H}_t$ = candidate numbers consistent with history; $d(\mathcal{H}_\tau, \mathcal{H}_{\tau+1}) = |\mathcal{H}_\tau| - |\mathcal{H}_{\tau+1}|$ (set contraction). Truncate if the agent's guess falls outside $\mathcal{H}_{t-1}$ (window $k=1$).
- **SituationPuzzles (SP):** $\mathcal{H}_t$ = plausible explanations; proxy is judge feedback of "unknown," indicating uninformative questions. Truncate after $k=5$ consecutive uninformative turns.
- **CircuitDecoding (CD):** $\mathcal{H}_t$ = surviving circuit candidates; $d = |\mathcal{H}_\tau| - |\mathcal{H}_{\tau+1}|$. Truncate if $|\mathcal{H}_t|$ fails to contract for $k=3$ turns.
- **PreferenceEstimation (PE) / MovieRecommendation (MR):** Hypothesis space is continuous (preference vectors). Proxy: change in cosine similarity $\text{Sim}(v_{\tau+1}, v^*) - \text{Sim}(v_\tau, v^*)$ between agent's estimate and ground truth. Truncate if similarity decreases for $k=2$ consecutive steps.

The authors also explore judge-free and ground-truth-free proxies in Appendix D.

### Integration with RL

T3 acts as a meta-wrapper around the rollout generation phase. When the T3 condition fires at step $t_S$, the trajectory is cut there: only $(b_1, a_1, o_1, \ldots, b_{t_S}, a_{t_S}, o_{t_S})$ is used for credit assignment. The underlying optimizer (PPO, GRPO, GSPO) receives this truncated trajectory and computes advantages as normal. No changes to the algorithm internals are required.

---

## Experimental Setup

**Tasks:** 5 tasks from AR-Bench (Zhou et al., 2025) and Multi-Turn Puzzles (Badola et al., 2025): CircuitDecoding (CD), SituationPuzzles (SP), GuessNumbers (GN), PreferenceEstimation (PE), MovieRecommendation (MR).

**Base model:** Qwen2.5-7B-Instruct as the primary agent; additional experiments with Qwen2.5-3B/14B and LLaMA-3.1-8B variants.

**Baselines:** Direct inference with o3-mini, Gemini-2.5-Pro, Qwen2.5-7B-Instruct (zero-shot); RL training with PPO, GRPO, GSPO (vanilla, without T3).

**Metrics:** Exact Match (EM) for GN, CD, MR; F1-word and F1-char for SP; Binary Similarity (cosine threshold 0.88) for PE. (Table 1)

**Implementation:** For SP, a Qwen2.5-14B-Instruct model simulates the user/judge. Full details in Appendix F.

---

## Results

**Overall performance (Table 1):** T3 improves 14 out of 18 reported metrics over vanilla RL baselines with non-marginal gains:

- CD: PPO+T3 boosts EM by **+16.2 points** (61.67 → 77.83); GRPO+T3 achieves 81.33 (+2.0 over GRPO vanilla).
- SP: GRPO+T3 achieves best F1-word/char, raising GRPO by **+3.0 F1-word** and PPO by **+8.1 F1-word**.
- GN: T3 raises GRPO by **+30.1 EM** (61.26 → 91.36); GSPO+T3 reaches **99.74 EM** near-perfect.
- MR: GSPO+T3 improves by **+41.0 EM** (14.67 → 55.67).
- Average rank across all metrics: GSPO+T3 ranks best at 2.50, PPO+T3 second at 4.50.

**Token efficiency:** T3 reduces rollout tokens by up to 34%. To reach reward 0.65 on CD under PPO, T3 uses only 66.4% of the tokens consumed by vanilla PPO.

**Training stability (Figure 3):** Vanilla RL shows high variance with abrupt reward collapses. T3 yields monotonically or near-monotonically increasing reward curves.

**Out-of-distribution (Table 2):** T3 consistently improves OOD performance on CD (larger candidate pools) and PE (varied reference-set sizes and sampling distributions).

**Architecture scaling (Figure 6):** 3B models benefit minimally; 7B and 14B models show clear gains. DeepSeek-R1-distilled variants benefit more than vanilla LLaMA-8B, consistent with the theory that better belief-tracking ability (stronger $m_\theta$) amplifies T3's utility.

**Ablation on truncation conditions (Table 3):** Window size $k$ matters — too small truncates prematurely, too large accumulates errors. For SP (unbounded hypothesis space), aggressive truncation is beneficial; for CD (finite hypothesis space), moderate truncation ($k=3,4$) is optimal.

---

## Limitations & Caveats

- **Proxy design is task-dependent.** The paper provides principled guidance but each task still requires engineering a suitable $\mathcal{H}_t$ and $d(\cdot, \cdot)$. The general-purpose proxy explored in Appendix E.1 is preliminary.
- **Ground-truth dependence for PE proxy.** The PE proxy requires access to $v^*$ at training time, which is not available at deployment. Ground-truth-free alternatives are explored but not the main result.
- **Theory assumes fixed $s^*$ per episode.** The POMDP formulation assumes the true latent state does not change within an episode, which may not hold in all agentic applications.
- **Small model regime.** The 3B parameter range sees minimal benefit, possibly because such models fall into BTRs so immediately that truncation cannot recover meaningful signal.
- **Evaluated on interactive QA-style tasks.** Generalization to code execution, tool use, or open-ended web navigation agents is untested.

---

## Why It Matters / Implications

T3 addresses a fundamental flaw in how RL is applied to multi-turn LLM agents: the credit assignment problem is actively worsened when trajectories are allowed to run past the point of epistemic stagnation. The method is both theoretically grounded (with formal proofs connecting BTR dynamics to advantage inversion) and practically simple (a truncation wrapper around existing RL algorithms).

For practitioners:
- The plug-in nature (no algorithm changes) means T3 can be dropped into existing PPO/GRPO training pipelines with minimal overhead.
- The 34% token savings is particularly valuable at scale, since RL training for LLMs is dominated by rollout generation cost.
- The finding that larger and distilled models benefit more has implications for the sequence of post-training steps: RL-based active reasoning training may be most effective after a distillation or SFT step that establishes baseline belief-tracking ability.

---

## Related Work Context

- **Credit assignment in multi-turn RL:** CURIO (Wan et al., 2025) assigns intermediate rewards via a potential function assuming finite, enumerable state spaces — the exact regime where T3's gains are smaller and the BTR problem is less severe. SPA-RL (Wang et al., 2025) trains reward models for stepwise credit but does not address belief drift. T3 is complementary: it acts before the trajectory degrades rather than reshaping rewards post-hoc.
- **Active reasoning benchmarks:** AR-Bench (Zhou et al., 2025) and Multi-Turn Puzzles (Badola et al., 2025) provide the evaluation framework. The paper adapts these datasets for RL training.
- **POMDP belief tracking:** Classical Bayesian filtering (Kaelbling et al., 1998) provides the oracle baseline. The gap between this oracle and the LLM's implicit belief update is the core quantity being controlled.
- **Comparison to frontier models:** On tasks with finite hypothesis spaces (GN, CD), RL-trained 7B models with T3 match or exceed o3-mini and Gemini-2.5-Pro. On unbounded-space tasks (SP, PE), frontier models still lead, suggesting that belief deviation in continuous spaces remains an open problem.
