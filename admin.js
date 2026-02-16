// Cek admin
if (!currentUser || !currentUser.isAdmin) {
    window.location.href = 'index.html';
}

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
    const newLevel = prompt('Masukkan level VIP baru (0-4):', '0');
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
        loadUsers();
        showNotification(`User diupdate ke ${vipLevels[level].name}!`, 'success');
    }
}

// Delete user
function deleteUser(userId) {
    if (confirm('Yakin ingin menghapus user ini?')) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        updateAdminStats();
        showNotification('User berhasil dihapus!', 'success');
    }
}

// Load VIP requests
function loadVIPRequests() {
    const vipsList = document.getElementById('vipsList');
    if (!vipsList) return;

    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    
    vipsList.innerHTML = '';
    
    // Sort by date descending
    vipRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    vipRequests.forEach(request => {
        const tr = document.createElement('tr');
        const date = new Date(request.createdAt).toLocaleDateString('id-ID');
        const transferDate = new Date(request.transferDate).toLocaleDateString('id-ID');
        
        let proofHtml = '-';
        if (request.proofUrl) {
            if (request.proofUrl.startsWith('data:image')) {
                proofHtml = `<img src="${request.proofUrl}" class="proof-thumbnail" onclick="viewVIPProof('${request.proofUrl}', '${request.username}', '${request.vipName}', '${request.amount}', '${request.method}', '${request.senderName}', '${transferDate}')">`;
            } else {
                proofHtml = `<a href="#" class="proof-link" onclick="viewVIPProof('${request.proofUrl}', '${request.username}', '${request.vipName}', '${request.amount}', '${request.method}', '${request.senderName}', '${transferDate}')">Lihat</a>`;
            }
        }
        
        tr.innerHTML = `
            <td>${request.username}</td>
            <td>${request.vipName}</td>
            <td>Rp ${request.amount.toLocaleString('id-ID')}</td>
            <td>${request.method}</td>
            <td>${request.senderName}</td>
            <td>${date}</td>
            <td>${proofHtml}</td>
            <td>
                <span class="history-status ${request.status === 'success' ? 'status-success' : request.status === 'pending' ? 'status-pending' : 'status-failed'}">
                    ${request.status}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    ${request.status === 'pending' ? `
                        <button class="admin-btn approve" onclick="approveVIP(${request.id})">Approve</button>
                        <button class="admin-btn reject" onclick="rejectVIP(${request.id})">Reject</button>
                    ` : '-'}
                </div>
            </td>
        `;
        vipsList.appendChild(tr);
    });
}

// View VIP proof
function viewVIPProof(proofUrl, username, vipName, amount, method, senderName, transferDate) {
    const modal = document.getElementById('proofModal');
    const proofImage = document.getElementById('proofImage');
    const proofInfo = document.getElementById('proofInfo');
    
    proofImage.src = proofUrl;
    proofInfo.innerHTML = `
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>VIP:</strong> ${vipName}</p>
        <p><strong>Jumlah:</strong> Rp ${parseInt(amount).toLocaleString('id-ID')}</p>
        <p><strong>Metode:</strong> ${method}</p>
        <p><strong>Pengirim:</strong> ${senderName}</p>
        <p><strong>Tanggal Transfer:</strong> ${transferDate}</p>
    `;
    
    modal.style.display = 'block';
}

// Approve VIP
function approveVIP(requestId) {
    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    const request = vipRequests.find(r => r.id === requestId);
    
    if (!request) return;
    
    // Update status
    request.status = 'success';
    
    // Update user VIP level
    const user = users.find(u => u.id === request.userId);
    if (user) {
        user.vipLevel = request.vipLevel;
        user.luck = vipLevels[request.vipLevel].luck;
        
        // Update history
        const history = histories.find(h => h.userId === user.id && h.type === 'vip' && h.status === 'pending');
        if (history) {
            history.status = 'success';
            history.description = `Pembelian ${request.vipName} - Berhasil`;
        }
    }
    
    localStorage.setItem('vipRequests', JSON.stringify(vipRequests));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('histories', JSON.stringify(histories));
    
    loadVIPRequests();
    updateAdminStats();
    showNotification(`VIP ${request.vipName} berhasil diapprove!`, 'success');
}

// Reject VIP
function rejectVIP(requestId) {
    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    const request = vipRequests.find(r => r.id === requestId);
    
    if (!request) return;
    
    request.status = 'failed';
    
    // Update history
    const history = histories.find(h => h.userId === request.userId && h.type === 'vip' && h.status === 'pending');
    if (history) {
        history.status = 'failed';
        history.description = `Pembelian ${request.vipName} - Ditolak`;
    }
    
    localStorage.setItem('vipRequests', JSON.stringify(vipRequests));
    localStorage.setItem('histories', JSON.stringify(histories));
    
    loadVIPRequests();
    updateAdminStats();
    showNotification('VIP request ditolak!', 'error');
}

