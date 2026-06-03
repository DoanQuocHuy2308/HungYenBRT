-- =============================================================
-- SEED DATA - HungYen BRT System
-- Chạy file này trong MySQL để chèn dữ liệu mẫu
-- Lưu ý: Chạy theo thứ tự (phụ thuộc FK)
-- =============================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!50503 SET NAMES utf8mb4 */;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- 1. LOCATIONS — Các xã/thị trấn dọc tuyến BRT Hưng Yên
-- =============================================================
TRUNCATE TABLE locations;

INSERT INTO locations (station_code, name, description, latitude, longitude, order_index, created_at) VALUES
('HY-01', 'Phố Hiến',           'Bến xe trung tâm TP Hưng Yên',           20.64610000, 106.05120000,  1, NOW()),
('HY-02', 'Lam Sơn',            'Xã Lam Sơn, TP Hưng Yên',                20.65120000, 106.04830000,  2, NOW()),
('HY-03', 'Hồng Nam',           'Xã Hồng Nam, TP Hưng Yên',               20.65900000, 106.04400000,  3, NOW()),
('HY-04', 'Trung Nghĩa',        'Xã Trung Nghĩa, TP Hưng Yên',            20.66470000, 106.04100000,  4, NOW()),
('HY-05', 'Hiến Nam',           'Xã Hiến Nam, TP Hưng Yên',               20.67050000, 106.03780000,  5, NOW()),
('HY-06', 'An Tảo',             'Phường An Tảo, TP Hưng Yên',             20.67630000, 106.03540000,  6, NOW()),
('HY-07', 'Quảng Châu',         'Xã Quảng Châu, TP Hưng Yên',             20.68210000, 106.03200000,  7, NOW()),
('HY-08', 'Bảo Khê',            'Xã Bảo Khê, TP Hưng Yên',               20.68880000, 106.02850000,  8, NOW()),
('HY-09', 'Phú Cường',          'Xã Phú Cường, huyện Kim Động',           20.69500000, 106.02500000,  9, NOW()),
('HY-10', 'Song Vân',           'Xã Song Vân, huyện Kim Động',            20.70120000, 106.02150000, 10, NOW()),
('HY-11', 'Đồng Thanh',         'Xã Đồng Thanh, huyện Kim Động',          20.70750000, 106.01800000, 11, NOW()),
('HY-12', 'Hùng An',            'Xã Hùng An, huyện Kim Động',             20.71380000, 106.01440000, 12, NOW()),
('HY-13', 'Ngọc Thanh',         'Xã Ngọc Thanh, huyện Kim Động',          20.72010000, 106.01080000, 13, NOW()),
('HY-14', 'Vĩnh Xá',            'Xã Vĩnh Xá, huyện Kim Động',             20.72640000, 106.00720000, 14, NOW()),
('HY-15', 'Đình Cao',           'Xã Đình Cao, huyện Phù Cừ',              20.73270000, 106.00360000, 15, NOW()),
('HY-16', 'Tam Đa',             'Xã Tam Đa, huyện Phù Cừ',                20.73900000, 106.00000000, 16, NOW()),
('HY-17', 'Tiên Tiến',          'Xã Tiên Tiến, huyện Phù Cừ',             20.74530000, 105.99640000, 17, NOW()),
('HY-18', 'Quang Hưng',         'Xã Quang Hưng, huyện Phù Cừ',           20.75160000, 105.99280000, 18, NOW()),
('HY-19', 'Minh Tiến',          'Xã Minh Tiến, huyện Phù Cừ',             20.75790000, 105.98920000, 19, NOW()),
('HY-20', 'Nhật Quang',         'Xã Nhật Quang, huyện Phù Cừ',            20.76420000, 105.98560000, 20, NOW()),
('HY-21', 'Nguyên Hòa',         'Xã Nguyên Hòa, huyện Phù Cừ',           20.77050000, 105.98200000, 21, NOW()),
('HY-22', 'Tống Phan',          'Xã Tống Phan, huyện Phù Cừ',             20.77680000, 105.97840000, 22, NOW()),
('HY-23', 'Đoàn Đào',           'Xã Đoàn Đào, huyện Phù Cừ',             20.78310000, 105.97480000, 23, NOW()),
('HY-24', 'Phan Sào Nam',       'Xã Phan Sào Nam, huyện Phù Cừ',          20.78940000, 105.97120000, 24, NOW()),
('HY-25', 'Trung Dũng',         'Thị trấn Trung Dũng, huyện Phù Cừ',      20.79570000, 105.96760000, 25, NOW()),
('HY-26', 'Dị Chế',             'Xã Dị Chế, huyện Tiên Lữ',               20.80200000, 105.96400000, 26, NOW()),
('HY-27', 'Lệ Xá',              'Xã Lệ Xá, huyện Tiên Lữ',                20.80830000, 105.96040000, 27, NOW()),
('HY-28', 'An Viên',            'Xã An Viên, huyện Tiên Lữ',              20.81460000, 105.95680000, 28, NOW()),
('HY-29', 'Hải Triều',          'Xã Hải Triều, huyện Tiên Lữ',            20.82090000, 105.95320000, 29, NOW()),
('HY-30', 'Bến Trại',           'Bến xe cuối tuyến - huyện Tiên Lữ',       20.82720000, 105.94960000, 30, NOW());

