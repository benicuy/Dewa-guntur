// Data users
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Data transaksi
let topups = JSON.parse(localStorage.getItem('topups')) || [];
let withdraws = JSON.parse(localStorage.getItem('withdraws')) || [];
let histories = JSON.parse(localStorage.getItem('histories')) || [];

// Data VIP
const vipLevels = {
    0: { 
        name: 'Reguler', 
        luck: 5, 
        price: 0, 
        maxTopup: 10000, 
        color: '#95a5a6',
        games: ['duofacai']
    },
    1: { 
        name: 'VIP 1', 
        luck: 10, 
        price: 25000, 
        maxTopup: 30000, 
        color: '#3498db',
        games: ['duofacai', 'zeus']
    },
    2: { 
        name: 'VIP 2', 
        luck: 15, 
        price: 75000, 
        maxTopup: 150000, 
        color: '#9b59b6',
        games: ['duofacai', 'zeus', 'domino']
    },
    3: { 
        name: 'VIP 3', 
        luck: 20, 
        price: 150000, 
        maxTopup: 500000, 
        color: '#f1c40f',
        games: ['duofacai', 'zeus', 'domino']
    },
    4: { 
        name: 'VIP 4', 
        luck: 25, 
        price: 600000, 
        maxTopup: 1000000, 
        color: '#e67e22',
        games: ['duofacai', 'zeus', 'domino', 'spin']
    }
};

// Data admin
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Inisialisasi admin jika belum ada
if (!users.find(u => u.username === ADMIN_USERNAME)) {
    users.push({
        id: Date.now(),
        username: ADMIN_USERNAME,
        email: "admin@dewaguntur188.com",
        password: ADMIN_PASSWORD,
        balance: 0,
        spinCount: 0,
        mahjongCount: 0,
        zeusCount: 0,
        dominoCount: 0,
        duofacaiCount: 0,
        totalSpins: 0,
        totalMahjong: 0,
        totalZeus: 0,
        totalDomino: 0,
        totalDuofacai: 0,
        vipLevel: 4, // Admin VIP 4
        luck: 100,
        isAdmin: true,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(users));
}

// Update tampilan user info
function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    const navMenu = document.getElementById('navMenu');
    
    if (!userInfo) return;

    if (currentUser) {
        const user = users.find(u => u.id === currentUser.id);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        const balance = currentUser.balance || 0;
        const vipLevel = currentUser.vipLevel || 0;
        const vipData = vipLevels[vipLevel];
        
        const usernameDisplay = document.getElementById('usernameDisplay');
        const balanceDisplay = document.getElementById('balanceDisplay');
        const vipDisplay = document.getElementById('vipDisplay');
        
        if (usernameDisplay) usernameDisplay.textContent = `👤 ${currentUser.username}`;
        if (balanceDisplay) balanceDisplay.textContent = `Rp ${balance.toLocaleString('id-ID')}`;
        if (vipDisplay) {
            vipDisplay.textContent = vipData.name;
            vipDisplay.style.background = vipData.color;
        }

        userInfo.innerHTML = `
            <span id="usernameDisplay">👤 ${currentUser.username}</span>
            <span class="vip-badge" id="vipDisplay" style="background: ${vipData.color}">${vipData.name}</span>
            <span class="balance" id="balanceDisplay">Rp ${balance.toLocaleString('id-ID')}</span>
            <button class="logout-btn" onclick="logout()">Logout</button>
        `;

        if (navMenu && currentUser.isAdmin) {
            if (!document.querySelector('a[href="admin.html"]')) {
                navMenu.innerHTML += '<a href="admin.html">Admin</a>';
            }
        }
    } else {
        userInfo.innerHTML = `
            <span id="usernameDisplay"></span>
            <span class="vip-badge" id="vipDisplay">Reguler</span>
            <span class="balance" id="balanceDisplay">Rp 0</span>
            <button class="login-btn" onclick="showAuthModal()">Login</button>
        `;
    }
}

// Cek akses game berdasarkan VIP
function checkGameAccess(game) {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return false;
    }

    const vipLevel = currentUser.vipLevel || 0;
    const allowedGames = vipLevels[vipLevel].games;

    if (!allowedGames.includes(game)) {
        const requiredVIP = getRequiredVIP(game);
        showNotification(`Game ini membutuhkan ${requiredVIP}!`, 'error');
        
        // Tampilkan modal VIP
        const modal = document.getElementById('vipModal');
        if (modal) {
            modal.style.display = 'block';
        }
        return false;
    }

    return true;
}

// Dapatkan VIP yang diperlukan untuk game
function getRequiredVIP(game) {
    switch(game) {
        case 'zeus': return 'VIP 1';
        case 'domino': return 'VIP 2';
        case 'spin': return 'VIP 4';
        default: return 'Reguler';
    }
}

// Close VIP modal
function closeVIPModal() {
    const modal = document.getElementById('vipModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show auth modal
function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Hide auth modal
function hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show tab
function showTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}Form`).classList.add('active');
}

// Register
function register() {
    const username = document.getElementById('regUsername')?.value;
    const email = document.getElementById('regEmail')?.value;
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;

    if (!username || !email || !password || !confirmPassword) {
        showNotification('Semua field harus diisi!', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Password tidak cocok!', 'error');
        return;
    }

    if (users.find(u => u.username === username)) {
        showNotification('Username sudah digunakan!', 'error');
        return;
    }

    if (users.find(u => u.email === email)) {
        showNotification('Email sudah digunakan!', 'error');
        return;
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        balance: 0,
        spinCount: 0,
        mahjongCount: 0,
        zeusCount: 0,
        dominoCount: 0,
        duofacaiCount: 0,
        totalSpins: 0,
        totalMahjong: 0,
        totalZeus: 0,
        totalDomino: 0,
        totalDuofacai: 0,
        vipLevel: 0, // Reguler dengan luck 5%
        luck: 5,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showNotification('Registrasi berhasil! Silakan login.', 'success');
    showTab('login');
}

// Login
function login() {
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!username || !password) {
        showNotification('Username dan password harus diisi!', 'error');
        return;
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        showNotification('Username atau password salah!', 'error');
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    hideAuthModal();
    updateUserInfo();
    
    if (user.isAdmin) {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'index.html';
    }
    
    showNotification('Login berhasil!', 'success');
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserInfo();
    window.location.href = 'index.html';
    showNotification('Logout berhasil!', 'success');
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close modal when clicking on X or outside
document.addEventListener('DOMContentLoaded', () => {
    updateUserInfo();

    const modal = document.getElementById('authModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.onclick = hideAuthModal;
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            hideAuthModal();
        }
    };
});