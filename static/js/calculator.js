document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('swpForm');
    const inputs = form.querySelectorAll('input');
    const resultsSection = document.getElementById('results');
    
    // Chart objects
    let balanceChart = null;
    let withdrawalChart = null;

    // Add input event listeners for real-time calculation
    inputs.forEach(input => {
        input.addEventListener('input', calculateSWP);
    });

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
                    backgroundColor: 'rgba(26, 43, 75, 0.1)',
                    fill: true,
                    tension: 0.4
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
                    backgroundColor: 'rgba(58, 112, 65, 0.7)',
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

        // Calculate monthly rates
        const monthlyReturnRate = expectedReturn / (12 * 100);
        const monthlyInflationRate = inflationRate / (12 * 100);
        
        // Calculate progression data
        let balance = initialInvestment;
        let totalWithdrawals = 0;
        let currentMonthlyWithdrawal = initialMonthlyWithdrawal;
        const totalMonths = timePeriod * 12;
        
        const balances = [initialInvestment];
        const withdrawals = [0];
        const labels = ['Start'];

        for (let i = 1; i <= totalMonths; i++) {
            // Adjust withdrawal amount for inflation at the start of each year
            if (i % 12 === 1 && i > 1) {
                currentMonthlyWithdrawal *= (1 + inflationRate / 100);
            }

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
        
        // Update charts
        balanceChart.data.labels = labels;
        balanceChart.data.datasets[0].data = balances;
        balanceChart.update();

        withdrawalChart.data.labels = labels;
        withdrawalChart.data.datasets[0].data = withdrawals;
        withdrawalChart.update();
        
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
