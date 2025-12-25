# D0.1 — Scope Lock (with literature anchors)

**Project label:** TFM — _Climate tail risk, inequality, and financial amplification in a nonlinear HANK-DSGE model_ (Uribarri Sánchez, 2025).

---

## 1) Baseline model statement (10 lines)

1. **Research question.** Quantify how **climate tail risk** changes the strength and composition of monetary transmission when **household heterogeneity** interacts with **intermediary balance-sheet constraints** (“double amplification”).
2. **Climate risk mechanism.** A persistent _disaster-risk state_ increases the perceived probability of rare climate disasters; rare _realizations_ deliver discrete losses (baseline: to productivity and physical capital; financial balance sheets amplify endogenously through valuation/returns).
3. **Financial amplification.** Intermediary net worth/leverage constraints generate an **endogenous spread** between the policy rate and effective borrowing/lending rates, tightening financial conditions after risk increases or realizations.
4. **Heterogeneity channel.** Households differ in liquid vs illiquid wealth and MPCs; hence spread/interest-rate changes shift aggregate demand through distribution-dependent marginal propensities (redistribution and cash-flow effects).
5. **Nominal block.** Sticky prices (Calvo-style) yield an NK Phillips curve so monetary policy affects real activity and inflation, not only intertemporal prices.
6. **Policy rule.** A Taylor-type rule with inertia governs the nominal rate; monetary policy shocks identify transmission conditional on the climate-risk regime.
7. **Accounting.** A coherent flow-of-funds maps wages, profits, transfers, and intermediary payouts into household disposable income; market clearing pins down aggregate consistency.
8. **Quantitative outputs.** Compute **state-dependent IRFs** for spreads, output, inflation, and consumption by wealth groups; track intermediary net worth dynamics and distributional statistics (MPC-weighted aggregates).
9. **Decomposition.** Use sequence-space objects to decompose aggregate responses into substitution vs cash-flow/redistribution and general-equilibrium channels (in the spirit of HANK transmission decompositions).
10. **Success criteria.** The baseline matches core response shapes (spread widening and demand contraction after risk rises), exhibits regime dependence (high vs low risk), and yields interpretable amplification mechanisms consistent with HANK logic.

---

## 2) MVP choice

### Selected MVP: **MVP (HANK + NK + Taylor + explicit intermediary constraint + climate tail risk)**

**Reason for MVP (scope logic):**

- This contribution is **double amplification**. If spreads are imposed (reduced-form wedge), part of the amplification is an assumption rather than an equilibrium mechanism.
- An explicit intermediary block lets you (i) map climate risk → intermediary net worth → spreads, (ii) generate _state dependence_ naturally, and (iii) run transparent counterfactuals (relaxing constraints, changing leverage sensitivity, etc.).

**Literature anchor:**

- **Financial frictions + heterogeneity + state dependence**: Fernández‑Villaverde, Hurtado, and Nuño (2023), _Financial Frictions and the Wealth Distribution_.
- **Rare-disaster risk vs realizations**: Cantelmo (2020), _Rare Disasters, the Natural Interest Rate and Monetary Policy_.
- **HANK monetary transmission/decompositions**: Kaplan, Moll, and Violante (2018), _Monetary Policy According to HANK_, plus Auclert (2017), _Monetary Policy and the Redistribution Channel_.
- **Sequence-space solution architecture**: Auclert, Bardóczy, Rognlie, and Straub (2021), _Using the Sequence‑Space Jacobian to Solve and Estimate Heterogeneous‑Agent Models_.

---

## 3) Included blocks (v1 baseline)

### 3.1 Household block (HANK, **two-asset**)

- Idiosyncratic income risk (Markov).
- **Two assets:** liquid asset \(b\) (bond/deposit/loan) and illiquid asset \(a\) (capital-like / higher return), with an adjustment/transaction friction on \(a\).
- Borrowing constraint on \(b\); portfolio choice determines exposure to interest rates/spreads and generates heterogeneous MPCs.
- Decisions (conceptual): \(c*t,\ b*{t+1},\ a\_{t+1}\). Aggregation yields consumption, assets, and distributional objects (e.g., MPCs by wealth/liquidity).

**Anchor:** Kaplan–Moll–Violante (2018); Auclert (2017).

### 3.2 Firm + nominal rigidities + capital (New Keynesian)

- Production with aggregate TFP and **physical capital** \(K\).
- Capital accumulation with (possibly simple) investment adjustment costs / Tobin’s-\(q\) representation (kept parsimonious in v1, but present for consistency with the disaster-capital-loss channel).
- Calvo pricing → NK Phillips curve.
- Profits: explicitly rebated to households (lump-sum or rule-based).

