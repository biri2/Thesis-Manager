document.addEventListener('DOMContentLoaded', function() {
    initBlueprint();
});

let modelData = {};
let parsedStates = {};
let allSymbols = [];
let currentSearchFilter = 'all';

// Unified Global Registry (Populated from backend)
let variableRegistry = {};
let consistencyChecks = [];

const MODEL_CONFIG = {
  blueprint: "Two-asset HANK + NK + capital + intermediaries + disaster risk",
  scope: [
    {"label":"Two-asset HANK", "enabled":true},
    {"label":"Capital + Investment", "enabled":true},
    {"label":"NK Pricing", "enabled":true},
    {"label":"Financial Frictions", "enabled":true,
     "note":"Intermediary net-worth / leverage constraint \u21D2 endogenous spread"},
    {"label":"Disaster Risk", "enabled":true},
    {"label":"Monetary Policy Rule (Taylor + Fisher)", "enabled":true},
    {"label":"Market Clearing + Accounting", "enabled":true}
  ],
  excluded_v1: [
    "Term structure / QE-QT",
    "Endogenous default",
    "Detailed brown/green sector split",
    "Stochastic volatility"
  ]
};

async function initBlueprint() {
    await fetchData();
    extractSymbols();
    setupNavigation();
    renderAll();
    setupSearch();
    setupMath();
}

async function fetchData() {
    try {
        const [blueprintRes, statesRes, registryRes, checksRes] = await Promise.all([
            fetch('/api/model/blueprint'),
            fetch('/api/model/states_parsed'),
            fetch('/api/model/registry'),
            fetch('/api/model/consistency_checks')
        ]);

        modelData = await blueprintRes.json();
        parsedStates = await statesRes.json();
        variableRegistry = await registryRes.json();
        consistencyChecks = await checksRes.json();
    } catch (error) {
        console.error("Error fetching model blueprint data:", error);
    }
}

function extractSymbols() {
    allSymbols = [];
    const groupMap = {
        'household_state': 'Household State Variables',
        'aggregate_state': 'Aggregate State Variables (Predetermined)',
        'jump': 'Aggregate Jump (Equilibrium) Variables',
        'process': 'Stochastic Processes (Exogenous)',
        'shock': 'Disaster States and Shocks',
        'derived': 'Derived (Non-state) Variables'
    };

    Object.entries(variableRegistry).forEach(([name, meta]) => {
        const group = groupMap[meta.category] || 'Derived (Non-state) Variables';
        allSymbols.push({ 
            name, 
            ...meta, 
            group,
            type: meta.category,
            meaning: meta.meaning || 'Parsed from ' + meta.defined_in.join(', '),
            used: meta.used_in ? (Array.isArray(meta.used_in) ? meta.used_in.join(', ') : meta.used_in) : 'Standard closure'
        });
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            jumpToTab(tabId);
        });
    });
}

function jumpToTab(tabId) {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(nav => nav.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    const activeView = document.getElementById(`${tabId}-view`);
    if (activeView) activeView.classList.add('active');
    
    if (tabId === 'consistency') renderConsistency();
    if (tabId === 'model-map') renderDetailedMap('general');
}

function renderAll() {
    // Update Subtitle
    const subtitle = document.querySelector('.model-name');
    if (subtitle) subtitle.textContent = MODEL_CONFIG.blueprint;

    renderMarkdown('scope-md', modelData.scope_content);
    renderKeyDecisions(modelData.scope_content);
    renderExclusions();
    renderMarkdown('shocks-md', modelData.shocks_content);
    renderShocksSummary(modelData.shocks_content);
    renderMarkdown('timing-md', modelData.timing_content);
    renderCategorizedSymbols();
    renderAlgorithmicSequence();
    renderStatesCards();
    renderJSONTree(parsedStates, document.getElementById('yaml-tree-view'));
    
    document.getElementById('states-yaml-raw').textContent = modelData.states_content;
    hljs.highlightElement(document.getElementById('states-yaml-raw'));
}

function renderShocksSummary(content) {
    const summaryContainer = document.getElementById('shocks-summary');
    if (!summaryContainer || !content) return;

    const lines = content.split('\n');
    let tableLines = [];
    let inTable = false;

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && (trimmed.includes('Object') || trimmed.includes('Symbol'))) {
            inTable = true;
            tableLines.push(trimmed);
            continue;
        }
        if (inTable) {
            if (trimmed.startsWith('|')) {
                tableLines.push(trimmed);
            } else if (tableLines.length > 2) {
                break;
            }
        }
    }

    if (tableLines.length < 3) return;

    const parseRow = (line) => line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
    
    // Helper to clean up KaTeX/Markdown conflicts
    const cleanMath = (str) => {
        if (!str) return str;
        // Fix double-escaped underscores often found in markdown tables
        let cleaned = str.replace(/\\_/g, '_');
        // If it looks like math but isn't wrapped, wrap it
        if ((cleaned.includes('_') || cleaned.includes('^') || cleaned.includes('\\')) && !cleaned.includes('\\(') && !cleaned.includes('$')) {
            return `\\(${cleaned}\\)`;
        }
        return cleaned;
    };

    const headers = parseRow(tableLines[0]);
    const rows = tableLines.slice(2).map(row => parseRow(row).map(cleanMath));

    let html = `
        <div class="shocks-summary-card">
            <div class="card-header">
                <i class="ph ph-lightning"></i>
                <h3>Stochastic Registry</h3>
            </div>
            <div class="table-scroller">
                <table class="shocks-table">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${row.map((cell, i) => {
                                    // Make everything blue as requested
                                    return `<td class="shocks-cell">${cell}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    summaryContainer.innerHTML = html;
    setupMath(summaryContainer);
}

function renderCategorizedSymbols() {
    const groups = {
        'states': document.getElementById('group-states'),
        'jumps': document.getElementById('group-jumps'),
        'shocks': document.getElementById('group-shocks'),
        'processes': document.getElementById('group-processes'),
        'derived': document.getElementById('group-derived')
    };

    if (!groups.states) return;

    // Clear previous
    Object.values(groups).forEach(el => el.innerHTML = '');

    allSymbols.forEach(s => {
        let groupKey = 'derived';
        if (s.group === 'Household State Variables' || s.group === 'Aggregate State Variables (Predetermined)') groupKey = 'states';
        else if (s.group === 'Aggregate Jump (Equilibrium) Variables') groupKey = 'jumps';
        else if (s.group === 'Stochastic Processes (Exogenous)') groupKey = 'processes';
        else if (s.group === 'Disaster States and Shocks') groupKey = 'shocks';
        else if (s.group === 'Derived (Non-state) Variables') groupKey = 'derived';
        else if (s.group === 'Disaster Impact Objects') groupKey = 'derived';

        const container = groups[groupKey];
        if (!container) return;

        // Custom Tooltip (3-line layout)
        let tooltip = `${s.name} \u2014 ${s.meaning || 'N/A'}\n`;
        tooltip += `Type: ${s.type || s.category}${s.type ? ' (' + s.type.toLowerCase() + ')' : ''}\n`;
        tooltip += `Timing: ${s.timing || (s.name === 'sD' ? 'Realized in t' : 'Dynamic realization')}`;
        
        if (s.name === 'sD') {
            tooltip += `\nDepends on: pD`;
        } else if (s.notes && s.notes.includes('choice variable is')) {
            const choiceMatch = s.notes.match(/choice variable is\s+([^.]+)/);
            if (choiceMatch) {
                tooltip += `\nChoice: ${choiceMatch[1].trim()}`;
            }
        }

        let displayName = s.name;
        if (displayName === 'pi') displayName = '\\pi';
        const mathWrapped = `\\(${displayName}\\)`;

        const chip = document.createElement('span');
        chip.className = 's-chip';
        
        // Visual distinction for sD (realization)
        if (s.name === 'sD') {
            chip.classList.add('shock-realization');
            chip.innerHTML = `<i class="ph ph-lightning" style="font-size: 0.8rem; margin-right: 4px;"></i> ${mathWrapped} <small style="font-size: 0.6rem; opacity: 0.6; margin-left: 4px;">REALIZATION</small>`;
        } else {
            chip.innerHTML = mathWrapped;
        }
        
        chip.setAttribute('data-tooltip', tooltip);
        
        chip.onclick = () => {
            if (groupKey === 'processes') {
                showProcessDetails(s);
            } else {
                highlightSymbol(s.name);
            }
        };

        container.appendChild(chip);
    });

    setupMath(document.querySelector('.timing-symbol-groups'));
}

