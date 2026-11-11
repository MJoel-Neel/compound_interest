// static/js/pages/insights.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Portfolio Performance Line Chart
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const portfolioData = [10000, 11500, 12000, 14000, 15000, 18000, 21000, 25000, 28000, 35000, 42000, 49000];
    const investedData = [10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500];

    Charts.renderLineChart('portfolioChart', labels, portfolioData, investedData);

    // 2. Asset Allocation Donut Chart
    Charts.renderDonutChart(
        'allocationChart', 
        ['Stocks', 'Bonds', 'Crypto'], 
        [60, 25, 15], 
        ['#3b82f6', '#22c55e', '#a855f7'] // Blue, Green, Purple
    );
});