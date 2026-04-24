# Image Plan — ICLR 2026 Day 2 Oral Session #1: ML Architectures and Training I

## Summary

- **Post slug:** `iclr-2026-ml-architectures-orals`
- **Total sections:** 6 (1 opening + 5 paper sections)
- **Counts by choice type:**
  - `user_photo`: 4
  - `pdf_figure`: 2
  - `diagram_spec`: 0
- **Sections with fitness < 60:** none
- **User photos cut:** 9 total, 6 selected, 3 rejected (see Extraction log for rationale)
- **Hero image:** Optimal Sparsity title slide with speaker at podium (upright, atmospheric, session-opening quality)

The mix skews toward user photos because Rafael shot several upright, legible frames this session (two title slides with speakers visible, plus well-composed bullet slides that rotate cleanly). For WSM we pick the iconic Figure 1 schedule triptych because it does narrative work the room photos can't (three side-by-side LR curves), and for Infinite Compute we pick Figure 1 because the 5.17× data-efficiency plot is the paper's flagship contribution.

---

## Opening

```yaml
section: "Opening"
choice: user_photo
source: src/content/journal/iclr-2026/Óptimas Sparsity of MoE/20260424_110028.jpg
target_path: src/content/posts/iclr-2026-ml-architectures-orals/hall-optimal-sparsity-title.jpg
corrections: []
caption: "Day 2 at ICLR 2026. Oral Session on ML Architectures and Training I opens with Taishi Nakamura presenting Optimal Sparsity of MoE for Reasoning Tasks. The session reads like a single conversation about how we actually train these things."
alt_text: "Conference hall with audience seated facing a projected title slide reading 'Optimal Sparsity of Mixture-of-Experts Language Models for Reasoning Tasks, ICLR 2026'. A speaker in a white shirt stands at the podium beside a laptop."
fitness_score: 88
rationale: "Upright, in-focus, shows audience, speaker at podium, and a readable title slide with the ICLR 2026 badge. This is a rare atmospheric shot from this session and it grounds the post in the actual room. Score in the high 80s per the new memory rule — the photo's content is strong even though the exposure is slightly dim."
runners_up:
  - source: src/content/journal/iclr-2026/How LR Decay Wastes/20260424_111308.jpg
    fitness_score: 82
    note: "Also upright with speaker and title slide, but the opening section is better anchored by the session's first talk rather than the third."
```

---

## Section 1: WSM — Decay-Free Learning Rate via Checkpoint Merging

```yaml
section: "WSM: Decay-Free Learning Rate via Checkpoint Merging"
choice: pdf_figure
source: {pdf: "wsm-decay-free-lr.pdf", page: 1, figure: "Figure 1"}
extract_path: papers/figures/wsm-decay-free-lr/fig1-schedule-comparison.png
target_path: src/content/posts/iclr-2026-ml-architectures-orals/wsm-schedule-comparison.png
caption: "Figure 1 from Tian et al., ICLR 2026. Cosine LRS requires a full restart to change the decay curve. WSD inserts a stable phase but still commits you to a decay shape up front. WSM keeps LR constant forever and emulates decay after the fact by merging checkpoints."
alt_text: "Three side-by-side plots of learning rate versus training progression. Left: Standard Cosine LRS, a smooth decline from the peak labeled 'Continual training requires a full restart at this point'. Middle: WSD, flat at peak then linear decline, labeled 'Roll back to this point to continue training or re-decay'. Right: WSM (Ours), flat at peak with a dashed branch showing 'Simulating various learning rate decays via checkpoint merging'."
fitness_score: 95
rationale: "This is the paper's canonical explainer figure and it captures the exact three-schedule comparison Rafael's journal opens the section with ('Cosine needs to restart, WSD is flexible but still requires pre-specification, WSM keeps LR constant and merges'). The two WSM photos show the Cosine and WSD limitation slides but not the WSM schedule itself, and they are both rotated. The figure wins decisively on both information content and clarity."
runners_up:
  - source: src/content/journal/iclr-2026/WSM Decay/20260424_105012.jpg
    fitness_score: 72
    note: "Rotated 90° CW. Slide reads 'Limitations of WSD' with the exact 'When to start? How long to decay? Which curve?' bullets from Rafael's notes. Strong content, but loses to Figure 1 which shows all three schedules in one frame."
  - source: src/content/journal/iclr-2026/WSM Decay/20260424_104837.jpg
    fitness_score: 68
    note: "Rotated 90° CW. 'Limitations of Cosine LRS' slide. Only depicts one of the three schedules."
```

