document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        const scenarioId = button.getAttribute('data-id');
        
        // Optional: Add a DaisyUI confirmation modal here instead of confirm()
        if (!confirm("Are you sure you want to delete this scenario?")) return;

        try {
            // Send a DELETE request to your FastAPI backend
            const response = await fetch(`/api/scenarios/${scenarioId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Success! Remove the card from the screen smoothly
                const card = button.closest('.card');
                card.style.opacity = '0';
                setTimeout(() => card.remove(), 300); // Wait for fade out
            } else {
                alert("Failed to delete scenario.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});

