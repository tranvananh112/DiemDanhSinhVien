// QR Code System for Cross-Device Room Access
class QRCodeSystem {
    constructor() {
        this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
        this.init();
    }

    init() {
        // Load QR Code library
        this.loadQRLibrary();
    }

    loadQRLibrary() {
        // Load QR.js library for generating QR codes
        if (!window.QRCode) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
            script.onload = () => {
                console.log('QR Code library loaded');
            };
            document.head.appendChild(script);
        }
    }

    // Generate QR Code for room access
    async generateRoomQR(roomData) {
        const roomInfo = {
            type: 'attendance_room',
            roomId: roomData.id,
            roomName: roomData.name,
            teacher: roomData.teacher,
            subject: roomData.subject,
            createdAt: roomData.createdAt,
            accessUrl: `${this.baseUrl}/student.html?room=${roomData.id}&auto=true`
        };

        // Create QR data string
        const qrData = JSON.stringify(roomInfo);
        
        // Show QR modal
        this.showQRModal(roomData, qrData);
        
        return qrData;
    }

    showQRModal(roomData, qrData) {
        // Remove existing modal
        const existingModal = document.querySelector('.qr-room-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'qr-room-modal';
        modal.innerHTML = `
            <div class="qr-room-modal-content">
                <div class="qr-modal-header">
                    <h3><i class="fas fa-qrcode"></i> Mã QR Phòng Điểm Danh</h3>
                    <button class="qr-close-btn" onclick="closeQRRoomModal()">&times;</button>
                </div>
                
                <div class="qr-room-info">
                    <div class="room-info-item">
                        <strong>Phòng:</strong> ${roomData.name}
                    </div>
                    <div class="room-info-item">
                        <strong>Giáo viên:</strong> ${roomData.teacher}
                    </div>
                    <div class="room-info-item">
                        <strong>Môn học:</strong> ${roomData.subject}
                    </div>
                    <div class="room-info-item">
                        <strong>ID Phòng:</strong> <span class="room-id-highlight">${roomData.id}</span>
                    </div>
                </div>

                <div class="qr-code-container">
                    <div id="qr-code-display"></div>
                    <p class="qr-instruction">Sinh viên quét mã này để tham gia phòng</p>
                </div>

                <div class="qr-sharing-options">
                    <h4>Cách chia sẻ với sinh viên:</h4>
                    <div class="sharing-methods">
                        <button class="share-btn" onclick="copyQRLink('${roomData.id}')">
                            <i class="fas fa-link"></i> Copy Link
                        </button>
                        <button class="share-btn" onclick="downloadQRCode()">
                            <i class="fas fa-download"></i> Tải QR
                        </button>
                        <button class="share-btn" onclick="printQRCode()">
                            <i class="fas fa-print"></i> In QR
                        </button>
                    </div>
                </div>

                <div class="qr-instructions">
                    <h4>Hướng dẫn cho sinh viên:</h4>
                    <ol>
                        <li>Mở camera điện thoại hoặc app quét QR</li>
                        <li>Quét mã QR này</li>
                        <li>Tự động mở trang điểm danh</li>
                        <li>Điền thông tin và chụp ảnh</li>
                    </ol>
                    <p class="alternative-method">
                        <strong>Hoặc:</strong> Truy cập thủ công: 
                        <code>${this.baseUrl}/student.html</code> và nhập ID: <strong>${roomData.id}</strong>
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addQRModalStyles();
        
        // Generate QR code
        setTimeout(() => {
            this.renderQRCode(qrData);
        }, 100);
    }

    async renderQRCode(qrData) {
        const qrContainer = document.getElementById('qr-code-display');
        if (!qrContainer) return;

        try {
            // Clear container
            qrContainer.innerHTML = '';
            
            if (window.QRCode && window.QRCode.toCanvas) {
                // Use QRCode library if available
                const canvas = document.createElement('canvas');
                await window.QRCode.toCanvas(canvas, qrData, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                qrContainer.appendChild(canvas);
            } else {
                // Fallback: Use online QR service
                const qrImg = document.createElement('img');
                const encodedData = encodeURIComponent(qrData);
                qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;
                qrImg.alt = 'QR Code';
                qrImg.style.maxWidth = '100%';
                qrContainer.appendChild(qrImg);
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrContainer.innerHTML = `
                <div class="qr-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Không thể tạo mã QR</p>
                    <small>Vui lòng sử dụng ID phòng: <strong>${JSON.parse(qrData).roomId}</strong></small>
                </div>
            `;
        }
    }

    addQRModalStyles() {
        if (document.getElementById('qr-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'qr-modal-styles';
        style.textContent = `
            .qr-room-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                backdrop-filter: blur(5px);
            }

            .qr-room-modal-content {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
                position: relative;
            }

            .qr-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }

            .qr-modal-header h3 {
                margin: 0;
                font-size: 1.5em;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .qr-close-btn {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                font-size: 2em;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .qr-close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            .qr-room-info {
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 25px;
            }

            .room-info-item {
                margin-bottom: 10px;
                font-size: 1.1em;
            }

            .room-info-item:last-child {
                margin-bottom: 0;
            }

            .room-id-highlight {
                background: rgba(52, 152, 219, 0.3);
                padding: 4px 8px;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: #3498db;
            }

            .qr-code-container {
                text-align: center;
                margin-bottom: 25px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
            }

            #qr-code-display {
                background: white;
                padding: 20px;
                border-radius: 10px;
                display: inline-block;
                margin-bottom: 15px;
            }

            .qr-instruction {
                font-size: 1.1em;
                margin: 0;
                opacity: 0.9;
            }

            .qr-error {
                background: rgba(231, 76, 60, 0.2);
                border: 1px solid #e74c3c;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }

            .qr-error i {
                font-size: 2em;
                margin-bottom: 10px;
                color: #e74c3c;
            }

            .qr-sharing-options {
                margin-bottom: 25px;
            }

            .qr-sharing-options h4 {
                margin-bottom: 15px;
                font-size: 1.2em;
            }

            .sharing-methods {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                justify-content: center;
            }

            .share-btn {
                background: linear-gradient(145deg, #3498db, #2980b9);
                border: none;
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9em;
            }

            .share-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }

            .qr-instructions {
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 10px;
            }

            .qr-instructions h4 {
                margin-bottom: 15px;
                font-size: 1.2em;
            }

            .qr-instructions ol {
                margin-left: 20px;
                margin-bottom: 15px;
            }

            .qr-instructions li {
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .alternative-method {
                background: rgba(243, 156, 18, 0.2);
                border: 1px solid #f39c12;
                padding: 15px;
                border-radius: 8px;
                margin: 0;
            }

            .alternative-method code {
                background: rgba(0, 0, 0, 0.3);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .qr-room-modal-content {
                    padding: 20px;
                    margin: 10px;
                }

                .sharing-methods {
                    flex-direction: column;
                }

                .share-btn {
                    justify-content: center;
                }

                #qr-code-display {
                    padding: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Parse QR code data when student scans
    parseQRData(qrString) {
        try {
            const data = JSON.parse(qrString);
            if (data.type === 'attendance_room' && data.roomId) {
                return {
                    success: true,
                    roomId: data.roomId,
                    roomName: data.roomName,
                    teacher: data.teacher,
                    subject: data.subject,
                    accessUrl: data.accessUrl
                };
            }
        } catch (error) {
            console.error('Invalid QR data:', error);
        }
        return { success: false };
    }

    // Auto-join room from QR scan
    autoJoinRoom(roomId) {
        // Check if room exists in local storage
        const room = simpleStorage.getRoom(roomId);
        if (room && room.isActive) {
            // Auto-fill room ID and show success message
            const roomIdInput = document.getElementById('roomId');
            if (roomIdInput) {
                roomIdInput.value = roomId;
                showNotification(`Đã quét thành công! Phòng: ${room.name}`, 'success');
                
                // Auto-submit form after 1 second
                setTimeout(() => {
                    const form = document.getElementById('joinRoomForm');
                    if (form) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }, 1000);
            }
            return true;
        } else {
            showNotification('Phòng không tồn tại hoặc đã đóng', 'error');
            return false;
        }
    }

    // Generate shareable link
    generateShareLink(roomId) {
        return `${this.baseUrl}/student.html?room=${roomId}&auto=true`;
    }
}

// Global functions for QR modal
function closeQRRoomModal() {
    const modal = document.querySelector('.qr-room-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
}

function copyQRLink(roomId) {
    const link = qrSystem.generateShareLink(roomId);
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            showNotification('Link đã được sao chép!', 'success');
        });
    } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Link đã được sao chép!', 'success');
    }
}