-- =============================================================
-- 2. TICKET_CATEGORIES — 3 danh mục cố định
-- =============================================================
TRUNCATE TABLE ticket_categories;

INSERT INTO ticket_categories (id, code, name, description, requires_route, requires_kyc_default, sort_order, is_active) VALUES
(1, 'TRIP',  'Vé Lượt',      'Vé đi theo chặng, chọn điểm lên và điểm xuống.',            1, 0, 1, 1),
(2, 'TIME',  'Vé Thời Gian', 'Vé toàn tuyến theo thời hạn, yêu cầu xác thực khuôn mặt.', 0, 1, 2, 1),
(3, 'PROMO', 'Vé Ưu Đãi',   'Vé dành cho đối tượng được ưu đãi (học sinh, NCT, NKT...).',  0, 1, 3, 1);

-- =============================================================
-- 3. DISCOUNT_TYPES — Loại ưu đãi
-- =============================================================
TRUNCATE TABLE discount_types;

INSERT INTO discount_types (Id, Name, Description, DiscountPercentage, is_free, max_discount_value, requires_document, sort_order) VALUES
(1, 'Học sinh',              'Dành cho học sinh THCS và THPT có thẻ học sinh hợp lệ.',       50,  0, NULL,   1, 1),
(2, 'Sinh viên',             'Dành cho sinh viên đại học, cao đẳng có thẻ sinh viên.',        50,  0, NULL,   1, 2),
(3, 'Người cao tuổi',        'Dành cho người từ 60 tuổi trở lên (có CCCD xác nhận).',        100, 1, NULL,   1, 3),
(4, 'Người khuyết tật',      'Dành cho người khuyết tật có giấy xác nhận của cơ quan.',      100, 1, NULL,   1, 4),
(5, 'Thương binh/Bệnh binh', 'Dành cho thương binh, bệnh binh có giấy tờ xác nhận.',         100, 1, NULL,   1, 5),
(6, 'Gia đình chính sách',   'Dành cho gia đình có công với cách mạng (có giấy xác nhận).',  100, 1, NULL,   1, 6),
(7, 'Trẻ em dưới 6 tuổi',   'Miễn phí cho trẻ em dưới 6 tuổi.',                             100, 1, NULL,   0, 7),
(8, 'Người dân tộc thiểu số','Dành cho người dân tộc thiểu số có xác nhận địa phương.',       50,  0, 15000, 1, 8),
(9, 'Công nhân KCN',         'Dành cho công nhân các khu công nghiệp trên địa bàn.',          30,  0, 10000, 1, 9),
(10,'Nhân viên y tế',        'Ưu đãi cho y bác sĩ, điều dưỡng viên công tác tại tỉnh.',     30,  0, 10000, 1, 10);

