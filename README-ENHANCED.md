# 🎓 Hệ Thống Điểm Danh Bằng Nhận Diện Khuôn Mặt

## 📋 Tổng Quan

Hệ thống điểm danh hiện đại với công nghệ nhận diện khuôn mặt, hỗ trợ đầy đủ tiếng Việt, không yêu cầu đăng ký/đăng nhập. Ứng dụng phân vai trò rõ ràng giữa giáo viên (tạo lớp) và sinh viên (tham gia lớp qua ID).

## ✨ Tính Năng Chính

### 🧑‍🏫 Dành cho Giáo Viên

#### 📚 Quản Lý Lớp Học
- **Tạo lớp học**: Nhập tên lớp, ID lớp (tự đặt), tên giáo viên, môn học
- **Import Excel**: Tải danh sách sinh viên từ file Excel (.xlsx, .xls, .csv)
- **Template Excel**: Tải template mẫu với định dạng chuẩn
- **ID lớp duy nhất**: Hệ thống tự tạo mã 6 ký tự không trùng lặp

#### 📊 Theo Dõi Điểm Danh
- **Danh sách thời gian thực**: Cập nhật ngay khi sinh viên điểm danh
- **Hiển thị đầy đủ**: STT, MSSV, Tên, Lớp, Ảnh khuôn mặt, Trạng thái
- **Ảnh khuôn mặt**: Kích thước 150x150px, có thể phóng to xem chi tiết
- **Trạng thái rõ ràng**: C (có mặt), V (vắng)
- **Tìm kiếm**: Lọc sinh viên theo tên, MSSV

#### 📤 Xuất Dữ Liệu
- **Excel export**: Xuất file với đầy đủ thông tin điểm danh
- **Định dạng chuẩn**: STT, MSSV, Tên, Lớp, Trạng thái (C/V)
- **Tên file tự động**: Bao gồm ID lớp và ngày tạo

#### ⏱️ Quản Lý Thời Gian
- **Đồng hồ thời gian thực**: Hiển thị thời gian hoạt động của lớp
- **Thống kê**: Số lượng sinh viên đã điểm danh/tổng số
- **Đóng lớp**: Lưu dữ liệu và kết thúc phiên điểm danh

### 🎓 Dành cho Sinh Viên

#### 🚪 Tham Gia Lớp
- **Nhập ID lớp**: 6 ký tự do giáo viên cung cấp
- **Kiểm tra tự động**: Xác thực lớp có tồn tại và đang hoạt động
- **Thông tin lớp**: Hiển thị tên lớp, môn học, giáo viên

#### 👤 Nhập Thông Tin
- **Thông tin cá nhân**: Họ tên, MSSV, Lớp
- **Kiểm tra trùng lặp**: Không cho phép MSSV điểm danh 2 lần
- **Tùy chọn nhận diện**: Chọn tạo khuôn mặt hoặc sử dụng có sẵn

#### 🤖 Nhận Diện Khuôn Mặt
- **Tạo khuôn mặt**: Chụp ảnh gốc lần đầu để lưu làm mẫu
- **Nhận diện tự động**: So sánh khuôn mặt với ảnh gốc đã lưu
- **Độ chính xác cao**: Sử dụng face-api.js với mô hình TinyFaceDetector
- **Hướng dẫn chi tiết**: Chỉ dẫn vị trí khuôn mặt, ánh sáng
- **Phát hiện thời gian thực**: Tự động chụp khi phát hiện khuôn mặt

#### 📸 Chụp Ảnh Điểm Danh
- **Camera tích hợp**: Truy cập camera trình duyệt
- **Khung hướng dẫn**: Vòng tròn chỉ vị trí khuôn mặt
- **Xem trước**: Kiểm tra ảnh trước khi xác nhận
- **Chụp lại**: Có thể chụp lại nếu không hài lòng

#### 🎫 Phiếu Điểm Danh
- **Hiển thị đầy đủ**: STT, MSSV, Tên, Lớp, Ảnh, Thời gian, Trạng thái
- **Thiết kế đẹp**: Giao diện như vé điện tử
- **Lưu trữ**: Có thể xem lại trong phiên làm việc

#### 🔊 Phản Hồi Giọng Nói
- **AI tiếng Việt**: Giọng nữ tự nhiên
- **Thông báo thành công**: "Bạn đã điểm danh thành công"
- **Hướng dẫn**: Chỉ dẫn các bước thực hiện
- **Thông báo lỗi**: Giải thích rõ ràng khi có vấn đề

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **HTML5/CSS3/JavaScript**: Giao diện responsive
- **Face-api.js**: Thư viện nhận diện khuôn mặt
- **XLSX.js**: Xử lý file Excel
- **Web Speech API**: Phản hồi giọng nói
- **WebRTC**: Truy cập camera
- **Font Awesome**: Icon đẹp mắt

