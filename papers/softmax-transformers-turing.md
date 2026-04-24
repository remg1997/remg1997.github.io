# Softmax Transformers are Turing-Complete

**Authors:** Hongjian Jiang, Michael Hahn, Georg Zetzsche, Anthony Widjaja Lin
**Venue / Year:** ICLR 2026
**arXiv:** https://arxiv.org/abs/2511.20038
**Source:** https://arxiv.org/pdf/2511.20038
**Local copy:** PDF download not attempted (Bash denied); full content retrieved from https://arxiv.org/html/2511.20038v1

---

## TL;DR

Prior Turing-completeness proofs for transformers relied on hard (argmax) attention, which is neither standard nor guaranteed trainable. This paper proves that softmax transformers equipped with Chain-of-Thought (CoT) reasoning and relative positional encodings are Turing-complete, closing a long-open theoretical gap. Crucially, the constructions are length-generalizably learnable, bridging expressivity theory with practical trainability.

---

## Problem & Motivation

Two facts were known before this work:

1. Transformers with **hard attention** (argmax) and CoT are Turing-complete (Pérez et al. 2021, Merrill & Sabharwal 2024).
2. The practical standard is **softmax attention**, not hard attention.

The gap: hard-attention proofs simulate Turing machines via position-deduction tricks that are unnatural for softmax transformers and carry no learnability guarantee. Whether softmax CoT transformers are Turing-complete was an open question. A subsidiary question — equally important for practice — is whether any such construction admits *length generalizable learnability*: a model trained on inputs of bounded length should generalize correctly to longer ones.

---

## Key Contributions

- **First Turing-completeness proof for softmax CoT transformers**, without invoking hard attention.
- Two-tier completeness results depending on positional encoding:
  - Without Relative Positional Encodings (RPE): Turing-complete for unary alphabets ($\Sigma = \{a\}$) and letter-bounded languages (of the form $a_1^* a_2^* \cdots a_n^*$).
  - With RPE: Turing-complete for arbitrary alphabets.
- A **negative result** showing that CoT C-RASP without RPE is *not* Turing-complete over binary/general alphabets, due to a logarithmic communication complexity barrier.
- **Length-generalizable learnability** (Proposition 2.3): all constructions lie within a class that provably length-generalizes from bounded-length training data.
- **Empirical validation** on complex arithmetic tasks (primes, exponentials, GCD, multiplication) confirming theoretical predictions about when RPE is needed.

---

## Method

### Modeling Framework

The paper works within the **Softmax Transformer (SMAT)** model: a length-preserving causal language model where attention weights are:

$$\bar{w} = \text{softmax}\!\left(\log n \cdot \{v_j^\top \mathbf{K}^\top \mathbf{Q} v_i\}_{j=1}^{i}\right)$$

The $\log n$ scaling is critical — it overcomes the limitation that vanilla softmax attention becomes "too uniform" at large context lengths, enabling sharp threshold-like behavior. Heaviside activations are used (approximable by ReLU at finite lengths).

**C-RASP (Counting RASP)** is the corresponding declarative language. It supports:
- Boolean predicates $Q_a$ (does position hold letter $a$?), boolean operations.
- Counting terms $\#_\leftarrow[\varphi]$: count of positions to the left where predicate $\varphi$ holds.
- Comparison operators $t \sim t'$ where $\sim \in \{<, =, >\}$.

Both SMAT and C-RASP are extended with a CoT token set $\Gamma$, where the model autoregressively generates intermediate computation steps $U = U_1 \cdots U_m \in \Gamma^*$ before producing a final accept/reject token.

**Relative Positional Encodings (RPE)** are formalized as a binary relation $\mathfrak{R} \subseteq \mathbb{N} \times \mathbb{N}$ that additively modifies attention logits:

$$\bar{w} = \text{softmax}\!\left(\log n \cdot \{v_j^\top \mathbf{K}^\top \mathbf{Q} v_i + \lambda\cdot[\![\mathfrak{R}]\!](i,j)\}_{j=1}^{i}\right)$$

This is a clean, parameter-free abstraction covering additive RPE schemes used in practice (RoPE, ALiBi).

### Proof Strategy: Simulate Counter Machines, Not Turing Machines

Rather than directly simulating a Turing machine (the approach in hard-attention proofs), the paper routes through **Minsky counter machines** — equivalent in power to Turing machines (Greibach 1976) but whose increment/decrement/test-zero operations naturally map to C-RASP counting primitives.

#### Unary Case (Theorem 3.1)

For $\Sigma = \{a\}$, the proof constructs a three-phase C-RASP CoT program:

1. **Initial step**: Given the Parikh image (letter count vector) of the input, determine which initial counter machine transition fires.
2. **Non-initial steps**: Maintain counter values using counting terms. For counter $i$:
$$t_i = \#_\leftarrow[Q_{a_i}] + \sum_{r \in \Delta} \mathbf{u}_r(i) \cdot \#_\leftarrow[Q_r]$$
   (initial count plus accumulated updates from all executed transitions $\Delta$).
3. **Acceptance**: Output the appropriate CoT token when a final state is reached.

#### General Alphabet (Theorem 4.3)

The proof uses two phases:

**Phase I — Encoding.** The input word $w \in \Sigma^*$ is iteratively extended with dummy letters and markers, using an RPE relation $\mathfrak{R}$ based on binary representation: $(i, j) \in \mathfrak{R}$ iff position $i$ has bit 1 in the binary encoding $\beta(j)$. This constructs a $\sigma$-encoding $\mathbf{x} \in \mathbb{N}^n$ from $w$, effectively converting the combinatorial word structure into counter machine inputs.

