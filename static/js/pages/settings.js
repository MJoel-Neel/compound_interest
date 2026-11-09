function changeTheme(theme) {
    // Set the theme on the HTML tag for DaisyUI
    document.documentElement.setAttribute('data-theme', theme);
    // Save it so it remembers next time
    localStorage.setItem('app-theme', theme);
}

// On page load, check if they have a saved theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});



async function updateSetting(settingName, isChecked) {
    try {
        // Send the update to Python in the background
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setting: settingName, value: isChecked })
        });
        // Optional: Show a tiny toast notification "Saved!"
    } catch (error) {
        console.error("Failed to save setting", error);
        alert("Could not save setting. Please try again.");
        // Revert the toggle if it failed
        document.getElementById(`toggle-${settingName.replace('_', '-')}`).checked = !isChecked;
    }
}