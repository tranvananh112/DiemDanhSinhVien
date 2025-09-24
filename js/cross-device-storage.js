// Cross-Device Storage Service - Đồng bộ dữ liệu giữa các thiết bị
class CrossDeviceStorage {
    constructor() {
        this.storageKey = 'attendanceSystem';
        this.syncKey = 'attendanceSync';
        this.lastSyncTime = 0;
        this.syncInterval = null;
        this.init();
    }

    init() {
        // Khởi tạo dữ liệu nếu chưa có
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                rooms: {},
                activities: [],
                lastUpdate: Date.now(),
                settings: {
                    autoSync: true,
                    syncInterval: 2000 // 2 giây
                }
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }

        // Bắt đầu đồng bộ tự động
        this.startAutoSync();
        
        // Lắng nghe thay đổi từ các tab khác
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.handleStorageChange(e);
            }
        });
    }

    // Lấy tất cả dữ liệu
    getData() {
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            return {
                rooms: data.rooms || {},
                activities: data.activities || [],
                lastUpdate: data.lastUpdate || Date.now(),
                settings: data.settings || {}
            };
        } catch (error) {
            console.error('Error parsing storage data:', error);
            return { rooms: {}, activities: [], lastUpdate: Date.now(), settings: {} };
        }
    }

    // Lưu tất cả dữ liệu với timestamp
    saveData(data) {
        try {
            const dataWithTimestamp = {
                ...data,
                lastUpdate: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dataWithTimestamp));
            
            // Trigger storage event cho các tab khác
            this.triggerStorageEvent();
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Lưu phòng với đồng bộ
    saveRoom(roomData) {
        const data = this.getData();
        data.rooms[roomData.id] = {
            ...roomData,
            lastUpdate: Date.now()
        };
        
        // Thêm activity
        this.addActivity('room_updated', `Phòng ${roomData.id} đã được cập nhật`);
        
        return this.saveData(data);
    }

    // Lấy phòng
    getRoom(roomId) {
        const data = this.getData();
        return data.rooms[roomId] || null;
    }

    // Lấy tất cả phòng
    getAllRooms() {
        const data = this.getData();
        return data.rooms || {};
    }

    // Thêm sinh viên vào phòng với đồng bộ
    addStudentToRoom(roomId, studentData) {
        const data = this.getData();
        const room = data.rooms[roomId];
        
        if (!room) {
            return { success: false, message: 'Phòng không tồn tại' };
        }

        if (!room.isActive) {
            return { success: false, message: 'Phòng đã được đóng' };
        }

        // Khởi tạo mảng students nếu chưa có
        if (!room.students) {
            room.students = [];
        }

        // Kiểm tra trùng lặp MSSV
        const existingStudent = room.students.find(s => s.studentId === studentData.studentId);
        if (existingStudent) {
            return { success: false, message: 'Sinh viên đã điểm danh rồi!' };
        }

        // Thêm sinh viên với timestamp
        const studentWithTimestamp = {
            ...studentData,
            timestamp: Date.now(),
            deviceId: this.getDeviceId()
        };
        
        room.students.push(studentWithTimestamp);
        room.lastUpdate = Date.now();

        // Lưu dữ liệu
        data.rooms[roomId] = room;
        const saved = this.saveData(data);

        if (saved) {
            // Thêm hoạt động
            this.addActivity('attendance_submitted', 
                `${studentData.name} (${studentData.studentId}) đã điểm danh từ thiết bị ${this.getDeviceId().substring(0, 8)}`);
            
            // Force sync ngay lập tức
            this.forceSyncToAllDevices();
            
            return { success: true, message: 'Điểm danh thành công!' };
        } else {
            return { success: false, message: 'Lỗi khi lưu dữ liệu' };
        }
    }

    // Cập nhật trạng thái phòng
    updateRoomStatus(roomId, isActive) {
        const data = this.getData();
        if (data.rooms[roomId]) {
            data.rooms[roomId].isActive = isActive;
            data.rooms[roomId].lastUpdate = Date.now();
            
            if (!isActive) {
                data.rooms[roomId].closedAt = Date.now();
            }
            
            return this.saveData(data);
        }
        return false;
    }

    // Thêm hoạt động
    addActivity(type, message) {
        const data = this.getData();
        const activity = {
            id: Date.now() + Math.random(), // Đảm bảo unique
            type: type,
            message: message,
            timestamp: Date.now(),
            deviceId: this.getDeviceId()
        };

        data.activities.push(activity);

        // Giới hạn số lượng hoạt động
        if (data.activities.length > 100) {
            data.activities = data.activities.slice(-100);
        }

        return this.saveData(data);
    }

    // Lấy hoạt động gần đây
    getRecentActivities(limit = 10) {
        const data = this.getData();
        return data.activities.slice(-limit).reverse();
    }

    // Tạo device ID duy nhất
    getDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    // Bắt đầu đồng bộ tự động
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            this.checkForUpdates();
        }, 2000); // Kiểm tra mỗi 2 giây
    }

    // Dừng đồng bộ tự động
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Kiểm tra cập nhật từ các thiết bị khác
    checkForUpdates() {
        try {
            const currentData = this.getData();
            const lastUpdate = currentData.lastUpdate || 0;
            
            // Nếu có cập nhật mới từ thiết bị khác
            if (lastUpdate > this.lastSyncTime) {
                this.lastSyncTime = lastUpdate;
                this.notifyDataChanged(currentData);
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    // Thông báo dữ liệu đã thay đổi
    notifyDataChanged(newData) {
        // Dispatch custom event để các component khác biết
        const event = new CustomEvent('dataChanged', {
            detail: {
                data: newData,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }

    // Xử lý thay đổi storage từ tab khác
    handleStorageChange(event) {
        if (event.key === this.storageKey && event.newValue) {
            try {
                const newData = JSON.parse(event.newValue);
                this.notifyDataChanged(newData);
            } catch (error) {
                console.error('Error handling storage change:', error);
            }
        }
    }

    // Trigger storage event thủ công
    triggerStorageEvent() {
        // Tạo một thay đổi nhỏ để trigger storage event
        const syncData = {
            timestamp: Date.now(),
            deviceId: this.getDeviceId()
        };
        localStorage.setItem(this.syncKey, JSON.stringify(syncData));
    }

    // Force sync đến tất cả thiết bị
    forceSyncToAllDevices() {
        // Tạo một key tạm thời để force sync
        const forceSync = {
            action: 'force_sync',
            timestamp: Date.now(),
            deviceId: this.getDeviceId()
        };
        
        localStorage.setItem('forceSync_' + Date.now(), JSON.stringify(forceSync));
        
        // Xóa key sau 1 giây
        setTimeout(() => {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('forceSync_')) {
                    localStorage.removeItem(key);
                }
            });
        }, 1000);
    }

    // Export dữ liệu
    exportData() {
        return this.getData();
    }

    // Import dữ liệu
    importData(importedData) {
        try {
            // Validate data structure
            if (!importedData.rooms) {
                throw new Error('Invalid data structure - missing rooms');
            }
            
            const dataToSave = {
                rooms: importedData.rooms || {},
                activities: importedData.activities || [],
                lastUpdate: Date.now(),
                settings: importedData.settings || {}
            };
            
            return this.saveData(dataToSave);
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Xóa dữ liệu cũ
    cleanupOldData() {
        const data = this.getData();
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        // Xóa phòng đã đóng > 7 ngày
        Object.keys(data.rooms).forEach(roomId => {
            const room = data.rooms[roomId];
            if (!room.isActive && room.closedAt && room.closedAt < sevenDaysAgo) {
                delete data.rooms[roomId];
            }
        });

        // Xóa activities cũ > 7 ngày
        data.activities = data.activities.filter(activity => 
            activity.timestamp > sevenDaysAgo
        );

        return this.saveData(data);
    }

    // Kiểm tra kết nối giữa các thiết bị
    testConnection() {
        const testData = {
            test: true,
            timestamp: Date.now(),
            deviceId: this.getDeviceId()
        };
        
        localStorage.setItem('connectionTest', JSON.stringify(testData));
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const stored = localStorage.getItem('connectionTest');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    localStorage.removeItem('connectionTest');
                    resolve(parsed.deviceId === this.getDeviceId());
                } else {
                    resolve(false);
                }
            }, 100);
        });
    }

    // Lấy thông tin thống kê
    getStats() {
        const data = this.getData();
        const rooms = Object.values(data.rooms);
        const activeRooms = rooms.filter(room => room.isActive);
        const totalStudents = rooms.reduce((sum, room) => sum + (room.students?.length || 0), 0);
        
        return {
            totalRooms: rooms.length,
            activeRooms: activeRooms.length,
            totalStudents: totalStudents,
            totalActivities: data.activities.length,
            lastUpdate: data.lastUpdate,
            deviceId: this.getDeviceId()
        };
    }

    // Reset toàn bộ dữ liệu
    reset() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.syncKey);
        localStorage.removeItem('deviceId');
        
        // Xóa tất cả keys liên quan
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('forceSync_') || key.startsWith('connectionTest')) {
                localStorage.removeItem(key);
            }
        });
        
        this.init();
        return true;
    }

    // Cleanup khi destroy
    destroy() {
        this.stopAutoSync();
        window.removeEventListener('storage', this.handleStorageChange);
    }
}

// Khởi tạo service
const crossDeviceStorage = new CrossDeviceStorage();

// Export global
window.crossDeviceStorage = crossDeviceStorage;

// Compatibility với simpleStorage
window.simpleStorage = {
    saveRoom: (room) => crossDeviceStorage.saveRoom(room),
    getRoom: (roomId) => crossDeviceStorage.getRoom(roomId),
    getAllRooms: () => crossDeviceStorage.getAllRooms(),
    addStudentToRoom: (roomId, student) => crossDeviceStorage.addStudentToRoom(roomId, student),
    getData: () => crossDeviceStorage.getData(),
    exportData: () => crossDeviceStorage.exportData(),
    importData: (data) => crossDeviceStorage.importData(data)
};