// Voice Feedback Service - Vietnamese AI Voice
class VoiceFeedbackService {
    constructor() {
        this.isSupported = 'speechSynthesis' in window;
        this.voices = [];
        this.selectedVoice = null;
        this.settings = {
            rate: 0.9,
            pitch: 1.0,
            volume: 0.8,
            lang: 'vi-VN'
        };
        
        this.init();
    }

    init() {
        if (!this.isSupported) {
            console.warn('Speech Synthesis không được hỗ trợ trên trình duyệt này');
            return;
        }

        // Load voices
        this.loadVoices();
        
        // Listen for voices changed event
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    loadVoices() {
        this.voices = speechSynthesis.getVoices();
        
        // Tìm giọng nói tiếng Việt
        this.selectedVoice = this.voices.find(voice => 
            voice.lang.includes('vi') || voice.lang.includes('VN')
        );

        // Nếu không có giọng tiếng Việt, chọn giọng nữ đầu tiên
        if (!this.selectedVoice) {
            this.selectedVoice = this.voices.find(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman')
            );
        }

        // Fallback: chọn giọng đầu tiên
        if (!this.selectedVoice && this.voices.length > 0) {
            this.selectedVoice = this.voices[0];
        }

        console.log('Available voices:', this.voices.length);
        console.log('Selected voice:', this.selectedVoice?.name);
    }

    // Phát giọng nói
    speak(text, options = {}) {
        if (!this.isSupported || !text) {
            console.warn('Cannot speak: not supported or empty text');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            // Dừng giọng nói hiện tại
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Cấu hình giọng nói
            utterance.voice = this.selectedVoice;
            utterance.rate = options.rate || this.settings.rate;
            utterance.pitch = options.pitch || this.settings.pitch;
            utterance.volume = options.volume || this.settings.volume;
            utterance.lang = options.lang || this.settings.lang;

            // Event listeners
            utterance.onend = () => {
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                reject(event);
            };

            utterance.onstart = () => {
                console.log('Speech started:', text);
            };

            // Phát giọng nói
            speechSynthesis.speak(utterance);
        });
    }

    // Các thông báo điểm danh
    async speakAttendanceSuccess(studentName = '') {
        const messages = [
            'Bạn đã điểm danh thành công!',
            `Chào ${studentName}, bạn đã điểm danh thành công!`,
            'Điểm danh hoàn tất. Cảm ơn bạn!',
            'Thành công! Thông tin của bạn đã được ghi nhận.'
        ];

        const message = studentName ? messages[1] : messages[0];
        return this.speak(message);
    }

    async speakAttendanceError(errorType = 'general') {
        const messages = {
            'face_not_found': 'Không phát hiện được khuôn mặt. Vui lòng thử lại.',
            'face_not_match': 'Khuôn mặt không khớp. Vui lòng kiểm tra lại.',
            'already_attended': 'Bạn đã điểm danh rồi.',
            'room_closed': 'Phòng điểm danh đã được đóng.',
            'general': 'Có lỗi xảy ra. Vui lòng thử lại.'
        };

        const message = messages[errorType] || messages['general'];
        return this.speak(message);
    }

