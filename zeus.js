// Game state
let spinning = false;
let winCount = 0;
let loseCount = 0;

// Zeus symbols
const symbols = ['zeus', 'hera', 'athena', 'apollo', 'artemis', 'ares', 'aphrodite', 'hermes', 'poseidon', 'hades', 'wild', 'scatter'];
const symbolDisplay = {
    'zeus': '⚡',
    'hera': '👑',
    'athena': '🦉',
    'apollo': '☀️',
    'artemis': '🏹',
    'ares': '⚔️',
    'aphrodite': '💕',
    'hermes': '👟',
    'poseidon': '🌊',
    'hades': '💀',
    'wild': '🌟',
    'scatter': '⚡⚡'
};

// Hadiah
const prizes = {
    'zeus': 50000,
    'hera': 40000,
    'athena': 30000,
    'apollo': 25000,
    'artemis': 25000,
    'ares': 20000,
    'aphrodite': 20000,
    'hermes': 15000,
    'poseidon': 25000,
    'hades': 20000
};

// Inisialisasi game
function initZeus() {
    createReels();
    loadStats();
    
    // Cek akses VIP
    if (!checkGameAccess('zeus')) {
        document.getElementById('spinBtn').disabled = true;
    }
}

// Buat reels
function createReels() {
    const reels = document.getElementById('zeusReels');
    if (!reels) return;

    reels.innerHTML = '';
    for (let col = 0; col < 5; col++) {
        const reel = document.createElement('div');
        reel.className = 'zeus-reel';
        reel.id = `reel-${col}`;
        
        for (let row = 0; row < 3; row++) {
            const symbol = document.createElement('div');
            symbol.className = 'zeus-symbol';
            symbol.id = `zeus-${col}-${row}`;
            symbol.dataset.symbol = 'zeus';
            reel.appendChild(symbol);
        }
        
        reels.appendChild(reel);
    }
}

// Spin Zeus
function spinZeus() {
    if (!checkGameAccess('zeus')) {
        showNotification('Game ini membutuhkan VIP 1!', 'error');
        return;
    }

    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        window.location.href = 'index.html';
        return;
    }

    const betAmount = parseInt(document.getElementById('betAmount')?.value) || 2000;
    
    if (betAmount < 2000 || betAmount > 50000) {
        showNotification('Nominal spin harus antara Rp 2.000 - Rp 50.000', 'error');
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
    currentUser.zeusCount = (currentUser.zeusCount || 0) + 1;
    currentUser.totalZeus = (currentUser.totalZeus || 0) + 1;

    // Animasi spin
    animateZeusSpin();

    // Hasil setelah 2.5 detik
    setTimeout(() => {
        // Hasil spin
        const result = generateZeusResult();
        
        // Hitung hadiah
        const prize = calculateZeusPrize(result);
        
        // Tampilkan hasil
        displayZeusResult(result);
        
        // Proses hadiah
        finishZeusSpin(prize, betAmount, result);
        
        spinning = false;
        document.getElementById('spinBtn').disabled = false;
    }, 2500);
}

// Animasi spin Zeus
function animateZeusSpin() {
    const symbols = document.querySelectorAll('.zeus-symbol');
    
    const interval = setInterval(() => {
        symbols.forEach(symbol => {
            const randomSymbol = ['zeus', 'hera', 'athena', 'poseidon', 'hades'][Math.floor(Math.random() * 5)];
            symbol.dataset.symbol = randomSymbol;
            symbol.innerHTML = symbolDisplay[randomSymbol];
            symbol.classList.add('spinning');
        });
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        symbols.forEach(symbol => {
            symbol.classList.remove('spinning');
        });
    }, 2400);
}

// Generate hasil Zeus
function generateZeusResult() {
    const result = [];
    for (let col = 0; col < 5; col++) {
        const colSymbols = [];
        for (let row = 0; row < 3; row++) {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            colSymbols.push(randomSymbol);
        }
        result.push(colSymbols);
    }
    return result;
}

// Tampilkan hasil Zeus
function displayZeusResult(result) {
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 3; row++) {
            const symbol = document.getElementById(`zeus-${col}-${row}`);
            if (symbol) {
                symbol.dataset.symbol = result[col][row];
                symbol.innerHTML = symbolDisplay[result[col][row]];
                
                if (result[col][row] === 'scatter') {
                    symbol.classList.add('scatter');
                } else {
                    symbol.classList.remove('scatter');
                }
                
                if (result[col][row] === 'wild') {
                    symbol.classList.add('wild');
                } else {
                    symbol.classList.remove('wild');
                }
            }
        }
    }
}

