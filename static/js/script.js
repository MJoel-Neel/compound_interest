// static/js/script.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Theme
    initTheme();

    // 2. Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const appSidebar = document.getElementById('app-sidebar');

    if (mobileMenuBtn && appSidebar) {     
        mobileMenuBtn.addEventListener('click', () => {
            appSidebar.classList.toggle('-translate-x-full');
        });
    }
});