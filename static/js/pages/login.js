document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const toggleBtn = document.getElementById("toggle-password");
    const submitBtn = document.getElementById("submit-btn");

    // 1. Toggle Password Visibility
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

    // 2. Form Validation & Submit
    form.addEventListener("submit", (e) => {
        e.preventDefault(); 

        let isValid = true;
        const emailError = document.getElementById("email-error");
        const passwordError = document.getElementById("password-error");

        // Reset errors
        emailInput.classList.remove("border-error", "focus:border-error", "focus:ring-error");
        passwordInput.classList.remove("border-error", "focus:border-error", "focus:ring-error");
        emailError.classList.add("hidden");
        passwordError.classList.add("hidden");

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            isValid = false;
            emailInput.classList.add("border-error", "focus:border-error", "focus:ring-error");
            emailError.classList.remove("hidden");
        }

        // Password Validation
        if (passwordInput.value.length < 6) {
            isValid = false;
            passwordInput.classList.add("border-error", "focus:border-error", "focus:ring-error");
            passwordError.classList.remove("hidden");
        }

        // Submit if valid
        if (isValid) {
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Signing in...';
            submitBtn.disabled = true;

            // Simulate network request (replace with actual fetch to FastAPI later)
            setTimeout(() => {
                window.location.href = "/"; 
            }, 1000);
        }
    });

    // 3. Clear errors on typing
    emailInput.addEventListener("input", () => {
        emailInput.classList.remove("border-error", "focus:border-error", "focus:ring-error");
        document.getElementById("email-error").classList.add("hidden");
    });

    passwordInput.addEventListener("input", () => {
        passwordInput.classList.remove("border-error", "focus:border-error", "focus:ring-error");
        document.getElementById("password-error").classList.add("hidden");
    });
});





    // ==========================================
    // FORGOT PASSWORD LOGIC
    // ==========================================
    const forgotForm = document.getElementById("forgot-form");
    const forgotEmail = document.getElementById("forgot-email");
    const forgotError = document.getElementById("forgot-error");
    const forgotModal = document.getElementById("forgot_modal");

    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(forgotEmail.value.trim())) {
                forgotEmail.classList.add("border-error", "focus:border-error", "focus:ring-error");
                forgotError.classList.remove("hidden");
                return;
            }

            forgotEmail.classList.remove("border-error", "focus:border-error", "focus:ring-error");
            forgotError.classList.add("hidden");

            const btn = document.getElementById("forgot-submit-btn");
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Sending...';
            btn.disabled = true;

            try {
                const formData = new FormData(forgotForm);
                const res = await fetch('/api/forgot-password', { 
                    method: 'POST', 
                    body: formData 
                });
                
                if (res.ok) {
                    // Change modal content to success state
                    forgotModal.querySelector('.modal-box').innerHTML = `
                        <div class="text-center py-6">
                            <div class="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fa-solid fa-paper-plane text-2xl"></i>
                            </div>
                            <h3 class="font-bold text-2xl raleway-700 text-[#0f172a] mb-2">Check your email</h3>
                            <p class="text-sm text-slate-500 mb-6">We've sent a password reset link to <br><strong>${forgotEmail.value}</strong></p>
                            <form method="dialog">
                                <button class="btn bg-[#0f172a] text-white w-full rounded-lg">Back to Login</button>
                            </form>
                        </div>
                    `;
                } else {
                    alert("Something went wrong. Please try again.");
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert("Network error.");
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        // Clear error when typing
        forgotEmail.addEventListener("input", () => {
            forgotEmail.classList.remove("border-error", "focus:border-error", "focus:ring-error");
            forgotError.classList.add("hidden");
        });
    }