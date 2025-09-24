# 🔥 Hướng Dẫn Setup Firebase cho Hệ Thống Điểm Danh

## 📋 Tổng Quan
Hệ thống hiện tại hỗ trợ 2 chế độ lưu trữ:
1. **Firebase Realtime Database** - Đồng bộ real-time giữa các thiết bị
2. **LocalStorage Fallback** - Hoạt động offline khi không có Firebase

## 🚀 Cách Setup Firebase (Khuyến nghị)

### Bước 1: Tạo Firebase Project
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Đặt tên project: `attendance-system`
4. Disable Google Analytics (không cần thiết)
5. Click **"Create project"**

### Bước 2: Setup Realtime Database
1. Trong Firebase Console, vào **"Realtime Database"**
2. Click **"Create Database"**
3. Chọn location gần nhất (Singapore cho VN)
4. Chọn **"Start in test mode"** (cho development)
5. Click **"Enable"**

### Bước 3: Cấu hình Security Rules
Trong tab **"Rules"**, thay thế bằng:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['id', 'name', 'teacher', 'subject', 'createdAt', 'isActive'])"
      }
    },
    "activities": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Bước 4: Lấy Config Keys
1. Vào **"Project Settings"** (icon bánh răng)
2. Scroll xuống **"Your apps"**
3. Click **"Web"** icon `</>`
4. Đặt tên app: `attendance-web`
5. Copy **firebaseConfig** object

### Bước 5: Cập nhật Code
Mở file `js/firebase-config.js` và thay thế:
```javascript
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

## 🔧 Chế Độ LocalStorage (Không cần Firebase)

Nếu không muốn setup Firebase, hệ thống vẫn hoạt động với LocalStorage:

### Ưu điểm:
- ✅ Không cần setup phức tạp
- ✅ Hoạt động offline hoàn toàn
- ✅ Không phụ thuộc internet

### Nhược điểm:
- ❌ Chỉ lưu trữ trên từng thiết bị
- ❌ Không đồng bộ giữa các thiết bị
- ❌ Dữ liệu có thể bị mất khi xóa cache

## 🌐 Triển Khai Production

### Với Firebase:
1. Thay đổi Database Rules thành production mode:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null || data.child('isActive').val() == true",
        ".write": "auth != null"
      }
    }
  }
}
```

2. Enable Authentication (optional):
   - Vào **Authentication** > **Sign-in method**
   - Enable **Anonymous** hoặc **Email/Password**

### Hosting trên Firebase:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔍 Kiểm tra Hoạt động

### Test Firebase Connection:
1. Mở Developer Console (F12)
2. Tạo phòng từ thiết bị 1
3. Tham gia phòng từ thiết bị 2
4. Kiểm tra console logs:
   - `Firebase initialized successfully` ✅
   - `Phòng đã được lưu trên cloud` ✅

### Test Offline Mode:
1. Tắt internet
2. Tạo phòng → Sẽ hiện `Lưu offline - sẽ đồng bộ khi có mạng`
3. Bật internet → Dữ liệu tự động sync

## 📊 Cấu trúc Database

```
attendance-system/
├── rooms/
│   ├── ABC123/
│   │   ├── id: "ABC123"
│   │   ├── name: "Lập trình Web - IT01"
│   │   ├── teacher: "Nguyễn Văn A"
│   │   ├── subject: "Lập trình Web"
│   │   ├── createdAt: 1640995200000
│   │   ├── isActive: true
│   │   └── students/
│   │       ├── student1/
│   │       │   ├── name: "Trần Văn B"
│   │       │   ├── studentId: "2021001234"
│   │       │   ├── class: "IT01"
│   │       │   ├── photo: "data:image/jpeg;base64,..."
│   │       │   └── timestamp: 1640995800000
│   │       └── student2/...
│   └── DEF456/...
└── activities/
    ├── activity1/
    │   ├── type: "room_created"
    │   ├── message: "Phòng ABC123 đã được tạo"
    │   └── timestamp: 1640995200000
    └── activity2/...
```

## 🛠️ Troubleshooting

### Lỗi thường gặp:

**1. Firebase not defined**
```
Giải pháp: Kiểm tra Firebase SDK đã load chưa
```

**2. Permission denied**
```
Giải pháp: Kiểm tra Database Rules
```

**3. Network error**
```
Giải pháp: Kiểm tra internet và Database URL
```

**4. Quota exceeded**
```
Giải pháp: Upgrade Firebase plan hoặc optimize data
```

## 📱 Mobile Support

Hệ thống hỗ trợ đầy đủ mobile:
- ✅ Camera API trên mobile browsers
- ✅ Touch-friendly interface
- ✅ Responsive design
- ✅ PWA ready (có thể thêm manifest.json)

## 🔐 Bảo mật

### Khuyến nghị:
1. **Không lưu API keys trong code** (sử dụng environment variables)
2. **Setup proper Database Rules**
3. **Enable Authentication cho production**
4. **Giới hạn domain trong Firebase Console**
5. **Regular backup dữ liệu**

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra Browser Console (F12)
2. Xem Firebase Console logs
3. Test với LocalStorage mode trước
4. Liên hệ support team

---

**🎉 Chúc bạn setup thành công!**