-- =============================================================
-- 4. DISCOUNT_FIELDS — Trường thông tin yêu cầu khi đăng ký
-- =============================================================
TRUNCATE TABLE discount_fields;

INSERT INTO discount_fields (id_Discount_Type, field_Name, field_Type, is_Required) VALUES
-- Học sinh (1)
(1, 'Họ và tên',          'text',  1),
(1, 'Trường đang học',    'text',  1),
(1, 'Ảnh thẻ học sinh',  'image', 1),
-- Sinh viên (2)
(2, 'Họ và tên',          'text',  1),
(2, 'Trường/Khoa',        'text',  1),
(2, 'Mã số sinh viên',   'text',  1),
(2, 'Ảnh thẻ sinh viên', 'image', 1),
-- Người cao tuổi (3)
(3, 'Họ và tên',          'text',  1),
(3, 'Năm sinh',           'text',  1),
(3, 'Ảnh CCCD mặt trước','image', 1),
-- Người khuyết tật (4)
(4, 'Họ và tên',          'text',  1),
(4, 'Loại khuyết tật',    'text',  1),
(4, 'Ảnh giấy xác nhận', 'image', 1),
-- Thương binh (5)
(5, 'Họ và tên',          'text',  1),
(5, 'Số thẻ thương binh', 'text',  1),
(5, 'Ảnh thẻ thương binh','image', 1),
-- Gia đình chính sách (6)
(6, 'Họ và tên',          'text',  1),
(6, 'Giấy xác nhận số',  'text',  0),
(6, 'Ảnh giấy xác nhận', 'image', 1),
-- Dân tộc thiểu số (8)
(8, 'Họ và tên',          'text',  1),
(8, 'Dân tộc',            'text',  1);

-- =============================================================
-- 5. TICKET_TYPES — Loại vé
-- =============================================================
TRUNCATE TABLE ticket_types;

INSERT INTO ticket_types (id_category, id_discount_type, name, description, duration_day, requiresFace, is_active) VALUES
-- TRIP (id_category=1) — không cần mặt, 1 ngày
(1, NULL, 'Vé lượt thường',        'Vé đi lại một chặng theo tuyến BRT.',                     1,  0, 1),
(1, NULL, 'Vé lượt khứ hồi',       'Vé đi và về trong ngày trên cùng tuyến.',                 1,  0, 1),
-- TIME (id_category=2) — cần mặt, nhiều thời hạn
(2, NULL, 'Vé ngày',               'Đi không giới hạn chuyến trong 1 ngày.',                  1,  0, 1),
(2, NULL, 'Vé tuần',               'Đi không giới hạn chuyến trong 7 ngày.',                  7,  1, 1),
(2, NULL, 'Vé tháng',              'Đi không giới hạn chuyến trong 30 ngày.',                30,  1, 1),
(2, NULL, 'Vé quý',                'Đi không giới hạn chuyến trong 90 ngày.',                90,  1, 1),
(2, NULL, 'Vé 6 tháng',            'Đi không giới hạn chuyến trong 180 ngày.',              180,  1, 1),
(2, NULL, 'Vé năm',                'Đi không giới hạn chuyến trong 365 ngày.',              365,  1, 1),
-- PROMO (id_category=3) — cần mặt, gắn với discount_type
(3, 1,    'Vé tháng học sinh',      'Vé tháng giảm 50% dành cho học sinh THCS/THPT.',          30, 1, 1),
(3, 2,    'Vé tháng sinh viên',     'Vé tháng giảm 50% dành cho sinh viên.',                   30, 1, 1),
(3, 3,    'Vé tháng NCT',          'Vé tháng miễn phí dành cho người cao tuổi (≥60 tuổi).',   30, 1, 1),
(3, 4,    'Vé tháng NKT',          'Vé tháng miễn phí dành cho người khuyết tật.',             30, 1, 1),
(3, 5,    'Vé tháng thương binh',  'Vé tháng miễn phí dành cho thương binh, bệnh binh.',       30, 1, 1),
(3, 6,    'Vé tháng gia đình CS',  'Vé tháng miễn phí cho gia đình có công.',                  30, 1, 1),
(3, 7,    'Vé trẻ em',             'Miễn phí cho trẻ em dưới 6 tuổi.',                          1, 0, 1),
(3, 8,    'Vé tháng DTTS',         'Vé tháng giảm 50% cho người dân tộc thiểu số.',             30, 1, 1),
(3, 9,    'Vé tháng công nhân KCN','Vé tháng giảm 30% cho công nhân khu công nghiệp.',          30, 1, 1),
(3, 10,   'Vé tháng nhân viên y tế','Vé tháng giảm 30% cho nhân viên y tế.',                   30, 1, 1),
(2, NULL, 'Vé 3 ngày',             'Đi không giới hạn chuyến trong 3 ngày.',                   3, 0, 1),
(2, NULL, 'Vé 2 tuần',             'Đi không giới hạn chuyến trong 14 ngày.',                 14, 1, 1);

