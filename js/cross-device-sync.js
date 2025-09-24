// Cross-Device Sync Service - Đồng bộ dữ liệu giữa các thiết bị
// Fallback for global notification if not present
if (typeof window !== 'undefined' && typeof window.showNotification !== 'function') {
    window.showNotification = function(message, type = 'info') {
        try {
            const n = document.createElement('div');
            n.className = `notification notification-${type}`;
            n.style.position = 'fixed';
            n.style.top = '20px';
            n.style.right = '20px';
            n.style.background = 'rgba(0,0,0,0.8)';
            n.style.color = '#fff';
            n.style.padding = '10px 14px';
            n.style.borderRadius = '8px';
            n.style.zIndex = '9999';
            n.style.fontFamily = 'Arial, sans-serif';
            n.textContent = message;
            document.body.appendChild(n);
            setTimeout(() => { if (n && n.parentNode) n.parentNode.removeChild(n); }, 2500);
        } catch (e) {
            console.log(`[${type}] ${message}`);
        }
    };
}
class CrossDeviceSyncService {
    constructor() {
        this.syncMethods = [];
        this.isOnline = navigator.onLine;
        this.syncInterval = null;
        this.lastSyncTime = 0;
        
        this.initSyncMethods();
        this.startAutoSync();
        this.setupEventListeners();
    }

    initSyncMethods() {
        // Method 1: GitHub Gist (Miễn phí, không cần setup)
        this.syncMethods.push(new GithubGistSync());
        
        // Method 2: JSONBin.io (Miễn phí, dễ sử dụng)
        this.syncMethods.push(new JSONBinSync());
        
        // Method 3: Pastebin (Backup method)
        this.syncMethods.push(new PastebinSync());
        
        // Method 4: QR Code sharing (Offline method)
        this.syncMethods.push(new QRCodeSync());
    }

    setupEventListeners() {
        // Theo dõi trạng thái online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncData();
            showNotification('Đã kết nối internet - Đồng bộ dữ liệu', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            showNotification('Mất kết nối - Chuyển sang chế độ QR Code', 'info');
        });

