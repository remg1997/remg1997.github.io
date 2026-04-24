# LLMs Get Lost In Multi-Turn Conversation

**Authors:** Philippe Laban, Hiroaki Hayashi, Yingbo Zhou, Jennifer Neville
**Venue / Year:** ICLR 2026 (Oral, Best Paper Award) / 2025
**Source:** https://arxiv.org/abs/2505.06120
**Local copy:** papers/llms-lost-multi-turn.pdf (not downloaded — HTML version read at https://arxiv.org/html/2505.06120)

---

## TL;DR

Every major LLM — including GPT-4.1, Gemini 2.5 Pro, Claude 3.7 Sonnet, and DeepSeek-R1 — drops an average of 39% in task performance when instructions are spread across multiple conversation turns instead of given all at once, across 200,000+ simulated conversations on six generation tasks. The degradation is driven almost entirely by increased **unreliability** (variance between runs, +112%) rather than loss of underlying capability (aptitude, -16%). Once a model makes a wrong turn early in a conversation, it does not recover. Neither reducing temperature nor adding test-time compute (reasoning models) closes the gap.

---

## Problem & Motivation

LLMs are deployed as conversational interfaces. In practice, users rarely provide complete, perfectly specified instructions in a single turn — they reveal requirements gradually, ask follow-up questions, and refine requests iteratively. Yet the vast majority of LLM benchmarks evaluate single-turn, fully-specified prompts.

The prior work that came closest — HumanEval multi-turn variants (the paper specifically calls out a benchmark that turns each HumanEval problem into multiple turns) — was not ecologically valid: the multi-turn decomposition was artificial and the degradation could plausibly be attributed to rephrasing artifacts rather than true multi-turn confusion.

This paper builds a rigorous evaluation framework to ask: **controlling for rephrasing artifacts, do LLMs genuinely lose track of task requirements in multi-turn settings?** The answer is yes, substantially and universally.

---

## Key Contributions

1. **Sharded instruction methodology**: a principled pipeline converting fully-specified single-turn instructions into sets of information "shards" that are revealed incrementally across turns, with five formal properties ensuring the conversion is clean (see Method).
2. **Multi-turn simulation at scale**: 200,000+ conversations across 15 models and 6 tasks, with N=10 replicates per setting for distributional analysis.
3. **Aptitude / Reliability decomposition**: disentangles capability loss from variance increase using the 90th-percentile score (aptitude) and the 10th–90th interpercentile range (unreliability). Finds unreliability, not aptitude, is the dominant failure mode.
4. **Root cause analysis**: identifies four concrete failure modes (premature answers, answer bloat, recency bias, excessive verbosity) and shows that Recap/Snowball mitigation strategies recover ~15–20 points but leave a large gap.
5. **ICLR 2026 Best Paper Award** (noted in Rafael's journal — confirmed).

---

## Method

### Sharding Pipeline

A single-turn instruction (e.g., a HumanEval coding problem) is decomposed into $k$ shards satisfying five properties:

1. **Information Preservation**: shards jointly contain all information in the original.
2. **Clear Initial Intent**: Shard 1 establishes the high-level goal (e.g., "write a function that processes a list").
3. **Order Insensitivity**: shard ordering does not materially affect task feasibility.
4. **Maximal Sharding**: information is divided into minimally-overlapping atomic units.
5. **Minimal Transformation**: rephrasing is limited to what is necessary to fit conversational context.

The pipeline is semi-automatic: LLM-based segmentation and rephrasing, followed by verification, human inspection, and editing (averaging 3 person-hours per 100 instructions). 600 total instructions were sharded across 6 tasks.

### Simulation Architecture

Three agents interact per conversation:

- **User Simulator** (GPT-4o-mini): holds the full sharded instruction; at each turn selects the most contextually appropriate shard not yet revealed, rephrases it naturally. Reveals at most one shard per turn.
- **Assistant** (the model under test): receives task context (e.g., database schemas) but no explicit multi-turn instructions; answers freely.
- **System Evaluator**: classifies each assistant response into one of seven strategies (answer attempt, clarification, refusal, hedging, interrogation, discussion, missing); extracts answer spans; scores via task-specific metric. Conversation terminates when a correct answer is evaluated or all shards are revealed.

### Five Simulation Modes

| Mode | Description |
|------|-------------|
| **Full** | Entire instruction given in turn 1; baseline |
| **Concat** | All shards concatenated as a bulleted list in turn 1; controls for rephrasing artifacts |
| **Sharded** | One shard per turn, user-simulated; the main experimental condition |
| **Recap** | Sharded + a final consolidation turn restating all shards before answer evaluation |
| **Snowball** | Each turn repeats all prior shards plus the new one |

Concat being close to Full (~95% of Full performance) validates that sharding rephrasing alone does not cause degradation — degradation in Sharded is genuine multi-turn confusion.

### Metrics

For N=10 conversation replicates per (model, instruction) pair, three statistics are computed from the score distribution:

- $\bar{P}$ — **Average Performance**: mean score across 10 runs.
- $A^{90}$ — **Aptitude**: 90th-percentile score (best-case capability).
- $U^{90}_{10}$ — **Unreliability**: 90th–10th interpercentile range (variability across runs).

---

## Experimental Setup

**15 models tested**: GPT-4o-mini, GPT-4o, o3, GPT-4.1 (OpenAI); Claude 3 Haiku, Claude 3.7 Sonnet (Anthropic); Gemini 2.5 Flash, Gemini 2.5 Pro (Google); Llama 3.1-8B, 3.3-70B, 4 Scout (Meta); OLMo-2-13B (AI2); Phi-4 (Microsoft); DeepSeek-R1; Command-A (Cohere).

**6 tasks**:
| Task | Source | N | Metric |
|------|--------|---|--------|
| Code (Python) | HumanEval + LiveCodeBench | 100 | Execution correctness |
| Database (Text-to-SQL) | Spider | 120 | Semantic equivalence |
| Actions (API calls) | BFCL | 100 | Function call correctness |
| Math (word problems) | GSM8K | 100 | Numerical answer match |
| Data-to-Text | ToTTo | 90 | BLEU |
| Summary (multi-doc) | Summary of a Haystack | 90 | LLM-as-judge (0–100) |

**Scale**: N=10 replicates × 600 instructions × 5 simulation modes × 15 models ≈ 200,000+ conversations; total cost ~$5,000.

---

## Results

### Overall Performance Degradation

Across all 15 models and 6 tasks, the mean performance drop from Full to Sharded is **39 percentage points** (Full ≈ 90%, Sharded ≈ 65% average accuracy, normalized to 0–100 scale). Concat is ≈ 95% of Full, confirming rephrasing is not the cause.

Representative model-level Sharded/Full ratios:
- GPT-4.1: 61.8%
- Llama 3.3-70B: ~63%
- Claude 3.7 Sonnet: 65.9%
- Gemini 2.5 Pro: 64.5%
- DeepSeek-R1: 60.8%

No significant correlation between model size or single-turn capability rank and resilience to multi-turn degradation. Frontier models degrade 35–40% just like smaller models.

### Aptitude vs. Reliability (Figure 6b)

Decomposing the performance drop:
- **Aptitude** ($A^{90}$): drops by an average of **–16%** (Full → Sharded). The model can still solve the task when things go right.
- **Unreliability** ($U^{90}_{10}$): increases by an average of **+112%** (Full → Sharded). Variance between runs explodes.

In single-turn settings, high-capability models have both high aptitude and low unreliability. In multi-turn settings, this coupling breaks: all models converge toward high unreliability (~50-point spread between 10th/90th percentiles) regardless of their single-turn capability. The model hasn't forgotten how to do the task — it just gets lost stochastically depending on early-turn choices.

### Task-Specific Observations

Code shows the most severe drops (27–43% of Full retained); Summary shows the most consistent degradation (10–31% retained). Actions shows the widest variance across models (27–72% retained), with Command-A most resilient on this task.

### Temperature Experiments (Table 3)

Reducing temperature from 1.0 to 0.0:
- **Single-turn (Full, Concat)**: large reliability gains — GPT-4o-mini $U^{90}_{10}$ drops from 16.0 to 6.8 (57%).
- **Multi-turn (Sharded)**: nearly no effect — GPT-4o-mini $U^{90}_{10}$ remains 30–51 across all temperatures. Even T=0.0 yields ~30% unreliability.

Interpretation: multi-turn errors are not token-sampling noise. They are cascading errors from early-turn decisions that propagate irreversibly through context. Greedy decoding cannot fix a wrong assumption made in turn 2.

### Recap & Snowball Recovery (Table 2)

Tested on 4 tasks × 2 models:
- **GPT-4o-mini**: Sharded 50.4% → Recap 66.5% (+16 pts) → Snowball 61.8% (+11 pts)
- **GPT-4o**: Sharded 59.1% → Recap 76.6% (+18 pts) → Snowball 65.3% (+6 pts)

Recap requires knowing when the conversation ends (unrealistic in deployment). Snowball is achievable with agent-level preprocessing and recovers ~11–18 points, but still leaves a substantial gap relative to Full performance.

### Gradual Sharding (Figure 6c)

Even splitting an instruction into just **2 shards** triggers the full unreliability spike. The effect is binary: any underspecification beyond a single turn causes degradation. Granularity (2 vs. 8 shards) does not substantially alter the magnitude.

### Root Cause Analysis (Qualitative, Appendix F)

Four failure modes identified from log inspection:
1. **Premature answer attempts**: model proposes a full solution after Shard 1 or 2, before all constraints are revealed; subsequent turns cannot correct its commitment.
2. **Answer bloat**: prior incorrect answers accumulate in context; model conflates user-provided requirements with its own earlier (wrong) outputs.
3. **Recency bias**: final-turn information dominates; middle-turn constraints are forgotten.
4. **Excessive verbosity**: reasoning models (o3, DeepSeek-R1) generate 33% longer responses on average, introducing unwarranted assumptions that compound later errors.

---

## Limitations & Caveats

1. **Benign user simulator**: the LLM-based user simulator always reveals shards in a cooperative, task-completion-oriented way. Real users may give conflicting instructions, express frustration, or deviate from task focus — expected to worsen degradation.
2. **Guaranteed termination**: the simulation is designed to always provide sufficient information to solve the task eventually. Real conversations may leave tasks under-constrained.
3. **English only**: no multilingual or multimodal evaluation.
4. **Analytical tasks only**: creative writing and open-ended generation excluded due to lack of reliable automated metrics.
5. **Automation errors**: LLM-based evaluation components introduce potential noise; manual inspection of 200+ conversations shows <5% error rate and <2% where errors favor the assistant.

The authors explicitly frame these as a "benign testing ground" — the clean experimental setup likely **underestimates** real-world degradation.

---

## Why It Matters / Implications

The finding that unreliability, not aptitude, is the primary failure mode is practically important: it means the capability to solve tasks is largely preserved — the problem is architectural or training-related brittleness in how context is maintained and integrated across turns. This is not a capability problem that more parameters will trivially solve; it is a training problem (models are not trained on natural multi-turn underspecification at scale).

Practical takeaways:
- **Users**: if a model gets confused mid-conversation, restarting from scratch with all context in one message is the most effective current fix.
- **System builders**: agent-level Snowball preprocessing (restating prior shards each turn) recovers ~15 points but cannot close the gap — it is a bandage, not a cure.
- **Model developers**: the paper is a call to include multi-turn underspecified evaluation in training and evaluation pipelines. The benchmark, code, and 200,000+ simulated conversations are all publicly released.

The Best Paper Award at ICLR 2026 signals community recognition that this is an under-studied problem with strong practical stakes.

---

## Related Work Context

- **HumanEval multi-turn variants** (precursor critique): this paper was motivated partly by observing that prior multi-turn code benchmarks were not ecologically valid. The Concat ablation is designed to isolate and rule out the prior method's confound (rephrasing artifacts).
- **[2602.07338] Intent Mismatch Causes LLMs to Get Lost in Multi-Turn Conversation**: a concurrent follow-up on arXiv that extends the analysis to intent mismatch as a specific causal mechanism; referenced in the search results but not the primary paper.
- **Long-context benchmarks** (RULER, NIAH, etc.): address a different axis — raw context length capacity, not multi-turn incremental revelation. A model can handle 128K tokens and still get lost at turn 3.
- **MemAgent** (ICLR 2026 Oral, same session): addresses long-context via a memory management agent trained with RL; orthogonal failure mode, but both papers point to limitations in how transformers aggregate information over extended interactions.

---

## Notes on Rafael's Journal

Rafael's notes are broadly correct. A few clarifications for the blog post:

- He mentions "HumanEval3" as the motivation — this appears to be his shorthand for multi-turn HumanEval-derived benchmarks the authors critique. The actual critique is of HumanEval-based multi-turn variants in prior work; clarify this in the post.
- "They came up with sharded Human Eval" — the paper is not limited to HumanEval; it covers 6 tasks (code, database, actions, math, data-to-text, summary) from multiple source benchmarks. Code is sourced from HumanEval + LiveCodeBench but the framework is general.
- "Models do not drop in aptitude" — this is confirmed as the paper's finding ($A^{90}$ drops only ~16%), but Rafael should be careful: aptitude does drop somewhat, it just isn't the primary driver. The dominant effect is unreliability (+112%).
- Rafael noted the **Best Paper Award** for this paper in the Opening Talk section of his notes — confirmed correct.
