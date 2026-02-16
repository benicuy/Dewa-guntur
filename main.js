// Update statistik di halaman utama
function updateStats() {
    const totalPlayers = document.getElementById('totalPlayers');
    const totalPrizes = document.getElementById('totalPrizes');
    const totalSpins = document.getElementById('totalSpins');
    const totalMahjong = document.getElementById('totalMahjong');

    if (totalPlayers) {
        const playerCount = users.filter(u => !u.isAdmin).length;
        totalPlayers.textContent = playerCount;
    }

    if (totalPrizes) {
        const totalPrizeAmount = histories
            .filter(h => h.type === 'prize' || (h.type === 'spin' && h.prize > 0) || (h.type === 'mahjong' && h.prize > 0))
            .reduce((sum, h) => sum + (h.prize || 0), 0);
        totalPrizes.textContent = `Rp ${totalPrizeAmount.toLocaleString('id-ID')}`;
    }

    if (totalSpins) {
        const totalSpinCount = users.reduce((sum, u) => sum + (u.totalSpins || 0), 0);
        totalSpins.textContent = totalSpinCount;
    }

    if (totalMahjong) {
        const totalMahjongCount = users.reduce((sum, u) => sum + (u.totalMahjong || 0), 0);
        totalMahjong.textContent = totalMahjongCount;
    }
}

// Update stats setiap kali halaman dimuat
document.addEventListener('DOMContentLoaded', updateStats);