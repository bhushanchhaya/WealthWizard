document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('swpForm');
    const inputs = form.querySelectorAll('input');
    const resultsSection = document.getElementById('results');

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

    // Calculate SWP function
    function calculateSWP() {
        // Get input values
        const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
        const monthlyWithdrawal = parseFloat(document.getElementById('withdrawalAmount').value) || 0;
        const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) || 0;
        const timePeriod = parseFloat(document.getElementById('timePeriod').value) || 0;

        // Validate inputs
        if (!validateInputs(initialInvestment, monthlyWithdrawal, expectedReturn, timePeriod)) {
            resultsSection.classList.add('d-none');
            return;
        }

        // Calculate monthly return rate
        const monthlyRate = expectedReturn / (12 * 100);
        
        // Calculate final balance and total withdrawals
        let balance = initialInvestment;
        let totalWithdrawals = 0;
        const totalMonths = timePeriod * 12;

        for (let i = 0; i < totalMonths; i++) {
            // Add monthly returns
            balance += balance * monthlyRate;
            
            // Subtract monthly withdrawal
            if (balance >= monthlyWithdrawal) {
                balance -= monthlyWithdrawal;
                totalWithdrawals += monthlyWithdrawal;
            } else {
                totalWithdrawals += balance;
                balance = 0;
                break;
            }
        }

        // Update results
        document.getElementById('finalBalance').textContent = formatCurrency(balance);
        document.getElementById('totalWithdrawals').textContent = formatCurrency(totalWithdrawals);
        
        // Show results section
        resultsSection.classList.remove('d-none');
    }

    // Validate inputs function
    function validateInputs(initialInvestment, monthlyWithdrawal, expectedReturn, timePeriod) {
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
