document.addEventListener("DOMContentLoaded", () => {
    initFormValidation();
    initDeleteModal();
    initSaveModal();
    initSimulatorChart(); 
});

// Global variable to hold the chart instance
let simChartInstance = null;

// ==========================================
// 1. PRO TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg mb-2 raleway-500`;

    let icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-circle-exclamation"></i>';
    if (type === 'info') icon = '<i class="fa-solid fa-circle-info"></i>';

    toast.innerHTML = `
        <div class="flex items-center gap-2">
            ${icon}
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ==========================================
// 2. SIMULATION LOGIC & CHART.JS
// ==========================================
function initSimulatorChart() {
    const form = document.getElementById('simulator-form');
    if (!form) return;

    // Run simulation immediately on page load so the chart isn't empty
    runSimulation();

    // Intercept form submit to use AJAX instead of page reload
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload
        
        // Check if inputs are valid before running
        if (validateForm()) {
            runSimulation();
        }
    });
}

async function runSimulation() {
    const btn = document.querySelector('#simulator-form button[type="submit"]');
    const originalBtnHTML = btn.innerHTML;
    
    // Show loading state
    btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Simulating...';
    btn.disabled = true;

    const payload = {
        initial: parseFloat(document.getElementById('initial').value),
        monthly: parseFloat(document.getElementById('monthly').value),
        annual_rate: parseFloat(document.getElementById('annual_rate').value),
        years: parseInt(document.getElementById('years').value)
    };

    try {
        const res = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();

        // 1. Update the Bilan Numbers dynamically
        const formatEuro = (num) => "€" + Math.round(num).toLocaleString('en-US');
        document.getElementById('final-balance-val').textContent = formatEuro(data.final_balance);
        document.getElementById('total-invested-val').textContent = formatEuro(data.total_invested);
        document.getElementById('gains-val').textContent = formatEuro(data.gains);

        // 2. Render the Chart
        renderSimulatorChart(data.chart);

    } catch (err) {
        console.error(err);
        showToast("Failed to run simulation.", "error");
    } finally {
        btn.innerHTML = originalBtnHTML;
        btn.disabled = false;
    }
}

function renderSimulatorChart(chartData) {
    const canvas = document.getElementById('simulator-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    // Destroy old chart to prevent memory leaks and overlapping drawing
    if (simChartInstance) {
        simChartInstance.destroy();
    }

    const successColor = '#22c55e'; // DaisyUI success (green)
    const primaryColor = '#3b82f6'; // DaisyUI primary (blue)

    simChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Total Balance',
                    data: chartData.balance_data,
                    borderColor: successColor,
                    backgroundColor: successColor + '20', // Transparent fill
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4, // Smooth curve
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Amount Invested',
                    data: chartData.invested_data,
                    borderColor: primaryColor,
                    borderWidth: 2,
                    borderDash: [5, 5], // Dashed line
                    fill: false,
                    tension: 0, // Straight line
                    pointRadius: 0,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false }, // Custom legend is in HTML
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': €' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) return '€' + (value / 1000000) + 'M';
                            if (value >= 1000) return '€' + (value / 1000) + 'k';
                            return '€' + value;
                        }
                    }
                },
                x: {
                    title: { display: true, text: 'Years' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}

// ==========================================
// 3. FORM VALIDATION HELPERS
// ==========================================
function initFormValidation() {
    const simulatorForm = document.getElementById('simulator-form');
    if (!simulatorForm) return;

    // Clear error state when the user types
    const inputs = simulatorForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            const inputWrapper = input.closest('.input');
            const errorMsg = inputWrapper.nextElementSibling;

            if (input.checkValidity()) {
                inputWrapper.classList.remove('input-error');
                if (errorMsg) errorMsg.classList.add('hidden');
            }
        });
    });
}

// Returns true if valid, false if invalid
function validateForm() {
    const simulatorForm = document.getElementById('simulator-form');
    let isValid = true;
    const inputs = simulatorForm.querySelectorAll('input[type="number"]');

    inputs.forEach(input => {
        const inputWrapper = input.closest('.input');
        const errorMsg = inputWrapper.nextElementSibling;

        if (!input.checkValidity()) {
            isValid = false;
            inputWrapper.classList.add('input-error');
            if (errorMsg) errorMsg.classList.remove('hidden');
        } else {
            inputWrapper.classList.remove('input-error');
            if (errorMsg) errorMsg.classList.add('hidden');
        }
    });

    if (!isValid) {
        showToast("Please fill out all fields correctly.", "error");
    }
    
    return isValid;
}

// ==========================================
// 4. DELETE MODAL & API LOGIC
// ==========================================
function initDeleteModal() {
    const scenarioList = document.getElementById('simulator-scenarios-list');
    const deleteModal = document.getElementById('delete_modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    let scenarioToDeleteId = null;

    if (!scenarioList || !deleteModal || !confirmDeleteBtn) return;

    scenarioList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            scenarioToDeleteId = deleteBtn.dataset.id;
            deleteModal.showModal();
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!scenarioToDeleteId) return;

        const originalBtnText = confirmDeleteBtn.innerHTML;
        confirmDeleteBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Deleting...';
        confirmDeleteBtn.disabled = true;

        try {
            const response = await fetch(`/api/scenarios/${scenarioToDeleteId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                removeScenarioRow(scenarioToDeleteId);
                showToast("Scenario deleted successfully!", "success");
            } else {
                showToast("Failed to delete. Server error.", "error");
            }
        } catch (error) {
            console.error("Network Error:", error);
            showToast("Network error. Could not connect to server.", "error");
        } finally {
            deleteModal.close();
            confirmDeleteBtn.innerHTML = originalBtnText;
            confirmDeleteBtn.disabled = false;
            scenarioToDeleteId = null;
        }
    });
}

