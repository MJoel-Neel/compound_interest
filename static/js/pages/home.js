// static/js/pages/home.js

document.addEventListener("DOMContentLoaded", () => {
    initSimulationChart();
    initSaveModal();
    initHomeDeleteModal();
});

// --- 1. SIMULATION & CHART ---
function initSimulationChart() {
    const form = document.getElementById('simulator-form');
    if (!form) return;

    runSimulation(); // Run on page load

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) runSimulation();
    });
}

async function runSimulation() {
    const btn = document.querySelector('#simulator-form button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
    btn.disabled = true;

    const payload = {
        initial: parseFloat(document.getElementById('initial').value),
        monthly: parseFloat(document.getElementById('monthly').value),
        annual_rate: parseFloat(document.getElementById('annual_rate').value),
        years: parseInt(document.getElementById('years').value)
    };

    try {
        const data = await API.simulate(payload);

        const fmt = (num) => "€" + Math.round(num).toLocaleString('en-US');

        // UPDATE: Access the values inside the "kpis" object now
        document.getElementById('final-balance-val').textContent = fmt(data.kpis.gross_balance);
        document.getElementById('total-invested-val').textContent = fmt(data.kpis.total_invested);
        document.getElementById('gains-val').textContent = fmt(data.kpis.gross_gains);

        // The chart data structure hasn't changed, so this is still fine
        Charts.renderLineChart('simulator-chart', data.chart.labels, data.chart.balance_data, data.chart.invested_data);
    } catch (err) {
        console.error(err);
        showToast("Failed to run simulation", "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function validateForm() {
    const form = document.getElementById('simulator-form');
    let isValid = true;
    form.querySelectorAll('input[type="number"]').forEach(input => {
        const wrapper = input.closest('.input');
        if (!input.checkValidity()) {
            isValid = false;
            wrapper.classList.add('input-error');
        } else {
            wrapper.classList.remove('input-error');
        }
    });
    if (!isValid) showToast("Please fill out all fields correctly.", "error");
    return isValid;
}

// --- 2. SAVE MODAL (From Home Page) ---
function initSaveModal() {
    const openBtn = document.getElementById('open-save-modal-btn');
    const modal = document.getElementById('save_scenario_modal');
    const form = document.getElementById('save-scenario-form');
    const nameInput = document.getElementById('scenario-name-input');
    const nameError = document.getElementById('name-error');
    const confirmBtn = document.getElementById('confirm-save-btn');

    if (!openBtn || !modal) return;

    let selectedIcon = "fa-arrow-trend-up";
    let selectedColor = "success";

    document.querySelectorAll('.icon-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.icon-option').forEach(o => o.className = 'icon-option flex items-center justify-center p-3 rounded-lg border-2 border-base-200 text-base-content/60 hover:bg-base-200 cursor-pointer transition-all');
            opt.className = 'icon-option flex items-center justify-center p-3 rounded-lg border-2 border-primary bg-primary/10 text-primary cursor-pointer transition-all';
            selectedIcon = opt.dataset.value;
        });
    });

    document.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.className = 'color-option flex items-center justify-center p-3 rounded-lg border-2 border-base-200 hover:bg-base-200 cursor-pointer transition-all');
            const color = opt.dataset.value;
            opt.className = `color-option flex items-center justify-center p-3 rounded-lg border-2 border-${color} bg-${color}/10 cursor-pointer transition-all`;
            selectedColor = color;
        });
    });

    openBtn.addEventListener('click', () => {
        form.reset();
        nameError.classList.add('hidden');
        modal.showModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!nameInput.value.trim()) {
            nameInput.classList.add('input-error');
            nameError.classList.remove('hidden');
            return;
        }

        const payload = {
            name: nameInput.value.trim(),
            icon: selectedIcon,
            theme: selectedColor,
            initial: parseFloat(document.getElementById('initial').value),
            monthly: parseFloat(document.getElementById('monthly').value),
            annual_rate: parseFloat(document.getElementById('annual_rate').value),
            years: parseInt(document.getElementById('years').value)
        };

        confirmBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
        confirmBtn.disabled = true;

        try {
            const res = await API.createScenario(payload);
            if (res.ok) {
                modal.close();
                showToast("Scenario saved!");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast("Failed to save", "error");
            }
        } catch {
            showToast("Network error", "error");
        } finally {
            confirmBtn.innerHTML = 'Save Scenario';
            confirmBtn.disabled = false;
        }
    });
}

// --- 3. DELETE MODAL (For Recent Scenarios list) ---
function initHomeDeleteModal() {
    const modal = document.getElementById('delete_modal');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    let deleteId = null;

    if (!modal) return;

    // The Home page list uses the class .delete-btn
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteId = btn.dataset.id;
            modal.showModal();
        });
    });

    confirmBtn.addEventListener('click', async () => {
        if (!deleteId) return;
        confirmBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';

        try {
            const res = await API.deleteScenario(deleteId);
            if (res.ok) {
                modal.close();
                document.getElementById(`scenario-row-${deleteId}`).remove();
                showToast("Scenario deleted!");

                // Update badge count
                const rows = document.querySelectorAll('.scenario-row').length;
                const badge = document.getElementById('scenario-count-badge');
                if (badge) badge.textContent = `${rows} scenarios`;

                // FIX: Hide "View All" button if we are at 5 or fewer scenarios
                const viewAllContainer = document.getElementById('view-all-scenarios-container');
                if (viewAllContainer) {
                    if (rows <= 5) {
                        viewAllContainer.classList.add('hidden');
                    } else {
                        viewAllContainer.classList.remove('hidden');
                        document.getElementById('view-all-count').textContent = rows;
                    }
                }
            }
        } catch {
            showToast("Failed to delete", "error");
        } finally {
            confirmBtn.innerHTML = 'Yes, Delete';
            deleteId = null;
        }
    });
}