---

## Section 2: Optimal Sparsity of MoE for Reasoning Tasks

```yaml
section: "Optimal Sparsity of MoE for Reasoning Tasks"
choice: user_photo
source: src/content/journal/iclr-2026/Óptimas Sparsity of MoE/20260424_110617.jpg
target_path: src/content/posts/iclr-2026-ml-architectures-orals/optimal-sparsity-same-loss-different-reasoning.jpg
corrections:
  - "sips -r -90 <path>"
caption: "Same training loss, different reasoning performance. At fixed cross-entropy, denser MoE configurations (lower sparsity) do better on GSM8K and GSM-Plus while TriviaQA and HellaSwag are essentially insensitive. Validation loss is not the right yardstick for reasoning."
alt_text: "Projected slide titled 'Same Training Loss, Different Reasoning Performance' showing four error-rate-versus-training-loss plots across TriviaQA, HellaSwag, GSM8K and GSM-Plus, color-coded by sparsity level from 0.000 to 0.984. The memorization task plots collapse onto a single curve while the reasoning plots fan out by sparsity."
fitness_score: 84
rationale: "The slide directly captures the paper's most cited finding — the iso-loss reasoning gap — which is the whole point of the section. Photo is rotated 90° CCW (needs sips -r -90) but the text and plots read cleanly. Per the new memory rule, a rotated-but-subject-clear photo is 80+, not 50, and this one shows exactly what the section argues."
runners_up:
  - source: "Figure 4, page 6 of optimal-sparsity-moe.pdf"
    fitness_score: 80
    note: "The PDF figure is the cleaner version of the same finding, but shipping Rafael's photo preserves the room context and shows that he caught this exact slide."
  - source: src/content/journal/iclr-2026/Óptimas Sparsity of MoE/20260424_110523.jpg
    fitness_score: 76
    note: "Rotated 90° CCW. 'Validation Loss Does Not Always Predict Task Loss' slide — same argument but earlier framing. Narrowly loses to 110617 because 110617's iso-loss plot is the more surprising / load-bearing finding."
```

---

## Section 3: How Learning Rate Decay Wastes Your Best Data (CDMA)

```yaml
section: "How LR Decay Wastes Your Best Data in Curriculum LLM Pretraining"
choice: user_photo
source: src/content/journal/iclr-2026/How LR Decay Wastes/20260424_111308.jpg
target_path: src/content/posts/iclr-2026-ml-architectures-orals/lr-decay-wastes-title-slide.jpg
corrections: []
caption: "Kairong Luo (Tsinghua / Peng Cheng Lab) presenting How Learning Rate Decay Wastes Your Best Data in Curriculum-Based LLM Pretraining. The core message under the title bar: data curriculum is useful, but strong LR decay wastes the high-quality data."
alt_text: "Conference stage. Projected title slide reads 'ICLR 2026 Oral — How Learning Rate Decay Wastes Your Best Data in Curriculum-Based LLM Pretraining' with author list Kairong Luo, Zhenbo Sun, Haodong Wen, Xinyu Shi, Jiarui Cui, Chenyi Dang, Kaifeng Lyu, Wenguang Chen, affiliated with Tsinghua University and Peng Cheng Laboratory. A speaker in a red jacket stands at a podium to the right of the screen."
fitness_score: 90
rationale: "Upright, crisp, shows the speaker and the full title with authors. The core message subtitle is even visible on the slide ('data curriculum is useful, but strong LR decay wastes the high-quality data'), which is the section's thesis. Per the memory rule, upright title-slide-plus-speaker photos from this session are gold and should score 85+. A PDF method figure (Figure 1, four-panel LR schedule diagnostic) would be an excellent runner-up but the photo's atmosphere wins for this paper because the speaker and affiliation are part of the story."
runners_up:
  - source: "Figure 1, page 2 of lr-decay-wastes-data.pdf"
    fitness_score: 85
    note: "The 4-panel diagnostic (Constant/WSD/Cosine × Ascend/Descend/Uniform) is the paper's canonical method figure. Strong alternative if the post needs a second image for this section."
```

---

## Section 4: Softmax Transformers are Turing-Complete

