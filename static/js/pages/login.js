document.addEventListener("DOMContentLoaded", () => {
    initLoginForm();
    initForgotPassword();
});

// --- 1. LOGIN FORM LOGIC ---
function initLoginForm() {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const toggleBtn = document.getElementById("toggle-password");
    const submitBtn = document.getElementById("submit-btn");

    if (!form) return;

    // Toggle Password Visibility
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            
            const icon = toggleBtn.querySelector("i");
            if (type === "password") {
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            } else {
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            }
        });
    }

    // Handle Form Submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        let isValid = true;
        const emailError = document.getElementById("email-error");
        const passwordError = document.getElementById("password-error");

        // Reset previous errors
        emailInput.classList.remove("border-error");
        passwordInput.classList.remove("border-error");
        emailError.classList.add("hidden");
        passwordError.classList.add("hidden");

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            isValid = false;
            emailInput.classList.add("border-error");
            emailError.classList.remove("hidden");
        }

        // Validate Password
        if (passwordInput.value.length < 6) {
            isValid = false;
            passwordInput.classList.add("border-error");
            passwordError.classList.remove("hidden");
        }

        if (isValid) {
            // Show loading state
            submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Signing in...';
            submitBtn.disabled = true;

            const formData = new FormData(form);

            try {
                const res = await fetch('/api/login', { 
                    method: 'POST', 
                    body: formData 
                });
                const data = await res.json();

                if (res.ok && data.status === 'success') {
                    // Reload page so FastAPI/Jinja2 can render the logged-in state
                    window.location.reload(); 
                } else {
                    if (typeof showToast === 'function') showToast(data.message || "Login failed", "error");
                    submitBtn.innerHTML = 'Sign In';
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                if (typeof showToast === 'function') showToast("Network error. Please try again.", "error");
                submitBtn.innerHTML = 'Sign In';
                submitBtn.disabled = false;
            }
        }
    });

    // Clear errors on typing
    emailInput.addEventListener("input", () => {
        emailInput.classList.remove("border-error");
        document.getElementById("email-error").classList.add("hidden");
    });
    passwordInput.addEventListener("input", () => {
        passwordInput.classList.remove("border-error");
        document.getElementById("password-error").classList.add("hidden");
    });
}

// --- 2. FORGOT PASSWORD LOGIC ---
function initForgotPassword() {
    const form = document.getElementById("forgot-form");
    const emailInput = document.getElementById("forgot-email");
    const error = document.getElementById("forgot-error");
    const modal = document.getElementById("forgot_modal");
    const btn = document.getElementById("forgot-submit-btn");

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

        btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Sending...';
        btn.disabled = true;
        
        try {
            const res = await fetch('/api/forgot-password', { 
                method: 'POST', 
                body: new FormData(form) 
            });
            
            if (res.ok) {
                // Transform modal into success state
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
            if (typeof showToast === 'function') showToast("Network error.", "error");
            btn.innerHTML = "Send Reset Link";
            btn.disabled = false;
        }
    });
}