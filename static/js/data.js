document.addEventListener('DOMContentLoaded', function() {
    const dataTableBody = document.getElementById('data-table-body');
    const topicsList = document.getElementById('data-topics-list');
    const addDataBtn = document.getElementById('add-data-btn');
    const dataModal = document.getElementById('data-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const dataForm = document.getElementById('data-form');
    const modalTitle = document.getElementById('modal-title');
    
    let allData = [];

    // Fetch initial data
    async function fetchData() {
        try {
            const response = await fetch('/api/data');
            allData = await response.json();
            renderAll();
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    }

    function renderAll() {
        renderMatrix();
        renderTopics();
    }

    function renderMatrix() {
        dataTableBody.innerHTML = allData.map(item => `
            <tr>
                <td>
                    ${item.name}
                    <span class="src">${item.source}</span>
                </td>
                ${['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'].map(m => `
                    <td>${renderBadge(item.requirements[m])}</td>
                `).join('')}
                <td>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="action-btn edit-btn" data-id="${item.id}" title="Edit">
                            <i class="ph ph-note-pencil"></i>
                        </button>
                        <button class="action-btn delete-btn delete" data-id="${item.id}" title="Delete">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Attach listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteDataset(btn.dataset.id));
        });
    }

    function renderBadge(type) {
        if (type === 'req') return '<span class="badge req">✓</span>';
        if (type === 'opt') return '<span class="badge opt">◐</span>';
        return '<span class="badge no">—</span>';
    }

    function renderTopics() {
        const grouped = allData.reduce((acc, item) => {
            if (!acc[item.topic]) acc[item.topic] = [];
            acc[item.topic].push(item);
            return acc;
        }, {});

        topicsList.innerHTML = Object.entries(grouped).map(([topic, items]) => `
            <div class="topic-group">
                <div class="topic-header">
                    <i class="ph ph-folder-open"></i> ${topic}
                </div>
                <div class="topic-items">
                    ${items.map(item => `
                        <div class="topic-item">
                            <div class="topic-item-name">${item.name}</div>
                            <div class="topic-item-src">${item.source}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Modal Logic
    addDataBtn.addEventListener('click', () => {
        modalTitle.innerText = 'Add Dataset';
        dataForm.reset();
        document.getElementById('item-id').value = '';
        dataModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        dataModal.classList.remove('active');
    });

    function openEditModal(id) {
        const item = allData.find(d => d.id === id);
        if (!item) return;

        modalTitle.innerText = 'Edit Dataset';
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-source').value = item.source;
        document.getElementById('item-topic').value = item.topic;
        
        // Populate requirements
        document.querySelectorAll('.req-input-group select').forEach(select => {
            const m = select.dataset.model;
            select.value = item.requirements[m] || 'no';
        });

        dataModal.classList.add('active');
    }

    dataForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('item-id').value;
        const name = document.getElementById('item-name').value;
        const source = document.getElementById('item-source').value;
        const topic = document.getElementById('item-topic').value;
        
        const requirements = {};
        document.querySelectorAll('.req-input-group select').forEach(select => {
            requirements[select.dataset.model] = select.value;
        });

        const payload = { name, source, topic, requirements };
        if (id) payload.id = id;

        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/data/${id}` : '/api/data';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                dataModal.classList.remove('active');
                fetchData();
            }
        } catch (err) {
            console.error('Save failed:', err);
        }
    });

    async function deleteDataset(id) {
        if (!confirm('Are you sure you want to delete this dataset?')) return;
        
        try {
            const response = await fetch(`/api/data/${id}`, { method: 'DELETE' });
            if (response.ok) fetchData();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    }

    fetchData();
});
