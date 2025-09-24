// Main JavaScript cho trang chủ
class AttendanceSystem {
    constructor() {
        this.initializeSystem();
        this.loadRecentActivities();
    }

    initializeSystem() {
        // Khởi tạo localStorage nếu chưa có
        if (!localStorage.getItem('attendanceSystem')) {
            const systemData = {
                rooms: {},
                activities: [],
                settings: {
                    autoSave: true,
                    maxActivities: 50
                }
            };
            localStorage.setItem('attendanceSystem', JSON.stringify(systemData));
        }
    }

    loadRecentActivities() {
        const systemData = this.getSystemData();
        const activitiesContainer = document.getElementById('recentActivities');
        
        if (systemData.activities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Chưa có hoạt động nào</span>
                </div>
            `;
            return;
        }

        // Hiển thị 10 hoạt động gần nhất
        const recentActivities = systemData.activities
            .slice(-10)
            .reverse();

        activitiesContainer.innerHTML = recentActivities
            .map(activity => `
                <div class="activity-item">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                    <div class="activity-content">
                        <span>${activity.message}</span>
                        <small>${this.formatTime(activity.timestamp)}</small>
                    </div>
                </div>
            `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'room_created': 'fa-plus-circle',
            'student_joined': 'fa-user-plus',
            'attendance_submitted': 'fa-check-circle',
            'room_closed': 'fa-times-circle',
            'system': 'fa-cog'
        };
        return icons[type] || 'fa-info-circle';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // < 1 phút
            return 'Vừa xong';
        } else if (diff < 3600000) { // < 1 giờ
            return `${Math.floor(diff / 60000)} phút trước`;
        } else if (diff < 86400000) { // < 1 ngày
            return `${Math.floor(diff / 3600000)} giờ trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    }

    getSystemData() {
        return JSON.parse(localStorage.getItem('attendanceSystem'));
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
        if (systemData.activities.length > systemData.settings.maxActivities) {
            systemData.activities = systemData.activities.slice(-systemData.settings.maxActivities);
        }

        this.saveSystemData(systemData);
        this.loadRecentActivities();
    }
}

// Khởi tạo hệ thống
const attendanceSystem = new AttendanceSystem();

// Chọn vai trò
function selectRole(role) {
    // Thêm hiệu ứng loading
    const card = document.querySelector(`.${role}-card`);
    card.style.transform = 'scale(0.95)';
    card.style.opacity = '0.7';
    
    // Thêm hoạt động
    const message = role === 'teacher' 
        ? 'Giáo viên đã truy cập hệ thống'
        : 'Sinh viên đã truy cập hệ thống';
    
    attendanceSystem.addActivity('system', message);
    
    // Chuyển trang sau 500ms
    setTimeout(() => {
        if (role === 'teacher') {
            window.location.href = 'teacher.html';
        } else {
            window.location.href = 'student.html';
        }
    }, 500);
}

// Utility functions
function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getCurrentTime() {
    return new Date().toLocaleString('vi-VN');
}

function showNotification(message, type = 'info') {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Thêm CSS cho notification
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
            
            .notification-success {
                border-left: 4px solid #27ae60;
            }
            
            .notification-error {
                border-left: 4px solid #e74c3c;
            }
            
            .notification-info {
                border-left: 4px solid #3498db;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Kiểm tra browser support
function checkBrowserSupport() {
    const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    if (!isSupported) {
        showNotification('Trình duyệt không hỗ trợ camera. Vui lòng sử dụng Chrome, Firefox hoặc Safari.', 'error');
        return false;
    }
    
    return true;
}

// Export data to Excel (s�� được implement trong teacher.js)
function exportToExcel(data, filename) {
    // Placeholder function - sẽ được implement đầy đủ trong teacher.js
    console.log('Exporting data:', data);
    showNotification('Tính năng xuất Excel đang được phát triển', 'info');
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra browser support
    checkBrowserSupport();
    
    // Thêm animation cho các elements
    const cards = document.querySelectorAll('.role-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Thêm welcome message
    setTimeout(() => {
        attendanceSystem.addActivity('system', 'Hệ thống điểm danh đã sẵn sàng');
    }, 1000);
});

// Service Worker cho offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}