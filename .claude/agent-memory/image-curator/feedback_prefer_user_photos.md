---
name: Prefer user photos when available; rotation and flare are fixable
description: User photos from the event beat PDF figures for narrative sections and for any section where the photo clearly depicts the subject. Score rotated/angled photos higher than first-pass instinct suggests; emit correction commands in the extraction log for the orchestrator to apply before publish.
type: feedback
---

Rafael wants his own event photography included in posts when it is reasonable, not just PDF figures. On the first pipeline runs, the curator correctly picked PDF figures where papers had canonical method diagrams, but rejected too many user photos over fixable quality issues (90° rotation, lens flare, slight angle). His explicit feedback: "I would also like, when possible, to include the pictures I took from the sessions."

**Why:** His photos make the blog feel personal and grounded in the actual event. A PDF figure of a method diagram is technically strong but atmospherically sterile. When a user photo clearly shows the subject, that personal texture matters more than a crisper figure.

**How to apply:**

- **Score user photos on content first, quality second.** A rotated or angled slide photo that clearly depicts the section's subject is a 70–85, not a 40–50. Reserve scores below 60 for photos that genuinely miss the subject, are unreadably blurry, or would require manual content editing to salvage.
- **Emit `corrections` in the YAML entry** when a user photo needs transformation before publish. Supported operations the orchestrator knows how to run:
  - Rotation: `sips -r 90 <path>`, `sips -r -90 <path>`, `sips -r 180 <path>`.
  - Crop with Pillow: `{crop: {left: X, top: Y, right: R, bottom: B}}`.
  - Auto-orient from EXIF: `sips --resampleWidth <same> <path>` (strips EXIF orientation, forcing physical pixel layout). Only use if the photo reads fine but displays sideways.
  - Multiple ops: a list; the orchestrator runs in order.
- **Reserve `pdf_figure` for sections where:**
  1. No user photo exists for that talk, OR
  2. The PDF figure is the paper's iconic contribution (flagship architecture diagram, main-results plot) that a photo cannot match, OR
  3. The user photo is genuinely unusable and no correction can save it (out of focus, wrong subject, fingers over lens).
- **A mix is good.** If a post has 5 paper sections and 3 have strong user photos, ship 3 user photos and 2 pdf_figures. Uniformity is not a goal.
- **Consider atmosphere.** Opening and closing sections should lean user-photo heavily (venue, stage, crowd). Middle/technical sections should lean whichever is most informative.

**Side output:** when user photos need correction, also include the corrected target path in the entry (typically `src/content/posts/<post-slug>/<descriptive-name>.jpg`) so the orchestrator can pipe the shell commands straight into that destination without guessing.
