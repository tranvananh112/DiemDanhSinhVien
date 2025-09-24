# 🔧 Hướng Dẫn Khắc Phục Lỗi

## 🚨 Lỗi Thường Gặp và Cách Sửa

### 1. Giáo Viên Không Tạo Được Phòng

#### Triệu chứng:
- Nhấn "Tạo Phòng" nhưng không có phản hồi
- Thông báo lỗi "Không tìm thấy form elements"
- Phòng không xuất hiện trong danh sách

#### Nguyên nhân:
- JavaScript chưa được load đầy đủ
- Lỗi trong file `teacher-enhanced.js`
- Thiếu thư viện dependencies

#### Cách khắc phục:

**Bước 1: Kiểm tra Console**
```javascript
// Mở Developer Tools (F12) và kiểm tra Console
// Tìm các lỗi màu đỏ
```

**Bước 2: Kiểm tra file JavaScript**
```javascript
// Kiểm tra xem các file đã được load chưa
console.log(typeof teacherDashboard); // Phải khác 'undefined'
console.log(typeof simpleStorage);    // Phải khác 'undefined'
```

**Bước 3: Reload trang và thử lại**
```javascript
// Nhấn Ctrl+F5 để hard refresh
// Hoặc xóa cache trình duyệt
```

**Bước 4: Kiểm tra form elements**
```javascript
// Mở Console và chạy:
console.log(document.getElementById('roomName'));
console.log(document.getElementById('teacherName'));
console.log(document.getElementById('subject'));
// Tất cả phải khác null
```

### 2. Sinh Viên Không Vào Được Phòng

#### Triệu chứng:
- Nhập ID phòng nhưng báo "Không tìm thấy phòng"
- ID phòng đúng nhưng vẫn không vào được
- Lỗi "Phòng đã được đóng"

#### Nguyên nhân:
- Dữ liệu không đồng bộ giữa các thiết bị
- LocalStorage bị xóa hoặc corrupt
- ID phòng không chính xác

#### Cách khắc phục:

**Bước 1: Kiểm tra ID phòng**
```javascript
// Trên thiết bị giáo viên, mở Console:
console.log(localStorage.getItem('currentTeacherRoom'));
// Sao chép ID chính xác
```

**Bước 2: Kiểm tra dữ liệu phòng**
```javascript
// Trên thiết bị sinh viên, mở Console:
const roomId = 'ABC123'; // Thay bằng ID thực tế
console.log(simpleStorage.getRoom(roomId));
// Nếu null thì phòng không tồn tại
```

**Bước 3: Đồng bộ dữ liệu thủ công**
```javascript
// Trên thiết bị giáo viên:
const roomData = simpleStorage.exportData();
console.log(JSON.stringify(roomData));
// Copy dữ liệu này

// Trên thiết bị sinh viên:
const importedData = /* paste dữ liệu ở đây */;
simpleStorage.importData(importedData);
```

### 3. Camera Không Hoạt Động

#### Triệu chứng:
- Nhấn "Bật Camera" nhưng không có gì xảy ra
- Thông báo "Không thể truy cập camera"
- Video không hiển thị

#### Nguyên nhân:
- Chưa cấp quyền camera
- Trình duyệt không hỗ trợ WebRTC
- Camera đang được sử dụng bởi ứng dụng khác

#### Cách khắc phục:

**Bước 1: Cấp quyền camera**
- Chrome: Nhấn vào icon 🔒 bên trái URL → Camera → Allow
- Firefox: Nhấn vào icon camera trong address bar → Allow
- Safari: Safari → Preferences → Websites → Camera → Allow

**Bước 2: Kiểm tra camera**
```javascript
// Mở Console và test:
navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => {
    console.log('Camera OK:', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('Camera Error:', err));
```

**Bước 3: Sử dụng HTTPS**
- Camera chỉ hoạt động trên HTTPS hoặc localhost
- Nếu dùng HTTP, chuyển sang HTTPS

### 4. Nhận Diện Khuôn Mặt Không Hoạt Động

#### Triệu chứng:
- Không phát hiện được khuôn mặt
- Nhận diện sai
- Lỗi "Mô hình chưa sẵn sàng"

#### Nguyên nhân:
- Face-API models chưa được tải
- Ánh sáng kém
- Góc chụp không ph�� hợp

#### Cách khắc phục:

**Bước 1: Kiểm tra models**
```javascript
// Mở Console:
console.log(faceRecognition.isModelLoaded);
// Phải là true
```

**Bước 2: Tải lại models**
```javascript
// Reload trang và đợi models load
// Hoặc chạy:
location.reload();
```

**Bước 3: Cải thiện điều kiện chụp**
- Đảm bảo ánh sáng đủ
- Nhìn thẳng vào camera
- Không đeo kính đen
- Khuôn mặt trong khung hình

