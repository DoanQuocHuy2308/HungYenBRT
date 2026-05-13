const express     = require('express');
const router      = express.Router();
const zaloPaySvc  = require('../services/zaloPayService');
const ticketSvc   = require('../services/ticketService');

// ─── In-memory pending orders (production: nên dùng Redis) ───────────────────
const pendingOrders = new Map();

// Dọn đơn cũ > 30 phút
setInterval(() => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    for (const [k, v] of pendingOrders) if (v.createdAt < cutoff) pendingOrders.delete(k);
}, 5 * 60 * 1000);

// ─── POST /zalopay/create-order ───────────────────────────────────────────────
router.post('/create-order', express.json(), async (req, res) => {
    try {
        const { amount, orderId, description, ticketPayload, returnUrl } = req.body;
        if (amount === undefined || amount === null || !orderId)
            return res.status(400).json({ success: false, message: 'Thiếu amount hoặc orderId' });

        const callbackUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/zalopay/callback`;

        // ZaloPay (và các cổng thanh toán) không cho phép giao dịch 0 VND
        // Nếu amount = 0, chúng ta bỏ qua ZaloPay và tự tạo 1 đơn "ảo" auto-success.
        if (Number(amount) === 0) {
            const app_trans_id = `0VND_${Date.now()}_${orderId}`;
            pendingOrders.set(orderId, {
                ticketPayload,
                amount: 0,
                app_trans_id,
                status: 'PAID', // Cho pass luôn
                createdAt: Date.now(),
            });
            // Tự trigger webhook local luôn để hệ thống xuất vé
            setTimeout(async () => {
                 try {
                     const isTimeTicket = ticketPayload.userData !== undefined;
                     const ticket = isTimeTicket 
                        ? await ticketSvc.purchaseTimeTicket(ticketPayload)
                        : await ticketSvc.purchaseTicket({ ...ticketPayload, transaction_id: app_trans_id });
                     
                     // Update pending order with ticket result so polling can fetch it
                     const pending = pendingOrders.get(orderId);
                     if (pending) {
                         pendingOrders.set(orderId, { ...pending, ticketResult: ticket });
                     }
                 } catch (e) {
                     console.error('Lỗi khi tự động xử lý đơn 0đ:', e);
                 }
            }, 1000);

            return res.json({
                success: true,
                cashier_order_url: '',
                order_url: '',
                qr_code: '', // Đơn 0đ không cần QR
                app_trans_id,
                is_zero_amount: true
            });
        }

        const result = await zaloPaySvc.createOrder({
            amount:      Math.round(amount),
            orderId,
            description: description || 'Hung Yen BRT - Thanh toan ve',
            callbackUrl,
            redirectUrl: returnUrl || 'http://localhost:3003/zalopay/return',
        });

        if (result.return_code === 1) {
            // Lưu pending sau khi ZaloPay OK (không bị duplicate)
            pendingOrders.set(orderId, {
                ticketPayload,
                amount: Math.round(amount),
                app_trans_id: result.app_trans_id,
                status: 'PENDING',
                createdAt: Date.now(),
            });
            return res.json({
                success:           true,
                cashier_order_url: result.cashier_order_url,
                order_url:         result.order_url,
                qr_code:           result.qr_code,
                app_trans_id:      result.app_trans_id,
            });
        }

        const msg = result.sub_return_message || result.return_message || 'Không thể tạo đơn ZaloPay';
        console.warn(`[ZaloPay] create-order fail: rc=${result.return_code} sub=${result.sub_return_code} — ${msg}`);
        return res.status(400).json({ success: false, message: msg, code: result.return_code });
    } catch (err) {
        console.error('[ZaloPay] create-order error:', err.message);
        res.status(500).json({ success: false, message: 'Lỗi kết nối ZaloPay: ' + err.message });
    }
});

// ─── POST /zalopay/callback ──────────────────────────────────────────────────
// ZaloPay gọi vào đây để thông báo kết quả thanh toán (server-to-server)
router.post('/callback', express.json(), async (req, res) => {
    try {
        const { data, mac } = req.body;

        // 1. Xác thực MAC
        if (!zaloPaySvc.verifyCallback(data, mac)) {
            return res.json({ return_code: -1, return_message: 'mac invalid' });
        }

        // 2. Parse dữ liệu
        const parsed       = JSON.parse(data);
        const { app_trans_id } = parsed;
        // app_trans_id = "YYMMDD_ORDERID" — lấy phần sau dấu _ đầu tiên
        const orderId      = app_trans_id.substring(app_trans_id.indexOf('_') + 1);
        const pending      = pendingOrders.get(orderId);

        console.log(`[ZaloPay] callback received: ${app_trans_id} | orderId=${orderId} | found=${!!pending}`);

        // 3. Xuất vé nếu chưa xuất
        if (pending && pending.status !== 'PAID' && pending.ticketPayload) {
            try {
                const isTimeTicket = pending.ticketPayload.userData !== undefined;
                const ticket = isTimeTicket
                    ? await ticketSvc.purchaseTimeTicket(pending.ticketPayload)
                    : await ticketSvc.purchaseTicket({ ...pending.ticketPayload, transaction_id: app_trans_id });
                pendingOrders.set(orderId, {
                    ...pending,
                    status: 'PAID',
                    ticketResult: ticket,
                    paidAt: Date.now(),
                });
                console.log(`[ZaloPay] ✅ Ticket issued for order ${orderId}`);
            } catch (e) {
                console.error('[ZaloPay] ❌ Issue ticket error:', e.message);
            }
        }

        return res.json({ return_code: 1, return_message: 'success' });
    } catch (err) {
        console.error('[ZaloPay] callback error:', err.message);
        return res.json({ return_code: 0, return_message: err.message });
    }
});

// ─── POST /zalopay/verify-return ─────────────────────────────────────────────
// Frontend gọi sau khi ZaloPay redirect về, để xác minh checksum phía server
router.post('/verify-return', express.json(), async (req, res) => {
    try {
        const { status, apptransid, pmcid, bankcode, amount, discountamount, checksum, orderId } = req.body;

        // 1. Xác thực checksum (theo docs ZaloPay)
        const isValid = zaloPaySvc.verifyReturnChecksum({
            apptransid, pmcid, bankcode, amount, discountamount, status, checksum,
        });

        if (!isValid) {
            console.warn(`[ZaloPay] verify-return: invalid checksum for ${apptransid}`);
            return res.status(400).json({ success: false, message: 'Checksum không hợp lệ' });
        }

        // 2. Kiểm tra status (1 = thành công)
        if (String(status) !== '1') {
            return res.json({ success: false, message: 'Thanh toán bị huỷ hoặc thất bại', status: 'CANCELLED' });
        }

        // 3. Lấy pending order
        const pending = pendingOrders.get(orderId);

        // Nếu callback đã xử lý trước → trả về kết quả ngay
        if (pending && pending.status === 'PAID') {
            return res.json({ success: true, status: 'PAID', ticket: pending.ticketResult });
        }

        // 4. Callback chưa kịp tới → tự xuất vé
        if (pending && pending.ticketPayload) {
            try {
                const ticket = await ticketSvc.purchaseTicket({
                    ...pending.ticketPayload,
                    transaction_id: apptransid,
                });
                pendingOrders.set(orderId, {
                    ...pending,
                    status: 'PAID',
                    ticketResult: ticket,
                    paidAt: Date.now(),
                });
                return res.json({ success: true, status: 'PAID', ticket });
            } catch (e) {
                console.error('[ZaloPay] verify-return issue ticket error:', e.message);
                return res.status(500).json({ success: false, message: 'Xác minh OK nhưng lỗi khi xuất vé: ' + e.message });
            }
        }

        // 5. Không tìm thấy pending → query ZaloPay để xác nhận lần cuối
        const queryResult = await zaloPaySvc.queryOrder(apptransid);
        if (queryResult.return_code === 1) {
            return res.json({ success: true, status: 'PAID', ticket: null, note: 'Verified via query, no payload found' });
        }

        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    } catch (err) {
        console.error('[ZaloPay] verify-return error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET /zalopay/query/:orderId ──────────────────────────────────────────────
// Polling trạng thái — frontend gọi mỗi 3 giây
router.get('/query/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const pending = pendingOrders.get(orderId);

        if (!pending) {
            console.warn(`[ZaloPay] query: orderId=${orderId} NOT FOUND in pendingOrders`);
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Đã PAID (do callback hoặc lần poll trước)
        if (pending.status === 'PAID')
            return res.json({ success: true, status: 'PAID', ticket: pending.ticketResult });

        if (!pending.app_trans_id)
            return res.json({ success: true, status: 'PENDING' });

        // Hỏi trực tiếp ZaloPay
        console.log(`[ZaloPay] query: checking ${pending.app_trans_id}`);
        const result = await zaloPaySvc.queryOrder(pending.app_trans_id);
        console.log(`[ZaloPay] query result: rc=${result.return_code} sub=${result.sub_return_code}`);

        if (result.return_code === 1 && pending.status !== 'PAID' && pending.ticketPayload) {
            try {
                const isTimeTicket = pending.ticketPayload.userData !== undefined;
                const ticket = isTimeTicket
                    ? await ticketSvc.purchaseTimeTicket(pending.ticketPayload)
                    : await ticketSvc.purchaseTicket({ ...pending.ticketPayload, transaction_id: pending.app_trans_id });
                pendingOrders.set(orderId, { ...pending, status: 'PAID', ticketResult: ticket, paidAt: Date.now() });
                console.log(`[ZaloPay] ✅ Ticket issued via polling for order ${orderId}`);
                return res.json({ success: true, status: 'PAID', ticket });
            } catch (e) {
                console.error(`[ZaloPay] ❌ Issue ticket error (polling):`, e.message);
                return res.status(500).json({ success: false, message: 'Thanh toán OK nhưng lỗi xuất vé: ' + e.message });
            }
        }

        return res.json({
            success: true,
            status: result.return_code === 1 ? 'PAID' : result.return_code === 3 ? 'PENDING' : 'FAILED',
            zalopay_rc: result.return_code,
        });
    } catch (err) {
        console.error('[ZaloPay] query error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
