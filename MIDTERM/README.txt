Hướng dẫn setup Project:
Backend Setup:
* Yêu cầu:
    + Java 21 SDK
    + Maven
    + Postgre SQL

* Config:
    + Cần cấu hình đường dẫn database trong file application.properties
    + Nếu cấu hình đúng đường dẫn database để backend kết nối, khi chạy ứng dụng project sẽ tự động tạo bảng và tự thêm dữ liệu nếu chưa có (bằng file DataLoader.java được inject trong project)

* Chạy project backend:
- Chạy bằng CLI
    + Mở CLI ở thư mục /backend
    + Chạy lệnh "mvn clean install"
    + Chạy lệnh "mvn spring-boot:run"
- Chạy bằng IDE (Khuyên dùng IntelliJ):
    + Sử dụng IntelliJ mở project backend
    + Nhấn nút Start và chạy project, IntelliJ hỗ trợ tốt các package và dependencies để chạy project

Frontend Setup:
* Yêu cầu:
    + NodeJS version 22.x.x

* Config:
    + Project frontend đã được clean và xóa package (trong node_modules) khi nộp
    + Cần phải mở CLI ở trong frontend sau đó chạy lệnh "npm install" để tải package

* Chạy project
- Đảm bảo backend được chạy thành công để frontend có thể fetch dữ liệu.
- Mở CLI ở thư mục frontend, sau đó chạy lệnh "npm run dev"
    
Thông tin tài khoản trong hệ thống:
Tài khoản admin: manager@example.com, mật khẩu: password



