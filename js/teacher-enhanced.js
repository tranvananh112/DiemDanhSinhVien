// Enhanced Teacher Dashboard - Complete Implementation
class TeacherDashboard {
    constructor() {
        this.currentRoom = null;
        this.students = [];
        this.roomTimer = null;
        this.importedStudents = [];
        this.realTimeInterval = null;
        this.init();
    }

    init() {
        this.loadExistingRoom();
        this.setupEventListeners();
        this.startRealtimeUpdates();
        this.initEnhancedFeatures();
    }

    initEnhancedFeatures() {
        // Listen for face recognition model loading
        document.addEventListener('faceRecognition:modelsLoaded', () => {
            console.log('Face recognition models loaded in teacher dashboard');
        });

        // Listen for data changes from other devices
        window.addEventListener('dataChanged', (event) => {
            this.handleDataChanged(event.detail);
        });

        // Start real-time updates
        this.startRealTimeUpdates();
    }

    handleDataChanged(detail) {
        if (this.currentRoom && detail.data.rooms[this.currentRoom.id]) {
            const updatedRoom = detail.data.rooms[this.currentRoom.id];
            
            // Check if there are new students
            const currentStudentCount = this.students.length;
            const newStudentCount = updatedRoom.students ? updatedRoom.students.length : 0;
            
            if (newStudentCount > currentStudentCount) {
                // Update local data
                this.currentRoom = updatedRoom;
                this.students = updatedRoom.students || [];
                
                // Update UI
                this.updateStudentsList();
                
                // Show notification for new students
                const newStudents = this.students.slice(currentStudentCount);
                newStudents.forEach(student => {
                    this.showNotification(`${student.name} vừa điểm danh từ thiết bị khác`, 'success');
                });
            }
        }
    }

