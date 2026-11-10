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