### Backend/Storage
- **LocalStorage**: Lưu trữ dữ liệu cục bộ
- **IndexedDB**: Lưu trữ ảnh khuôn mặt
- **Real-time Updates**: Cập nhật tự động mỗi 2 giây

### Bảo Mật
- **Mã hóa dữ liệu**: Ảnh khuôn mặt được mã hóa
- **Không lưu trữ cloud**: Dữ liệu chỉ lưu cục bộ
- **HTTPS**: Bảo mật kết nối (khuyến nghị)

## 📁 Cấu Trúc Dự Án

```
attendance-system/
├── index.html                 # Trang chủ chọn vai trò
├── teacher.html              # Giao diện giáo viên
├── student.html              # Giao diện sinh viên
├── css/
│   └── style.css            # CSS chính với tất cả styles
├── js/
│   ├── main.js              # JavaScript trang chủ
│   ├── teacher-enhanced.js   # Logic giáo viên nâng cao
│   ├── student-enhanced.js   # Logic sinh viên nâng cao
│   ├── face-recognition.js   # Xử lý nhận diện khuôn mặt
│   ├── excel-handler.js      # Xử lý import/export Excel
│   ├── voice-feedback.js     # Phản hồi giọng nói
│   ├── simple-storage.js     # Quản lý lưu trữ
│   └── cross-device-sync.js  # Đồng bộ thiết bị
└── README-ENHANCED.md        # Tài liệu này
```

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống
- **Trình duyệt**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Camera**: Webcam hoặc camera tích hợp
- **Microphone**: Loa để nghe phản hồi giọng nói
- **Kết nối**: Internet để tải thư viện (lần đầu)

### Cài Đặt
1. **Tải mã nguồn**: Clone hoặc download project
2. **Chạy web server**: Sử dụng Live Server, XAMPP, hoặc Python HTTP server
3. **Truy cập**: Mở `index.html` trong trình duyệt
4. **Cấp quyền**: Cho phép truy cập camera khi được yêu cầu

### Chạy Local Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (với http-server)
npx http-server

