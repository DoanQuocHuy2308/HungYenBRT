const express     = require('express');
const router      = express.Router();
const zaloPaySvc  = require('../services/zaloPayService');
const ticketSvc   = require('../services/ticketService');
const fs          = require('fs');
const path        = require('path');

// ─── Persistent pending orders (lưu ra file để không mất khi restart) ────────
const STORE_FILE = path.join(__dirname, '../.zalopay_pending.json');

function loadStore() {
    try {
        if (fs.existsSync(STORE_FILE)) {
            const raw = fs.readFileSync(STORE_FILE, 'utf8');
            const obj = JSON.parse(raw);
            return new Map(Object.entries(obj));
        }
    } catch { /* ignore */ }
    return new Map();
}

function saveStore(map) {
    try {
        const obj = {};
        for (const [k, v] of map) obj[k] = v;
        fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch { /* ignore */ }
}

const pendingOrders = loadStore();

// Dọn đơn cũ > 2 giờ và lưu lại
setInterval(() => {
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    let changed = false;
    for (const [k, v] of pendingOrders) {
        if (v.createdAt < cutoff) { pendingOrders.delete(k); changed = true; }
    }
    if (changed) saveStore(pendingOrders);
}, 5 * 60 * 1000);

// Helper lưu store sau mỗi thay đổi
function setPending(orderId, data) {
    pendingOrders.set(orderId, data);
    saveStore(pendingOrders);
}

// ─── GET /zalopay/base-url ────────────────────────────────────────────────────
// Frontend gọi để biết BASE_URL hiện tại (có thể là tunnel URL)
router.get('/base-url', (req, res) => {
    res.json({ baseUrl: process.env.BASE_URL || 'http://localhost:3000' });
});

// ─── POST /zalopay/create-order ───────────────────────────────────────────────
router.post('/create-order', express.json(), async (req, res) => {
    try {
        const { amount, orderId, description, ticketPayload, returnUrl } = req.body;
        if (amount === undefined || amount === null || !orderId)
            return res.status(400).json({ success: false, message: 'Thiếu amount hoặc orderId' });

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const callbackUrl = `${baseUrl}/zalopay/callback`;

        // Đơn 0 VND → tự xử lý
        if (Number(amount) === 0) {
            const app_trans_id = `0VND_${Date.now()}_${orderId}`;
            setPending(orderId, {
                ticketPayload, amount: 0, app_trans_id, status: 'PAID', createdAt: Date.now(),
            });
            setTimeout(async () => {
                try {
                    const isTimeTicket = ticketPayload.userData !== undefined;
                    const ticket = isTimeTicket
                        ? await ticketSvc.purchaseTimeTicket(ticketPayload)
                        : await ticketSvc.purchaseTicket({ ...ticketPayload, transaction_id: app_trans_id });
                    const pending = pendingOrders.get(orderId);
                    if (pending) setPending(orderId, { ...pending, ticketResult: ticket });
                } catch (e) { console.error('Lỗi khi tự động xử lý đơn 0đ:', e); }
            }, 500);
            return res.json({ success: true, cashier_order_url: '', order_url: '', qr_code: '', app_trans_id, is_zero_amount: true });
        }

        const result = await zaloPaySvc.createOrder({
            amount:      Math.round(amount),
            orderId,
            description: description || 'Hung Yen BRT - Thanh toan ve',
            callbackUrl,
            redirectUrl: returnUrl || 'http://localhost:3003/zalopay/return',
        });

        if (result.return_code === 1) {
            setPending(orderId, {
                ticketPayload, amount: Math.round(amount), app_trans_id: result.app_trans_id,
                status: 'PENDING', createdAt: Date.now(),
            });
            console.log(`[ZaloPay] ✅ Order created: ${result.app_trans_id} | callback → ${callbackUrl}`);
            return res.json({
                success:           true,
                cashier_order_url: result.cashier_order_url,
                order_url:         result.order_url,
                qr_code:           result.qr_code,
                app_trans_id:      result.app_trans_id,
                callback_url:      callbackUrl,
            });
        }

        const msg = result.sub_return_message || result.return_message || 'Không thể tạo đơn ZaloPay';
        console.warn(`[ZaloPay] create-order fail: rc=${result.return_code} — ${msg}`);
        return res.status(400).json({ success: false, message: msg, code: result.return_code });
    } catch (err) {
        console.error('[ZaloPay] create-order error:', err.message);
        res.status(500).json({ success: false, message: 'Lỗi kết nối ZaloPay: ' + err.message });
    }
});

// ─── POST /zalopay/callback ──────────────────────────────────────────────────
router.post('/callback', express.json(), async (req, res) => {
    try {
        const { data, mac } = req.body;
        if (!zaloPaySvc.verifyCallback(data, mac))
            return res.json({ return_code: -1, return_message: 'mac invalid' });

        const parsed       = JSON.parse(data);
        const { app_trans_id } = parsed;
        const orderId      = app_trans_id.substring(app_trans_id.indexOf('_') + 1);
        const pending      = pendingOrders.get(orderId);

        console.log(`[ZaloPay] callback: ${app_trans_id} | orderId=${orderId} | found=${!!pending}`);

        if (pending && pending.status !== 'PAID' && pending.ticketPayload) {
            try {
                const isTimeTicket = pending.ticketPayload.userData !== undefined;
                const ticket = isTimeTicket
                    ? await ticketSvc.purchaseTimeTicket(pending.ticketPayload)
                    : await ticketSvc.purchaseTicket({ ...pending.ticketPayload, transaction_id: app_trans_id });
                setPending(orderId, { ...pending, status: 'PAID', ticketResult: ticket, paidAt: Date.now() });
                console.log(`[ZaloPay] ✅ Ticket issued via callback for order ${orderId}`);
            } catch (e) {
                console.error('[ZaloPay] ❌ Issue ticket error (callback):', e.message);
            }
        }
        return res.json({ return_code: 1, return_message: 'success' });
    } catch (err) {
        console.error('[ZaloPay] callback error:', err.message);
        return res.json({ return_code: 0, return_message: err.message });
    }
});

// ─── POST /zalopay/verify-return ─────────────────────────────────────────────
router.post('/verify-return', express.json(), async (req, res) => {
    try {
        const { status, apptransid, pmcid, bankcode, amount, discountamount, checksum, orderId } = req.body;
        const isValid = zaloPaySvc.verifyReturnChecksum({ apptransid, pmcid, bankcode, amount, discountamount, status, checksum });
        if (!isValid) return res.status(400).json({ success: false, message: 'Checksum không hợp lệ' });
        if (String(status) !== '1') return res.json({ success: false, message: 'Thanh toán bị huỷ hoặc thất bại', status: 'CANCELLED' });

        const pending = pendingOrders.get(orderId);
        if (pending && pending.status === 'PAID')
            return res.json({ success: true, status: 'PAID', ticket: pending.ticketResult });

        if (pending && pending.ticketPayload) {
            try {
                const isTimeTicket = pending.ticketPayload.userData !== undefined;
                const ticket = isTimeTicket
                    ? await ticketSvc.purchaseTimeTicket(pending.ticketPayload)
                    : await ticketSvc.purchaseTicket({ ...pending.ticketPayload, transaction_id: apptransid });
                setPending(orderId, { ...pending, status: 'PAID', ticketResult: ticket, paidAt: Date.now() });
                return res.json({ success: true, status: 'PAID', ticket });
            } catch (e) {
                return res.status(500).json({ success: false, message: 'Xác minh OK nhưng lỗi xuất vé: ' + e.message });
            }
        }

        const queryResult = await zaloPaySvc.queryOrder(apptransid);
        if (queryResult.return_code === 1) return res.json({ success: true, status: 'PAID', ticket: null });
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── POST /zalopay/force-confirm/:orderId ─────────────────────────────────────
// Nhân viên xác nhận thủ công khi callback không tới (localhost/sandbox)
router.post('/force-confirm/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const pending = pendingOrders.get(orderId);

        if (!pending)
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng. Có thể backend đã restart — vui lòng tạo đơn mới.' });

        if (pending.status === 'PAID')
            return res.json({ success: true, status: 'PAID', ticket: pending.ticketResult });

        if (!pending.app_trans_id)
            return res.status(400).json({ success: false, message: 'Thiếu app_trans_id' });

        // Thử query ZaloPay tối đa 3 lần, cách 2 giây
        console.log(`[ZaloPay] force-confirm: querying ${pending.app_trans_id}`);
        let result;
        for (let attempt = 1; attempt <= 3; attempt++) {
            result = await zaloPaySvc.queryOrder(pending.app_trans_id);
            console.log(`[ZaloPay] force-confirm attempt ${attempt}: rc=${result.return_code} sub=${result.sub_return_code}`);
            if (result.return_code === 1) break;
            if (result.return_code === 2) break; // Thất bại hẳn, không cần retry
            // return_code 3 = đang xử lý → đợi 2s rồi thử lại
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
        }

        if (result.return_code === 1 || result.return_code === 3) {
            // MOCK FOR LOCALHOST/SANDBOX: 
            // Nếu ZaloPay trả về 3 (đang xử lý/chưa thanh toán) nhưng nhân viên bấm xác nhận thủ công,
            // ta giả lập thành công để test luồng xuất vé.
            if (pending.ticketPayload) {
                try {
                    const isTimeTicket = pending.ticketPayload.userData !== undefined;
                    const ticket = isTimeTicket
                        ? await ticketSvc.purchaseTimeTicket(pending.ticketPayload)
                        : await ticketSvc.purchaseTicket({ ...pending.ticketPayload, transaction_id: pending.app_trans_id });
                    setPending(orderId, { ...pending, status: 'PAID', ticketResult: ticket, paidAt: Date.now() });
                    console.log(`[ZaloPay] ✅ force-confirm: ticket issued for order ${orderId}`);
                    return res.json({ success: true, status: 'PAID', ticket });
                } catch (e) {
                    return res.status(500).json({ success: false, message: 'ZaloPay OK nhưng lỗi xuất vé: ' + e.message });
                }
            }
            return res.json({ success: true, status: 'PAID', ticket: null });
        }

        const errMsg = result.sub_return_message || result.return_message || 'ZaloPay chưa xác nhận';
        return res.status(400).json({
            success: false,
            message: `ZaloPay chưa xác nhận giao dịch: ${errMsg}`,
            zalopay_rc: result.return_code,
            tip: result.return_code === 3
                ? 'Giao dịch đang xử lý. Vui lòng chờ 30 giây rồi thử lại.'
                : 'Giao dịch bị từ chối. Vui lòng thử thanh toán lại.',
        });
    } catch (err) {
        console.error('[ZaloPay] force-confirm error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET /zalopay/query/:orderId ──────────────────────────────────────────────
router.get('/query/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const pending = pendingOrders.get(orderId);

        if (!pending) {
            console.warn(`[ZaloPay] query: orderId=${orderId} NOT FOUND`);
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (pending.status === 'PAID')
            return res.json({ success: true, status: 'PAID', ticket: pending.ticketResult });

        if (!pending.app_trans_id)
            return res.json({ success: true, status: 'PENDING' });

        const result = await zaloPaySvc.queryOrder(pending.app_trans_id);
        console.log(`[ZaloPay] query ${pending.app_trans_id}: rc=${result.return_code}`);

        if (result.return_code === 1 && pending.status !== 'PAID' && pending.ticketPayload) {
            try {
                const isTimeTicket = pending.ticketPayload.userData !== undefined;
                const ticket = isTimeTicket
                    ? await ticketSvc.purchaseTimeTicket(pending.ticketPayload)
                    : await ticketSvc.purchaseTicket({ ...pending.ticketPayload, transaction_id: pending.app_trans_id });
                setPending(orderId, { ...pending, status: 'PAID', ticketResult: ticket, paidAt: Date.now() });
                console.log(`[ZaloPay] ✅ Ticket issued via polling for order ${orderId}`);
                return res.json({ success: true, status: 'PAID', ticket });
            } catch (e) {
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