// Close proof modal
function closeProofModal() {
    document.getElementById('proofModal').style.display = 'none';
}

// Show admin tab
function showAdminTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-panel');
    
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    
    document.querySelector(`[onclick="showAdminTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}Panel`).classList.add('active');
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

// ... (kode admin.js sebelumnya tetap sama, tambahkan fungsi ini)

// Approve VIP
function approveVIP(requestId) {
    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    const requestIndex = vipRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return;
    
    const request = vipRequests[requestIndex];
    
    // Update status
    vipRequests[requestIndex].status = 'success';
    localStorage.setItem('vipRequests', JSON.stringify(vipRequests));
    
    // Update user VIP level
    const userIndex = users.findIndex(u => u.id === request.userId);
    if (userIndex !== -1) {
        users[userIndex].vipLevel = request.vipLevel;
        users[userIndex].luck = request.luck;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update currentUser jika sedang login
        if (currentUser && currentUser.id === request.userId) {
            currentUser.vipLevel = request.vipLevel;
            currentUser.luck = request.luck;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
    
    // Update history
    const historyIndex = histories.findIndex(h => h.userId === request.userId && h.type === 'vip' && h.status === 'pending');
    if (historyIndex !== -1) {
        histories[historyIndex].status = 'success';
        histories[historyIndex].description = `Pembelian ${request.vipName} - Berhasil (Disetujui Admin)`;
        localStorage.setItem('histories', JSON.stringify(histories));
    }
    
    // Notifikasi ke user (simulasi)
    showNotification(`✅ VIP ${request.vipName} untuk user ${request.username} telah disetujui!`, 'success');
    
    // Reload data
    loadVIPRequests();
    updateAdminStats();
}

// Reject VIP
function rejectVIP(requestId) {
    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    const requestIndex = vipRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return;
    
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
    
   }
   // Di fungsi loadVIPRequests, update bagian tampilan method
// ... (kode admin.js sebelumnya)

// Load VIP requests
function loadVIPRequests() {
    const vipsList = document.getElementById('vipsList');
    if (!vipsList) return;

    const vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    
    vipsList.innerHTML = '';
    
    // Sort by date descending
    vipRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    vipRequests.forEach(request => {
        const tr = document.createElement('tr');
        const date = new Date(request.createdAt).toLocaleDateString('id-ID');
        const transferDate = new Date(request.transferDate).toLocaleDateString('id-ID');
        
        let methodDisplay = request.method;
        if (request.method === 'QRIS') {
            methodDisplay = 'QRIS 📱';
        }
        
        let proofHtml = '-';
        if (request.proofUrl) {
            if (request.proofUrl.startsWith('data:image')) {
                proofHtml = `<img src="${request.proofUrl}" class="proof-thumbnail" onclick="viewVIPProof('${request.proofUrl}', '${request.username}', '${request.vipName}', '${request.amount}', '${methodDisplay}', '${request.senderName}', '${transferDate}')">`;
            } else {
                proofHtml = `<a href="#" class="proof-link" onclick="viewVIPProof('${request.proofUrl}', '${request.username}', '${request.vipName}', '${request.amount}', '${methodDisplay}', '${request.senderName}', '${transferDate}')">Lihat</a>`;
            }
        }
        
        tr.innerHTML = `
            <td>${request.username}</td>
            <td>${request.vipName}</td>
            <td>Rp ${request.amount.toLocaleString('id-ID')}</td>
            <td>${methodDisplay}</td>
            <td>${request.senderName}</td>
            <td>${date}</td>
            <td>${proofHtml}</td>
            <td>
                <span class="history-status ${request.status === 'success' ? 'status-success' : request.status === 'pending' ? 'status-pending' : 'status-failed'}">
                    ${request.status}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    ${request.status === 'pending' ? `
                        <button class="admin-btn approve" onclick="approveVIP(${request.id})">Approve</button>
                        <button class="admin-btn reject" onclick="rejectVIP(${request.id})">Reject</button>
                    ` : '-'}
                </div>
            </td>
        `;
        vipsList.appendChild(tr);
    });
}

// View VIP proof
function viewVIPProof(proofUrl, username, vipName, amount, method, senderName, transferDate) {
    const modal = document.getElementById('proofModal');
    const proofImage = document.getElementById('proofImage');
    const proofInfo = document.getElementById('proofInfo');
    
    proofImage.src = proofUrl;
    proofInfo.innerHTML = `
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>VIP:</strong> ${vipName}</p>
        <p><strong>Jumlah:</strong> Rp ${parseInt(amount).toLocaleString('id-ID')}</p>
        <p><strong>Metode:</strong> ${method}</p>
        <p><strong>Pengirim:</strong> ${senderName}</p>
        <p><strong>Tanggal Transfer:</strong> ${transferDate}</p>
    `;
    
    modal.style.display = 'block';
}