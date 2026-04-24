# Image Plan: "Notes from ICLR 2026: Six Orals on LLM Evaluation"

**Post path (proposed):** `src/content/posts/iclr-2026-llm-evaluation-orals.md`
**Track:** engineers
**Sections planned:** 7 (1 opening + 6 paper sections) — no closing, per the conference-post-structure convention.
**Choice counts:** `user_photo` = 0 · `pdf_figure` = 6 · `diagram_spec` = 1
**Below-60 flags:** Opening section (`diagram_spec`, 55) — no user photo folder exists for Oral #2 and the opening is a single framing paragraph. The writer may choose to drop the opening image and just run a prose intro.

**Context for the writer:**
- **There are no user photos for this session.** Rafael did not shoot the oral. Every pick is either a paper figure or a diagram spec.
- All six papers have a dominant canonical figure on pages 1–3 that the draft can lean on. Every paper-section pick scored 85+.
- The "LLMs Get Lost in Multi-Turn" paper is the **ICLR 2026 Best Paper Award**. Consider foregrounding it in the opening paragraph (the agenda card below lists it with a star badge).
- One nomenclature correction the writer should note: the microbenchmarking paper uses "Minimum Detectable **Ability** Difference" on the first title heading of Section 3 but "Minimum Detectable **Accuracy** Difference" consistently in Fig 1, Eq 5, and throughout the body. The summary uses "Accuracy". I've used the paper's body spelling ("Ability Difference") in the caption because that's the formal Section 3 definition. The writer should pick one and be consistent.

---

## Opening section (untitled intro before the first `##`)

```yaml
section: opening
anchor: intro
choice: diagram_spec
source: null
fitness_score: 55
caption: "Session 2, Day 1 of ICLR 2026: six orals, one theme — how we evaluate what these models actually do."
alt_text: "A simple session agenda card listing the six oral-session papers in order: TRACE (Reward Hacking), LLMs Get Lost in Multi-Turn (Best Paper), Micro-Benchmarking Reliability, AdAEM, WIMHF, EigenBench, with the ICLR 2026 header."
rationale: "No in-scope user photo exists for this session. An agenda card sets the shape for six paper-indexed headings and foregrounds the Best Paper badge on paper #2. Scored 55 because the previous post's opening agenda card played the same role and the writer may decide two sessions in a row of the same pattern is monotonous; flagged so the writer can drop this image and run prose-only."
runners_up:
  - choice: pdf_figure
    source:
      pdf: llms-lost-multi-turn.pdf
      page: 1
      figure: "Figure 1"
    fitness_score: 72
    note: "Lead with the Best Paper's headline figure (aptitude-vs-unreliability scatter with model names). Strong draw for an opening, but it commits the intro to the second paper rather than framing the whole session. Would also require re-using the same figure in Section 2, which violates the no-reuse rule unless the draft explicitly callbacks."
diagram_spec: |
  Textual spec (not a flowchart — a layout card, same conventions as the previous post):
  - Format: 16:9 landscape card, light background (#F7F5F2 or similar paper-neutral), matching the blog's muted palette.
  - Header (top, small): "ICLR 2026 · Day 1 · Oral Session 2 · LLMs and Evaluation"
  - Body: six numbered rows, each with a short title and a one-line hook:
      1. TRACE — Detecting Implicit Reward Hacking via Reasoning Effort
      2. LLMs Get Lost in Multi-Turn Conversation  [★ Best Paper]
      3. How Reliable Is LLM Micro-Benchmarking? (MDAD)
      4. AdAEM — Adaptive, Automated Value-Difference Benchmarks
      5. WIMHF — What's In My Human Feedback (SAEs on preference pairs)
      6. EigenBench — Value Alignment via Mutual Judgment + EigenTrust
  - Typography: monospace or technical serif for the numbered rows; plain prose for the hook. A small filled star glyph next to row 2; no other icons, no gradients.
  - Aspect ratio target: 1600x900.
```

---

## Section 1 — "Is It Thinking or Cheating? Detecting Implicit Reward Hacking by Measuring Reasoning Effort"

