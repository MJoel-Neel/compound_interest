document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");

    // Inputs
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirm-password");
    const termsCheck = document.getElementById("terms");
    const submitBtn = document.getElementById("submit-btn");

    // Toggle Password Visibility (for both password fields)
    document.querySelectorAll(".toggle-password").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            const type = input.getAttribute("type") === "password" ? "text" : "password";
            input.setAttribute("type", type);

            const icon = btn.querySelector("i");
            if (type === "password") {
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            } else {
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            }
        });
    });

    // Form Validation & Submit
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let isValid = true;

        // Helper to toggle error states
        const setError = (input, errorId, show) => {
            const errorEl = document.getElementById(errorId);
            if (show) {
                input.classList.add("border-error", "focus:border-error", "focus:ring-error");
                errorEl.classList.remove("hidden");
                isValid = false;
            } else {
                input.classList.remove("border-error", "focus:border-error", "focus:ring-error");
                errorEl.classList.add("hidden");
            }
        };

        // 1. Name Validation
        setError(nameInput, "name-error", nameInput.value.trim() === "");

        // 2. Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setError(emailInput, "email-error", !emailRegex.test(emailInput.value.trim()));

        // 3. Password Validation (Min 6 chars)
        setError(passwordInput, "password-error", passwordInput.value.length < 6);

        // 4. Confirm Password Validation
        setError(confirmInput, "confirm-error", confirmInput.value !== passwordInput.value || confirmInput.value === "");

        // 5. Terms Validation
        if (!termsCheck.checked) {
            document.getElementById("terms-error").classList.remove("hidden");
            isValid = false;
        } else {
            document.getElementById("terms-error").classList.add("hidden");
        }

        // Submit if valid
        if (isValid) {
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Creating...';
            submitBtn.disabled = true;

            // Simulate network request (replace with actual fetch to FastAPI later)
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        }
    });

    // Clear errors on input
    const clearErrorOnInput = (input, errorId) => {
        input.addEventListener("input", () => {
            input.classList.remove("border-error", "focus:border-error", "focus:ring-error");
            document.getElementById(errorId).classList.add("hidden");
        });
    };

    clearErrorOnInput(nameInput, "name-error");
    clearErrorOnInput(emailInput, "email-error");
    clearErrorOnInput(passwordInput, "password-error");
    clearErrorOnInput(confirmInput, "confirm-error");

    termsCheck.addEventListener("change", () => {
        if (termsCheck.checked) document.getElementById("terms-error").classList.add("hidden");
    });
});