**Phase II — Simulation.** The counter machine runs on the encoded values $(X_1, \ldots, X_n)$, recognizing the target language via a standard 3-counter machine (Minsky's construction).

The key insight is that the $\sigma$-encoding is computable and effectively invertible, making the reduction valid while staying within the expressiveness of C-RASP with RPE.

#### Negative Result (Proposition 4.1)

Without RPE, C-RASP CoT is not Turing-complete over $\Sigma = \{a, b\}$. The reason: Huang et al. (2025) show that limit transformers have logarithmic communication complexity, which implies that polynomial-size automata suffice to handle all bounded-length subsets of any recognizable language — ruling out languages like palindromes that require superlogarithmic communication.

---

## Experimental Setup

- **Tasks:** Five arithmetic language recognition tasks — Primes, Exponentials, Division, GCD, Multiplication.
- **Representations:** Both unary ($a^n$) and binary ($\text{bin}(n)$).
- **Architecture:** LLaMA-style decoder-only transformer, trained from scratch.
- **Train:** input lengths $[1, 100]$.
- **Evaluation splits:**
  - $\text{test}_0$: lengths $[1, 100]$ (in-distribution)
  - $\text{test}_1$: lengths $[101, 200]$ (length generalization)
  - $\text{test}_2$: lengths $[201, 300]$ (extreme generalization)

---

## Results

Results from Table 2 of the paper:

| Setting | $\text{test}_0$ | $\text{test}_1$ | $\text{test}_2$ |
|---|---|---|---|
| Unary, no RPE | >99.9% | >99.9% | >99.7% |
| Binary, with RPE | 100% | 100% | 100% |
| Binary, without RPE | 64–95% | 0–0.4% | 0.0% |

The binary-without-RPE condition fails catastrophically on out-of-distribution lengths, exactly as the theory predicts. The unary case generalizes without RPE, and binary with RPE generalizes perfectly even to extreme lengths.

---

## Limitations & Caveats

- **CoT C-RASP without RPE is not Turing-complete** for general (non-unary) languages. The completeness result for arbitrary alphabets requires RPE, and the practical relationship between the paper's formal RPE and specific implementations (RoPE, ALiBi) is not fully formalized.
- **No complexity refinement**: the paper does not analyze how many CoT steps are needed (i.e., there are no bounds relating the number of intermediate tokens to complexity classes like P, NP, or PSPACE). Turing-completeness is purely about what is expressible, not how efficiently.
- **Learnability assumptions**: the length-generalizable learnability guarantee (Proposition 2.3) relies on the framework of Huang et al. (2025), which has its own technical preconditions (notably, the use of $\log n$ scaling). These are not guaranteed to hold in all practical training setups.
- **Heaviside vs. ReLU**: the formal constructions use Heaviside activations; the argument that ReLU approximates these is asymptotic in finite lengths, not exact.
- The paper focuses on language *recognition* (accept/reject); extension to arbitrary computation (e.g., function evaluation) is implicit but not explicitly spelled out.

---

## Why It Matters / Implications

For practitioners, this paper matters primarily as a theoretical foundation rather than a recipe for implementation. The key takeaways:

1. **The practical transformer architecture is as expressive as any computer**, given CoT and relative positional encoding. This justifies theoretical confidence in transformer-based agents for arbitrary algorithmic tasks.
2. **Relative positional encoding is load-bearing for generalization**, not just a useful heuristic. The negative result (binary languages fail without RPE) provides a crisp theoretical reason to use RPE for tasks requiring non-trivial length generalization.
3. **CoT is necessary, not just helpful.** The Turing-completeness is of the *CoT* transformer, not the single-pass transformer. This aligns with empirical findings that chain-of-thought dramatically improves performance on structured reasoning.
4. **Length generalization is theoretically achievable.** The learnability result says that constructions within C-RASP[RPE] provably generalize to longer inputs if trained correctly — this is a rare formal guarantee in deep learning.

For engineers working on tasks like formal verification, symbolic reasoning, or code generation, this result suggests that architecture choices (RPE variant, CoT format) may matter more than is commonly appreciated for length generalization.

---

## Related Work Context

| Work | Approach | Limitation addressed here |
|---|---|---|
| Pérez et al. (2021) | Hard attention, direct TM simulation | Non-standard attention, no learnability |
| Merrill & Sabharwal (2024) | Hard attention CoT | Same as above |
| Hou et al. (2025) | Softmax, RASP framework | Requires n-gram non-repetition, lacks full-length guarantees |
| Huang et al. (2025) | Limit transformer framework | Provides the learnability definition this paper uses |

The paper's approach — routing through counter machines rather than Turing machines — is the key technical innovation that makes softmax-compatible constructions possible. Counter machine transitions (increment, decrement, test-zero) directly correspond to C-RASP operations, while Turing machine tape manipulation does not.

---

## Notes on Rafael's Journal

Rafael's note says "In early 2020 it was proofed that attention was turing complete." The actual citation is Pérez et al. (2021), published at ICLR 2021 — so not 2020. The rest of the note is accurate in spirit. Rafael noted the proof "uses hard attention" and "gives no learnability guarantee" — both correct per the paper. The image reference ("View image Main Results in Our Paper") likely refers to the main theorem table, which is Table 1/Theorem summary in the paper.
