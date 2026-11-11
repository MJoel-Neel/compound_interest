// static/js/utils/ui.js

// ==========================================
// 1. TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
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

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ==========================================
// 2. GLOBAL THEME ENGINE
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    let activeTheme = theme;
    if (theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
}


// THE ONE AND ONLY CURRENCY FORMATTER
function formatCurrency(num) {
    if (num === null || num === undefined) return "€0";
    if (num >= 1e15) return "€" + (num / 1e15).toFixed(2) + "Q"; // Quadrillion
    if (num >= 1e12) return "€" + (num / 1e12).toFixed(2) + "T"; // Trillion
    if (num >= 1e9) return "€" + (num / 1e9).toFixed(2) + "B"; // Billion
    if (num >= 1e6) return "€" + (num / 1e6).toFixed(2) + "M"; // Million
    if (num >= 1e3) return "€" + (num / 1e3).toFixed(2) + "k"; // Thousand
    return "€" + Math.round(num).toLocaleString('en-US');
}

// THE ONE AND ONLY CHART AXIS FORMATTER
function formatChartAxis(val) {
    if (val >= 1e12) return '€' + (val / 1e12).toFixed(1) + 'T';
    if (val >= 1e9) return '€' + (val / 1e9).toFixed(1) + 'B';
    if (val >= 1e6) return '€' + (val / 1e6).toFixed(1) + 'M';
    if (val >= 1e3) return '€' + (val / 1e3).toFixed(1) + 'k';
    return '€' + val;
}