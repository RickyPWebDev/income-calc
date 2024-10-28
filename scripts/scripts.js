let bills = [];
let billsChart;

// Load saved data on page load
window.onload = function() {
    loadData();
    displayBills();
    updateAvailableFunds();
    updateChart(); // Initialize chart on page load
};

// Function to display bills in the list
function displayBills() {
    const billList = document.getElementById("bill-list"); // Reference to the list element
    billList.innerHTML = ''; // Clear the list

    bills.forEach((bill, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${bill.name}: £${bill.amount.toFixed(2)}</span>
            <button onclick="removeBill(${index})">Remove</button>
        `;
        billList.appendChild(li);
    });
}

// Function to add a bill
function addBill() {
    const billName = document.getElementById("bill-name").value;
    const billAmount = parseFloat(document.getElementById("bill-amount").value);
    const billType = document.querySelector('input[name="bill-type"]:checked').value; // Get selected bill type

    if (billName && billAmount) {
        bills.push({ name: billName, amount: billAmount, type: billType }); // Include type in the bill object
        saveData();
        displayBills();
        updateAvailableFunds();
        updateChart(); // Update chart after adding bill
        document.getElementById("bill-name").value = '';
        document.getElementById("bill-amount").value = '';
    } else {
        alert("Please enter both bill name and amount.");
    }
}

// Function to categorize bills and return category totals
function categorizeBills() {
    let householdTotal = 0;
    let entertainmentTotal = 0;

    bills.forEach(bill => {
        if (bill.type === "household") {
            householdTotal += bill.amount;
        } else if (bill.type === "entertainment") {
            entertainmentTotal += bill.amount;
        }
    });

    return { householdTotal, entertainmentTotal };
}

// Function to update the pie chart
function updateChart() {
    const { householdTotal, entertainmentTotal } = categorizeBills();

    // Calculate total bills and leftover cash
    const totalBills = householdTotal + entertainmentTotal;
    const income = parseFloat(document.getElementById("income").value) || 0;
    const leftover = Math.max(income - totalBills, 0); // Ensure leftover doesn't go negative

    const data = {
        labels: ['Household', 'Entertainment', 'Leftover'],
        datasets: [{
            data: [householdTotal, entertainmentTotal, leftover],
            backgroundColor: ['#007BFF', '#28a745', '#ffffff'], // Blue for Household, Green for Entertainment, White for Leftover
            hoverBackgroundColor: ['#0056b3', '#218838', '#e0e0e0']
        }]
    };

    if (billsChart) {
        billsChart.data = data;
        billsChart.update();
    } else {
        const ctx = document.getElementById('bills-chart').getContext('2d');
        billsChart = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Function to remove a bill
function removeBill(index) {
    bills.splice(index, 1);
    saveData();
    displayBills();
    updateAvailableFunds();
    updateChart(); // Update chart after removing bill
}

// Function to calculate available funds and update the chart
function calculateFunds() {
    updateAvailableFunds(); // Update available funds
    updateChart(); // Update the chart after income change
}

// Function to calculate and update available funds
function updateAvailableFunds(saveIncome = true) {
    const income = parseFloat(document.getElementById("income").value) || 0;
    const totalBills = bills.reduce((total, bill) => total + bill.amount, 0);
    const availableFunds = income - totalBills;

    document.getElementById("available-funds").textContent = `£${availableFunds.toFixed(2)}`;

    // Save income only if saveIncome is true
    if (saveIncome) {
        saveData();
    }
}

// Function to save data to localStorage
function saveData() {
    localStorage.setItem("bills", JSON.stringify(bills));
    localStorage.setItem("income", document.getElementById("income").value);
}

// Function to load data from localStorage
function loadData() {
    const savedBills = JSON.parse(localStorage.getItem("bills"));
    const savedIncome = localStorage.getItem("income");

    if (savedBills) {
        bills = savedBills;
    }

    if (savedIncome) {
        document.getElementById("income").value = savedIncome;
    }
}