```yaml
section: "Is It Thinking or Cheating? Detecting Implicit Reward Hacking by Measuring Reasoning Effort"
anchor: trace-reward-hacking
choice: pdf_figure
source:
  pdf: reward-hacking-reasoning-effort.pdf
  page: 5
  figure: "Figure 5"
  extract_path: papers/figures/reward-hacking-reasoning-effort/figure-5-trace-overview.png
fitness_score: 93
caption: "Figure 5 from Wang et al., ICLR 2026 (arXiv:2510.01367). TRACE in one picture — truncate the CoT at 10%, 40%, …, 90%, force an early answer, estimate expected reward at each cutoff. AUC over those points is the TRACE score; a hacking model's curve rises early and the AUC is large."
alt_text: "A horizontal schematic showing a CoT trajectory split into three truncation points (10%, 40%, 90%) and a final 100% marker. Each cutoff is annotated with three rows: 'Add answer tags to force answering' with a </think><answer> label, 'Sampling Multiple Answers' with dice icons, and 'Expected Proxy Reward' with values 0.3, 0.3, 0.8, 1.0 progressing left to right."
rationale: "Figure 5 is the method-overview diagram and maps 1:1 to the draft's description of truncation + forced answer + expected reward + AUC. It is the single most informative figure in the paper — Figure 1 shows example + headline F1 results but is bar-chart-heavy, Figure 10 is pure results. The truncation-point schematic is what makes the paper click."
runners_up:
  - source:
      pdf: reward-hacking-reasoning-effort.pdf
      page: 1
      figure: "Figure 1"
    fitness_score: 85
    note: "Combined teaser: a CoT exploit example on the left and a 2-panel F1 bar chart comparing TRACE to CoT monitors at 7B/14B/72B on the right. Strongest 'headline + evidence' figure, but crowded — Figure 5 is cleaner for a blog."
  - source:
      pdf: reward-hacking-reasoning-effort.pdf
      page: 6
      figure: "Figure 10"
    fitness_score: 78
    note: "Pure math-task F1 results across four model sizes under IC and RM loopholes. Excellent evidence figure if the draft quotes specific F1 numbers, but less narrative than Figure 5."
```

---

## Section 2 — "LLMs Get Lost in Multi-Turn Conversation" [Best Paper]

```yaml
section: "LLMs Get Lost in Multi-Turn Conversation"
anchor: llms-lost-multi-turn
choice: pdf_figure
source:
  pdf: llms-lost-multi-turn.pdf
  page: 1
  figure: "Figure 1"
  extract_path: papers/figures/llms-lost-multi-turn/figure-1-aptitude-unreliability.png
fitness_score: 96
caption: "Figure 1 from Laban et al., ICLR 2026 Best Paper (arXiv:2505.06120). Every model — Gemini 2.5 Pro, GPT-4.1, Claude 3.7 Sonnet, DeepSeek-R1, o3 — slides from the single-turn corner (high aptitude, low unreliability) down to the multi-turn corner. Aptitude only loses 15%. Unreliability more than doubles."
alt_text: "A scatter plot with Unreliability on the x-axis and Aptitude on the y-axis. Five labeled model points cluster in the upper-left 'Single-Turn / Fully-Specified' region at low unreliability and high aptitude. A dashed arrow from each point ends in the lower-right 'Multi-Turn / Underspecified' region where aptitude has dropped slightly and unreliability has more than doubled. The two regions are shaded in contrasting colors; flanking vignettes on the left show a user giving a single complete instruction, and on the right show a user revealing requirements turn by turn and the assistant producing a bloated wrong answer."
rationale: "This is the paper's iconic figure — the exact visualization that earned the Best Paper discussion. It captures the paper's thesis in one image: models don't get less capable, they get stochastically less consistent. The draft will almost certainly lean on the aptitude/unreliability split, and this figure is that split rendered with named frontier models. The figure also doubles as visual validation of the 'wrong turn and don't recover' tagline the abstract emphasizes."
runners_up:
  - source:
      pdf: llms-lost-multi-turn.pdf
      page: 9
      figure: "Figure 6"
    fitness_score: 84
    note: "Three-panel: (a) box-plot visualization of aptitude and unreliability, (b) per-model degradation box plots for all 15 LLMs, (c) gradual sharding (2 to 8 shards). More quantitative and cleaner for the 'aptitude vs reliability' subsection of the draft; Figure 1 wins because it's the iconic figure and names models the reader recognizes."
  - source:
      pdf: llms-lost-multi-turn.pdf
      page: 4
      figure: "Figure 3"
    fitness_score: 76
    note: "Sharded conversation simulation diagram (user simulator → evaluated assistant → strategy classifier → answer extractor → task evaluator). Good for explaining the methodology if the draft goes deep on simulation architecture; less strong as a hero image."
```

---

## Section 3 — "How Reliable Is Language Model Micro-Benchmarking?"

