document.addEventListener("DOMContentLoaded", function () {
    // ----------------------------
    // Persistent checkboxes (localStorage)
    // ----------------------------
    const LS_KEY = "thesis_reading_tracker_v2";

    function loadState() {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
        catch (e) { return {}; }
    }
    function saveState(state) {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
    function applyCheckboxes() {
        const state = loadState();
        document.querySelectorAll("input.cb[data-key]").forEach(cb => {
            const k = cb.getAttribute("data-key");
            cb.checked = !!state[k];
        });
    }
    function wireCheckboxes() {
        document.querySelectorAll("input.cb[data-key]").forEach(cb => {
            cb.addEventListener("change", () => {
                const state = loadState();
                const k = cb.getAttribute("data-key");
                state[k] = cb.checked;
                saveState(state);
                refreshFilters();
            });
        });
    }

    // ----------------------------
    // Tooltip & Data Setup
    // ----------------------------
    const DELIVERABLES = {
        "D0": "Model spec (equations & blocks)",
        "D1": "Calibration + empirical targets",
        "D2": "Baseline model solved (SS + IRFs)",
        "D3": "Banks / financial intermediary module",
        "D4": "Climate rare-disaster shock module",
        "D5": "Nonlinear experiments + policy rules",
        "D6": "Decomposition: inequality vs finance",
        "D7": "Optional: NN surrogate + estimation"
    };

    function injectTooltips() {
        document.querySelectorAll(".chip.deliv").forEach(chip => {
            const text = chip.innerText.trim();
            if (DELIVERABLES[text]) {
                chip.setAttribute("data-tip", DELIVERABLES[text]);
            }
        });
    }

    // ----------------------------
    // Filters (search + importance + read/unread + new deliverables)
    // ----------------------------
    function refreshFilters() {
        const q = (document.getElementById("q").value || "").toLowerCase().trim();

        const fCore = document.getElementById("f_core").checked;
        const fHigh = document.getElementById("f_high").checked;
        const fSupp = document.getElementById("f_supp").checked;
        const fOpt = document.getElementById("f_opt").checked;

        const onlyUnread = document.getElementById("f_unread").checked;
        const showRead = document.getElementById("f_read").checked;

        // Get active deliverable filters
        const activeDelivs = [];
        ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"].forEach(d => {
            const el = document.getElementById("f_" + d.toLowerCase());
            if (el && el.checked) activeDelivs.push(d.toLowerCase()); // store as lowercase for tag matching
        });

        const state = loadState();

        document.querySelectorAll(".paper-item").forEach(el => {
            const tags = (el.getAttribute("data-tags") || "").toLowerCase();

            // 1. Search filter
            const matchesSearch = !q || tags.includes(q);

            // 2. Importance filter
            const isCore = tags.includes("core");
            const isHigh = tags.includes("high");
            const isSupp = tags.includes("supp");
            const isOpt = tags.includes("opt");

            const importanceAllowed =
                (isCore && fCore) ||
                (isHigh && fHigh) ||
                (isSupp && fSupp) ||
                (isOpt && fOpt);

            // 3. Read/Unread filter
            const cb = el.querySelector("input.cb[data-key]");
            const key = cb ? cb.getAttribute("data-key") : "";
            const isRead = !!state[key];

            const readAllowed =
                (!onlyUnread && (showRead || !isRead)) ||
                (onlyUnread && !isRead);

            // 4. Deliverable Filter (NEW)
            // If no deliverables selected, show all (or could imply none, but usually "no filter" means "all").
            // Actually, standard UX: if some checked, show papers matching AT LEAST ONE.
            // If ALL unchecked, maybe show all? Let's check the user request. "Add a filter for the deriverables".
            // Let's assume if all D's unchecked -> show all. If any checked -> show matching.
            let delivAllowed = true;
            if (activeDelivs.length > 0) {
                // Does this paper have ANY of the active deliverable tags?
                // Note: tags string has "d0", "d1" etc.
                const hasMatch = activeDelivs.some(d => tags.includes(" " + d + " ") || tags.includes(" " + d) || tags.startsWith(d));
                // Simple includes check is risky ("d1" matches "d10" if it existed), but we only have d0-d7.
                // Safer:
                const tagList = tags.split(" ");
                delivAllowed = activeDelivs.some(d => tagList.includes(d));
            }

            const visible = matchesSearch && importanceAllowed && readAllowed && delivAllowed;

            el.classList.toggle("hidden", !visible);
            el.classList.toggle("faint", isRead && visible);
        });

        // Hide topics if all papers hidden
        document.querySelectorAll(".topic").forEach(topic => {
            const anyVisible = !!topic.querySelector(".paper-item:not(.hidden)");
            topic.classList.toggle("hidden", !anyVisible);
        });
    }

    function wireFilters() {
        const ids = ["q", "f_core", "f_high", "f_supp", "f_opt", "f_unread", "f_read"];
        // Add deliverable ids
        ["d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7"].forEach(d => ids.push("f_" + d));

        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener(id === "q" ? "input" : "change", refreshFilters);
        });
    }

    // init
    applyCheckboxes();
    injectTooltips();
    wireCheckboxes();
    wireFilters();
    refreshFilters();
});


