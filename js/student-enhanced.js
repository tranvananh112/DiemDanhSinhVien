// Enhanced Student Attendance - Complete Implementation
class StudentAttendance {
    constructor() {
        this.currentStep = 1;
        this.roomData = null;
        this.studentInfo = null;
        this.capturedPhoto = null;
        this.video = null;
        this.canvas = null;
        this.stream = null;
        this.useFaceRecognition = false;
        this.faceRecognitionMode = 'normal';
        this.faceDetectionInterval = null;
        this.autoCaptureTimeout = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCamera();
        this.initEnhancedFeatures();
        this.initLinkImport();
    }

    initEnhancedFeatures() {
        // Listen for face recognition model loading
        document.addEventListener('faceRecognition:modelsLoaded', () => {
            console.log('Face recognition models loaded');
            this.onFaceModelsLoaded();
        });

        document.addEventListener('faceRecognition:modelsError', (event) => {
            console.error('Face recognition models failed to load:', event.detail);
            this.showNotification('Không thể t���i mô hình nhận diện khuôn mặt', 'error');
        });

        // Welcome message
        setTimeout(() => {
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakWelcome();
            }
        }, 1000);
    }

    onFaceModelsLoaded() {
        // Enable face recognition buttons
        const createFaceBtn = document.querySelector('.btn-create-face');
        const useFaceBtn = document.querySelector('.btn-use-face');
        
        if (createFaceBtn) createFaceBtn.disabled = false;
        if (useFaceBtn) useFaceBtn.disabled = false;
        
        this.showNotification('Hệ thống nhận diện khuôn mặt đã sẵn sàng!', 'success');
    }

    setupEventListeners() {
        // Form tham gia phòng
        const joinRoomForm = document.getElementById('joinRoomForm');
        if (joinRoomForm) {
            joinRoomForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.joinRoom();
            });
        }

        // Form thông tin sinh viên
        const studentInfoForm = document.getElementById('studentInfoForm');
        if (studentInfoForm) {
            studentInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveStudentInfo();
            });
        }

        // Camera elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
    }

    initializeCamera() {
        // Check camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showNotification('Trình duyệt không hỗ trợ camera', 'error');
            return;
        }
    }

    // Tự động nhập dữ liệu phòng từ liên kết có chứa ?data= (MÃ DỮ LIỆU) hoặc ?sync= (mã 6 ký tự)
    initLinkImport() {
        try {
            const href = window.location.href;
            const baseNoHash = href.split('#')[0];
            const url = new URL(baseNoHash);
            const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));

            const dataParam = url.searchParams.get('data') || hashParams.get('data');
            const syncParam = url.searchParams.get('sync') || hashParams.get('sync');
            const roomParam = (url.searchParams.get('room') || hashParams.get('room') || '').toUpperCase();

            if (dataParam && typeof crossDeviceSync !== 'undefined') {
                const data = crossDeviceSync.decodeCodeToData(dataParam);
                crossDeviceSync.mergeData(data);
                this.showNotification('Đã nhập dữ liệu phòng từ liên kết', 'success');
                if (roomParam) {
                    const roomInput = document.getElementById('roomId');
                    if (roomInput) roomInput.value = roomParam;
                    // Thử tham gia ngay nếu có room
                    setTimeout(() => this.joinRoom(), 200);
                }
            } else if (syncParam && typeof crossDeviceSync !== 'undefined') {
                crossDeviceSync.loadDataFromCloud(syncParam).then(success => {
                    if (success) {
                        this.showNotification('Đã tải dữ liệu từ cloud', 'success');
                        if (roomParam) {
                            const roomInput = document.getElementById('roomId');
                            if (roomInput) roomInput.value = roomParam;
                            setTimeout(() => this.joinRoom(), 200);
                        }
                    }
                });
            }
        } catch (e) {
            console.warn('initLinkImport error:', e);
        }
    }

    async joinRoom() {
        const roomIdEl = document.getElementById('roomId');
        if (!roomIdEl) return;
        
        const roomId = roomIdEl.value.toUpperCase().trim();
        
        if (!roomId || roomId.length !== 6) {
            this.showNotification('Vui lòng nhập ID phòng hợp lệ (6 ký tự)', 'error');
            return;
        }

        try {
            // Check room using simpleStorage
            let room = null;
            
            if (typeof simpleStorage !== 'undefined') {
                room = simpleStorage.getRoom(roomId);
            } else {
                // Fallback to localStorage
                const systemData = this.getSystemData();
                room = systemData.rooms[roomId];
            }

            if (!room) {
                this.showNotification('Không tìm thấy phòng với ID này', 'error');
                if (typeof voiceFeedback !== 'undefined') {
                    voiceFeedback.speakAttendanceError('general');
                }
                return;
            }

            if (!room.isActive) {
                this.showNotification('Phòng này đã được đóng', 'error');
                if (typeof voiceFeedback !== 'undefined') {
                    voiceFeedback.speakAttendanceError('room_closed');
                }
                return;
            }

            // Save room data
            this.roomData = room;
            
            // Show room info
            const joinedRoomInfo = document.getElementById('joinedRoomInfo');
            if (joinedRoomInfo) {
                joinedRoomInfo.textContent = `Phòng: ${room.name} - ${room.subject}`;
            }

            // Go to step 2
            this.goToStep(2);
            
            this.showNotification('Tham gia phòng thành công!', 'success');
            
            // Voice feedback with room info
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakRoomInfo(room.name, room.teacher);
            }

        } catch (error) {
            console.error('Room joining error:', error);
            this.showNotification('Lỗi khi tham gia phòng. Vui lòng thử lại.', 'error');
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakAttendanceError('general');
            }
        }
    }

    saveStudentInfo() {
        const nameEl = document.getElementById('studentName');
        const idEl = document.getElementById('studentId');
        const classEl = document.getElementById('studentClass');

        if (!nameEl || !idEl || !classEl) return;

        const name = nameEl.value.trim();
        const studentId = idEl.value.trim();
        const studentClass = classEl.value.trim();

        if (!name || !studentId || !studentClass) {
            this.showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        // Check if student already attended
        if (this.roomData.students && this.roomData.students.find(s => s.studentId === studentId)) {
            this.showNotification('MSSV này đã điểm danh rồi!', 'error');
            return;
        }

        // Save student info
        this.studentInfo = {
            name: name,
            studentId: studentId,
            class: studentClass
        };

        // Go to step 3
        this.goToStep(3);
        
        this.showNotification('Thông tin đã được lưu!', 'success');
    }

    // Face Recognition Options
    goToCreateFace() {
        if (!this.validateStudentInfo()) return;
        
        this.useFaceRecognition = true;
        this.faceRecognitionMode = 'create';
        
        // Update UI for face creation mode
        this.updateCameraUIForFaceCreation();
        this.goToStep(3);
        
        if (typeof voiceFeedback !== 'undefined') {
            voiceFeedback.speakInstruction('create_face_first');
        }
    }

    goToUseFace() {
        if (!this.validateStudentInfo()) return;
        
        const studentId = document.getElementById('studentId').value.trim();
        
        // Check if student has face descriptor
        if (typeof faceRecognition !== 'undefined' && !faceRecognition.hasFaceDescriptor(studentId)) {
            this.showNotification('Chưa có dữ liệu khuôn mặt. Vui lòng tạo khuôn mặt trước.', 'error');
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakInstruction('create_face_first');
            }
            return;
        }
        
        this.useFaceRecognition = true;
        this.faceRecognitionMode = 'recognize';
        
        // Update UI for face recognition mode
        this.updateCameraUIForFaceRecognition();
        this.goToStep(3);
        
        if (typeof voiceFeedback !== 'undefined') {
            voiceFeedback.speakInstruction('good_position');
        }
    }

    validateStudentInfo() {
        const name = document.getElementById('studentName').value.trim();
        const studentId = document.getElementById('studentId').value.trim();
        const studentClass = document.getElementById('studentClass').value.trim();

        if (!name || !studentId || !studentClass) {
            this.showNotification('Vui lòng điền đầy đủ thông tin trước', 'error');
            return false;
        }

        // Save student info
        this.studentInfo = { name, studentId, class: studentClass };
        return true;
    }

    updateCameraUIForFaceCreation() {
        const stepHeader = document.querySelector('#step3 .step-header h2');
        const stepDesc = document.querySelector('#step3 .step-header p');
        
        if (stepHeader) stepHeader.innerHTML = '<i class="fas fa-user-plus"></i> Tạo Khuôn Mặt Gốc';
        if (stepDesc) stepDesc.textContent = 'Chụp ảnh khuôn mặt để lưu làm mẫu so sánh';
        
        // Add face creation instructions
        this.addFaceInstructions('create');
    }

    updateCameraUIForFaceRecognition() {
        const stepHeader = document.querySelector('#step3 .step-header h2');
        const stepDesc = document.querySelector('#step3 .step-header p');
        
        if (stepHeader) stepHeader.innerHTML = '<i class="fas fa-face-smile"></i> Nhận Diện Khuôn Mặt';
        if (stepDesc) stepDesc.textContent = 'Đặt khuôn mặt vào khung để nhận diện và điểm danh';
        
        // Add face recognition instructions
        this.addFaceInstructions('recognize');
    }

    addFaceInstructions(mode) {
        const cameraContainer = document.querySelector('.camera-container');
        if (!cameraContainer) return;
        
        // Remove existing instructions
        const existingInstructions = cameraContainer.querySelector('.face-instructions');
        if (existingInstructions) {
            existingInstructions.remove();
        }
        
        const instructions = document.createElement('div');
        instructions.className = 'face-instructions';
        
        if (mode === 'create') {
            instructions.innerHTML = `
                <div class="instruction-item">
                    <i class="fas fa-lightbulb"></i>
                    <span>Đảm bảo ánh sáng đủ và khuôn mặt rõ nét</span>
                </div>
                <div class="instruction-item">
                    <i class="fas fa-eye"></i>
                    <span>Nhìn thẳng vào camera, không đeo kính đen</span>
                </div>
                <div class="instruction-item">
                    <i class="fas fa-smile"></i>
                    <span>Giữ biểu cảm tự nhiên</span>
                </div>
            `;
        } else {
            instructions.innerHTML = `
                <div class="instruction-item">
                    <i class="fas fa-search"></i>
                    <span>Hệ thống đang tìm kiếm khuôn mặt của bạn</span>
                </div>
                <div class="instruction-item">
                    <i class="fas fa-crosshairs"></i>
                    <span>Đặt khuôn mặt vào vòng tròn để nhận diện</span>
                </div>
            `;
        }
        
        const cameraControls = cameraContainer.querySelector('.camera-controls');
        if (cameraControls) {
            cameraContainer.insertBefore(instructions, cameraControls);
        }
    }

    goToStep(step) {
        // Hide all steps
        for (let i = 1; i <= 4; i++) {
            const stepEl = document.getElementById(`step${i}`);
            if (stepEl) stepEl.style.display = 'none';
        }
        
        // Show current step
        const currentStepEl = document.getElementById(`step${step}`);
        if (currentStepEl) currentStepEl.style.display = 'block';
        
        this.currentStep = step;

        // Scroll to top
        window.scrollTo(0, 0);
    }

    async startCamera() {
        try {
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            // Display video stream
            if (this.video) {
                this.video.srcObject = this.stream;
                this.video.style.display = 'block';
            }

            // Update UI
            const startCameraBtn = document.getElementById('startCamera');
            const capturePhotoBtn = document.getElementById('capturePhoto');
            
            if (startCameraBtn) startCameraBtn.style.display = 'none';
            if (capturePhotoBtn) capturePhotoBtn.style.display = 'inline-flex';

            // Start face detection if using face recognition
            if (this.useFaceRecognition && typeof faceRecognition !== 'undefined') {
                this.startFaceDetection();
            }

            this.showNotification('Camera đã được bật!', 'success');
            
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakInstruction('good_position');
            }

        } catch (error) {
            console.error('Camera access error:', error);
            
            let errorMessage = 'Không thể truy cập camera. ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Vui lòng cho phép truy cập camera.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'Không tìm thấy camera.';
            } else {
                errorMessage += 'Vui lòng kiểm tra camera và thử lại.';
            }
            
            this.showNotification(errorMessage, 'error');
            
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakAttendanceError('general');
            }
        }
    }

    startFaceDetection() {
        if (!faceRecognition.isModelLoaded) {
            this.showNotification('Mô hình nhận diện khuôn mặt chưa sẵn sàng', 'error');
            return;
        }

        // Clear existing interval
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
        }

        // Start face detection every 500ms
        this.faceDetectionInterval = setInterval(async () => {
            if (this.video && this.video.readyState === 4) {
                await this.detectFaceInVideo();
            }
        }, 500);
    }

    async detectFaceInVideo() {
        try {
            const detection = await faceRecognition.detectFace(this.video);
            
            if (detection) {
                this.drawFaceDetection(detection);
                
                // Auto-capture for recognition mode
                if (this.faceRecognitionMode === 'recognize') {
                    this.autoCapture();
                }
            } else {
                this.clearFaceDetection();
            }
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }

    drawFaceDetection(detection) {
        // Create overlay canvas if not exists
        let overlay = document.getElementById('faceOverlay');
        if (!overlay) {
            overlay = document.createElement('canvas');
            overlay.id = 'faceOverlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '10';
            
            const videoContainer = this.video.parentElement;
            videoContainer.style.position = 'relative';
            videoContainer.appendChild(overlay);
        }

        // Set canvas size to match video
        overlay.width = this.video.videoWidth;
        overlay.height = this.video.videoHeight;
        overlay.style.width = this.video.offsetWidth + 'px';
        overlay.style.height = this.video.offsetHeight + 'px';

        // Draw detection
        faceRecognition.drawDetection(overlay, detection);
    }

    clearFaceDetection() {
        const overlay = document.getElementById('faceOverlay');
        if (overlay) {
            const ctx = overlay.getContext('2d');
            ctx.clearRect(0, 0, overlay.width, overlay.height);
        }
    }

    autoCapture() {
        // Auto-capture after detecting face for 2 seconds
        if (!this.autoCaptureTimeout) {
            this.autoCaptureTimeout = setTimeout(() => {
                this.capturePhoto();
                this.autoCaptureTimeout = null;
            }, 2000);
        }
    }

    async capturePhoto() {
        if (!this.stream) {
            this.showNotification('Camera chưa được khởi động', 'error');
            return;
        }

        if (!this.canvas || !this.video) {
            this.showNotification('Lỗi camera elements', 'error');
            return;
        }

        // Setup canvas
        const context = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw current frame
        context.drawImage(this.video, 0, 0);

        // Get image data
        this.capturedPhoto = this.canvas.toDataURL('image/jpeg', 0.8);

        // Process based on mode
        if (this.useFaceRecognition && typeof faceRecognition !== 'undefined') {
            await this.processFaceRecognition();
        } else {
            this.showPhotoPreview();
        }

        // Stop camera and face detection
        this.stopCamera();
        this.stopFaceDetection();

        this.showNotification('Ảnh đã được chụp!', 'success');
    }

    async processFaceRecognition() {
        try {
            // Create image element for face recognition
            const img = new Image();
            img.onload = async () => {
                if (this.faceRecognitionMode === 'create') {
                    await this.createFaceDescriptor(img);
                } else {
                    await this.recognizeFace(img);
                }
            };
            img.src = this.capturedPhoto;

        } catch (error) {
            console.error('Face recognition processing error:', error);
            this.showNotification('Lỗi khi xử lý nhận diện khuôn mặt', 'error');
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakAttendanceError('general');
            }
        }
    }

    async createFaceDescriptor(imageElement) {
        try {
            const result = await faceRecognition.saveFaceDescriptor(this.studentInfo.studentId, imageElement);
            
            if (result.success) {
                this.showNotification('Khuôn mặt đã được lưu thành công!', 'success');
                if (typeof voiceFeedback !== 'undefined') {
                    voiceFeedback.speak('Khuôn mặt của bạn đã được lưu thành công. Bây giờ bạn có thể sử dụng để điểm danh.');
                }
                
                // Show preview and continue to attendance
                this.showPhotoPreview();
            } else {
                this.showNotification(result.message, 'error');
                if (typeof voiceFeedback !== 'undefined') {
                    voiceFeedback.speakAttendanceError('face_not_found');
                }
                this.retakePhoto();
            }
        } catch (error) {
            console.error('Face descriptor creation error:', error);
            this.showNotification('Lỗi khi tạo dữ liệu khuôn mặt', 'error');
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakAttendanceError('general');
            }
        }
    }

    async recognizeFace(imageElement) {
        try {
            const result = await faceRecognition.compareFaces(this.studentInfo.studentId, imageElement);
            
            if (result.success) {
                this.showNotification(`Nhận diện thành công! Độ tin cậy: ${result.confidence}%`, 'success');
                if (typeof voiceFeedback !== 'undefined') {
                    voiceFeedback.speakAttendanceSuccess(this.studentInfo.name);
                }
                
                // Auto-submit attendance
                this.showPhotoPreview();
                setTimeout(() => {
                    this.submitAttendance();
                }, 2000);
            } else {
                this.showNotification(result.message, 'error');
                if (typeof voiceFeedback !== 'undefined') {
                    voiceFeedback.speakAttendanceError('face_not_match');
                }
                
                // Allow manual retry
                this.showPhotoPreview();
            }
        } catch (error) {
            console.error('Face recognition error:', error);
            this.showNotification('Lỗi khi nhận diện khuôn mặt', 'error');
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakAttendanceError('general');
            }
        }
    }

    showPhotoPreview() {
        const previewDiv = document.getElementById('photoPreview');
        const capturedImage = document.getElementById('capturedImage');
        
        if (!previewDiv || !capturedImage) return;
        
        // Show image
        capturedImage.src = this.capturedPhoto;
        previewDiv.style.display = 'block';

        // Show student info
        const summaryName = document.getElementById('summaryName');
        const summaryId = document.getElementById('summaryId');
        const summaryClass = document.getElementById('summaryClass');
        
        if (summaryName) summaryName.textContent = this.studentInfo.name;
        if (summaryId) summaryId.textContent = this.studentInfo.studentId;
        if (summaryClass) summaryClass.textContent = this.studentInfo.class;

        // Update UI buttons
        const capturePhotoBtn = document.getElementById('capturePhoto');
        const retakePhotoBtn = document.getElementById('retakePhoto');
        
        if (capturePhotoBtn) capturePhotoBtn.style.display = 'none';
        if (retakePhotoBtn) retakePhotoBtn.style.display = 'inline-flex';

        // Add face recognition info if used
        if (this.useFaceRecognition) {
            this.addFaceRecognitionInfo();
        }

        // Scroll to preview
        previewDiv.scrollIntoView({ behavior: 'smooth' });
    }

    addFaceRecognitionInfo() {
        const summaryDiv = document.querySelector('.student-info-summary');
        if (!summaryDiv) return;
        
        // Remove existing face info
        const existingFaceInfo = summaryDiv.querySelector('.face-recognition-info');
        if (existingFaceInfo) {
            existingFaceInfo.remove();
        }

        const faceInfo = document.createElement('div');
        faceInfo.className = 'face-recognition-info';
        faceInfo.innerHTML = `
            <p><strong>Nhận diện khuôn mặt:</strong> 
                <span class="face-status ${this.faceRecognitionMode === 'create' ? 'created' : 'recognized'}">
                    <i class="fas ${this.faceRecognitionMode === 'create' ? 'fa-user-plus' : 'fa-face-smile'}"></i>
                    ${this.faceRecognitionMode === 'create' ? 'Đã tạo' : 'Đã nhận diện'}
                </span>
            </p>
        `;
        
        summaryDiv.appendChild(faceInfo);
    }

    retakePhoto() {
        // Hide preview
        const photoPreview = document.getElementById('photoPreview');
        if (photoPreview) photoPreview.style.display = 'none';
        
        // Reset captured photo
        this.capturedPhoto = null;
        
        // Update UI
        const retakePhotoBtn = document.getElementById('retakePhoto');
        const startCameraBtn = document.getElementById('startCamera');
        
        if (retakePhotoBtn) retakePhotoBtn.style.display = 'none';
        if (startCameraBtn) startCameraBtn.style.display = 'inline-flex';
        
        // Hide video
        if (this.video) this.video.style.display = 'none';
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) this.video.style.display = 'none';
    }

    stopFaceDetection() {
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
            this.faceDetectionInterval = null;
        }

        if (this.autoCaptureTimeout) {
            clearTimeout(this.autoCaptureTimeout);
            this.autoCaptureTimeout = null;
        }

        // Clear face overlay
        this.clearFaceDetection();
    }

    async submitAttendance() {
        if (!this.capturedPhoto || !this.studentInfo || !this.roomData) {
            this.showNotification('Thiếu thông tin để điểm danh', 'error');
            return;
        }

        try {
            // Create attendance data
            const attendanceData = {
                ...this.studentInfo,
                photo: this.capturedPhoto,
                roomId: this.roomData.id,
                timestamp: Date.now(),
                usedFaceRecognition: this.useFaceRecognition,
                faceRecognitionMode: this.faceRecognitionMode
            };

            // Save attendance data
            const result = await this.saveAttendanceData(attendanceData);
            
            if (result.success) {
                // Show success with ticket
                this.showSuccessWithTicket(attendanceData);
                
                // Voice feedback
                if (typeof voiceFeedback !== 'undefined') {
                    voiceFeedback.speakAttendanceSuccess(this.studentInfo.name);
                }
                
                // Add activity
                this.addActivity('attendance_submitted', 
                    `${this.studentInfo.name} đã điểm danh thành công${this.useFaceRecognition ? ' (có nhận diện khuôn mặt)' : ''}`);
                    
            } else {
                this.showNotification(result.message, 'error');
                if (typeof voiceFeedback !== 'undefined') {
                    voiceFeedback.speakAttendanceError('general');
                }
            }

        } catch (error) {
            console.error('Attendance submission error:', error);
            this.showNotification('Có lỗi xảy ra khi điểm danh', 'error');
            if (typeof voiceFeedback !== 'undefined') {
                voiceFeedback.speakAttendanceError('general');
            }
        }
    }

    async saveAttendanceData(attendanceData) {
        try {
            // Use cross-device storage for better sync
            if (typeof crossDeviceStorage !== 'undefined') {
                const result = crossDeviceStorage.addStudentToRoom(this.roomData.id, attendanceData);
                
                if (result.success) {
                    // Update roomData local to display
                    this.roomData = crossDeviceStorage.getRoom(this.roomData.id);
                    this.showNotification('Dữ liệu đã được lưu và đồng bộ thành công!', 'success');
                }
                
                return result;
            } else if (typeof simpleStorage !== 'undefined') {
                const result = simpleStorage.addStudentToRoom(this.roomData.id, attendanceData);
                
                if (result.success) {
                    // Update roomData local to display
                    this.roomData = simpleStorage.getRoom(this.roomData.id);
                    this.showNotification('Dữ liệu đã được lưu thành công!', 'success');
                }
                
                return result;
            } else {
                // Fallback to localStorage
                const systemData = this.getSystemData();
                const room = systemData.rooms[this.roomData.id];
                
                if (!room) {
                    return { success: false, message: 'Phòng không tồn tại' };
                }

                if (!room.isActive) {
                    return { success: false, message: 'Phòng đã được đóng' };
                }

                // Initialize students array if not exists
                if (!room.students) {
                    room.students = [];
                }

                // Check for duplicate MSSV
                const existingStudent = room.students.find(s => s.studentId === attendanceData.studentId);
                if (existingStudent) {
                    return { success: false, message: 'Sinh viên đã điểm danh rồi!' };
                }

                // Add student
                attendanceData.timestamp = Date.now();
                room.students.push(attendanceData);

                // Save data
                systemData.rooms[this.roomData.id] = room;
                localStorage.setItem('attendanceSystem', JSON.stringify(systemData));
                
                return { success: true, message: 'Điểm danh thành công!' };
            }

        } catch (error) {
            console.error('Error saving attendance data:', error);
            return { success: false, message: 'Lỗi hệ thống' };
        }
    }

    showSuccessWithTicket(attendanceData) {
        // Update success info
        const attendanceTime = document.getElementById('attendanceTime');
        const attendanceRoom = document.getElementById('attendanceRoom');
        
        if (attendanceTime) attendanceTime.textContent = new Date().toLocaleString('vi-VN');
        if (attendanceRoom) attendanceRoom.textContent = this.roomData.name;

        // Fill attendance ticket
        this.fillAttendanceTicket(attendanceData);

        // Go to success step
        this.goToStep(4);
        
        this.showNotification('Điểm danh thành công!', 'success');
    }

    fillAttendanceTicket(attendanceData) {
        // Get current room data to determine STT
        let currentRoom = null;
        
        if (typeof simpleStorage !== 'undefined') {
            currentRoom = simpleStorage.getRoom(this.roomData.id);
        } else {
            const systemData = this.getSystemData();
            currentRoom = systemData.rooms[this.roomData.id];
        }
        
        const attendedCount = currentRoom?.students?.length || 1;
        
        // Fill ticket information
        const ticketPhoto = document.getElementById('ticketPhoto');
        const ticketSTT = document.getElementById('ticketSTT');
        const ticketMSSV = document.getElementById('ticketMSSV');
        const ticketName = document.getElementById('ticketName');
        const ticketClass = document.getElementById('ticketClass');
        const ticketRoom = document.getElementById('ticketRoom');
        const ticketTime = document.getElementById('ticketTime');
        
        if (ticketPhoto) ticketPhoto.src = attendanceData.photo;
        if (ticketSTT) ticketSTT.textContent = attendedCount;
        if (ticketMSSV) ticketMSSV.textContent = attendanceData.studentId;
        if (ticketName) ticketName.textContent = attendanceData.name;
        if (ticketClass) ticketClass.textContent = attendanceData.class;
        if (ticketRoom) ticketRoom.textContent = this.roomData.name;
        if (ticketTime) ticketTime.textContent = new Date(attendanceData.timestamp).toLocaleString('vi-VN');
    }

    newAttendance() {
        // Reset all data
        this.roomData = null;
        this.studentInfo = null;
        this.capturedPhoto = null;
        this.useFaceRecognition = false;
        this.faceRecognitionMode = 'normal';
        
        // Stop camera and face detection
        this.stopCamera();
        this.stopFaceDetection();

        // Reset forms
        const joinRoomForm = document.getElementById('joinRoomForm');
        const studentInfoForm = document.getElementById('studentInfoForm');
        const photoPreview = document.getElementById('photoPreview');
        
        if (joinRoomForm) joinRoomForm.reset();
        if (studentInfoForm) studentInfoForm.reset();
        if (photoPreview) photoPreview.style.display = 'none';

        // Reset UI
        this.resetCameraUI();

        // Go to step 1
        this.goToStep(1);
        
        this.showNotification('Sẵn sàng cho lần điểm danh mới!', 'info');
        
        if (typeof voiceFeedback !== 'undefined') {
            voiceFeedback.speakWelcome();
        }
    }

    resetCameraUI() {
        const stepHeader = document.querySelector('#step3 .step-header h2');
        const stepDesc = document.querySelector('#step3 .step-header p');
        
        if (stepHeader) stepHeader.innerHTML = '<i class="fas fa-camera"></i> Chụp Ảnh Điểm Danh';
        if (stepDesc) stepDesc.textContent = 'Đặt khuôn mặt vào khung hình và chụp ảnh';

        // Remove face instructions
        const instructions = document.querySelector('.face-instructions');
        if (instructions) {
            instructions.remove();
        }

        // Remove face overlay
        const overlay = document.getElementById('faceOverlay');
        if (overlay) {
            overlay.remove();
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
        this.stopCamera();
        this.stopFaceDetection();
        if (typeof voiceFeedback !== 'undefined') {
            voiceFeedback.stop();
        }
    }
}

// Initialize
const studentAttendance = new StudentAttendance();

// Global functions
function goHome() {
    // Stop camera before leaving page
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

// Global functions for face recognition
function goToCreateFace() {
    studentAttendance.goToCreateFace();
}

function goToUseFace() {
    studentAttendance.goToUseFace();
}

function loadFromCloud() {
    if (typeof crossDeviceSync !== 'undefined') {
        crossDeviceSync.loadDataFromCloud().then(success => {
            if (success) {
                studentAttendance.showNotification('Dữ liệu đã được tải t��� cloud thành công!', 'success');
                // Refresh to show new data
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        });
    } else {
        studentAttendance.showNotification('Tính năng cloud chưa khả dụng', 'info');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check camera support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        studentAttendance.showNotification('Trình duyệt không hỗ trợ camera. Vui lòng sử dụng Chrome, Firefox hoặc Safari.', 'error');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    studentAttendance.destroy();
});