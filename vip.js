// Variabel untuk menyimpan target VIP
let targetVIPLevel = null;
let targetVIPData = null;
let selectedPaymentMethod = 'QRIS'; // Default QRIS

// Load VIP cards
function loadVIPCards() {
    console.log('Loading VIP cards...'); // Untuk debugging
    const container = document.getElementById('vipCards');
    if (!container) {
        console.error('Container vipCards tidak ditemukan!');
        return;
    }

    const currentVIP = currentUser?.vipLevel || 0;
    console.log('Current VIP level:', currentVIP);
    
    container.innerHTML = '';
    
    for (let i = 0; i <= 4; i++) {
        const vip = vipLevels[i];
        const card = document.createElement('div');
        card.className = `vip-card ${vip.name.toLowerCase().replace(' ', '')}`;
        
        let icon = '';
        switch(i) {
            case 0: icon = '👤'; break;
            case 1: icon = '🥉'; break;
            case 2: icon = '🥈'; break;
            case 3: icon = '🥇'; break;
            case 4: icon = '👑'; break;
        }
        
        let gamesList = '';
        vip.games.forEach(game => {
            if (game === 'duofacai') gamesList += '<span>• Duo Facai</span><br>';
            if (game === 'zeus') gamesList += '<span>• Zeus</span><br>';
            if (game === 'domino') gamesList += '<span>• Domino</span><br>';
            if (game === 'spin') gamesList += '<span>• Spin</span><br>';
        });
        
        let buttonHtml = '';
        if (i === currentVIP) {
            buttonHtml = '<div class="current-badge" style="background: #f1c40f; color: #333; padding: 10px; border-radius: 5px; margin-top: 15px;">VIP AKTIF</div>';
        } else if (i > currentVIP) {
            buttonHtml = `<button class="btn-beli" onclick="showPaymentForm(${i})">BELI VIP ${i} - Rp ${vip.price.toLocaleString('id-ID')}</button>`;
        } else {
            buttonHtml = '<div style="color: #999; padding: 10px; margin-top: 15px;">Sudah melewati level ini</div>';
        }
        
        card.innerHTML = `
            <div class="vip-icon">${icon}</div>
            <h3>${vip.name}</h3>
            <div class="price" style="font-size: 24px; font-weight: bold; margin: 10px 0;">Rp ${vip.price.toLocaleString('id-ID')}</div>
            <div class="benefits" style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <p>✨ Keberuntungan <strong>${vip.luck}%</strong></p>
                <p>💰 Max Top Up <strong>Rp ${vip.maxTopup.toLocaleString('id-ID')}</strong></p>
            </div>
            <div class="games" style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <p><strong>Game:</strong></p>
                ${gamesList}
            </div>
            ${buttonHtml}
        `;
        
        container.appendChild(card);
    }
}

// Select payment method
function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // Remove selected class from all options
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selected class to chosen option
    document.getElementById(`option${method}`).classList.add('selected');
    
    // Show/hide QRIS display
    const qrisDisplay = document.getElementById('qrisDisplay');
    if (method === 'QRIS') {
        qrisDisplay.style.display = 'block';
    } else {
        qrisDisplay.style.display = 'none';
    }
    
    // Update payment detail in form if form is visible
    updatePaymentDetail();
}

// Update payment detail in form
function updatePaymentDetail() {
    const selectedMethodSpan = document.getElementById('selectedMethod');
    const paymentDetailSpan = document.getElementById('paymentDetail');
    
    if (!selectedMethodSpan || !paymentDetailSpan) return;
    
    selectedMethodSpan.textContent = selectedPaymentMethod;
    
    switch(selectedPaymentMethod) {
        case 'QRIS':
            paymentDetailSpan.innerHTML = 'Scan QRIS yang ditampilkan';
            break;
        case 'BCA':
            paymentDetailSpan.innerHTML = 'Bank BCA - 1234567890 a.n Dewa Guntur188';
            break;
        case 'DANA':
            paymentDetailSpan.innerHTML = 'DANA - 082210756431 a.n Dewa Guntur';
            break;
        case 'OVO':
            paymentDetailSpan.innerHTML = 'OVO - 082210756431 a.n Dewa Guntur';
            break;
    }
}

