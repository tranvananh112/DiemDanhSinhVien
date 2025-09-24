# 🎓 Hệ Thống Điểm Danh Sinh Viên

Một hệ thống điểm danh sinh viên hiện đại với tính năng chụp ảnh khuôn mặt, được xây dựng bằng HTML, CSS và JavaScript thuần túy.

## ✨ Tính Năng Chính

### 👨‍🏫 Dành cho Giáo Viên:
- ✅ Tạo phòng điểm danh với ID duy nhất (6 ký tự)
- ✅ Quản lý danh sách sinh viên điểm danh
- ✅ Xem ảnh và thông tin chi tiết sinh viên
- ✅ Xuất dữ liệu ra file CSV/Excel
- ✅ Theo dõi thời gian thực
- ✅ Đóng phòng và lưu dữ liệu

### 👨‍🎓 Dành cho Sinh Viên:
- ✅ Tham gia phòng bằng ID
- ✅ Điền thông tin cá nhân (Tên, MSSV, Lớp)
- ✅ Chụp ảnh khuôn mặt để điểm danh
- ✅ Xác nhận thông tin trước khi gửi
- ✅ Nhận thông báo kết quả điểm danh

### 🔧 Tính Năng Hệ Thống:
- ✅ Lưu trữ dữ liệu tự động (LocalStorage)
- ✅ Theo dõi hoạt động gần đây
- ✅ Giao diện responsive (mobile-friendly)
- ✅ Hiệu ứng Glass Morphism hiện đại
- ✅ Thông báo real-time
- ✅ Kiểm tra trùng lặp MSSV

## 🚀 Cách S��� Dụng

### Bước 1: Giáo Viên Tạo Phòng
1. Mở `index.html` trong trình duyệt
2. Click "Giáo Viên"
3. Điền thông tin phòng học
4. Nhận ID phòng (6 ký tự)
5. Chia sẻ ID với sinh viên

### Bước 2: Sinh Viên Điểm Danh
1. Mở `index.html` trong trình duyệt
2. Click "Sinh Viên"
3. Nhập ID phòng do giáo viên cung cấp
4. Điền thông tin cá nhân
5. Chụp ảnh khuôn mặt
6. Xác nhận và gửi

### Bước 3: Giáo Viên Theo Dõi
- Xem danh sách sinh viên điểm danh real-time
- Click vào ảnh để xem chi tiết
- Xuất dữ liệu khi cần thiết
- Đóng phòng khi kết thúc

## 📁 Cấu Trúc Dự Án

```
attendance-system/
├── index.html              # Trang chủ chọn vai trò
├── teacher.html            # Giao diện giáo viên
├── student.html            # Giao diện sinh viên
├── css/
│   └── style.css          # Styling chính
├── js/
│   ├── main.js            # Logic trang chủ
│   ├── teacher.js         # Logic giáo viên
│   └── student.js         # Logic sinh viên
└── README.md              # Hướng dẫn này
```

## 🛠️ Công Nghệ Sử Dụng

- **HTML5**: Cấu trúc trang web và Camera API
- **CSS3**: Glass Morphism, Animations, Responsive Design
- **JavaScript ES6+**: Logic xử lý và LocalStorage
- **Font Awesome**: Icons
- **MediaDevices API**: Truy cập camera
- **Canvas API**: Xử lý ảnh

## 📱 Tương Thích Trình Duyệt

### ✅ Được Hỗ Trợ:
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 12+

### ⚠️ Yêu Cầu:
- HTTPS (cho camera trên production)
- JavaScript enabled
- Camera permission

## 🔒 Bảo Mật & Quyền Riêng Tư

- ✅ Dữ liệu lưu trữ local (không gửi server)
- ✅ Ảnh được mã hóa base64
- ✅ Không thu thập thông tin cá nhân khác
- ✅ Tự động xóa dữ liệu cũ

## 📊 Lưu Trữ Dữ Liệu

Hệ thống sử dụng **LocalStorage** để lưu trữ:

```javascript
{
  "rooms": {
    "ABC123": {
      "id": "ABC123",
      "name": "Lập trình Web - IT01",
      "teacher": "Nguyễn Văn A",
      "subject": "Lập trình Web",
      "createdAt": 1640995200000,
      "isActive": true,
      "students": [...]
    }
  },
  "activities": [...],
  "settings": {...}
}
```

## 🎨 Tùy Chỉnh Giao Diện

### Thay Đổi Màu Sắc:
```css
:root {
  --primary-color: #3498db;
  --success-color: #27ae60;
  --error-color: #e74c3c;
  --warning-color: #f39c12;
}
```

### Thay ��ổi Font:
```css
body {
  font-family: 'Your Font', sans-serif;
}
```

## 🚀 Triển Khai

### GitHub Pages:
1. Upload toàn bộ folder lên GitHub repository
2. Kích hoạt GitHub Pages
3. Truy cập: `https://username.github.io/repository-name/`

### Local Server:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

## 🔧 Khắc Phục Sự Cố

### Camera Không Hoạt Động:
- Kiểm tra quyền truy cập camera
- Sử dụng HTTPS (không phải HTTP)
- Thử trình duyệt khác

### Dữ Liệu Bị Mất:
- Kiểm tra LocalStorage
- Không xóa cache trình duyệt
- Backup dữ liệu thường xuyên

### Giao Diện Lỗi:
- Kiểm tra kết nối internet (cho Font Awesome)
- Xóa cache và reload
- Kiểm tra console errors

## 📈 Tính Năng Tương Lai

- [ ] Nhận diện khuôn mặt AI
- [ ] Đồng bộ cloud storage
- [ ] Báo cáo thống kê chi tiết
- [ ] Tích hợp với LMS
- [ ] Mobile app
- [ ] QR Code điểm danh

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## �� License

MIT License - Tự do sử dụng cho mọi mục đích.

## 👥 Tác Giả

**Được phát triển bởi AI Assistant**
- 📧 Email: support@example.com
- 🌐 Website: https://example.com

## 🙏 Cảm Ơn

- Font Awesome cho icons
- MDN Web Docs cho tài liệu
- Cộng đồng developers

---

**⭐ Nếu dự án hữu ích, hãy cho một star trên GitHub!**