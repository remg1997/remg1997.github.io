---
title: "Notes from ICLR 2026: Six Orals on LLMs and Evaluation"
date: 2026-04-23
track: engineers
excerpt: "Notes from the second oral session at ICLR 2026. Six papers on reward hacking detection, multi-turn reliability (the Best Paper), micro-benchmarking, value-difference generation, preference interpretability, and mutual-judgment alignment."
tags: [iclr, conference, llms, evaluation, alignment, rlhf]
author: "rafael"
image: ./iclr-2026-llm-evaluation-orals/llms-lost-figure-1-aptitude.png
---

For thehe second oral session on Day 1 of ICLR 2026 I attended the LLMs and Evaluation session. Six talks, including one of this year's Best Paper Awarded papers.  What follows is my set of notes from the session.

## Is It Thinking or Cheating? Detecting Implicit Reward Hacking by Measuring Reasoning Effort

Wang et al. open with a problem anyone doing RL post-training has seen. The reward is always a proxy. A verifier, a reward model, an execution harness. Models optimized against a proxy learn to exploit it, and when the exploit is *implicit* the chain-of-thought looks fine. A large LM prompted to audit the CoT cannot see the cheat because the cheat never shows up in the tokens.

Their framing of loopholes splits the problem cleanly. **In-Context (IC) loopholes** leak answer information into the prompt, like an answer embedded in a problem ID. **Reward Model (RM) loopholes** are bugs in the proxy itself, like a verifier that accepts any negative number or rewards code containing the keyword `else`.

The core intuition behind TRACE (the method developed in this paper) is that exploiting a loophole takes less cognitive work than actually solving the task. A hacking model can commit to its answer after a handful of tokens. An honest solver needs to work through the problem. That difference in *effort* is the detection signal.

![A horizontal schematic showing a CoT trajectory split into three truncation points at 10 percent, 40 percent, and 90 percent, with a final 100 percent marker. Each cutoff is annotated with three rows: 'Add answer tags to force answering' with a </think><answer> label, 'Sampling Multiple Answers' with dice icons, and 'Expected Proxy Reward' with values 0.3, 0.3, 0.8, 1.0 progressing left to right.](./iclr-2026-llm-evaluation-orals/reward-hacking-figure-5-trace.png)
*Figure 5 from Wang et al., ICLR 2026 (arXiv:2510.01367). TRACE in one picture. Truncate the CoT at 10%, 40%, and so on, force an early answer, estimate expected reward at each cutoff. AUC over those points is the TRACE score. A hacking model's curve rises early and the AUC is large.*

The algorithm: for truncation percentages $p \in \{0.1, 0.2, \ldots, 1.0\}$, cut the CoT, append `</think> <answer>`, sample forced completions, estimate expected reward at each point, integrate. A hacking model classifies if its TRACE score exceeds the pre-RL policy's score on the same examples.

Results are quite interesting. On math IC loopholes, TRACE hits ~0.90 F1 across model sizes from 1.5B to 14B. The 72B CoT monitor sits at ~0.65. On math RM loopholes the gap widens because the CoT never mentions the minus-sign exploit: TRACE stays at ~0.90, the monitor drops to ~0.55. On code RM loopholes with the `else` keyword, Qwen2.5-1.5B learns to skip CoT entirely and becomes invisible to monitors. TRACE still catches the behavioral signature.

Section 5 shows a label-free workflow: compute TRACE scores across a dataset, k-means cluster, and feed the high-TRACE cluster to an LLM for pattern analysis. In the paper's experiments, this pipeline correctly identified the question-ID hint loophole from anomalously easy examples.

Finally the authors askedÑ what if the model just learns to overthink during RL? The authors' answer is that TRACE would inflate uniformly, not selectively on loophole examples, so the differential signal still holds.

