// Game state
let spinning = false;
let winCount = 0;
let loseCount = 0;

// Duo Facai symbols
const symbols = ['fu', 'lu', 'shou', 'xi', 'cai', 'yuan', 'bao', 'gold', 'dragon', 'phoenix'];
const symbolDisplay = {
    'fu': '福',
    'lu': '禄',
    'shou': '寿',
    'xi': '喜',
    'cai': '财',
    'yuan': '元',
    'bao': '宝',
    'gold': '💰',
    'dragon': '🐉',
    'phoenix': '🐦'
};

// Hadiah
const prizes = {
    'fu': 5000,
    'lu': 10000,
    'shou': 15000,
    'xi': 20000,
    'cai': 25000,
    'yuan': 30000,
    'bao': 35000,
    'gold': 40000,
    'dragon': 45000,
    'phoenix': 50000
};

// Inisialisasi grid
function initGrid() {
    const grid = document.getElementById('duofacaiGrid');
    if (!grid) return;

    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const card = document.createElement('div');
        card.className = 'duofacai-card';
        card.id = `card-${i}`;
        
        const front = document.createElement('div');
        front.className = 'front';
        
        const back = document.createElement('div');
        back.className = 'back';
        
        card.appendChild(front);
        card.appendChild(back);
        grid.appendChild(card);
    }
}

// Spin Duo Facai
function spinDuoFacai() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        window.location.href = 'index.html';
        return;
    }

    const betAmount = parseInt(document.getElementById('betAmount')?.value) || 1000;
    
    if (betAmount < 1000 || betAmount > 10000) {
        showNotification('Nominal spin harus antara Rp 1.000 - Rp 10.000', 'error');
        return;
    }

    if (currentUser.balance < betAmount) {
        showNotification('Saldo tidak mencukupi! Silakan top up.', 'error');
        return;
    }

    if (spinning) return;

    spinning = true;
    document.getElementById('spinBtn').disabled = true;

    // Kurangi saldo
    currentUser.balance -= betAmount;
    
    // Update count
    currentUser.duofacaiCount = (currentUser.duofacaiCount || 0) + 1;
    currentUser.totalDuofacai = (currentUser.totalDuofacai || 0) + 1;

    // Animasi flip
    animateFlip();

    // Hasil setelah 2 detik
    setTimeout(() => {
        // Hasil spin
        const result = generateResult();
        
        // Hitung hadiah
        const prize = calculatePrize(result);
        
        // Tampilkan hasil
        displayResult(result);
        
        // Proses hadiah
        finishSpin(prize, betAmount);
        
        spinning = false;
        document.getElementById('spinBtn').disabled = false;
    }, 2000);
}

// Animasi flip
function animateFlip() {
    const cards = document.querySelectorAll('.duofacai-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('flipped');
        }, index * 100);
    });
}

// Generate hasil
function generateResult() {
    const result = [];
    for (let i = 0; i < 9; i++) {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        result.push(randomSymbol);
    }
    return result;
}

// Tampilkan hasil
function displayResult(result) {
    for (let i = 0; i < 9; i++) {
        const card = document.getElementById(`card-${i}`);
        const front = card.querySelector('.front');
        front.dataset.symbol = result[i];
        front.innerHTML = symbolDisplay[result[i]];
    }
}

// Hitung hadiah
function calculatePrize(result) {
    let totalPrize = 0;
    
    // Cek baris
    for (let row = 0; row < 3; row++) {
        const s1 = result[row * 3];
        const s2 = result[row * 3 + 1];
        const s3 = result[row * 3 + 2];
        
        if (s1 === s2 && s2 === s3) {
            totalPrize += prizes[s1] || 0;
        }
    }
    
    // Cek kolom
    for (let col = 0; col < 3; col++) {
        const s1 = result[col];
        const s2 = result[col + 3];
        const s3 = result[col + 6];
        
        if (s1 === s2 && s2 === s3) {
            totalPrize += prizes[s1] || 0;
        }
    }
    
    // Cek diagonal
    if (result[0] === result[4] && result[4] === result[8]) {
        totalPrize += prizes[result[0]] || 0;
    }
    
    if (result[2] === result[4] && result[4] === result[6]) {
        totalPrize += prizes[result[2]] || 0;
    }
    
    return totalPrize;
}

// Selesaikan spin
function finishSpin(prize, betAmount) {
    if (prize > 0) {
        currentUser.balance += prize;
        winCount++;
        
        // Tampilkan hasil
        const resultDiv = document.getElementById('gameResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'game-result win';
        resultDiv.innerHTML = `🎉 SELAMAT! Anda menang Rp ${prize.toLocaleString('id-ID')}! 🎉`;
        
        // Simpan history
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'duofacai',
            amount: -betAmount,
            prize: prize,
            description: `Duo Facai Rp ${betAmount.toLocaleString('id-ID')} - Menang Rp ${prize.toLocaleString('id-ID')}`,
            date: new Date().toISOString()
        };
        histories.push(history);
        
        showNotification(`Selamat! Anda menang Rp ${prize.toLocaleString('id-ID')}!`, 'success');
    } else {
        loseCount++;
        
        // Tampilkan hasil
        const resultDiv = document.getElementById('gameResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'game-result lose';
        resultDiv.innerHTML = '😢 Belum beruntung. Coba lagi! 😢';
        
        // Simpan history
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'duofacai',
            amount: -betAmount,
            prize: 0,
            description: `Duo Facai Rp ${betAmount.toLocaleString('id-ID')} - Kalah`,
            date: new Date().toISOString()
        };
        histories.push(history);
        
        showNotification('Anda kurang beruntung. Coba lagi!', 'info');
    }

    // Update user data
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('histories', JSON.stringify(histories));
    }

    // Update tampilan
    updateStats();
}

// Update statistik
function updateStats() {
    const winCountSpan = document.getElementById('winCount');
    const loseCountSpan = document.getElementById('loseCount');
    const balanceDisplay = document.getElementById('balanceDisplay');

    if (winCountSpan) winCountSpan.textContent = winCount;
    if (loseCountSpan) loseCountSpan.textContent = loseCount;
    if (balanceDisplay) {
        balanceDisplay.textContent = `Rp ${(currentUser?.balance || 0).toLocaleString('id-ID')}`;
    }
}

// Reset game
function resetDuoFacai() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    winCount = 0;
    loseCount = 0;
    updateStats();
    
    // Reset cards
    const cards = document.querySelectorAll('.duofacai-card');
    cards.forEach(card => {
        card.classList.remove('flipped');
    });
    
    const resultDiv = document.getElementById('gameResult');
    resultDiv.style.display = 'none';
    
    showNotification('Game direset!', 'success');
}

// Load statistik
function loadStats() {
    if (currentUser) {
        const userHistories = histories.filter(h => h.userId === currentUser.id && h.type === 'duofacai');
        winCount = userHistories.filter(h => h.prize > 0).length;
        loseCount = userHistories.filter(h => h.prize === 0).length;
        updateStats();
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    loadStats();
});