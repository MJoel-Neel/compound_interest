// static/js/pages/signup.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    if (!form) return;

    // Toggle passwords
    document.querySelectorAll(".toggle-password").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            const type = input.getAttribute("type") === "password" ? "text" : "password";
            input.setAttribute("type", type);
            const icon = btn.querySelector("i");
            icon.className = type === "password" ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let isValid = true;

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const confirm = document.getElementById("confirm-password");
        const terms = document.getElementById("terms");

        const setErr = (el, errId, cond) => {
            if (cond) { el.classList.add("border-error"); document.getElementById(errId).classList.remove("hidden"); isValid = false; }
            else { el.classList.remove("border-error"); document.getElementById(errId).classList.add("hidden"); }
        };

        setErr(name, "name-error", name.value.trim() === "");
        setErr(email, "email-error", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
        setErr(password, "password-error", password.value.length < 6);
        setErr(confirm, "confirm-error", confirm.value !== password.value || confirm.value === "");
        
        if (!terms.checked) { document.getElementById("terms-error").classList.remove("hidden"); isValid = false; }
        else { document.getElementById("terms-error").classList.add("hidden"); }

        if (isValid) {
            const btn = document.getElementById("submit-btn");
            btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Creating...';
            btn.disabled = true;
            setTimeout(() => window.location.href = "/", 1000); 
        }
    });
})