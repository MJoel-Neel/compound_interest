document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    if (!form) return;

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

    // Handle Form Submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        let isValid = true;

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const confirm = document.getElementById("confirm-password");
        const terms = document.getElementById("terms");

        // Helper function to set/clear errors
        const setErr = (el, errId, condition) => {
            if (condition) { 
                el.classList.add("border-error"); 
                document.getElementById(errId).classList.remove("hidden"); 
                isValid = false; 
            } else { 
                el.classList.remove("border-error"); 
                document.getElementById(errId).classList.add("hidden"); 
            }
        };

        // Validate all fields
        setErr(name, "name-error", name.value.trim() === "");
        setErr(email, "email-error", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
        setErr(password, "password-error", password.value.length < 6);
        setErr(confirm, "confirm-error", confirm.value !== password.value || confirm.value === "");
        
        // Validate Terms Checkbox
        if (!terms.checked) { 
            document.getElementById("terms-error").classList.remove("hidden"); 
            isValid = false; 
        } else { 
            document.getElementById("terms-error").classList.add("hidden"); 
        }

        if (isValid) {
            const btn = document.getElementById("submit-btn");
            btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Creating...';
            btn.disabled = true;

            const formData = new FormData(form);

            try {
                const res = await fetch('/api/signup', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (res.ok && data.status === 'success') {
                    // Redirect to home page on success
                    window.location.href = "/"; 
                } else {
                    if (typeof showToast === 'function') showToast(data.message || "Signup failed", "error");
                    btn.innerHTML = 'Create Account';
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                if (typeof showToast === 'function') showToast("Network error. Please try again.", "error");
                btn.innerHTML = 'Create Account';
                btn.disabled = false;
            }
        }
    });
})