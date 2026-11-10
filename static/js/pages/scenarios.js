document.addEventListener("DOMContentLoaded", () => {
    console.log("scenarios.js loaded successfully!");

    initFilters();
    initActionButtons();
    initDeleteModal();
});

function initActionButtons() {
    // --- DUPLICATE ---
    document.querySelectorAll('.duplicate-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            console.log("Duplicate clicked for ID:", id); // DEBUG
            
            if (!id) return alert("Error: ID is missing in HTML!");

            btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
            
            try {
                const res = await fetch(`/api/scenarios/${id}/duplicate`, { method: 'POST' });
                console.log("Server responded with:", res.status); // DEBUG
                
                if (res.ok) {
                    window.location.reload();
                } else {
                    alert("Server error: " + res.status);
                    btn.innerHTML = '<i class="fa-regular fa-copy"></i> Duplicate';
                }
            } catch (err) {
                console.error(err);
                alert("Network error. Check console.");
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> Duplicate';
            }
        });
    });

    // --- RESTORE ---
    document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            console.log("Restore clicked for ID:", id); // DEBUG
            
            btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
            
            try {
                const res = await fetch(`/api/scenarios/${id}/restore`, { method: 'PATCH' });
                console.log("Server responded with:", res.status); // DEBUG
                
                if (res.ok) {
                    window.location.reload();
                } else {
                    alert("Server error: " + res.status);
                }
            } catch (err) {
                console.error(err);
                alert("Network error.");
            }
        });
    });

    // --- RENAME ---
    document.querySelectorAll('.rename-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const currentName = btn.dataset.name;
            console.log("Rename clicked for ID:", id); // DEBUG

            const newName = prompt("Enter new name:", currentName);
            if (!newName || newName.trim() === '') return;

            try {
                const res = await fetch(`/api/scenarios/${id}/rename`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName.trim() })
                });
                if (res.ok) window.location.reload();
            } catch (err) {
                console.error(err);
            }
        });
    });

    // --- ARCHIVE / UNARCHIVE ---
    document.querySelectorAll('.archive-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const isArchived = btn.dataset.status === 'Archived';
            const endpoint = isArchived ? 'restore' : 'archive';
            console.log("Archive clicked. Endpoint:", endpoint); // DEBUG
            
            try {
                const res = await fetch(`/api/scenarios/${id}/${endpoint}`, { method: 'PATCH' });
                if (res.ok) window.location.reload();
            } catch (err) {
                console.error(err);
            }
        });
    });
}

function initDeleteModal() {
    const deleteModal = document.getElementById('delete_modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    let scenarioToDeleteId = null;

    if (!deleteModal) return console.error("Delete modal HTML not found!");

    document.querySelectorAll('.delete-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            scenarioToDeleteId = btn.dataset.id;
            console.log("Delete triggered for ID:", scenarioToDeleteId);
            deleteModal.showModal();
        });
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!scenarioToDeleteId) return;
        
        confirmDeleteBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';

        try {
            const res = await fetch(`/api/scenarios/${scenarioToDeleteId}`, { method: 'DELETE' });
            if (res.ok) {
                window.location.reload();
            } else {
                alert("Delete failed.");
            }
        } catch (err) {
            console.error(err);
        }
    });
}

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.scenario-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');
            
            filterBtns.forEach(b => b.className = 'filter-btn btn btn-sm btn-ghost bg-base-200/50 text-base-content/70 rounded-full px-4');
            btn.className = 'filter-btn btn btn-sm btn-soft btn-success rounded-full px-4';

            cards.forEach(card => {
                if (filterValue === 'all' || filterValue === card.getAttribute('data-status')) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}