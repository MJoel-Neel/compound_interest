document.addEventListener("DOMContentLoaded", () => {
    console.log("scenarios.js loaded successfully!");

    initFilters();
    initActionButtons();
    initDeleteModal();
    initRenameModal();
});

// ==========================================
// 1. TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    // Create container if it doesn't exist
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast toast-end toast-bottom z-[100]';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg mb-2 raleway-500`;
    let icon = type === 'error' ? '<i class="fa-solid fa-circle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';
    
    toast.innerHTML = `<div class="flex items-center gap-2">${icon}<span>${message}</span></div>`;
    container.appendChild(toast);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ==========================================
// 2. ACTION BUTTONS (Duplicate, Restore, Archive)
// ==========================================
function initActionButtons() {
    
    // --- DUPLICATE ---
    document.querySelectorAll('.duplicate-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
            
            try {
                const res = await fetch(`/api/scenarios/${id}/duplicate`, { method: 'POST' });
                if (res.ok) {
                    showToast("Scenario duplicated successfully!");
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    throw new Error("Server error");
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to duplicate scenario.", "error");
                btn.innerHTML = originalHTML;
            }
        });
    });

    // --- RESTORE ---
    document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
            
            try {
                const res = await fetch(`/api/scenarios/${id}/restore`, { method: 'PATCH' });
                if (res.ok) {
                    showToast("Scenario restored to Active!");
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    throw new Error("Server error");
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to restore scenario.", "error");
                btn.innerHTML = originalHTML;
            }
        });
    });

    // --- ARCHIVE / UNARCHIVE ---
    document.querySelectorAll('.archive-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const isArchived = btn.dataset.status === 'Archived';
            const endpoint = isArchived ? 'restore' : 'archive';
            
            try {
                const res = await fetch(`/api/scenarios/${id}/${endpoint}`, { method: 'PATCH' });
                if (res.ok) {
                    showToast(`Scenario ${isArchived ? 'unarchived' : 'archived'}!`);
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    throw new Error("Server error");
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to change status.", "error");
            }
        });
    });
}

// ==========================================
// 3. DELETE MODAL
// ==========================================
function initDeleteModal() {
    const deleteModal = document.getElementById('delete_modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    let scenarioToDeleteId = null;

    if (!deleteModal) return console.error("Delete modal HTML not found!");

    document.querySelectorAll('.delete-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            scenarioToDeleteId = btn.dataset.id;
            deleteModal.showModal();
        });
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!scenarioToDeleteId) return;

        const originalHTML = confirmDeleteBtn.innerHTML;
        confirmDeleteBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Deleting...';
        confirmDeleteBtn.disabled = true;

        try {
            const res = await fetch(`/api/scenarios/${scenarioToDeleteId}`, { method: 'DELETE' });
            if (res.ok) {
                deleteModal.close();
                showToast("Scenario deleted successfully!");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error("Server error");
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to delete scenario.", "error");
            confirmDeleteBtn.innerHTML = originalHTML;
            confirmDeleteBtn.disabled = false;
        }
    });
}

// ==========================================
// 4. RENAME MODAL (Custom Modal)
// ==========================================
function initRenameModal() {
    const renameModal = document.getElementById('rename_modal');
    const renameForm = document.getElementById('rename-form');
    const renameInput = document.getElementById('rename-input');
    const renameError = document.getElementById('rename-error');
    const confirmRenameBtn = document.getElementById('confirm-rename-btn');
    
    let scenarioToRenameId = null;

    if (!renameModal) return console.error("Rename modal HTML not found!");

    // Open Modal
    document.querySelectorAll('.rename-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            scenarioToRenameId = btn.dataset.id;
            const currentName = btn.dataset.name;
            
            renameInput.value = currentName;
            renameInput.classList.remove('input-error');
            renameError.classList.add('hidden');
            
            renameModal.showModal();
        });
    });

    // Handle Submit
    renameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!scenarioToRenameId) return;

        const newName = renameInput.value.trim();

        // Validation
        if (!newName) {
            renameInput.classList.add('input-error');
            renameError.classList.remove('hidden');
            return;
        }

        const originalHTML = confirmRenameBtn.innerHTML;
        confirmRenameBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Saving...';
        confirmRenameBtn.disabled = true;

        try {
            const res = await fetch(`/api/scenarios/${scenarioToRenameId}/rename`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });

            if (res.ok) {
                renameModal.close();
                showToast("Scenario renamed successfully!");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error("Server error");
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to rename scenario.", "error");
            confirmRenameBtn.innerHTML = originalHTML;
            confirmRenameBtn.disabled = false;
        }
    });
}

// ==========================================
// 5. FILTERS
// ==========================================
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.scenario-card');
    const emptyState = document.getElementById('empty-state');

    if (filterBtns.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');

            // Update Button Styles
            filterBtns.forEach(b => {
                b.className = 'filter-btn btn btn-sm btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70 raleway-500 rounded-full px-4 transition-all';
            });
            btn.className = 'filter-btn btn btn-sm btn-soft btn-success raleway-500 rounded-full px-4 transition-all';

            // Filter Cards
            let visibleCount = 0;
            cards.forEach(card => {
                const cardStatus = card.getAttribute('data-status');
                if (filterValue === 'all' || filterValue === cardStatus) {
                    card.classList.remove('hidden');
                    // Add tiny fade-in animation
                    card.style.opacity = '0';
                    setTimeout(() => card.style.opacity = '1', 50);
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            // Handle Empty State
            if (emptyState) {
                if (visibleCount === 0) {
                    emptyState.classList.remove('hidden');
                } else {
                    emptyState.classList.add('hidden');
                }
            }
        });
    });
}