document.addEventListener("DOMContentLoaded", () => {
    initAdvancedSimulator();
});

// --- 1. HELPER: EXTRACT FORM DATA ---
function getPayload() {
    const inflationToggle = document.getElementById('adv-inflation-toggle');
    const taxSelect = document.getElementById('adv-tax-select').value;
    
    return {
        initial: parseFloat(document.getElementById('adv-initial').value) || 0,
        monthly: parseFloat(document.getElementById('adv-monthly').value) || 0,
        annual_rate: parseFloat(document.getElementById('adv-rate').value) || 0,
        years: parseInt(document.getElementById('adv-years').value) || 1,
        compounding_frequency: document.getElementById('adv-compounding').value,
        inflation_rate: inflationToggle.checked ? (parseFloat(document.getElementById('adv-inflation-rate').value) || 0) : 0,
        tax_rate: taxSelect === 'custom' ? (parseFloat(document.getElementById('adv-custom-tax').value) || 0) : parseFloat(taxSelect)
    };
}

// --- 2. INITIALIZATION & URL PARSING ---
function initAdvancedSimulator() {
    const form = document.getElementById('advanced-form');
    if (!form) return;

    // 1. Read URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('initial')) {
        document.getElementById('adv-initial').value = urlParams.get('initial') || 1000;
        document.getElementById('adv-monthly').value = urlParams.get('monthly') || 200;
        document.getElementById('adv-rate').value = urlParams.get('annual_rate') || 7;
        document.getElementById('adv-years').value = urlParams.get('years') || 20;
        
        if (urlParams.has('compounding')) {
            document.getElementById('adv-compounding').value = urlParams.get('compounding');
        }

        // Handle Inflation
        const inflation = parseFloat(urlParams.get('inflation')) || 0;
        if (inflation > 0) {
            document.getElementById('adv-inflation-toggle').checked = true;
            document.getElementById('inflation-input-container').classList.remove('hidden');
            document.getElementById('adv-inflation-rate').value = inflation;
        }

        // Handle Tax
        const tax = parseFloat(urlParams.get('tax')) || 0;
        if (tax === 0) {
            document.getElementById('adv-tax-select').value = '0';
        } else if (tax === 30) {
            document.getElementById('adv-tax-select').value = '30';
        } else {
            document.getElementById('adv-tax-select').value = 'custom';
            document.getElementById('custom-tax-container').classList.remove('hidden');
            document.getElementById('adv-custom-tax').value = tax;
        }
    }

    // 2. Run Simulation Immediately
    runAdvancedSimulation();

    // 3. Handle Form Events
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        runAdvancedSimulation();
    });

    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.getElementById('inflation-input-container').classList.add('hidden');
            document.getElementById('custom-tax-container').classList.add('hidden');
            document.getElementById('adv-inflation-toggle').checked = false;
            runAdvancedSimulation();
        }, 10);
    });

    // 4. Initialize the Save Modal
    initAdvancedSaveModal();
}

