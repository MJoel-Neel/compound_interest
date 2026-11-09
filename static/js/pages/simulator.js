document.addEventListener("DOMContentLoaded", () => {
    // --- SIMULATOR VALIDATION ---
    const simulatorForm = document.getElementById('simulator-form');
    if (simulatorForm) {
        simulatorForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Get all inputs inside the form
            const inputs = simulatorForm.querySelectorAll('input[type="number"]');
            
            inputs.forEach(input => {
                // Find the closest parent div (the .input wrapper)
                const inputWrapper = input.closest('.input');
                // Find the sibling error message
                const errorMsg = inputWrapper.nextElementSibling;

                // Check HTML5 validity
                if (!input.checkValidity()) {
                    isValid = false;
                    
                    // Add DaisyUI error styling
                    inputWrapper.classList.add('input-error');
                    // Show the error message
                    if (errorMsg) errorMsg.classList.remove('hidden');
                } else {
                    // Remove error styling if valid
                    inputWrapper.classList.remove('input-error');
                    if (errorMsg) errorMsg.classList.add('hidden');
                }
            });

            // If any input is invalid, stop the form from submitting to Python
            if (!isValid) {
                event.preventDefault(); 
            }
        });

        // Reset error state when the user types
        const inputs = simulatorForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                const inputWrapper = input.closest('.input');
                const errorMsg = inputWrapper.nextElementSibling;
                
                if (input.checkValidity()) {
                    inputWrapper.classList.remove('input-error');
                    if (errorMsg) errorMsg.classList.add('hidden');
                }
            });
        });
    }
});


// --- SIMULATOR SAVED SCENARIOS LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const scenarioList = document.getElementById('simulator-scenarios-list');
    
    if (scenarioList) {
        scenarioList.addEventListener('click', async (e) => {
            // 1. Check if the clicked element is the delete button
            const deleteBtn = e.target.closest('.delete-btn');

            if (deleteBtn) {
                // 2. Extract the exact ID
                const scenarioId = deleteBtn.dataset.id;
                
                // 3. Confirm with the user
                if (!confirm("Are you sure you want to delete this scenario?")) return;

                try {
                    // 4. Send the actual DELETE request to FastAPI
                    const response = await fetch(`/api/scenarios/${scenarioId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        // 5. Success! Find the specific row by ID and remove it
                        const rowToRemove = document.getElementById(`scenario-row-${scenarioId}`);
                        
                        if (rowToRemove) {
                            // Smooth animation
                            rowToRemove.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            rowToRemove.style.opacity = '0';
                            rowToRemove.style.transform = 'translateX(20px)';
                            
                            setTimeout(() => {
                                rowToRemove.remove();
                                updateScenarioCount(); // Update the badge
                            }, 300);
                        }
                    } else {
                        alert("Failed to delete. The server rejected the request.");
                    }
                } catch (error) {
                    console.error("Network Error:", error);
                    // FOR TESTING PURPOSES: If FastAPI isn't running yet, we simulate success
                    // alert("Could not connect to the server. Make sure FastAPI is running.");
                    
                    // Uncomment below to test the UI without FastAPI
                    /*
                    const rowToRemove = document.getElementById(`scenario-row-${scenarioId}`);
                    if (rowToRemove) {
                        rowToRemove.style.opacity = '0';
                        setTimeout(() => { rowToRemove.remove(); updateScenarioCount(); }, 300);
                    }
                    */
                }
            }
        });
    }
});

// Helper function to keep the "3 scenarios" badge accurate
function updateScenarioCount() {
    const badge = document.getElementById('scenario-count-badge');
    const remainingRows = document.querySelectorAll('.scenario-row').length;
    if (badge) {
        badge.textContent = `${remainingRows} scenario${remainingRows !== 1 ? 's' : ''}`;
    }
}