        // Sync khi có thay đổi dữ liệu
        window.addEventListener('storage', (e) => {
            if (e.key === 'attendanceSystem') {
                this.syncData();
            }
        });
    }

    startAutoSync() {
        // Sync mỗi 10 giây
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.syncData();
            }
        }, 10000);
    }

    async syncData() {
        if (!this.isOnline) return;

        const localData = this.getLocalData();
        const syncId = this.generateSyncId();

        // Thử sync với từng method
        for (const method of this.syncMethods) {
            try {
                const success = await method.upload(localData, syncId);
                if (success) {
                    this.lastSyncTime = Date.now();
                    localStorage.setItem('lastSyncTime', this.lastSyncTime.toString());
                    localStorage.setItem('syncId', syncId);
                    
                    showNotification(`Đồng bộ thành công qua ${method.name}`, 'success');
                    break;
                }
            } catch (error) {
                console.warn(`Sync failed with ${method.name}:`, error);
            }
        }
    }

    async loadDataFromCloud(syncId) {
        // Hỗ trợ Mã dữ liệu (dài) ngoài Mã đồng bộ 6 ký tự
        if (!syncId) {
            syncId = prompt('Nhập MÃ ĐỒNG BỘ (6 ký tự) hoặc dán MÃ DỮ LIỆU:');
            if (!syncId) {
                showNotification('Không có mã được nhập', 'error');
                return false;
            }
        }

        // Nếu là Mã dữ liệu (dài hoặc có prefix), giải mã trực tiếp
        if (syncId.length > 12 || (typeof syncId === 'string' && syncId.startsWith('CDS1:'))) {
            try {
                const data = this.decodeCodeToData(syncId);
                this.mergeData(data);
                showNotification('Tải dữ liệu từ mã dữ liệu thành công', 'success');
                return true;
            } catch (e) {
                console.warn('Decode data code failed:', e);
                showNotification('Mã dữ liệu không hợp lệ', 'error');
                return false;
            }
        }

        // Nếu là mã 6 ký tự, thử các phương thức cloud
        if (syncId.length !== 6) {
            showNotification('Mã đồng bộ phải có 6 ký tự', 'error');
            return false;
        }

        // Thử load từ từng method
        for (const method of this.syncMethods) {
            try {
                const data = await method.download(syncId);
                if (data) {
                    this.mergeData(data);
                    showNotification(`Tải dữ liệu thành công từ ${method.name}`, 'success');
                    return true;
                }
            } catch (error) {
                console.warn(`Load failed from ${method.name}:`, error);
            }
        }

        showNotification('Không thể tải dữ liệu từ cloud với mã 6 ký tự. Vui lòng yêu cầu MÃ DỮ LIỆU từ giáo viên.', 'error');
        return false;
    }

    generateSyncId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Mã hóa dữ liệu thành MÃ DỮ LIỆU để chia sẻ cross-device không cần backend
    encodeDataToCode(data) {
        try {
            const json = JSON.stringify(data);
            const base64 = btoa(unescape(encodeURIComponent(json)));
            return 'CDS1:' + base64;
        } catch (e) {
            console.warn('encodeDataToCode failed:', e);
            return '';
        }
    }

    // Giải mã MÃ DỮ LIỆU thành object dữ liệu
    decodeCodeToData(code) {
        try {
            const raw = code.startsWith('CDS1:') ? code.slice(5) : code;
            const json = decodeURIComponent(escape(atob(raw)));
            return JSON.parse(json);
        } catch (e) {
            console.warn('decodeCodeToData failed:', e);
            throw e;
        }
    }

    getLocalData() {
        return JSON.parse(localStorage.getItem('attendanceSystem') || '{"rooms":{},"activities":[]}');
    }

    mergeData(cloudData) {
        const localData = this.getLocalData();
        
        // Merge rooms
        Object.keys(cloudData.rooms || {}).forEach(roomId => {
            const cloudRoom = cloudData.rooms[roomId];
            const localRoom = localData.rooms[roomId];
            
            if (!localRoom || cloudRoom.lastModified > (localRoom.lastModified || 0)) {
                localData.rooms[roomId] = cloudRoom;
            }
        });

        // Merge activities
        const allActivities = [...(localData.activities || []), ...(cloudData.activities || [])];
        const uniqueActivities = allActivities.filter((activity, index, self) => 
            index === self.findIndex(a => a.id === activity.id)
        );
        localData.activities = uniqueActivities.slice(-50); // Keep last 50

        localStorage.setItem('attendanceSystem', JSON.stringify(localData));
    }

    // Public methods
    async shareRoom(roomId) {
        const data = this.getLocalData();
        const room = data.rooms[roomId];
        
        if (!room) {
            showNotification('Phòng không tồn tại', 'error');
            return;
        }

        const shareData = { rooms: { [roomId]: room } };
        const syncId = this.generateSyncId();
        const dataCode = this.encodeDataToCode(shareData);

        // Thử đồng bộ qua các phương thức online (không bắt buộc thành công)
        if (this.isOnline) {
            for (const method of this.syncMethods) {
                try {
                    await method.upload(shareData, syncId);
                } catch (e) {
                    console.warn(`Upload via ${method.name} failed:`, e);
                }
            }
        } else {
            // Offline: tạo QR Code (chứa dữ liệu phòng)
            if (this.syncMethods[3] && this.syncMethods[3].generateQRCode) {
                this.syncMethods[3].generateQRCode(shareData, roomId);
            }
        }

        // Hiển thị hộp thoại chia sẻ với cả MÃ ĐỒNG BỘ và MÃ DỮ LIỆU
        this.showShareDialog(syncId, roomId, dataCode);
    }

    showShareDialog(syncId, roomId, dataCode) {
        const modal = document.createElement('div');
        modal.className = 'sync-modal';
        modal.innerHTML = `
            <div class="sync-modal-content">
                <h3><i class="fas fa-share-alt"></i> Chia Sẻ Phòng</h3>
                <p>Mã đồng bộ (6 ký tự) cho phòng <strong>${roomId}</strong>:</p>
                <div class="sync-code-display">
                    <span class="sync-code">${syncId}</span>
                    <button onclick="copyToClipboard('${syncId}')" class="btn-copy-sync">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="sync-instructions">
                    <h4>Hoặc dùng Mã dữ liệu (đề xuất):</h4>
                    <div class="data-code-section" style="text-align:left;margin-top:10px;">
                        <textarea readonly style="width:100%;height:100px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:#eee;padding:10px;box-sizing:border-box;font-family:'Courier New',monospace;">${dataCode}</textarea>
                        <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">
                            <button onclick="copyToClipboard(\`${dataCode}\`)" class="btn-copy-sync"><i class="fas fa-copy"></i> Sao chép Mã dữ liệu</button>
                        </div>
                    </div>
                    <h4>Hướng dẫn cho sinh viên:</h4>
                    <ol>
                        <li>Mở trang điểm danh</li>
                        <li>Click "Tải dữ liệu từ cloud"</li>
                        <li>Dán <strong>Mã dữ liệu</strong> vào hộp thoại (khuyến nghị)</li>
                        <li>Hoặc nhập <strong>Mã đồng bộ 6 ký tự</strong> nếu đã thiết lập cloud</li>
                        <li>Sau đó tham gia phòng bằng ID như bình thường</li>
                    </ol>
                </div>
                <div class="sync-actions">
                    <button onclick="closeSyncModal()" class="btn-close-sync">Đóng</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add CSS nếu chưa có
        if (!document.getElementById('syncModalStyles')) {
            const style = document.createElement('style');
            style.id = 'syncModalStyles';
            style.textContent = `
                .sync-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 2000; }
                .sync-modal-content { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 15px; padding: 30px; max-width: 600px; width: 90%; color: white; text-align: center; }
                .sync-code-display { display:flex; justify-content:center; align-items:center; gap:10px; margin:20px 0; background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; }
                .sync-code { font-size:2em; font-weight:bold; font-family:'Courier New', monospace; color:#3498db; text-shadow:0 0 10px rgba(52,152,219,0.5); }
                .sync-instructions { text-align:left; margin:20px 0; background:rgba(255,255,255,0.05); padding:15px; border-radius:10px; }
                .sync-instructions ol { margin-left:20px; }
                .sync-instructions li { margin:8px 0; }
                .btn-copy-sync, .btn-close-sync { background: linear-gradient(145deg, #3498db, #2980b9); border:none; color:white; padding:10px 15px; border-radius:8px; cursor:pointer; transition: all 0.3s ease; }
                .btn-copy-sync:hover, .btn-close-sync:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3); }
            `;
            document.head.appendChild(style);
        }
    }

    getSyncStatus() {
        const lastSync = localStorage.getItem('lastSyncTime');
        const syncId = localStorage.getItem('syncId');
        
        return {
            lastSync: lastSync ? new Date(parseInt(lastSync)).toLocaleString('vi-VN') : 'Chưa đồng bộ',
            syncId: syncId || 'Chưa có',
            isOnline: this.isOnline,
            methods: this.syncMethods.map(m => ({ name: m.name, status: m.isAvailable() }))
        };
    }
}

// GitHub Gist Sync Method
class GithubGistSync {
    constructor() {
        this.name = 'GitHub Gist';
        this.baseUrl = 'https://api.github.com/gists';
    }

    async upload(data, syncId) {
        const gistData = {
            description: `Attendance System Data - ${syncId}`,
            public: false,
            files: {
                [`attendance-${syncId}.json`]: {
                    content: JSON.stringify(data)
                }
            }
        };

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gistData)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem(`gist-${syncId}`, result.id);
            return true;
        }
        return false;
    }

    async download(syncId) {
        const gistId = localStorage.getItem(`gist-${syncId}`);
        if (!gistId) return null;

        const response = await fetch(`${this.baseUrl}/${gistId}`);
        if (response.ok) {
            const gist = await response.json();
            const fileName = Object.keys(gist.files)[0];
            return JSON.parse(gist.files[fileName].content);
        }
        return null;
    }

    isAvailable() {
        return navigator.onLine;
    }
}

// JSONBin.io Sync Method
class JSONBinSync {
    constructor() {
        this.name = 'JSONBin.io';
        this.baseUrl = 'https://api.jsonbin.io/v3/b';
        this.apiKey = '$2a$10$demo.key.for.attendance.system'; // Demo key
    }

    async upload(data, syncId) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': this.apiKey,
                'X-Bin-Name': `attendance-${syncId}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem(`jsonbin-${syncId}`, result.metadata.id);
            return true;
        }
        return false;
    }

    async download(syncId) {
        const binId = localStorage.getItem(`jsonbin-${syncId}`);
        if (!binId) return null;

        const response = await fetch(`${this.baseUrl}/${binId}/latest`, {
            headers: {
                'X-Master-Key': this.apiKey
            }
        });

        if (response.ok) {
            const result = await response.json();
            return result.record;
        }
        return null;
    }

    isAvailable() {
        return navigator.onLine;
    }
}

