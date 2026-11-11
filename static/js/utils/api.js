const API = {
    // --- SIMULATOR ---
    simulate: async (payload) => {
        const res = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    },

    // --- SCENARIOS ---
    createScenario: async (payload) => {
        return await fetch('/api/scenarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    },

    deleteScenario: async (id) => {
        return await fetch(`/api/scenarios/${id}`, { method: 'DELETE' });
    },

    duplicateScenario: async (id) => {
        return await fetch(`/api/scenarios/${id}/duplicate`, { method: 'POST' });
    },

    renameScenario: async (id, newName) => {
        return await fetch(`/api/scenarios/${id}/rename`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
    },

    archiveScenario: async (id) => {
        return await fetch(`/api/scenarios/${id}/archive`, { method: 'PATCH' });
    },

    restoreScenario: async (id) => {
        return await fetch(`/api/scenarios/${id}/restore`, { method: 'PATCH' });
    },

    getScenarioDetails: async (id) => {
        const res = await fetch(`/api/scenarios/${id}/details`);
        return await res.json();
    },

    // --- USER & SETTINGS ---
    updateProfile: async (formData) => {
        return await fetch('/api/update-profile', { method: 'POST', body: formData });
    },

    deleteAccount: async () => {
        return await fetch('/api/delete-account', { method: 'DELETE' });
    },

    saveSetting: async (setting, value) => {
        return await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setting, value })
        });
    },

    forgotPassword: async (formData) => {
        return await fetch('/api/forgot-password', { method: 'POST', body: formData });
    }
};