# PHP
php -S localhost:8000
```

## 📖 Hướng Dẫn Sử Dụng

### Cho Giáo Viên

1. **Tạo Lớp Học**
   - Chọn "Giáo Viên" từ trang chủ
   - Điền thông tin: Tên phòng, Tên giáo viên, Môn học
   - (Tùy chọn) Import danh sách sinh viên từ Excel
   - Nhấn "Tạo Phòng"

2. **Quản Lý Điểm Danh**
   - Chia sẻ ID phòng (6 ký tự) cho sinh viên
   - Theo dõi danh sách điểm danh thời gian thực
   - Xem ảnh sinh viên bằng cách click vào ảnh nhỏ
   - Tìm kiếm sinh vi��n cụ thể

3. **Xuất Dữ Liệu**
   - Nhấn "Xuất Excel" để tải file kết quả
   - File chứa đầy đủ thông tin điểm danh
   - Định dạng: STT, MSSV, Tên, Lớp, Trạng thái

4. **Kết Thúc Lớp**
   - Nhấn "Đóng Phòng" khi hoàn tất
   - Dữ liệu được lưu tự động

### Cho Sinh Viên

1. **Tham Gia Lớp**
   - Chọn "Sinh Viên" từ trang chủ
   - Nhập ID phòng (6 ký tự) từ giáo viên
   - Nhấn "Tham Gia"

2. **Nhập Thông Tin**
   - Điền: Họ tên, MSSV, Lớp
   - Chọn tùy chọn nhận diện khuôn mặt:
     - "Tạo khuôn mặt": Lần đầu sử dụng
     - "Sử dụng khuôn mặt có sẵn": Đã tạo trước đó
     - "Tiếp tục": Không dùng nhận diện

3. **Chụp Ảnh**
   - Nhấn "Bật Camera"
   - Đặt khuôn mặt vào vòng tròn hướng dẫn
   - Nhấn "Chụp Ảnh" hoặc chờ tự động chụp
   - Kiểm tra ảnh và nhấn "Xác Nhận"

4. **Hoàn Tất**
   - Nghe thông báo giọng nói
   - Xem phiếu điểm danh
   - Có thể điểm danh lớp khác

## 📊 Định Dạng File Excel

### File Import (Danh sách sinh viên)
```
STT | MSSV      | Tên           | Lớp
1   | 20123456  | Nguyễn Văn A  | CNTT1
2   | 20123457  | Trần Thị B    | CNTT2
3   | 20123458  | Lê Văn C      | CNTT1
```

### File Export (Kết quả điểm danh)
```
STT | MSSV      | Tên           | Lớp   | Trạng thái
1   | 20123456  | Nguyễn Văn A  | CNTT1 | C
2   | 20123457  | Trần Thị B    | CNTT2 | V
3   | 20123458  | Lê Văn C      | CNTT1 | C
```

**Lưu ý**: 
- Cột STT có thể bỏ trống, hệ thống tự tạo
- Các cột MSSV, Tên, Lớp là bắt buộc
- Trạng thái: C = Có mặt, V = Vắng

## 🔧 Tùy Chỉnh

### Cài Đặt Nhận Diện Khuôn Mặt
```javascript
// Trong face-recognition.js
const threshold = 0.6; // Ngưỡng nhận diện (0.0-1.0)
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
```

### Cài Đặt Giọng Nói
```javascript
// Trong voice-feedback.js
this.settings = {
    rate: 0.9,    // Tốc độ nói (0.1-2.0)
    pitch: 1.0,   // Cao độ (0.0-2.0)
    volume: 0.8,  // Âm lượng (0.0-1.0)
    lang: 'vi-VN' // Ngôn ngữ
};
```

### Cài Đặt Thời Gian Cập Nhật
```javascript
// Trong teacher-enhanced.js
const REALTIME_INTERVAL = 2000; // 2 giây
```

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi Camera
- **Nguyên nhân**: Không cấp quyền camera
- **Giải pháp**: Cho phép truy cập camera trong trình duyệt

### Lỗi Nhận Diện Khuôn Mặt
- **Nguyên nhân**: Ánh sáng kém, góc chụp không phù hợp
- **Giải pháp**: Đảm bảo ánh sáng đủ, nhìn thẳng camera

### Lỗi Import Excel
- **Nguyên nhân**: File không đúng định dạng
- **Giải pháp**: Sử dụng template mẫu, kiểm tra các cột bắt buộc

### Lỗi Giọng Nói
- **Nguyên nhân**: Trình duyệt không hỗ trợ Web Speech API
- **Giải pháp**: Sử dụng Chrome, Firefox, Safari mới nhất

## 🔒 Bảo Mật & Quyền Riêng Tư

### Lưu Trữ Dữ Liệu
- **LocalStorage**: Thông tin lớp học, hoạt động
- **IndexedDB**: Ảnh khuôn mặt (mã hóa)
- **Không cloud**: Dữ liệu chỉ lưu trên máy tính

### Bảo Vệ Quyền Riêng Tư
- **Mã hóa ảnh**: Face descriptors được mã hóa
- **Tự động xóa**: Dữ liệu cũ tự động dọn dẹp
- **Không theo dõi**: Không thu thập thông tin cá nhân

### Khuyến Nghị Bảo Mật
- Sử dụng HTTPS khi deploy
- Thường xuyên xóa dữ liệu cũ
- Không chia sẻ ID lớp công khai

## 🚀 Triển Khai Production

### Hosting Tĩnh
- **GitHub Pages**: Miễn phí, dễ sử dụng
- **Netlify**: Tự động deploy, HTTPS miễn phí
- **Vercel**: Hiệu suất cao, CDN toàn cầu

### Tối Ưu Hiệu Suất
- Nén ảnh khuôn mặt
- Lazy load thư viện
- Cache static assets
- Minify CSS/JS

### Backup Dữ Liệu
```javascript
// Export tất cả dữ liệu
const backup = simpleStorage.exportData();
localStorage.setItem('backup', JSON.stringify(backup));

// Import dữ liệu
const backup = JSON.parse(localStorage.getItem('backup'));
simpleStorage.importData(backup);
```

## 🤝 Đóng Góp

### Báo Lỗi
- Tạo issue trên GitHub
- Mô tả chi tiết lỗi và cách tái tạo
- Đính kèm screenshot nếu có

### Đề Xuất Tính Năng
- Tạo feature request
- Giải thích rõ ràng tính năng mong muốn
- Đánh giá tác động và lợi ích

### Phát Triển
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Tạo Pull Request

## 📞 Hỗ Trợ

### Tài Liệu
- README.md: Hướng dẫn cơ bản
- FIREBASE_SETUP.md: Cài đặt Firebase (tùy chọn)
- CROSS_DEVICE_GUIDE.md: Đồng bộ thiết bị

### Liên Hệ
- Email: support@attendance-system.com
- GitHub Issues: [Link repository]
- Documentation: [Link docs]

## 📄 Giấy Phép

MIT License - Xem file LICENSE để biết chi tiết.

## 🙏 Cảm Ơn

- **face-api.js**: Thư viện nhận diện khuôn mặt
- **XLSX.js**: Xử lý file Excel
- **Font Awesome**: Bộ icon đẹp
- **Web Speech API**: Phản hồi giọng nói

---

**Phiên bản**: 2.0.0 Enhanced  
**Cập nhật**: 2024  
**Tác giả**: Attendance System Team  
**Ngôn ngữ**: Tiếng Việt  
**Trình duyệt hỗ trợ**: Chrome, Firefox, Safari, Edge