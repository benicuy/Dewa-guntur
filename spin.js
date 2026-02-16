let canvas = document.getElementById('wheel');
let ctx;
let spinning = false;
let currentAngle = 0;
let lastPrize = 0;

// Hadiah - Tambah Rp 0 untuk yang tidak beruntung
const prizes = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 0];
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#F1C40F', '#95a5a6'];

// Inisialisasi roda
function initWheel() {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    drawWheel();
    
    // Cek akses VIP 4
    if (!checkGameAccess('spin')) {
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) spinBtn.disabled = true;
    }
}

// Gambar roda
function drawWheel() {
    if (!ctx) return;
    
    const anglePerPrize = (Math.PI * 2) / prizes.length;
    
    for (let i = 0; i < prizes.length; i++) {
        const startAngle = i * anglePerPrize + currentAngle;
        const endAngle = startAngle + anglePerPrize;
        
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.moveTo(200, 200);
        ctx.arc(200, 200, 180, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        
        // Gambar garis pemisah
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(200 + 180 * Math.cos(startAngle), 200 + 180 * Math.sin(startAngle));
        ctx.stroke();
        
        // Tulis teks hadiah
        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate(startAngle + anglePerPrize / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        
        let prizeText = prizes[i] === 0 ? 'COBA LAGI' : formatRupiah(prizes[i]);
        ctx.fillText(prizeText, 120, 10);
        ctx.restore();
    }
    
    // Gambar lingkaran tengah
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(200, 200, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Gambar logo di tengah
    ctx.save();
    ctx.translate(200, 200);
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#667eea';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 0, 0);
    ctx.restore();
}

// Format Rupiah
function formatRupiah(angka) {
    if (angka === 0) return 'Rp 0';
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Dapatkan hadiah berdasarkan sudut
function getPrizeFromAngle(angle) {
    const normalizedAngle = (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const anglePerPrize = (Math.PI * 2) / prizes.length;
    
    // Panah di atas (sudut -90 derajat atau 270 derajat dalam radian)
    const pointerAngle = (3 * Math.PI) / 2; // 270 derajat
    
    // Hitung selisih sudut dari pointer
    let diff = (pointerAngle - normalizedAngle + Math.PI * 2) % (Math.PI * 2);
    let prizeIndex = Math.floor(diff / anglePerPrize);
    
    return prizes[prizeIndex];
}

// Spin
function spin() {
    // Cek akses VIP 4
    if (!checkGameAccess('spin')) {
        showNotification('Game Spin hanya untuk VIP 4!', 'error');
        return;
    }

    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        window.location.href = 'index.html';
        return;
    }

    const spinAmount = parseInt(document.getElementById('spinAmount')?.value) || 10000;
    
    if (spinAmount < 10000 || spinAmount > 500000) {
        showNotification('Nominal spin harus antara Rp 10.000 - Rp 500.000', 'error');
        return;
    }

    if (currentUser.balance < spinAmount) {
        showNotification('Saldo tidak mencukupi! Silakan top up.', 'error');
        return;
    }

    if (spinning) return;

    spinning = true;
    document.getElementById('spinBtn').disabled = true;

    // Kurangi saldo
    currentUser.balance -= spinAmount;
    
    // Hitung hadiah berdasarkan keberuntungan
    let prize = calculatePrize();
    
    // Update spin count
    currentUser.spinCount = (currentUser.spinCount || 0) + 1;
    currentUser.totalSpins = (currentUser.totalSpins || 0) + 1;

    // Tentukan sudut akhir berdasarkan hadiah
    const prizeIndex = prizes.indexOf(prize);
    const anglePerPrize = (Math.PI * 2) / prizes.length;
    
    // Panah di atas (270 derajat)
    const pointerAngle = (3 * Math.PI) / 2;
    
    // Hitung sudut yang diperlukan agar hadiah prizeIndex berada di panah
    let targetAngle = pointerAngle - (prizeIndex * anglePerPrize) - (anglePerPrize / 2);
    
    // Tambah putaran (minimal 5 putaran)
    const spins = 5 + Math.floor(Math.random() * 5);
    targetAngle += spins * Math.PI * 2;
    
    // Animasi spin
    const startAngle = currentAngle;
    const startTime = Date.now();
    const duration = 3000; // 3 detik
    
    function animateSpin() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function untuk efek berhenti perlahan
        const easeOut = function(t) {
            return 1 - Math.pow(1 - t, 3);
        };
        
        currentAngle = startAngle + (targetAngle - startAngle) * easeOut(progress);
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            // Spin selesai
            currentAngle = targetAngle % (Math.PI * 2);
            drawWheel();
            
            // Verifikasi hadiah
            const actualPrize = getPrizeFromAngle(currentAngle);
            
            // Proses hasil
            setTimeout(() => {
                finishSpin(prize, spinAmount);
            }, 500);
        }
    }
    
    requestAnimationFrame(animateSpin);
}

// Hitung hadiah berdasarkan keberuntungan
function calculatePrize() {
    const user = users.find(u => u.id === currentUser.id);
    const luck = user?.luck || 5; // Default 5% untuk reguler
    
    // Random berdasarkan luck
    const random = Math.random() * 100;
    
    if (random < luck) {
        // Dapat hadiah - pilih random dari prizes (kecuali 0)
        const prizesWithOutZero = prizes.filter(p => p > 0);
        const prizeIndex = Math.floor(Math.random() * prizesWithOutZero.length);
        return prizesWithOutZero[prizeIndex];
    } else {
        // Tidak dapat hadiah (dapat 0)
        return 0;
    }
}

// Selesaikan spin
function finishSpin(prize, spinAmount) {
    // Tambah hadiah ke saldo
    if (prize > 0) {
        currentUser.balance += prize;
        lastPrize = prize;
        
        // Tampilkan hasil
        showResult('selamat', prize);
        
        // Simpan history
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'spin',
            amount: -spinAmount,
            prize: prize,
            description: `Spin Rp ${spinAmount.toLocaleString('id-ID')} - Mendapat Rp ${prize.toLocaleString('id-ID')}`,
            date: new Date().toISOString()
        };
        histories.push(history);
        
        // Update last result
        const lastResult = document.getElementById('lastResult');
        const lastPrizeSpan = document.getElementById('lastPrize');
        if (lastResult && lastPrizeSpan) {
            lastResult.style.display = 'block';
            lastPrizeSpan.textContent = formatRupiah(prize);
        }
        
        showNotification(`Selamat! Anda mendapat Rp ${prize.toLocaleString('id-ID')}!`, 'success');
    } else {
        lastPrize = 0;
        
        // Tampilkan hasil
        showResult('gagal', 0);
        
        const history = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'spin',
            amount: -spinAmount,
            prize: 0,
            description: `Spin Rp ${spinAmount.toLocaleString('id-ID')} - Coba Lagi (Rp 0)`,
            date: new Date().toISOString()
        };
        histories.push(history);
        
        // Update last result
        const lastResult = document.getElementById('lastResult');
        const lastPrizeSpan = document.getElementById('lastPrize');
        if (lastResult && lastPrizeSpan) {
            lastResult.style.display = 'block';
            lastPrizeSpan.textContent = 'Coba Lagi';
        }
        
        showNotification('Anda kurang beruntung. Coba lagi!', 'info');
    }

    // Cek bonus 50x spin
    if (currentUser.spinCount % 50 === 0) {
        const bonus = 2000; // Bonus Rp 2.000 setiap 50x spin
        currentUser.balance += bonus;
        
        const bonusHistory = {
            id: Date.now(),
            userId: currentUser.id,
            type: 'prize',
            amount: bonus,
            description: `Bonus 50x Spin - Rp ${bonus.toLocaleString('id-ID')}`,
            date: new Date().toISOString()
        };
        histories.push(bonusHistory);
        
        showNotification(`🎉 Selamat! Anda mendapat bonus 50x spin Rp 2.000!`, 'success');
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
    updateSpinInfo();
    
    spinning = false;
    document.getElementById('spinBtn').disabled = false;
}

// Tampilkan hasil spin
function showResult(type, amount) {
    const modal = document.getElementById('resultModal');
    const title = document.getElementById('resultTitle');
    const resultAmount = document.getElementById('resultAmount');
    const message = document.getElementById('resultMessage');
    
    if (type === 'selamat') {
        title.textContent = '🎉 SELAMAT! 🎉';
        title.style.color = '#667eea';
        resultAmount.textContent = formatRupiah(amount);
        message.textContent = 'Anda mendapatkan hadiah!';
    } else {
        title.textContent = '😢 COBA LAGI 😢';
        title.style.color = '#ff4757';
        resultAmount.textContent = 'Rp 0';
        message.textContent = 'Anda belum beruntung. Silakan coba lagi!';
    }
    
    modal.style.display = 'block';
}

// Tutup modal hasil
function closeResultModal() {
    document.getElementById('resultModal').style.display = 'none';
}

// Update info spin
function updateSpinInfo() {
    const spinCount = document.getElementById('spinCount');
    const bonusCount = document.getElementById('bonusCount');
    const nextBonus = document.getElementById('nextBonus');
    const balanceDisplay = document.getElementById('balanceDisplay');
    const spinAmount = document.getElementById('spinAmount');

    if (currentUser) {
        if (spinCount) spinCount.textContent = currentUser.spinCount || 0;
        if (bonusCount) {
            bonusCount.textContent = `${(currentUser.spinCount || 0) % 50}/50`;
        }
        if (nextBonus) {
            const remaining = 50 - ((currentUser.spinCount || 0) % 50);
            nextBonus.textContent = remaining;
        }
        if (balanceDisplay) {
            balanceDisplay.textContent = `Rp ${(currentUser.balance || 0).toLocaleString('id-ID')}`;
        }
    }

    // Update prize list
    const prizeList = document.getElementById('prizeList');
    if (prizeList) {
        prizeList.innerHTML = '';
        prizes.forEach((prize, index) => {
            const div = document.createElement('div');
            div.className = 'prize-item';
            if (prize === 0) {
                div.classList.add('zero');
                div.textContent = 'COBA LAGI';
            } else {
                div.style.background = colors[index];
                div.textContent = formatRupiah(prize);
            }
            prizeList.appendChild(div);
        });
    }

    // Set min/max berdasarkan VIP
    if (spinAmount) {
        if (currentUser) {
            const vipLevel = currentUser.vipLevel || 0;
            if (vipLevel === 4) {
                spinAmount.min = 10000;
                spinAmount.max = 500000;
            } else {
                spinAmount.disabled = true;
            }
        }
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    initWheel();
    updateSpinInfo();
});