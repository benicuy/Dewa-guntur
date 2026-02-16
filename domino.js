// Game state
let playerTiles = [];
let computerTiles = [];
let boardTiles = [];
let currentPlayer = 'player';
let gameActive = false;
let selectedTile = null;
let winCount = 0;
let loseCount = 0;

// Inisialisasi game
function initDomino() {
    loadStats();
    
    // Cek akses VIP
    if (!checkGameAccess('domino')) {
        document.getElementById('playBtn').disabled = true;
        document.getElementById('passBtn').disabled = true;
    }
}

// Mulai game baru
function startNewGame() {
    if (!checkGameAccess('domino')) {
        showNotification('Game ini membutuhkan VIP 2!', 'error');
        return;
    }

    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    const betAmount = parseInt(document.getElementById('betAmount')?.value) || 5000;
    
    if (betAmount < 5000 || betAmount > 100000) {
        showNotification('Taruhan harus antara Rp 5.000 - Rp 100.000', 'error');
        return;
    }

    if (currentUser.balance < betAmount) {
        showNotification('Saldo tidak mencukupi! Silakan top up.', 'error');
        return;
    }

    // Kurangi saldo
    currentUser.balance -= betAmount;

    // Generate tiles
    generateTiles();
    
    gameActive = true;
    currentPlayer = 'player';
    selectedTile = null;
    
    displayBoard();
    displayPlayerHand();
    displayComputerHand(true); // Hidden
    
    document.getElementById('playBtn').disabled = false;
    document.getElementById('passBtn').disabled = false;
    
    showNotification('Game dimulai! Giliran Anda.', 'success');
}

// Generate tiles domino
function generateTiles() {
    const allTiles = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            allTiles.push([i, j]);
        }
    }
    
    // Acak tiles
    const shuffled = allTiles.sort(() => Math.random() - 0.5);
    
    // Bagi ke player dan computer
    playerTiles = shuffled.slice(0, 7);
    computerTiles = shuffled.slice(7, 14);
    boardTiles = [];
}

// Display board
function displayBoard() {
    const table = document.getElementById('dominoTable');
    if (!table) return;
    
    table.innerHTML = '';
    
    if (boardTiles.length === 0) {
        table.innerHTML = '<div style="color: white; text-align: center;">Klik tile pertama untuk memulai</div>';
        return;
    }
    
    boardTiles.forEach((tile, index) => {
        const tileDiv = createTileElement(tile, index);
        table.appendChild(tileDiv);
    });
}

// Create tile element
function createTileElement(tile, index) {
    const div = document.createElement('div');
    div.className = 'domino-tile';
    div.dataset.index = index;
    div.dataset.top = tile[0];
    div.dataset.bottom = tile[1];
    
    const top = document.createElement('div');
    top.className = 'top';
    top.dataset.value = tile[0];
    
    const bottom = document.createElement('div');
    bottom.className = 'bottom';
    bottom.dataset.value = tile[1];
    
    div.appendChild(top);
    div.appendChild(bottom);
    
    return div;
}

// Display player hand
function displayPlayerHand() {
    const hand = document.getElementById('playerHand');
    if (!hand) return;
    
    hand.innerHTML = '<h3>Tile Anda:</h3>';
    
    playerTiles.forEach((tile, index) => {
        const tileDiv = createTileElement(tile, index);
        tileDiv.classList.add('player-tile');
        tileDiv.onclick = () => selectPlayerTile(index);
        
        if (selectedTile === index) {
            tileDiv.classList.add('selected');
        }
        
        hand.appendChild(tileDiv);
    });
}

// Display computer hand (hidden)
function displayComputerHand(hide = true) {
    const hand = document.getElementById('computerHand');
    if (!hand) return;
    
    hand.innerHTML = '<h3>Tile Computer:</h3>';
    
    computerTiles.forEach((tile, index) => {
        const tileDiv = createTileElement(tile, index);
        if (hide) {
            tileDiv.style.opacity = '0.3';
            tileDiv.querySelector('.top').innerHTML = '?';
            tileDiv.querySelector('.bottom').innerHTML = '?';
        }
        hand.appendChild(tileDiv);
    });
}

// Select player tile
function selectPlayerTile(index) {
    if (currentPlayer !== 'player' || !gameActive) return;
    
    selectedTile = index;
    displayPlayerHand();
}

// Play domino
function playDomino() {
    if (!checkGameAccess('domino')) {
        showNotification('Game ini membutuhkan VIP 2!', 'error');
        return;
    }

    if (!gameActive) {
        startNewGame();
        return;
    }

    if (currentPlayer !== 'player') {
        showNotification('Sekarang giliran computer!', 'error');
        return;
    }

    if (selectedTile === null) {
        showNotification('Pilih tile terlebih dahulu!', 'error');
        return;
    }

    const tile = playerTiles[selectedTile];
    let validMove = false;

    if (boardTiles.length === 0) {
        // Tile pertama
        boardTiles.push(tile);
        playerTiles.splice(selectedTile, 1);
        validMove = true;
    } else {
        const leftTile = boardTiles[0][0];
        const rightTile = boardTiles[boardTiles.length - 1][1];
        
        if (tile[1] === leftTile || tile[0] === leftTile) {
            if (tile[1] === leftTile) {
                boardTiles.unshift(tile);
            } else {
                boardTiles.unshift([tile[1], tile[0]]);
            }
            playerTiles.splice(selectedTile, 1);
            validMove = true;
        } else if (tile[0] === rightTile || tile[1] === rightTile) {
            if (tile[0] === rightTile) {
                boardTiles.push(tile);
            } else {
                boardTiles.push([tile[1], tile[0]]);
            }
            playerTiles.splice(selectedTile, 1);
            validMove = true;
        }
    }

    if (validMove) {
        selectedTile = null;
        displayBoard();
        displayPlayerHand();
        
        // Cek menang
        if (playerTiles.length === 0) {
            gameWin('player');
            return;
        }
        
        // Giliran computer
        currentPlayer = 'computer';
        showNotification('Giliran computer...', 'info');
        
        setTimeout(() => computerPlay(), 1500);
    } else {
        showNotification('Tile tidak bisa dimainkan!', 'error');
    }
}

