/**
 * TeamWork Hub Dashboard - Frontend JavaScript
 * Handles data fetching, visualization, and user interactions
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    GOOGLE_SHEET_ID: '', // Will be filled by user during setup
    GOOGLE_API_KEY: '', // User's Google API key for sheet access
    REFRESH_INTERVAL: 300000, // 5 minutes
};

let currentData = {
    invoices: [],
    receivables: [],
    bids: [],
    expenses: [],
    payroll: [],
    projects: [],
};

let charts = {};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDate();
    setupEventListeners();
    loadData();
    
    // Auto-refresh every 5 minutes
    setInterval(loadData, CONFIG.REFRESH_INTERVAL);
});

function initializeDate() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleString();
    document.getElementById('ytdDate').textContent = `Jan 1 - ${now.toLocaleDateString()}`;
}

function setupEventListeners() {
    // Set default date to today
    document.getElementById('invoiceDate').valueAsDate = new Date();
    document.getElementById('expenseDate').valueAsDate = new Date();
    document.getElementById('bidModal').style.display = 'none';
}

// ============================================================================
// DATA LOADING & FETCHING
// ============================================================================

async function loadData() {
    try {
        // Load from Google Sheet via API
        // For development: load from localStorage or demo data
        
        if (CONFIG.GOOGLE_SHEET_ID && CONFIG.GOOGLE_API_KEY) {
            await fetchGoogleSheetData();
        } else {
            loadDemoData();
        }
        
        updateDashboard();
        updateCharts();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function fetchGoogleSheetData() {
    try {
        // Fetch Invoices sheet
        const invoicesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/Invoices!A2:H?key=${CONFIG.GOOGLE_API_KEY}`;
        const invoicesRes = await axios.get(invoicesUrl);
        
        if (invoicesRes.data.values) {
            currentData.invoices = invoicesRes.data.values.map(row => ({
                number: row[0],
                date: new Date(row[1]),
                customer: row[2],
                amount: parseFloat(row[3]),
                status: row[4],
                paidDate: row[5] ? new Date(row[5]) : null,
                balance: parseFloat(row[6]),
                daysOutstanding: parseInt(row[7]) || 0,
            }));
        }
        
        // Fetch Receivables sheet
        const receivablesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/Receivables!A2:G?key=${CONFIG.GOOGLE_API_KEY}`;
        const receivablesRes = await axios.get(receivablesUrl);
        
        if (receivablesRes.data.values) {
            currentData.receivables = receivablesRes.data.values.map(row => ({
                customer: row[0],
                totalInvoiced: parseFloat(row[1]),
                totalPaid: parseFloat(row[2]),
                balance: parseFloat(row[3]),
                daysOutstanding: parseInt(row[4]) || 0,
                nextContact: row[5],
                notes: row[6],
            }));
        }
        
        // Fetch Bids sheet
        const bidsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/Bids!A2:I?key=${CONFIG.GOOGLE_API_KEY}`;
        const bidsRes = await axios.get(bidsUrl);
        
        if (bidsRes.data.values) {
            currentData.bids = bidsRes.data.values.map(row => ({
                number: row[0],
                date: new Date(row[1]),
                customer: row[2],
                address: row[3],
                scope: row[4],
                amount: parseFloat(row[5]),
                status: row[6],
                notes: row[7],
                followUp: row[8],
            }));
        }
        
        // Fetch Projects sheet
        const projectsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/Projects!A2:K?key=${CONFIG.GOOGLE_API_KEY}`;
        const projectsRes = await axios.get(projectsUrl);
        
        if (projectsRes.data.values) {
            currentData.projects = projectsRes.data.values.map(row => ({
                name: row[0],
                address: row[1],
                city: row[2],
                state: row[3],
                customer: row[4],
                startDate: new Date(row[5]),
                endDate: row[6] ? new Date(row[6]) : null,
                status: row[7],
                contractAmount: parseFloat(row[8]),
                amountInvoiced: parseFloat(row[9]),
                notes: row[10],
            }));
        }
        
        // Fetch Payroll sheet
        const payrollUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/Payroll!A2:I?key=${CONFIG.GOOGLE_API_KEY}`;
        const payrollRes = await axios.get(payrollUrl);
        
        if (payrollRes.data.values) {
            currentData.payroll = payrollRes.data.values.map(row => ({
                weekEnding: new Date(row[0]),
                name: row[1],
                phone: row[2],
                rateType: row[3],
                daysWorked: parseInt(row[4]) || 0,
                totalHours: parseInt(row[5]) || 0,
                amount: parseFloat(row[6]),
                status: row[7],
                notes: row[8],
            }));
        }
        
    } catch (error) {
        console.warn('Could not fetch from Google Sheets:', error);
        loadDemoData();
    }
}

function loadDemoData() {
    // Demo data for testing without Google Sheet connection
    const now = new Date();
    
    currentData.invoices = [
        {
            number: 'INV-001',
            date: new Date(2026, 4, 1),
            customer: 'Pro Building Systems',
            amount: 5250,
            status: 'Paid',
            paidDate: new Date(2026, 4, 5),
            balance: 0,
            daysOutstanding: 0,
        },
        {
            number: 'INV-002',
            date: new Date(2026, 4, 3),
            customer: 'M.O Incorporated',
            amount: 3750,
            status: 'Paid',
            paidDate: new Date(2026, 4, 8),
            balance: 0,
            daysOutstanding: 0,
        },
        {
            number: 'INV-003',
            date: new Date(2026, 4, 5),
            customer: 'Complete Custom Homes',
            amount: 4200,
            status: 'Pending',
            paidDate: null,
            balance: 4200,
            daysOutstanding: 5,
        },
        {
            number: 'INV-004',
            date: new Date(2026, 4, 10),
            customer: 'Kenny Philpot',
            amount: 2800,
            status: 'Pending',
            paidDate: null,
            balance: 2800,
            daysOutstanding: 0,
        },
    ];
    
    currentData.receivables = [
        { customer: 'Pro Building Systems', totalInvoiced: 5250, totalPaid: 5250, balance: 0, daysOutstanding: 0, notes: '' },
        { customer: 'M.O Incorporated', totalInvoiced: 3750, totalPaid: 3750, balance: 0, daysOutstanding: 0, notes: '' },
        { customer: 'Complete Custom Homes', totalInvoiced: 4200, totalPaid: 0, balance: 4200, daysOutstanding: 5, notes: 'New customer' },
        { customer: 'Kenny Philpot', totalInvoiced: 2800, totalPaid: 0, balance: 2800, daysOutstanding: 0, notes: 'Just invoiced' },
    ];
    
    currentData.bids = [
        {
            number: 'BID-001',
            date: new Date(2026, 4, 2),
            customer: 'Roshawn Redwine',
            address: '545 Butlers Bridge Drive, McDonough GA',
            scope: 'Roof Framing + Roofing',
            amount: 46702.70,
            status: 'Open',
            notes: 'High priority',
        },
        {
            number: 'BID-002',
            date: new Date(2026, 4, 8),
            customer: 'Kris Becker',
            address: '330 Double Springs Way, Alpharetta GA',
            scope: 'Structural inspection + framing',
            amount: 8500,
            status: 'Open',
            notes: 'Ridge beam bearing issue',
        },
    ];
    
    currentData.projects = [
        {
            name: 'Roshawn Redwine Residence',
            address: '545 Butlers Bridge Drive',
            city: 'McDonough',
            state: 'GA',
            customer: 'Roshawn Redwine',
            startDate: new Date(2026, 3, 15),
            endDate: null,
            status: 'Active',
            contractAmount: 46702.70,
            amountInvoiced: 28491.70,
            notes: 'Main roof framing in progress',
        },
        {
            name: 'Kris Becker Job',
            address: '330 Double Springs Way',
            city: 'Alpharetta',
            state: 'GA',
            customer: 'Kris Becker',
            startDate: new Date(2026, 4, 1),
            endDate: null,
            status: 'Active',
            contractAmount: 8500,
            amountInvoiced: 0,
            notes: 'Structural engineer assessment pending',
        },
    ];
    
    currentData.payroll = [
        { weekEnding: new Date(2026, 4, 2), name: 'Jorge Ortiz (JO)', phone: '470-579-8651', rateType: '$250/day per person', daysWorked: 5, totalHours: 40, amount: 1250, status: 'Paid' },
        { weekEnding: new Date(2026, 4, 2), name: 'Jorge Argueta (Choche)', phone: '470-213-2254', rateType: '$250/day', daysWorked: 4, totalHours: 32, amount: 1000, status: 'Paid' },
        { weekEnding: new Date(2026, 4, 2), name: 'Norman', phone: '706-403-7856', rateType: '$520/day (2 people)', daysWorked: 3, totalHours: 24, amount: 1560, status: 'Paid' },
    ];
}

// ============================================================================
// DASHBOARD UPDATES
// ============================================================================

function updateDashboard() {
    // Calculate KPIs
    const totalRevenue = currentData.invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
    
    const outstandingReceivables = currentData.invoices
        .filter(inv => inv.status !== 'Paid')
        .reduce((sum, inv) => sum + inv.balance, 0);
    
    const totalPayroll = currentData.payroll
        .reduce((sum, p) => sum + p.amount, 0);
    
    const openBids = currentData.bids.filter(b => b.status === 'Open');
    const openBidsValue = openBids.reduce((sum, b) => sum + b.amount, 0);
    
    // Update KPI cards
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('outstandingReceivables').textContent = formatCurrency(outstandingReceivables);
    document.getElementById('totalPayroll').textContent = formatCurrency(totalPayroll);
    document.getElementById('openBidsValue').textContent = formatCurrency(openBidsValue);
    document.getElementById('openBidsCount').textContent = openBids.length;
    
    // Update receivables status
    const receivablesStatus = document.getElementById('receivablesStatus');
    if (outstandingReceivables > 0) {
        receivablesStatus.textContent = `${currentData.receivables.filter(r => r.balance > 0).length} customers owe`;
        receivablesStatus.className = 'kpi-status status-warning';
    } else {
        receivablesStatus.textContent = '✅ All paid';
        receivablesStatus.className = 'kpi-status status-good';
    }
    
    // Update invoice table
    updateInvoiceTable('all');
    
    // Update receivables aging
    updateReceivablesAging();
    
    // Update projects list
    updateProjectsList();
    
    // Update payroll summary
    updatePayrollSummary();
    
    // Update last updated time
    document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
}

function updateInvoiceTable(filter = 'all') {
    const tbody = document.getElementById('invoiceTableBody');
    
    let filtered = currentData.invoices;
    if (filter === 'paid') {
        filtered = filtered.filter(inv => inv.status === 'Paid');
    } else if (filter === 'pending') {
        filtered = filtered.filter(inv => inv.status === 'Pending' && inv.daysOutstanding < 30);
    } else if (filter === 'overdue') {
        filtered = filtered.filter(inv => inv.daysOutstanding >= 30);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No invoices found</td></tr>';
        return;
    }
    
    // Sort by date descending
    filtered.sort((a, b) => b.date - a.date);
    
    tbody.innerHTML = filtered.map(inv => {
        const badgeClass = inv.status === 'Paid' ? 'badge-paid' : 
                          inv.daysOutstanding >= 30 ? 'badge-overdue' : 'badge-pending';
        const badgeText = inv.status === 'Paid' ? '✅ Paid' : 
                         inv.daysOutstanding >= 30 ? '⚠️ Overdue' : '⏳ Pending';
        
        return `
            <tr>
                <td><strong>${inv.number}</strong></td>
                <td>${inv.customer}</td>
                <td>${formatDate(inv.date)}</td>
                <td><strong>${formatCurrency(inv.amount)}</strong></td>
                <td><span class="invoice-badge ${badgeClass}">${badgeText}</span></td>
                <td>${inv.daysOutstanding} days</td>
                <td>${formatCurrency(inv.balance)}</td>
            </tr>
        `;
    }).join('');
}

function updateReceivablesAging() {
    const age0_30 = currentData.receivables
        .filter(r => r.daysOutstanding <= 30)
        .reduce((sum, r) => sum + r.balance, 0);
    
    const age31_60 = currentData.receivables
        .filter(r => r.daysOutstanding > 30 && r.daysOutstanding <= 60)
        .reduce((sum, r) => sum + r.balance, 0);
    
    const age61_90 = currentData.receivables
        .filter(r => r.daysOutstanding > 60 && r.daysOutstanding <= 90)
        .reduce((sum, r) => sum + r.balance, 0);
    
    const age90plus = currentData.receivables
        .filter(r => r.daysOutstanding > 90)
        .reduce((sum, r) => sum + r.balance, 0);
    
    document.getElementById('age0_30').textContent = formatCurrency(age0_30);
    document.getElementById('age31_60').textContent = formatCurrency(age31_60);
    document.getElementById('age61_90').textContent = formatCurrency(age61_90);
    document.getElementById('age90plus').textContent = formatCurrency(age90plus);
}

function updateProjectsList() {
    const list = document.getElementById('projectsList');
    const active = currentData.projects.filter(p => p.status === 'Active');
    
    if (active.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No active projects</p>';
        return;
    }
    
    list.innerHTML = active.map(project => {
        const progress = project.contractAmount > 0 
            ? Math.round((project.amountInvoiced / project.contractAmount) * 100)
            : 0;
        
        return `
            <div class="project-item">
                <h4>${project.name}</h4>
                <div class="project-meta">
                    <span>📍 ${project.address}, ${project.city}, ${project.state}</span>
                    <span>👤 ${project.customer}</span>
                    <span class="project-status">${project.status}</span>
                    <span>💰 ${formatCurrency(project.contractAmount)} (${progress}% billed)</span>
                </div>
                <div style="margin-top:10px; font-size:0.85em; color:#666;">
                    ${project.notes ? '📝 ' + project.notes : ''}
                </div>
            </div>
        `;
    }).join('');
}

function updatePayrollSummary() {
    const list = document.getElementById('payrollList');
    
    // Group by employee and sum
    const byEmployee = {};
    currentData.payroll.forEach(p => {
        if (!byEmployee[p.name]) {
            byEmployee[p.name] = { daysWorked: 0, amount: 0, phone: p.phone, rate: p.rateType };
        }
        byEmployee[p.name].daysWorked += p.daysWorked;
        byEmployee[p.name].amount += p.amount;
    });
    
    if (Object.keys(byEmployee).length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No payroll entries</p>';
        return;
    }
    
    list.innerHTML = Object.entries(byEmployee).map(([name, data]) => `
        <div class="payroll-row">
            <div>${name}</div>
            <div>${data.daysWorked} days</div>
            <div>${data.rate}</div>
            <div><strong>${formatCurrency(data.amount)}</strong></div>
        </div>
    `).join('');
}

// ============================================================================
// CHARTS
// ============================================================================

function updateCharts() {
    updateRevenueChart();
}

function updateRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Group invoices by month
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    currentData.invoices.forEach(inv => {
        if (inv.status === 'Paid') {
            const monthKey = `${inv.date.getFullYear()}-${inv.date.getMonth()}`;
            const monthLabel = `${months[inv.date.getMonth()]} ${inv.date.getFullYear()}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { label: monthLabel, amount: 0 };
            }
            monthlyData[monthKey].amount += inv.amount;
        }
    });
    
    const sorted = Object.values(monthlyData).sort((a, b) => {
        const dateA = new Date(a.label);
        const dateB = new Date(b.label);
        return dateA - dateB;
    });
    
    const labels = sorted.map(m => m.label);
    const data = sorted.map(m => m.amount);
    
    if (charts.revenue) {
        charts.revenue.destroy();
    }
    
    charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: data,
                borderColor: '#1f4788',
                backgroundColor: 'rgba(31, 71, 136, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#1f4788',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => '$' + value.toLocaleString(),
                    },
                },
            },
        },
    });
}

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// ============================================================================
// FORM SUBMISSIONS
// ============================================================================

function submitInvoice() {
    const customer = document.getElementById('invoiceCustomer').value;
    const amount = parseFloat(document.getElementById('invoiceAmount').value);
    const date = document.getElementById('invoiceDate').value;
    const description = document.getElementById('invoiceDescription').value;
    
    if (!customer || !amount || !date) {
        alert('Please fill in all required fields');
        return;
    }
    
    const invoice = {
        number: `INV-${Date.now()}`,
        date: new Date(date),
        customer: customer,
        amount: amount,
        status: 'Pending',
        paidDate: null,
        balance: amount,
        daysOutstanding: 0,
    };
    
    currentData.invoices.push(invoice);
    alert(`✅ Invoice created for $${amount.toFixed(2)}`);
    closeModal('invoiceModal');
    
    // Reset form
    document.getElementById('invoiceCustomer').value = '';
    document.getElementById('invoiceAmount').value = '';
    document.getElementById('invoiceDescription').value = '';
    document.getElementById('invoiceDate').valueAsDate = new Date();
    
    updateDashboard();
}

function submitBid() {
    const customer = document.getElementById('bidCustomer').value;
    const address = document.getElementById('bidAddress').value;
    const amount = parseFloat(document.getElementById('bidAmount').value);
    const scope = document.getElementById('bidScope').value;
    
    if (!customer || !amount || !scope) {
        alert('Please fill in all required fields');
        return;
    }
    
    const bid = {
        number: `BID-${Date.now()}`,
        date: new Date(),
        customer: customer,
        address: address,
        scope: scope,
        amount: amount,
        status: 'Open',
        notes: '',
    };
    
    currentData.bids.push(bid);
    alert(`✅ Bid created for $${amount.toFixed(2)}`);
    closeModal('bidModal');
    
    // Reset form
    document.getElementById('bidCustomer').value = '';
    document.getElementById('bidAddress').value = '';
    document.getElementById('bidAmount').value = '';
    document.getElementById('bidScope').value = '';
    
    updateDashboard();
}

function submitExpense() {
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!date || !category || !amount) {
        alert('Please fill in all required fields');
        return;
    }
    
    alert(`✅ Expense logged: $${amount.toFixed(2)} for ${category}`);
    closeModal('expenseModal');
    
    // Reset form
    document.getElementById('expenseDate').valueAsDate = new Date();
    document.getElementById('expenseCategory').value = '';
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function filterInvoices(status) {
    // Update active tab
    document.querySelectorAll('.invoice-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateInvoiceTable(status);
}

function refreshData() {
    loadData();
    alert('✅ Data refreshed');
}

function exportToCSV() {
    const csv = convertToCSV(currentData.invoices);
    downloadCSV(csv, 'teamwork_invoices.csv');
}

function convertToCSV(data) {
    const headers = ['Invoice #', 'Date', 'Customer', 'Amount', 'Status', 'Balance', 'Days Outstanding'];
    const rows = data.map(inv => [
        inv.number,
        formatDate(inv.date),
        inv.customer,
        inv.amount,
        inv.status,
        inv.balance,
        inv.daysOutstanding,
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

function formatDate(date) {
    if (!date) return '--';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function showHelp() {
    alert(`TeamWork Hub Dashboard Help\n\n` +
          `1. SETUP: Open the Google Sheet and click "Initialize" from the menu\n` +
          `2. IMPORT: Click "Import from Skynova" to sync invoices\n` +
          `3. CREATE: Use Quick Actions to add invoices, bids, or expenses\n` +
          `4. TRACK: Monitor KPIs, receivables aging, and project status\n` +
          `5. EXPORT: Download reports as CSV\n\n` +
          `Questions? Contact your admin.`);
}

// Ready!
console.log('TeamWork Hub Dashboard loaded successfully');