-- =============================================================
-- 6. TICKET_PRICES — Bảng giá vé
-- =============================================================
TRUNCATE TABLE ticket_prices;

-- Giá vé lượt (ticket_type_id=1): phân theo số chặng (khoảng cách)
-- Công thức: 2,000đ/chặng, tối thiểu 5,000đ
INSERT INTO ticket_prices (Id_Ticket_Type, From_Location_Id, To_Location_Id, Price, is_active) VALUES
-- Các cặp ngắn (1-5 chặng): 5,000đ
(1,  1,  2, 5000.00, 1),(1,  2,  3, 5000.00, 1),(1,  3,  4, 5000.00, 1),
(1,  4,  5, 5000.00, 1),(1,  5,  6, 5000.00, 1),(1,  1,  3, 5000.00, 1),
(1,  2,  4, 5000.00, 1),(1,  3,  5, 5000.00, 1),(1,  1,  5, 7000.00, 1),
(1,  2,  6, 7000.00, 1),(1,  3,  7, 7000.00, 1),(1,  4,  8, 7000.00, 1),
(1,  1, 10, 9000.00, 1),(1,  1, 15,12000.00, 1),(1,  1, 20,15000.00, 1),
(1,  1, 25,18000.00, 1),(1,  1, 30,20000.00, 1),(1, 15, 30,12000.00, 1),
(1, 10, 20, 9000.00, 1),(1,  5, 15, 9000.00, 1),
-- Giá vé ngày (ticket_type_id=3): NULL = toàn tuyến, không phân chặng
(3, NULL, NULL, 30000.00, 1),
-- Giá vé tuần (4)
(4, NULL, NULL, 100000.00, 1),
-- Giá vé tháng (5)
(5, NULL, NULL, 200000.00, 1),
-- Giá vé quý (6)
(6, NULL, NULL, 550000.00, 1),
-- Giá vé 6 tháng (7)
(7, NULL, NULL, 1000000.00, 1),
-- Giá vé năm (8)
(8, NULL, NULL, 1800000.00, 1),
-- Giá vé tháng học sinh (9) — giảm 50%
(9, NULL, NULL, 100000.00, 1),
-- Giá vé tháng sinh viên (10) — giảm 50%
(10, NULL, NULL, 100000.00, 1),
-- Giá vé tháng NCT (11) — miễn phí
(11, NULL, NULL, 0.00, 1),
-- Giá vé tháng NKT (12) — miễn phí
(12, NULL, NULL, 0.00, 1),
-- Giá vé tháng thương binh (13) — miễn phí
(13, NULL, NULL, 0.00, 1),
-- Giá vé tháng gia đình CS (14) — miễn phí
(14, NULL, NULL, 0.00, 1),
-- Giá vé trẻ em (15) — miễn phí
(15, NULL, NULL, 0.00, 1),
-- Giá vé tháng DTTS (16) — giảm 50%
(16, NULL, NULL, 100000.00, 1),
-- Giá vé tháng công nhân KCN (17) — giảm 30%
(17, NULL, NULL, 140000.00, 1),
-- Giá vé tháng nhân viên y tế (18) — giảm 30%
(18, NULL, NULL, 140000.00, 1),
-- Giá vé 3 ngày (19)
(19, NULL, NULL, 60000.00, 1),
-- Giá vé 2 tuần (20)
(20, NULL, NULL, 160000.00, 1);

