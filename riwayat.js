// Load history
function loadHistory(filter = 'all') {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (!currentUser) {
        historyList.innerHTML = '<p style="text-align: center; padding: 20px;">Silakan login untuk melihat riwayat</p>';
        return;
    }

    let userHistories = histories.filter(h => h.userId === currentUser.id);

    if (filter !== 'all') {
        userHistories = userHistories.filter(h => h.type === filter);
    }

    // Sort by date descending
    userHistories.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (userHistories.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; padding: 20px;">Tidak ada riwayat transaksi</p>';
        return;
    }

    historyList.innerHTML = '';
    userHistories.forEach(history => {
        const item = document.createElement('div');
        item.className = `history-item ${history.type}`;

        const date = new Date(history.date);
        const formattedDate = date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let amountClass = 'history-amount';
        let amountText = '';
        
        if (history.type === 'spin') {
            amountText = `Rp ${Math.abs(history.amount).toLocaleString('id-ID')}`;
            if (history.prize > 0) {
                amountText += ` → Dapat Rp ${history.prize.toLocaleString('id-ID')}`;
            } else {
                amountText += ` → Coba Lagi`;
            }
        } else if (history.type === 'mahjong') {
            amountText = `Rp ${Math.abs(history.amount).toLocaleString('id-ID')}`;
            if (history.prize > 0) {
                amountText += ` → Menang Rp ${history.prize.toLocaleString('id-ID')}`;
            } else {
                amountText += ` → Kalah`;
            }
        } else if (history.type === 'topup') {
            amountClass += ' positive';
            amountText = `+ Rp ${history.amount.toLocaleString('id-ID')}`;
        } else if (history.type === 'withdraw') {
            amountClass += ' negative';
            amountText = `- Rp ${Math.abs(history.amount).toLocaleString('id-ID')}`;
        } else if (history.type === 'prize') {
            amountClass += ' positive';
            amountText = `+ Rp ${history.amount.toLocaleString('id-ID')}`;
        }

        let statusHtml = '';
        if (history.status) {
            const statusClass = history.status === 'success' ? 'status-success' : 
                               history.status === 'pending' ? 'status-pending' : 'status-failed';
            statusHtml = `<span class="history-status ${statusClass}">${history.status}</span>`;
        }

        item.innerHTML = `
            <div class="history-info">
                <h4>${history.description}</h4>
                <p>${formattedDate}</p>
                ${statusHtml}
            </div>
            <div class="${amountClass}">${amountText}</div>
        `;

        historyList.appendChild(item);
    });
}

// Filter history
function filterHistory(filter) {
    const filters = document.querySelectorAll('.filter-btn');
    filters.forEach(f => f.classList.remove('active'));
    event.target.classList.add('active');
    loadHistory(filter);
}

// Load history on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});