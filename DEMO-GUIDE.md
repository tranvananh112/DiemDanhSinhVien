# 🎬 Hướng Dẫn Demo Hệ Thống Điểm Danh

## 🎯 Mục Tiêu Demo

Trình diễn đầy đủ tính năng của hệ thống điểm danh bằng nhận diện khuôn mặt, bao gồm:
- Tạo lớp học và import danh sách sinh viên
- Nhận diện khuôn mặt và điểm danh
- Theo dõi thời gian thực và xuất dữ liệu
- Phản hồi giọng nói tiếng Việt

## 📋 Chuẩn Bị Demo

### Thiết Bị Cần Thiết
- **2 thiết bị**: 1 cho giáo viên, 1 cho sinh viên (hoặc 2 tab trình duyệt)
- **Camera**: Webcam hoặc camera tích hợp
- **Loa**: Để nghe phản hồi giọng nói
- **File Excel mẫu**: Danh sách sinh viên demo

### File Excel Demo
Tạo file `danh-sach-demo.xlsx` với nội dung:

```
STT | MSSV      | Tên              | Lớp
1   | 20210001  | Nguyễn Văn An    | CNTT1
2   | 20210002  | Trần Thị Bình    | CNTT1  
3   | 20210003  | Lê Văn Cường     | CNTT2
4   | 20210004  | Phạm Thị Dung    | CNTT2
5   | 20210005  | Hoàng Văn Em     | CNTT1
```

## 🎭 Kịch Bản Demo (15 phút)

### Phần 1: Giới Thiệu (2 phút)

**Thuyết trình:**
> "Chào mừng đến với hệ thống điểm danh bằng nhận diện khuôn mặt. Đây là giải pháp hiện đại, không cần đăng ký tài khoản, hỗ trợ đầy đủ tiếng Việt với phản hồi giọng nói AI."

**Điểm nhấn:**
- ✅ Không cần đăng ký/đăng nhập
- ✅ Nhận diện khuôn mặt tự động
- ✅ Giọng nói AI tiếng Việt
- ✅ Import/Export Excel
- ✅ Cập nhật thời gian thực

### Phần 2: Giao Diện Giáo Viên (5 phút)

#### Bước 1: Truy Cập Hệ Thống
1. Mở `index.html` trong trình duyệt
2. Chọn **"Giáo Viên"**
3. Giải thích giao diện dashboard

#### Bước 2: Import Danh Sách Sinh Viên
1. Nhấn **"Tải Template"** → Tải file mẫu
2. Nhấn **"Nhập từ Excel"** → Chọn file demo
3. Xem preview danh sách đã import
4. **Thuyết trình**: "Hệ thống tự động đọc file Excel, tạo STT nếu thiếu"

#### Bước 3: Tạo Lớp Học
1. Điền thông tin:
   - **Tên phòng**: "Demo Lập Trình Web"
   - **Tên giáo viên**: "TS. Nguyễn Văn A"
   - **Môn học**: "Lập Trình Web"
2. Nhấn **"Tạo Phòng"**
3. **Highlight**: ID phòng được tạo tự động (VD: ABC123)
4. Copy ID phòng để chia sẻ

#### Bước 4: Giao Diện Quản Lý
1. Giải thích các thành phần:
   - **ID phòng**: Để sinh viên tham gia
   - **Thống kê**: Số lượng điểm danh/tổng số
   - **Đồng hồ**: Thời gian hoạt động
   - **Danh sách**: Hiển thị thời gian thực

### Phần 3: Giao Diện Sinh Viên (6 phút)

#### Bước 1: Tham Gia Lớp
1. Mở tab/thiết bị thứ 2
2. Chọn **"Sinh Viên"**
3. Nhập ID phòng từ giáo viên
4. **Thuyết trình**: "Hệ thống kiểm tra lớp có tồn tại và đang hoạt động"

#### Bước 2: Nhập Thông Tin
1. Điền thông tin sinh viên đầu tiên:
   - **Họ tên**: "Nguyễn Văn An"
   - **MSSV**: "20210001"
   - **Lớp**: "CNTT1"
2. **Highlight**: Tùy chọn nhận diện khuôn mặt
3. Chọn **"Tạo khuôn mặt"** (lần đầu)