function showProcessDetails(s) {
    jumpToTab('states');
    showVariableInfo(s.name);
}

function renderAlgorithmicSequence() {
    const container = document.getElementById('timing-checklist');
    if (!container) return;

    const steps = [
        { title: "Aggregate shocks realized", symbols: ["\\varepsilon^i_t", "sD_t"] },
        { title: "Idiosyncratic risk determined", symbols: ["z_t \\text{ via } P_z"] },
        { title: "Equilibrium prices/jumps solved", symbols: ["\\pi_t", "i_t", "q_t", "spread_t"] },
        { title: "Stocks updated for t+1", symbols: ["b_{t+1}", "a_{t+1}", "K_{t+1}", "N_{t+1}", "i_{lag,t+1}", "pD_{t+1}"] }
    ];

    container.innerHTML = steps.map(step => `
        <li>
            <div class="step-line">
                <strong>${step.title}</strong>
                <div class="step-symbols">
                    ${step.symbols.map(s => `\\(${s}\\)`).join(', ')}
                </div>
            </div>
        </li>
    `).join('');

    setupMath(container);
}

function toggleDerived() {
    const container = document.getElementById('group-derived');
    const category = document.getElementById('derived-category');
    container.classList.toggle('hidden');
    category.classList.toggle('collapsed');
}

function highlightSymbol(symbol) {
    jumpToTab('states');
    setTimeout(() => {
        showVariableInfo(symbol);
        const activePill = document.querySelector(`.state-pill[data-var="${symbol}"]`);
        if (activePill) {
            activePill.scrollIntoView({ behavior: 'smooth', block: 'center' });
            activePill.style.outline = '3px solid #f59e0b';
            activePill.style.outlineOffset = '4px';
            setTimeout(() => activePill.style.outline = 'none', 3000);
        }
    }, 100);
}

function renderStatesCards() {
    const container = document.getElementById('states-cards');
    if (!container) return;

    const groupMap = {
        'household_state': 'Household State Variables',
        'aggregate_state': 'Aggregate State Variables (Predetermined)',
        'jump': 'Aggregate Jump (Equilibrium) Variables',
        'process': 'Stochastic Processes (Exogenous)',
        'shock': 'Disaster States and Shocks',
        'derived': 'Derived (Non-state) Variables'
    };

    const groups = {};
    Object.values(groupMap).forEach(g => groups[g] = []);

    Object.entries(variableRegistry).forEach(([name, meta]) => {
        const groupName = groupMap[meta.category] || 'Derived (Non-state) Variables';
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push({ name, ...meta });
    });

    let html = '';
    Object.entries(groups).forEach(([title, items]) => {
        if (items.length === 0) return;
        html += `
            <div class="state-card">
                <h4>${title}</h4>
                <div class="state-items-flex">
                    ${items.sort((a,b) => a.name.localeCompare(b.name)).map(item => {
                        let displayName = item.name;
                        if (displayName === 'pi') displayName = '\\pi';
                        const mathWrapped = `\\(${displayName}\\)`;

                        return `
                            <div class="state-pill" onclick="showVariableInfo('${item.name}')" data-var="${item.name}">
                                <i class="ph ph-cube"></i>
                                <span class="state-symbol">${mathWrapped}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    setupMath(container);
}

function showVariableInfo(varName) {
    const meta = variableRegistry[varName];
    if (!meta) return;

    // Highlight active pill
    document.querySelectorAll('.state-pill').forEach(p => p.classList.remove('active'));
    const activePill = document.querySelector(`.state-pill[data-var="${varName}"]`);
    if (activePill) activePill.classList.add('active');

    // Populate panel
    document.getElementById('panel-placeholder').classList.add('hidden');
    document.getElementById('panel-content').classList.remove('hidden');
    
    document.getElementById('panel-var-name').textContent = varName;
    document.getElementById('panel-var-type').textContent = meta.category.replace('_', ' ');
    document.getElementById('panel-var-timing').textContent = meta.timing;
    document.getElementById('panel-var-domain').textContent = meta.domain || 'Unconstrained real';
    document.getElementById('panel-var-meaning').textContent = meta.meaning || 'Parsed from ' + meta.defined_in.join(', ');
    document.getElementById('panel-var-used').textContent = meta.used_in ? (Array.isArray(meta.used_in) ? meta.used_in.join(', ') : meta.used_in) : 'GE System';
    
    const notesBox = document.getElementById('panel-var-notes-box');
    const notesEl = document.getElementById('panel-var-notes');
    if (meta.choice || meta.notes) {
        notesBox.classList.remove('hidden');
        notesEl.innerHTML = meta.choice ? `<strong>Choice variable:</strong> ${meta.choice}` : meta.notes;
    } else {
        notesBox.classList.add('hidden');
    }

    // Toggle shock button visibility
    const shockBtn = document.getElementById('btn-view-shock');
    if (meta.category === 'shock' || meta.category === 'process') {
        shockBtn.classList.remove('hidden');
    } else {
        shockBtn.classList.add('hidden');
    }

    // Run math on panel
    setupMath(document.getElementById('variable-info-panel'));
}

function renderMarkdown(elementId, content) {
    const el = document.getElementById(elementId);
    if (el && content) {
        el.innerHTML = marked.parse(content);
        el.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
        setupMath(el);
    }
}

function renderKeyDecisions(content) {
    const box = document.getElementById('key-decisions-box');
    if (!box) return;
    
    box.innerHTML = MODEL_CONFIG.scope.map(d => `
        <div class="decision-item">
            <div class="decision-main">
                <span class="decision-label">${d.label}</span>
                <span class="decision-value">${d.enabled ? 'Yes' : 'No'}</span>
            </div>
            ${d.note ? `<div class="decision-note">${d.note}</div>` : ''}
        </div>
    `).join('');
}

function renderExclusions() {
    const box = document.getElementById('exclusions-box');
    if (!box) return;
    
    box.innerHTML = `
        <div class="exclusions-title">Excluded (v1)</div>
        <div class="exclusions-list">
            ${MODEL_CONFIG.excluded_v1.map(ex => `<span>${ex}</span>`).join(' \u2022 ')}
        </div>
    `;
}

function setupSearch() {
    const input = document.getElementById('global-search');
    const filterChips = document.querySelectorAll('.filter-chip');

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentSearchFilter = chip.getAttribute('data-filter');
            input.dispatchEvent(new Event('input'));
        });
    });

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase();
        if (query.length < 1) {
            document.getElementById('search-results').innerHTML = '';
            return;
        }
        const results = performCategorizedSearch(query);
        renderSearchResults(results, query);
    });
}