    setupEventListeners() {
        // Form tạo phòng
        const createRoomForm = document.getElementById('createRoomForm');
        if (createRoomForm) {
            createRoomForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createRoom();
            });
        }

        // T��m kiếm sinh viên
        const searchStudent = document.getElementById('searchStudent');
        if (searchStudent) {
            searchStudent.addEventListener('input', (e) => {
                this.filterStudents(e.target.value);
            });
        }
    }

    // Excel Import Functions
    triggerExcelImport() {
        const fileInput = document.getElementById('excelFileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    async handleExcelImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const importStatus = document.getElementById('importStatus');
        const studentPreview = document.getElementById('studentPreview');

        try {
            // Show loading
            if (importStatus) {
                importStatus.style.display = 'block';
                importStatus.innerHTML = `
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Đang xử lý file Excel...</span>
                    </div>
                `;
            }

            // Import Excel file
            const result = await excelHandler.importExcelFile(file);

            if (result.success) {
                this.importedStudents = result.students;
                
                // Show success status
                if (importStatus) {
                    importStatus.innerHTML = `
                        <div class="success">
                            <i class="fas fa-check-circle"></i>
                            <span>${result.message}</span>
                        </div>
                    `;
                }

                // Show preview
                this.showStudentPreview(result.students);
                if (studentPreview) {
                    studentPreview.style.display = 'block';
                }

                this.showNotification(`Đã nhập thành công ${result.students.length} sinh viên`, 'success');

            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Excel import error:', error);
            
            if (importStatus) {
                importStatus.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>Lỗi: ${error.message}</span>
                    </div>
                `;
            }

            this.showNotification('Lỗi khi nhập file Excel: ' + error.message, 'error');
        }

        // Reset file input
        event.target.value = '';
    }

    showStudentPreview(students) {
        const previewList = document.getElementById('previewList');
        if (!previewList) return;
        
        previewList.innerHTML = students.slice(0, 10).map(student => `
            <div class="preview-item">
                <span class="stt">${student.stt}</span>
                <span class="mssv">${student.studentId}</span>
                <span class="name">${student.name}</span>
                <span class="class">${student.class}</span>
            </div>
        `).join('');

        if (students.length > 10) {
            previewList.innerHTML += `
                <div class="preview-more">
                    <i class="fas fa-ellipsis-h"></i>
                    <span>và ${students.length - 10} sinh viên khác...</span>
                </div>
            `;
        }
    }

    downloadTemplate() {
        try {
            const result = excelHandler.createTemplate();
            if (result.success) {
                this.showNotification('Template đã được tải xuống', 'success');
            }
        } catch (error) {
            this.showNotification('Lỗi khi tải template: ' + error.message, 'error');
        }
    }

    createRoom() {
        const roomNameEl = document.getElementById('roomName');
        const teacherNameEl = document.getElementById('teacherName');
        const subjectEl = document.getElementById('subject');

        if (!roomNameEl || !teacherNameEl || !subjectEl) {
            this.showNotification('Không tìm thấy form elements', 'error');
            return;
        }

        const roomName = roomNameEl.value.trim();
        const teacherName = teacherNameEl.value.trim();
        const subject = subjectEl.value.trim();

        if (!roomName || !teacherName || !subject) {
            this.showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        // Generate room ID
        const roomId = this.generateRoomId();
        
        // Create room object with imported students
        const room = {
            id: roomId,
            name: roomName,
            teacher: teacherName,
            subject: subject,
            createdAt: Date.now(),
            isActive: true,
            students: [],
            studentList: this.importedStudents || [],
            totalStudents: this.importedStudents.length || 0
        };

        // Save room
        const saved = this.saveRoom(room);
        if (!saved) {
            this.showNotification('Lỗi khi lưu phòng', 'error');
            return;
        }

        this.currentRoom = room;
        
        // Update UI
        this.showRoomInfo();
        this.updateStudentsList();
        
        // Add activity
        this.addActivity('room_created', 
            `Phòng "${roomName}" đã được tạo với ${room.totalStudents} sinh viên`);
        
        // Reset form and imported data
        document.getElementById('createRoomForm').reset();
        this.clearImportData();
        
        this.showNotification(`Phòng đã được tạo thành công! ID: ${roomId}`, 'success');
    }

    generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Check for duplicates
        if (typeof simpleStorage !== 'undefined') {
            const existingRoom = simpleStorage.getRoom(result);
            if (existingRoom) {
                return this.generateRoomId(); // Generate again if duplicate
            }
        }
        
        return result;
    }

    saveRoom(room) {
        try {
            // Save using simple storage
            if (typeof simpleStorage !== 'undefined') {
                const saved = simpleStorage.saveRoom(room);
                if (saved) {
                    // Save current room ID
                    localStorage.setItem('currentTeacherRoom', room.id);
                    return true;
                }
            } else {
                // Fallback to localStorage
                const systemData = this.getSystemData();
                systemData.rooms[room.id] = room;
                localStorage.setItem('attendanceSystem', JSON.stringify(systemData));
                localStorage.setItem('currentTeacherRoom', room.id);
                return true;
            }
        } catch (error) {
            console.error('Error saving room:', error);
        }
        return false;
    }

    loadExistingRoom() {
        const currentRoomId = localStorage.getItem('currentTeacherRoom');
        if (currentRoomId) {
            let room = null;
            
            if (typeof simpleStorage !== 'undefined') {
                room = simpleStorage.getRoom(currentRoomId);
            } else {
                const systemData = this.getSystemData();
                room = systemData.rooms[currentRoomId];
            }
            
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

        if (roomInfoCard) roomInfoCard.style.display = 'block';
        if (roomIdSpan) roomIdSpan.textContent = this.currentRoom.id;
        if (attendedCount) {
            const total = this.currentRoom.totalStudents || this.students.length;
            attendedCount.textContent = `${this.students.length}/${total}`;
        }
        
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
            
            const roomTimeEl = document.getElementById('roomTime');
            if (roomTimeEl) {
                roomTimeEl.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    clearImportData() {
        this.importedStudents = [];
        const importStatus = document.getElementById('importStatus');
        const studentPreview = document.getElementById('studentPreview');
        
        if (importStatus) importStatus.style.display = 'none';
        if (studentPreview) studentPreview.style.display = 'none';
    }

    updateStudentsList() {
        const tableBody = document.getElementById('studentsTableBody');
        if (!tableBody) return;
        
        if (!this.currentRoom) {
            tableBody.innerHTML = `
                <tr class="no-data">
                    <td colspan="7">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có phòng nào được tạo</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Combine attended students and student list
        const attendedStudents = this.students || [];
        const studentList = this.currentRoom.studentList || [];
        
        if (attendedStudents.length === 0 && studentList.length === 0) {
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

        // Create combined list showing all students with attendance status
        const combinedList = [];
        
        // Add students from Excel list
        studentList.forEach((student, index) => {
            const attendedStudent = attendedStudents.find(s => s.studentId === student.studentId);
            combinedList.push({
                stt: student.stt || index + 1,
                studentId: student.studentId,
                name: student.name,
                class: student.class,
                photo: attendedStudent?.photo || null,
                timestamp: attendedStudent?.timestamp || null,
                status: attendedStudent ? 'C' : 'V'
            });
        });

        // Add any attended students not in the original list
        attendedStudents.forEach(student => {
            if (!studentList.find(s => s.studentId === student.studentId)) {
                combinedList.push({
                    stt: combinedList.length + 1,
                    studentId: student.studentId,
                    name: student.name,
                    class: student.class,
                    photo: student.photo,
                    timestamp: student.timestamp,
                    status: 'C'
                });
            }
        });

        // Sort by STT
        combinedList.sort((a, b) => a.stt - b.stt);

        // Render table
        tableBody.innerHTML = combinedList.map(student => `
            <tr class="${student.status === 'C' ? 'attended' : 'absent'}">
                <td>${student.stt}</td>
                <td>
                    ${student.photo ? 
                        `<img src="${student.photo}" alt="Ảnh ${student.name}" 
                             class="student-photo" onclick="showImageModal('${student.photo}', '${student.name}', '${student.studentId} - ${student.class}')">` :
                        `<div class="no-photo"><i class="fas fa-user"></i></div>`
                    }
                </td>
                <td>${student.name}</td>
                <td>${student.studentId}</td>
                <td>${student.class}</td>
                <td>${student.timestamp ? new Date(student.timestamp).toLocaleString('vi-VN') : '-'}</td>
                <td>
                    <span class="status-badge ${student.status === 'C' ? 'present' : 'absent'}">
                        ${student.status === 'C' ? 'Có mặt' : 'Vắng'}
                    </span>
                </td>
            </tr>
        `).join('');

        // Update attendance count
        const attendedCount = combinedList.filter(s => s.status === 'C').length;
        const attendedCountEl = document.getElementById('attendedCount');
        if (attendedCountEl) {
            attendedCountEl.textContent = `${attendedCount}/${combinedList.length}`;
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
        // Check for duplicate MSSV
        const existingStudent = this.students.find(s => s.studentId === studentData.studentId);
        if (existingStudent) {
            return { success: false, message: 'Sinh viên đã điểm danh rồi!' };
        }

        // Add timestamp and order
        studentData.timestamp = Date.now();
        
        // Determine STT based on student list or attendance order
        if (this.currentRoom.studentList) {
            const studentInList = this.currentRoom.studentList.find(s => s.studentId === studentData.studentId);
            if (studentInList) {
                studentData.stt = studentInList.stt;
            } else {
                studentData.stt = this.currentRoom.studentList.length + this.students.length + 1;
            }
        } else {
            studentData.stt = this.students.length + 1;
        }
        
        // Add to students list
        this.students.push(studentData);
        
        // Update room data
        if (this.currentRoom) {
            this.currentRoom.students = this.students;
            this.saveRoom(this.currentRoom);
        }
        
        // Update UI
        this.updateStudentsList();
        
        // Add activity
        this.addActivity('attendance_submitted', 
            `${studentData.name} (${studentData.studentId}) đã điểm danh - STT: ${studentData.stt}`);
        
        return { success: true, message: 'Điểm danh thành công!' };
    }

    startRealtimeUpdates() {
        // Clear existing interval
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }

        // Check for updates every 2 seconds
        this.realTimeInterval = setInterval(() => {
            if (this.currentRoom && this.currentRoom.isActive) {
                this.checkForNewAttendance();
            }
        }, 2000);
    }

    checkForNewAttendance() {
        let room = null;
        
        if (typeof simpleStorage !== 'undefined') {
            room = simpleStorage.getRoom(this.currentRoom.id);
        } else {
            const systemData = this.getSystemData();
            room = systemData.rooms[this.currentRoom.id];
        }
        
        if (room && room.students) {
            const currentCount = this.students.length;
            const newCount = room.students.length;
            
            if (newCount > currentCount) {
                // New attendance detected
                const newStudents = room.students.slice(currentCount);
                
                // Update local data
                this.students = room.students;
                this.currentRoom = room;
                
                // Update UI
                this.updateStudentsList();
                
                // Show notification for each new student
                newStudents.forEach(student => {
                    this.showNotification(`${student.name} vừa điểm danh`, 'success');
                });

                // Add activity
                this.addActivity('attendance_received', 
                    `Nhận được ${newStudents.length} điểm danh mới`);
            }
        }
    }

    exportData() {
        if (!this.currentRoom) {
            this.showNotification('Không có phòng nào để xuất dữ liệu', 'error');
            return;
        }

        try {
            // Prepare export data
            const attendedStudents = this.students || [];
            const studentList = this.currentRoom.studentList || [];
            
            const exportData = [];
            
            if (studentList.length > 0) {
                // Export full student list with attendance status
                studentList.forEach((student, index) => {
                    const attendedStudent = attendedStudents.find(s => s.studentId === student.studentId);
                    exportData.push({
                        stt: student.stt || index + 1,
                        studentId: student.studentId,
                        name: student.name,
                        class: student.class,
                        status: attendedStudent ? 'C' : 'V',
                        timestamp: attendedStudent?.timestamp
                    });
                });

                // Add any attended students not in original list
                attendedStudents.forEach(student => {
                    if (!studentList.find(s => s.studentId === student.studentId)) {
                        exportData.push({
                            stt: exportData.length + 1,
                            studentId: student.studentId,
                            name: student.name,
                            class: student.class,
                            status: 'C',
                            timestamp: student.timestamp
                        });
                    }
                });
            } else {
                // Export only attended students
                attendedStudents.forEach((student, index) => {
                    exportData.push({
                        stt: index + 1,
                        studentId: student.studentId,
                        name: student.name,
                        class: student.class,
                        status: 'C',
                        timestamp: student.timestamp
                    });
                });
            }

            if (exportData.length === 0) {
                this.showNotification('Không có dữ liệu để xuất', 'error');
                return;
            }

            // Export to Excel if available, otherwise CSV
            if (typeof excelHandler !== 'undefined') {
                const filename = `diem-danh-${this.currentRoom.id}`;
                const result = excelHandler.exportToExcel(exportData, filename);

                if (result.success) {
                    this.showNotification(result.message, 'success');
                    this.addActivity('data_exported', 
                        `Đã xuất dữ liệu điểm danh (${exportData.length} bản ghi)`);
                } else {
                    this.showNotification(result.message, 'error');
                }
            } else {
                // Fallback to CSV
                this.exportToCSV(exportData);
            }

        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Lỗi khi xuất dữ liệu: ' + error.message, 'error');
        }
    }

    exportToCSV(data) {
        const headers = ['STT', 'MSSV', 'Họ Tên', 'Lớp', 'Trạng thái', 'Thời gian'];
        const csvData = [
            headers.join(','),
            ...data.map(student => [
                student.stt,
                student.studentId,
                `"${student.name}"`,
                student.class,
                student.status,
                student.timestamp ? `"${new Date(student.timestamp).toLocaleString('vi-VN')}"` : '-'
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `diem-danh-${this.currentRoom.id}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Dữ liệu đã được xuất thành công!', 'success');
    }

    copyRoomId() {
        if (!this.currentRoom) return;
        
        const roomId = this.currentRoom.id;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(roomId).then(() => {
                this.showNotification('ID phòng đã được sao chép!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = roomId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('ID phòng đã được sao chép!', 'success');
        }
    }

    closeRoom() {
        if (!this.currentRoom) return;

        const attendedCount = this.students.length;
        const totalCount = this.currentRoom.totalStudents || attendedCount;
        
        const confirmMessage = `Bạn có chắc muốn đóng phòng "${this.currentRoom.name}"?\n` +
                              `Đã có ${attendedCount}/${totalCount} sinh viên điểm danh.\n` +
                              `Tất cả dữ liệu sẽ được lưu lại.`;
        
        if (confirm(confirmMessage)) {
            // Mark room as inactive
            this.currentRoom.isActive = false;
            this.currentRoom.closedAt = Date.now();
            this.currentRoom.finalAttendanceCount = attendedCount;
            
            // Save final data
            this.saveRoom(this.currentRoom);
            
            // Add activity
            this.addActivity('room_closed', 
                `Phòng "${this.currentRoom.name}" đã đóng với ${attendedCount}/${totalCount} sinh viên có mặt`);
            
            // Reset UI
            const roomInfoCard = document.getElementById('roomInfoCard');
            if (roomInfoCard) roomInfoCard.style.display = 'none';
            
            this.currentRoom = null;
            this.students = [];
            
            // Clear current room
            localStorage.removeItem('currentTeacherRoom');
            
            // Stop timers
            if (this.roomTimer) {
                clearInterval(this.roomTimer);
            }
            if (this.realTimeInterval) {
                clearInterval(this.realTimeInterval);
            }
            
            // Update display
            this.updateStudentsList();
            
            this.showNotification('Phòng đã được đóng thành công!', 'success');
        }
    }

    // Utility methods
    getSystemData() {
        try {
            return JSON.parse(localStorage.getItem('attendanceSystem') || '{"rooms":{},"activities":[]}');
        } catch (error) {
            console.error('Error parsing system data:', error);
            return { rooms: {}, activities: [] };
        }
    }

    saveSystemData(data) {
        try {
            localStorage.setItem('attendanceSystem', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving system data:', error);
            return false;
        }
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
        
        // Limit activities
        if (systemData.activities.length > 50) {
            systemData.activities = systemData.activities.slice(-50);
        }

        this.saveSystemData(systemData);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add CSS if not exists
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
                    max-width: 350px;
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
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Cleanup on destroy
    destroy() {
        if (this.roomTimer) {
            clearInterval(this.roomTimer);
        }
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
    }
}

// Initialize dashboard
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
    
    if (modal && modalImage && modalStudentName && modalStudentInfo) {
        modalImage.src = imageSrc;
        modalStudentName.textContent = studentName;
        modalStudentInfo.textContent = studentInfo;
        modal.style.display = 'block';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Global functions for Excel handling
function triggerExcelImport() {
    teacherDashboard.triggerExcelImport();
}

function handleExcelImport(event) {
    teacherDashboard.handleExcelImport(event);
}

function downloadTemplate() {
    teacherDashboard.downloadTemplate();
}

function shareRoom() {
    if (teacherDashboard.currentRoom) {
        if (typeof crossDeviceSync !== 'undefined') {
            crossDeviceSync.shareRoom(teacherDashboard.currentRoom.id);
        } else {
            teacherDashboard.showNotification('Tính năng chia sẻ chưa khả dụng', 'info');
        }
    } else {
        teacherDashboard.showNotification('Không có phòng nào để chia sẻ', 'error');
    }
}

function generateQRCode() {
    if (teacherDashboard.currentRoom) {
        teacherDashboard.showNotification('Tính năng QR Code đang đư��c phát triển', 'info');
    } else {
        teacherDashboard.showNotification('Không có phòng nào để tạo QR Code', 'error');
    }
}

// API for students to send attendance data
window.receiveAttendanceData = function(studentData) {
    return teacherDashboard.addStudent(studentData);
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('imageModal');
        if (event.target === modal) {
            closeImageModal();
        }
    };
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    teacherDashboard.destroy();
});