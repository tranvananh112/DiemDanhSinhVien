// Face Recognition Service using face-api.js
class FaceRecognitionService {
    constructor() {
        this.isModelLoaded = false;
        this.faceDescriptors = new Map(); // Lưu trữ face descriptors
        this.loadModels();
    }

    async loadModels() {
        try {
            // Load face-api.js models từ CDN
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
            
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            
            this.isModelLoaded = true;
            console.log('Face recognition models loaded successfully');
            
            // Thông báo model đã sẵn sàng
            this.dispatchEvent('modelsLoaded');
            
        } catch (error) {
            console.error('Error loading face recognition models:', error);
            this.dispatchEvent('modelsError', error);
        }
    }

    // Phát hiện khuôn mặt trong ảnh
    async detectFace(imageElement) {
        if (!this.isModelLoaded) {
            throw new Error('Face recognition models not loaded yet');
        }

        try {
            const detection = await faceapi
                .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            return detection;
        } catch (error) {
            console.error('Error detecting face:', error);
            return null;
        }
    }

    // Lưu face descriptor cho sinh viên
    async saveFaceDescriptor(studentId, imageElement) {
        const detection = await this.detectFace(imageElement);
        
        if (!detection) {
            return { success: false, message: 'Không phát hiện được khuôn mặt trong ảnh' };
        }

        // Lưu descriptor
        this.faceDescriptors.set(studentId, detection.descriptor);
        
        // Lưu vào localStorage
        this.saveFaceDescriptorsToStorage();
        
        return { success: true, message: 'Khuôn mặt đã được lưu thành công' };
    }

    // So sánh khuôn mặt
    async compareFaces(studentId, imageElement, threshold = 0.6) {
        if (!this.faceDescriptors.has(studentId)) {
            return { success: false, message: 'Chưa có dữ liệu khuôn mặt gốc. Vui lòng tạo khuôn mặt trước.' };
        }

        const detection = await this.detectFace(imageElement);
        
        if (!detection) {
            return { success: false, message: 'Không phát hiện được khuôn mặt trong ảnh' };
        }

        // So sánh với face descriptor đã lưu
        const savedDescriptor = this.faceDescriptors.get(studentId);
        const distance = faceapi.euclideanDistance(savedDescriptor, detection.descriptor);
        
        const isMatch = distance < threshold;
        const confidence = Math.max(0, (1 - distance) * 100);

        return {
            success: isMatch,
            confidence: confidence.toFixed(1),
            distance: distance.toFixed(3),
            message: isMatch 
                ? `Nhận diện thành công (${confidence.toFixed(1)}% độ tin cậy)`
                : `Khuôn mặt không khớp (${confidence.toFixed(1)}% độ tin cậy)`
        };
    }

    // Lưu face descriptors vào localStorage
    saveFaceDescriptorsToStorage() {
        try {
            const descriptorsObj = {};
            this.faceDescriptors.forEach((descriptor, studentId) => {
                descriptorsObj[studentId] = Array.from(descriptor);
            });
            
            localStorage.setItem('faceDescriptors', JSON.stringify(descriptorsObj));
        } catch (error) {
            console.error('Error saving face descriptors:', error);
        }
    }

    // Load face descriptors từ localStorage
    loadFaceDescriptorsFromStorage() {
        try {
            const stored = localStorage.getItem('faceDescriptors');
            if (stored) {
                const descriptorsObj = JSON.parse(stored);
                Object.keys(descriptorsObj).forEach(studentId => {
                    this.faceDescriptors.set(studentId, new Float32Array(descriptorsObj[studentId]));
                });
            }
        } catch (error) {
            console.error('Error loading face descriptors:', error);
        }
    }

    // Xóa face descriptor của sinh viên
    removeFaceDescriptor(studentId) {
        this.faceDescriptors.delete(studentId);
        this.saveFaceDescriptorsToStorage();
    }

    // Kiểm tra xem sinh viên đã có face descriptor chưa
    hasFaceDescriptor(studentId) {
        return this.faceDescriptors.has(studentId);
    }

    // Vẽ detection box lên canvas
    drawDetection(canvas, detection) {
        if (!detection) return;

        const ctx = canvas.getContext('2d');
        const { x, y, width, height } = detection.detection.box;
        
        // Vẽ khung
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Vẽ landmarks
        if (detection.landmarks) {
            ctx.fillStyle = '#ff0000';
            detection.landmarks.positions.forEach(point => {
                ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
            });
        }
    }

    // Event dispatcher
    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(`faceRecognition:${eventName}`, { detail: data });
        document.dispatchEvent(event);
    }

    // Utility: Tạo ảnh từ canvas
    canvasToImage(canvas) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = canvas.toDataURL();
        });
    }

    // Utility: Resize ảnh để tối ưu performance
    resizeImage(canvas, maxWidth = 640, maxHeight = 480) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        if (width <= maxWidth && height <= maxHeight) {
            return canvas;
        }
        
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        const newWidth = width * ratio;
        const newHeight = height * ratio;
        
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = newWidth;
        resizedCanvas.height = newHeight;
        
        const resizedCtx = resizedCanvas.getContext('2d');
        resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
        
        return resizedCanvas;
    }

    // Lấy thống kê
    getStats() {
        return {
            isModelLoaded: this.isModelLoaded,
            totalFaceDescriptors: this.faceDescriptors.size,
            students: Array.from(this.faceDescriptors.keys())
        };
    }
}

// Khởi tạo service
const faceRecognition = new FaceRecognitionService();

// Load face descriptors khi khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    faceRecognition.loadFaceDescriptorsFromStorage();
});

// Export global
window.faceRecognition = faceRecognition;