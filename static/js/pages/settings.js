document.addEventListener("DOMContentLoaded", () => {
    // 1. On page load, check what theme is saved and highlight the correct box
    syncThemeUI();

    // 2. Load Select Preferences (Currency & Time Range)
    loadPreferences();
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
// 2. PREFERENCE SELECTORS (Currency & Time)
// ==========================================
function loadPreferences() {
    // Load Currency
    const savedCurrency = localStorage.getItem('pref-currency') || 'EUR';
    const currencySelect = document.getElementById('pref-currency');
    if (currencySelect) currencySelect.value = savedCurrency;

    // Load Time Range
    const savedTimeRange = localStorage.getItem('pref-time-range') || '20';
    const timeSelect = document.getElementById('pref-time-range');
    if (timeSelect) timeSelect.value = savedTimeRange;
}

// ==========================================
// 3. API SETTINGS LOGIC (Toggles & Backend Sync)
// ==========================================
async function updateSetting(settingName, value) {
    // 1. Save select preferences to localStorage for instant UI persistence
    if (settingName === 'currency') {
        localStorage.setItem('pref-currency', value);
    } else if (settingName === 'time_range') {
        localStorage.setItem('pref-time-range', value);
    }

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
        }
    }
}