function performCategorizedSearch(query) {
    const results = { scope: [], states: [], shocks: [], timing: [] };
    
    ['scope', 'states', 'shocks', 'timing'].forEach(key => {
        const content = modelData[`${key}_content`];
        if (!content) return;
        const lines = content.split('\n');
        
        lines.forEach((line, i) => {
            let match = false;
            
            if (currentSearchFilter === 'all') {
                match = line.toLowerCase().includes(query);
            } else if (currentSearchFilter === 'symbols') {
                const regex = new RegExp(`\\b${query}\\b`, 'i');
                match = regex.test(line);
            } else if (currentSearchFilter === 'equations') {
                match = line.toLowerCase().includes(query) && (line.includes('$') || line.includes('\\'));
            }

            if (match) {
                results[key].push({ line: i + 1, text: line.trim() });
            }
        });
    });

    const sym = allSymbols.find(s => s.name.toLowerCase() === query);
    if (sym) {
        results.symbol_info = sym;
    }

    return results;
}

function renderSearchResults(results, query) {
    const container = document.getElementById('search-results');
    let html = '';

    if (results.symbol_info) {
        html += `
            <div class="search-result-item" style="border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.05);" onclick="highlightSymbol('${results.symbol_info.name}')">
                <span class="search-result-doc">CORE SYMBOL : ${results.symbol_info.name}</span>
                <span class="search-result-text">Type: ${results.symbol_info.type}</span>
                <p style="font-size: 0.7rem; margin-top: 4px; opacity: 0.7;">${results.symbol_info.meaning || 'Active in model logic'}</p>
            </div>
        `;
    }

    Object.entries(results).forEach(([doc, matches]) => {
        if (doc === 'symbol_info' || matches.length === 0) return;
        
        html += `<div style="padding: 10px 10px 5px; font-weight: 700; font-size: 0.7rem; opacity: 0.5;">${doc.toUpperCase()} (${matches.length})</div>`;
        
        matches.slice(0, 3).forEach(m => {
            const highlightedText = m.text.replace(new RegExp(`(${query})`, 'gi'), '<span class="search-match-highlight">$1</span>');
            html += `
                <div class="search-result-item" onclick="jumpToTab('${doc}')">
                    <span class="search-result-doc">Line ${m.line}</span>
                    <span class="search-result-text">${highlightedText}</span>
                </div>
            `;
        });
    });

    container.innerHTML = html || '<div style="padding: 20px; text-align: center; opacity: 0.5;">No matches found</div>';
}

