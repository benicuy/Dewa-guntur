// Cek admin
if (!currentUser || !currentUser.isAdmin) {
    window.location.href = 'index.html';
}

// Data VIP levels (sama dengan di auth.js)
const vipLevels = {
    0: { name: 'Reguler', luck: 5, price: 0, maxTopup: 10000, color: '#95a5a6' },
    1: { name: 'VIP 1', luck: 10, price: 25000, maxTopup: 30000, color: '#3498db' },
    2: { name: 'VIP 2', luck: 15, price: 75000, maxTopup: 150000, color: '#9b59b6' },
    3: { name: 'VIP 3', luck: 20, price: 150000, maxTopup: 500000, color: '#f1c40f' },
    4: { name: 'VIP 4', luck: 25, price: 600000, maxTopup: 1000000, color: '#e67e22' }
};

// Load admin data
function loadAdminData() {
    loadUsers();
    loadTopups();
    loadWithdraws();
    loadVIPRequests();
    updateAdminStats();
}

// Update admin stats
function updateAdminStats() {
    const totalUsers = document.getElementById('totalUsers');
    const totalBalance = document.getElementById('totalBalance');
    const totalSpinsAdmin = document.getElementById('totalSpinsAdmin');
    const totalMahjongAdmin = document.getElementById('totalMahjongAdmin');
    const pendingTopup = document.getElementById('pendingTopup');
    const pendingWithdraw = document.getElementById('pendingWithdraw');
    const pendingVIP = document.getElementById('pendingVIP');

    if (totalUsers) {
        const userCount = users.filter(u => !u.isAdmin).length;
        totalUsers.textContent = userCount;
    }

    if (totalBalance) {
        const balanceSum = users.reduce((sum, u) => sum + (u.balance || 0), 0);
        totalBalance.textContent = `Rp ${balanceSum.toLocaleString('id-ID')}`;
    }

    if (totalSpinsAdmin) {
        const spinSum = users.reduce((sum, u) => sum + (u.totalSpins || 0), 0);
        totalSpinsAdmin.textContent = spinSum;
    }

    if (totalMahjongAdmin) {
        const mahjongSum = users.reduce((sum, u) => sum + (u.totalMahjong || 0), 0);
        totalMahjongAdmin.textContent = mahjongSum;
    }

    if (pendingTopup) {
        const pending = topups.filter(t => t.status === 'pending').length;
        pendingTopup.textContent = pending;
    }

    if (pendingWithdraw) {
        const pending = withdraws.filter(w => w.status === 'pending').length;
        pendingWithdraw.textContent = pending;
    }

    // Hitung pending VIP requests
    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    if (pendingVIP) {
        const pending = vipRequests.filter(v => v.status === 'pending').length;
        pendingVIP.textContent = pending;
    }
}

