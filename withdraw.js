// Submit withdraw
function submitWithdraw() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        window.location.href = 'index.html';
        return;
    }

    const amount = parseInt(document.getElementById('withdrawAmount')?.value);
    const method = document.getElementById('withdrawMethod')?.value;
    const accountNumber = document.getElementById('accountNumber')?.value;
    const accountName = document.getElementById('accountName')?.value;

    if (!amount || amount < 50000) {
        showNotification('Minimal withdraw Rp 50.000!', 'error');
        return;
    }

    if (amount > 10000000) {
        showNotification('Maksimal withdraw Rp 10.000.000 per hari!', 'error');
        return;
    }

    if (amount > currentUser.balance) {
        showNotification('Saldo tidak mencukupi!', 'error');
        return;
    }

    if (!method || !accountNumber || !accountName) {
        showNotification('Semua field harus diisi!', 'error');
        return;
    }

    const withdraw = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        amount: amount,
        method: method,
        accountNumber: accountNumber,
        accountName: accountName,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    withdraws.push(withdraw);
    localStorage.setItem('withdraws', JSON.stringify(withdraws));

    // Kurangi saldo sementara
    currentUser.balance -= amount;
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Tambah ke history
    const history = {
        id: Date.now(),
        userId: currentUser.id,
        type: 'withdraw',
        amount: -amount,
        description: `Withdraw Rp ${amount.toLocaleString('id-ID')} via ${method} (Pending)`,
        status: 'pending',
        date: new Date().toISOString()
    };
    histories.push(history);
    localStorage.setItem('histories', JSON.stringify(histories));

    showNotification('Permintaan withdraw berhasil dikirim! Menunggu verifikasi admin.', 'success');
    
    // Reset form
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('accountNumber').value = '';
    document.getElementById('accountName').value = '';

    // Update balance display
    const balanceDisplay = document.getElementById('balanceDisplay');
    if (balanceDisplay) {
        balanceDisplay.textContent = `Rp ${currentUser.balance.toLocaleString('id-ID')}`;
    }

    setTimeout(() => {
        window.location.href = 'riwayat.html';
    }, 2000);
}