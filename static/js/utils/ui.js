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