-- =============================================================
-- 7. PAYMENT_METHODS — Phương thức thanh toán
-- =============================================================
TRUNCATE TABLE payment_methods;

INSERT INTO payment_methods (Code, Name, Description, IsActive, createdAt, updatedAt) VALUES
('CASH',         'Tiền mặt',                 'Thanh toán trực tiếp bằng tiền mặt tại quầy.',       1, NOW(), NOW()),
('ZALOPAY',      'ZaloPay',                  'Thanh toán qua ví điện tử ZaloPay (QR / App).',       1, NOW(), NOW()),
('BANK_TRANSFER','Chuyển khoản ngân hàng',   'Chuyển khoản qua tài khoản ngân hàng (VietQR).',     1, NOW(), NOW()),
('VIETQR',       'QR Code VietQR',           'Quét mã QR liên ngân hàng theo chuẩn VietQR.',        1, NOW(), NOW()),
('MOMO',         'Ví MoMo',                  'Thanh toán qua ví điện tử MoMo.',                     1, NOW(), NOW()),
('VNPAY',        'VNPay',                    'Thanh toán qua cổng VNPay.',                          1, NOW(), NOW()),
('CREDIT_CARD',  'Thẻ tín dụng/ghi nợ',     'Thanh toán bằng thẻ Visa, Mastercard, JCB...',        1, NOW(), NOW()),
('MCARD',        'Thẻ nội địa (ATM)',        'Thanh toán bằng thẻ ATM nội địa.',                    1, NOW(), NOW()),
('EWALLET',      'Ví điện tử khác',          'Các ví điện tử khác được chấp nhận.',                 0, NOW(), NOW()),
('VOUCHER',      'Voucher/Mã giảm giá',      'Thanh toán bằng mã voucher ưu đãi.',                  1, NOW(), NOW());

-- =============================================================
-- 8. PROMOTIONS — Mã khuyến mãi
-- =============================================================
TRUNCATE TABLE promotions;

