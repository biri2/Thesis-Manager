document.addEventListener("DOMContentLoaded", async function() {
    const modelsGrid = document.getElementById('models-grid');

    try {
        const response = await fetch('/api/models');
        const data = await response.json();

        if (data.error) {
            modelsGrid.innerHTML = `<div class="error">Error loading data: ${data.error}</div>`;
            return;
        }

        const delivMap = data.project.deliverables_map || {};
        renderTimeline(data.models);
        renderModels(data.models, delivMap);
        setupCollapsibles();

    } catch (err) {
        console.error("Failed to fetch models:", err);
    }

    function renderModels(models, delivMap) {
        modelsGrid.innerHTML = models.map(m => `
            <div class="card model-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 style="margin:0; font-size: 1.3rem; color: var(--accent-primary);">${m.name}</h3>
                    <span class="tool-badge" style="font-family: var(--font-mono); color: var(--accent-secondary);">${m.id}</span>
                </div>
                
                <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-muted);">${m.purpose}</p>

                <div class="info-group">
                    <div class="info-label">Deliverables Supported</div>
                    <div class="deliv-grid">
                        ${m.deliverables_supported.map(d => `
                            <div class="deliv-item" data-deliv="${d}">
                                <span class="deliv-id">${d}</span>
                                <span class="deliv-name">${delivMap[d] || 'Unknown'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${m.code_paths ? `
                    <div class="info-group">
                        <div class="info-label">Code & Scripts</div>
                        <ul class="path-list">
                            ${(m.code_paths.scripts || []).map(s => `<li class="path-item"><i class="ph ph-file-py"></i> ${s}</li>`).join('')}
                            ${(m.code_paths.outputs || []).map(o => `<li class="path-item"><i class="ph ph-file-csv"></i> ${o}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${m.required_data || m.optional_data ? `
                    <div class="info-group">
                        <div class="info-label">Data Requirements</div>
                        <div class="data-collapsible">
                            <button class="data-trigger">
                                <span><i class="ph ph-database"></i> View Data Details</span>
                                <i class="ph ph-caret-down"></i>
                            </button>
                            <div class="data-content">
                                ${m.required_data ? `
                                    <div style="margin-bottom: 15px;">
                                        <div style="font-size: 0.7rem; color: var(--accent-primary); font-weight:700; margin-bottom: 8px; text-transform:uppercase;">Required</div>
                                        ${renderData(m.required_data)}
                                    </div>
                                ` : ''}
                                ${m.optional_data ? `
                                    <div>
                                        <div style="font-size: 0.7rem; color: var(--text-faint); font-weight:700; margin-bottom: 8px; text-transform:uppercase;">Optional</div>
                                        ${renderData(m.optional_data)}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${m.variants ? `
                    <div class="info-group">
                        <div class="info-label">Suite Variants</div>
                        ${m.variants.map(v => `
                            <div class="variant-card">
                                <div class="variant-id">${v.id}</div>
                                <div class="variant-desc">${v.description}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${m.literature ? `
                <div class="info-group">
                    <div class="info-label">Key Literature Mapping</div>
                    <div class="literature-list">
                        ${m.literature.map(lit => `
                            <div class="literature-item" title="${lit.explanation}">
                                <i class="ph ph-book-open"></i>
                                <div class="lit-content">
                                    <a href="/reading_list#paper-${lit.paper_id}" target="_blank" class="lit-link text-gradient">${lit.title}</a>
                                    <span class="lit-brief">— ${lit.explanation}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="info-group" style="margin-top:auto; padding-top: 15px; border-top: 1px solid var(--card-border);">
                    <div class="info-label">Related Topics</div>
                    <div class="topic-list">
                        ${m.related_topics.map(t => `
                            <span class="topic-badge">
                                <i class="ph ph-tag"></i> ${t}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderData(dataObj) {
        if (typeof dataObj === 'string') return `<div class="data-series" style="margin-bottom:8px;">${dataObj}</div>`;
        if (Array.isArray(dataObj)) {
            return dataObj.map(d => {
                if (typeof d === 'string') return `<div class="data-series" style="margin-bottom:8px;">${d}</div>`;
                return `
                    <div class="data-group">
                        <div class="data-source">${d.source}</div>
                        <div class="data-series">${d.series.join(', ')}</div>
                    </div>
                `;
            }).join('');
        }
        return Object.entries(dataObj).map(([cat, items]) => `
            <div style="font-size: 0.65rem; color: var(--text-faint); margin: 8px 0 4px 0; text-transform: uppercase;">${cat.replace('_', ' ')}</div>
            ${items.map(d => `
                <div class="data-group">
                    <div class="data-source">${d.source}</div>
                    <div class="data-series">${d.series.join(', ')}</div>
                </div>
            `).join('')}
        `).join('');
    }

    function setupCollapsibles() {
        document.querySelectorAll('.data-trigger').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const content = trigger.nextElementSibling;
                trigger.classList.toggle('active');
                content.classList.toggle('active');
            });
        });
    }

    function renderTimeline(models) {
        const timeline = document.getElementById('models-timeline');
        if (!timeline) return;

        // Split into 2 rows (M0-M3, M4-M7)
        const row1 = models.slice(0, 4);
        const row2 = models.slice(4, 8);

        const renderNode = (m) => `
            <div class="timeline-node" onclick="document.getElementById('models-grid').scrollIntoView({ behavior: 'smooth' })">
                <div class="node-circle">${m.id.split('_')[0]}</div>
                <div class="node-label">${m.name}</div>
            </div>
        `;

        timeline.innerHTML = `
            <div class="timeline-row">
                ${row1.map(renderNode).join('')}
            </div>
            
            <div class="timeline-row" style="margin-top: 30px;">
                ${row2.map(renderNode).join('')}
            </div>
        `;
    }
});
