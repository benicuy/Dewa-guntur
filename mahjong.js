// Game state
let spinning = false;
let winCount = 0;
let loseCount = 0;

// Simbol Mahjong
const symbols = [
    'bamboo1', 'bamboo2', 'bamboo3', 'bamboo4', 'bamboo5',
    'bamboo6', 'bamboo7', 'bamboo8', 'bamboo9',
    'character1', 'character2', 'character3', 'character4', 'character5',
    'character6', 'character7', 'character8', 'character9',
    'circle1', 'circle2', 'circle3', 'circle4', 'circle5',
    'circle6', 'circle7', 'circle8', 'circle9',
    'wind-east', 'wind-south', 'wind-west', 'wind-north',
    'dragon-red', 'dragon-green', 'dragon-white',
    'flower', 'season', 'scatter'
];

// Hadiah berdasarkan simbol (3 simbol sama)
const prizes = {
    'bamboo': 5000,
    'character': 10000,
    'circle': 15000,
    'wind': 20000,
    'dragon': 25000,
    'scatter': 10000 // 5 scatter
};

// Inisialisasi slot
function initMahjongSlot() {
    createSlotGrid();
    loadStats();
}

// Buat grid slot 5x3
function createSlotGrid() {
    const grid = document.getElementById('slotGrid');
    if (!grid) return;

    grid.innerHTML = '';
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'slot-cell';
            cell.id = `slot-${row}-${col}`;
            cell.dataset.symbol = 'bamboo1';
            grid.appendChild(cell);
        }
    }
}

// Spin Mahjong
function spinMahjong() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        window.location.href = 'index.html';
        return;
    }

    const betAmount = parseInt(document.getElementById('betAmount')?.value) || 1000;
    
    if (betAmount < 1000 || betAmount > 100000) {
        showNotification('Nominal spin harus antara Rp 1.000 - Rp 100.000', 'error');
        return;
    }

    if (currentUser.balance < betAmount) {
        showNotification('Saldo tidak mencukupi! Silakan top up.', 'error');
        return;
    }

    if (spinning) return;

    spinning = true;
    document.getElementById('spinMahjongBtn').disabled = true;

    // Kurangi saldo
    currentUser.balance -= betAmount;
    
    // Update mahjong count
    currentUser.mahjongCount = (currentUser.mahjongCount || 0) + 1;
    currentUser.totalMahjong = (currentUser.totalMahjong || 0) + 1;

    // Animasi spin
    animateSpin();

    // Hasil setelah 2 detik
    setTimeout(() => {
        // Hasil spin
        const result = generateResult();
        
        // Hitung hadiah
        const prize = calculatePrize(result);
        
        // Tampilkan hasil
        displayResult(result);
        
        // Proses hadiah
        finishSpin(prize, betAmount, result);
        
        spinning = false;
        document.getElementById('spinMahjongBtn').disabled = false;
    }, 2000);
}

// Animasi spin
function animateSpin() {
    const cells = document.querySelectorAll('.slot-cell');
    
    // Animasi 2 detik
    const interval = setInterval(() => {
        cells.forEach(cell => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            cell.dataset.symbol = randomSymbol;
            cell.classList.add('spinning');
        });
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        cells.forEach(cell => {
            cell.classList.remove('spinning');
        });
    }, 1900);
}

// Generate hasil spin
function generateResult() {
    const result = [];
    for (let row = 0; row < 3; row++) {
        const rowSymbols = [];
        for (let col = 0; col < 5; col++) {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            rowSymbols.push(randomSymbol);
        }
        result.push(rowSymbols);
    }
    return result;
}

// Tampilkan hasil di grid
function displayResult(result) {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.getElementById(`slot-${row}-${col}`);
            if (cell) {
                cell.dataset.symbol = result[row][col];
                
                // Highlight jika scatter
                if (result[row][col] === 'scatter') {
                    cell.classList.add('scatter');
                } else {
                    cell.classList.remove('scatter');
                }
            }
        }
    }
}

