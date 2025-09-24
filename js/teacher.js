// JavaScript cho giao diện giáo viên
class TeacherDashboard {
    constructor() {
        this.currentRoom = null;
        this.students = [];
        this.roomTimer = null;
        this.init();
    }

    init() {
        this.loadExistingRoom();
        this.setupEventListeners();
        this.startRealtimeUpdates();
    }

    setupEventListeners() {
        // Form tạo phòng
        document.getElementById('createRoomForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createRoom();
        });

        // Tìm kiếm sinh viên
        document.getElementById('searchStudent').addEventListener('input', (e) => {
            this.filterStudents(e.target.value);
        });
    }

    createRoom() {
        const roomName = document.getElementById('roomName').value;
        const teacherName = document.getElementById('teacherName').value;
        const subject = document.getElementById('subject').value;

        if (!roomName || !teacherName || !subject) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        // Tạo room ID duy nhất
        const roomId = this.generateRoomId();
        
        // Tạo room object
        const room = {
            id: roomId,
            name: roomName,
            teacher: teacherName,
            subject: subject,
            createdAt: Date.now(),
            isActive: true,
            students: []
        };

        // Lưu vào localStorage
        this.saveRoom(room);
        this.currentRoom = room;
        
        // Cập nhật UI
        this.showRoomInfo();
        this.updateStudentsList();
        
        // Thêm hoạt động
        this.addActivity('room_created', `Phòng "${roomName}" đã được tạo với ID: ${roomId}`);
        
        // Reset form
        document.getElementById('createRoomForm').reset();
        
        showNotification(`Phòng đã được tạo thành công! ID: ${roomId}`, 'success');
    }

    generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Kiểm tra trùng lặp
        const systemData = this.getSystemData();
        if (systemData.rooms[result]) {
            return this.generateRoomId(); // Tạo lại nếu trùng
        }
        
        return result;
    }

    saveRoom(room) {
        // Lưu vào simple storage
        const saved = simpleStorage.saveRoom(room);
        
        if (saved) {
            showNotification('Phòng đã được lưu thành công!', 'success');
        } else {
            showNotification('Lỗi khi lưu phòng', 'error');
        }
        
        // Lưu current room
        localStorage.setItem('currentTeacherRoom', room.id);
    }

    loadExistingRoom() {
        const currentRoomId = localStorage.getItem('currentTeacherRoom');
        if (currentRoomId) {
            const room = simpleStorage.getRoom(currentRoomId);
            
            if (room && room.isActive) {
                this.currentRoom = room;
                this.students = room.students || [];
                this.showRoomInfo();
                this.updateStudentsList();
                this.startRoomTimer();
            }
        }
    }

    showRoomInfo() {
        const roomInfoCard = document.getElementById('roomInfoCard');
        const roomIdSpan = document.getElementById('currentRoomId');
        const attendedCount = document.getElementById('attendedCount');
        const roomTime = document.getElementById('roomTime');

        roomInfoCard.style.display = 'block';
        roomIdSpan.textContent = this.currentRoom.id;
        attendedCount.textContent = this.students.length;
        
        this.startRoomTimer();
    }

    startRoomTimer() {
        if (this.roomTimer) {
            clearInterval(this.roomTimer);
        }

        const startTime = this.currentRoom.createdAt;
        this.roomTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            document.getElementById('roomTime').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    copyRoomId() {
        const roomId = this.currentRoom.id;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(roomId).then(() => {
                showNotification('ID phòng đã được sao chép!', 'success');
            });
        } else {
            // Fallback cho trình duyệt cũ
            const textArea = document.createElement('textarea');
            textArea.value = roomId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('ID phòng đã được sao chép!', 'success');
        }
    }

    closeRoom() {
        if (!this.currentRoom) return;

        const confirmClose = confirm(`Bạn có chắc muốn đóng phòng "${this.currentRoom.name}"?\nTất cả dữ liệu sẽ được lưu lại.`);
        
        if (confirmClose) {
            // Đánh dấu phòng là không hoạt động
            this.currentRoom.isActive = false;
            this.currentRoom.closedAt = Date.now();
            
            // Lưu dữ liệu cuối cùng
            this.saveRoom(this.currentRoom);
            
            // Thêm hoạt động
            this.addActivity('room_closed', `Phòng "${this.currentRoom.name}" đã được đóng`);
            
            // Reset UI
            document.getElementById('roomInfoCard').style.display = 'none';
            this.currentRoom = null;
            this.students = [];
            
            // Xóa current room
            localStorage.removeItem('currentTeacherRoom');
            
            // Dừng timer
            if (this.roomTimer) {
                clearInterval(this.roomTimer);
            }
            
            // Cập nhật danh sách
            this.updateStudentsList();
            
            showNotification('Phòng đã được đóng thành công!', 'success');
        }
    }

    updateStudentsList() {
        const tableBody = document.getElementById('studentsTableBody');
        
        if (this.students.length === 0) {
            tableBody.innerHTML = `
                <tr class="no-data">
                    <td colspan="7">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có sinh viên nào điểm danh</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.students.map((student, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <img src="${student.photo}" alt="Ảnh ${student.name}" 
                         class="student-photo" onclick="showImageModal('${student.photo}', '${student.name}', '${student.studentId} - ${student.class}')">
                </td>
                <td>${student.name}</td>
                <td>${student.studentId}</td>
                <td>${student.class}</td>
                <td>${new Date(student.timestamp).toLocaleString('vi-VN')}</td>
                <td><span class="status-badge">Đã điểm danh</span></td>
            </tr>
        `).join('');

        // Cập nhật số lượng
        if (this.currentRoom) {
            document.getElementById('attendedCount').textContent = this.students.length;
        }
    }

    filterStudents(searchTerm) {
        const rows = document.querySelectorAll('#studentsTableBody tr:not(.no-data)');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm.toLowerCase());
            row.style.display = isVisible ? '' : 'none';
        });
    }

    addStudent(studentData) {
        // Kiểm tra trùng lặp MSSV
        const existingStudent = this.students.find(s => s.studentId === studentData.studentId);
        if (existingStudent) {
            return { success: false, message: 'Sinh viên đã điểm danh rồi!' };
        }

        // Thêm timestamp
        studentData.timestamp = Date.now();
        
        // Thêm vào danh sách
        this.students.push(studentData);
        
        // Cập nhật room data
        if (this.currentRoom) {
            this.currentRoom.students = this.students;
            this.saveRoom(this.currentRoom);
        }
        
        // Cập nhật UI
        this.updateStudentsList();
        
        // Thêm hoạt động
        this.addActivity('attendance_submitted', 
            `${studentData.name} (${studentData.studentId}) đã điểm danh`);
        
        return { success: true, message: 'Điểm danh thành công!' };
    }

    startRealtimeUpdates() {
        // Kiểm tra cập nhật từ sinh viên mỗi 2 giây
        setInterval(() => {
            if (this.currentRoom) {
                this.checkForNewAttendance();
            }
        }, 2000);
    }

    checkForNewAttendance() {
        const room = simpleStorage.getRoom(this.currentRoom.id);
        
        if (room && room.students && room.students.length !== this.students.length) {
            this.students = room.students;
            this.currentRoom = room; // Cập nhật current room
            this.updateStudentsList();
            showNotification(`Có ${room.students.length - this.students.length} sinh viên mới điểm danh!`, 'info');
        }
    }

    exportData() {
        if (!this.currentRoom || this.students.length === 0) {
            showNotification('Không có dữ liệu để xuất', 'error');
            return;
        }

        // Tạo CSV data
        const headers = ['STT', 'Họ Tên', 'MSSV', 'Lớp', 'Thời Gian Điểm Danh'];
        const csvData = [
            headers.join(','),
            ...this.students.map((student, index) => [
                index + 1,
                `"${student.name}"`,
                student.studentId,
                student.class,
                `"${new Date(student.timestamp).toLocaleString('vi-VN')}"`
            ].join(','))
        ].join('\n');

        // Tạo và download file
        const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `diem-danh-${this.currentRoom.id}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Dữ liệu đã được xuất thành công!', 'success');
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
        
        // Giới hạn số lượng hoạt động
        if (systemData.activities.length > 50) {
            systemData.activities = systemData.activities.slice(-50);
        }

        this.saveSystemData(systemData);
    }
}

// Khởi tạo dashboard
const teacherDashboard = new TeacherDashboard();

// Global functions
function goHome() {
    window.location.href = 'index.html';
}

function copyRoomId() {
    teacherDashboard.copyRoomId();
}

function closeRoom() {
    teacherDashboard.closeRoom();
}

function exportData() {
    teacherDashboard.exportData();
}

function showImageModal(imageSrc, studentName, studentInfo) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalStudentName = document.getElementById('modalStudentName');
    const modalStudentInfo = document.getElementById('modalStudentInfo');
    
    modalImage.src = imageSrc;
    modalStudentName.textContent = studentName;
    modalStudentInfo.textContent = studentInfo;
    
    modal.style.display = 'block';
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// Notification function (copy từ main.js)
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
    // Đóng modal khi click bên ngoài
    window.onclick = function(event) {
        const modal = document.getElementById('imageModal');
        if (event.target === modal) {
            closeImageModal();
        }
    };
});

// API để sinh viên gửi dữ liệu điểm danh
window.receiveAttendanceData = function(studentData) {
    return teacherDashboard.addStudent(studentData);
};

// Global function cho share room
function shareRoom() {
    if (teacherDashboard.currentRoom) {
        crossDeviceSync.shareRoom(teacherDashboard.currentRoom.id);
    } else {
        showNotification('Không có phòng nào để chia sẻ', 'error');
    }
}