// ==========================================
// 5. SAVE SCENARIO MODAL
// ==========================================
function initSaveModal() {
    const openBtn = document.getElementById('open-save-modal-btn');
    const modal = document.getElementById('save_scenario_modal');
    const form = document.getElementById('save-scenario-form');
    const nameInput = document.getElementById('scenario-name-input');
    const nameError = document.getElementById('name-error');
    const confirmBtn = document.getElementById('confirm-save-btn');

    if (!openBtn || !modal || !form) return;

    // --- Icon Selection Logic ---
    const iconOptions = document.querySelectorAll('.icon-option');
    const iconInput = document.getElementById('selected-icon');

    iconOptions.forEach(option => {
        option.addEventListener('click', () => {
            iconOptions.forEach(opt => {
                opt.className = 'icon-option flex items-center justify-center p-3 rounded-lg border-2 border-base-200 text-base-content/60 hover:bg-base-200 cursor-pointer transition-all';
            });
            option.className = 'icon-option flex items-center justify-center p-3 rounded-lg border-2 border-primary bg-primary/10 text-primary cursor-pointer transition-all';
            iconInput.value = option.dataset.value;
        });
    });

    // --- Color Selection Logic ---
    const colorOptions = document.querySelectorAll('.color-option');
    const colorInput = document.getElementById('selected-color');

    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => {
                opt.className = 'color-option flex items-center justify-center p-3 rounded-lg border-2 border-base-200 hover:bg-base-200 cursor-pointer transition-all';
            });
            const color = option.dataset.value;
            option.className = `color-option flex items-center justify-center p-3 rounded-lg border-2 border-${color} bg-${color}/10 cursor-pointer transition-all`;
            colorInput.value = color;
        });
    });

    // Open Modal
    openBtn.addEventListener('click', () => {
        form.reset();
        nameError.classList.add('hidden');
        nameInput.classList.remove('input-error');
        modal.showModal();
    });

    // Handle Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameValue = nameInput.value.trim();
        if (!nameValue) {
            nameInput.classList.add('input-error');
            nameError.classList.remove('hidden');
            return;
        }

        const payload = {
            name: nameValue,
            icon: document.getElementById('selected-icon').value,
            theme: document.getElementById('selected-color').value,
            initial: parseFloat(document.getElementById('initial').value),
            monthly: parseFloat(document.getElementById('monthly').value),
            annual_rate: parseFloat(document.getElementById('annual_rate').value),
            years: parseInt(document.getElementById('years').value)
        };

        const originalBtnText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Saving...';
        confirmBtn.disabled = true;

        try {
            const response = await fetch('/api/scenarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                modal.close();
                showToast("Scenario saved successfully!", "success");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast("Failed to save. Server error.", "error");
            }
        } catch (error) {
            console.error("Network Error:", error);
            showToast("Network error. Could not save.", "error");
        } finally {
            confirmBtn.innerHTML = originalBtnText;
            confirmBtn.disabled = false;
        }
    });
}

// ==========================================
// 6. DOM MANIPULATION HELPERS
// ==========================================
function removeScenarioRow(id) {
    const rowToRemove = document.getElementById(`scenario-row-${id}`);
    if (!rowToRemove) return;

    rowToRemove.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    rowToRemove.style.opacity = '0';
    rowToRemove.style.transform = 'translateX(20px)';

    setTimeout(() => {
        rowToRemove.remove();
        updateScenarioCount();
    }, 300);
}

function updateScenarioCount() {
    const badge = document.getElementById('scenario-count-badge');
    const viewAllContainer = document.getElementById('view-all-scenarios-container');
    const viewAllBtn = document.getElementById('view-all-scenarios-btn');
    const viewAllCountSpan = document.getElementById('view-all-count');
    
    // Count the remaining rows on the screen
    const remainingRows = document.querySelectorAll('.scenario-row').length;

    // 1. Update the Badge (e.g., "5 scenarios")
    if (badge) {
        badge.textContent = `${remainingRows} scenario${remainingRows !== 1 ? 's' : ''}`;
    }

    // 2. Update the "View All" button
    if (viewAllContainer && viewAllBtn && viewAllCountSpan) {
        if (remainingRows > 5) {
            // If more than 5, show the button and update the number
            viewAllContainer.classList.remove('hidden');
            viewAllCountSpan.textContent = remainingRows;
        } else {
            // If 5 or fewer, hide the button completely
            viewAllContainer.classList.add('hidden');
        }
    }
}