// Load users
function loadUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    usersList.innerHTML = '';
    const nonAdminUsers = users.filter(u => !u.isAdmin);

    nonAdminUsers.forEach(user => {
        const tr = document.createElement('tr');
        const vipLevel = user.vipLevel || 0;
        const vipName = vipLevels[vipLevel]?.name || 'Reguler';
        
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>Rp ${(user.balance || 0).toLocaleString('id-ID')}</td>
            <td>${vipName}</td>
            <td>${user.luck || 5}%</td>
            <td>
                <div class="admin-actions">
                    <button class="admin-btn edit" onclick="editUserVIP(${user.id})">Edit VIP</button>
                    <button class="admin-btn delete" onclick="deleteUser(${user.id})">Hapus</button>
                </div>
            </td>
        `;
        usersList.appendChild(tr);
    });
}

// Edit user VIP (manual by admin)
function editUserVIP(userId) {
    const newLevel = prompt('Masukkan level VIP baru (0-4):\n0 = Reguler\n1 = VIP 1\n2 = VIP 2\n3 = VIP 3\n4 = VIP 4', '0');
    if (newLevel === null) return;
    
    const level = parseInt(newLevel);
    if (level < 0 || level > 4 || isNaN(level)) {
        showNotification('Level VIP harus antara 0-4!', 'error');
        return;
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].vipLevel = level;
        users[userIndex].luck = vipLevels[level].luck;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update currentUser jika sedang login
        if (currentUser && currentUser.id === userId) {
            currentUser.vipLevel = level;
            currentUser.luck = vipLevels[level].luck;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        loadUsers();
        showNotification(`User diupdate ke ${vipLevels[level].name}!`, 'success');
    }
}

// Delete user
function deleteUser(userId) {
    if (confirm('Yakin ingin menghapus user ini? Semua data akan hilang!')) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        updateAdminStats();
        showNotification('User berhasil dihapus!', 'success');
    }
}

// Load topups
function loadTopups() {
    const topupsList = document.getElementById('topupsList');
    if (!topupsList) return;

    topupsList.innerHTML = '';
    
    // Sort by date descending
    topups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    topups.forEach(topup => {
        const tr = document.createElement('tr');
        const date = new Date(topup.createdAt).toLocaleDateString('id-ID');
        
        let proofHtml = '-';
        if (topup.proofUrl) {
            if (topup.proofUrl.startsWith('data:image')) {
                proofHtml = `<img src="${topup.proofUrl}" class="proof-thumbnail" onclick="viewProof('${topup.proofUrl}', 'Top Up', '${topup.username}', '${topup.amount}', '${topup.method}', '${topup.senderName}', '${topup.transferDate}')">`;
            } else {
                proofHtml = `<a href="#" class="proof-link" onclick="viewProof('${topup.proofUrl}', 'Top Up', '${topup.username}', '${topup.amount}', '${topup.method}', '${topup.senderName}', '${topup.transferDate}')">Lihat</a>`;
            }
        }
        
        tr.innerHTML = `
            <td>${topup.username}</td>
            <td>Rp ${topup.amount.toLocaleString('id-ID')}</td>
            <td>${topup.method}</td>
            <td>${topup.senderName}</td>
            <td>${date}</td>
            <td>${proofHtml}</td>
            <td>
                <span class="history-status ${topup.status === 'success' ? 'status-success' : topup.status === 'pending' ? 'status-pending' : 'status-failed'}">
                    ${topup.status}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    ${topup.status === 'pending' ? `
                        <button class="admin-btn approve" onclick="approveTopup(${topup.id})">Approve</button>
                        <button class="admin-btn reject" onclick="rejectTopup(${topup.id})">Reject</button>
                    ` : '-'}
                </div>
            </td>
        `;
        topupsList.appendChild(tr);
    });
}

// Approve topup
function approveTopup(topupId) {
    const topup = topups.find(t => t.id === topupId);
    if (!topup) return;

    // Update status
    topup.status = 'success';
    
    // Tambah saldo user
    const user = users.find(u => u.id === topup.userId);
    if (user) {
        user.balance = (user.balance || 0) + topup.amount;
        
        // Update history
        const history = histories.find(h => h.userId === user.id && h.type === 'topup' && h.status === 'pending');
        if (history) {
            history.status = 'success';
            history.description = `Top Up Rp ${topup.amount.toLocaleString('id-ID')} via ${topup.method} (Berhasil)`;
        }
    }

    localStorage.setItem('topups', JSON.stringify(topups));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('histories', JSON.stringify(histories));

    loadTopups();
    updateAdminStats();
    showNotification('Top up berhasil diapprove!', 'success');
}

// Reject topup
function rejectTopup(topupId) {
    const topup = topups.find(t => t.id === topupId);
    if (!topup) return;

    topup.status = 'failed';
    
    // Update history
    const history = histories.find(h => h.userId === topup.userId && h.type === 'topup' && h.status === 'pending');
    if (history) {
        history.status = 'failed';
        history.description = `Top Up Rp ${topup.amount.toLocaleString('id-ID')} via ${topup.method} (Gagal)`;
    }

    localStorage.setItem('topups', JSON.stringify(topups));
    localStorage.setItem('histories', JSON.stringify(histories));

    loadTopups();
    updateAdminStats();
    showNotification('Top up ditolak!', 'error');
}

// Load withdraws
function loadWithdraws() {
    const withdrawsList = document.getElementById('withdrawsList');
    if (!withdrawsList) return;

    withdrawsList.innerHTML = '';
    
    // Sort by date descending
    withdraws.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    withdraws.forEach(withdraw => {
        const tr = document.createElement('tr');
        const date = new Date(withdraw.createdAt).toLocaleDateString('id-ID');
        
        tr.innerHTML = `
            <td>${withdraw.username}</td>
            <td>Rp ${withdraw.amount.toLocaleString('id-ID')}</td>
            <td>${withdraw.method}</td>
            <td>${withdraw.accountNumber}</td>
            <td>${withdraw.accountName}</td>
            <td>${date}</td>
            <td>
                <span class="history-status ${withdraw.status === 'success' ? 'status-success' : withdraw.status === 'pending' ? 'status-pending' : 'status-failed'}">
                    ${withdraw.status}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    ${withdraw.status === 'pending' ? `
                        <button class="admin-btn approve" onclick="approveWithdraw(${withdraw.id})">Approve</button>
                        <button class="admin-btn reject" onclick="rejectWithdraw(${withdraw.id})">Reject</button>
                    ` : '-'}
                </div>
            </td>
        `;
        withdrawsList.appendChild(tr);
    });
}

// Approve withdraw
function approveWithdraw(withdrawId) {
    const withdraw = withdraws.find(w => w.id === withdrawId);
    if (!withdraw) return;

    withdraw.status = 'success';
    
    // Update history
    const history = histories.find(h => h.userId === withdraw.userId && h.type === 'withdraw' && h.status === 'pending');
    if (history) {
        history.status = 'success';
        history.description = `Withdraw Rp ${withdraw.amount.toLocaleString('id-ID')} via ${withdraw.method} (Berhasil)`;
    }

    localStorage.setItem('withdraws', JSON.stringify(withdraws));
    localStorage.setItem('histories', JSON.stringify(histories));

    loadWithdraws();
    updateAdminStats();
    showNotification('Withdraw berhasil diapprove!', 'success');
}

// Reject withdraw
function rejectWithdraw(withdrawId) {
    const withdraw = withdraws.find(w => w.id === withdrawId);
    if (!withdraw) return;

    withdraw.status = 'failed';
    
    // Kembalikan saldo user
    const user = users.find(u => u.id === withdraw.userId);
    if (user) {
        user.balance = (user.balance || 0) + withdraw.amount;
    }

    // Update history
    const history = histories.find(h => h.userId === withdraw.userId && h.type === 'withdraw' && h.status === 'pending');
    if (history) {
        history.status = 'failed';
        history.description = `Withdraw Rp ${withdraw.amount.toLocaleString('id-ID')} via ${withdraw.method} (Gagal)`;
    }

    localStorage.setItem('withdraws', JSON.stringify(withdraws));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('histories', JSON.stringify(histories));

    loadWithdraws();
    updateAdminStats();
    showNotification('Withdraw ditolak! Saldo dikembalikan.', 'error');
}

// Load VIP requests
function loadVIPRequests() {
    const vipsList = document.getElementById('vipsList');
    if (!vipsList) {
        console.log('VIP list element not found');
        return;
    }

    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    console.log('VIP Requests:', vipRequests); // Untuk debugging
    
    vipsList.innerHTML = '';
    
    if (vipRequests.length === 0) {
        vipsList.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">Tidak ada request VIP</td></tr>';
        return;
    }
    
    // Sort by date descending
    vipRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    vipRequests.forEach(request => {
        const tr = document.createElement('tr');
        const date = new Date(request.createdAt).toLocaleDateString('id-ID');
        const transferDate = request.transferDate ? new Date(request.transferDate).toLocaleDateString('id-ID') : '-';
        
        let methodDisplay = request.method || '-';
        if (request.method === 'QRIS') {
            methodDisplay = 'QRIS 📱';
        } else if (request.method === 'DANA') {
            methodDisplay = 'DANA 📱';
        } else if (request.method === 'OVO') {
            methodDisplay = 'OVO 📱';
        }
        
        let proofHtml = '-';
        if (request.proofUrl) {
            if (request.proofUrl.startsWith('data:image')) {
                proofHtml = `<img src="${request.proofUrl}" class="proof-thumbnail" onclick="viewProof('${request.proofUrl}', 'VIP', '${request.username}', '${request.amount}', '${methodDisplay}', '${request.senderName || '-'}', '${transferDate}')">`;
            } else {
                proofHtml = `<a href="#" class="proof-link" onclick="viewProof('${request.proofUrl}', 'VIP', '${request.username}', '${request.amount}', '${methodDisplay}', '${request.senderName || '-'}', '${transferDate}')">Lihat</a>`;
            }
        }
        
        tr.innerHTML = `
            <td>${request.username || '-'}</td>
            <td>${request.vipName || '-'}</td>
            <td>Rp ${(request.amount || 0).toLocaleString('id-ID')}</td>
            <td>${methodDisplay}</td>
            <td>${request.senderName || '-'}</td>
            <td>${date}</td>
            <td>${proofHtml}</td>
            <td>
                <span class="history-status ${request.status === 'success' ? 'status-success' : request.status === 'pending' ? 'status-pending' : 'status-failed'}">
                    ${request.status || 'pending'}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    ${(!request.status || request.status === 'pending') ? `
                        <button class="admin-btn approve" onclick="approveVIP(${request.id})">Approve</button>
                        <button class="admin-btn reject" onclick="rejectVIP(${request.id})">Reject</button>
                    ` : '-'}
                </div>
            </td>
        `;
        vipsList.appendChild(tr);
    });
}

// Approve VIP
function approveVIP(requestId) {
    console.log('Approving VIP request:', requestId); // Untuk debugging
    
    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    const requestIndex = vipRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
        showNotification('Request tidak ditemukan!', 'error');
        return;
    }
    
    const request = vipRequests[requestIndex];
    
    // Update status
    vipRequests[requestIndex].status = 'success';
    localStorage.setItem('vipRequests', JSON.stringify(vipRequests));
    
    // Update user VIP level
    const userIndex = users.findIndex(u => u.id === request.userId);
    if (userIndex !== -1) {
        users[userIndex].vipLevel = request.vipLevel;
        users[userIndex].luck = request.luck || vipLevels[request.vipLevel].luck;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update currentUser jika sedang login
        if (currentUser && currentUser.id === request.userId) {
            currentUser.vipLevel = request.vipLevel;
            currentUser.luck = request.luck || vipLevels[request.vipLevel].luck;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Update history
        const historyIndex = histories.findIndex(h => h.userId === request.userId && h.type === 'vip' && h.status === 'pending');
        if (historyIndex !== -1) {
            histories[historyIndex].status = 'success';
            histories[historyIndex].description = `Pembelian ${request.vipName} - Berhasil (Disetujui Admin)`;
            localStorage.setItem('histories', JSON.stringify(histories));
        }
        
        showNotification(`✅ VIP ${request.vipName} untuk user ${request.username} telah disetujui!`, 'success');
    } else {
        showNotification('User tidak ditemukan!', 'error');
    }
    
    // Reload data
    loadVIPRequests();
    updateAdminStats();
}

// Reject VIP
function rejectVIP(requestId) {
    console.log('Rejecting VIP request:', requestId); // Untuk debugging
    
    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    const requestIndex = vipRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
        showNotification('Request tidak ditemukan!', 'error');
        return;
    }
    
    const request = vipRequests[requestIndex];
    
    // Update status
    vipRequests[requestIndex].status = 'failed';
    localStorage.setItem('vipRequests', JSON.stringify(vipRequests));
    
    // Update history
    const historyIndex = histories.findIndex(h => h.userId === request.userId && h.type === 'vip' && h.status === 'pending');
    if (historyIndex !== -1) {
        histories[historyIndex].status = 'failed';
        histories[historyIndex].description = `Pembelian ${request.vipName} - Ditolak Admin`;
        localStorage.setItem('histories', JSON.stringify(histories));
    }
    
    showNotification(`❌ VIP request ditolak!`, 'error');
    
    // Reload data
    loadVIPRequests();
    updateAdminStats();
}

// View proof (general function for all proofs)
function viewProof(proofUrl, type, username, amount, method, senderName, transferDate) {
    const modal = document.getElementById('proofModal');
    const proofImage = document.getElementById('proofImage');
    const proofInfo = document.getElementById('proofInfo');
    
    proofImage.src = proofUrl;
    proofInfo.innerHTML = `
        <p><strong>Tipe:</strong> ${type}</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Jumlah:</strong> Rp ${parseInt(amount).toLocaleString('id-ID')}</p>
        <p><strong>Metode:</strong> ${method}</p>
        <p><strong>Pengirim:</strong> ${senderName}</p>
        <p><strong>Tanggal Transfer:</strong> ${transferDate}</p>
    `;
    
    modal.style.display = 'block';
}

// Close proof modal
function closeProofModal() {
    document.getElementById('proofModal').style.display = 'none';
}

// Show admin tab
function showAdminTab(tab) {
    console.log('Showing tab:', tab); // Untuk debugging
    
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-panel');
    
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    
    const activeTab = document.querySelector(`[onclick="showAdminTab('${tab}')"]`);
    const activePanel = document.getElementById(`${tab}Panel`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activePanel) activePanel.classList.add('active');
    
    // Reload data for the active tab
    if (tab === 'vips') {
        loadVIPRequests();
    } else if (tab === 'topups') {
        loadTopups();
    } else if (tab === 'withdraws') {
        loadWithdraws();
    } else if (tab === 'users') {
        loadUsers();
    }
}

// Save settings
function saveSettings() {
    const defaultLuck = document.getElementById('defaultLuck')?.value;
    const bonusAmount = document.getElementById('bonusAmount')?.value;
    const minSpin = document.getElementById('minSpin')?.value;
    const maxSpin = document.getElementById('maxSpin')?.value;

    const settings = {
        defaultLuck: parseInt(defaultLuck) || 5,
        bonusAmount: parseInt(bonusAmount) || 2000,
        minSpin: parseInt(minSpin) || 10000,
        maxSpin: parseInt(maxSpin) || 500000
    };

    localStorage.setItem('settings', JSON.stringify(settings));
    showNotification('Pengaturan berhasil disimpan!', 'success');
}

// Load settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        defaultLuck: 5,
        bonusAmount: 2000,
        minSpin: 10000,
        maxSpin: 500000
    };

    const defaultLuck = document.getElementById('defaultLuck');
    const bonusAmount = document.getElementById('bonusAmount');
    const minSpin = document.getElementById('minSpin');
    const maxSpin = document.getElementById('maxSpin');

    if (defaultLuck) defaultLuck.value = settings.defaultLuck;
    if (bonusAmount) bonusAmount.value = settings.bonusAmount;
    if (minSpin) minSpin.value = settings.minSpin;
    if (maxSpin) maxSpin.value = settings.maxSpin;
}

// Show notification
function showNotification(message, type) {
    // Gunakan fungsi dari auth.js jika ada
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inisialisasi admin page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin page loaded'); // Untuk debugging
    loadAdminData();
    loadSettings();
});