function renderConsistency() {
    const healthList = document.getElementById('health-checks');
    if (!healthList) return;

    // Calculate dynamic weighted score
    let totalScore = 0;
    const weights = { "Structural Integrity": 30, "Timing Coverage": 25, "Shock Logic": 20, "Naming Consistency": 15, "Closure Checks": 10 };
    
    healthList.innerHTML = consistencyChecks.map(c => {
        const w = weights[c.name] || 0;
        totalScore += (c.score * w) / 100;

        return `
            <div class="check-item ${c.status.toLowerCase()}" style="border-left: 4px solid ${c.status === 'PASS' ? '#4caf50' : (c.status === 'WARN' ? '#ff9800' : '#f44336')}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <strong>${c.name}</strong>
                        <p style="font-size: 0.85rem; opacity: 0.7; margin-top: 4px;">${c.msg}</p>
                    </div>
                    <i class="ph ${c.status === 'PASS' ? 'ph-check-circle' : (c.status === 'WARN' ? 'ph-warning-circle' : 'ph-x-circle')}"></i>
                </div>
            </div>
        `;
    }).join('');

    const scoreDisplay = document.getElementById('consistency-score');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${Math.round(totalScore)}%`;
        scoreDisplay.style.color = totalScore > 90 ? '#4caf50' : (totalScore > 70 ? '#ff9800' : '#f44336');
    }

    const mapBody = document.getElementById('naming-map-body');
    if (mapBody) {
        // Sort registry by timing/category as requested
        const orderMap = { 'household_state': 1, 'aggregate_state': 2, 'jump': 3, 'shock': 4, 'process': 5, 'derived': 6 };
        const sorted = Object.values(variableRegistry).sort((a, b) => (orderMap[a.category] || 9) - (orderMap[b.category] || 9));

        mapBody.innerHTML = sorted.map(s => `
            <tr onclick="highlightSymbol('${s.symbol}')" style="cursor: pointer;">
                <td><code class="state-symbol">${s.symbol}</code></td>
                <td><small style="opacity: 0.6;">${s.defined_in.join(', ')}</small></td>
                <td><span class="badge" style="font-size: 0.6rem;">${s.category.replace('_', ' ')}</span></td>
                <td>${s.timing}</td>
                <td style="font-size: 0.75rem; opacity: 0.8;">${s.used_in.length > 0 ? (Array.isArray(s.used_in) ? s.used_in.join(', ') : s.used_in) : 'GE System'}</td>
            </tr>
        `).join('');
    }

    renderPipelineVisual();
}

// Pipeline Visual State
let pipelineZoom = 1;
let pipelinePanX = 0;
let pipelinePanY = 0;
let isPipelineDragging = false;
let pipelineLastMouseX = 0;
let pipelineLastMouseY = 0;

function adjustPipelineZoom(delta) {
    pipelineZoom = Math.max(0.1, Math.min(5, pipelineZoom + delta));
    updatePipelineTransform();
}

function resetPipelineView() {
    pipelineZoom = 1;
    pipelinePanX = 0;
    pipelinePanY = 0;
    updatePipelineTransform();
}

function updatePipelineTransform() {
    const container = document.getElementById('pipeline-visual-container');
    if (container) {
        container.style.transform = `translate(${pipelinePanX}px, ${pipelinePanY}px) scale(${pipelineZoom})`;
    }
}

function setupPipelineInteractions() {
    const wrapper = document.getElementById('pipeline-visual-wrapper');
    const container = document.getElementById('pipeline-visual-container');
    
    if (!wrapper || !container) return;

    wrapper.addEventListener('mousedown', (e) => {
        isPipelineDragging = true;
        pipelineLastMouseX = e.clientX;
        pipelineLastMouseY = e.clientY;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
        isPipelineDragging = false;
        container.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isPipelineDragging) return;
        const dx = e.clientX - pipelineLastMouseX;
        const dy = e.clientY - pipelineLastMouseY;
        pipelinePanX += dx;
        pipelinePanY += dy;
        pipelineLastMouseX = e.clientX;
        pipelineLastMouseY = e.clientY;
        updatePipelineTransform();
    });
    
    // Wheel zoom
    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        adjustPipelineZoom(delta);
    });
}

function renderPipelineVisual() {
    const container = document.getElementById('pipeline-visual-container'); 
    if (!container) return;
    
    // Ensure interactions are set up (idempotent check or just call it)
    setupPipelineInteractions();

    try {
        const allSyms = Object.values(variableRegistry);
        if (allSyms.length === 0) {
            container.innerHTML = '<div style="color: #666; text-align: center;">Registry is empty. Please check backend.</div>';
            return;
        }

        // --- 1. Data Bucketing (Refined) ---

        // Stage 1: Exogenous Processes
        // Strict: e_A, e_i, P_z, sD, P_pD
        // Exclude redundant A_exo, monetary_shock (already handled in backend), but double check
        let stage1 = allSyms.filter(s => 
            (s.category.toLowerCase() === 'process' || s.category.toLowerCase() === 'shock') && 
            !['a_exo', 'monetary_shock'].includes(s.symbol.toLowerCase()) &&
            !s.symbol.startsWith('damage_')
        ).sort((a,b) => a.symbol.localeCompare(b.symbol));

        // Stage 2: Predetermined States (Specific Order)
        // User Order: a, b, z, A, K, N, i_lag, pD
        const stateOrder = ['a', 'b', 'z', 'A', 'K', 'N', 'i_lag', 'pD'];
        let stage2 = allSyms.filter(s => 
            ((s.category.includes('state') || s.symbol === 'pD') && 
            s.timing.toLowerCase().includes('predetermined'))
        ).sort((a,b) => {
            const idxA = stateOrder.indexOf(a.symbol);
            const idxB = stateOrder.indexOf(b.symbol);
            // If both defined in specific order, use that
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            // If one is defined, it comes first
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            // Fallback alphabet
            return a.symbol.localeCompare(b.symbol);
        });

        // Stage 3: Model Blocks (Parallel Construction)
        const stage3 = [
            { id: 'BLK_HH', label: 'Households' },
            { id: 'BLK_FIRM', label: 'Firms & Capital' },
            { id: 'BLK_BANK', label: 'Intermediaries' },
            { id: 'BLK_POL', label: 'Monetary Policy' },
            { id: 'BLK_NKPC', label: 'Pricing (NKPC)' }
        ];

        // Stage 4: Jump Variables
        let stage4 = allSyms.filter(s => 
            s.category === 'jump' || 
            (s.timing.toLowerCase().includes('determined') && !s.category.includes('state'))
        ).sort((a,b) => a.symbol.localeCompare(b.symbol));
        
        // Ensure 'I' (Investment) is present if in registry, or explicitly add if derived
        const inv = allSyms.find(s => s.symbol === 'I');
        if (inv && !stage4.find(s => s.symbol === 'I')) {
             stage4.push(inv);
             stage4.sort((a,b) => a.symbol.localeCompare(b.symbol));
        }

        // Stage 5: Transitions
        // Logic: Predetermined states in t become states in t+1
        let stage5 = stage2.map(s => {
            // Tooltip logic
            let title = `${s.symbol}_{t+1} definition`;
            if (s.symbol === 'K') title = "K_{t+1} = (1-delta)K_t + I_t - damage_K";
            if (s.symbol === 'N') title = "Evolution of Net Worth";
            if (s.symbol === 'i_lag') title = "i_{lag, t+1} = i_t";

            return {
                symbol: `${s.symbol}_{t+1}`,
                label: `${s.symbol}_{t+1}`,
                category: 'transition',
                baseSymbol: s.symbol,
                title: title
            };
        });
        // Add damage_K wedge
        const damageK = allSyms.find(s => s.symbol === 'damage_K');
        if (damageK) {
            stage5.push({ symbol: 'damage_K', label: 'damage_K', category: 'wedge', isWedge: true });
        }


        // --- 2. Layout & Rendering ---
        const width = 1100;
        const height = 500;
        const colX = [120, 320, 550, 780, 980];
        // Colors: Purple, Blue, White, Orange, Pink
        const colColors = ["#8b5cf6", "#4a9eff", "#ffffff", "#f59e0b", "#ec4899"]; 
        const headers = ["Exogenous Processes", "Predetermined States (t)", "Model Blocks", "Jump Variables (t)", "State Transitions (t\u2192t+1)"];

        let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="pipeline-svg">
            <defs>
                <marker id="arrow-pipeline" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6" fill="rgba(255,255,255,0.3)" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>`;

        // Draw Headers
        colX.forEach((x, i) => {
            svg += `<text x="${x}" y="30" text-anchor="middle" fill="${colColors[i]}" font-weight="700" font-size="12" style="text-transform: uppercase; letter-spacing: 0.5px;">${headers[i]}</text>`;
            svg += `<line x1="${x}" y1="40" x2="${x}" y2="${height-20}" stroke="${colColors[i]}" stroke-width="1" stroke-dasharray="4" opacity="0.15"/>`;
        });

        const nodeCoords = {};

        const renderColumn = (items, stageIdx, idPrefix) => {
            const x = colX[stageIdx];
            // Center vertically
            const gap = 45;
            const startY = 80 + Math.max(0, (height - 80 - (items.length * gap)) / 2);

            items.forEach((item, idx) => {
                const y = startY + idx * gap;
                const lookupKey = item.symbol || item.id;
                nodeCoords[lookupKey] = { x, y };

                let label = item.label || item.symbol;
                label = label.replace('_{t+1}', '').replace('{t+1}', ''); // Simplification

                // Styling logic based on Stage
                // Stage 0: Purple
                // Stage 1: Blue
                // Stage 2: White (Blocks)
                // Stage 3: Orange
                // Stage 4: Pink
                let stroke = colColors[stageIdx];
                let bgFill = "#1E1E1E"; // Slightly lighter than black
                let textFill = stroke;
                let strokeWidth = 1;

                if (stageIdx === 2) { // Blocks
                    stroke = "#ffffff";
                    textFill = "#ffffff";
                    strokeWidth = 2;
                }

                // Special overrides
                if (item.symbol === 'sD') {
                    // sD Visual Polish
                    // label += " (Realized)"; // Too long?
                    stroke = "#ef4444"; // Red for disaster
                }

                svg += `
                    <g class="pipeline-node" onclick="highlightSymbol('${item.symbol || ''}')" style="cursor: pointer">
                        <title>${item.title || item.meaning || label}</title>
                        <rect x="${x - 50}" y="${y - 15}" width="100" height="30" rx="15" fill="${bgFill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
                        <text x="${x}" y="${y + 5}" text-anchor="middle" fill="${textFill}" font-size="11" font-weight="500" font-family="monospace">${label}</text>
                        ${item.symbol === 'sD' ? `<text x="${x}" y="${y+25}" text-anchor="middle" fill="#ef4444" font-size="8">Realized in t</text>` : ''}
                    </g>
                `;
            });
        };

        renderColumn(stage1, 0, 'S1');
        renderColumn(stage2, 1, 'S2');
        renderColumn(stage3, 2, 'S3'); // Blocks
        renderColumn(stage4, 3, 'S4');
        renderColumn(stage5, 4, 'S5');

        // --- 3. Wiring (Arrows) ---
        const drawLink = (k1, k2, color="rgba(255,255,255,0.15)", dashed=false) => {
            const n1 = nodeCoords[k1];
            const n2 = nodeCoords[k2];
            if (n1 && n2) {
                const dash = dashed ? 'stroke-dasharray="4,4"' : '';
                svg += `<line x1="${n1.x + 50}" y1="${n1.y}" x2="${n2.x - 50}" y2="${n2.y}" stroke="${color}" stroke-width="1.5" marker-end="url(#arrow-pipeline)" ${dash} />`;
            }
        };

        // 1. Exo -> States (e.g. e_A -> A is implicit, but usually Exo feeds Blocks/Jumps in realization)
        // User rule: "e_A -> A (implicit law of motion)". 
        // We can draw e_A (S1) -> A (S2)
        if (nodeCoords['e_A'] && nodeCoords['A']) drawLink('e_A', 'A');
        
        // 2. States -> Blocks
        stage2.forEach(s => {
            if (['b','a','z'].includes(s.symbol)) drawLink(s.symbol, 'BLK_HH');
            if (['K', 'N', 'A', 'pD'].includes(s.symbol)) drawLink(s.symbol, 'BLK_FIRM'); 
            if (['N'].includes(s.symbol)) drawLink(s.symbol, 'BLK_BANK');
            if (['i_lag'].includes(s.symbol)) drawLink(s.symbol, 'BLK_POL');
        });

        // 3. Blocks -> Jumps (Parallel outputs)
        drawLink('BLK_POL', 'i');
        drawLink('BLK_NKPC', 'pi'); // Parallel block
        drawLink('BLK_FIRM', 'q');
        drawLink('BLK_FIRM', 'I'); // Firms decide I
        drawLink('BLK_BANK', 'spread');

        // 4. Jumps -> Transitions
        // Key fix: I -> K_{t+1}
        const kNext = stage5.find(s => s.baseSymbol === 'K');
        if (kNext) {
            drawLink('I', kNext.symbol, "#4a9eff"); // Highlight this connection
            drawLink('q', kNext.symbol); // q affects investment
        }
        
        const iLagNext = stage5.find(s => s.baseSymbol === 'i_lag');
        if (iLagNext) drawLink('i', iLagNext.symbol);

        // 5. Disaster Logic (sD)
        if (nodeCoords['sD']) {
            // sD -> A (within period damage)
            if (nodeCoords['A']) drawLink('sD', 'A', "#ef4444", true);
            
            // sD -> damage_K (Transition wedge)
            const dk = stage5.find(s => s.symbol === 'damage_K');
            if (dk && nodeCoords[dk.symbol]) {
                const n1 = nodeCoords['sD'];
                const n2 = nodeCoords[dk.symbol];
                // Curved red arrow for teleport
                svg += `<path d="M${n1.x+50},${n1.y} C${n1.x+150},${n1.y} ${n2.x-150},${n2.y} ${n2.x-50},${n2.y}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow-pipeline)" />`;
            }
        }

        svg += `</svg>`;
        container.innerHTML = svg;

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div style="color: #f44336; padding: 20px;">Error rendering pipeline: ${e.message}</div>`;
    }
}


function renderDetailedMap(branch) {
    const container = document.getElementById('detailed-map-container');
    let svg = '';

    if (branch === 'general') {
        svg = `
            <svg width="800" height="700" viewBox="0 0 800 700">
                <!-- 1. EXOGENOUS PROCESSES -->
                <g class="map-node" onclick="jumpToTab('shocks')">
                    <rect x="250" y="20" width="300" height="100" rx="10" class="map-box process-box" fill="#1a1a1a" stroke="#8b5cf6" stroke-width="2"/>
                    <text x="400" y="45" text-anchor="middle" fill="#8b5cf6" font-weight="700" font-size="12">EXOGENOUS PROCESSES</text>
                    
                    <foreignObject x="260" y="55" width="280" height="50">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; text-align:center;">
                            <span class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('e_i')">$\\varepsilon^i_t$</span>, 
                            <span class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('e_A')">$\\varepsilon^A_t$</span>, 
                            <span class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('pD')">$pD_t$</span> $\\rightarrow$ 
                            <span class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('sD')">$sD_t$</span>
                        </div>
                    </foreignObject>
                    
                    <text x="400" y="95" fill="#a78bfa" font-size="9" text-anchor="middle">(hazard realization)</text>
                </g>

                <path d="M400 120 L400 150" stroke="#8b5cf6" stroke-width="2" fill="none" marker-end="url(#arrow-shock)"/>

                <!-- 2. PREDETERMINED STATES -->
                <g class="map-node" onclick="jumpToTab('states')">
                    <rect x="200" y="150" width="400" height="80" rx="10" class="map-box state-box" fill="#1a1a1a" stroke="#4a9eff" stroke-width="2"/>
                    <text x="400" y="175" text-anchor="middle" fill="#4a9eff" font-weight="700" font-size="12">PREDETERMINED STATES (t)</text>
                    <foreignObject x="205" y="185" width="390" height="45">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:14px; text-align:center; font-family:'Fira Code', monospace; padding-top: 8px;">
                            \\( b_t, a_t, z_t \\) | \\( A_t, K_t, N_t, i_{lag,t}, pD_t \\)
                        </div>
                    </foreignObject>
                </g>

                <!-- Arrows to blocks -->
                <path d="M400 230 L400 250" stroke="#4a9eff" stroke-width="1.5" fill="none" opacity="0.4"/>
                <path d="M250 230 L100 280" stroke="#4a9eff" stroke-width="1.5" fill="none" opacity="0.4"/>
                <path d="M350 230 L300 280" stroke="#4a9eff" stroke-width="1.5" fill="none" opacity="0.4"/>
                <path d="M450 230 L500 280" stroke="#4a9eff" stroke-width="1.5" fill="none" opacity="0.4"/>
                <path d="M550 230 L700 280" stroke="#4a9eff" stroke-width="1.5" fill="none" opacity="0.4"/>

                <!-- 3. MODEL BLOCKS -->
                <!-- HH -->
                <g class="map-node" onclick="jumpToScopeSection('households')">
                    <rect x="30" y="280" width="160" height="100" rx="8" class="map-box block-hh" fill="#1a1a1a" stroke="#4a9eff" stroke-width="1" stroke-dasharray="4"/>
                    <text x="110" y="300" text-anchor="middle" fill="#4a9eff" font-weight="700" font-size="11">Households</text>
                    <text x="45" y="325" fill="#fff" font-size="10">\u2022 Choose: c, b', a'</text>
                    <text x="45" y="340" fill="#fff" font-size="10">\u2022 Budget constraint</text>
                    <text x="45" y="355" fill="#fff" font-size="10">\u2022 Given: prices, r</text>
                </g>

                <!-- Firms -->
                <g class="map-node" onclick="jumpToScopeSection('firms')">
                    <rect x="220" y="280" width="160" height="100" rx="8" class="map-box block-firm" fill="#1a1a1a" stroke="#10b981" stroke-width="1" stroke-dasharray="4"/>
                    <text x="300" y="300" text-anchor="middle" fill="#10b981" font-weight="700" font-size="11">Firms & Capital</text>
                    <text x="235" y="325" fill="#fff" font-size="10">\u2022 Production y(A,K)</text>
                    <text x="235" y="340" fill="#fff" font-size="10">\u2022 Investment via q</text>
                    <text x="235" y="355" fill="#fff" font-size="10">\u2022 Accumulation K'</text>
                </g>

                <!-- Intermediary -->
                <g class="map-node" onclick="jumpToScopeSection('intermediaries')">
                    <rect x="420" y="280" width="160" height="100" rx="8" class="map-box block-finance" fill="#1a1a1a" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4"/>
                    <text x="500" y="300" text-anchor="middle" fill="#f59e0b" font-weight="700" font-size="11">Intermediaries</text>
                    <text x="435" y="325" fill="#fff" font-size="10">\u2022 Net worth N</text>
                    <text x="435" y="340" fill="#fff" font-size="10">\u2022 Credit spread</text>
                    <text x="435" y="355" fill="#fff" font-size="10">\u2022 Asset pricing</text>
                </g>

                <!-- Policy -->
                <g class="map-node" onclick="jumpToScopeSection('policy')">
                    <rect x="610" y="280" width="160" height="100" rx="8" class="map-box block-policy" fill="#1a1a1a" stroke="#f44336" stroke-width="1" stroke-dasharray="4"/>
                    <text x="690" y="300" text-anchor="middle" fill="#f44336" font-weight="700" font-size="11">Monetary + Pricing</text>
                    <text x="625" y="325" fill="#fff" font-size="10">\u2022 NKPC \u2192 \u03c0</text>
                    <text x="625" y="340" fill="#fff" font-size="10">\u2022 Taylor rule \u2192 i</text>
                </g>

                <!-- Arrow to Equil -->
                <path d="M400 380 L400 410" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.2" marker-end="url(#arrow-white)"/>

                <!-- 4. EQUILIBRIUM PRICES -->
                <g class="map-node" onclick="jumpToTab('timing')">
                    <rect x="200" y="410" width="400" height="80" rx="10" class="map-box equil-box" fill="#1a1a1a" stroke="#f59e0b" stroke-width="2"/>
                    <text x="400" y="435" text-anchor="middle" fill="#f59e0b" font-weight="700" font-size="12">EQUILIBRIUM PRICES & RETURNS</text>
                    <text x="400" y="465" text-anchor="middle" fill="#fff" font-size="13" font-family="'Fira Code', monospace">
                        <tspan class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('pi')">\u03c0</tspan>, 
                        <tspan class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('i')">i</tspan>, 
                        <tspan class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('q')">q</tspan>, 
                        <tspan class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('spread')">spread</tspan>, 
                        <tspan class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('r_b')">r_b</tspan>, 
                        <tspan class="map-symbol-link" onclick="event.stopPropagation(); highlightSymbol('r_a')">r_a</tspan>
                    </text>
                </g>

                <!-- Arrow to Transition -->
                <path d="M400 490 L400 520" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.2" marker-end="url(#arrow-white)"/>

                <!-- 5. STATE TRANSITIONS -->
                <g class="map-node" onclick="jumpToTab('timing')">
                    <rect x="120" y="520" width="560" height="170" rx="12" class="map-box transition-box" fill="#1a1a1a" stroke="#10b981" stroke-width="2"/>
                    <text x="400" y="545" text-anchor="middle" fill="#10b981" font-weight="700" font-size="13">STATE TRANSITIONS \\( (t \\rightarrow t+1) \\)</text>
                    <foreignObject x="130" y="565" width="540" height="120">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; line-height:1.8;">
                            <div style="display: flex; justify-content: space-between; padding: 0 20px;">
                                <div style="flex: 1;">
                                    <div>• \\( b', a' \\) (Policy choices)</div>
                                    <div>• \\( K' = (1-\\delta)K + I \\)</div>
                                    <div>• \\( N' \\) (Intermediary equity)</div>
                                </div>
                                <div style="flex: 1; padding-left: 20px; border-left: 1px solid #333;">
                                    <div>• \\( i_{lag}' = i \\)</div>
                                    <div>• \\( pD' \\sim P_{pD} \\)</div>
                                    <div style="color:#10b981; font-style:italic; margin-top: 5px;">\\( A_t \\leftarrow A_{exo,t} (1 - \\xi_A sD) \\)</div>
                                </div>
                            </div>
                        </div>
                    </foreignObject>
                </g>
            </svg>
        `;
    } else if (branch === 'disaster') {
        svg = `
            <svg width="800" height="400" viewBox="0 0 800 400">
                <!-- pD -->
                <g class="map-node" onclick="highlightSymbol('pD')">
                    <circle cx="100" cy="150" r="45" fill="#1a1a1a" stroke="#f44336" stroke-width="3"/>
                    <foreignObject x="70" y="132" width="60" height="40">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:18px;">\\( pD_t \\)</div>
                    </foreignObject>
                    <text x="100" y="215" text-anchor="middle" fill="#f44336" font-size="11" font-weight="700">RISK REGIME</text>
                </g>

                <path d="M145 150 L240 150" stroke="#f44336" stroke-width="2" fill="none" marker-end="url(#arrow-red)"/>

                <!-- sD -->
                <g class="map-node" onclick="highlightSymbol('sD')">
                    <rect x="250" y="115" width="120" height="70" rx="8" fill="#1a1a1a" stroke="#f44336" stroke-width="2" stroke-dasharray="5"/>
                    <foreignObject x="260" y="132" width="100" height="40">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:18px;">\\( sD_t \\)</div>
                    </foreignObject>
                    <text x="310" y="205" text-anchor="middle" fill="#f44336" font-size="11">STRIKE (0 / 1)</text>
                </g>

                <!-- Arrows to damage wedges -->
                <path d="M370 150 L450 100" stroke="#f44336" stroke-width="2" fill="none" marker-end="url(#arrow-red)"/>
                <path d="M370 150 L450 200" stroke="#f44336" stroke-width="2" fill="none" marker-end="url(#arrow-red)"/>

                <!-- Damage Wedges to Destinations -->
                <!-- damage_A -> A_t -->
                <g class="map-node" onclick="highlightSymbol('damage_A')">
                    <rect x="460" y="65" width="220" height="60" rx="8" fill="#1a1a1a" stroke="#ff5252" stroke-width="1.5"/>
                    <foreignObject x="465" y="75" width="210" height="40">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:12px; text-align:center; padding-top: 8px;">TFP LOSS: \\( damage_{A,t} \\)</div>
                    </foreignObject>
                </g>
                <path d="M680 95 L705 95" stroke="#ff5252" stroke-width="1.5" fill="none" marker-end="url(#arrow-red)"/>
                <g class="map-symbol-link" onclick="highlightSymbol('A')">
                    <circle cx="740" cy="95" r="28" fill="#1a1a1a" stroke="#4a9eff" stroke-width="2"/>
                    <foreignObject x="720" y="80" width="40" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; text-align:center; padding-top: 6px;">\\( A_t \\)</div>
                    </foreignObject>
                </g>

                <!-- damage_K -> K_{t+1} -->
                <g class="map-node" onclick="highlightSymbol('damage_K')">
                    <rect x="460" y="165" width="220" height="60" rx="8" fill="#1a1a1a" stroke="#ff5252" stroke-width="1.5"/>
                    <foreignObject x="465" y="175" width="210" height="40">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:12px; text-align:center; padding-top: 8px;">CAPITAL DESTR: \\( damage_{K,t} \\)</div>
                    </foreignObject>
                </g>
                <path d="M680 195 L705 195" stroke="#ff5252" stroke-width="1.5" fill="none" marker-end="url(#arrow-red)"/>
                <g class="map-symbol-link" onclick="highlightSymbol('K')">
                    <circle cx="740" cy="195" r="28" fill="#1a1a1a" stroke="#4a9eff" stroke-width="2"/>
                    <foreignObject x="720" y="180" width="40" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; text-align:center; padding-top: 6px;">\\( K_{t+1} \\)</div>
                    </foreignObject>
                </g>
            </svg>
        `;
    } else if (branch === 'monetary') {
        svg = `
            <svg width="800" height="400" viewBox="0 0 800 400">
                <!-- Inputs -->
                <g class="map-node" onclick="highlightSymbol('e_i')">
                    <rect x="50" y="150" width="120" height="60" rx="10" fill="#1a1a1a" stroke="#8b5cf6" stroke-width="2"/>
                    <foreignObject x="60" y="160" width="100" height="40">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:18px;">\\( \\varepsilon^i_t \\)</div>
                    </foreignObject>
                    <text x="110" y="230" text-anchor="middle" fill="#8b5cf6" font-size="9">Monetary Shock</text>
                </g>

                <path d="M170 180 L240 180" stroke="#8b5cf6" stroke-width="2" fill="none" marker-end="url(#arrow-purple)"/>

                <!-- Taylor Rule -->
                <g class="map-node" onclick="jumpToScopeSection('policy')">
                    <rect x="250" y="130" width="180" height="100" rx="10" fill="#1a1a1a" stroke="#8b5cf6" stroke-width="2"/>
                    <text x="340" y="155" text-anchor="middle" fill="#8b5cf6" font-weight="700">Taylor Rule</text>
                    <foreignObject x="260" y="170" width="160" height="50">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; text-align:center;">Generates \\( i_t \\)</div>
                    </foreignObject>
                </g>

                <path d="M430 180 L500 180" stroke="#8b5cf6" stroke-width="2" fill="none" marker-end="url(#arrow-purple)"/>

                <!-- Nominal Equilibrium Box -->
                <g class="map-node" onclick="jumpToTab('timing')">
                    <rect x="420" y="70" width="360" height="250" rx="15" fill="#1a1a1a" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="5"/>
                    <text x="600" y="95" text-anchor="middle" fill="#8b5cf6" font-weight="700" font-size="14">NOMINAL EQUILIBRIUM</text>
                    
                    <foreignObject x="435" y="115" width="330" height="190">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; line-height:2.4; padding: 5px;">
                            <div style="margin-bottom: 8px;">• Euler equation (HH)</div>
                            <div style="margin-bottom: 8px;">• NK Phillips Curve (Firms)</div>
                            <div style="margin-bottom: 8px;">• Fisher relation</div>
                            <div style="font-weight:700; margin-top:20px; border-top:1px solid #444; padding-top:12px; color:#8b5cf6;">
                                \\( \\rightarrow \\) Determines \\( \\pi_t, r_t \\)
                            </div>
                        </div>
                    </foreignObject>
                </g>
                
                <text x="630" y="280" text-anchor="middle" fill="#8b5cf6" font-size="9" font-style="italic">Solved simultaneously with real blocks</text>

                <!-- Tooltip shim -->
                <title>Jointly determine \u03c0_t, r_t, and intertemporal trade-offs given i_t</title>
            </svg>
        `;
    } else if (branch === 'real') {
        svg = `
            <svg width="800" height="500" viewBox="0 0 800 500">
                <!-- Inputs -->
                <g class="map-node" onclick="highlightSymbol('A')">
                    <circle cx="100" cy="100" r="35" fill="#1a1a1a" stroke="#4a9eff" stroke-width="2"/>
                    <foreignObject x="75" y="85" width="50" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:14px;">\\( A_t \\)</div>
                    </foreignObject>
                    <text x="100" y="150" text-anchor="middle" fill="#4a9eff" font-size="10">Technology</text>
                </g>
                <g class="map-node" onclick="highlightSymbol('K')">
                    <circle cx="100" cy="220" r="35" fill="#1a1a1a" stroke="#4a9eff" stroke-width="2"/>
                    <foreignObject x="75" y="205" width="50" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:14px;">\\( K_t \\)</div>
                    </foreignObject>
                    <text x="100" y="270" text-anchor="middle" fill="#4a9eff" font-size="10">Capital Stock</text>
                </g>

                <path d="M135 100 L240 160" stroke="#4a9eff" stroke-width="1.5" fill="none" marker-end="url(#arrow-state)"/>
                <path d="M135 220 L240 160" stroke="#4a9eff" stroke-width="1.5" fill="none" marker-end="url(#arrow-state)"/>

                <!-- Core block -->
                <g class="map-node" onclick="jumpToScopeSection('firms')">
                    <rect x="230" y="90" width="260" height="200" rx="12" class="map-box block-firm" fill="#1a1a1a" stroke="#10b981" stroke-width="2"/>
                    <text x="360" y="115" text-anchor="middle" fill="#10b981" font-weight="700">PRODUCTION & FIRMS</text>
                    <foreignObject x="240" y="135" width="240" height="150">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; line-height:2.6; padding: 10px;">
                            <div style="margin-bottom: 10px;">• \\( y_t = f(A_t, K_t, h_t) \\)</div>
                            <div style="margin-bottom: 10px;">• Determines \\( w_t, MPK_{t,i} \\)</div>
                            <div>• Asset pricing \\( q_t \\)</div>
                        </div>
                    </foreignObject>
                </g>

                <!-- Outputs -->
                <path d="M470 165 L520 110" stroke="#10b981" stroke-width="1.5" fill="none" marker-end="url(#arrow-white)"/>
                <path d="M470 165 L520 220" stroke="#10b981" stroke-width="1.5" fill="none" marker-end="url(#arrow-white)"/>

                <g class="map-node" onclick="highlightSymbol('y')">
                    <foreignObject x="530" y="85" width="240" height="50">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:14px; font-weight:500; padding: 5px;">Output&nbsp;\\( y_{t} \\), Wages&nbsp;\\( w_{t} \\)</div>
                    </foreignObject>
                </g>
                <g class="map-node" onclick="highlightSymbol('I')">
                    <rect x="530" y="195" width="210" height="65" rx="8" fill="#1a1a1a" stroke="#10b981" stroke-width="1.5"/>
                    <foreignObject x="540" y="205" width="190" height="45">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; text-align:center; padding-top: 8px;">Invest&nbsp;\\( I_{t} \\)&nbsp;(via&nbsp;\\( q_{t} \\))</div>
                    </foreignObject>
                </g>

                <!-- Transition -->
                <path d="M690 220 L730 220" stroke="#10b981" stroke-width="1.5" fill="none" marker-end="url(#arrow-white)"/>
                <g class="map-node" onclick="highlightSymbol('K')">
                    <circle cx="770" cy="220" r="35" fill="#1a1a1a" stroke="#4a9eff" stroke-width="2"/>
                    <foreignObject x="745" y="205" width="50" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:13px;">\\( K_{t+1} \\)</div>
                    </foreignObject>
                    <text x="770" y="270" text-anchor="middle" fill="#10b981" font-size="9">Accumulation</text>
                </g>

                <!-- Disasters Integration -->
                <g class="map-node" onclick="switchMapBranch('disaster')">
                    <rect x="250" y="310" width="220" height="60" rx="8" fill="#1a1a1a" stroke="#f44336" stroke-width="1" stroke-dasharray="3"/>
                    <foreignObject x="260" y="325" width="200" height="40">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:#f44336; font-size:11px; text-align:center;">Disaster Wedges (\\( A_t, K_t \\))</div>
                    </foreignObject>
                </g>
                <path d="M360 310 L360 230" stroke="#f44336" stroke-width="1.5" fill="none" marker-end="url(#arrow-red)" opacity="0.4"/>
            </svg>
        `;
    } else if (branch === 'finance') {
        svg = `
            <svg width="800" height="500" viewBox="0 0 800 500">
                <!-- Inputs -->
                <g class="map-node" onclick="highlightSymbol('N')">
                    <rect x="50" y="100" width="130" height="70" rx="10" fill="#1a1a1a" stroke="#4a9eff" stroke-width="2"/>
                    <foreignObject x="60" y="115" width="110" height="40">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:18px;">\\( N_t \\)</div>
                    </foreignObject>
                    <text x="115" y="195" text-anchor="middle" fill="#4a9eff" font-size="10">Intermediary Net Worth</text>
                </g>
                <g class="map-node" onclick="highlightSymbol('q')">
                    <circle cx="115" cy="300" r="35" fill="#1a1a1a" stroke="#f59e0b" stroke-width="2"/>
                    <foreignObject x="90" y="285" width="50" height="30">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:18px;">\\( q_t \\)</div>
                    </foreignObject>
                    <text x="115" y="355" text-anchor="middle" fill="#f59e0b" font-size="10">Asset Price</text>
                </g>

                <path d="M180 135 L260 180" stroke="#4a9eff" stroke-width="1.5" fill="none" marker-end="url(#arrow-state)"/>
                <path d="M145 300 L260 220" stroke="#f59e0b" stroke-width="1.5" fill="none" marker-end="url(#arrow-orange)"/>

                <!-- Core Block -->
                <g class="map-node" onclick="jumpToScopeSection('intermediaries')">
                    <rect x="260" y="100" width="300" height="220" rx="14" class="map-box block-finance" fill="#1a1a1a" stroke="#f59e0b" stroke-width="3"/>
                    <text x="410" y="125" text-anchor="middle" fill="#f59e0b" font-weight="700">BALANCE SHEET / FRICTION</text>
                    <foreignObject x="270" y="150" width="280" height="160">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; line-height:2.8; padding: 15px;">
                            <div style="margin-bottom: 12px;">• Leverage constraint</div>
                            <div style="margin-bottom: 12px;">• Determined: \\( spread_{t} \\)</div>
                            <div>• \\( r_{a,t} = r_{f,t} + spread_{t} \\)</div>
                        </div>
                    </foreignObject>
                </g>

                <!-- Outputs -->
                <path d="M510 205 L580 205" stroke="#f59e0b" stroke-width="1.5" fill="none" marker-end="url(#arrow-white)"/>
                <g class="map-node" onclick="highlightSymbol('spread')">
                    <rect x="590" y="180" width="180" height="50" rx="5" fill="#1a1a1a" stroke="#f59e0b" stroke-width="1"/>
                    <foreignObject x="600" y="195" width="160" height="25">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-size:13px; text-align:center;">\\( spread_t \\) / \\( r_{b,t} \\)</div>
                    </foreignObject>
                </g>

                <!-- Feedback & Transition -->
                <path d="M680 230 L680 440 L115 440 L115 335" stroke="#f59e0b" stroke-width="1.5" fill="none" stroke-dasharray="4" marker-end="url(#arrow-orange)"/>
                <text x="390" y="430" text-anchor="middle" fill="#f59e0b" font-size="10" font-style="italic">Valuation Feedback Loop (\\( q_t \\) affects asset returns)</text>
                
                <path d="M405 310 L405 340" stroke="#f59e0b" stroke-width="1.5" fill="none" marker-end="url(#arrow-white)"/>
                <g class="map-node" onclick="highlightSymbol('N')">
                    <rect x="330" y="340" width="120" height="65" rx="10" fill="#1a1a1a" stroke="#4a9eff" stroke-width="2"/>
                    <foreignObject x="340" y="355" width="100" height="40">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="color:white; font-weight:700; text-align:center; font-size:18px;">\\( N_{t+1} \\)</div>
                    </foreignObject>
                    <text x="390" y="420" text-anchor="middle" fill="#4a9eff" font-size="9">Dynamic Equity</text>
                </g>
            </svg>
        `;
    }

    container.innerHTML = `
        <svg width="0" height="0" style="position: absolute;">
            <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#4a9eff" />
                </marker>
                <marker id="arrow-shock" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#8b5cf6" />
                </marker>
                <marker id="arrow-state" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#4a9eff" />
                </marker>
                <marker id="arrow-white" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#fff" />
                </marker>
                <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#f44336" />
                </marker>
                <marker id="arrow-purple" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#8b5cf6" />
                </marker>
                <marker id="arrow-orange" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
                </marker>
            </defs>
        </svg>
        ${svg}
    `;
}
function switchMapBranch(branch) {
    // 1. Update UI buttons
    document.querySelectorAll('.btn-toggle-map').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick')?.includes(`'${branch}'`)) {
            btn.classList.add('active');
        }
    });

    // 2. Render SVG
    renderDetailedMap(branch);

    // 3. Load math formulas with delay and force reflow
    const container = document.getElementById('detailed-map-container');
    if (container) {
        container.offsetHeight; // Force reflow
        setTimeout(() => {
            setupMath(container);
        }, 150);
    }
}

function setupMath(element = document.body) {
    if (window.renderMathInElement) {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError : false
        });

        element.querySelectorAll('.katex-html').forEach(mathEl => {
            const wrapper = document.createElement('span');
            wrapper.className = 'math-wrapper';
            if (mathEl.parentNode) {
                mathEl.parentNode.insertBefore(wrapper, mathEl);
                wrapper.appendChild(mathEl);
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'math-copy-btn';
                copyBtn.innerHTML = '<i class="ph ph-copy"></i> LaTeX';
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    const tex = mathEl.closest('.katex').nextElementSibling?.textContent || 'LaTeX source';
                    navigator.clipboard.writeText(tex);
                    copyBtn.innerHTML = '<i class="ph ph-check"></i> Copied';
                    setTimeout(() => copyBtn.innerHTML = '<i class="ph ph-copy"></i> LaTeX', 2000);
                };
                wrapper.appendChild(copyBtn);
            }
        });
    }
}

function renderJSONTree(data, container) {
    if (!container) return;
    container.innerHTML = '';
    const root = createTreeNode('root', data, true);
    container.appendChild(root);
}

function createTreeNode(key, value, isRoot = false) {
    if (isRoot) {
        const rootContainer = document.createElement('div');
        Object.entries(value).forEach(([k, v]) => {
            rootContainer.appendChild(createTreeNode(k, v));
        });
        return rootContainer;
    }
    const node = document.createElement('div');
    if (typeof value === 'object' && value !== null) {
        node.className = 'tree-node';
        let iconHtml = '<i class="ph ph-folder"></i>';
        const k = key.toLowerCase();
        if (k.includes('household')) iconHtml = '<i class="ph ph-users"></i>';
        else if (k.includes('aggregate')) iconHtml = '<i class="ph ph-buildings"></i>';
        else if (k.includes('jump')) iconHtml = '<i class="ph ph-fast-forward"></i>';
        else if (k.includes('process')) iconHtml = '<i class="ph ph-arrows-clockwise"></i>';
        else if (k.includes('param')) iconHtml = '<i class="ph ph-sliders"></i>';
        else if (k.includes('shock')) iconHtml = '<i class="ph ph-lightning"></i>';
        else if (k.includes('disaster')) iconHtml = '<i class="ph ph-warning-octagon"></i>';
        else if (k.includes('impact')) iconHtml = '<i class="ph ph-target"></i>';
        else if (k.includes('state')) iconHtml = '<i class="ph ph-database"></i>';

        const header = document.createElement('div');
        header.className = 'tree-node-header';
        
        const toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.innerHTML = '<i class="ph ph-caret-down"></i>';
        
        const iconSpan = document.createElement('span');
        iconSpan.innerHTML = iconHtml;
        iconSpan.style.color = 'var(--accent-blueprint)';
        iconSpan.style.fontSize = '1.1rem';

        const keySpan = document.createElement('span');
        keySpan.className = 'tree-key';
        keySpan.textContent = key.replace(/_/g, ' ').toUpperCase();

        header.appendChild(toggle);
        header.appendChild(iconSpan);
        header.appendChild(keySpan);
        node.appendChild(header);

        const content = document.createElement('div');
        content.className = 'tree-node-content';
        Object.entries(value).forEach(([k, v]) => content.appendChild(createTreeNode(k, v)));
        node.appendChild(content);

        header.addEventListener('click', (e) => {
            e.stopPropagation();
            content.classList.toggle('collapsed');
            header.classList.toggle('collapsed');
            if (!content.classList.contains('collapsed')) setupMath(content);
        });
    } else {
        node.className = 'tree-leaf';
        let displayValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (typeof value === 'string' && (value.includes('\\') || value.includes('_') || value.includes('^'))) {
            if (!value.includes('$')) displayValue = `$${value}$`;
        }
        node.innerHTML = `
            <span class="tree-key">${key}</span>
            <span class="tree-value">${displayValue}</span>
        `;
    }
    return node;
}

function toggleYamlView(mode) {
    const treeView = document.getElementById('yaml-tree-view');
    const rawView = document.getElementById('yaml-raw-view');
    const tabTree = document.getElementById('tab-tree');
    const tabRaw = document.getElementById('tab-raw');
    if (mode === 'tree') {
        treeView.classList.remove('hidden');
        rawView.classList.add('hidden');
        tabTree.classList.add('active-view-tab');
        tabRaw.classList.remove('active-view-tab');
    } else {
        treeView.classList.add('hidden');
        rawView.classList.remove('hidden');
        tabTree.classList.remove('active-view-tab');
        tabRaw.classList.add('active-view-tab');
    }
}

function jumpToScopeSection(sectionId) {
    jumpToTab('scope');
    setTimeout(() => {
        const target = document.querySelector(`.markdown-body [id^="${sectionId}"], .markdown-body h2:contains("${sectionId}")`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.style.transition = 'background 0.5s';
            target.style.background = 'rgba(74, 158, 255, 0.2)';
            setTimeout(() => target.style.background = 'transparent', 2000);
        }
    }, 100);
}

// Helper to find header by text if ID is missing (common in marked)
window.jQuery || (function() {
    // Simple polyfill for text search
    if (!Element.prototype.containsText) {
        Element.prototype.containsText = function(text) {
            return this.textContent.toLowerCase().includes(text.toLowerCase());
        };
    }
})();

function downloadFile(name) {
    window.location.href = `/api/model/file/${name}`;
}

function copyYamlPath() {
    alert("Copied path to D0_1_states.yaml");
}
