document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Theme Immediately
    initTheme();

    // Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const appSidebar = document.getElementById('app-sidebar');

    if (mobileMenuBtn && appSidebar) {     
        mobileMenuBtn.addEventListener('click', () => {
            appSidebar.classList.toggle('-translate-x-full');
        });
    }
});

// Global Toast Notifications (Used in Simulator & Scenarios)
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
// THEME ENGINE (GLOBAL)
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    let activeTheme = theme;
    
    // Handle "System" preference
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = isDark ? 'dark' : 'light';
    }

    // Set DaisyUI theme on the <html> tag
    document.documentElement.setAttribute('data-theme', activeTheme);
}