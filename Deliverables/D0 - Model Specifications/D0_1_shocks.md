# D0.1 — Shock Specification (D0_1_shocks.md)

**Project:** TFM — _Climate tail risk, inequality, and financial amplification in a nonlinear HANK-DSGE model_  
**Purpose:** single source of truth for (i) exogenous stochastic objects, (ii) stochastic processes, (iii) supports/constraints, and (iv) where each shock enters the equilibrium system.

---

## 0) Global conventions

### 0.1 Frequency and units

- **Frequency:** quarterly.
- Unless stated otherwise, continuous shocks are **innovations** \(\varepsilon_t \sim \mathcal N(0,1)\) scaled by a volatility \(\sigma\).

### 0.2 Timing

- Exogenous shocks dated **t** are realized **within period \(t\)** and enter the **\(t\)** equilibrium conditions.
- Predetermined aggregate states include \(A_t\) (TFP), \(K_t\) (capital), \(N_t\) (intermediary net worth), and the disaster-risk regime \(pD_t\).
- The disaster realization indicator \(sD_t \in \{0,1\}\) is realized at **\(t\)** and triggers discrete “damage wedges.”

### 0.3 Independence / correlation

Baseline assumption: shocks are independent across processes unless an explicit covariance structure is introduced later (estimation stage).

---

## 1) Shock table (minimal baseline)

| Object                          | Symbol    | Type          | Process / Law                                                                   | Parameters (placeholders)                                | Support       | Entry point (equation/block)                                   |
| ------------------------------- | --------- | ------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------- | -------------------------------------------------------------- |
| Monetary policy innovation      | \(e^i_t\) | Continuous    | i.i.d. \(\mathcal N(0,1)\) (or AR(1) if desired)                                | \(\sigma_i\) (and optional \(\rho_i\))                   | \(\mathbb R\) | **Taylor rule**: additive shock to \(i_t\)                     |
| Aggregate TFP innovation        | \(e^A_t\) | Continuous    | \(\log A^{\text{exo}}_{t} = \rho_A \log A^{\text{exo}}_{t-1} + \sigma_A e^A_t\) | \(\rho_A,\sigma_A\)                                      | \(A_t>0\)     | **Firm block / production** via \(A_t\)                        |
| Idiosyncratic income state      | \(z_t\)   | Finite Markov | Rouwenhorst discretization; transition matrix \(P_z\)                           | \(\rho_z,\sigma_z\), grid size \(n_z=5\)                 | finite        | **Household income process**, scaled by aggregate income index |
| Disaster-risk regime            | \(pD_t\)  | Finite Markov | 2-state Markov chain with matrix \(P\_{pD}\)                                    | \(P\_{pD}\) / `P_pD_matrix`                              | {low, high}   | **Hazard state** governing disaster strike probability         |
| Disaster realization (“strike”) | \(sD_t\)  | Bernoulli     | \(sD_t \sim \text{Bernoulli}(p(pD_t))\)                                         | \(p\_{\text{disaster_low}},\ p\_{\text{disaster_high}}\) | {0,1}         | **Damage wedges** to TFP and capital (and indirectly finance)  |

**Implementation note (naming):** in code, it is recommended to use `e_i` for the policy innovation and `e_A` for the TFP innovation, while keeping the mathematical notation \(e^i_t\) and \(e^A_t\) in the write-up.

---

## 2) Exact process definitions (implementation-ready)

### 2.1 Monetary policy shock

Baseline specification:
\[
e^i*t \sim \mathcal N(0,1),\qquad
i_t = \rho_i i*{t-1} + (1-\rho*i)\,\bar i + \phi*\pi\,\pi_t + \phi_y\,\hat y_t + \sigma_i e^i_t.
\]

Notes:

- If inertia is handled via the lag state `i_lag`, set \(i*{t-1} = i*{\text{lag},t}\).
- The file `D0_1_timing_sheet.md` treats \(i_t\) as chosen at \(t\).

### 2.2 Aggregate TFP shock (continuous)

Exogenous component:
\[
\log A^{\text{exo}}_t = \rho_A \log A^{\text{exo}}_{t-1} + \sigma_A e^A_t,\qquad e^A_t\sim\mathcal N(0,1).
\]

Total TFP including disaster damage (see §2.5):
\[
A_t = A^{\text{exo}}\_t \cdot (1-\xi_A sD_t)\quad\text{(if damage applied multiplicatively)}.
\]

This matches the `A_exo` process and `damage_A` object in the state specification.

### 2.3 Idiosyncratic income process \(z_t\) (Markov)

