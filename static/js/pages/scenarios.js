document.addEventListener("DOMContentLoaded", () => {
    initFilters();
    initActions();
    initRenameModal();
    initDetailsModal();
    initDeleteModal();
});

// --- 1. FILTERS ---
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.scenario-card');
    const emptyState = document.getElementById('empty-state');

    if (filterBtns.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterBtns.forEach(b => b.className = 'filter-btn btn btn-sm btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70 raleway-500 rounded-full px-4 transition-all');
            btn.className = 'filter-btn btn btn-sm btn-soft btn-success raleway-500 rounded-full px-4 transition-all';

            let visible = 0;
            cards.forEach(card => {
                if (filter === 'all' || filter === card.dataset.status) {
                    card.classList.remove('hidden');
                    visible++;
                } else {
                    card.classList.add('hidden');
                }
            });
            if (emptyState) emptyState.classList.toggle('hidden', visible > 0);
        });
    });
}

// --- 2. ACTIONS (Duplicate, Archive, Restore) ---
function initActions() {
    document.querySelectorAll('.duplicate-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
            try {
                const res = await API.duplicateScenario(btn.dataset.id);
                if (res.ok) { 
                    showToast("Duplicated!"); 
                    setTimeout(() => window.location.reload(), 800); 
                } else {
                    showToast("Failed to duplicate", "error");
                    btn.innerHTML = '<i class="fa-regular fa-copy"></i> Duplicate';
                }
            } catch {
                showToast("Network error", "error");
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> Duplicate';
            }
        });
    });

    document.querySelectorAll('.archive-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const isArchived = btn.dataset.status === 'Archived';
            try {
                const res = isArchived ? await API.restoreScenario(btn.dataset.id) : await API.archiveScenario(btn.dataset.id);
                if (res.ok) { 
                    showToast(isArchived ? "Restored!" : "Archived!"); 
                    setTimeout(() => window.location.reload(), 800); 
                }
            } catch {
                showToast("Network error", "error");
            }
        });
    });

    document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
            try {
                const res = await API.restoreScenario(btn.dataset.id);
                if (res.ok) { 
                    showToast("Restored!"); 
                    setTimeout(() => window.location.reload(), 800); 
                }
            } catch {
                showToast("Network error", "error");
            }
        });
    });
}

// --- 3. RENAME MODAL ---
function initRenameModal() {
    const modal = document.getElementById('rename_modal');
    const form = document.getElementById('rename-form');
    const input = document.getElementById('rename-input');
    const btn = document.getElementById('confirm-rename-btn');
    let id = null;

    if (!modal) return;

    document.querySelectorAll('.rename-btn').forEach(b => {
        b.addEventListener('click', () => {
            id = b.dataset.id;
            input.value = b.dataset.name;
            modal.showModal();
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!input.value.trim()) return;
        btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
        const res = await API.renameScenario(id, input.value.trim());
        if (res.ok) { 
            modal.close(); 
            showToast("Renamed!"); 
            setTimeout(() => window.location.reload(), 800); 
        }
    });
}

// --- 4. DETAILS MODAL ---
function initDetailsModal() {
    const modal = document.getElementById('details_modal');
    if (!modal) return;

    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.getElementById('details-title').textContent = "Loading...";
            modal.showModal();

            try {
                const data = await API.getScenarioDetails(btn.dataset.id);
                
                if (!data || data.status === 'error' || !data.breakdown) {
                    console.error("Backend failed to return data. Response:", data);
                    showToast("Scenario no longer exists. Refreshing...", "error");
                    setTimeout(() => window.location.reload(), 1500);
                    return;
                }

                const fmt = (num) => "€" + Math.round(num).toLocaleString();

                document.getElementById('details-title').textContent = data.scenario_name;
                document.getElementById('details-final').textContent = fmt(data.breakdown.final_balance);
                document.getElementById('details-invested').textContent = fmt(data.breakdown.total_invested);
                document.getElementById('details-interest').textContent = fmt(data.breakdown.interest_earned);
                
                try {
                    if (typeof Charts !== 'undefined') {
                        Charts.renderLineChart('detailsChart', data.chart.labels, data.chart.balance_data, data.chart.invested_data, '#3b82f6');
                    }
                } catch (chartError) {
                    console.error("Chart failed to render, but data loaded:", chartError);
                }

            } catch (err) {
                console.error("Network fetch error:", err);
                showToast("Network error loading details.", "error");
                modal.close();
            }
        });
    });
}

// --- 5. DELETE MODAL ---
function initDeleteModal() {
    const modal = document.getElementById('delete_modal');
    const btn = document.getElementById('confirm-delete-btn');
    let id = null;

    if (!modal) return;

    document.querySelectorAll('.delete-trigger').forEach(b => {
        b.addEventListener('click', () => { id = b.dataset.id; modal.showModal(); });
    });

    btn.addEventListener('click', async () => {
        btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
        try {
            const res = await API.deleteScenario(id);
            if (res.ok) { 
                modal.close(); 
                showToast("Deleted!"); 
                setTimeout(() => window.location.reload(), 800); 
            } else {
                showToast("Failed to delete", "error");
                btn.innerHTML = 'Yes, Delete';
            }
        } catch {
            showToast("Network error", "error");
            btn.innerHTML = 'Yes, Delete';
        }
    });
}