```yaml
section: "Softmax Transformers are Turing-Complete"
choice: user_photo
source: src/content/journal/iclr-2026/Softmax Transformers Turing/20260424_112909.jpg
target_path: src/content/posts/iclr-2026-ml-architectures-orals/softmax-turing-main-results.jpg
corrections:
  - "sips -r -90 <path>"
caption: "The TL;DR slide from Jiang, Hahn, Zetzsche and Lin. Theorem informal: length-generalizable softmax CoT transformers are Turing-complete. Experimental result: the construction is validated by training transformers to recognize non-trivial arithmetic languages, including prime numbers, exponentials, division, GCD and multiplication."
alt_text: "Projected slide titled 'Main Results in Our Paper' with two text blocks. The first is labeled Theorem (informal) and states that length-generalizable softmax transformers are Turing-complete. The second is labeled Experimental result and describes training length-generalizable transformers that recognize arithmetic languages. A TLDR paragraph at the bottom summarizes the first Turing-completeness proof of learnable transformers backed up with experiments."
fitness_score: 82
rationale: "Rafael's journal literally references 'View image Main Results in Our Paper' for this talk, and this photo IS that slide. Rotated 90° CCW but the text is large and legible after correction. The alternative (PDF Table 2 of empirical results) is more information-dense but less narratively useful for a first-pass blog reader; this slide is the author's own summary of the whole paper. Content-first scoring per the memory rule."
runners_up:
  - source: src/content/journal/iclr-2026/Softmax Transformers Turing/20260424_113227.jpg
    fitness_score: 78
    note: "Rotated 90° CCW. 'Length-Generalizable CoT Transformers' definition slide — the formal definition Rafael mentions. Clean image, good contrast. Loses to 112909 only because the TL;DR slide is the better section-opener."
  - source: "Table 2, page 10 of softmax-transformers-turing.pdf"
    fitness_score: 74
    note: "The empirical results table — Unary / Binary w/ RPE / Binary w/o RPE on three test splits. Shows the dramatic collapse (0.0% on test_2 without RPE). Less narrative than the TL;DR slide but more quantitatively satisfying."
```

---

## Section 5: Pre-training Under Infinite Compute

```yaml
section: "Pre-training Under Infinite Compute"
choice: pdf_figure
source: {pdf: "pretraining-infinite-compute.pdf", page: 2, figure: "Figure 1"}
extract_path: papers/figures/pretraining-infinite-compute/fig1-scaling-recipes.png
target_path: src/content/posts/iclr-2026-ml-architectures-orals/infinite-compute-scaling-recipes.png
caption: "Figure 1 from Kim, Kotha, Liang and Hashimoto, ICLR 2026. At 200M fixed tokens, the standard recipe (red) plateaus. A regularized recipe with 30× more weight decay follows a clean N^-1.02 power law. Ensembling drops the asymptote further. Composing the two yields 5.17× less data to hit the same loss, even with infinite compute."
alt_text: "Line plot titled 'Comparing scaling recipes with no compute constraints'. X-axis is total parameter count from 150M to 1.4B, left Y-axis is DCLM validation loss from 3.2 to 3.8, right Y-axis is data efficiency multiplier. Four series: Standard recipe (red, roughly flat at 3.75-3.85), Regularized recipe (purple dashed, declines from 3.75 to asymptote at 3.43, 2.29×), Ensembling recipe (teal dashed, declines to asymptote at 3.34, 3.03×), Joint scaling recipe asymptote (orange dotted line at 3.17, 5.17×)."
fitness_score: 94
rationale: "This is the paper's flagship figure and one of the few single-panel plots in the session that communicates a full scaling-law story. Rafael's in-session photo shows a distillation-specific follow-up slide, not this headline result. Per the memory rule, PDF wins when it's the iconic contribution the photo cannot match — that's exactly the case here. The photo becomes a runner-up."
runners_up:
  - source: src/content/journal/iclr-2026/Pretraining under infinite compute/20260424_114856.jpg
    fitness_score: 72
    note: "Rotated 90° CCW. 'Data-efficiency under distillation' slide with the 83% retention finding and a plot. Strong, legible, but it covers the distillation sub-result, not the headline scaling-laws figure that anchors the section."
```

---

## Extraction log

### PDF extractions to run (orchestrator / writer, shell)