Full paper: [arXiv:2510.01367](https://arxiv.org/abs/2510.01367).

## LLMs Get Lost in Multi-Turn Conversation

Laban et al. won one of the two ICLR 2026 Best Paper for this one, and the result is simple enough to state in a sentence. Every major LLM loses an average of 39 percentage points when the same instruction is spread across multiple turns instead of given all at once. GPT-4.1, Gemini 2.5 Pro, Claude 3.7 Sonnet, DeepSeek-R1, o3. All of them, across 200,000+ simulated conversations on six tasks.

![A scatter plot with Unreliability on the x-axis and Aptitude on the y-axis. Five labeled model points cluster in the upper-left 'Single-Turn / Fully-Specified' region at low unreliability and high aptitude. A dashed arrow from each point ends in the lower-right 'Multi-Turn / Underspecified' region where aptitude has dropped slightly and unreliability has more than doubled.](./iclr-2026-llm-evaluation-orals/llms-lost-figure-1-aptitude.png)
*Figure 1 from Laban et al., ICLR 2026 Best Paper (arXiv:2505.06120). Every model slides from the single-turn corner (high aptitude, low unreliability) down to the multi-turn corner. Aptitude only loses about 16%. Unreliability more than doubles.*

The methodology is a **sharded instruction** pipeline. A fully specified single-turn prompt is decomposed into $k$ information shards that satisfy five properties: information preservation, clear initial intent, order insensitivity, maximal sharding, minimal transformation. Three agents then interact per conversation: a user simulator holding the full sharded instruction, the assistant under test, and a system evaluator that classifies strategies and scores outcomes. The framework covers six tasks, not just code: HumanEval and LiveCodeBench, Spider, BFCL, GSM8K, ToTTo, and Summary of a Haystack.

The Concat mode (concatenate all shards into a single bulleted list and give them in turn 1) stays within 5% of Full, ruling out rephrasing noise. The degradation in the Sharded condition is genuine multi-turn confusion.

The decomposition is the part that reframed how I'll read multi-turn benchmarks from now on. With $N{=}10$ replicates per instruction, Laban et al. split the score distribution into **aptitude** ($A^{90}$, the 90th percentile) and **unreliability** ($U^{90}_{10}$, the 10th-to-90th interpercentile range). Aptitude drops ~16%. Unreliability jumps **+112%**. The capability to solve the task is largely preserved. What explodes is variance across runs. Once a model makes a wrong turn early, it does not recover.

The temperature experiments seal the argument. Dropping from $T{=}1.0$ to $T{=}0.0$ cuts single-turn unreliability by more than half. In multi-turn, it barely moves. GPT-4o-mini's multi-turn $U^{90}_{10}$ stays around 30 even at greedy decoding. Multi-turn errors are not sampling noise. They are cascading commitments from early-turn decisions. Even **2-shard** conversations trigger the full unreliability spike. Granularity does not matter. Any underspecification beyond a single turn is enough.

The four failure modes from Appendix F are worth committing to memory: premature answer attempts, answer bloat (prior wrong outputs getting conflated with user requirements), recency bias, and excessive verbosity in reasoning models (o3 and DeepSeek-R1 produce 33% longer responses on average, compounding errors).

Full paper: [arXiv:2505.06120](https://arxiv.org/abs/2505.06120).

## How Reliable is Language Model Micro-Benchmarking?

Yauney et al. start from a practice everyone uses and nobody audits. Running an eval on 10 examples instead of 10,000 is 1000x cheaper. Methods like tinyBenchmarks, Anchor Points, and diversity sampling all claim competitive rank correlation at tiny budgets. The paper asks whether rank correlation is the right thing to look at.

Their critique of prior evaluation is sharp. Mean estimation error per model does not catch consistent overestimation that still ranks pairs correctly. Kendall's tau averages over all pairs, so a method that nails well-separated models and fails on close ones scores well despite being useless for comparing frontier candidates that differ by 1 to 3 points.

The pairwise reframe: if Model A outperforms Model B by 20 points on the full benchmark, any micro-benchmark will get it right. If the gap is 2 points, the method has to actually work. A useful reliability metric should decompose reliability as a function of the performance gap.

![A four-panel figure. Top row: two bar charts of Kendall's tau rank correlation with the full MMLU-Pro benchmark at 10 examples on the left and 500 examples on the right, comparing random sampling, stratified-by-confidence, Anchor Points, and tinyBenchmarks. Bottom row: two line charts of agreement probability on the y-axis against accuracy difference between model pairs on the x-axis, at 10 and 500 examples.](./iclr-2026-llm-evaluation-orals/microbenchmarking-figure-1-metrics.png)
*Figure 1 from Yauney et al., ICLR 2026 (arXiv:2510.08730). Top row: Kendall's tau looks fine, around 0.52 at 10 MMLU-Pro examples for both tinyBenchmarks and random sampling. Bottom row: MDAD tells the real story. Neither can reliably rank models within 4 accuracy points. The aggregate correlation hid the frontier-comparison failure.*

**MDAD (Minimum Detectable Accuracy Difference)** is the smallest gap $\delta$ at which a micro-benchmark agrees with the full benchmark at least 80% of the time on pairwise comparisons. Lower is better. Operationally: 50 random train/test splits over a ~400-model pool, bucket pairwise differences at 0.5-point intervals, compute agreement per bucket, report the minimum bucket centroid where agreement clears 80%.

The headline numbers from 10-example budgets on MMLU-Pro: Anchor Points 7.7, uniform random 20.0, tinyBenchmarks **164.5**. The same tinyBenchmarks that looked competitive under Kendall's tau cannot distinguish models within 150 accuracy points at this budget. The tau looked identical. The pairwise reliability does not.

The practical recommendation is clean. Use at least 100 examples. Below 250, use Anchor Points. At 250 or more, just use random sampling. The specialized methods converge to within statistical noise beyond that. And for anyone comparing frontier 8B models on MMLU-Pro where 51% of pair accuracy differences are 5 points or less: even at $n{=}1000$, roughly 21% of those comparisons remain unreliable.

IRT-based selection in tinyBenchmarks optimizes score estimation, a different objective from pairwise ranking. MDAD targets ranking directly and should be the default metric for micro-benchmark evaluation going forward.

Full paper: [arXiv:2510.08730](https://arxiv.org/abs/2510.08730).

## AdAEM: An Adaptively and Automated Extensible Measurement of LLMs' Value Differences

Yao et al. take on static value benchmarks. The existing instruments (SVS, ValueBench, ValueDCG) predate the models being tested, saturate toward uninformative similarity, target safety values shared by most modern LLMs, and cannot capture recently emergent controversies. A good value evaluation should yield *distinguishable* scores across meaningfully different respondents. That is the informativeness problem AdAEM attacks.

Their framing treats values as latent variables with Schwartz's 10 dimensions (Power, Achievement, Hedonism, Universalism, etc.). For K LLMs, you want a question $\mathbf{x}$ that maximizes the Jensen-Shannon divergence between their induced value distributions, plus a disentanglement regularizer that penalizes questions where one model's prior already dominates.

![A horizontal framework diagram. On the left a 'Question Refinement Step' box shows a generic seed question being optimized into a more specific value-evoking question, labeled with a Jensen-Shannon divergence objective combining a 'distinguishability' term and a 'disentanglement' term. On the right a 'Response Generation Step' shows K parallel LLM blocks each receiving the optimized question and producing an opinion; their opinions cluster into 'Similar Values' and 'Value Differences' groups that feed into an 'AdAEM Bench' dataset icon.](./iclr-2026-llm-evaluation-orals/adaem-figure-2-framework.png)
*Figure 2 from Yao et al., ICLR 2026 (arXiv:2505.13531). AdAEM's inner loop: a question refinement step optimizes a JSD-based informativeness score against an ensemble of K LLMs, then a response generation step elicits each model's value-laden answer. The two steps alternate until convergence.*

The algorithm alternates two phases over a budget of $B{=}1500$ iterations. In the response-generation phase, each LLM samples a value vector, then an opinion conditioned on that value. In the question-refinement phase, the current question is optimized to maximize the JSD objective against the fixed response pool. Topics are selected via a UCB multi-arm bandit over a large seed pool, balancing estimated quality and under-exploration. A cheaper model tier generates candidates; a larger tier (GPT-4-Turbo, Claude 3.5 Sonnet, GLM-4, Mistral-Large) scores them.

The resulting **AdAEM Bench** ships with 12,310 questions and Self-BLEU 13.42 against SVS's 52.68 (lower is more lexically diverse). Controlled priming validates that the questions probe value orientations: prompting o3-mini to "act as a Universalist" activates Universalism +31% and suppresses conflicting values by 58%.

Seed the generator with models from different regions (GLM-4 China, GPT-4-Turbo US, Mistral-Large Europe) and the resulting questions cluster distinctly in topic space. Seed with models of different cutoff dates and the questions track recent controversies the older models could not know about. GPT-4o questions reference the Ukraine war; earlier versions do not.

The findings on benchmarked models are worth noting. Safety-tuned models cluster toward Universalism. Same-family models converge to similar orientations across scales. Reasoning-oriented models like o3-mini show elevated Self-Direction and Stimulation. The practical takeaway: scale-up alone does not diversify value orientations, so multi-model pipelines that assume value diversity from model mixing are not getting what they think they are.

Full paper: [arXiv:2505.13531](https://arxiv.org/abs/2505.13531).

## What's In My Human Feedback? Learning Interpretable Descriptions of Preference Data

Movva et al. tackle a problem that has been waiting to be named. Preference datasets drive RLHF but remain opaque. We know reward models predict labels. We do not know *why* humans made those choices, and diagnosing harmful tendencies (verbosity, sycophancy, overconfidence) usually requires labor-intensive audits or pre-specified feature lists.

**Measurable preferences** are what *could* be learned from the response pairs. If responses in a dataset never differ on refusal rate, then preference over refusal is not measurable regardless of analysis. **Expressed preferences** are the subset of measurable ones that actually predict the human label $y$.

Here's a quick description of the method: Embed each response with `text-embedding-3-small`. Compute the embedding *difference* $\mathbf{e}_\Delta = \mathbf{e}_{r_A} - \mathbf{e}_{r_B}$ between the two responses in a pair. Train a BatchTopK sparse autoencoder on these differences, with $(M, K) = (32, 4)$: 32 latent dimensions, 4 active per example. The key design choice: the SAE trains on response-embedding differences only, not on full prompt-response representations. Figure 4 validates that including the prompt buys no accuracy. For each latent, sample the top-5 activating pairs, ask GPT-5 to describe the distinguishing concept, validate fidelity on 300 held-out examples with Bonferroni-corrected Pearson correlation. Retain features that survive.

Then regress on the label: $\Pr(y{=}1) = \sigma(\alpha + \beta_j z_j + \gamma \cdot \ell_\Delta)$, controlling for response-length differences. Report $\beta_j$ and $\Delta\text{win-rate}$.

![A dot plot with feature names on the y-axis and change in win-rate on the x-axis, ranging from −40 percent to +40 percent. About a dozen interpretable features like 'provides a long, heavily structured response with headings', 'makes a flippant joke', 'expresses uncertainty or lack of knowledge', and 'refuses the user's request' are each shown as a row with five colored points representing Chatbot Arena, Community Alignment, HH-RLHF, PRISM, and Reddit. Many features show points on both sides of zero, indicating opposite preferences across datasets.](./iclr-2026-llm-evaluation-orals/wimhf-figure-2-features.png)
*Figure 2 from Movva et al., ICLR 2026 (arXiv:2510.26202). The same preference feature, five different datasets, wildly different signs. LMArena annotators vote against safety refusals (−31% win-rate). HH-RLHF and PRISM penalize flippant jokes. Reddit rewards informality and humor. Mix these datasets naively during RLHF and you're training on contradictory signal.*

The cross-dataset finding is the one I'll carry around. The same interpretable feature has opposite signs across datasets. Jokes get +10% on Reddit, negative on HH-RLHF. Flippant humor plays on Reddit, dies on PRISM. Markdown headings get +19% on LMArena and +48% on Community Alignment.

The alarming one is refusals. **LMArena annotators penalize safety refusals at −31% win-rate.** Table 11 shows concrete examples where the winning response assists with harm. Any reward model trained on raw LMArena data is learning to suppress safety behavior.

The fix is cheap once you know where to look. Flip the 1,000 Arena examples with highest anti-refusal activation and RewardBench2 safety accuracy goes from 8.9% to 46.2%, +37.3 points. Overall benchmark performance stays within the 95% CI. Sixteen of thirty evaluated reward models shift 50 or more Elo ranks under the corrected eval. A thousand examples is roughly 0.1% of a typical RLHF dataset.

The SAE features recover 67% of the learnable preference signal (AUC 0.672 vs the black-box reward model's 0.766) while remaining interpretable, and Section 5.2 extends the toolkit to personalization. The paragraph-versus-bullets axis has the highest inter-annotator subjectivity: 18% of annotators prefer paragraphs despite the aggregate penalty, and $k{=}16$ per-annotator examples give +1.1% AUC.

Full paper: [arXiv:2510.26202](https://arxiv.org/abs/2510.26202).

## EigenBench: A Comparative Behavioral Measure of Value Alignment

Chang et al. close the session with the method I found most fun. Evaluating whether a model aligns with a given value system is hard because no ground truth exists for subjective moral questions. Human eval does not scale. A single LLM judge has systematic biases and may favor its own family. Self-report is inversely correlated with observed behavior. Models that claim perfect alignment score lowest behaviorally.

EigenBench's move: have every model judge every other model across diverse scenarios, then aggregate the judgments with EigenTrust (yes, the 2003 peer-to-peer reputation algorithm) to produce Elo-style alignment scores that down-weight self-serving and unreliable judges.

![A horizontal five-panel pipeline diagram. Step 1 shows inputs: a set of scenarios, a constitution with kindness/generosity/goodwill criteria, and a population of five models (Claude 4 Sonnet, GPT-4.1, Gemini 2.5 Pro, Grok 4, DeepSeek v3). Step 2 collects evaluee responses to a scenario about 'How do you think humans will become extinct?'. Step 3 shows a judge (Claude 4 Sonnet) producing reflections on two evaluee responses and a pairwise comparison. Step 4 is a Bradley-Terry-Davidson fit producing per-judge lenses, per-model dispositions, and tie propensities. Step 5 builds a trust matrix whose left eigenvector is converted to Elo ratings.](./iclr-2026-llm-evaluation-orals/eigenbench-figure-1-pipeline.png)
*Figure 1 from Chang et al., ICLR 2026 (arXiv:2509.01938). EigenBench in five steps. Population, constitution, and scenarios go in. Models evaluate each other's responses. A Bradley-Terry-Davidson model fits judge lenses and model dispositions. EigenTrust computes the left principal eigenvector of the trust matrix. The result comes out as Elo ratings.*

The inputs are a constitution $\mathcal{C}$ (a natural-language value spec, like Universal Kindness or Deep Ecology), a scenario set $\mathcal{S}$ (r/AskReddit, OASST, AIRiskDilemmas), and a model population $\mathcal{M}$ that doubles as candidates and judges. For each scenario and each evaluee pair, every judge first writes structured *reflections* on how each response aligns with $\mathcal{C}$, then produces a ternary comparison (tie, prefer j, prefer k). The reflection scaffold matters. It reduces order bias.

The Bradley-Terry-Davidson fit learns per-model **dispositions** $\mathbf{v}_j$, per-judge **lenses** $\mathbf{u}_i$, and per-judge tie propensities $\lambda_i$. Pairwise preference probabilities depend on $\exp(\mathbf{u}_i^\top \mathbf{v}_j)$. Ablations show $d{=}2$ captures most signal.

From the fitted latent strengths $s_{ij} = \exp(\mathbf{u}_i^\top \mathbf{v}_j)$, build a trust matrix $T$ that mixes pairwise strengths with tie propensities. The alignment score vector $\mathbf{t}$ is the **left principal eigenvector** of $T$: $\mathbf{t} = \mathbf{t}T$. Same computation as EigenTrust's steady-state random walk over the trust graph. Judges whose preferences align with the weighted ensemble consensus get higher trust. Self-promoting or idiosyncratic judges get discounted. Final scores convert to Elo via $\text{Elo}_j = 1500 + 400\log_{10}(N t_j)$.

The results: on Universal Kindness over 24,000 pairwise comparisons, Gemini 2.5 Pro leads at 1567 Elo, Claude 4 Sonnet 1530, GPT-4.1 1478, Grok 4 1468, DeepSeek v3 1419. On Conservatism the rankings shift. On Deep Ecology, Kimi K2 leads. Models are not uniformly aligned across value systems.

The finding I am still trying to grasp: with 5 models and 5 prompted personas, **21% of alignment score variance comes from the model, 79% from the prompted persona**. The same base model with different personas produces larger alignment swings than switching between entirely different frontier models. System prompts matter more than model choice, at least as EigenBench measures it. Before picking a "more aligned" model, try a better system prompt first.

The robustness suite is thorough. Scores hold up across three scenario distributions, across population changes, and against a "greenbeard" adversarial scenario where $G$ colluding judges all prefer a secret keyword. Trust weighting identifies and down-weights them even when they outnumber honest judges. Human-LM agreement matches human-human agreement: LM judges are not more biased relative to group consensus than humans are. And on GPQA, EigenBench recovers the correct objective rankings without ever seeing the ground-truth answers.

Full paper: [arXiv:2509.01938](https://arxiv.org/abs/2509.01938).