#### Bước 3: Tạo Khuôn Mặt
1. Nhấn **"Bật Camera"**
2. **Thuyết trình**: "Hệ thống hướng dẫn vị trí khuôn mặt"
3. Đặt khuôn mặt vào vòng tròn
4. Chụp ảnh và xác nhận
5. **Highlight**: "Khuôn mặt đã được lưu làm mẫu"

#### Bước 4: Điểm Danh Thành Công
1. Xác nhận điểm danh
2. **Nghe giọng nói**: "Bạn đã điểm danh thành công!"
3. Xem phiếu điểm danh với đầy đủ thông tin
4. **Thuyết trình**: "Phiếu như vé điện tử, có thể lưu lại"

### Phần 4: Nhận Diện Khuôn Mặt (4 phút)

#### Bước 1: Sinh Viên Thứ 2
1. Tạo session mới (Ctrl+Shift+N)
2. Tham gia cùng lớp với MSSV khác
3. Chọn **"Sử dụng khuôn mặt có sẵn"**
4. **Thuyết trình**: "Hệ thống sẽ tìm khuôn mặt đã lưu"

#### Bước 2: Thử Nghiệm Nhận Diện
1. Bật camera
2. **Highlight**: Hệ thống tự động phát hiện và so sánh
3. Nếu không khớp: Thông báo lỗi + hướng dẫn
4. Nếu khớp: Tự động điểm danh + giọng nói

#### Bước 3: Trường Hợp Lỗi
1. Thử với khuôn mặt khác người
2. **Thuyết trình**: "Hệ thống từ chối và đưa ra hướng dẫn"
3. Giải thích độ chính xác và ngưỡng nhận diện

### Phần 5: Theo Dõi Thời Gian Thực (2 phút)

#### Quan Sát Giao Diện Giáo Viên
1. Chuyển về tab giáo viên
2. **Highlight**: Danh sách cập nhật tự động
3. Xem ảnh sinh viên đã điểm danh
4. Click vào ảnh để phóng to
5. **Thuyết trình**: "Cập nhật mỗi 2 giây, không cần refresh"

#### Thống Kê và Tìm Kiếm
1. Xem số liệu: "2/5 sinh viên đã điểm danh"
2. Thử tìm kiếm theo tên
3. Giải thích trạng thái C/V

### Phần 6: Xuất Dữ Liệu và Kết Thúc (1 phút)

#### Xuất Excel
1. Nhấn **"Xuất Excel"**
2. Mở file đã tải
3. **Thuyết trình**: "File chứa đầy đủ thông tin, sẵn sàng nộp báo cáo"

#### Đóng Lớp
1. Nhấn **"Đóng Phòng"**
2. Xác nhận đóng
3. **Highlight**: Dữ liệu được lưu an toàn

## 🎤 Script Thuyết Trình Mẫu

### Mở Đầu
> "Xin chào! Hôm nay tôi sẽ trình diễn hệ thống điểm danh bằng nhận diện khuôn mặt - một giải pháp hiện đại cho giáo dục. Hệ thống này đặc biệt ở chỗ không cần đăng ký tài khoản, hỗ trợ đầy đủ tiếng Việt, và có phản hồi giọng nói AI."

### Giới Thiệu Tính Năng
> "Điểm nổi bật của hệ thống:
> - Giáo viên có thể import danh sách sinh viên từ Excel
> - Sinh viên điểm danh bằng khuôn mặt, không cần thẻ hay giấy tờ
> - Cập nh��t thời gian thực, giáo viên thấy ngay khi sinh viên điểm danh
> - Xuất báo cáo Excel tự động"

### Demo Import Excel
> "Đầu tiên, giáo viên có thể tải template Excel hoặc sử dụng file có sẵn. Hệ thống tự động đọc các cột STT, MSSV, Tên, Lớp. Nếu thiếu STT, hệ thống sẽ tự tạo."

### Demo Tạo Lớp
> "Sau khi import danh sách, giáo viên điền thông tin lớp học. Hệ thống tự tạo ID lớp 6 ký tự duy nhất. ID này sẽ được chia sẻ cho sinh viên."

### Demo Nhận Diện Khuôn Mặt
> "Đây là phần thú vị nhất. Sinh viên lần đầu sẽ 'tạo khuôn mặt' - chụp ảnh gốc để hệ thống lưu làm mẫu. Các lần sau chỉ cần 'sử dụng khuôn mặt có sẵn' để nhận diện tự động."