```bash
# WSM Figure 1 — page 1 schedule-comparison triptych
mkdir -p /Users/rafael/Masters/remg1997.github.io/papers/figures/wsm-decay-free-lr
pdftoppm -png -r 250 -f 1 -l 1 \
  /Users/rafael/Masters/remg1997.github.io/papers/wsm-decay-free-lr.pdf \
  /Users/rafael/Masters/remg1997.github.io/papers/figures/wsm-decay-free-lr/page1
# then crop the bottom third of page1-1.png to isolate Figure 1.
# Suggested crop (approximate, Pillow box = left, top, right, bottom on a ~2100×2700 render):
# box ≈ (150, 1800, 2000, 2550)

# Infinite Compute Figure 1 — page 2 scaling-recipes line plot
mkdir -p /Users/rafael/Masters/remg1997.github.io/papers/figures/pretraining-infinite-compute
pdftoppm -png -r 250 -f 2 -l 2 \
  /Users/rafael/Masters/remg1997.github.io/papers/pretraining-infinite-compute.pdf \
  /Users/rafael/Masters/remg1997.github.io/papers/figures/pretraining-infinite-compute/page2
# Figure 1 occupies the top half of page 2. Crop box ≈ (200, 250, 1950, 1700).
```

### User photo corrections (orchestrator, shell + Pillow)

```bash
# Post image folder
mkdir -p /Users/rafael/Masters/remg1997.github.io/src/content/posts/iclr-2026-ml-architectures-orals

# Opening hero — Optimal Sparsity title slide (upright, just copy)
cp "/Users/rafael/Masters/remg1997.github.io/src/content/journal/iclr-2026/Óptimas Sparsity of MoE/20260424_110028.jpg" \
   "/Users/rafael/Masters/remg1997.github.io/src/content/posts/iclr-2026-ml-architectures-orals/hall-optimal-sparsity-title.jpg"

# Section 2 — Optimal Sparsity "Same Training Loss" slide (rotate 90° CCW)
cp "/Users/rafael/Masters/remg1997.github.io/src/content/journal/iclr-2026/Óptimas Sparsity of MoE/20260424_110617.jpg" \
   "/Users/rafael/Masters/remg1997.github.io/src/content/posts/iclr-2026-ml-architectures-orals/optimal-sparsity-same-loss-different-reasoning.jpg"
sips -r -90 "/Users/rafael/Masters/remg1997.github.io/src/content/posts/iclr-2026-ml-architectures-orals/optimal-sparsity-same-loss-different-reasoning.jpg"

# Section 3 — LR Decay Wastes title slide (upright, just copy)
cp "/Users/rafael/Masters/remg1997.github.io/src/content/journal/iclr-2026/How LR Decay Wastes/20260424_111308.jpg" \
   "/Users/rafael/Masters/remg1997.github.io/src/content/posts/iclr-2026-ml-architectures-orals/lr-decay-wastes-title-slide.jpg"

# Section 4 — Softmax Turing "Main Results" slide (rotate 90° CCW)
cp "/Users/rafael/Masters/remg1997.github.io/src/content/journal/iclr-2026/Softmax Transformers Turing/20260424_112909.jpg" \
   "/Users/rafael/Masters/remg1997.github.io/src/content/posts/iclr-2026-ml-architectures-orals/softmax-turing-main-results.jpg"
sips -r -90 "/Users/rafael/Masters/remg1997.github.io/src/content/posts/iclr-2026-ml-architectures-orals/softmax-turing-main-results.jpg"
```

### Photos considered but not selected

- `src/content/journal/iclr-2026/WSM Decay/20260424_104837.jpg` — Rotated, only shows Cosine limitation slide (one of three schedules). Lost to PDF Figure 1 which covers all three in one frame. Score 68.
- `src/content/journal/iclr-2026/WSM Decay/20260424_105012.jpg` — Rotated, "Limitations of WSD" slide with the canonical three-bullet list Rafael quoted. Score 72. Lost to PDF Figure 1 which is the unified explainer. Usable as a secondary image if the writer wants a second visual in the WSM section.
- `src/content/journal/iclr-2026/Óptimas Sparsity of MoE/20260424_110523.jpg` — Rotated, "Validation Loss Does Not Always Predict Task Loss" slide. Score 76. Strong but narrowly lost to 110617 which shows the more counter-intuitive iso-loss finding.
- `src/content/journal/iclr-2026/Softmax Transformers Turing/20260424_113227.jpg` — Rotated, "Length-Generalizable CoT Transformers" definition slide. Score 78. Clean and legible; lost only because the TL;DR slide is the better single-image section-opener.
- `src/content/journal/iclr-2026/Pretraining under infinite compute/20260424_114856.jpg` — Rotated, "Data-efficiency under distillation" slide. Score 72. Covers a sub-result (83% distillation retention), not the flagship scaling recipe comparison. PDF Figure 1 won on iconic status.

No photos were rejected for unfixable quality issues. Every in-session photo in this batch was content-usable.
