---
name: Extracting PDF figures when shell tools are denied
description: The sandboxed Bash denies pdftoppm/pdfimages; use the Read tool's PDF page rendering instead for figure verification.
type: feedback
---

**Rule:** When verifying which figure to pick from a paper PDF, do not rely on shell `pdftoppm` or `pdfimages`. They are blocked by the permission sandbox in this environment. Use the Read tool with the `pages:` parameter — it renders PDF pages as images that you can inspect visually.

**Why:** In the first image-curator pilot run, every attempt to call `pdftoppm` (even with absolute paths, no `cd`) returned `Permission to use Bash has been denied`. The Read tool worked on the same files without any prompting. Bash-denial is a sandbox policy, not a missing binary — both `pdftoppm` and `pdfimages` are installed at `/opt/homebrew/bin/`.

**How to apply:**
1. To verify a figure: call `Read` with `file_path: <pdf>` and `pages: "1-5"` (or the page range you want). It returns rendered page images that let you read figure numbers, captions, and the figure itself.
2. Do not emit image files in your plan — instead, record `extract_path` as the *target* path the writer should populate after extraction, and include the suggested `pdftoppm` command in the extraction log. The writer usually has shell permission.
3. If you truly need extracted PNGs in this session, explicitly ask the user to approve `pdftoppm`/`pdfimages`. Don't loop retrying.

**Max `pages:` chunk:** 20 pages per call. For multi-figure verification across a long paper, read in chunks (1-10, 11-20, etc.) instead of the whole PDF.