**Anchor:** Standard NK; compatible with HANK-NK implementations used in SSJ settings (Auclert et al., 2021).

### 3.3 Monetary policy + Fisher block

- Taylor rule with inertia and a monetary policy shock.
- Fisher relation consistent with the chosen inflation timing convention.

**Anchor:** Monetary policy in HANK context (Kaplan–Moll–Violante, 2018; Auclert, 2017).

### 3.4 Intermediary / banking block (balance-sheet constraint)

- Intermediary net worth evolves with returns and payouts; leverage constraint or net-worth constraint limits intermediation capacity.
- Endogenous credit spread is an increasing function of leverage / decreasing function of net worth.

**Anchor:** Macro-finance intermediary constraint templates; aligned with Fernández‑Villaverde, Hurtado, and Nuño (2023) for the “frictions × distribution” mechanism.

### 3.5 Climate tail-risk block

- **Risk state**: persistent process shifting the hazard of disaster (Markov or AR(1) in hazard).
- **Realization shock**: rare, discrete event with direct losses (baseline: productivity and physical capital). Financial amplification operates through equilibrium balance-sheet/valuation effects; a _direct_ net-worth hit is an optional extension, not required in v1.

**Anchor:** Cantelmo (2020); project framing in Uribarri Sánchez (2025).

### 3.6 Market clearing and accounting

- **Goods market clearing with capital:** \(Y_t = C_t + I_t + \text{(price adjustment costs, if any)} + \text{(portfolio adjustment costs, if any)}\).
- Asset market clearing (bonds/loans consistent with intermediary balance sheet) and consistency between household liquid positions and intermediary funding/asset holdings.
- Flow-of-funds links: wages, profits, transfers, interest income, intermediary payouts.

**Anchor:** SSJ block structure and GE closure require explicit clearing and accounting identities (Auclert et al., 2021).

---

## 4) Explicit exclusions (v1) and why

1. **Long-term debt / term structure / QE-QT.**  
   _Why excluded:_ policy extension; defer until the baseline mechanism is established and empirically mapped.

2. **Endogenous default / bankruptcy.**  
   _Why excluded:_ can be proxied in v1 via borrowing constraints and intermediary losses; default modeling would add discrete choices and additional state variables.

3. **Detailed brown/green sectoral capital structure.**  
   _Why excluded:_ sectoral disaggregation is valuable but not necessary for the first pass on tail risk → finance → heterogeneous demand; can be added once baseline is stable.

4. **Time-varying volatility / stochastic volatility in shocks.**  
   _Why excluded:_ adds estimation/solution complexity; revisit after baseline state dependence is documented.

---

## 5) Empirical mapping (kept minimal for scope discipline)

- **Core observables:** policy rate, inflation, output proxy, and a spread (corporate spread or bank lending spread).
- **Distributional targets (if feasible):** wealth shares, liquid-wealth distribution moments, consumption heterogeneity proxies.
- **Identification objects:** monetary policy shocks; climate-risk shocks (news/hazard) and/or disaster realization indicators.

This mapping is consistent with the “HANK transmission” perspective (Kaplan–Moll–Violante, 2018; Auclert, 2017) and the “risk vs realization” distinction (Cantelmo, 2020).

---

## 6) Solution approach (scope-compatible statement)

### Primary: Sequence-Space Jacobian (SSJ)

- Implement the model as modular blocks (households, pricing, policy, intermediaries, clearing).
- Compute block Jacobians and close GE on sequences around a steady state / regime-specific point.

**Anchor:** Auclert, Bardóczy, Rognlie, and Straub (2021).

### Secondary (later, if needed): Nonlinear transitions

- If disaster realizations require nonlinear dynamics beyond local regimes, use a nonlinear sequence solver with automatic differentiation.

**Anchor:** Boehl (2025), _HANK on Speed_.

### Estimation extension (later)

- If you estimate the nonlinear model, consider neural-network surrogates for likelihood or policy functions.

**Anchor:** Kase, Melosi, and Rottner (2025), _Estimating Nonlinear Heterogeneous Agent Models with Neural Networks_.

---

## 7) Definition of “done” for D0.1 (scope lock completion)

D0.1 is complete once these objects are frozen and internally consistent:

- This scope lock (included/excluded blocks + MVP-B rationale).
- A timing sheet: asset timing, inflation definition, profits/payout timing, interest accrual timing.
- A complete state vector and shock list consistent with the blocks above.
