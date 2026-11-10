document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initAuthForms();
});

// ==========================================
// 1. MOBILE SIDEBAR LOGIC
// ==========================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const appSidebar = document.getElementById('app-sidebar');

    if (mobileMenuBtn && appSidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            appSidebar.classList.toggle('-translate-x-full');
        });
    }
}

// ==========================================
// 2. AUTHENTICATION LOGIC
// ==========================================
function toggleAuthMode(mode) {
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form'); // NEW

    if (!title || !loginForm || !signupForm || !forgotForm) return;

    // Hide all forms first
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    forgotForm.classList.add('hidden');

    if (mode === 'signup') {
        title.textContent = "Create your account";
        subtitle.textContent = "Join What If I Invest? today";
        signupForm.classList.remove('hidden');
    } else if (mode === 'forgot') {
        title.textContent = "Reset Password";
        subtitle.textContent = "We'll help you get back in.";
        forgotForm.classList.remove('hidden');
    } else {
        title.textContent = "Welcome back!";
        subtitle.textContent = "Sign in to continue to What If I Invest?";
        loginForm.classList.remove('hidden');
    }
}

function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form'); // NEW
    const modal = document.getElementById('auth_modal');

    if (!loginForm || !signupForm) return;

    // --- HANDLE FORGOT PASSWORD ---
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = forgotForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Sending...';
            
            const formData = new FormData(forgotForm);

            try {
                const res = await fetch('/api/forgot-password', { method: 'POST', body: formData });
                const data = await res.json();
                
                if (res.ok) {
                    showToast("Reset link sent! Check your inbox.", "success");
                    toggleAuthMode('login'); // Go back to login
                    forgotForm.reset();
                } else {
                    showToast(data.message || "Error sending link", "error");
                }
            } catch (err) {
                showToast("Network error.", "error");
            } finally {
                btn.innerHTML = originalText;
            }
        });
    }

    // ... (Keep your existing loginForm and signupForm submit listeners here) ...

    // Reset modal to default state when closed
    if (modal) {
        modal.addEventListener('close', () => {
            loginForm.reset();
            signupForm.reset();
            if (forgotForm) forgotForm.reset();
            toggleAuthMode('login');
        });
    }
}

// ==========================================
// 3. PRO TOAST NOTIFICATION SYSTEM
// ==========================================
// This handles the "Invalid password" or "Network error" messages
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