### 5. Giọng Nói Không Phát

#### Triệu chứng:
- Không nghe thấy giọng nói AI
- Lỗi Speech Synthesis

#### Nguyên nhân:
- Trình duyệt không hỗ trợ Web Speech API
- Volume bị tắt
- Giọng tiếng Việt chưa có

#### Cách khắc phục:

**Bước 1: Kiểm tra hỗ trợ**
```javascript
// Mở Console:
console.log('speechSynthesis' in window);
// Phải là true
```

**Bước 2: Test giọng nói**
```javascript
// Chạy trong Console:
speechSynthesis.speak(new SpeechSynthesisUtterance('Xin chào'));
```

**Bước 3: Kiểm tra volume**
- Đảm bảo volume máy tính > 0
- Kiểm tra volume trình duyệt

### 6. Excel Import/Export Không Hoạt Động

#### Triệu chứng:
- Không import được file Excel
- Không xuất được dữ li��u
- Lỗi định dạng file

#### Nguyên nhân:
- XLSX library chưa load
- File Excel sai định dạng
- Thiếu quyền download

#### Cách khắc phục:

**Bước 1: Kiểm tra XLSX library**
```javascript
// Mở Console:
console.log(typeof XLSX);
// Phải khác 'undefined'
```

**Bước 2: Sử dụng template**
- Tải template từ hệ thống
- Điền dữ liệu theo đúng format
- Đảm bảo có các cột: STT, MSSV, Tên, Lớp

**Bước 3: Kiểm tra quyền download**
- Cho phép trình duyệt download files
- Kiểm tra thư mục Downloads

## 🛠️ Công Cụ Debug

### 1. Test Page
Mở file `test.html` để kiểm tra các thành phần:
```
http://localhost/attendance-system/test.html
```

### 2. Console Commands
```javascript
// Kiểm tra storage
console.log(localStorage.getItem('attendanceSystem'));

// Kiểm tra phòng hiện tại
console.log(localStorage.getItem('currentTeacherRoom'));

// Kiểm tra tất cả phòng
console.log(simpleStorage.getAllRooms());

// Xóa tất cả dữ liệu (cẩn thận!)
localStorage.clear();
```

### 3. Network Tab
- Mở Developer Tools → Network
- Reload trang
- Kiểm tra các file JavaScript có load thành công không
- Tìm các file bị lỗi 404 hoặc 500

## 🔄 Reset Hệ Thống

### Reset Hoàn Toàn
```javascript
// Chạy trong Console để xóa tất cả dữ liệu:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Reset Chỉ Dữ Liệu Điểm Danh
```javascript
// Xóa chỉ dữ liệu attendance:
localStorage.removeItem('attendanceSystem');
localStorage.removeItem('currentTeacherRoom');
localStorage.removeItem('faceDescriptors');
location.reload();
```

## 📱 Lỗi Trên Mobile

### 1. Camera Mobile
- Sử dụng camera sau: `facingMode: 'environment'`
- Sử dụng camera trước: `facingMode: 'user'`

### 2. Responsive Issues
- Zoom out nếu giao diện bị cắt
- Xoay ngang màn hình nếu cần

### 3. Performance
- Đóng các app khác để giải phóng RAM
- Sử dụng WiFi thay vì 4G

## 🌐 Lỗi Trình Duyệt

### Chrome
- Cập nhật lên phiên bản mới nhất
- Tắt extensions có thể conflict
- Xóa cache: Ctrl+Shift+Delete

### Firefox
- Enable camera permissions
- Kiểm tra about:config cho media.navigator.enabled

### Safari
- Cập nhật macOS/iOS
- Enable camera trong System Preferences

### Edge
- Tương tự Chrome
- Kiểm tra Windows permissions

## 📞 Hỗ Trợ Thêm

### Thông Tin Debug
Khi báo lỗi, vui lòng cung cấp:
1. Trình duyệt và phiên bản
2. Hệ điều hành
3. Thông báo lỗi trong Console
4. Các bư���c tái tạo lỗi
5. Screenshot nếu có

### Log Files
```javascript
// Tạo log file để gửi hỗ trợ:
const debugInfo = {
    userAgent: navigator.userAgent,
    localStorage: localStorage.getItem('attendanceSystem'),
    timestamp: new Date().toISOString(),
    url: window.location.href
};
console.log('DEBUG INFO:', JSON.stringify(debugInfo, null, 2));
```

---

**Lưu ý**: Hầu hết các lỗi đều có thể khắc phục bằng cách reload trang hoặc xóa cache. Nếu vẫn không được, hãy thử trên trình duyệt khác hoặc thiết bị khác.