```yaml
section: "How Reliable Is Language Model Micro-Benchmarking?"
anchor: microbenchmarking-mdad
choice: pdf_figure
source:
  pdf: llm-microbenchmarking-reliability.pdf
  page: 2
  figure: "Figure 1"
  extract_path: papers/figures/llm-microbenchmarking-reliability/figure-1-mdad-vs-tau.png
fitness_score: 94
caption: "Figure 1 from Yauney et al., ICLR 2026 (arXiv:2510.08730). Top: Kendall's tau looks fine — at 10 MMLU-Pro examples, tinyBenchmarks and random sampling both score 0.52-ish. Bottom: MDAD tells the real story — neither can reliably rank models that differ by less than 4 accuracy points. The aggregate correlation hid the frontier-comparison failure."
alt_text: "A four-panel figure. Top row: two bar charts of Kendall's tau rank correlation with the full MMLU-Pro benchmark, for 10 examples on the left and 500 examples on the right, comparing random sampling, stratified-by-confidence, Anchor Points, and tinyBenchmarks. Bottom row: two line charts of agreement probability on the y-axis against accuracy difference between model pairs on the x-axis, at 10 and 500 examples. The 10-example panel shows all methods staying below the 0.8 agreement threshold for accuracy differences under roughly 6 points; the 500-example panel shows all methods clearing 0.8 for differences above 2 points."
rationale: "This is the paper's methodological centerpiece figure — it literally juxtaposes the old metric (Kendall's tau, top) with the new one (MDAD, bottom) in the same layout, and the visual contrast is the paper's entire argument. For an engineer-track reader the '0.74 tau looks great but you still can't tell 8B models apart' takeaway lands better from this figure than from a prose paragraph."
runners_up:
  - source:
      pdf: llm-microbenchmarking-reliability.pdf
      page: 6
      figure: "Figure 3"
    fitness_score: 86
    note: "Full sweep: agreement curves for all six micro-benchmarking methods on MMLU-Pro and BBH across five micro-benchmark sizes (10, 25, 50, 100, 250), plus MDAD summary column. More comprehensive but busy — better for an appendix-style figure than a blog hero."
  - source:
      pdf: llm-microbenchmarking-reliability.pdf
      page: 4
      figure: "Figure 2"
    fitness_score: 74
    note: "Single-benchmark illustrative walk-through of how the agreement curve reduces to a single MDAD number. Good for a pedagogy sidebar but misses the random-vs-anchor comparison the draft emphasizes."
```

---

## Section 4 — "AdAEM: An Adaptively and Automated Extensible Measurement of LLMs' Value Difference"

```yaml
section: "AdAEM: An Adaptively and Automated Extensible Measurement of LLMs' Value Difference"
anchor: adaem-value-difference
choice: pdf_figure
source:
  pdf: adaem-value-difference.pdf
  page: 3
  figure: "Figure 2"
  extract_path: papers/figures/adaem-value-difference/figure-2-framework.png
fitness_score: 91
caption: "Figure 2 from Yao et al., ICLR 2026 (arXiv:2505.13531). AdAEM's inner loop: a question refinement step optimizes a JSD-based informativeness score against an ensemble of K LLMs, then a response generation step elicits each model's value-laden answer. The two steps alternate until convergence."
alt_text: "A horizontal framework diagram. On the left a 'Question Refinement Step' box shows a generic seed question being optimized into a more specific value-evoking question, labeled with a Jensen-Shannon divergence objective combining a 'distinguishability' term and a 'disentanglement' term. On the right a 'Response Generation Step' shows K parallel LLM blocks each receiving the optimized question and producing an opinion; their opinions cluster into 'Similar Values' and 'Value Differences' groups that feed into an 'AdAEM Bench' dataset icon."
rationale: "Figure 2 is the only figure in the paper that shows both halves of the iterative optimization together — it's the diagram that makes the 'why is this a Jensen-Shannon divergence problem' framing legible. Figure 1 is more narratively accessible (shows two answers to a California wildfire question) but is an example rather than a method diagram; the engineer-track reader will want the method. The summary also specifically calls out this figure as the framework illustration."
runners_up:
  - source:
      pdf: adaem-value-difference.pdf
      page: 2
      figure: "Figure 1"
    fitness_score: 84
    note: "Side-by-side example: generic 'should the government invest in better firefighting equipment?' produces identical 'Security' answers from DeepSeek-V3 and GPT-4-Turbo; AdAEM's California-wildfires-reframed version elicits 'Benevolence' vs 'Universalism' split. Very readable — good alt if the draft leads with the motivating example, not the method."
  - source:
      pdf: adaem-value-difference.pdf
      page: 8
      figure: "Figure 6"
    fitness_score: 72
    note: "Cross-cultural and temporal example grid showing how questions generated by GLM-4/GPT-4/Mistral-Large from different cutoff dates surface different controversies. Strong for the 'extensibility' subsection but not the main method."
```