// --- 3. RUN SIMULATION ---
async function runAdvancedSimulation() {
    const submitBtn = document.querySelector('#advanced-form button[type="submit"]');
    if(!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Calculating...';
    submitBtn.disabled = true;

    const payload = getPayload();

    try {
        const data = await API.simulate(payload);
        
        updateKPIs(data.kpis, payload);
        Charts.renderLineChart('advanced-chart', data.chart.labels, data.chart.balance_data, data.chart.invested_data);
        renderTable(data.table, payload);
        updateInsights(data.kpis, payload);

    } catch (err) {
        console.error("Simulation failed:", err);
        if (typeof showToast === 'function') showToast("Failed to run simulation.", "error");
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// --- 4. UPDATE UI KPI CARDS ---
function updateKPIs(kpis, payload) {
    const fmt = (num) => "€" + Math.round(num).toLocaleString('en-US');

    document.getElementById('res-final').textContent = fmt(kpis.net_balance);
    
    const growthPercent = payload.initial > 0 
        ? (((kpis.net_balance - kpis.total_invested) / kpis.total_invested) * 100).toFixed(1) 
        : 0;
    document.getElementById('res-growth-percent').innerHTML = `↑ ${growthPercent}%`;

    document.getElementById('res-invested').textContent = fmt(kpis.total_invested);

    document.getElementById('res-gains').textContent = fmt(kpis.gross_gains);
    
    const taxNote = document.getElementById('res-tax-note');
    if (payload.tax_rate > 0) {
        taxNote.innerHTML = `<span class="text-error">-${fmt(kpis.tax_owed)} in taxes</span>`;
    } else {
        taxNote.innerHTML = "Tax-free projection";
    }

    document.getElementById('res-cagr').textContent = `${kpis.cagr}%`;
}

// --- 5. RENDER DYNAMIC TABLE ---
function renderTable(tableData, payload) {
    const tbody = document.getElementById('adv-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = ''; 
    const fmt = (num) => "€" + Math.round(num).toLocaleString('en-US');

    tableData.forEach(row => {
        const cumulativeContributions = payload.initial + (payload.monthly * 12 * row.year);
        const gainsSoFar = row.end_balance - cumulativeContributions;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-bold">${row.year}</td>
            <td>${fmt(row.end_balance)}</td>
            <td>${fmt(cumulativeContributions)}</td>
            <td class="text-success font-semibold">+${fmt(gainsSoFar)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 6. UPDATE INSIGHTS ---
function updateInsights(kpis, payload) {
    const fmt = (num) => "€" + Math.round(num).toLocaleString('en-US');
    
    const insight1 = document.getElementById('insight-1');
    const insight2 = document.getElementById('insight-2');
    const insight3 = document.getElementById('insight-3');

    if(!insight1) return; 

    insight1.innerHTML = `Your investment could grow to <strong>${fmt(kpis.net_balance)}</strong> over ${payload.years} years, assuming a ${payload.annual_rate}% annual return.`;

    insight2.innerHTML = `That's a total gain of <strong>${fmt(kpis.gross_gains)}</strong>. Your money earned ${((kpis.gross_gains / kpis.total_invested) * 100).toFixed(1)}% more than you put in.`;

    if (payload.inflation_rate > 0) {
        insight3.innerHTML = `After adjusting for <strong>${payload.inflation_rate}% inflation</strong>, your final balance has the purchasing power of <strong>${fmt(kpis.real_net_balance)}</strong> in today's money.`;
    } else if (payload.tax_rate > 0) {
        insight3.innerHTML = `A tax rate of <strong>${payload.tax_rate}%</strong> will reduce your gross gains, leaving you with a net balance of ${fmt(kpis.net_balance)}.`;
    } else {
        insight3.innerHTML = `You selected <strong>no taxes</strong> and <strong>no inflation</strong>. This represents an ideal, theoretical growth scenario.`;
    }
}

// --- 7. SAVE MODAL LOGIC ---
function initAdvancedSaveModal() {
    const openBtn = document.getElementById('adv-save-btn');
    const modal = document.getElementById('save_scenario_modal');
    const form = document.getElementById('save-scenario-form');
    const nameInput = document.getElementById('scenario-name-input');
    const nameError = document.getElementById('name-error');
    const confirmBtn = document.getElementById('confirm-save-btn');

    if (!openBtn || !modal) return;

    let selectedIcon = "fa-arrow-trend-up";
    let selectedColor = "success";

    // Icon selection
    document.querySelectorAll('.icon-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.icon-option').forEach(o => o.className = 'icon-option flex items-center justify-center p-3 rounded-lg border-2 border-base-200 text-base-content/60 hover:bg-base-200 cursor-pointer transition-all');
            opt.className = 'icon-option flex items-center justify-center p-3 rounded-lg border-2 border-primary bg-primary/10 text-primary cursor-pointer transition-all';
            selectedIcon = opt.dataset.value;
        });
    });

    // Color selection
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.className = 'color-option flex items-center justify-center p-3 rounded-lg border-2 border-base-200 hover:bg-base-200 cursor-pointer transition-all');
            const color = opt.dataset.value;
            opt.className = `color-option flex items-center justify-center p-3 rounded-lg border-2 border-${color} bg-${color}/10 cursor-pointer transition-all`;
            selectedColor = color;
        });
    });

    // Open Modal
    openBtn.addEventListener('click', () => {
        form.reset();
        nameError.classList.add('hidden');
        modal.showModal();
    });

    // Submit Save
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!nameInput.value.trim()) {
            nameInput.classList.add('input-error');
            nameError.classList.remove('hidden');
            return;
        }

        const payload = getPayload(); 
        payload.name = nameInput.value.trim();
        payload.icon = selectedIcon;
        payload.theme = selectedColor;

        confirmBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
        confirmBtn.disabled = true;

        try {
            const res = await API.createScenario(payload);
            if (res.ok) {
                modal.close();
                if (typeof showToast === 'function') showToast("Advanced scenario saved!");
                setTimeout(() => window.location.href = "/scenarios", 1000);
            } else {
                if (typeof showToast === 'function') showToast("Failed to save", "error");
            }
        } catch {
            if (typeof showToast === 'function') showToast("Network error", "error");
        } finally {
            confirmBtn.innerHTML = 'Save Scenario';
            confirmBtn.disabled = false;
        }
    });
}