// Tampilkan form pembayaran
function showPaymentForm(level) {
    console.log('Show payment form for level:', level); // Untuk debugging
    
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        window.location.href = 'index.html';
        return;
    }

    targetVIPLevel = level;
    targetVIPData = vipLevels[level];
    
    const form = document.getElementById('paymentForm');
    const title = document.getElementById('paymentTitle');
    const selectedVIP = document.getElementById('selectedVIP');
    const paymentAmount = document.getElementById('paymentAmount');
    
    if (!form || !title || !selectedVIP || !paymentAmount) {
        console.error('Form elements tidak ditemukan!');
        return;
    }
    
    title.textContent = `PEMBAYARAN ${targetVIPData.name}`;
    selectedVIP.value = `${targetVIPData.name} - Keberuntungan ${targetVIPData.luck}%`;
    paymentAmount.value = `Rp ${targetVIPData.price.toLocaleString('id-ID')}`;
    
    // Set tanggal hari ini
    const today = new Date().toISOString().split('T')[0];
    const transferDate = document.getElementById('transferDate');
    if (transferDate) transferDate.value = today;
    
    // Update payment detail
    updatePaymentDetail();
    
    form.style.display = 'block';
    
    // Scroll ke form
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Cancel payment
function cancelPayment() {
    const form = document.getElementById('paymentForm');
    if (form) form.style.display = 'none';
    
    targetVIPLevel = null;
    targetVIPData = null;
    
    // Reset form
    const senderName = document.getElementById('senderName');
    const paymentProof = document.getElementById('paymentProof');
    const notes = document.getElementById('notes');
    const imagePreview = document.getElementById('imagePreview');
    
    if (senderName) senderName.value = '';
    if (paymentProof) paymentProof.value = '';
    if (notes) notes.value = '';
    if (imagePreview) imagePreview.innerHTML = '';
}

