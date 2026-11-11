// static/js/pages/login.js

document.addEventListener("DOMContentLoaded", () => {
    initLoginForm();
    initForgotPassword();
});

function initLoginForm() {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const toggleBtn = document.getElementById("toggle-password");
    const submitBtn = document.getElementById("submit-btn");

    if (!form) return;

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            const icon = toggleBtn.querySelector("i");
            icon.className = type === "password" ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        let isValid = true;
        const emailError = document.getElementById("email-error");
        const passwordError = document.getElementById("password-error");

        emailInput.classList.remove("border-error");
        passwordInput.classList.remove("border-error");
        emailError.classList.add("hidden");
        passwordError.classList.add("hidden");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            isValid = false;
            emailInput.classList.add("border-error");
            emailError.classList.remove("hidden");
        }

        if (passwordInput.value.length < 6) {
            isValid = false;
            passwordInput.classList.add("border-error");
            passwordError.classList.remove("hidden");
        }

        if (isValid) {
            submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Signing in...';
            submitBtn.disabled = true;
            // Simulate API Call for now
            setTimeout(() => window.location.href = "/", 1000); 
        }
    });
}

function initForgotPassword() {
    const form = document.getElementById("forgot-form");
    const emailInput = document.getElementById("forgot-email");
    const error = document.getElementById("forgot-error");
    const modal = document.getElementById("forgot_modal");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(emailInput.value.trim())) {
            emailInput.classList.add("border-error");
            error.classList.remove("hidden");
            return;
        }
        
        emailInput.classList.remove("border-error");
        error.classList.add("hidden");

        const btn = document.getElementById("forgot-submit-btn");
        btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Sending...';
        
        try {
            const res = await API.forgotPassword(new FormData(form));
            if (res.ok) {
                modal.querySelector('.modal-box').innerHTML = `
                    <div class="text-center py-6">
                        <div class="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fa-solid fa-paper-plane text-2xl"></i>
                        </div>
                        <h3 class="font-bold text-2xl raleway-700 text-base-content mb-2">Check your email</h3>
                        <p class="text-sm text-base-content/70 mb-6">We've sent a reset link to <br><strong>${emailInput.value}</strong></p>
                        <form method="dialog"><button class="btn btn-primary w-full">Back to Login</button></form>
                    </div>`;
            }
        } catch (err) {
            showToast("Network error", "error");
            btn.innerHTML = "Send Reset Link";
        }
    });
}