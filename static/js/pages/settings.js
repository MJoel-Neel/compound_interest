document.addEventListener("DOMContentLoaded", () => {
    syncThemeUI();
    loadPreferences();
    initEditProfile();
    initDeleteAccount();
});

// --- 1. THEME UI ---
function changeTheme(theme) {
    localStorage.setItem('app-theme', theme);
    if (typeof applyTheme === 'function') applyTheme(theme);
    syncThemeUI();
    updateSetting('theme', theme);
}

function syncThemeUI() {
    const active = localStorage.getItem('app-theme') || 'light';
    const themes = ['light', 'dark', 'system'];

    themes.forEach(t => {
        const label = document.getElementById(`label-theme-${t}`);
        const check = document.getElementById(`check-theme-${t}`);
        if (!label || !check) return;
        
        const icon = label.querySelector('i:first-child');
        const span = label.querySelector('span');

        label.className = 'cursor-pointer border border-base-200 hover:border-base-300 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center gap-2 relative transition-all';
        check.classList.add('hidden');
        icon.className = 'text-base-content/60 text-lg transition-colors fa-solid ' + (t === 'light' ? 'fa-sun' : t === 'dark' ? 'fa-moon' : 'fa-desktop');
        span.className = 'raleway-500 text-xs text-base-content/60 transition-colors';

        if (t === active) {
            label.className = 'cursor-pointer border border-success bg-success/5 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center gap-2 relative transition-all shadow-sm';
            check.classList.remove('hidden');
            icon.className = 'text-success text-lg transition-colors fa-solid ' + (t === 'light' ? 'fa-sun' : t === 'dark' ? 'fa-moon' : 'fa-desktop');
            span.className = 'raleway-500 text-xs text-success transition-colors';
        }
    });
}

// --- 2. PREFERENCES & TOGGLES ---
function loadPreferences() {
    const savedCurrency = localStorage.getItem('pref-currency') || 'EUR';
    const currencySelect = document.getElementById('pref-currency');
    if (currencySelect) currencySelect.value = savedCurrency;

    const savedRange = localStorage.getItem('pref-time-range') || '20';
    const rangeSelect = document.getElementById('pref-time-range');
    if (rangeSelect) rangeSelect.value = savedRange;

    ['portfolio-alerts', 'market-updates', 'product-updates'].forEach(key => {
        const el = document.getElementById(`toggle-${key}`);
        if (el) el.checked = localStorage.getItem(`pref-${key}`) !== 'false';
    });
}

async function updateSetting(setting, value) {
    // Save locally first
    localStorage.setItem(`pref-${setting.replace('_', '-')}`, value);
    
    // Send to backend
    try {
        const res = await API.saveSetting(setting, value);
        if (res.ok) {
            console.log(`Saved: ${setting} = ${value}`);
            if (typeof showToast === 'function') showToast("Preference saved!");
        }
    } catch (error) {
        console.error("Failed to save setting", error);
    }
}

// --- 3. EDIT PROFILE (AVATAR + EMAIL VALIDATION) ---
function initEditProfile() {
    const modal = document.getElementById('edit_profile_modal');
    const form = document.getElementById('edit-profile-form');
    const saveBtn = document.getElementById('save-profile-btn');
    if (!modal || !form) return;

    document.getElementById('open-edit-profile-btn').addEventListener('click', () => {
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        document.getElementById('edit-email-error').classList.add('hidden');
        modal.showModal();
    });

    // Avatar Preview & Size Limit
    document.getElementById('avatar-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                if (typeof showToast === 'function') showToast("Image must be less than 2MB", "error");
                this.value = ''; 
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('avatar-preview').src = ev.target.result;
                document.getElementById('avatar-preview').classList.remove('hidden');
                document.getElementById('avatar-initials').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('edit-email');
        const emailError = document.getElementById('edit-email-error');
        
        // STRICTER EMAIL VALIDATION
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(emailInput.value.trim())) {
            console.log("Invalid email caught by JS:", emailInput.value);
            emailInput.classList.add('input-error');
            emailError.classList.remove('hidden');
            if (typeof showToast === 'function') showToast("Please enter a valid email address", "error");
            return;
        } else {
            emailInput.classList.remove('input-error');
            emailError.classList.add('hidden');
        }

        saveBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
        
        const formData = new FormData(form);
        
        if (!document.getElementById('new-password').value) {
            formData.delete('current_password');
            formData.delete('new_password');
            formData.delete('confirm_password');
        }

        const fileInput = document.getElementById('avatar-upload');
        if (fileInput.files.length > 0) {
            formData.append('avatar', fileInput.files[0]);
            console.log("Appending avatar:", fileInput.files[0].name);
        }

        try {
            const res = await API.updateProfile(formData);
            const data = await res.json();
            
            if (res.ok) {
                modal.close();
                if (typeof showToast === 'function') showToast("Profile updated!");
                setTimeout(() => window.location.reload(), 800);
            } else {
                if (typeof showToast === 'function') showToast(data.message || "Failed to update", "error");
            }
        } catch {
            if (typeof showToast === 'function') showToast("Network Error", "error");
        } finally {
            saveBtn.innerHTML = 'Save Changes';
        }
    });
}


// --- 4. DELETE ACCOUNT ---
function initDeleteAccount() {
    const modal = document.getElementById('delete_account_modal');
    const input = document.getElementById('delete-confirm-input');
    const btn = document.getElementById('confirm-delete-account-btn');
    if (!modal) return;

    document.getElementById('delete-account-btn').addEventListener('click', () => {
        input.value = '';
        btn.disabled = true;
        modal.showModal();
    });

    input.addEventListener('input', () => {
        btn.disabled = input.value !== 'DELETE';
    });

    btn.addEventListener('click', async () => {
        btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
        try {
            const res = await API.deleteAccount();
            if (res.ok) window.location.href = "/";
        } catch {
            if (typeof showToast === 'function') showToast("Failed to delete account", "error");
            btn.innerHTML = 'Permanently Delete';
        }
    });
}