// Preview image
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" class="preview-image" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 5px; border: 2px solid #f1c40f;">`;
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '';
    }
}

// Submit payment
function submitVIPPayment() {
    console.log('Submit VIP payment'); // Untuk debugging
    
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    if (!targetVIPLevel || !targetVIPData) {
        showNotification('Pilih level VIP terlebih dahulu!', 'error');
        return;
    }

    const senderName = document.getElementById('senderName')?.value;
    const transferDate = document.getElementById('transferDate')?.value;
    const paymentProof = document.getElementById('paymentProof')?.files[0];
    const notes = document.getElementById('notes')?.value;

    if (!senderName || senderName.trim() === '') {
        showNotification('Nama pengirim harus diisi!', 'error');
        return;
    }

    if (!transferDate) {
        showNotification('Tanggal transfer harus diisi!', 'error');
        return;
    }

    if (!paymentProof) {
        showNotification('Bukti transfer harus diupload!', 'error');
        return;
    }

    // Tampilkan konfirmasi
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    if (!modal || !message) {
        console.error('Modal elements tidak ditemukan!');
        return;
    }
    
    let paymentDetail = '';
    switch(selectedPaymentMethod) {
        case 'QRIS':
            paymentDetail = 'Pembayaran via QRIS';
            break;
        case 'BCA':
            paymentDetail = 'Bank BCA - 1234567890';
            break;
        case 'DANA':
            paymentDetail = 'DANA - 082210756431';
            break;
        case 'OVO':
            paymentDetail = 'OVO - 082210756431';
            break;
    }
    
    message.innerHTML = `
        <p><strong>VIP:</strong> ${targetVIPData.name}</p>
        <p><strong>Harga:</strong> Rp ${targetVIPData.price.toLocaleString('id-ID')}</p>
        <p><strong>Metode:</strong> ${selectedPaymentMethod}</p>
        <p><strong>Detail:</strong> ${paymentDetail}</p>
        <p><strong>Nama Pengirim:</strong> ${senderName}</p>
        <p><strong>Tanggal:</strong> ${transferDate}</p>
        <p><strong>File Bukti:</strong> ${paymentProof.name}</p>
        <hr>
        <p style="color: #e74c3c;">Pastikan data sudah benar sebelum dikirim!</p>
    `;
    
    // Simpan data untuk diproses setelah konfirmasi
    window.pendingPayment = {
        senderName,
        transferDate,
        paymentProof,
        method: selectedPaymentMethod,
        notes
    };
    
    document.getElementById('confirmBtn').onclick = function() {
        processVIPPayment();
    };
    
    modal.style.display = 'block';
}

// Proses pembayaran VIP
function processVIPPayment() {
    closeConfirmModal();
    
    const data = window.pendingPayment;
    if (!data) return;
    
    // Simpan bukti pembayaran
    const reader = new FileReader();
    reader.onload = function(e) {
        const proofUrl = e.target.result;
        saveVIPRequest(data.senderName, data.transferDate, proofUrl, data.method, data.notes);
    };
    reader.readAsDataURL(data.paymentProof);
}

// Simpan request VIP
function saveVIPRequest(senderName, transferDate, proofUrl, method, notes) {
    // Data request VIP
    const vipRequest = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        userEmail: currentUser.email,
        vipLevel: targetVIPLevel,
        vipName: targetVIPData.name,
        amount: targetVIPData.price,
        luck: targetVIPData.luck,
        method: method,
        methodDetail: getMethodDetail(method),
        senderName: senderName,
        transferDate: transferDate,
        proofUrl: proofUrl,
        notes: notes || '',
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // Simpan ke localStorage
    let vipRequests = JSON.parse(localStorage.getItem('vipRequests')) || [];
    vipRequests.push(vipRequest);
    localStorage.setItem('vipRequests', JSON.stringify(vipRequests));

    // Tambah ke history
    const history = {
        id: Date.now(),
        userId: currentUser.id,
        type: 'vip',
        amount: -targetVIPData.price,
        description: `Pembelian ${targetVIPData.name} via ${method} - Menunggu Verifikasi Admin`,
        status: 'pending',
        date: new Date().toISOString()
    };
    histories.push(history);
    localStorage.setItem('histories', JSON.stringify(histories));

    showNotification('✅ Bukti pembayaran VIP berhasil dikirim! Menunggu verifikasi admin.', 'success');
    
    // Reset dan tutup form
    cancelPayment();
    
    // Redirect ke riwayat setelah 2 detik
    setTimeout(() => {
        window.location.href = 'riwayat.html';
    }, 2000);
}

// Get method detail
function getMethodDetail(method) {
    switch(method) {
        case 'QRIS':
            return 'QRIS - Scan kode';
        case 'BCA':
            return 'BCA - 1234567890';
        case 'DANA':
            return 'DANA - 082210756431';
        case 'OVO':
            return 'OVO - 082210756431';
        default:
            return method;
    }
}

// Open QRIS modal
function openQRIS() {
    document.getElementById('qrisModal').style.display = 'block';
}

// Close QRIS modal
function closeQRISModal() {
    document.getElementById('qrisModal').style.display = 'none';
}

// Copy QRIS link
function copyQRISLink() {
    const qrisLink = 'https://cdn.phototourl.com/uploads/2026-02-16-7fbca8f1-68b1-4b62-a6fa-b6e36a0be7a7.jpg';
    navigator.clipboard.writeText(qrisLink).then(() => {
        showNotification('✅ Link QRIS berhasil disalin!', 'success');
    }).catch(() => {
        showNotification('❌ Gagal menyalin link!', 'error');
    });
}

// Close confirm modal
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
    window.pendingPayment = null;
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✅ Berhasil disalin!', 'success');
    }).catch(() => {
        showNotification('❌ Gagal menyalin!', 'error');
    });
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    console.log('VIP page loaded'); // Untuk debugging
    // Set default payment method
    selectPayment('QRIS');
    
    // Tunggu sebentar untuk memastikan auth.js sudah load
    setTimeout(() => {
        loadVIPCards();
    }, 500);
});