    async speakWelcome() {
        const messages = [
            'Chào mừng bạn đến với hệ thống điểm danh!',
            'Xin chào! Hãy làm theo hướng dẫn để điểm danh.',
            'Chào bạn! Vui lòng đặt khuôn mặt vào khung hình.'
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        return this.speak(message);
    }

    async speakInstruction(instruction) {
        const instructions = {
            'position_face': 'Vui lòng đặt khuôn mặt vào giữa khung hình.',
            'hold_still': 'Giữ yên trong 3 giây.',
            'move_closer': 'Hãy di chuyển gần camera hơn.',
            'move_away': 'Hãy di chuyển xa camera một chút.',
            'good_position': 'Vị trí tốt! Hãy giữ yên.',
            'ready_capture': 'Sẵn sàng chụp ảnh.',
            'processing': 'Đang xử lý. Vui lòng đợi.',
            'create_face_first': 'Vui lòng t���o khuôn mặt trước khi điểm danh.'
        };

        const message = instructions[instruction] || instruction;
        return this.speak(message);
    }

    async speakRoomInfo(roomName, teacherName) {
        const message = `Bạn đã tham gia phòng ${roomName} của giáo viên ${teacherName}.`;
        return this.speak(message);
    }

    async speakCount(number) {
        const vietnameseNumbers = {
            1: 'một', 2: 'hai', 3: 'ba', 4: 'bốn', 5: 'năm',
            6: 'sáu', 7: 'bảy', 8: 'tám', 9: 'chín', 10: 'mười'
        };

        const message = vietnameseNumbers[number] || number.toString();
        return this.speak(message);
    }

    // Đếm ngược
    async countdown(seconds = 3) {
        for (let i = seconds; i > 0; i--) {
            await this.speakCount(i);
            await this.delay(1000);
        }
    }

    // Dừng giọng nói
    stop() {
        if (this.isSupported) {
            speechSynthesis.cancel();
        }
    }

    // Tạm dừng
    pause() {
        if (this.isSupported) {
            speechSynthesis.pause();
        }
    }

    // Tiếp tục
    resume() {
        if (this.isSupported) {
            speechSynthesis.resume();
        }
    }

    // Kiểm tra trạng thái
    isSpeaking() {
        return this.isSupported && speechSynthesis.speaking;
    }

    isPaused() {
        return this.isSupported && speechSynthesis.paused;
    }

    // Cài đặt giọng nói
    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.selectedVoice = voice;
            return true;
        }
        return false;
    }

    setRate(rate) {
        this.settings.rate = Math.max(0.1, Math.min(2.0, rate));
    }

    setPitch(pitch) {
        this.settings.pitch = Math.max(0.0, Math.min(2.0, pitch));
    }

    setVolume(volume) {
        this.settings.volume = Math.max(0.0, Math.min(1.0, volume));
    }

    // Lấy danh sách giọng nói có sẵn
    getAvailableVoices() {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            gender: this.detectGender(voice.name),
            isVietnamese: voice.lang.includes('vi') || voice.lang.includes('VN')
        }));
    }

    // Phát hiện giới tính từ tên giọng
    detectGender(voiceName) {
        const name = voiceName.toLowerCase();
        if (name.includes('female') || name.includes('woman') || name.includes('girl')) {
            return 'female';
        } else if (name.includes('male') || name.includes('man') || name.includes('boy')) {
            return 'male';
        }
        return 'unknown';
    }

    // Utility: Delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test giọng nói
    async testVoice() {
        return this.speak('Xin chào! Đây là giọng nói tiếng Việt của hệ thống điểm danh.');
    }

    // Lưu cài đặt
    saveSettings() {
        localStorage.setItem('voiceSettings', JSON.stringify({
            ...this.settings,
            selectedVoiceName: this.selectedVoice?.name
        }));
    }

    // Load cài đặt
    loadSettings() {
        try {
            const saved = localStorage.getItem('voiceSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
                
                if (settings.selectedVoiceName) {
                    this.setVoice(settings.selectedVoiceName);
                }
            }
        } catch (error) {
            console.error('Error loading voice settings:', error);
        }
    }

    // Lấy thông tin hệ thống
    getSystemInfo() {
        return {
            isSupported: this.isSupported,
            voicesCount: this.voices.length,
            selectedVoice: this.selectedVoice?.name,
            settings: this.settings,
            isSpeaking: this.isSpeaking(),
            isPaused: this.isPaused()
        };
    }
}

// Khởi tạo service
const voiceFeedback = new VoiceFeedbackService();

// Load settings khi khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    voiceFeedback.loadSettings();
});

// Export global
window.voiceFeedback = voiceFeedback;