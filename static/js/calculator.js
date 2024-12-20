document.addEventListener('DOMContentLoaded', function() {
// Theme management
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update charts with new theme colors
        if (balanceChart) balanceChart.update();
        if (withdrawalChart) withdrawalChart.update();
        if (compoundChart) compoundChart.update();
    });
});

    // Get form elements
    const form = document.getElementById('swpForm');
    const inputs = form.querySelectorAll('input');
    const resultsSection = document.getElementById('results');
    
    // Chart objects
    let balanceChart = null;
    let withdrawalChart = null;
    let compoundChart = null; // Added compound chart object

    // Add input event listeners for real-time calculation
    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange);
    });

    // Sync inflation rate input and slider
    const inflationRateInput = document.getElementById('inflationRate');
    const inflationSlider = document.getElementById('inflationSlider');
    
    inflationSlider.addEventListener('input', (e) => {
        inflationRateInput.value = e.target.value;
        updateInflationPreview();
        calculateSWP();
    });

    inflationRateInput.addEventListener('input', (e) => {
        inflationSlider.value = e.target.value;
        updateInflationPreview();
    });

    function handleInputChange(e) {
        if (e.target.id === 'withdrawalAmount') {
            updateInflationPreview();
        }
        calculateSWP();
    }

    function updateInflationPreview() {
        const withdrawalAmount = parseFloat(document.getElementById('withdrawalAmount').value) || 0;
        const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 0;
        
        [1, 5, 10].forEach(years => {
            const adjustment = Math.pow(1 + (inflationRate/100), years);
            const futureAmount = withdrawalAmount * adjustment;
            document.getElementById(`preview${years}`).textContent = formatCurrency(futureAmount);
        });
    }

    // Format currency function
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Initialize charts
    function initializeCharts() {
        // Balance progression chart
        const balanceCtx = document.getElementById('balanceChart').getContext('2d');
        balanceChart = new Chart(balanceCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Balance Progression',
                    data: [],
                    borderColor: '#1a2b4b',
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return null;
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(26, 43, 75, 0.0)');
                        gradient.addColorStop(1, 'rgba(26, 43, 75, 0.2)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Investment Balance Over Time'
                    }
                }
            }
        });

        // Withdrawal progression chart
        const withdrawalCtx = document.getElementById('withdrawalChart').getContext('2d');
        withdrawalChart = new Chart(withdrawalCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Cumulative Withdrawals',
                    data: [],
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return null;
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(58, 112, 65, 0.6)');
                        gradient.addColorStop(1, 'rgba(58, 112, 65, 0.9)');
                        return gradient;
                    },
                    borderColor: '#2c5530',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Cumulative Withdrawals Over Time'
                    }
                }
            }
        });

            // Compound Interest Chart
            const compoundCtx = document.getElementById('compoundChart').getContext('2d');
            compoundChart = new Chart(compoundCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Initial Investment',
                        data: [],
                        backgroundColor: (context) => {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                            gradient.addColorStop(0, 'rgba(26, 43, 75, 0.6)');
                            gradient.addColorStop(1, 'rgba(26, 43, 75, 0.9)');
                            return gradient;
                        },
                        borderColor: '#1a2b4b',
                        borderWidth: 1
                    }, {
                        label: 'Returns',
                        data: [],
                        backgroundColor: (context) => {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                            gradient.addColorStop(0, 'rgba(58, 112, 65, 0.6)');
                            gradient.addColorStop(1, 'rgba(58, 112, 65, 0.9)');
                            return gradient;
                        },
                        borderColor: '#2c5530',
                        borderWidth: 1
                    }, {
                        label: 'Withdrawals',
                        data: [],
                        backgroundColor: (context) => {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                            gradient.addColorStop(0, 'rgba(192, 75, 75, 0.6)');
                            gradient.addColorStop(1, 'rgba(192, 75, 75, 0.9)');
                            return gradient;
                        },
                        borderColor: '#c04b4b',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 750,
                        easing: 'easeInOutQuart',
                        delay: (context) => context.dataIndex * 100
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                callback: value => formatCurrency(value)
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Compound Interest Breakdown'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + 
                                           formatCurrency(context.raw);
                                }
                            }
                        }
                    }
                }
            });
    }

    // Initialize charts on page load
    initializeCharts();

    // Calculate SWP function
    function calculateSWP() {
        // Get input values
        const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
        const initialMonthlyWithdrawal = parseFloat(document.getElementById('withdrawalAmount').value) || 0;
        const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) || 0;
        const timePeriod = parseFloat(document.getElementById('timePeriod').value) || 0;
        const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 0;

        // Validate inputs
        if (!validateInputs(initialInvestment, initialMonthlyWithdrawal, expectedReturn, timePeriod, inflationRate)) {
            resultsSection.classList.add('d-none');
            return;
        }

        // Calculate monthly return rate
        const monthlyReturnRate = expectedReturn / (12 * 100);
        
        // Calculate progression data
        let balance = initialInvestment;
        let totalWithdrawals = 0;
        let currentMonthlyWithdrawal = initialMonthlyWithdrawal;
        const totalMonths = timePeriod * 12;
        
        const balances = [initialInvestment];
        const withdrawals = [0];
        const labels = ['Start'];

        // Pre-calculate yearly withdrawal amounts based on annual inflation
        const yearlyWithdrawals = [];
        for (let year = 0; year <= timePeriod; year++) {
            // For each year, calculate the inflation-adjusted monthly withdrawal
            // Using compound annual inflation adjustment
            const yearlyAdjustment = Math.pow(1 + (inflationRate/100), year);
            yearlyWithdrawals[year] = initialMonthlyWithdrawal * yearlyAdjustment;
        }

        for (let i = 1; i <= totalMonths; i++) {
            // Update withdrawal amount at the start of each year
            // We use Math.floor(i/12) to get the current year number
            currentMonthlyWithdrawal = yearlyWithdrawals[Math.floor((i-1)/12)];

            // Add monthly returns
            balance += balance * monthlyReturnRate;
            
            // Subtract monthly withdrawal
            if (balance >= currentMonthlyWithdrawal) {
                balance -= currentMonthlyWithdrawal;
                totalWithdrawals += currentMonthlyWithdrawal;
            } else {
                totalWithdrawals += balance;
                balance = 0;
            }

            if (i % 12 === 0) {
                balances.push(balance);
                withdrawals.push(totalWithdrawals);
                labels.push(`Year ${i/12}`);
            }
        }

        // Update results
        document.getElementById('finalBalance').textContent = formatCurrency(balance);
        document.getElementById('totalWithdrawals').textContent = formatCurrency(totalWithdrawals);
        
        // Calculate compound interest breakdown
        const compoundData = labels.map((_, index) => {
            if (index === 0) {
                return {
                    initial: initialInvestment,
                    returns: 0,
                    withdrawals: 0
                };
            }
            const totalValue = balances[index];
            const totalWithdrawn = withdrawals[index];
            const returns = Math.max(0, totalValue + totalWithdrawn - initialInvestment);
            return {
                initial: initialInvestment,
                returns: returns,
                withdrawals: -totalWithdrawn
            };
        });

        // Update charts
        balanceChart.data.labels = labels;
        balanceChart.data.datasets[0].data = balances;
        balanceChart.update();

        withdrawalChart.data.labels = labels;
        withdrawalChart.data.datasets[0].data = withdrawals;
        withdrawalChart.update();

        compoundChart.data.labels = labels;
        compoundChart.data.datasets[0].data = compoundData.map(d => d.initial);
        compoundChart.data.datasets[1].data = compoundData.map(d => d.returns);
        compoundChart.data.datasets[2].data = compoundData.map(d => d.withdrawals);
        compoundChart.update();
        
        // Show results section
        resultsSection.classList.remove('d-none');
    }

    // Validate inputs function
    function validateInputs(initialInvestment, monthlyWithdrawal, expectedReturn, timePeriod, inflationRate) {
        if (initialInvestment <= 0 || isNaN(initialInvestment)) {
            return false;
        }
        if (monthlyWithdrawal <= 0 || isNaN(monthlyWithdrawal)) {
            return false;
        }
        if (expectedReturn <= 0 || expectedReturn > 100 || isNaN(expectedReturn)) {
            return false;
        }
        if (timePeriod <= 0 || timePeriod > 30 || isNaN(timePeriod)) {
            return false;
        }
        if (inflationRate < 0 || inflationRate > 30 || isNaN(inflationRate)) {
            return false;
        }
        return true;
    }

    // Form validation
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    });
});