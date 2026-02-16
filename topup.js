// Preview image sebelum upload
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" class="preview-image" alt="Preview">`;
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '';
    }
}

// Submit top up
function submitTopUp() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        window.location.href = 'index.html';
        return;
    }

    const amount = parseInt(document.getElementById('topupAmount')?.value);
    const method = document.getElementById('paymentMethod')?.value;
    const senderName = document.getElementById('senderName')?.value;
    const transferDate = document.getElementById('transferDate')?.value;
    const paymentProof = document.getElementById('paymentProof')?.files[0];
    const notes = document.getElementById('notes')?.value;

    if (!amount || amount < 10000) {
        showNotification('Minimal top up Rp 10.000!', 'error');
        return;
    }

    if (!method || !senderName || !transferDate) {
        showNotification('Semua field harus diisi!', 'error');
        return;
    }

    // Simpan bukti pembayaran ke localStorage
    let proofUrl = '';
    if (paymentProof) {
        const reader = new FileReader();
        reader.onload = function(e) {
            proofUrl = e.target.result;
            saveTopUp(amount, method, senderName, transferDate, proofUrl, notes);
        };
        reader.readAsDataURL(paymentProof);
    } else {
        saveTopUp(amount, method, senderName, transferDate, '', notes);
    }
}

// Simpan data top up
function saveTopUp(amount, method, senderName, transferDate, proofUrl, notes) {
    const topup = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        amount: amount,
        method: method,
        senderName: senderName,
        transferDate: transferDate,
        proofUrl: proofUrl,
        notes: notes,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    topups.push(topup);
    localStorage.setItem('topups', JSON.stringify(topups));

    // Tambah ke history
    const history = {
        id: Date.now(),
        userId: currentUser.id,
        type: 'topup',
        amount: amount,
        description: `Top Up Rp ${amount.toLocaleString('id-ID')} via ${method} (Pending)`,
        status: 'pending',
        date: new Date().toISOString()
    };
    histories.push(history);
    localStorage.setItem('histories', JSON.stringify(histories));

    showNotification('Bukti pembayaran berhasil dikirim! Menunggu verifikasi admin.', 'success');
    
    // Reset form
    document.getElementById('topupAmount').value = '';
    document.getElementById('senderName').value = '';
    document.getElementById('transferDate').value = '';
    document.getElementById('paymentProof').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('imagePreview').innerHTML = '';

    setTimeout(() => {
        window.location.href = 'riwayat.html';
    }, 2000);
}

// Copy ke clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Berhasil disalin!', 'success');
    }).catch(() => {
        showNotification('Gagal menyalin!', 'error');
    });
}

// Copy link QRIS
function copyQRISLink() {
    const qrisLink = 'https://cdn.phototourl.com/uploads/2026-02-16-7fbca8f1-68b1-4b62-a6fa-b6e36a0be7a7.jpg';
    navigator.clipboard.writeText(qrisLink).then(() => {
        showNotification('Link QRIS berhasil disalin!', 'success');
    }).catch(() => {
        showNotification('Gagal menyalin link!', 'error');
    });
}

// Open QRIS modal
function openQRIS() {
    document.getElementById('qrisModal').style.display = 'block';
}

// Close QRIS modal
function closeQRISModal() {
    document.getElementById('qrisModal').style.display = 'none';
}

// Format date untuk input
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('transferDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
});