INSERT INTO promotions (Code, Name, Description, DiscountAmount, DiscountPercent, StartDate, EndDate, isActive, ImageUrl, created_at) VALUES
('KHAIMA2025',   'Khai mạc tuyến BRT',       'Giảm 20% nhân dịp khai mạc tuyến BRT Hưng Yên.',            NULL,  20.00, '2025-01-01', '2025-03-31', 1, NULL, NOW()),
('CHAO2025',     'Chào năm mới 2025',         'Giảm 15,000đ cho mỗi vé mua trong tháng 1/2025.',     15000.00,   NULL, '2025-01-01', '2025-01-31', 1, NULL, NOW()),
('TETAM2025',    'Tết Ất Tỵ 2025',            'Giảm 25% toàn bộ vé dịp Tết Nguyên Đán.',                   NULL,  25.00, '2025-01-20', '2025-02-10', 1, NULL, NOW()),
('MUNG8_3',      'Ngày Quốc tế Phụ nữ',       'Giảm 30% cho khách hàng nữ ngày 8/3.',                       NULL,  30.00, '2025-03-08', '2025-03-08', 0, NULL, NOW()),
('GIAIPHONG30_4','Ngày 30/4 - 1/5',           'Giảm 20,000đ vé tháng nhân ngày nghỉ lễ.',            20000.00,   NULL, '2025-04-28', '2025-05-02', 0, NULL, NOW()),
('THIEUNHI1_6',  'Ngày Thiếu nhi 1/6',        'Miễn phí vé lượt cho trẻ em đi cùng người lớn.',        NULL,  100.00, '2025-06-01', '2025-06-01', 0, NULL, NOW()),
('HE2025',       'Hè vui cùng BRT',           'Giảm 10% vé tháng trong mùa hè (6-8/2025).',                 NULL,  10.00, '2025-06-01', '2025-08-31', 0, NULL, NOW()),
('QUOCKHANG2_9', 'Quốc khánh 2/9',            'Giảm 15% toàn bộ vé nhân ngày Quốc khánh.',                  NULL,  15.00, '2025-09-01', '2025-09-03', 0, NULL, NOW()),
('TEACHERSDAY',  'Ngày Nhà giáo 20/11',       'Giảm 20% cho giáo viên (xuất trình thẻ).',                   NULL,  20.00, '2025-11-18', '2025-11-22', 0, NULL, NOW()),
('XMAS2025',     'Giáng sinh 2025',            'Giảm 10,000đ mọi loại vé dịp Giáng sinh.',             10000.00,   NULL, '2025-12-24', '2025-12-26', 0, NULL, NOW()),
('HUNGYEN500',   'Hưng Yên 500 năm',          'Kỷ niệm 500 năm thành lập tỉnh Hưng Yên - Giảm 50%.',        NULL,  50.00, '2025-10-01', '2025-10-07', 0, NULL, NOW()),
('DOANTHANHNI',  'Tháng Thanh Niên',          'Ưu đãi 25% cho đoàn viên thanh niên tháng 3.',               NULL,  25.00, '2025-03-01', '2025-03-31', 0, NULL, NOW()),
('BVMT2025',     'Ngày Môi trường',            'Đi xe buýt bảo vệ môi trường - Giảm 20%.',                   NULL,  20.00, '2025-06-05', '2025-06-05', 0, NULL, NOW()),
('LANGSEN2025',  'Lễ hội Làng Sen',           'Giảm 15% nhân dịp Lễ hội Làng Sen.',                         NULL,  15.00, '2025-05-19', '2025-05-21', 0, NULL, NOW()),
('MUATHU2025',   'Mùa thu vàng',              'Giảm 10% vé trong tháng 9-10.',                               NULL,  10.00, '2025-09-01', '2025-10-31', 0, NULL, NOW()),
('WELCOME2026',  'Chào 2026',                 'Giảm 30% toàn bộ vé ngày đầu năm 2026.',                     NULL,  30.00, '2026-01-01', '2026-01-07', 1, NULL, NOW()),
('BRTFIRST',     'Khách hàng đầu tiên',       'Giảm 50% vé đầu tiên cho khách hàng mới đăng ký.',           NULL,  50.00, '2025-01-01', '2025-12-31', 1, NULL, NOW()),
('APP10K',       'Ưu đãi App BRT',            'Giảm 10,000đ khi thanh toán qua App lần đầu.',          10000.00,   NULL, '2025-01-01', '2025-12-31', 1, NULL, NOW()),
('DAILY5K',      'Giảm mỗi ngày',             'Giảm 5,000đ vé lượt khi mua trước 7h sáng.',             5000.00,   NULL, '2025-01-01', '2025-12-31', 1, NULL, NOW()),
('COMBO3THANG',  'Combo 3 tháng',             'Mua vé 3 tháng được tặng thêm 2 tuần.',                       NULL,   NULL, '2025-01-01', '2025-12-31', 1, NULL, NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- KIỂM TRA KẾT QUẢ
-- =============================================================
SELECT 'locations'       AS tbl, COUNT(*) AS so_ban_ghi FROM locations
UNION ALL
SELECT 'ticket_categories',     COUNT(*) FROM ticket_categories
UNION ALL
SELECT 'discount_types',        COUNT(*) FROM discount_types
UNION ALL
SELECT 'discount_fields',       COUNT(*) FROM discount_fields
UNION ALL
SELECT 'ticket_types',          COUNT(*) FROM ticket_types
UNION ALL
SELECT 'ticket_prices',         COUNT(*) FROM ticket_prices
UNION ALL
SELECT 'payment_methods',       COUNT(*) FROM payment_methods
UNION ALL
SELECT 'promotions',            COUNT(*) FROM promotions;
