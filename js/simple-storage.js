// Simple Storage Service - Không cần Firebase
class SimpleStorageService {
    constructor() {
        this.storageKey = 'attendanceSystem';
        this.init();
    }

    init() {
        // Khởi tạo dữ liệu nếu chưa có
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                rooms: {},
                activities: [],
                settings: {
                    autoSave: true,
                    maxActivities: 50
                }
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    // Lấy tất cả dữ liệu
    getData() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch (error) {
            console.error('Error parsing storage data:', error);
            return { rooms: {}, activities: [] };
        }
    }

    // Lưu tất cả dữ liệu
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Lưu phòng
    saveRoom(roomData) {
        const data = this.getData();
        data.rooms[roomData.id] = roomData;
        return this.saveData(data);
    }

    // Lấy phòng theo ID
    getRoom(roomId) {
        const data = this.getData();
        return data.rooms[roomId] || null;
    }

    // Lấy tất cả phòng
    getAllRooms() {
        const data = this.getData();
        return data.rooms || {};
    }

    // Thêm sinh viên vào phòng
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

        // Thêm sinh viên
        studentData.timestamp = Date.now();
        room.students.push(studentData);

        // Lưu dữ liệu
        data.rooms[roomId] = room;
        const saved = this.saveData(data);

        if (saved) {
            // Thêm hoạt động
            this.addActivity('attendance_submitted', 
                `${studentData.name} (${studentData.studentId}) đã điểm danh`);
            
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
            id: Date.now(),
            type: type,
            message: message,
            timestamp: Date.now()
        };

        data.activities.push(activity);

        // Giới hạn số lượng hoạt động
        if (data.activities.length > 50) {
            data.activities = data.activities.slice(-50);
        }

        return this.saveData(data);
    }

    // Lấy hoạt động gần đây
    getRecentActivities(limit = 10) {
        const data = this.getData();
        return data.activities.slice(-limit).reverse();
    }

    // Xóa dữ liệu cũ (phòng đã đóng > 7 ngày)
    cleanupOldData() {
        const data = this.getData();
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        Object.keys(data.rooms).forEach(roomId => {
            const room = data.rooms[roomId];
            if (!room.isActive && room.closedAt && room.closedAt < sevenDaysAgo) {
                delete data.rooms[roomId];
            }
        });

        return this.saveData(data);
    }

    // Export dữ liệu
    exportData() {
        return this.getData();
    }

    // Import dữ liệu
    importData(importedData) {
        try {
            // Validate data structure
            if (!importedData.rooms || !importedData.activities) {
                throw new Error('Invalid data structure');
            }
            
            return this.saveData(importedData);
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Kiểm tra dung lượng storage
    getStorageInfo() {
        const data = JSON.stringify(this.getData());
        const sizeInBytes = new Blob([data]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        
        return {
            size: sizeInKB + ' KB',
            roomCount: Object.keys(this.getData().rooms).length,
            activityCount: this.getData().activities.length
        };
    }
}

// Khởi tạo service
const simpleStorage = new SimpleStorageService();

// Export global
window.simpleStorage = simpleStorage;