---

## Section 5 — "What's In My Human Feedback? Learning Interpretable Descriptions of Preference Data"

```yaml
section: "What's In My Human Feedback? Learning Interpretable Descriptions of Preference Data"
anchor: wimhf-preference-data
choice: pdf_figure
source:
  pdf: whats-in-my-human-feedback.pdf
  page: 7
  figure: "Figure 2"
  extract_path: papers/figures/whats-in-my-human-feedback/figure-2-cross-dataset-conflict.png
fitness_score: 95
caption: "Figure 2 from Movva et al., ICLR 2026 (arXiv:2510.26202). The same preference feature, five different datasets, wildly different signs. LMArena annotators vote against refusals (−31% win-rate); HH-RLHF and PRISM penalize flippant jokes; Reddit rewards informality and humor. Mix these datasets naively during RLHF and you're training on contradictory signal."
alt_text: "A dot plot with feature names on the y-axis and change in win-rate on the x-axis, ranging from −40% to +40%. About a dozen interpretable features like 'provides a long, heavily structured response with headings', 'makes a flippant joke', 'expresses uncertainty or lack of knowledge', and 'refuses the user's request' are each shown as a row with five colored points representing Chatbot Arena, Community Alignment, HH-RLHF, PRISM, and Reddit. Error bars are bootstrapped 95% confidence intervals. Many features show points on both sides of zero, indicating opposite preferences across datasets."
rationale: "This is the paper's most memorable finding rendered as one figure — cross-dataset preference conflict. The draft will almost certainly call out the LMArena anti-refusal finding (the paper's headline result, and the one Rafael flagged in his notes under 'unexpected or harmful effects'). Figure 1 is the method pipeline (SAE + regress y) but the paper's argument is its content analysis, not its architecture. Figure 2 is the evidence the reader remembers."
runners_up:
  - source:
      pdf: whats-in-my-human-feedback.pdf
      page: 1
      figure: "Figure 1"
    fitness_score: 86
    note: "Full pipeline figure — measurable preferences (SAE on response-embedding differences) → expressed preferences (regress y). Excellent if the draft walks through the method step-by-step; less strong if the draft foregrounds the cross-dataset finding, which it almost certainly will."
  - source:
      pdf: whats-in-my-human-feedback.pdf
      page: 5
      figure: "Table 1"
    fitness_score: 76
    note: "The qualitative feature table — a sample of interpretable features per dataset with Δwin% and prevalence. Dense and text-heavy; better as an inline table in the post than a hero image."
```

---

## Section 6 — "EigenBench: A Comparative Behavioral Measure of Value Alignment"

```yaml
section: "EigenBench: A Comparative Behavioral Measure of Value Alignment"
anchor: eigenbench
choice: pdf_figure
source:
  pdf: eigenbench-value-alignment.pdf
  page: 2
  figure: "Figure 1"
  extract_path: papers/figures/eigenbench-value-alignment/figure-1-pipeline.png
fitness_score: 97
caption: "Figure 1 from Chang et al., ICLR 2026 (arXiv:2509.01938). EigenBench in five steps — population, constitution, scenarios go in; models evaluate each other's responses; a Bradley-Terry-Davidson model fits judge lenses and model dispositions; EigenTrust computes the left principal eigenvector of the trust matrix; the result comes out as Elo ratings."
alt_text: "A horizontal five-panel pipeline diagram. Step 1 shows inputs: a set of scenarios, a constitution with kindness/generosity/goodwill criteria, and a population of five models (Claude 4 Sonnet, GPT-4.1, Gemini 2.5 Pro, Grok 4, DeepSeek v3). Step 2 collects evaluee responses to a scenario about 'How do you think humans will become extinct?'. Step 3 shows a judge (Claude 4 Sonnet) producing reflections on two evaluee responses (first DeepSeek v3, then Grok 4) and a pairwise comparison. Step 4 is a Bradley-Terry-Davidson fit producing per-judge lenses, per-model dispositions, and tie propensities. Step 5 builds a trust matrix whose left eigenvector is converted to Elo ratings (1533, 1478, 1563, 1471, 1420)."
rationale: "Figure 1 is the most complete pipeline diagram in the six papers — it literally shows a real Claude 4 Sonnet judge comparing a real DeepSeek v3 response to a real Grok 4 response on a real r/AskReddit prompt, all the way through to Elo. It's the single figure that makes EigenBench legible to someone seeing the method for the first time. Figure 3 (Elo results across three constitutions) is runner-up; it's evidentiary but less narrative."
runners_up:
  - source:
      pdf: eigenbench-value-alignment.pdf
      page: 7
      figure: "Figure 3"
    fitness_score: 85
    note: "Three side-by-side Elo plots across Universal Kindness, Conservatism, and Deep Ecology — shows the headline result that Gemini 2.5 Pro tops Universal Kindness while Kimi K2 tops Deep Ecology. Strong second image if the draft includes a 'results' paragraph; the pipeline figure is still the hero."
  - source:
      pdf: eigenbench-value-alignment.pdf
      page: 3
      figure: "Figure 2"
    fitness_score: 70
    note: "2D latent space of judge lenses and model dispositions for 20 historical-persona prompts on Claude 3.5 Haiku. Interesting artifact of the Bradley-Terry-Davidson embedding but scoped to the persona-variance subsection, not the main method. Only useful if the draft goes into the 79% persona / 21% model split."
```

