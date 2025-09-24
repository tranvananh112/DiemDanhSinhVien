@echo off
echo 🚀 Đang cập nhật code lên GitHub...
echo.

REM Kiểm tra xem đã có Git repository chưa
if not exist .git (
    echo ⚠️  Chưa có Git repository. Đang khởi tạo...
    git init
    echo ✅ Đã khởi tạo Git repository
)

REM Thêm tất cả files
echo 📁 Đang thêm files...
git add .

REM Commit với message
echo 💾 Đang commit changes...
git commit -m "✨ Nâng cấp giao diện Glass Morphism + hiệu ứng tương tác"

REM Kiểm tra xem đã có remote origin chưa
git remote -v | findstr origin >nul
if errorlevel 1 (
    echo.
    echo ⚠️  Chưa có remote repository!
    echo 📝 Vui lòng chạy lệnh sau để thêm remote:
    echo git remote add origin https://github.com/[username]/simple-calculator.git
    echo.
    echo Sau đó chạy: git push -u origin main
) else (
    echo 🚀 Đang push lên GitHub...
    git push origin main
    if errorlevel 0 (
        echo.
        echo ✅ CẬP NHẬT THÀNH CÔNG!
        echo 🌐 Link demo sẽ cập nhật sau 1-2 phút
        echo 🔗 https://[username].github.io/simple-calculator/
    ) else (
        echo.
        echo ❌ Có lỗi khi push. Vui lòng kiểm tra:
        echo - Đã đăng nhập GitHub chưa?
        echo - Remote URL có đúng không?
    )
)

echo.
pause