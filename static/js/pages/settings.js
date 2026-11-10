document.addEventListener("DOMContentLoaded", () => {
    // 1. On page load, check what theme is saved and highlight the correct box
    syncThemeUI();

    // 2. Load Select Preferences (Currency & Time Range)
    loadPreferences();

    initDeleteAccountModal();

    initEditProfileModal();


});

// ==========================================
// 1. THEME SWITCHER LOGIC
// ==========================================
function changeTheme(theme) {
    // 1. Save the user's choice
    localStorage.setItem('app-theme', theme);

    // 2. Apply the theme using the global function
    if (typeof applyTheme === 'function') {
        applyTheme(theme);
    }

    // 3. Update the visual boxes
    syncThemeUI();

    // 4. Send to backend
    updateSetting('theme', theme);
}

function syncThemeUI() {
    const currentPreference = localStorage.getItem('app-theme') || 'light';
    const themes = ['light', 'dark', 'system'];

    themes.forEach(t => {
        const label = document.getElementById(`label-theme-${t}`);
        const check = document.getElementById(`check-theme-${t}`);

        // Safety check: If HTML is missing, stop here so JS doesn't crash
        if (!label || !check) return;

        const icon = label.querySelector('i:first-child');
        const span = label.querySelector('span');

        // Safety check: If span or icon is missing, stop here
        if (!icon || !span) return;

        // Reset all boxes to "unselected" state
        label.className = 'cursor-pointer border border-base-200 hover:border-base-300 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center gap-2 relative transition-all';
        check.classList.add('hidden');
        icon.className = 'text-base-content/60 text-lg transition-colors fa-solid ' + (t === 'light' ? 'fa-sun' : t === 'dark' ? 'fa-moon' : 'fa-desktop');
        span.className = 'raleway-500 text-xs text-base-content/60 transition-colors';
    });

    // Highlight the active one
    const activeLabel = document.getElementById(`label-theme-${currentPreference}`);
    if (activeLabel) {
        const activeCheck = document.getElementById(`check-theme-${currentPreference}`);
        const activeIcon = activeLabel.querySelector('i:first-child');
        const activeSpan = activeLabel.querySelector('span');

        if (activeCheck && activeIcon && activeSpan) {
            activeLabel.className = 'cursor-pointer border border-success bg-success/5 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center gap-2 relative transition-all shadow-sm';
            activeCheck.classList.remove('hidden');
            activeIcon.className = 'text-success text-lg transition-colors fa-solid ' + (currentPreference === 'light' ? 'fa-sun' : currentPreference === 'dark' ? 'fa-moon' : 'fa-desktop');
            activeSpan.className = 'raleway-500 text-xs text-success transition-colors';
        }
    }
}

// ==========================================
// 2. PREFERENCE SELECTORS (Currency, Time, Notifications)
// ==========================================
function loadPreferences() {
    // --- Load Currency (Validated) ---
    const validCurrencies = ['EUR', 'USD', 'GBP'];
    let savedCurrency = localStorage.getItem('pref-currency');
    if (!validCurrencies.includes(savedCurrency)) {
        savedCurrency = 'EUR';
        localStorage.setItem('pref-currency', 'EUR');
    }
    const currencySelect = document.getElementById('pref-currency');
    if (currencySelect) currencySelect.value = savedCurrency;

    // --- Load Time Range (Validated) ---
    const validRanges = ['10', '20', '30'];
    let savedTimeRange = localStorage.getItem('pref-time-range');
    if (!validRanges.includes(savedTimeRange)) {
        savedTimeRange = '20';
        localStorage.setItem('pref-time-range', '20');
    }
    const timeSelect = document.getElementById('pref-time-range');
    if (timeSelect) timeSelect.value = savedTimeRange;

    // --- Load Notification Toggles ---
    // If localStorage is null (first visit), default to true (checked)
    const toggleAlerts = document.getElementById('toggle-portfolio-alerts');
    if (toggleAlerts) toggleAlerts.checked = localStorage.getItem('pref-portfolio-alerts') !== 'false';

    const toggleMarket = document.getElementById('toggle-market-updates');
    if (toggleMarket) toggleMarket.checked = localStorage.getItem('pref-market-updates') !== 'false';

    const toggleProduct = document.getElementById('toggle-product-updates');
    if (toggleProduct) toggleProduct.checked = localStorage.getItem('pref-product-updates') !== 'false';
}



// ==========================================
// 3. API SETTINGS LOGIC (Toggles & Backend Sync)
// ==========================================
async function updateSetting(settingName, value) {
    // 1. Save ALL preferences to localStorage for instant UI persistence
    // This automatically converts 'time_range' to 'pref-time-range'
    localStorage.setItem(`pref-${settingName.replace('_', '-')}`, value);

    // 2. Send to backend
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setting: settingName, value: value })
        });

        if (response.ok) {
            console.log(`Saved to backend: ${settingName} = ${value}`);
            // Optional: Show a toast if you have the global function available
            if (typeof showToast === 'function') {
                showToast("Preference saved!");
            }
        }
    } catch (error) {
        console.error("Failed to save setting", error);

        // Revert the toggle if the network fails
        if (typeof value === 'boolean') {
            const toggle = document.getElementById(`toggle-${settingName.replace('_', '-')}`);
            if (toggle) toggle.checked = !value;
            // Also revert localStorage
            localStorage.setItem(`pref-${settingName.replace('_', '-')}`, !value);
        }
    }
}