// ----------------------------
// Flip Card Logic
// ----------------------------
document.addEventListener('click', function(e) {
    // Check if clicked element is a flip button or inside one
    const flipBtn = e.target.closest('.btn-flip');
    if (flipBtn) {
        const flipper = flipBtn.closest('.flipper');
        if (flipper) {
            flipper.classList.add('flipped');
        }
    }

    // Check if clicked element is a back flip button or inside one
    const backBtn = e.target.closest('.btn-flip-back');
    if (backBtn) {
        const flipper = backBtn.closest('.flipper');
        if (flipper) {
            flipper.classList.remove('flipped');
        }
    }
});

// ----------------------------
// CALENDAR INTEGRATION
// ----------------------------
window.scheduleReview = function(element) {
    // 1. Find paper context
    const card = element.closest('.paper-item');
    if (!card) return;
    
    // Find checkbox to get unique key
    const cb = card.querySelector('.cb');
    const id = cb ? cb.getAttribute('data-key') : "unknown_paper";
    
    // Find title
    const titleEl = card.querySelector('.paper-title');
    let title = "Unknown Paper";
    if (titleEl) {
        const clone = titleEl.cloneNode(true);
        const input = clone.querySelector('input');
        if(input) input.remove();
        title = clone.innerText.trim();
    }
    
    // 2. Setup Date Picker
    // Check if we already have a picker for this button attached? No, create transient one.
    let dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.style.position = 'absolute';
    dateInput.style.opacity = '0'; // Hidden but clickable if needed, but showPicker handles it
    dateInput.style.pointerEvents = 'none';
    document.body.appendChild(dateInput);

    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.valueAsDate = tomorrow;

    // Handle selection
    dateInput.addEventListener('change', function() {
        if (!dateInput.value) return; // Cancelled or cleared
        
        const selectedDate = dateInput.value;
        createEvent(selectedDate, title);
        
        // Feedback on button
        const btn = element;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-check"></i>';
        btn.style.color = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.color = '';
        }, 2000);
        
        document.body.removeChild(dateInput);
    });
    
    dateInput.addEventListener('cancel', function() {
        document.body.removeChild(dateInput);
    });
    
    // Show picker
    if('showPicker' in HTMLInputElement.prototype) {
        try {
            dateInput.showPicker();
        } catch(err) {
            console.warn("showPicker failed, fallback to prompt", err);
            promptFallback();
        }
    } else {
        promptFallback();
    }

    function promptFallback() {
        const dateStr = prompt("Enter date to schedule review (YYYY-MM-DD):", tomorrow.toISOString().split('T')[0]);
        if (dateStr) {
            createEvent(dateStr, title);
        }
        if(dateInput.parentNode) document.body.removeChild(dateInput);
    }

    function createEvent(dateStr, paperTitle) {
        const LS_KEY = "thesis_calendar_events_v1";
        const raw = localStorage.getItem(LS_KEY);
        let eventsData = raw ? JSON.parse(raw) : [];

        const newEvent = {
            id: "evt_review_" + Date.now(),
            title: "Review: " + paperTitle.substring(0, 30) + (paperTitle.length>30?"...":""),
            date: dateStr,
            type: "reading",
            desc: `Deep dive reading: ${paperTitle}. Scheduled from Reading List.`,
            notes: "",
            completed: false
        };

        eventsData.push(newEvent);
        localStorage.setItem(LS_KEY, JSON.stringify(eventsData));
        console.log("Scheduled event for", dateStr);
    }
};
