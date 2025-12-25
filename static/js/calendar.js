document.addEventListener("DOMContentLoaded", function() {
    const LS_KEY = "thesis_calendar_events_v1";

    // ----------------------------
    // STATE & DEFAULTS
    // ----------------------------
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let eventsData = [];

    // Default milestones if storage is empty
    const DEFAULTS = [
        { id: "def_0", date: "2025-10-15", title: "D0: Model Spec", type: "deliverable", desc: "Block spec & equations" },
        { id: "def_1", date: "2025-11-20", title: "D1: Calibration", type: "deliverable", desc: "Data & Targets ready" },
        { id: "def_2", date: "2025-12-15", title: "D2: Baseline Model", type: "deliverable", desc: "Initial IRFs & SS" },
        { id: "def_3", date: "2026-01-30", title: "D3: Banking Block", type: "deliverable", desc: "Intermediary frictions" },
        { id: "def_4", date: "2026-02-28", title: "D4: Climate Box", type: "deliverable", desc: "Disaster shock calib" },
        { id: "def_5", date: "2026-03-31", title: "D5: Experiments", type: "deliverable", desc: "Policy rules & Robustness" },
        { id: "def_6", date: "2026-04-30", title: "D6: Decomposition", type: "deliverable", desc: "Inequality vs Finance" },
        { id: "def_7", date: "2026-05-20", title: "D7: Draft V1", type: "deliverable", desc: "Full text assembly" },
    ];

    // ----------------------------
    // INIT
    // ----------------------------
    loadEvents();
    renderCalendar(currentMonth, currentYear);
    renderSidebar();

    // ----------------------------
    // DATA LAYER
    // ----------------------------
    function loadEvents() {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
            eventsData = JSON.parse(raw);
        } else {
            eventsData = JSON.parse(JSON.stringify(DEFAULTS));
            saveEvents();
        }
    }

    function saveEvents() {
        localStorage.setItem(LS_KEY, JSON.stringify(eventsData));
        renderCalendar(currentMonth, currentYear);
        renderSidebar();
    }

    // ----------------------------
    // RENDER LOGIC
    // ----------------------------

    window.changeMonth = function(delta) {
        currentMonth += delta;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    };

    window.goToToday = function() {
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        renderCalendar(currentMonth, currentYear);
    };

    function renderSidebar() {
        const container = document.getElementById('deadlines-container');
        if(!container) return;
        
        // Sort by date
        const sorted = [...eventsData].sort((a,b) => new Date(a.date) - new Date(b.date));
        
        container.innerHTML = sorted.map(d => {
            const isCompleted = d.completed === true;
            let icon = '';
            let color = 'var(--accent-primary)';
            
            // Type-specific styling
            switch(d.type) {
                case 'meeting': color = '#10b981'; icon = '<i class="ph ph-users" style="margin-left:4px;"></i>'; break;
                case 'submission': color = '#ef4444'; icon = '<i class="ph ph-warning" style="margin-left:4px;"></i>'; break;
                case 'reading': color = '#8b5cf6'; icon = '<i class="ph ph-book-open" style="margin-left:4px;"></i>'; break;
                case 'compute': color = '#f59e0b'; icon = '<i class="ph ph-cpu" style="margin-left:4px;"></i>'; break;
                default: color = 'var(--accent-primary)'; 
            }

            return `
            <div class="deadline-item ${isCompleted ? 'completed-item' : ''}" onclick="openEditModal('${d.id}')">
                <div class="deadline-date" style="color: ${color}">
                    ${formatDateFriendly(d.date)}
                    ${icon}
                    ${isCompleted ? '<i class="ph ph-check-circle" style="float:right; color:#10b981;"></i>' : ''}
                </div>
                <div class="deadline-title" style="${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${d.title}</div>
                <div class="deadline-desc">${d.desc || ''}</div>
                ${d.notes ? `<div style="margin-top:5px; font-size:0.8rem; opacity:0.7; font-family:var(--font-mono); border-left: 2px solid ${color}; padding-left:6px;">${d.notes.substring(0,50)}${d.notes.length>50?'...':''}</div>` : ''}
            </div>
            `;
        }).join('');
    }

    function renderCalendar(month, year) {
        const grid = document.getElementById('calendar-grid');
        const monthDisplay = document.getElementById('current-month-display');
        
        if(!grid) return;

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthDisplay.innerText = `${monthNames[month]} ${year}`;

        grid.innerHTML = "";

        const firstDay = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(createDayCell("", true));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = eventsData.filter(d => d.date === dateStr);
            const isToday = (day === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            
            // Pass full date for DnD
            grid.appendChild(createDayCell(day, false, isToday, dayEvents, dateStr));
        }
    }

    function createDayCell(dayNum, isPadding, isToday = false, dayEvents = [], fullDateStr = "") {
        const cell = document.createElement('div');
        cell.className = `calendar-day ${isPadding ? 'day-other-month' : ''} ${isToday ? 'day-today' : ''}`;
        
        if (!isPadding) {
            // Drag Drop Attributes
            cell.setAttribute('data-date', fullDateStr);
            cell.ondrop = (e) => handleDrop(e, fullDateStr);
            cell.ondragover = (e) => handleDragOver(e);
            cell.ondragleave = (e) => handleDragLeave(e);

            cell.innerHTML = `<div class="day-number">${dayNum}</div>`;
            
            dayEvents.forEach(ev => {
                const badge = document.createElement('div');
                badge.className = `cal-event type-${ev.type || 'deliverable'}`;
                badge.draggable = true;
                badge.ondragstart = (e) => handleDragStart(e, ev.id);
                // Add click handler to edit directly from calendar
                badge.onclick = (e) => { e.stopPropagation(); openEditModal(ev.id); };
                
                badge.innerText = ev.title;
                cell.appendChild(badge);
            });

            // Allow clicking empty day to add event
            if (dayEvents.length === 0) {
                 cell.onclick = () => openAddModalForDate(currentYear, currentMonth, dayNum);
            }
        }
        return cell;
    }

    function formatDateFriendly(dateStr) {
        if(!dateStr) return "No Date";
        const d = new Date(dateStr); // Note: Simple string parsing might have timezone offsets. 
        // Better to force UTC YYYY-MM-DD parsing to avoid "day before" bugs
        const [y, m, day] = dateStr.split('-').map(Number);
        const utcDate = new Date(Date.UTC(y, m-1, day));
        return utcDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    }

    // ----------------------------
    // UI HANDLERS (DnD & Notes)
    // ----------------------------

    // ----------------------------
    // UI HANDLERS (DnD & Notes)
    // ----------------------------

    window.toggleNotesField = function() {
        const type = document.getElementById('event-type').value;
        const noteSection = document.getElementById('notes-section');
        if (type === 'meeting') {
            noteSection.style.display = 'block';
        } else {
            noteSection.style.display = 'none';
        }
    };

    // Drag and Drop Logic - Expose to Window
    window.handleDragStart = function(e, id) {
        e.dataTransfer.setData("text/plain", id);
        e.target.classList.add('dragging');
    };

    window.handleDragOver = function(e) {
        e.preventDefault();
        e.target.closest('.calendar-day').classList.add('drag-over');
    };

    window.handleDragLeave = function(e) {
        e.target.closest('.calendar-day').classList.remove('drag-over');
    };

    window.handleDrop = function(e, newDateStr) {
        e.preventDefault();
        const cell = e.target.closest('.calendar-day');
        cell.classList.remove('drag-over');
        
        const id = e.dataTransfer.getData("text/plain");
        if (!id || !newDateStr) return;

        const idx = eventsData.findIndex(ev => ev.id === id);
        if (idx !== -1) {
            eventsData[idx].date = newDateStr; // Update date logic
            saveEvents(); // Save & Re-render
        }
    };


    // ----------------------------
    // MODAL & CRUD
    // ----------------------------
    
    // Open for New Event
    window.openAddModal = function() {
        document.getElementById('modal-title').innerText = "Add Event";
        document.getElementById('event-id').value = "";
        document.getElementById('event-title').value = "";
        document.getElementById('event-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('event-type').value = "deliverable";
        document.getElementById('event-desc').value = "";
        document.getElementById('event-notes').value = ""; // Reset notes
        document.getElementById('event-completed').checked = false;
        
        toggleNotesField(); // Update UI
        
        document.getElementById('btn-delete-event').style.display = "none";
        document.getElementById('event-modal').classList.remove('hidden');
    };

    window.openAddModalForDate = function(y, m, d) {
        window.openAddModal();
        const dateStr = `${y}-${String(m+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        document.getElementById('event-date').value = dateStr;
    };

    // Open for Edit
    window.openEditModal = function(id) {
        const ev = eventsData.find(e => e.id === id);
        if(!ev) return;

        document.getElementById('modal-title').innerText = "Edit Event";
        document.getElementById('event-id').value = ev.id;
        document.getElementById('event-title').value = ev.title;
        document.getElementById('event-date').value = ev.date;
        document.getElementById('event-type').value = ev.type || "deliverable";
        document.getElementById('event-desc').value = ev.desc || "";
        document.getElementById('event-notes').value = ev.notes || ""; // Load notes
        document.getElementById('event-completed').checked = ev.completed || false;
        
        toggleNotesField(); // Update UI logic based on loaded type

        document.getElementById('btn-delete-event').style.display = "block";
        document.getElementById('event-modal').classList.remove('hidden');
    };

    window.closeModal = function() {
        document.getElementById('event-modal').classList.add('hidden');
    };

    window.saveEvent = function() {
        const id = document.getElementById('event-id').value;
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const type = document.getElementById('event-type').value;
        const desc = document.getElementById('event-desc').value;
        const notes = document.getElementById('event-notes').value;
        const completed = document.getElementById('event-completed').checked;

        if(!title || !date) {
            alert("Title and Date are required.");
            return;
        }

        if (id) {
            // Update
            const idx = eventsData.findIndex(e => e.id === id);
            if (idx !== -1) {
                eventsData[idx] = { id, title, date, type, desc, notes, completed };
            }
        } else {
            // Create
            const newEvent = {
                id: "evt_" + Date.now(),
                title, date, type, desc, notes, completed
            };
            eventsData.push(newEvent);
        }

        saveEvents();
        closeModal();
    };

    window.deleteEvent = function() {
        const id = document.getElementById('event-id').value;
        if(confirm("Delete this event?")) {
            eventsData = eventsData.filter(e => e.id !== id);
            saveEvents();
            closeModal();
        }
    };

    // ----------------------------
    // VIEW SWITCHER & GANTT (Moved Inside)
    // ----------------------------
    window.switchView = function(view) {
        const gridContainer = document.getElementById('view-grid-container');
        const ganttContainer = document.getElementById('view-gantt-container');
        const btnGrid = document.getElementById('btn-view-grid');
        const btnGantt = document.getElementById('btn-view-gantt');

        if (view === 'grid') {
            gridContainer.style.display = 'block';
            ganttContainer.style.display = 'none';
            btnGrid.style.background = 'var(--accent-primary)';
            btnGrid.style.color = 'white';
            btnGantt.style.background = 'transparent';
            btnGantt.style.color = 'var(--text-muted)';
        } else {
            gridContainer.style.display = 'none';
            ganttContainer.style.display = 'block';
            btnGantt.style.background = 'var(--accent-primary)';
            btnGantt.style.color = 'white';
            btnGrid.style.background = 'transparent';
            btnGrid.style.color = 'var(--text-muted)';
            renderGantt();
        }
    };

    function renderGantt() {
        const container = document.getElementById('gantt-chart');
        if(!container) return;
        
        // Sort by date properties
        const sorted = [...eventsData].sort((a,b) => new Date(a.date) - new Date(b.date));
        
        container.innerHTML = sorted.map(d => {
            const dateObj = new Date(d.date);
            const now = new Date();
            const diffTime = dateObj - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            let statusColor = '#3b82f6';
            if (d.type === 'meeting') statusColor = '#10b981';
            if (d.type === 'submission') statusColor = '#ef4444';
            
            let statusText = diffDays > 0 ? `Due in ${diffDays} days` : (diffDays === 0 ? 'Today' : 'Past Due');
            if (d.completed) statusText = "Completed";

            return `
            <div style="display:flex; align-items:center; gap:20px; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); padding:15px; border-radius:12px;">
                <div style="flex:0 0 150px; color:var(--text-muted); font-family:var(--font-mono); font-size:0.9rem;">
                    ${formatDateFriendly(d.date)}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:1.05rem; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
                        ${d.title}
                        ${d.completed ? '<i class="ph ph-check-circle" style="color:#10b981"></i>' : ''}
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${d.desc || 'No description'}</div>
                </div>
                <div style="flex:0 0 120px; text-align:right;">
                    <span style="background:${d.completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; 
                                 color:${d.completed ? '#10b981' : 'var(--text-main)'}; 
                                 padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:500;">
                        ${statusText}
                    </span>
                </div>
            </div>
            `;
        }).join('');
    }
});
