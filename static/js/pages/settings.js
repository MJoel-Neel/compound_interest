// static/js/pages/settings.js

document.addEventListener("DOMContentLoaded", () => {
    syncThemeUI();
    loadPreferences();
    initEditProfile();
    initDeleteAccount();
});

// --- 1. THEME UI ---
function changeTheme(theme) {
    localStorage.setItem('app-theme', theme);
    applyTheme(theme); // Global function
    syncThemeUI();
    API.saveSetting('theme', theme);
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

        // Reset
        label.className = 'cursor-pointer border border-base-200 hover:border-base-300 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center gap-2 relative transition-all';
        check.classList.add('hidden');
        icon.className = 'text-base-content/60 text-lg transition-colors fa-solid ' + (t === 'light' ? 'fa-sun' : t === 'dark' ? 'fa-moon' : 'fa-desktop');
        span.className = 'raleway-500 text-xs text-base-content/60 transition-colors';

        // Active
        if (t === active) {
            label.className = 'cursor-pointer border border-success bg-success/5 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center gap-2 relative transition-all shadow-sm';
            check.classList.remove('hidden');
            icon.className = 'text-success text-lg transition-colors fa-solid ' + (t === 'light' ? 'fa-sun' : t === 'dark' ? 'fa-moon' : 'fa-desktop');
            span.className = 'raleway-500 text-xs text-success transition-colors';
        }
    });
}

// --- 2. PREFERENCES ---
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
    localStorage.setItem(`pref-${setting.replace('_', '-')}`, value);
    await API.saveSetting(setting, value);
}

// --- 3. EDIT PROFILE ---
function initEditProfile() {
    const modal = document.getElementById('edit_profile_modal');
    const form = document.getElementById('edit-profile-form');
    const saveBtn = document.getElementById('save-profile-btn');
    if (!modal || !form) return;

    document.getElementById('open-edit-profile-btn').addEventListener('click', () => {
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        modal.showModal();
    });

    // Avatar Preview Logic
    document.getElementById('avatar-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
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
        saveBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
        
        const formData = new FormData(form);
        // Only append password if typed
        if (!document.getElementById('new-password').value) {
            formData.delete('current_password');
            formData.delete('new_password');
            formData.delete('confirm_password');
        }

        try {
            const res = await API.updateProfile(formData);
            const data = await res.json();
            
            if (res.ok) {
                modal.close();
                showToast("Profile updated!");
                setTimeout(() => window.location.reload(), 800);
            } else {
                showToast(data.message, "error");
            }
        } catch {
            showToast("Network Error", "error");
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
        const res = await API.deleteAccount();
        if (res.ok) window.location.href = "/";
    });
}