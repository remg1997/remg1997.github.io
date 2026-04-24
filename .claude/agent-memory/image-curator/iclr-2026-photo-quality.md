---
name: ICLR 2026 in-session photo quality patterns
description: What to expect from Rafael's in-session oral-talk photos at ICLR 2026 and how to weigh them against PDF figures.
type: project
---

Expectation for the ICLR 2026 oral-session photos (folders under `src/content/journal/iclr-2026/`) varies meaningfully by day.

## Default pattern (Day 1 LLM Reasoning session)

**Most in-session slide photos are rotated 90° (landscape-captured phone held portrait), angled from a low audience position, with heavy lens flare from stage spotlights and ceiling HVAC ducts visible at the edges.** Slide content reads through but nothing is camera-ready. Per the `feedback_prefer_user_photos.md` memory rule, score these **on content first** — a rotated-but-subject-clear slide photo is **70–85**, not 40–60. Emit rotation corrections in the extraction log.

## Day 2 pattern (ML Architectures and Training I) — better than Day 1

Rafael's Day 2 oral-session photos are notably cleaner than Day 1. Multiple title slides were shot **upright, non-rotated, with the speaker visible at the podium** — prime material for section openers. Specific known-good uprights:
- `Óptimas Sparsity of MoE/20260424_110028.jpg` — upright title slide with speaker, readable ICLR 2026 badge. Session-opener grade.
- `How LR Decay Wastes/20260424_111308.jpg` — upright title slide with full author list and speaker. The slide's subtitle ("data curriculum is useful, but strong LR decay wastes the high-quality data") doubles as the section's thesis.

Rotated-but-legible Day 2 photos (score 72–85 after correction):
- `WSM Decay/20260424_104837.jpg`, `WSM Decay/20260424_105012.jpg` — 90° CW, Cosine / WSD limitation slides.
- `Óptimas Sparsity of MoE/20260424_110523.jpg`, `20260424_110617.jpg` — 90° CCW, "Validation Loss Does Not Predict Task Loss" and "Same Training Loss, Different Reasoning Performance".
- `Softmax Transformers Turing/20260424_112909.jpg`, `20260424_113227.jpg` — 90° CCW, "Main Results" TL;DR and "Length-Generalizable CoT Transformers" definition.
- `Pretraining under infinite compute/20260424_114856.jpg` — 90° CCW, "Data-efficiency under distillation" slide.

**How to apply:** Day 2 session posts can ship 3-4 user photos easily alongside 1-2 PDF figures. Day 1 session posts still need to rely more heavily on PDF figures.

## Known uprights outside oral sessions

- `Revela/20260423_112002.jpg` — upright Revela title slide with speaker at podium. The one clean photo from the Day 1 oral session. Good fallback for a Revela-focused post.
- `the_challenges_of_human_centered_AI/20260423_081146_3dce473d.jpg` — crisp pre-session hall photo, scoped to the Mataric-keynote post. Don't reuse without explicit permission.

## PDF-figure-wins-anyway cases

Even with strong photos, PDF figures still win when they are the paper's **iconic single-image contribution** that a slide photo cannot match:
- WSM Figure 1 (page 1): Cosine / WSD / WSM triptych — beats any single-schedule photo.
- Pretraining Infinite Compute Figure 1 (page 2): The four-recipe scaling-law plot with 5.17× data efficiency — the paper's flagship, no slide photo matches it.
