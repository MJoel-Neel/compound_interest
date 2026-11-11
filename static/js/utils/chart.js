const Charts = {
    renderLineChart: function (canvasId, labels, data1, data2, color1 = '#22c55e', color2 = '#3b82f6') {
        const oldCanvas = document.getElementById(canvasId);
        if (!oldCanvas || !oldCanvas.parentNode) return;

        // THE SLEDGEHAMMER FIX: Remove the canvas completely from the page
        const parent = oldCanvas.parentNode;
        parent.removeChild(oldCanvas);

        // Create a brand new canvas and put it in the exact same spot
        const newCanvas = document.createElement('canvas');
        newCanvas.id = canvasId;
        parent.appendChild(newCanvas);

        const ctx = newCanvas.getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Balance',
                        data: data1,
                        borderColor: color1,
                        backgroundColor: color1 + '20',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Amount Invested',
                        data: data2,
                        borderColor: color2,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (val) {
                                if (val >= 1e15) return '€' + (val / 1e15).toFixed(1) + 'Q';
                                if (val >= 1e12) return '€' + (val / 1e12).toFixed(1) + 'T';
                                if (val >= 1e9) return '€' + (val / 1e9).toFixed(1) + 'B';
                                if (val >= 1e6) return '€' + (val / 1e6).toFixed(1) + 'M';
                                if (val >= 1e3) return '€' + (val / 1e3).toFixed(1) + 'k';
                                return '€' + val;
                            }
                        }
                    },
                    x: { ticks: { maxTicksLimit: 10 } }
                }
            }
        });
    },

    renderDonutChart: function (canvasId, labels, data, colors) {
        const oldCanvas = document.getElementById(canvasId);
        if (!oldCanvas || !oldCanvas.parentNode) return;

        const parent = oldCanvas.parentNode;
        parent.removeChild(oldCanvas);

        const newCanvas = document.createElement('canvas');
        newCanvas.id = canvasId;
        parent.appendChild(newCanvas);

        const ctx = newCanvas.getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
};