function downloadQRCode() {
    const canvas = document.querySelector('#qr-code-display canvas');
    const img = document.querySelector('#qr-code-display img');
    
    if (canvas) {
        // Download canvas as image
        const link = document.createElement('a');
        link.download = `qr-code-room-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        showNotification('QR Code đã được tải xuống!', 'success');
    } else if (img) {
        // Download image
        const link = document.createElement('a');
        link.download = `qr-code-room-${Date.now()}.png`;
        link.href = img.src;
        link.click();
        showNotification('QR Code đã được tải xuống!', 'success');
    } else {
        showNotification('Không thể tải QR Code', 'error');
    }
}

function printQRCode() {
    const qrContainer = document.getElementById('qr-code-display');
    if (!qrContainer) {
        showNotification('Không thể in QR Code', 'error');
        return;
    }

    // Create print window
    const printWindow = window.open('', '_blank');
    const roomInfo = document.querySelector('.qr-room-info').innerHTML;
    
    printWindow.document.write(`
        <html>
        <head>
            <title>QR Code - Phòng Điểm Danh</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 20px;
                }
                .room-info { 
                    margin-bottom: 20px; 
                    text-align: left;
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 8px;
                }
                .room-info-item { 
                    margin-bottom: 8px; 
                }
                .room-id-highlight {
                    background: #e3f2fd;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-weight: bold;
                }
                .qr-code { 
                    margin: 20px 0; 
                }
                .instructions {
                    margin-top: 20px;
                    text-align: left;
                    background: #fff3e0;
                    padding: 15px;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <h1>Mã QR Phòng Điểm Danh</h1>
            <div class="room-info">${roomInfo}</div>
            <div class="qr-code">${qrContainer.innerHTML}</div>
            <div class="instructions">
                <h3>Hướng dẫn cho sinh viên:</h3>
                <ol>
                    <li>Mở camera điện thoại hoặc app quét QR</li>
                    <li>Quét mã QR này</li>
                    <li>Tự động mở trang điểm danh</li>
                    <li>Điền thông tin và chụp ảnh</li>
                </ol>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    showNotification('Đang in QR Code...', 'info');
}

// Initialize QR system
const qrSystem = new QRCodeSystem();

// Export global
window.qrSystem = qrSystem;