// Computer play
function computerPlay() {
    if (!gameActive) return;
    
    let played = false;
    
    for (let i = 0; i < computerTiles.length; i++) {
        const tile = computerTiles[i];
        
        if (boardTiles.length === 0) {
            boardTiles.push(tile);
            computerTiles.splice(i, 1);
            played = true;
            break;
        } else {
            const leftTile = boardTiles[0][0];
            const rightTile = boardTiles[boardTiles.length - 1][1];
            
            if (tile[1] === leftTile || tile[0] === leftTile) {
                if (tile[1] === leftTile) {
                    boardTiles.unshift(tile);
                } else {
                    boardTiles.unshift([tile[1], tile[0]]);
                }
                computerTiles.splice(i, 1);
                played = true;
                break;
            } else if (tile[0] === rightTile || tile[1] === rightTile) {
                if (tile[0] === rightTile) {
                    boardTiles.push(tile);
                } else {
                    boardTiles.push([tile[1], tile[0]]);
                }
                computerTiles.splice(i, 1);
                played = true;
                break;
            }
        }
    }
    
    if (played) {
        displayBoard();
        displayComputerHand(true);
        
        // Cek menang
        if (computerTiles.length === 0) {
            gameWin('computer');
            return;
        }
    } else {
        // Computer pass
        showNotification('Computer lewat!', 'info');
    }
    
    // Giliran player
    currentPlayer = 'player';
    showNotification('Giliran Anda!', 'success');
}

// Pass giliran
function passDomino() {
    if (!checkGameAccess('domino')) {
        showNotification('Game ini membutuhkan VIP 2!', 'error');
        return;
    }

    if (currentPlayer !== 'player') {
        showNotification('Sekarang giliran computer!', 'error');
        return;
    }
    
    showNotification('Anda lewat! Giliran computer.', 'info');
    currentPlayer = 'computer';
    
    setTimeout(() => computerPlay(), 1500);
}

// Game win
function gameWin(winner) {
    gameActive = false;
    
    const betAmount = parseInt(document.getElementById('betAmount')?.value) || 5000;
    let prize = 0;
    
    if (winner === 'player') {
        prize = betAmount * 2;
        currentUser.balance += prize;
        winCount++;
        
        const resultDiv = document.getElementById('gameResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'game-result win';
        resultDiv.innerHTML = `🎉 SELAMAT! Anda menang Rp ${prize.toLocaleString('id-ID')}! 🎉`;
        
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'domino',
            amount: -betAmount,
            prize: prize,
            description: `Domino - Menang Rp ${prize.toLocaleString('id-ID')}`,
            date: new Date().toISOString()
        };
        histories.push(history);
        
        showNotification(`Selamat! Anda menang Rp ${prize.toLocaleString('id-ID')}!`, 'success');
    } else {
        loseCount++;
        
        const resultDiv = document.getElementById('gameResult');
        resultDiv.style.display = 'block';
        resultDiv.className = 'game-result lose';
        resultDiv.innerHTML = '😢 Computer menang. Coba lagi! 😢';
        
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'domino',
            amount: -betAmount,
            prize: 0,
            description: `Domino - Kalah`,
            date: new Date().toISOString()
        };
        histories.push(history);
        
        showNotification('Anda kalah. Coba lagi!', 'info');
    }

    // Update user data
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('histories', JSON.stringify(histories));
    }

    updateDominoStats();
    
    document.getElementById('playBtn').disabled = true;
    document.getElementById('passBtn').disabled = true;
}

// Reset domino
function resetDomino() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    gameActive = false;
    playerTiles = [];
    computerTiles = [];
    boardTiles = [];
    selectedTile = null;
    
    displayBoard();
    document.getElementById('playerHand').innerHTML = '<h3>Tile Anda:</h3>';
    document.getElementById('computerHand').innerHTML = '<h3>Tile Computer:</h3>';
    
    document.getElementById('playBtn').disabled = false;
    document.getElementById('passBtn').disabled = true;
    document.getElementById('playBtn').textContent = 'Mulai Game';
    
    const resultDiv = document.getElementById('gameResult');
    resultDiv.style.display = 'none';
    
    showNotification('Game direset!', 'success');
}

// Update statistik
function updateDominoStats() {
    const winCountSpan = document.getElementById('winCount');
    const loseCountSpan = document.getElementById('loseCount');
    const balanceDisplay = document.getElementById('balanceDisplay');

    if (winCountSpan) winCountSpan.textContent = winCount;
    if (loseCountSpan) loseCountSpan.textContent = loseCount;
    if (balanceDisplay) {
        balanceDisplay.textContent = `Rp ${(currentUser?.balance || 0).toLocaleString('id-ID')}`;
    }
}

// Load statistik
function loadStats() {
    if (currentUser) {
        const userHistories = histories.filter(h => h.userId === currentUser.id && h.type === 'domino');
        winCount = userHistories.filter(h => h.prize > 0).length;
        loseCount = userHistories.filter(h => h.prize === 0).length;
        updateDominoStats();
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    initDomino();
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.onclick = playDomino;
    }
});