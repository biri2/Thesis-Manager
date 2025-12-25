document.addEventListener("DOMContentLoaded", function () {
    const LS_KEY = "thesis_progress_tracker_v5_editable";

    // Updated Seed Data: Nested structure
    const DEFAULTS = {
        "d0": [
            { 
                id: "d0_1", 
                text: "D0.1 Define model scope and timing", 
                subtasks: [
                    { id: "d0_1_s1", text: "Task 1.1 — Write a 10-line “baseline model statement” (Mechanisms: double amplification; Success: IRFs/state dependence).", completed: false },
                    { id: "d0_1_s2", text: "Task 1.2 — Decide minimum viable blocks (MVP): pick MVP-A (simple) or MVP-B (intermediary + net worth).", completed: false },
                    { id: "d0_1_s3", text: "Task 2.1 — Periodicity: set quarterly (standard for monetary HANK).", completed: false },
                    { id: "d0_1_s4", text: "Task 2.2 — Horizons: choose IRFs (T=200-400) and nonlinear transitions.", completed: false },
                    { id: "d0_1_s5", text: "Task 3.1 — Asset timing: predetermined liquid assets, budget realized in t.", completed: false },
                    { id: "d0_1_s6", text: "Task 3.2 — Interest rate timing: policy rate set in t, maps to real rate.", completed: false },
                    { id: "d0_1_s7", text: "Task 3.3 — Inflation timing: consistency across Euler/Fisher/NKPC.", completed: false },
                    { id: "d0_1_s8", text: "Task 3.4 — Profits/dividends timing: distribution in period t as income component.", completed: false },
                    { id: "d0_1_s9", text: "Task 4.1 — Household idiosyncratic states: liquid assets, income state (z).", completed: false },
                    { id: "d0_1_s10", text: "Task 4.2 — Aggregate states: MP, inflation, net worth, disaster state (risk vs realization).", completed: false },
                    { id: "d0_1_s11", text: "Task 4.3 — Write a “state dictionary” (Domains, grid ideas, transition sources).", completed: false },
                    { id: "d0_1_s12", text: "Task 5.1 — List exogenous shocks: MP, Disaster risk, Disaster realization.", completed: false },
                    { id: "d0_1_s13", text: "Task 5.2 — Choose processes: AR(1) and two-layer disaster structure (risk + realization).", completed: false },
                    { id: "d0_1_s14", text: "Task 6.1 — Confirm model sequence space (SSJ compatibility).", completed: false },
                    { id: "d0_1_s15", text: "Task 6.2 — Nonlinear perfect-foresight consistency check.", completed: false },
                    { id: "d0_1_s16", text: "Task 6.3 — Neural surrogate approximation notes.", completed: false }
                ],
                completed: false, 
                userNotes: "",
                deliverables: [
                    { text: "D0_1_scope.md (Blocks, MVP, Solution)" },
                    { text: "D0_1_timing_sheet.md (Periodicity, Timing)" },
                    { text: "D0_1_states.yaml (States, Domains)" },
                    { text: "D0_1_shocks.md (Shock list + processes)" }
                ]
            },
            { 
                id: "d0_2", 
                text: "D0.2 Write full equilibrium system", 
                subtasks: [
                    { id: "d0_2_s0", text: "D0.2.0 Consistency freeze: Confirm toggles (two-asset, intermediary, disaster, etc.) and write 'Model toggles' section.", completed: false },
                    { id: "d0_2_s1", text: "D0.2.1 Dictionaries: Eliminate ambiguity in Variables (Agg/HH/Derived), Parameters, and Rate conventions.", completed: false },
                    { id: "d0_2_s2", text: "D0.2.2 Household block: Budget constraints (b,a), Optimality (Euler/KKT), and Distribution LoM.", completed: false },
                    { id: "d0_2_s3", text: "D0.2.3 Firm + pricing block: Technology (mc), price-setting (Rotemberg/NKPC), and profit rebates.", completed: false },
                    { id: "d0_2_s4", text: "D0.2.4 Capital + investment block: LoM with damage wedges, adjustment costs, and q Euler equation.", completed: false },
                    { id: "d0_2_s5", text: "D0.2.5 Intermediary block: Balance sheet identity, net worth LoM (losses/disasters), and spread mapping.", completed: false },
                    { id: "d0_2_s6", text: "D0.2.6 Monetary policy: Taylor rule with inertia and clean definition of real liquid return (Fisher).", completed: false },
                    { id: "d0_2_s7", text: "D0.2.7 Disaster module: Arrival process (pd, sd), impact equations (A,K), and SSJ regime specification.", completed: false },
                    { id: "d0_2_s8", text: "D0.2.8 Market clearing: GE closure (goods, asset markets) and Walras' law redundancy check.", completed: false },
                    { id: "d0_2_s9", text: "D0.2.9 SSJ closure mapping: Mapping residuals to unknowns with copy-pastable SSJ closure table.", completed: false }
                ],
                completed: false, 
                userNotes: "",
                deliverables: [
                    { text: "D0_2_equilibrium_system.md" }
                ]
            },
            { 
                id: "d0_3", 
                text: "D0.3 Block modularization", 
                subtasks: [
                    { id: "d0_3_s1", text: "Create separate “block specs” for: households, aggregation, pricing, policy, banks, shocks.", completed: false },
                    { id: "d0_3_s2", text: "Specify interfaces: inputs/outputs of each block (what each block consumes/produces).", completed: false }
                ],
                completed: false, 
                userNotes: "",
                deliverables: []
            },
            { 
                id: "d0_4", 
                text: "D0.4 Document notation + variable dictionary", 
                subtasks: [
                    { id: "d0_4_s1", text: "Variable names in code vs symbols in paper.", completed: false },
                    { id: "d0_4_s2", text: "Units (annualized rates, log deviations, levels).", completed: false }
                ],
                completed: false, 
                userNotes: "",
                deliverables: []
            }
        ],
        "d1": [
            { id: "d1_1", text: "D1.1 Empirical Anchor Set", subtasks: [
                { id: "d1_1_s1", text: "Banking transmission moments.", completed: false },
                { id: "d1_1_s2", text: "Leverage/state dependence moments.", completed: false },
                { id: "d1_1_s3", text: "Household heterogeneity moments.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d1_2", text: "D1.2 Parameter Configuration", subtasks: [
                { id: "d1_2_s1", text: "Create model/calibration/params.yaml with all parameters, units, priors.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d1_3", text: "D1.3 Calibration Targets", subtasks: [
                { id: "d1_3_s1", text: "Create model/calibration/targets.yaml with data source and model analog.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d1_4", text: "D1.4 Targets Pipeline", subtasks: [
                { id: "d1_4_s1", text: "Scripts to download/clean series.", completed: false },
                { id: "d1_4_s2", text: "Compute moments and export tables.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d1_5", text: "D1.5 Calibration Logic", subtasks: [
                { id: "d1_5_s1", text: "Partition parameters: calibrated vs fixed vs estimated.", completed: false },
                { id: "d1_5_s2", text: "Add calibration notebook.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] }
        ],
        "d2": [
            { id: "d2_1", text: "D2.1 Baseline Implementation", subtasks: [
                { id: "d2_1_s1", text: "Household block + aggregation.", completed: false },
                { id: "d2_1_s2", text: "Monetary policy rule + basic shocks.", completed: false },
                { id: "d2_1_s3", text: "Goods market clearing.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d2_2", text: "D2.2 Steady State Solver", subtasks: [
                { id: "d2_2_s1", text: "Implement steady_state.py.", completed: false },
                { id: "d2_2_s2", text: "Add residual checks.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d2_3", text: "D2.3 Linear cross-checks", subtasks: [
                { id: "d2_3_s1", text: "Optional SSJ/linear IRFs for cross-checking.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d2_4", text: "D2.4 Nonlinear Transition", subtasks: [
                { id: "d2_4_s1", text: "Implement transition_nonlinear.py.", completed: false },
                { id: "d2_4_s2", text: "Convergence diagnostics.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d2_5", text: "D2.5 Baseline Results", subtasks: [
                { id: "d2_5_s1", text: "Produce IRFs for: monetary policy, TFP.", completed: false },
                { id: "d2_5_s2", text: "Export figures and run card.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] }
        ],
        "d3": [
            { id: "d3_1", text: "D3.1 Bank Modeling Level", subtasks: [
                { id: "d3_1_s1", text: "Full intermediary net-worth vs reduced-form.", completed: false },
                { id: "d3_1_s2", text: "Decide bank assets/liabilities mapping.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d3_2", text: "D3.2 Bank Block Mechanics", subtasks: [
                { id: "d3_2_s1", text: "Net worth law of motion.", completed: false },
                { id: "d3_2_s2", text: "Leverage constraint.", completed: false },
                { id: "d3_2_s3", text: "Spread definition.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d3_3", text: "D3.3 System Integration", subtasks: [
                { id: "d3_3_s1", text: "Replace risk-free rate with deposit/lending rates.", completed: false },
                { id: "d3_3_s2", text: "Ensure balance sheet clears.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d3_4", text: "D3.4 Intermediary Calibration", subtasks: [
                { id: "d3_4_s1", text: "Target spreads, leverage, net worth persistence.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d3_5", text: "D3.5 Validation Tests", subtasks: [
                { id: "d3_5_s1", text: "Monetary tightening response.", completed: false },
                { id: "d3_5_s2", text: "Sensitivity by capitalization.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] }
        ],
        "d4": [
            { id: "d4_1", text: "D4.1 Disaster Specification", subtasks: [
                { id: "d4_1_s1", text: "Disaster risk vs realization.", completed: false },
                { id: "d4_1_s2", text: "Markov/Poisson arrival.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d4_2", text: "D4.2 Economic Mapping", subtasks: [
                { id: "d4_2_s1", text: "Supply-side: TFP/capital destruction.", completed: false },
                { id: "d4_2_s2", text: "Financial-side: collateral loss.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d4_3", text: "D4.3 Shock Implementation", subtasks: [
                { id: "d4_3_s1", text: "State transition + shock injection.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d4_4", text: "D4.4 Magnitude Calibration", subtasks: [
                { id: "d4_4_s1", text: "Match output/inflation impact ranges.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d4_5", text: "D4.5 Disaster Experiments", subtasks: [
                { id: "d4_5_s1", text: "Disaster risk shock.", completed: false },
                { id: "d4_5_s2", text: "Disaster realization shock.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] }
        ],
        "d5": [
            { id: "d5_1", text: "D5.1 Experiment Registry", subtasks: [
                { id: "d5_1_s1", text: "Create experiments/registry.yaml with IDs.", completed: false }
            ], completed: false, userNotes: "" },
            { id: "d5_2", text: "D5.2 Policy Rule Variants", subtasks: [
                { id: "d5_2_s1", text: "Baseline Taylor rule vs aggressive response.", completed: false }
            ], completed: false, userNotes: "" },
            { id: "d5_3", text: "D5.3 Comprehensive Runs", subtasks: [
                { id: "d5_3_s1", text: "Run each experiment with consistent horizon.", completed: false }
            ], completed: false, userNotes: "" },
            { id: "d5_4", text: "D5.4 Robustness Profiles", subtasks: [
                { id: "d5_4_s1", text: "Parameter sensitivity around key elasticities.", completed: false }
            ], completed: false, userNotes: "" },
            { id: "d5_5", text: "D5.5 Visual Artifacts", subtasks: [
                { id: "d5_5_s1", text: "Macro IRFs, Spreads, Policy trade-offs.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] }
        ],
        "d6": [
            { id: "d6_1", text: "D6.1 Decomposition Strategy", subtasks: [
                { id: "d6_1_s1", text: "Choose decomposition strategy (counterfactuals vs channels).", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d6_2", text: "D6.2 Counterfactual Runs", subtasks: [
                { id: "d6_2_s1", text: "HANK+Banks, HANK no banks, RANK+Banks, RANK no banks.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d6_3", text: "D6.3 Quantify Effects", subtasks: [
                { id: "d6_3_s1", text: "Define metrics and construct decomposition table.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d6_4", text: "D6.4 Narrative Synthesis", subtasks: [
                { id: "d6_4_s1", text: "“Why” amplification differs across states.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] }
        ],
        "d7": [
            { id: "d7_1", text: "D7.1 Objective Definition", subtasks: [
                { id: "d7_1_s1", text: "Choose parameters to estimate.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d7_2", text: "D7.2 Training Set Construction", subtasks: [
                { id: "d7_2_s1", text: "Sample parameters -> Generate moments.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d7_3", text: "D7.3 Surrogate Training", subtasks: [
                { id: "d7_3_s1", text: "Train NN (params -> moments).", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d7_4", text: "D7.4 Fast Estimation", subtasks: [
                { id: "d7_4_s1", text: "Use surrogate for fast evaluation.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] },
            { id: "d7_5", text: "D7.5 Credibility Reporting", subtasks: [
                { id: "d7_5_s1", text: "Sensitivity to priors.", completed: false }
            ], completed: false, userNotes: "", deliverables: [] }
        ]
    };

    // Global State
    let data = {};

    function loadState() {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
            data = JSON.parse(raw);
            migrateData();
        } else {
            data = JSON.parse(JSON.stringify(DEFAULTS));
        }
        
        // Ensure all deliverables exist
        Object.keys(DEFAULTS).forEach(k => {
            if (!data[k]) data[k] = JSON.parse(JSON.stringify(DEFAULTS[k]));
        });
        saveState();
    }

    function migrateData() {
        // Force update for all groups to ensure they match DEFAULTS (tasks/deliverables)
        // This handles "not fitting" and "not chrome" by ensuring latest detailed specs are used
        Object.keys(DEFAULTS).forEach(delivId => {
            if (!data[delivId]) {
                data[delivId] = JSON.parse(JSON.stringify(DEFAULTS[delivId]));
                return;
            }
            
            DEFAULTS[delivId].forEach(defaultGroup => {
                let existingGroup = data[delivId].find(g => g.id === defaultGroup.id);
                if (!existingGroup) {
                    data[delivId].push(JSON.parse(JSON.stringify(defaultGroup)));
                } else {
                    // If existing group has significantly fewer tasks/deliverables, sync it
                    // This is a safe way to push updates without destroying user notes entirely
                    if (existingGroup.subtasks.length < defaultGroup.subtasks.length || 
                        (defaultGroup.deliverables && existingGroup.deliverables.length < defaultGroup.deliverables.length)) {
                        existingGroup.subtasks = JSON.parse(JSON.stringify(defaultGroup.subtasks));
                        existingGroup.deliverables = JSON.parse(JSON.stringify(defaultGroup.deliverables || []));
                        existingGroup.text = defaultGroup.text;
                    }
                }
            });
        });

        // General migration for subtasks formatting
        Object.keys(data).forEach(delivId => {
            data[delivId].forEach(subgroup => {
                if (!subgroup.subtasks) {
                    const subtasks = [];
                    const description = subgroup.description || "";
                    const liMatches = description.match(/<li>(.*?)<\/li>/g);
                    if (liMatches) {
                        liMatches.forEach((match, idx) => {
                            const text = match.replace(/<\/?li>/g, "").trim();
                            subtasks.push({
                                id: `${subgroup.id}_migrated_${idx}`,
                                text: text,
                                completed: false
                            });
                        });
                    }
                    subgroup.subtasks = subtasks;
                    delete subgroup.description;
                }
                if (!subgroup.deliverables) {
                    subgroup.deliverables = [];
                }
            });
        });
    }

    function saveState() {
        localStorage.setItem(LS_KEY, JSON.stringify(data));
        updateAllProgress();
    }

    // UI Helpers
    function createTaskCard(subgroup, delivId) {
        const container = document.createElement('div');
        container.className = 'task-flip-container';
        
        const total = subgroup.subtasks.length;
        const completed = subgroup.subtasks.filter(s => s.completed).length;
        const percent = total === 0 ? 0 : Math.round((completed/total)*100);

        // VIEW MODE HTML
        const viewModeHtml = `
            <div class="task-mode-view" id="view-${subgroup.id}">
                <div class="subgroup-header" onclick="toggleSubgroupCollapse('${subgroup.id}')">
                    <div class="subgroup-title-row">
                        <i class="ph ph-caret-right subgroup-caret" id="caret-${subgroup.id}" style="transform: rotate(90deg);"></i>
                        <span class="subgroup-name ${subgroup.completed ? 'completed' : ''}">${subgroup.text}</span>
                        <span class="subgroup-progress-badge">${percent}%</span>
                    </div>
                </div>
                
                <div class="subtask-list-container" id="list-${subgroup.id}" onclick="event.stopPropagation()">
                    <div class="subtask-items">
                        ${subgroup.subtasks.map(s => `
                            <div class="subtask-item">
                                <label class="subtask-label">
                                    <input type="checkbox" ${s.completed ? 'checked' : ''} 
                                           onchange="toggleSubTask('${delivId}', '${subgroup.id}', '${s.id}', this)">
                                    <span class="subtask-text ${s.completed ? 'completed' : ''}">${s.text}</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>

                    ${subgroup.deliverables && subgroup.deliverables.length > 0 ? `
                        <div class="deliverables-section">
                            <div class="deliverables-header">
                                <i class="ph ph-cube"></i> Key Deliverables
                            </div>
                            <div class="deliverable-items">
                                ${subgroup.deliverables.map(d => `
                                    <div class="deliverable-item">
                                        <i class="ph ph-file-text deliverable-icon"></i>
                                        <span class="deliverable-text">${d.text}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // EDIT MODE HTML
        const editModeHtml = `
            <div class="task-mode-edit edit-mode-hidden" id="edit-${subgroup.id}">
                <div class="edit-group-header">
                    <input type="text" class="task-edit-input" id="title-input-${subgroup.id}" value="${subgroup.text.replace(/"/g, '&quot;')}" placeholder="Group Name">
                </div>
                <div class="subtask-edit-list" id="edit-subtasks-${subgroup.id}">
                    ${subgroup.subtasks.map((s, idx) => `
                        <div class="subtask-edit-row" data-sub-id="${s.id}">
                            <input type="text" class="subtask-edit-input" value="${s.text.replace(/"/g, '&quot;')}" placeholder="Subtask description">
                            <button class="btn-subtask-remove" onclick="removeSubtaskEditRow(this)" title="Remove Subtask">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-add-subtask-row" onclick="addSubtaskEditRow('${subgroup.id}')">
                    <i class="ph ph-plus"></i> Add Subtask
                </button>

                <!-- Deliverables Edit Section -->
                <div class="deliverables-section">
                    <div class="deliverables-header">
                        <i class="ph ph-cube"></i> Manage Deliverables
                    </div>
                    <div class="deliverables-edit-list" id="edit-deliverables-${subgroup.id}">
                        ${(subgroup.deliverables || []).map(d => `
                            <div class="deliverable-edit-row">
                                <input type="text" class="deliverable-edit-input" value="${d.text.replace(/"/g, '&quot;')}" placeholder="Deliverable name (e.g. model.m)">
                                <button class="btn-deliverable-remove" onclick="removeDeliverableRow(this)" title="Remove Deliverable">
                                    <i class="ph ph-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-add-deliverable-row" onclick="addDeliverableRow('${subgroup.id}')">
                        <i class="ph ph-plus"></i> Add Deliverable
                    </button>
                </div>
                <div style="text-align: right; margin-top: 16px; border-top: 1px solid var(--card-border); padding-top: 12px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn-task-cancel" onclick="cancelEdit('${subgroup.id}')">Cancel</button>
                    <button class="btn-task-save" onclick="saveEdit('${delivId}', '${subgroup.id}')">Save Changes</button>
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="task-flipper" id="flipper-${subgroup.id}">
                <div class="task-front ${subgroup.completed ? 'task-completed' : ''}">
                    <div>
                        ${viewModeHtml}
                        ${editModeHtml}
                    </div>
                    
                    <div class="task-actions" id="actions-${subgroup.id}">
                        <button class="btn-task-icon" onclick="startEdit('${subgroup.id}')" title="Edit Group & Tasks">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-task-icon" onclick="flipCard('${subgroup.id}')" title="Private Notes">
                            <i class="ph ph-note-pencil"></i>
                        </button>
                    </div>
                </div>
                <div class="task-back">
                    <h4 style="margin: 0 0 10px; font-size: 0.9rem; color: var(--text-muted);">Your Private Notes</h4>
                    <textarea class="task-detail-input" 
                              placeholder="Notes, ideas, or calculations..." 
                              oninput="updateUserNotes('${delivId}', '${subgroup.id}', this)">${subgroup.userNotes || ''}</textarea>
                    <div class="task-back-actions">
                        <button class="btn-task-icon btn-task-danger" onclick="removeTask('${delivId}', '${subgroup.id}')" title="Delete Group">
                            <i class="ph ph-trash"></i>
                        </button>
                        <button class="btn-task-icon" onclick="unflipCard('${subgroup.id}')" title="Done">
                            <i class="ph ph-check"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        return container;
    }

    window.toggleSubgroupCollapse = function(id) {
        const list = document.getElementById(`list-${id}`);
        const caret = document.getElementById(`caret-${id}`);
        if (list) {
            list.classList.toggle('collapsed');
            caret.style.transform = list.classList.contains('collapsed') ? '' : 'rotate(90deg)';
        }
    };

    window.toggleSubTask = function(delivId, groupId, subId, checkbox) {
        const group = data[delivId].find(g => g.id === groupId);
        if (group) {
            const sub = group.subtasks.find(s => s.id === subId);
            if (sub) {
                sub.completed = checkbox.checked;
                // Auto-complete group if all subtasks done
                const allDone = group.subtasks.every(s => s.completed);
                group.completed = allDone;
                
                saveState();
                renderDeliverable(delivId);
            }
        }
    };

    function renderDeliverable(delivId) {
        const container = document.getElementById(`tasks-${delivId}`);
        if (!container) return;
        container.innerHTML = '';
        const groups = data[delivId] || [];
        groups.forEach(group => {
            container.appendChild(createTaskCard(group, delivId));
        });
        updateProgress(delivId);
    }

    function renderAll() {
        Object.keys(data).forEach(k => renderDeliverable(k));
        updateOverallProgress();
    }

    // Actions
    window.startEdit = function(id) {
        document.getElementById(`view-${id}`).classList.add('view-mode-hidden');
        document.getElementById(`actions-${id}`).classList.add('view-mode-hidden');
        document.getElementById(`edit-${id}`).classList.remove('edit-mode-hidden');
    };

    window.cancelEdit = function(id) {
        document.getElementById(`view-${id}`).classList.remove('view-mode-hidden');
        document.getElementById(`actions-${id}`).classList.remove('view-mode-hidden');
        document.getElementById(`edit-${id}`).classList.add('edit-mode-hidden');
        // Re-render to discard unsaved row changes
        const delivId = id.split('_')[0]; 
        renderDeliverable(delivId);
    };

    window.addSubtaskEditRow = function(groupId) {
        const container = document.getElementById(`edit-subtasks-${groupId}`);
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'subtask-edit-row';
        row.innerHTML = `
            <input type="text" class="subtask-edit-input" placeholder="Subtask description">
            <button class="btn-subtask-remove" onclick="removeSubtaskEditRow(this)" title="Remove Subtask">
                <i class="ph ph-trash"></i>
            </button>
        `;
        container.appendChild(row);
        row.querySelector('input').focus();
    };

    window.removeSubtaskEditRow = function(btn) {
        btn.parentElement.remove();
    };

    window.addDeliverableRow = function(groupId) {
        const container = document.getElementById(`edit-deliverables-${groupId}`);
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'deliverable-edit-row';
        row.innerHTML = `
            <input type="text" class="deliverable-edit-input" placeholder="Deliverable name (e.g. model.m)">
            <button class="btn-deliverable-remove" onclick="removeDeliverableRow(this)" title="Remove Deliverable">
                <i class="ph ph-trash"></i>
            </button>
        `;
        container.appendChild(row);
        row.querySelector('input').focus();
    };

    window.removeDeliverableRow = function(btn) {
        btn.parentElement.remove();
    };

    window.saveEdit = function(delivId, groupId) {
        const title = document.getElementById(`title-input-${groupId}`).value;
        const container = document.getElementById(`edit-subtasks-${groupId}`);
        const rows = container.querySelectorAll('.subtask-edit-row');
        
        const group = data[delivId].find(g => g.id === groupId);
        if (group) {
            group.text = title;
            
            const newSubtasks = [];
            rows.forEach((row, idx) => {
                const input = row.querySelector('.subtask-edit-input');
                const text = input.value.trim();
                if (text) {
                    // Try to preserve completion state if it's the same ID
                    const oldId = row.getAttribute('data-sub-id');
                    let completed = false;
                    if (oldId) {
                        const oldSub = group.subtasks.find(s => s.id === oldId);
                        if (oldSub) completed = oldSub.completed;
                    }

                    newSubtasks.push({
                        id: oldId || `${groupId}_s${Date.now()}_${idx}`,
                        text: text,
                        completed: completed
                    });
                }
            });
            
            group.subtasks = newSubtasks;

            // Save Deliverables
            const delivContainer = document.getElementById(`edit-deliverables-${groupId}`);
            const delivRows = delivContainer.querySelectorAll('.deliverable-edit-row');
            const newDeliverables = [];
            delivRows.forEach(row => {
                const text = row.querySelector('.deliverable-edit-input').value.trim();
                if (text) {
                    newDeliverables.push({ text: text });
                }
            });
            group.deliverables = newDeliverables;

            group.completed = group.subtasks.length > 0 && group.subtasks.every(s => s.completed);
            
            saveState();
            renderDeliverable(delivId);
        }
    };

    window.updateUserNotes = function(delivId, groupId, textarea) {
        const group = data[delivId].find(g => g.id === groupId);
        if (group) {
            group.userNotes = textarea.value;
            saveState();
        }
    };

    window.addTask = function(delivId) {
        const name = prompt("Enter Group Name:");
        if (name) {
            const id = `${delivId}_g${Date.now()}`;
            if (!data[delivId]) data[delivId] = [];
            data[delivId].push({
                id: id,
                text: name,
                subtasks: [],
                completed: false,
                userNotes: ""
            });
            saveState();
            renderDeliverable(delivId);
            setTimeout(() => window.startEdit(id), 100);
        }
    };

    window.removeTask = function(delivId, groupId) {
        if (confirm("Delete this group and all its tasks?")) {
            data[delivId] = data[delivId].filter(g => g.id !== groupId);
            saveState();
            renderDeliverable(delivId);
        }
    };

    window.flipCard = function(id) {
        const flipper = document.getElementById(`flipper-${id}`);
        if (flipper) flipper.classList.add('flipped');
    };

    window.unflipCard = function(id) {
        const flipper = document.getElementById(`flipper-${id}`);
        if (flipper) flipper.classList.remove('flipped');
    };

    // Progress Logic
    function updateProgress(delivId) {
        const groups = data[delivId] || [];
        let total = 0;
        let completed = 0;
        groups.forEach(g => {
            total += g.subtasks.length;
            completed += g.subtasks.filter(s => s.completed).length;
        });

        const percent = total === 0 ? 0 : (completed / total) * 100;
        const card = document.querySelector(`.deliverable-card[data-id="${delivId}"]`);
        if (card) {
            const bar = card.querySelector('.progress-fill');
            const txt = card.querySelector('.progress-text');
            if (bar) bar.style.width = `${percent}%`;
            if (txt) txt.innerText = `${Math.round(percent)}%`;
            if (percent === 100 && total > 0) card.classList.add('completed');
            else card.classList.remove('completed');
        }
        updateOverallProgress();
    }

    function updateOverallProgress() {
        let total = 0;
        let completed = 0;
        Object.values(data).forEach(groups => {
            groups.forEach(g => {
                total += g.subtasks.length;
                completed += g.subtasks.filter(s => s.completed).length;
            });
        });

        const overall = total === 0 ? 0 : (completed / total) * 100;
        const bar = document.querySelector('.overall-progress-fill');
        const txt = document.querySelector('.overall-progress-text');
        if (bar) bar.style.width = `${overall}%`;
        if (txt) txt.innerText = `${Math.round(overall)}%`;
    }

    function updateAllProgress() {
        Object.keys(data).forEach(k => updateProgress(k));
    }

    loadState();
    renderAll();
});

