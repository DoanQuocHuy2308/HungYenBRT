# Hưng Yên BRT (Bus Rapid Transit)

## 📌 Giới thiệu dự án
Dự án hệ thống quản lý xe buýt nhanh Hưng Yên BRT là một giải pháp toàn diện bao gồm cả phần cứng (cổng quét vé) và phần mềm (Backend, Frontend Admin, Staff, Gates, Customer App). Dự án tích hợp các công nghệ nhận diện và xác thực tiên tiến như eKYC (quét thẻ CCCD), nhận diện khuôn mặt, và quét mã QR để tối ưu hóa việc quản lý hành khách và nhân sự.

## 🚀 Cấu trúc dự án
Dự án được chia thành các module độc lập, phục vụ các nghiệp vụ chuyên biệt:
- **`be/`**: Backend API (Node.js, Express, Sequelize, MySQL) kết hợp cùng Python Scripts để xử lý dữ liệu.
- **`fe_admin/`**: Trang quản trị dành cho Admin (Next.js 16).
- **`fe_staffs/`**: Trang POS dành cho nhân viên bán vé (Next.js 16).
- **`fe_gates/`**: Giao diện dành cho các cổng kiểm soát ra/vào (Entrance và Exit) tại bến xe (Next.js 16).
- **`fe_customers/`**: Ứng dụng di động dành cho hành khách (React Native, Expo).
- **`database/`**: Chứa file `db_hungyenbrt.sql` để import cấu trúc và dữ liệu cơ sở dữ liệu.
- **`start-face-server.bat`**: Script khởi chạy server nhận diện khuôn mặt (MTCNN) qua pm2.

## ✨ Chức năng chính

### 1. Dành cho Quản trị viên (Admin Dashboard - `fe_admin`)
- Quản lý nhân viên (Employee Management) với giao diện UI/UX hiện đại, cao cấp.
- Quản lý lịch sử quét vé, xóa hoặc in lại đơn hàng (Order Management).
- Bảng điều khiển thống kê (Statistics Dashboard) chi tiết với khả năng xuất file báo cáo CSV.
- Quản lý các loại vé, chiết khấu và chương trình khuyến mãi/voucher.

### 2. Dành cho Nhân viên bán vé (Staff POS - `fe_staffs`)
- Hệ thống POS bán/đăng ký vé trực tiếp tại quầy theo thời gian thực (Time-based ticket registration).
- Tự động hóa nhập liệu khách hàng thông qua tính năng quét thẻ CCCD (eKYC).
- Quản lý phát hành vé và xử lý voucher/khuyến mãi ngay trong lúc thanh toán.

### 3. Dành cho Cổng kiểm soát (Gates - Entrance/Exit - `fe_gates`)
- Giao diện quét mã QR/vé cứng để kiểm soát hành khách ra vào trạm với "Light Theme" trực quan, thao tác nhanh.
- Thiết kế hỗ trợ hiển thị tối ưu cho các màn hình phần cứng tại cổng quét, kết hợp trạng thái đèn/còi cảnh báo (nếu có).

### 4. Dành cho Khách hàng (Customer Mobile App - `fe_customers`)
- Đăng ký tài khoản tự động và bảo mật thông qua thao tác quét CCCD mặt trước/mặt sau (eKYC).
- Theo dõi trạng thái vé, các chương trình khuyến mãi và kiểm tra số dư.
- Tự động chuyển đổi các trạng thái kết nối mạng (Network Change Detection).
- Hiển thị QR Code vé điện tử để hành khách quét khi qua các cổng trạm BRT.

### 5. Hệ thống Backend (Core API & AI - `be`)
- Cung cấp RESTful API mạnh mẽ, chịu tải tốt cho các nghiệp vụ Check-in / Check-out cường độ cao.
- Hệ thống quản lý vé hai lớp (Two-tier "Order-to-Item" architecture).
- Xử lý xác thực eKYC, phân tích hình ảnh quét CCCD/QR qua các Python Scripts.
- Face Server: Server nhận diện khuôn mặt độc lập (MTCNN) hoạt động qua nền tảng PM2.

---

## 🛠 Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống:
- **Node.js**: Phiên bản 18.x hoặc 20.x
- **MySQL**: Phiên bản 8.0+
- **Python**: Có cài đặt các thư viện cần thiết cho việc quét QR và xử lý eKYC
- **PM2**: Dùng để chạy Face Server (`npm install -g pm2`)
- **Expo CLI**: Để chạy ứng dụng di động khách hàng (`npm install -g expo-cli`)

### 1. Khởi tạo Cơ sở dữ liệu (Database)
- Tạo một database mới trong MySQL (ví dụ: `hungyenbrt`).
- Import file SQL có sẵn trong thư mục `database/`:
  ```bash
  mysql -u root -p hungyenbrt < database/db_hungyenbrt.sql
  ```

### 2. Cấu hình và chạy Backend (`be`)
1. Mở terminal, di chuyển vào thư mục `be/`:
   ```bash
   cd be
   npm install
   ```
2. Cấu hình file biến môi trường `.env` theo cấu hình của máy (chỉnh sửa user, password db...).
3. Chạy server:
   ```bash
   npm start
   ```
   *Mặc định backend sẽ chạy ở cổng `http://localhost:3000`.*

4. **Khởi động Face Server:** Chạy file `start-face-server.bat` tại thư mục gốc của dự án để khởi động module nhận diện khuôn mặt. Lệnh sẽ dùng `pm2` để tự động phục hồi quá trình này.

### 3. Chạy trang Admin (`fe_admin`)
1. Mở terminal mới, di chuyển vào thư mục `fe_admin/`:
   ```bash
   cd fe_admin
   npm install
   ```
2. Chạy ứng dụng:
   ```bash
   npm start
   ```
   *Ứng dụng chạy tại: `http://localhost:3001`*

### 4. Chạy trang Cổng kiểm soát (`fe_gates`)
1. Mở terminal mới, di chuyển vào thư mục `fe_gates/`:
   ```bash
   cd fe_gates
   npm install
   ```
2. Chạy ứng dụng:
   ```bash
   npm start
   ```
   *Ứng dụng chạy tại: `http://localhost:3002`*

### 5. Chạy trang Nhân viên POS (`fe_staffs`)
1. Mở terminal mới, di chuyển vào thư mục `fe_staffs/`:
   ```bash
   cd fe_staffs
   npm install
   ```
2. Chạy ứng dụng:
   ```bash
   npm start
   ```
   *Ứng dụng chạy tại: `http://localhost:3003`*

### 6. Chạy ứng dụng Khách hàng (`fe_customers`)
1. Mở terminal mới, di chuyển vào thư mục `fe_customers/`:
   ```bash
   cd fe_customers
   npm install
   ```
2. Chạy ứng dụng bằng Expo:
   ```bash
   npm start
   ```
3. Mở ứng dụng **Expo Go** trên điện thoại (hoặc dùng Android Emulator / iOS Simulator) và quét mã QR hiện ra trên terminal để tải app.

---
**⚠️ Lưu ý Quá Trình Chạy**: 
Hãy đảm bảo **Backend** và **Face Server** đã khởi động thành công và kết nối Database ổn định trước khi thao tác trên các giao diện Frontend hoặc Mobile App để các tính năng như gọi API, quét mã CCCD, eKYC và nhận diện khuôn mặt hoạt động bình thường.
