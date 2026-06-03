const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const db = require('../models');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'ticket_qr_secret_key';
const FACE_SERVER_URL = process.env.FACE_SERVER_URL || 'http://localhost:5001';

class TicketScanService {
    // ─── Tạo QR payload (JWT ngắn hạn luân phiên 10 giây) ────────────────────
    generateQrPayload(ticketId) {
        const window = Math.floor(Date.now() / 10000); // Đổi mỗi 10 giây
        const token = jwt.sign({ ticketId, window }, JWT_SECRET, { expiresIn: '30s' });
        return { token, window, expiresIn: 10 };
    }

    // ─── Xác thực khuôn mặt qua Face Server (HTTP) ───────────────────────
    async _verifyFaceMTCNN(avatarPath, capturedPath) {
        const absoluteAvatar = path.resolve(path.join(__dirname, '../', avatarPath.replace(/^\//, '')));
        const absoluteCaptured = path.resolve(path.join(__dirname, '../', capturedPath.replace(/^\//, '')));

        const form = new FormData();
        form.append('avatar_path', absoluteAvatar);
        form.append('camera_file', fs.createReadStream(absoluteCaptured), {
            filename: 'camera.jpg',
            contentType: 'image/jpeg'
        });

        const res = await fetch(`${FACE_SERVER_URL}/verify`, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        return await res.json();
    }

    // ─── Xử lý quét vé chính ─────────────────────────────────────────────────
    async scanTicket(qrToken, locationId, faceImagePath = null, direction = 'ENTRY') {
        let ticketIdToScan = null;

        // 1. Giải mã token (Hỗ trợ JWT động từ App và UUID tĩnh trên vé giấy)
        try {
            const decoded = jwt.verify(qrToken, JWT_SECRET);
            const currentWindow = Math.floor(Date.now() / 10000);
            if (Math.abs(currentWindow - decoded.window) > 1) {
                return { success: false, code: 'QR_EXPIRED', message: 'Mã QR trên điện thoại đã quá hạn 10s. Vui lòng làm mới.' };
            }
            ticketIdToScan = decoded.ticketId;
        } catch (e) {
            // Nếu không phải JWT thì giả định đây là UUID tĩnh in trên vé giấy POS
            ticketIdToScan = qrToken;
        }

        // 2. Tải vé từ bảng ticket_details (vì qr_code lưu ID của ticket_details)
        const ticketDetail = await db.ticket_details.findByPk(ticketIdToScan, {
            include: [
                { model: db.ticket_types, as: 'ticket_type' },
                { model: db.tickets, as: 'order', include: [{ model: db.users, as: 'user' }] },
                { model: db.locations, as: 'fromLocation' },
                { model: db.locations, as: 'toLocation' }
            ]
        });

        if (!ticketDetail) {
            return { success: false, code: 'NOT_FOUND', message: 'Không tìm thấy vé trong hệ thống.' };
        }

        const ticketType = ticketDetail.ticket_type;
        const user = ticketDetail.order?.user;
        const scanLoc = await db.locations.findByPk(locationId);

        if (!scanLoc) {
            return { success: false, code: 'INVALID_LOCATION', message: 'Trạm quét không hợp lệ.' };
        }

        // --- A. KIỂM TRA VÉ LƯỢT (TRIP) ---
        if (ticketType && ticketType.Id_Category === 1) {
            if (!ticketDetail.fromLocation || !ticketDetail.toLocation) {
                return { success: false, code: 'INVALID_STATION_DATA', message: 'Vé lượt nhưng bị thiếu thông tin trạm khứ hồi.' };
            }

            // Thuật toán kiểm tra Biên (Boundary) dựa trên order_index
            const fromOrder = ticketDetail.fromLocation.order_index;
            const toOrder = ticketDetail.toLocation.order_index;
            const scanOrder = scanLoc.order_index;

            const minOrder = Math.min(fromOrder, toOrder);
            const maxOrder = Math.max(fromOrder, toOrder);

            if (scanOrder < minOrder || scanOrder > maxOrder) {
                return {
                    success: false,
                    code: 'WRONG_STATION',
                    message: `Sai trạm! Vé này chỉ hợp lệ để lên/xuống tại các tuyến nằm từ "${ticketDetail.fromLocation.Name}" đến ${ticketDetail.toLocation.Name}.`
                };
            }

            // Kiểm tra trạng thái lúc VÀO CỔNG
            if (direction === 'ENTRY') {
                if (ticketDetail.status === 'USED' || ticketDetail.status === 'ACTIVE') {
                    return { success: false, code: 'TICKET_EXHAUSTED', message: 'Vé lượt này đã được sử dụng vào ga trước đó.' };
                }
            }

            // Kiểm tra trạng thái lúc RA CỔNG
            if (direction === 'EXIT') {
                if (ticketDetail.status === 'UNUSED' || ticketDetail.status === 'ISSUED') {
                    return { success: false, code: 'NOT_ENTERED', message: 'Vé này chưa được quét ở cổng vào. Không thể ra bến.' };
                }
                if (ticketDetail.status === 'USED') {
                    return { success: false, code: 'ALREADY_EXITED', message: 'Vé này đã hoàn tất lộ trình và ra bến trước đó.' };
                }
            }

            // Đánh dấu vé: ENTRY -> ACTIVE, EXIT -> USED
            await ticketDetail.update({ status: direction === 'ENTRY' ? 'ACTIVE' : 'USED' });
            await db.ticket_logs.create({
                Id_Ticket: ticketDetail.Id,
                location_id: locationId,
                scan_direction: direction,
                status: 'valid',
                scan_time: new Date()
            });

            return {
                success: true,
                code: 'ROUTE_OK',
                message: direction === 'ENTRY' 
                    ? `✅ Hợp lệ! Cửa vào đã mở tại ga ${scanLoc.Name}.` 
                    : `✅ Hợp lệ! Cửa ra đã mở. Chúc bạn một ngày tốt lành.`,
                ticket: { id: ticketDetail.Id, type: 'TRIP' }
            };
        }

        // --- B. KIỂM TRA VÉ THỜI GIAN (TIME/PROMO) ---
        if (ticketType && (ticketType.Id_Category === 2 || ticketType.Id_Category === 3)) {
            const now = new Date();
            // Kích hoạt vé nếu chưa kích hoạt — set StartDate và EndDate
            if (ticketDetail.status === 'UNUSED' || ticketDetail.status === 'ISSUED') {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + (ticketType.Duration_Day || 30));
                await ticketDetail.update({ status: 'ACTIVE', StartDate: startDate, EndDate: endDate });
            }

            // Kiểm tra hạn sử dụng (EndDate)
            if (ticketDetail.EndDate && new Date() > new Date(ticketDetail.EndDate)) {
                if (ticketDetail.status !== 'EXPIRED') await ticketDetail.update({ status: 'EXPIRED' });
                return { success: false, code: 'TICKET_EXPIRED', message: 'Vé thời gian của bạn đã hết hạn sử dụng.' };
            }

            // Kiểm tra Cooldown 30s ở cổng vào
            if (direction === 'ENTRY') {
                const lastEntryLog = await db.ticket_logs.findOne({
                    where: {
                        Id_Ticket: ticketDetail.Id,
                        scan_direction: 'ENTRY',
                        status: 'valid'
                    },
                    order: [['scan_time', 'DESC']]
                });
                
                if (lastEntryLog) {
                    const diffSeconds = (new Date() - new Date(lastEntryLog.scan_time)) / 1000;
                    if (diffSeconds < 30) {
                        return { 
                            success: false, 
                            code: 'COOLDOWN_ACTIVE', 
                            message: 'Bạn đã vào, yêu cầu sau 30s sẽ được quét lại' 
                        };
                    }
                }
            }

            // Yêu cầu xác thực khuôn mặt (Chỉ yêu cầu khi đi VÀO CỔNG)
            if (ticketType.requiresFace && direction === 'ENTRY') {
                if (!faceImagePath) {
                    return {
                        success: false,
                        code: 'FACE_REQUIRED',
                        message: 'Vui lòng cung cấp khuôn mặt để soát vé Thời gian.',
                        avatarUrl: user?.avatar ? `http://localhost:3000${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}` : null,
                        userName: user?.name || null
                    };
                }

                if (!user || !user.avatar) {
                    return { success: false, code: 'NO_AVATAR', message: 'Hồ sơ người dùng chưa đăng ký khuôn mặt để đối chiếu eKYC.' };
                }

                let faceResult;
                try {
                    faceResult = await this._verifyFaceMTCNN(user.avatar, faceImagePath);
                } catch (err) {
                    console.error('MTCNN face verify error:', err);
                    return { success: false, code: 'FACE_SERVICE_ERROR', message: 'Dịch vụ nhận diện khuôn mặt (MTCNN) đang bảo trì.' };
                }

                if (!faceResult.success) {
                    return { success: false, code: 'FACE_SERVICE_ERROR', message: faceResult.error || 'Lỗi MTCNN không xác định được.' };
                }

                if (!faceResult.match) {
                    return { 
                        success: false, 
                        code: 'FACE_MISMATCH', 
                        message: `❌ Khuôn mặt không khớp! (MTCNN Score: ${faceResult.distance?.toFixed(3)})`,
                        distance: faceResult.distance
                    };
                }
            }

            await db.ticket_logs.create({
                Id_Ticket: ticketDetail.Id,
                location_id: locationId,
                scan_direction: direction,
                status: 'valid',
                scan_time: new Date()
            });

            return {
                success: true,
                code: 'TIME_OK',
                message: direction === 'ENTRY' 
                            ? `✅ Khuôn mặt khớp 100%! Chào ${user?.name || 'bạn'}. Vé thời gian hợp lệ toàn tuyến.`
                            : `✅ Vé thời gian hợp lệ. Xin mời ra khỏi ga.`,
                ticket: { id: ticketDetail.Id, type: 'TIME' }
            };
        }

        return { success: false, code: 'UNKNOWN', message: 'Không thể xử lý định dạng vé này.' };
    }

    // ─── Tra cứu thông tin vé (Dành cho chức năng kiểm tra của Nhân viên) ──────
    async lookupTicket(qrToken) {
        let ticketIdToScan = null;
        try {
            const decoded = jwt.verify(qrToken, JWT_SECRET);
            ticketIdToScan = decoded.ticketId;
        } catch (e) {
            ticketIdToScan = qrToken;
        }

        const ticketDetail = await db.ticket_details.findByPk(ticketIdToScan, {
            include: [
                { model: db.ticket_types, as: 'ticket_type' },
                { 
                    model: db.tickets, 
                    as: 'order', 
                    include: [
                        { model: db.users, as: 'user' },
                        { model: db.payment_methods, as: 'payment_method' }
                    ] 
                },
                { model: db.locations, as: 'fromLocation' },
                { model: db.locations, as: 'toLocation' }
            ]
        });

        if (!ticketDetail) {
            return { success: false, code: 'NOT_FOUND', message: 'Không tìm thấy vé trong hệ thống.' };
        }

        const ticketType = ticketDetail.ticket_type;
        const user = ticketDetail.order?.user;
        const isTripTicket = ticketType && ticketType.Id_Category === 1;

        return {
            success: true,
            data: {
                id: ticketDetail.Id,
                type: isTripTicket ? 'single' : 'monthly',
                status: ticketDetail.status.toLowerCase(), // 'unused', 'active', 'used', 'expired', 'issued'
                packageName: ticketType?.Name || 'Vé lộ trình',
                departure: ticketDetail.fromLocation?.Name || 'Bất kỳ',
                destination: ticketDetail.toLocation?.Name || 'Bất kỳ',
                price: ticketDetail.price,
                paymentMethod: ticketDetail.order?.payment_method?.Name || 'Không xác định',
                purchaseDate: ticketDetail.createdAt,
                expiryDate: ticketDetail.EndDate || null,
                customer: user ? {
                    cccd: user.cccd_number,
                    fullName: user.name,
                    dob: user.dob,
                    gender: user.gender,
                    phone: user.phone,
                    email: user.email,
                    address: user.address,
                    avatar: user.avatar
                } : null
            }
        };
    }

    // ─── Danh sách tất cả vé (Dành cho chức năng Tra cứu của Nhân viên) ──────
    async getAllTickets() {
        const tickets = await db.ticket_details.findAll({
            include: [
                { model: db.ticket_types, as: 'ticket_type' },
                { 
                    model: db.tickets, 
                    as: 'order', 
                    include: [
                        { model: db.users, as: 'user' },
                        { model: db.payment_methods, as: 'payment_method' }
                    ] 
                },
                { model: db.locations, as: 'fromLocation' },
                { model: db.locations, as: 'toLocation' }
            ],
            order: [['createdAt', 'DESC']],
            limit: 500 // Limit to avoid heavy payload
        });

        return tickets.map(ticketDetail => {
            const ticketType = ticketDetail.ticket_type;
            const user = ticketDetail.order?.user;
            const isTripTicket = ticketType && ticketType.Id_Category === 1;

            return {
                id: ticketDetail.Id,
                code: ticketDetail.Id.split('-')[0].toUpperCase(), // Short visual code
                type: isTripTicket ? 'single' : 'monthly',
                status: ticketDetail.status.toLowerCase(),
                packageName: ticketType?.Name || 'Vé lộ trình',
                departure: ticketDetail.fromLocation?.Name || 'Bất kỳ',
                destination: ticketDetail.toLocation?.Name || 'Bất kỳ',
                price: ticketDetail.price,
                paymentMethod: ticketDetail.order?.payment_method?.Name || 'Không xác định',
                purchaseDate: ticketDetail.createdAt,
                expiryDate: ticketDetail.EndDate || null,
                customer: user ? {
                    cccd: user.cccd_number,
                    fullName: user.name,
                    dob: user.dob,
                    gender: user.gender,
                    phone: user.phone,
                    email: user.email,
                    address: user.address,
                    avatar: user.avatar
                } : null
            };
        });
    }

    // ─── Bổ sung vé (Restock / Adjustment) ──────────────────────────────────
    // Logic mới: Tự tính giá dựa trên bảng ticket_prices (từ trạm đầu → trạm xuống thực tế)
    // Surcharge = giá_mới - giá_đã_trả. Cập nhật ticket_details.price = giá_mới.
    async processRestock(ticketId, newLocationId, employeeId, paymentMethodId) {
        const ticketDetail = await db.ticket_details.findByPk(ticketId, {
            include: [
                { model: db.ticket_types, as: 'ticket_type' },
                { model: db.tickets, as: 'order' },
                { model: db.locations, as: 'fromLocation' },
                { model: db.locations, as: 'toLocation' }
            ]
        });

        if (!ticketDetail) {
            return { success: false, message: 'Không tìm thấy vé trong hệ thống.' };
        }

        const fromLocationId = ticketDetail.From_Location;
        const paidPrice = parseFloat(ticketDetail.price) || 0;

        // ── Tra bảng ticket_prices để lấy giá chính xác (từ trạm đầu → trạm xuống mới) ──
        let newPrice = paidPrice; // mặc định nếu không tìm thấy bảng giá
        const priceRecord = await db.ticket_prices.findOne({
            where: {
                Id_Ticket_Type: ticketDetail.Id_Ticket_Type,
                From_Location_Id: fromLocationId,
                To_Location_Id: newLocationId,
                is_active: true
            }
        });

        if (!priceRecord) {
            // Thử tra chiều ngược lại (đối xứng)
            const reversePriceRecord = await db.ticket_prices.findOne({
                where: {
                    Id_Ticket_Type: ticketDetail.Id_Ticket_Type,
                    From_Location_Id: newLocationId,
                    To_Location_Id: fromLocationId,
                    is_active: true
                }
            });
            if (reversePriceRecord) {
                newPrice = parseFloat(reversePriceRecord.Price);
            }
            // Nếu không có bảng giá nào khớp, vẫn cho phép cập nhật với giá cũ (không thu thêm)
        } else {
            newPrice = parseFloat(priceRecord.Price);
        }

        const surchargeAmount = Math.max(0, newPrice - paidPrice);

        // ── Thực hiện transaction ────────────────────────────────────────────
        const transaction = await db.sequelize.transaction();
        try {
            // 1. Cập nhật ga đến mới + giá mới + reset qr_token
            await ticketDetail.update({
                To_Location: newLocationId,
                price: newPrice,
                qr_token: require('crypto').randomUUID()
            }, { transaction });

            // 2. Ghi nhận hóa đơn phụ phí (chỉ nếu có thu thêm tiền)
            if (surchargeAmount > 0) {
                await db.tickets.create({
                    Id_User: ticketDetail.order?.Id_User,
                    total_quantity: 1,
                    total_price: surchargeAmount,
                    id_employee: employeeId,
                    id_payment_method: paymentMethodId || 1,
                    status: 'COMPLETED',
                    PaymentNote: `Phụ phí bổ sung vé ${ticketDetail.Id.split('-')[0].toUpperCase()} | Ga mới: ID ${newLocationId}`
                }, { transaction });
            }

            // 3. Ghi ticket_log
            await db.ticket_logs.create({
                Id_Ticket: ticketId,
                location_id: newLocationId,
                scan_direction: 'RESTOCK',
                status: 'valid',
                scan_time: new Date()
            }, { transaction });

            await transaction.commit();

            // Reload để lấy thông tin mới nhất
            await ticketDetail.reload();

            return {
                success: true,
                message: 'Bổ sung vé thành công!',
                new_qr_token: ticketDetail.qr_token,
                new_price: newPrice,
                surcharge_amount: surchargeAmount,
                paid_price: paidPrice
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new TicketScanService();

