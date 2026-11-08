document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const appSidebar = document.getElementById('app-sidebar');

    if (mobileMenuBtn && appSidebar) {     
        mobileMenuBtn.addEventListener('click', () => {
            appSidebar.classList.toggle('-translate-x-full');
        });
    }
});