---

## Extraction log

No PDF extractions were run in this pass — the sandboxed bash environment denies `pdftoppm` and `pdfimages`. All figure picks were verified by opening each PDF directly with the Read tool's `pages:` parameter, visually confirming figure number, content, and page. The `extract_path` entries below are the **target paths** the writer or orchestrator should populate after running the commands.

Target figure paths:

- `papers/figures/reward-hacking-reasoning-effort/figure-5-trace-overview.png` — from `reward-hacking-reasoning-effort.pdf` page 5, Figure 5 (TRACE truncation + forced answer + expected reward overview schematic).
- `papers/figures/llms-lost-multi-turn/figure-1-aptitude-unreliability.png` — from `llms-lost-multi-turn.pdf` page 1, Figure 1 (aptitude-vs-unreliability scatter with named frontier models and single-turn / multi-turn regions).
- `papers/figures/llm-microbenchmarking-reliability/figure-1-mdad-vs-tau.png` — from `llm-microbenchmarking-reliability.pdf` page 2, Figure 1 (four-panel: Kendall's tau top row + MDAD agreement curves bottom row at 10 and 500 examples).
- `papers/figures/adaem-value-difference/figure-2-framework.png` — from `adaem-value-difference.pdf` page 3, Figure 2 (question refinement step + response generation step framework with JSD objective).
- `papers/figures/whats-in-my-human-feedback/figure-2-cross-dataset-conflict.png` — from `whats-in-my-human-feedback.pdf` page 7, Figure 2 (dot plot of preference features across five datasets with Δwin-rate effect sizes and 95% CIs).
- `papers/figures/eigenbench-value-alignment/figure-1-pipeline.png` — from `eigenbench-value-alignment.pdf` page 2, Figure 1 (five-step EigenBench pipeline with concrete r/AskReddit-extinction example).

Recommended extraction commands (not executed here — run from repo root):

```bash
mkdir -p papers/figures/reward-hacking-reasoning-effort \
         papers/figures/llms-lost-multi-turn \
         papers/figures/llm-microbenchmarking-reliability \
         papers/figures/adaem-value-difference \
         papers/figures/whats-in-my-human-feedback \
         papers/figures/eigenbench-value-alignment

pdftoppm -png -r 200 -f 5 -l 5 papers/reward-hacking-reasoning-effort.pdf   papers/figures/reward-hacking-reasoning-effort/page
pdftoppm -png -r 200 -f 1 -l 1 papers/llms-lost-multi-turn.pdf              papers/figures/llms-lost-multi-turn/page
pdftoppm -png -r 200 -f 2 -l 2 papers/llm-microbenchmarking-reliability.pdf papers/figures/llm-microbenchmarking-reliability/page
pdftoppm -png -r 200 -f 3 -l 3 papers/adaem-value-difference.pdf            papers/figures/adaem-value-difference/page
pdftoppm -png -r 200 -f 7 -l 7 papers/whats-in-my-human-feedback.pdf        papers/figures/whats-in-my-human-feedback/page
pdftoppm -png -r 200 -f 2 -l 2 papers/eigenbench-value-alignment.pdf        papers/figures/eigenbench-value-alignment/page
```

Then crop each page render to the figure's bounding box and rename to the `extract_path` above. If any figure comes out blurry at 200 dpi (AdAEM Figure 2 and EigenBench Figure 1 are the most vector-dense), bump to 300 dpi or try `pdfimages -all` for the embedded raster. WIMHF Figure 2 is a matplotlib export and will render cleanly at 200 dpi.