- Discretize a latent AR(1) with persistence \(\rho_z\) and innovation scale \(\sigma_z\) using **Rouwenhorst** with \(n_z=5\).
- Let \(P_z\) be the transition matrix and \(\pi_z\) its invariant distribution.

Income mapping (baseline closure with fixed labor):
\[
\text{income}_{i,t} = z_{i,t}\cdot \text{income_scale}\_t + \text{transfers}\_t + \text{rebates}\_t.
\]

The exact discretization and normalization are specified in `D0_1_states.yaml` under `processes.P_z`.

### 2.4 Disaster-risk regime \(pD_t\) (ex-ante risk state)

- Two-state Markov chain \(pD*t\in\{\text{low},\text{high}\}\) with transition matrix:
  \[
  \Pr(pD_t=j\mid pD*{t-1}=k)=\left[P_{pD}\right]\_{k,j}.
  \]
- The transition matrix is parameterized by `P_pD_matrix` and should be stored as a \(2\times 2\) matrix.

Interpretation:

- \(pD_t\) moves **beliefs / hazard rates** and therefore affects equilibrium **even when no disaster occurs** (precautionary and risk-premium effects), but mechanically it only pins down the Bernoulli probability below.

### 2.5 Disaster realization \(sD_t\) (ex-post “strike”)

Conditional Bernoulli draw:
\[
sD*t\sim\text{Bernoulli}(p(pD_t)),\quad
p(\text{low})=p*{\text{disaster_low}},\quad
p(\text{high})=p\_{\text{disaster_high}}.
\]

---

## 3) Shock entry points (“what they hit”)

### 3.1 Monetary policy shock entry (policy block)

- **Direct:** additive innovation in Taylor rule for \(i_t\).
- **Indirect:** propagates through Fisher/NKPC/household Euler equations via the nominal rate.

### 3.2 TFP shock entry (firm block)

- Enters production and marginal costs via \(A_t\) (log AR(1) innovation).
- Affects wages/profits and thus household disposable income through the accounting block.

### 3.3 Disaster risk vs realization (key disambiguation)

- **Risk shock:** movement in \(pD_t\) changes the **probability** of \(sD_t=1\) (ex-ante). This affects decisions via expectations.
- **Realization shock:** \(sD_t=1\) triggers discrete losses (ex-post).

### 3.4 Disaster damage wedges (baseline implementation)

#### (i) TFP damage wedge

Apply after the exogenous AR(1) update:
\[
A_t \leftarrow A_t\,(1-\xi_A sD_t).
\]
Parameter: \(\xi_A\in(0,1)\).

#### (ii) Capital destruction wedge

In the capital accumulation law of motion:
\[
K\_{t+1} = (1-\delta)K_t + I_t - \text{damage}\_K(sD_t,K_t),
\]
with a baseline form such as
\[
\text{damage}\_K(sD_t,K_t)=\xi_K\,sD_t\,K_t.
\]
Parameter: \(\xi_K\in(0,1)\).

#### (iii) Intermediary net worth impact (indirect baseline)

Baseline choice: disasters affect net worth \(N_t\) **indirectly** through returns/valuation changes via \(A_t\) and \(K_t\), not via an additional direct net-worth shock.

---

## 4) Parameter placeholders (to be moved to calibration later)

### 4.1 Continuous shocks

- Monetary policy: \(\sigma_i\) (and optional \(\rho_i\) if AR(1) shock component is used)
- Aggregate TFP: \(\rho_A,\sigma_A\)
- Idiosyncratic income: \(\rho_z,\sigma_z\), \(n_z=5\)

### 4.2 Disaster module

- Risk regime transition: `P_pD_matrix` (\(2\times 2\))
- Hazard rates: \(p*{\text{disaster_low}},\ p*{\text{disaster_high}}\)
- Damage magnitudes: \(\xi_A,\xi_K\)

---

## 5) Optional extensions (explicitly _off_ in baseline)

These are not active in the baseline shock list unless you add them deliberately:

- **Demand / preference shock** (e.g., discount factor) as AR(1).
- **Direct financial disruption shock** to \(N\) (avoid unless you need extra propagation beyond valuation effects).
- **Time-varying volatility** (SV) for \(e^i\) or \(e^A\).

---

## 6) “Done” criteria for D0_1_shocks.md

- Every stochastic object in `D0_1_states.yaml` has (i) a process definition and (ii) a clear entry point mapping.
- Disaster module cleanly separates **risk regime** \(pD\) from **realization** \(sD\).
- Monetary policy shock is unambiguously specified as an additive term in the Taylor rule.