// Hitung hadiah
function calculatePrize(result) {
    let totalPrize = 0;
    const scatterCount = countScatter(result);
    
    // Bonus scatter: 5 scatter = Rp 10.000
    if (scatterCount >= 5) {
        totalPrize += 10000;
        document.getElementById('scatterCount').textContent = `Scatter: ${scatterCount} ⭐ Bonus Rp 10.000!`;
    } else {
        document.getElementById('scatterCount').textContent = `Scatter: ${scatterCount}`;
    }
    
    // Cek kombinasi 3 simbol sama per baris
    for (let row = 0; row < 3; row++) {
        // Cek per kolom (5 kolom)
        for (let col = 0; col < 3; col++) {
            const symbol1 = result[row][col];
            const symbol2 = result[row][col + 1];
            const symbol3 = result[row][col + 2];
            
            if (symbol1 === symbol2 && symbol2 === symbol3 && symbol1 !== 'scatter') {
                // Dapatkan tipe simbol
                if (symbol1.includes('bamboo')) {
                    totalPrize += 5000;
                } else if (symbol1.includes('character')) {
                    totalPrize += 10000;
                } else if (symbol1.includes('circle')) {
                    totalPrize += 15000;
                } else if (symbol1.includes('wind')) {
                    totalPrize += 20000;
                } else if (symbol1.includes('dragon')) {
                    totalPrize += 25000;
                }
            }
        }
    }
    
    return totalPrize;
}

// Hitung jumlah scatter
function countScatter(result) {
    let count = 0;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            if (result[row][col] === 'scatter') {
                count++;
            }
        }
    }
    return count;
}

// Selesaikan spin
function finishSpin(prize, betAmount, result) {
    if (prize > 0) {
        currentUser.balance += prize;
        winCount++;
        
        // Tampilkan hasil
        const resultDiv = document.getElementById('mahjongResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'game-result win';
        resultDiv.innerHTML = `🎉 SELAMAT! Anda menang Rp ${prize.toLocaleString('id-ID')}! 🎉`;
        
        // Simpan history
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'mahjong',
            amount: -betAmount,
            prize: prize,
            description: `Mahjong Rp ${betAmount.toLocaleString('id-ID')} - Menang Rp ${prize.toLocaleString('id-ID')}`,
            date: new Date().toISOString()
        };
        histories.push(history);
        
        showNotification(`Selamat! Anda menang Rp ${prize.toLocaleString('id-ID')}!`, 'success');
    } else {
        loseCount++;
        
        // Tampilkan hasil
        const resultDiv = document.getElementById('mahjongResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'game-result lose';
        resultDiv.innerHTML = '😢 Belum beruntung. Coba lagi! 😢';
        
        // Simpan history
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'mahjong',
            amount: -betAmount,
            prize: 0,
            description: `Mahjong Rp ${betAmount.toLocaleString('id-ID')} - Kalah`,
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
function resetMahjong() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    winCount = 0;
    loseCount = 0;
    updateStats();
    
    // Reset grid
    const cells = document.querySelectorAll('.slot-cell');
    cells.forEach(cell => {
        cell.dataset.symbol = 'bamboo1';
        cell.classList.remove('scatter', 'highlight');
    });
    
    document.getElementById('scatterCount').textContent = 'Scatter: 0';
    
    const resultDiv = document.getElementById('mahjongResult');
    resultDiv.style.display = 'none';
    
    showNotification('Game direset!', 'success');
}

// Load statistik dari localStorage
function loadStats() {
    // Load dari history jika ada
    if (currentUser) {
        const userHistories = histories.filter(h => h.userId === currentUser.id && h.type === 'mahjong');
        winCount = userHistories.filter(h => h.prize > 0).length;
        loseCount = userHistories.filter(h => h.prize === 0).length;
        updateStats();
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    initMahjongSlot();
});