// ==========================================
// 4. DELETE ACCOUNT LOGIC
// ==========================================
function initDeleteAccountModal() {
    const deleteBtn = document.getElementById('delete-account-btn');
    const modal = document.getElementById('delete_account_modal');
    const confirmBtn = document.getElementById('confirm-delete-account-btn');
    const confirmInput = document.getElementById('delete-confirm-input');

    if (!deleteBtn || !modal) return;

    // Open Modal
    deleteBtn.addEventListener('click', () => {
        confirmInput.value = ''; // Reset input
        confirmBtn.disabled = true; // Disable button initially
        modal.showModal();
    });

    // Enable confirm button only if user types "DELETE"
    confirmInput.addEventListener('input', (e) => {
        if (e.target.value === 'DELETE') {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-disabled');
        } else {
            confirmBtn.disabled = true;
            confirmBtn.classList.add('btn-disabled');
        }
    });

    // Handle actual deletion
    confirmBtn.addEventListener('click', async () => {
        confirmBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Deleting...';
        confirmBtn.disabled = true;

        try {
            const res = await fetch('/api/delete-account', { method: 'DELETE' });

            if (res.ok) {
                // Success! Redirect to home (which will now show the logged-out state)
                window.location.href = "/";
            } else {
                if (typeof showToast === 'function') showToast("Failed to delete account.", "error");
                confirmBtn.innerHTML = 'Permanently Delete';
                confirmBtn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            if (typeof showToast === 'function') showToast("Network error.", "error");
            confirmBtn.innerHTML = 'Permanently Delete';
            confirmBtn.disabled = false;
        }
    });
}


// ==========================================
// 5. EDIT PROFILE MODAL LOGIC
// ==========================================
function initEditProfileModal() {
    const openBtn = document.getElementById('open-edit-profile-btn');
    const modal = document.getElementById('edit_profile_modal');
    const form = document.getElementById('edit-profile-form');
    const saveBtn = document.getElementById('save-profile-btn');
    
    // Avatar Elements
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInitials = document.getElementById('avatar-initials');
    let currentAvatarBase64 = null;

    if (!openBtn || !modal || !form) return;

    // 1. Handle Avatar Selection
    avatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 1MB)
            if (file.size > 1024 * 1024) {
                if (typeof showToast === 'function') showToast("Image must be less than 1MB", "error");
                return;
            }
            const reader = new FileReader();
            reader.onload = function(event) {
                currentAvatarBase64 = event.target.result;
                avatarPreview.src = currentAvatarBase64;
                avatarPreview.classList.remove('hidden');
                avatarInitials.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. Open Modal
    openBtn.addEventListener('click', () => {
        // Reset password fields and errors
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        document.getElementById('password-error').classList.add('hidden');
        modal.showModal();
    });

    // 3. Handle Form Submit
        // 3. Handle Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('edit-name');
        const emailInput = document.getElementById('edit-email');
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const passwordError = document.getElementById('password-error');
        const fileInput = document.getElementById('avatar-upload');
        
        let isValid = true;

        // Validation logic (same as before) ...
        if (nameInput.value.trim() === "") { isValid = false; document.getElementById('edit-name-error').classList.remove('hidden'); }
        
        if (newPassword || currentPassword) {
            if (!currentPassword) {
                passwordError.textContent = "Please enter your current password.";
                passwordError.classList.remove('hidden');
                isValid = false;
            } else if (newPassword.length < 6 || newPassword !== confirmPassword) {
                passwordError.textContent = "New passwords do not match or are under 6 characters.";
                passwordError.classList.remove('hidden');
                isValid = false;
            }
        }
        if (!isValid) return;

        // PREPARE FORMDATA
        const formData = new FormData();
        formData.append('name', nameInput.value.trim());
        formData.append('email', emailInput.value.trim());
        if (currentPassword) formData.append('current_password', currentPassword);
        if (newPassword) formData.append('new_password', newPassword);
        
        // Append the actual file if the user selected one
        if (fileInput.files.length > 0) {
            formData.append('avatar', fileInput.files[0]);
        }

        const originalBtnText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Saving...';
        saveBtn.disabled = true;

        try {
            const res = await fetch('/api/update-profile', {
                method: 'POST',
                body: formData 
            });

            const data = await res.json();

            if (res.ok) {
                modal.close();
                if (typeof showToast === 'function') showToast("Profile updated!", "success");
                setTimeout(() => window.location.reload(), 1000); 
            } else {
                if (typeof showToast === 'function') showToast(data.message || "Failed to update.", "error");
                saveBtn.innerHTML = originalBtnText;
                saveBtn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            if (typeof showToast === 'function') showToast("Network error.", "error");
            saveBtn.innerHTML = originalBtnText;
            saveBtn.disabled = false;
        }
    });
}