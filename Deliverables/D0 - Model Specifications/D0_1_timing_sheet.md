# D0.1 Timing Sheet (Model Scope & Timing Conventions)

This timing sheet is the **single source of truth** for (i) state vs jump variables, (ii) within-period sequence of events, and (iii) what is paid/realized in period _t_ vs carried into _t+1_.  
It is designed to be consistent with the current **two-asset HANK + NK + capital + intermediary + disaster-risk** state/shock registry in `D0_1_states.yaml` and the shock definitions in `D0_1_shocks.md`.

---

## Periodicity and horizons

```yaml
{ frequency: quarterly, T_irf: 240, T_transition: 320 }
```

### Notes (coding constraints)

- **IRFs (`T_irf`)**: baseline horizon for linear/SSJ IRFs and plots.
- **Nonlinear transitions (`T_transition`)**: truncated horizon for EP/perfect-foresight transition paths (terminal conditions near steady state).

---

## Within-period timeline (recommended implementation order)

### Start of period t (predetermined states observed)

Known at the beginning of _t_:

- Household distribution over **(b_t, a_t, z_t)**.
- Aggregate states **A_t, K_t, N_t, pD_t** and (if

### Shocks realized in period t

- Innovations **e_i,t** (monetary) and **e_A,t** (TFP AR(1) innovation) are realized at _t_.

- Disaster strike indicator **sD_t ∈ {0,1}** is realized at _t_ conditional on the risk regime **pD_t**.

### Exogenous state updates (still within period t)

- Update **A_exo,t** using AR(1), then apply the **TFP damage wedge** if sD_t=1:  
  \(A_t \leftarrow A^{exo}\_t (1-\xi_A sD_t)\).

### Equilibrium determination in period t (jump variables + allocations)

Determined in _t_ given states and shocks:

- **π_t** (NKPC anchor), **i_t** (Taylor rule + shock), **q_t** (investment block), **spread_t** (finance block).
- Output, consumption, investment, returns, wages/profits as implied by goods market clearing and accounting.

### End of period t → transition to t+1

- Household choices **b*{t+1}, a*{t+1}** are made in _t_ (policy functions).
- Capital evolves to **K\_{t+1}** using investment and disaster capital destruction (if sD_t=1).
- Intermediary net worth evolves to **N\_{t+1}** via returns/valuation and payouts.
- If interest-rate smoothing: **i_lag,t+1 = i_t**.
- Disaster risk regime transitions: **pD\_{t+1}** follows its Markov chain.

---

## Timing conventions table (complete)

Legend:

- **Predetermined at t**: carried into period t from t−1 (state variable).
- **Chosen/Determined at t**: solved/decided within period t (policy/jump variable).
- **Realized/Paid at t**: cashflow or event occurs in t and enters budgets/accounting in t.

| Object                                        | Predetermined at t? | Chosen/Determined at t? |         Realized/Paid at t? | Convention / Notes                                                                                             |
| --------------------------------------------- | ------------------: | ----------------------: | --------------------------: | -------------------------------------------------------------------------------------------------------------- |
| **Liquid assets (hh)** \(b_t\)                |                  ✅ |     choose \(b\_{t+1}\) | interest accrues on \(b_t\) | Enter with \(b*t\), choose \(b*{t+1}\) (borrowing constraint on \(b\_{t+1}\)).                                 |
| **Illiquid assets (hh)** \(a_t\)              |                  ✅ |     choose \(a\_{t+1}\) |           return on \(a_t\) | Enter with \(a*t\), choose \(a*{t+1}\) subject to adjustment/transaction cost.                                 |
| **Idiosyncratic income state** \(z_t\)        |                  ✅ |                         |        income realized in t | Markov state; scales household income in fixed-labour closure.                                                 |
| **Lagged policy rate** \(i\_{lag,t}\)         |                  ✅ |      updated to \(i_t\) |                             | If smoothing: \(i\_{lag,t+1}=i_t\).                                                                            |
| **Aggregate TFP** \(A_t\)                     |                  ✅ |                         |        used in t production | Built from \(A^{exo}\_t\) then disaster wedge applied if \(sD_t=1\).                                           |
| **Aggregate capital** \(K_t\)                 |                  ✅ |                         |        used in t production | Predetermined stock; law: \(K\_{t+1}=(1-\delta)K_t+I_t-\text{damage}\_K(sD_t,K_t)\).                           |
| **Intermediary net worth** \(N_t\)            |                  ✅ |                         |           used in t finance | Predetermined; updates to \(N\_{t+1}\) via returns/payouts; disasters affect via valuation/returns (baseline). |
| **Disaster risk regime** \(pD_t\)             |                  ✅ |                         |         governs hazard in t | Markov regime (low/high) observed at start of t; transitions to \(pD\_{t+1}\).                                 |
| **Disaster strike** \(sD_t\)                  |                     |           ✅ (realized) |                          ✅ | Realized in t conditional on \(pD_t\): \(sD_t\sim \text{Bernoulli}(p(pD_t))\).                                 |
| **TFP damage wedge** \(damage_A\)             |                     |                         |                          ✅ | Applied within t after exo update: \(A_t\leftarrow A_t(1-\xi_A sD_t)\).                                        |
| **Capital damage** \(damage_K\)               |                     |                         |                          ✅ | Enters the transition to \(K\_{t+1}\) (in the law of motion).                                                  |
| **Inflation** \(\pi_t\)                       |                     |                      ✅ |                          ✅ | Definition: \(\pi*t=P_t/P*{t-1}-1\). (Gross inflation \(\Pi_t=1+\pi_t\).) Determined by NKPC/GE closure.       |
| **Policy rate** \(i_t\)                       |                     |                      ✅ |                          ✅ | Determined at t by Taylor rule + monetary shock; maps into real rate via Fisher.                               |
| **Real rate (derived)** \(r_t\)               |                     |                         |                          ✅ | Derived Fisher mapping, e.g. \(1+r*t=(1+i_t)/E_t[\Pi*{t+1}]\).                                                 |
| **Tobin’s q** \(q_t\)                         |                     |                      ✅ |                          ✅ | Jump variable from the investment/adjustment-cost block; pins down investment incentives in t.                 |
| **Investment** \(I_t\)                        |                     |                      ✅ |                          ✅ | Chosen/determined in t (from q block / FOCs). Enters \(K\_{t+1}\).                                             |
| **Credit spread** \(spread_t\)                |                     |                      ✅ |                          ✅ | Jump variable pinned by finance block; affects borrowing/returns in t.                                         |
| **Output (derived)** \(y_t\)                  |                     |                         |                          ✅ | Derived from production and equilibrium allocations (uses \(A_t,K_t\)).                                        |
| **Aggregate consumption (derived)** \(C_t\)   |                     |                         |                          ✅ | Aggregation of household consumption choices in t.                                                             |
| **Income scale (derived)** \(income_scale_t\) |                     |                         |                          ✅ | Scales idiosyncratic income \(z_t\) under fixed-labour closure.                                                |
| **Wages** \(w_t\)                             |                     |                         |                          ✅ | Determined in t from production/marginal products under fixed labour (or reduced-form marginal cost).          |
| **Firm profits / dividends** \(\Pi^F_t\)      |                     |                         |                          ✅ | Realized in t; rebated lump-sum (baseline) or per rule (specified in accounting block).                        |
| **Intermediary payouts** \(div^B_t\)          |                     |                         |                          ✅ | Paid in t; distribution rule to households/government specified in accounting closure.                         |
| **Transfers/taxes** \(T_t, \tau_t\)           |                     |                         |                          ✅ | Realized in t; used to close government/redistribution as needed (kept simple in v1).                          |

---

## Shock processes (as they relate to timing)

| Shock / stochastic object        | When realized?         | Where it enters?                                                                |
| -------------------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| Monetary innovation \(e\_{i,t}\) | in t                   | Taylor rule term \(\sigma*i e*{i,t}\) in \(i_t\).                               |
| TFP innovation \(e\_{A,t}\)      | in t                   | AR(1) innovation for \(A^{exo}\_t\); disaster wedge then applies if \(sD_t=1\). |
| Disaster risk regime \(pD_t\)    | observed at start of t | Governs hazard used to draw \(sD*t\); transitions to \(pD*{t+1}\).              |
| Disaster strike \(sD_t\)         | in t                   | Applies damage wedges to \(A*t\) (within t) and to \(K*{t+1}\) (transition).    |

---

## Reporting conventions (avoid confusion in figures/tables)

- Unless explicitly stated, all rates are **quarterly**.
- If annualized reporting is used in plots/tables, apply:
  - simple annualization: \(x^{ann}=4x\) for small rates, or
  - gross annualization: \((1+x)^4-1\).

---

## Checklist (acceptance criteria)

- [ ] Every state and jump variable in `D0_1_states.yaml` appears in the timing table above.
- [ ] Disaster timing is unambiguous: \(pD*t\) observed at start of t; \(sD_t\) realized in t; \(A_t\) wedge applies within t; \(K*{t+1}\) destruction applies in transition.
- [ ] Fisher/NKPC/Taylor use a consistent inflation convention (\(\pi*t=P_t/P*{t-1}-1\)).
- [ ] IRFs and nonlinear transitions run without truncation artifacts (terminal residuals ≈ 0; end-of-horizon flatness).