// Hitung hadiah Zeus
function calculateZeusPrize(result) {
    let totalPrize = 0;
    let scatterCount = 0;
    
    // Hitung scatter
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 3; row++) {
            if (result[col][row] === 'scatter') {
                scatterCount++;
            }
        }
    }
    
    document.getElementById('scatterCount').textContent = `Scatter: ${scatterCount}`;
    
    // Bonus scatter: 3 scatter = free spin (dalam demo langsung dapat hadiah)
    if (scatterCount >= 3) {
        totalPrize += 25000;
    }
    
    // Cek kombinasi per baris
    for (let row = 0; row < 3; row++) {
        // Wild bisa jadi simbol apapun
        const line = [result[0][row], result[1][row], result[2][row], result[3][row], result[4][row]];
        
        // Cek 3 simbol sama pertama
        if (line[0] === line[1] && line[1] === line[2] || 
            (line[0] === 'wild' || line[1] === 'wild' || line[2] === 'wild')) {
            const symbol = line[0] === 'wild' ? (line[1] === 'wild' ? line[2] : line[1]) : line[0];
            if (prizes[symbol]) {
                totalPrize += prizes[symbol];
            }
        }
        
        // Cek 3 simbol sama kedua
        if (line[2] === line[3] && line[3] === line[4] ||
            (line[2] === 'wild' || line[3] === 'wild' || line[4] === 'wild')) {
            const symbol = line[2] === 'wild' ? (line[3] === 'wild' ? line[4] : line[3]) : line[2];
            if (prizes[symbol]) {
                totalPrize += prizes[symbol];
            }
        }
    }
    
    return totalPrize;
}

// Selesaikan spin Zeus
function finishZeusSpin(prize, betAmount, result) {
    if (prize > 0) {
        currentUser.balance += prize;
        winCount++;
        
        // Tampilkan hasil
        const resultDiv = document.getElementById('gameResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'game-result win';
        resultDiv.innerHTML = `⚡ SELAMAT! Anda menang Rp ${prize.toLocaleString('id-ID')}! ⚡`;
        
        // Simpan history
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'zeus',
            amount: -betAmount,
            prize: prize,
            description: `Zeus Rp ${betAmount.toLocaleString('id-ID')} - Menang Rp ${prize.toLocaleString('id-ID')}`,
            date: new Date().toISOString()
        };
        histories.push(history);
        
        showNotification(`⚡ Selamat! Anda menang Rp ${prize.toLocaleString('id-ID')}!`, 'success');
    } else {
        loseCount++;
        
        // Tampilkan hasil
        const resultDiv = document.getElementById('gameResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'game-result lose';
        resultDiv.innerHTML = '😢 Dewa belum memberkati. Coba lagi! 😢';
        
        // Simpan history
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'zeus',
            amount: -betAmount,
            prize: 0,
            description: `Zeus Rp ${betAmount.toLocaleString('id-ID')} - Kalah`,
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
    updateZeusStats();
}

// Update statistik Zeus
function updateZeusStats() {
    const winCountSpan = document.getElementById('winCount');
    const loseCountSpan = document.getElementById('loseCount');
    const balanceDisplay = document.getElementById('balanceDisplay');

    if (winCountSpan) winCountSpan.textContent = winCount;
    if (loseCountSpan) loseCountSpan.textContent = loseCount;
    if (balanceDisplay) {
        balanceDisplay.textContent = `Rp ${(currentUser?.balance || 0).toLocaleString('id-ID')}`;
    }
}

// Reset Zeus
function resetZeus() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    winCount = 0;
    loseCount = 0;
    updateZeusStats();
    
    // Reset reels
    const symbols = document.querySelectorAll('.zeus-symbol');
    symbols.forEach(symbol => {
        symbol.dataset.symbol = 'zeus';
        symbol.innerHTML = '⚡';
        symbol.classList.remove('scatter', 'wild');
    });
    
    document.getElementById('scatterCount').textContent = 'Scatter: 0';
    
    const resultDiv = document.getElementById('gameResult');
    resultDiv.style.display = 'none';
    
    showNotification('Game direset!', 'success');
}

// Load statistik
function loadStats() {
    if (currentUser) {
        const userHistories = histories.filter(h => h.userId === currentUser.id && h.type === 'zeus');
        winCount = userHistories.filter(h => h.prize > 0).length;
        loseCount = userHistories.filter(h => h.prize === 0).length;
        updateZeusStats();
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    initZeus();
});