// Pastebin Sync Method (Backup)
class PastebinSync {
    constructor() {
        this.name = 'Pastebin';
        this.baseUrl = 'https://pastebin.com/api/api_post.php';
    }

    async upload(data, syncId) {
        // Simplified implementation
        console.log(`Would upload to Pastebin with ID: ${syncId}`);
        return false; // Disabled for demo
    }

    async download(syncId) {
        return null;
    }

    isAvailable() {
        return false; // Disabled for demo
    }
}

// QR Code Sync Method (Offline)
class QRCodeSync {
    constructor() {
        this.name = 'QR Code';
    }

    generateQRCode(data, roomId) {
        const qrData = JSON.stringify(data);
        const qrModal = document.createElement('div');
        qrModal.className = 'qr-modal';
        qrModal.innerHTML = `
            <div class="qr-modal-content">
                <h3><i class="fas fa-qrcode"></i> Chia Sẻ Offline</h3>
                <p>Quét mã QR này để tham gia phòng <strong>${roomId}</strong>:</p>
                <div class="qr-code-container">
                    <div id="qrcode"></div>
                </div>
                <p><small>Sinh viên cần quét mã này để tải dữ liệu phòng</small></p>
                <button onclick="closeQRModal()" class="btn-close-qr">Đóng</button>
            </div>
        `;

        document.body.appendChild(qrModal);
        
        // Generate QR Code (would need QR library in real implementation)
        document.getElementById('qrcode').innerHTML = `
            <div style="width: 200px; height: 200px; background: white; display: flex; align-items: center; justify-content: center; color: black; font-size: 12px; text-align: center;">
                QR Code<br/>
                Room: ${roomId}<br/>
                <small>Cần thư viện QR</small>
            </div>
        `;
    }

    isAvailable() {
        return true; // Always available offline
    }
}

// Global functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Đã sao chép mã đồng bộ!', 'success');
    });
}

function closeSyncModal() {
    const modal = document.querySelector('.sync-modal');
    if (modal) modal.remove();
}

function closeQRModal() {
    const modal = document.querySelector('.qr-modal');
    if (modal) modal.remove();
}

// Initialize sync service
const crossDeviceSync = new CrossDeviceSyncService();

// Export global
window.crossDeviceSync = crossDeviceSync;