# D0.2 — Full Equilibrium System (to be completed)

**Purpose.** This document is the single “equations ledger” for the baseline model. Every equation must be consistent with:
- D0_1_states.yaml (state/jump definitions and flags)
- D0_1_timing_sheet.md (timing conventions)
- D0_1_shocks.md (shock processes and entry points)

## 0) Model toggles (source of truth: D0_1_states.yaml)

| Feature | Flag / field | Status | Notes |
|---|---|---:|---|
| Two-asset households (b,a) | `flags.two_asset` | **ON** | Set OFF to revert to 1-asset Huggett-style HANK. |
| Capital accumulation | `aggregate_states.K` present | **ON** | If you want “no-capital” MVP, remove K,q,I and the investment block. |
| Intermediary constraint / spread | `flags.financial_intermediary` | **ON** | Spread enters firm finance/cost of capital and household returns mapping. |
| Disaster module | `flags.disaster_module` | **ON** | Risk regime pD + realization sD. |
| Nominal anchor | `meta.policy_regime.nominal_anchor` | inflation | Price-level targeting OFF. |
| Labor market | `modeling_choices.labor_market` | fixed | Endogenous labor OFF in baseline. |

**Action item:** if any status above is not intended, change *flags* first, then update this ledger.

---

## 1) Objects and notation

### 1.1 Time and rates
- Period t is quarterly.
- Inflation: \(\pi_t \equiv P_t/P_{t-1}-1\) (or define gross inflation \(\Pi_t\)).
- Nominal policy rate: \(i_t\) (net) or \(R_t\) (gross). Be explicit and consistent.

### 1.2 Aggregate states and jumps
**Predetermined:** \(A_t, K_t, N_t, i_{t-1}, pD_t\).  
**Jumps:** \(\pi_t, i_t, q_t\) and any additional prices you introduce (e.g., wages \(w_t\), marginal cost \(mc_t\), rental rate \(r^k_t\)).

### 1.3 Distributions and aggregates
- Household distribution: \(\mu_t(a,b,z)\).
- Aggregates: \(C_t = \int c_t\,d\mu_t\), \(B^h_t = \int b_t\,d\mu_t\), \(A^h_t=\int a_t\,d\mu_t\).

---

## 2) Exogenous processes (copy/paste from D0_1_shocks.md)

### 2.1 Standard AR(1) shocks
- Monetary policy shock \(\varepsilon^i_t\): …
- Aggregate TFP innovation \(\varepsilon^A_t\): …

### 2.2 Disaster module
- Risk regime \(pD_t\): 2-state Markov chain.
- Realization \(sD_t\sim Bernoulli(pD_t)\).
- Impacts: \(A_t \leftarrow A_t(1-\xi_A sD_t)\), and \(K_{t+1}\) loses \(\xi_K sD_t K_t\).

---

## 3) Household block

> Choose either a **Bellman/HJB** representation (for writing) or a **FOC/KKT** representation (for implementation). In SSJ you ultimately need the mapping from sequences of prices to sequences of aggregates.

### 3.1 Budget constraints (discrete time)
Write the discrete-time laws of motion for \(b_{t+1}\) and \(a_{t+1}\), including:
- liquid return (policy/Fisher)
- illiquid return (capital/equity)
- transaction/adjustment cost on illiquid rebalancing (if used)
- borrowing constraint on \(b_{t+1}\)
- nonnegativity on \(a_{t+1}\)

### 3.2 Optimality conditions
- Euler/KKT for liquid asset + borrowing constraint complementarity.
- Euler/KKT for illiquid asset (and deposit decision if you use a deposit/withdrawal control).
- Definition of marginal utility \(u_c\) and any auxiliary objects needed.

### 3.3 Income process
- Fixed labor closure: income is \(z\times income\_scale_t\) plus transfers/dividends as modeled.

### 3.4 Distribution law of motion
Write the transition operator:
\[
\mu_{t+1} = \mathcal{T}(\mu_t; \text{policy functions}, P_z).
\]

### 3.5 Aggregation
List the aggregation equations that define \(C_t, B^h_t, A^h_t\), plus any “by-wealth-group” objects you plan to compute later (MPCs, shares).

---

## 4) Firms and nominal rigidities (NK block)

### 4.1 Technology and factor prices
- Production function and definition of marginal cost.
- Wage and rental rate expressions under perfect competition in factor markets.

### 4.2 Price setting
Pick one:
- **Rotemberg** (recommended for nonlinear AD solvers), or
- **Calvo / NKPC** (linearized or nonlinear).

Write the pricing equation (or NKPC):
\[
\text{NKPC residual }\equiv \pi_t - \beta\mathbb{E}_t\pi_{t+1} - \kappa\,mc_t = 0.
\]

### 4.3 Profits and rebate
Define profits net of adjustment costs and specify how they enter household disposable income (lump-sum dividends/transfers).

---

## 5) Capital and investment block (if K,q are ON)

### 5.1 Capital accumulation
\[
K_{t+1}=(1-\delta)K_t + I_t - \xi_K sD_t K_t.
\]

### 5.2 Tobin’s q and investment FOCs
Write your adjustment-cost function and the two standard equations:
- q–investment relation
- q Euler equation

---

## 6) Intermediary / finance block (spread)

### 6.1 Balance sheet
Define intermediary assets and liabilities (minimal):
\[
\text{Assets}_t = \text{Deposits}_t + N_t.
\]

### 6.2 Constraint and spread mapping
Choose one explicit structure (GK-style leverage constraint or reduced-form but state-dependent spread). Write:
- constraint equation
- spread definition equation

### 6.3 Net worth dynamics
Write:
\[
N_{t+1} = f(N_t, \text{returns}, \text{payouts}, \text{losses}).
\]
Make clear whether disasters affect N only through asset returns (baseline) or also via a direct loss term.

---

## 7) Monetary policy + Fisher mapping

### 7.1 Taylor rule (with inertia)
Write the rule consistent with state \(i_{t-1}\) and shock \(\varepsilon^i_t\).

### 7.2 Fisher / return mapping
Define the real liquid return used in the household block.

---

## 8) Market clearing and accounting

### 8.1 Goods market
\[
Y_t = C_t + I_t + \text{adjustment costs} + \text{other wedges (if any)}.
\]

### 8.2 Asset markets
- Liquid asset market (government bonds / deposits).
- Illiquid asset / capital market (if households own capital/equity).

### 8.3 Walras’ law check
State which equation is redundant once others hold (useful for debugging).

---

## 9) SSJ closure objects (must match D0_1_states.yaml)

**Unknown sequences (order):** \([y, \pi, i, q, spread]\).  
**Residuals (order):** \([goods, nkpc, taylor, investment, finance]\).

For each residual, write explicitly:
- which equation defines it,
- which unknown sequence it pins down.

---

## 10) “Done” checklist (acceptance tests)

- [ ] Every variable has a definition, units (net/gross), and timing (t vs t+1).
- [ ] Number of equilibrium unknowns equals number of independent equilibrium equations (after Walras).
- [ ] Disaster separation is explicit: \(pD_t\) affects expectations/hazards; \(sD_t\) is the realized strike.
- [ ] SSJ environment is well-defined (sD=0, pD fixed to “low” as in YAML).
- [ ] No double counting of assets: illiquid holdings, capital stock, intermediary assets reconcile in market clearing.