### Demo Giọng Nói
> "Khi điểm danh thành công, hệ thống sẽ phát giọng nói tiếng Việt: 'Bạn đã điểm danh thành công!' Điều này giúp sinh viên biết chắc chắn đã hoàn tất."

### Demo Phiếu Điểm Danh
> "Sinh viên sẽ nhận được phiếu điểm danh điện tử với đầy đủ thông tin: STT, MSSV, tên, lớp, ảnh, và thời gian. Phiếu này có thể lưu lại làm bằng chứng."

### Demo Thời Gian Thực
> "Điểm mạnh của hệ thống là cập nhật thời gian thực. Ngay khi sinh viên điểm danh, giáo viên thấy thông tin xuất hiện trên danh sách, kèm ảnh khuôn mặt."

### Kết Thúc
> "Cuối buổi học, giáo viên chỉ cần nhấn 'Xuất Excel' để có file báo cáo hoàn chỉnh. Hệ thống này giúp tiết kiệm thời gian, chính xác cao, và rất dễ sử dụng."

## 🔧 Tips Demo Thành Công

### Chuẩn Bị Kỹ Thuật
- ✅ Test camera và microphone trước
- ✅ Chuẩn bị file Excel mẫu
- ✅ Kiểm tra kết nối internet
- ✅ Mở sẵn 2 tab/thiết bị
- ✅ Tắt notification để tránh gián đoạn

### Xử Lý Tình Huống
- **Camera không hoạt động**: Giải thích và dùng ảnh có sẵn
- **Nhận diện thất bại**: Thuyết trình về độ chính xác và bảo mật
- **Giọng nói không phát**: Giải thích tính năng và demo bằng text
- **Excel lỗi**: Dùng template có sẵn

### Tương Tác Khán Giả
- Mời khán giả thử nghiệm
- Giải thích kỹ thuật đơn giản
- Trả lời câu hỏi về bảo mật
- Demo trên thiết bị di động

## 📊 Câu Hỏi Thường Gặp Trong Demo

### Q: Dữ liệu có được lưu trên cloud không?
**A**: "Không, tất cả dữ liệu chỉ lưu trên máy tính cục bộ. Điều này đảm bảo quyền riêng tư và không phụ thuộc internet."

### Q: Độ chính xác nhận diện như thế nào?
**A**: "Hệ thống sử dụng face-api.js với độ chính xác cao. Có thể điều chỉnh ngưỡng nhận diện tùy theo yêu cầu bảo mật."

### Q: Có thể sử dụng trên điện thoại không?
**A**: "Có, hệ thống responsive, hoạt động tốt trên mobile. Tuy nhiên khuyến nghị dùng máy tính để có trải nghiệm tốt nhất."

### Q: Xử lý như thế nào khi sinh viên quên tạo khuôn mặt?
**A**: "Sinh viên có thể chọn 'Tạo khuôn mặt' bất cứ lúc nào, hoặc điểm danh thông thường không dùng nhận diện."

### Q: File Excel có định dạng đặc biệt không?
**A**: "Không, chỉ cần các cột cơ bản: MSSV, Tên, Lớp. Hệ thống rất linh hoạt với định dạng."

## 🎯 Kết Thúc Demo

### Tóm Tắt Lợi Ích
> "Hệ thống điểm danh này mang lại nhiều lợi ích:
> - **Tiết kiệm thời gian**: Không cần gọi tên từng sinh viên
> - **Chính xác cao**: Nhận diện khuôn mặt, khó gian lận
> - **Dễ sử dụng**: Giao diện đơn giản, hướng dẫn rõ ràng
> - **Báo cáo tự động**: Xuất Excel ngay lập tức
> - **Bảo mật**: Dữ liệu lưu cục bộ, không lo rò rỉ"

### Call to Action
> "Hệ thống đã sẵn sàng triển khai. Các bạn có thể tải về và sử dụng ngay hôm nay. Mã nguồn mở, miễn phí, và có tài liệu hướng dẫn chi tiết."

---

**Thời gian demo**: 15 phút  
**Số người tham gia**: 1-2 người  
**Thiết bị cần**: 2 màn hình/thiết bị  
**Chuẩn bị**: 10 phút  
**Độ khó**: Dễ