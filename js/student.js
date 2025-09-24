// JavaScript cho giao diện sinh viên
class StudentAttendance {
    constructor() {
        this.currentStep = 1;
        this.roomData = null;
        this.studentInfo = null;
        this.capturedPhoto = null;
        this.video = null;
        this.canvas = null;
        this.stream = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCamera();
    }

    setupEventListeners() {
        // Form tham gia phòng
        document.getElementById('joinRoomForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.joinRoom();
        });

        // Form thông tin sinh viên
        document.getElementById('studentInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudentInfo();
        });

        // Camera elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
    }

    initializeCamera() {
        // Kiểm tra hỗ trợ camera
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showNotification('Trình duyệt không hỗ trợ camera', 'error');
            return;
        }
    }

    joinRoom() {
        const roomId = document.getElementById('roomId').value.toUpperCase();
        
        if (!roomId || roomId.length !== 6) {
            showNotification('Vui lòng nhập ID phòng hợp lệ (6 ký tự)', 'error');
            return;
        }

        // Kiểm tra phòng có tồn tại không
        const systemData = this.getSystemData();
        const room = systemData.rooms[roomId];

        if (!room) {
            showNotification('Không tìm thấy phòng với ID này', 'error');
            return;
        }

        if (!room.isActive) {
            showNotification('Phòng này đã được đóng', 'error');
            return;
        }

        // Lưu thông tin phòng
        this.roomData = room;
        
        // Hiển thị thông tin phòng
        document.getElementById('joinedRoomInfo').textContent = 
            `Phòng: ${room.name} - ${room.subject}`;

        // Chuyển sang bước 2
        this.goToStep(2);
        
        showNotification('Tham gia phòng thành công!', 'success');
    }

    saveStudentInfo() {
        const name = document.getElementById('studentName').value.trim();
        const studentId = document.getElementById('studentId').value.trim();
        const studentClass = document.getElementById('studentClass').value.trim();

        if (!name || !studentId || !studentClass) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        // Kiểm tra MSSV đã điểm danh chưa
        if (this.roomData.students && this.roomData.students.find(s => s.studentId === studentId)) {
            showNotification('MSSV này đã điểm danh rồi!', 'error');
            return;
        }

        // Lưu thông tin sinh viên
        this.studentInfo = {
            name: name,
            studentId: studentId,
            class: studentClass
        };

        // Chuyển sang bước 3
        this.goToStep(3);
        
        showNotification('Thông tin đã được lưu!', 'success');
    }

    goToStep(step) {
        // Ẩn tất cả các bước
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).style.display = 'none';
        }
        
        // Hiển thị bước hiện tại
        document.getElementById(`step${step}`).style.display = 'block';
        this.currentStep = step;

        // Scroll to top
        window.scrollTo(0, 0);
    }

    async startCamera() {
        try {
            // Yêu cầu quyền truy cập camera
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            // Hiển thị video stream
            this.video.srcObject = this.stream;
            this.video.style.display = 'block';

            // Cập nhật UI
            document.getElementById('startCamera').style.display = 'none';
            document.getElementById('capturePhoto').style.display = 'inline-flex';

            showNotification('Camera đã được bật!', 'success');

        } catch (error) {
            console.error('Lỗi khi truy cập camera:', error);
            
            let errorMessage = 'Không thể truy cập camera. ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Vui lòng cho phép truy cập camera.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'Không tìm thấy camera.';
            } else {
                errorMessage += 'Vui lòng kiểm tra camera và thử lại.';
            }
            
            showNotification(errorMessage, 'error');
        }
    }

    capturePhoto() {
        if (!this.stream) {
            showNotification('Camera chưa được khởi động', 'error');
            return;
        }

        // Thiết lập canvas
        const context = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Vẽ frame hiện tại lên canvas
        context.drawImage(this.video, 0, 0);

        // Chuyển đổi thành base64
        this.capturedPhoto = this.canvas.toDataURL('image/jpeg', 0.8);

        // Hiển thị ảnh đã chụp
        this.showPhotoPreview();

        // Dừng camera
        this.stopCamera();

        showNotification('Ảnh đã được chụp!', 'success');
    }

    showPhotoPreview() {
        const previewDiv = document.getElementById('photoPreview');
        const capturedImage = document.getElementById('capturedImage');
        
        // Hiển thị ảnh
        capturedImage.src = this.capturedPhoto;
        previewDiv.style.display = 'block';

        // Hiển thị thông tin sinh viên
        document.getElementById('summaryName').textContent = this.studentInfo.name;
        document.getElementById('summaryId').textContent = this.studentInfo.studentId;
        document.getElementById('summaryClass').textContent = this.studentInfo.class;

        // Cập nhật UI buttons
        document.getElementById('capturePhoto').style.display = 'none';
        document.getElementById('retakePhoto').style.display = 'inline-flex';

        // Scroll to preview
        previewDiv.scrollIntoView({ behavior: 'smooth' });
    }

    retakePhoto() {
        // Ẩn preview
        document.getElementById('photoPreview').style.display = 'none';
        
        // Reset captured photo
        this.capturedPhoto = null;
        
        // Cập nhật UI
        document.getElementById('retakePhoto').style.display = 'none';
        document.getElementById('startCamera').style.display = 'inline-flex';
        
        // Ẩn video
        this.video.style.display = 'none';
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.video.style.display = 'none';
    }

    async submitAttendance() {
        if (!this.capturedPhoto || !this.studentInfo || !this.roomData) {
            showNotification('Thiếu thông tin để điểm danh', 'error');
            return;
        }

        try {
            // Tạo dữ liệu điểm danh
            const attendanceData = {
                ...this.studentInfo,
                photo: this.capturedPhoto,
                roomId: this.roomData.id,
                timestamp: Date.now()
            };

            // Lưu vào localStorage
            const result = this.saveAttendanceData(attendanceData);
            
            if (result.success) {
                // Hiển thị thông tin thành công
                document.getElementById('attendanceTime').textContent = 
                    new Date().toLocaleString('vi-VN');
                document.getElementById('attendanceRoom').textContent = 
                    this.roomData.name;

                // Chuyển sang bước 4
                this.goToStep(4);
                
                showNotification('Điểm danh thành công!', 'success');
                
                // Thêm hoạt động
                this.addActivity('attendance_submitted', 
                    `${this.studentInfo.name} đã điểm danh thành công`);
                    
            } else {
                showNotification(result.message, 'error');
            }

        } catch (error) {
            console.error('Lỗi khi gửi điểm danh:', error);
            showNotification('Có lỗi xảy ra khi điểm danh', 'error');
        }
    }

    saveAttendanceData(attendanceData) {
        try {
            // Lấy dữ liệu hệ thống
            const systemData = this.getSystemData();
            const room = systemData.rooms[this.roomData.id];

            if (!room) {
                return { success: false, message: 'Phòng không tồn tại' };
            }

            if (!room.isActive) {
                return { success: false, message: 'Phòng đã được đóng' };
            }

            // Kiểm tra trùng lặp
            const existingStudent = room.students.find(s => s.studentId === attendanceData.studentId);
            if (existingStudent) {
                return { success: false, message: 'Bạn đã điểm danh rồi!' };
            }

            // Thêm sinh viên vào phòng
            room.students.push(attendanceData);

            // Lưu lại dữ liệu
            this.saveSystemData(systemData);

            return { success: true, message: 'Điểm danh thành công!' };

        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu:', error);
            return { success: false, message: 'Lỗi hệ thống' };
        }
    }

    newAttendance() {
        // Reset tất cả dữ liệu
        this.roomData = null;
        this.studentInfo = null;
        this.capturedPhoto = null;
        this.stopCamera();

        // Reset forms
        document.getElementById('joinRoomForm').reset();
        document.getElementById('studentInfoForm').reset();
        document.getElementById('photoPreview').style.display = 'none';

        // Về bước 1
        this.goToStep(1);
        
        showNotification('Sẵn sàng cho lần điểm danh mới!', 'info');
    }

    // Utility methods
    getSystemData() {
        return JSON.parse(localStorage.getItem('attendanceSystem') || '{"rooms":{},"activities":[]}');
    }

    saveSystemData(data) {
        localStorage.setItem('attendanceSystem', JSON.stringify(data));
    }

    addActivity(type, message) {
        const systemData = this.getSystemData();
        const activity = {
            id: Date.now(),
            type: type,
            message: message,
            timestamp: Date.now()
        };

        systemData.activities.push(activity);
        
        if (systemData.activities.length > 50) {
            systemData.activities = systemData.activities.slice(-50);
        }

        this.saveSystemData(systemData);
    }
}

// Khởi tạo
const studentAttendance = new StudentAttendance();

// Global functions
function goHome() {
    // Dừng camera trước khi rời trang
    studentAttendance.stopCamera();
    window.location.href = 'index.html';
}

function startCamera() {
    studentAttendance.startCamera();
}

function capturePhoto() {
    studentAttendance.capturePhoto();
}

function retakePhoto() {
    studentAttendance.retakePhoto();
}

function submitAttendance() {
    studentAttendance.submitAttendance();
}

function newAttendance() {
    studentAttendance.newAttendance();
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .notification-success { border-left: 4px solid #27ae60; }
            .notification-error { border-left: 4px solid #e74c3c; }
            .notification-info { border-left: 4px solid #3498db; }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra hỗ trợ camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification('Trình duyệt không hỗ trợ camera. Vui lòng sử dụng Chrome, Firefox hoặc Safari.', 'error');
    }
});

// Cleanup khi rời trang
window.addEventListener('beforeunload', function() {
    studentAttendance.stopCamera();
});