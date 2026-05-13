const axios  = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const qs     = require('qs');

// ─── Sandbox credentials (public from ZaloPay docs) ──────────────────────────
const ZLP = {
    app_id:       2553,
    key1:         'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2:         'kLtgPl8HHhfvMuDHPwKfgfsY4Yd2uB1p',
    url_create:   'https://sb-openapi.zalopay.vn/v2/create',
    url_query:    'https://sb-openapi.zalopay.vn/v2/query',
};

const FORM = { 'Content-Type': 'application/x-www-form-urlencoded' };

class ZaloPayService {
    /**
     * Tạo đơn hàng ZaloPay
     * MAC = HMAC-SHA256(key1, app_id|app_trans_id|app_user|amount|app_time|embed_data|item)
     */
    async createOrder({ amount, orderId, description, callbackUrl, redirectUrl }) {
        const transDate   = moment().format('YYMMDD');
        const app_trans_id = `${transDate}_${orderId}`;
        const app_time    = Date.now();
        const app_user    = 'brt_staff';
        const item        = '[]';

        const embed_data = JSON.stringify({
            merchantinfo: 'Hung Yen BRT',
            redirecturl:  redirectUrl || '',   // ZaloPay redirect về đây sau khi thanh toán
        });

        // Đúng thứ tự theo docs: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        const rawMac = [ZLP.app_id, app_trans_id, app_user, amount, app_time, embed_data, item].join('|');
        const mac    = crypto.createHmac('sha256', ZLP.key1).update(rawMac).digest('hex');

        const body = qs.stringify({
            app_id:       ZLP.app_id,
            app_user,
            app_time,
            amount,
            app_trans_id,
            embed_data,
            item,
            description:  description || 'Hung Yen BRT - Thanh toan ve',
            bank_code:    '',
            callback_url: callbackUrl || '',
            mac,
        });

        console.log(`[ZaloPay] createOrder: ${app_trans_id} | amount=${amount}`);
        const resp = await axios.post(ZLP.url_create, body, { headers: FORM });
        const data = resp.data;
        console.log('[ZaloPay] createOrder response:', JSON.stringify(data));

        return { ...data, app_trans_id };
    }

    /**
     * Truy vấn trạng thái giao dịch
     * MAC = HMAC-SHA256(key1, app_id|app_trans_id|key1)
     * return_code: 1=thành công, 2=thất bại, 3=đang xử lý
     */
    async queryOrder(app_trans_id) {
        const rawMac = `${ZLP.app_id}|${app_trans_id}|${ZLP.key1}`;
        const mac    = crypto.createHmac('sha256', ZLP.key1).update(rawMac).digest('hex');

        const body = qs.stringify({ app_id: ZLP.app_id, app_trans_id, mac });
        const resp = await axios.post(ZLP.url_query, body, { headers: FORM });
        return resp.data;
    }

    /**
     * Xác thực callback webhook từ ZaloPay (dùng key2)
     * expectedMac = HMAC-SHA256(key2, data_string)
     */
    verifyCallback(dataStr, mac) {
        const expected = crypto.createHmac('sha256', ZLP.key2).update(dataStr).digest('hex');
        return expected === mac;
    }

    /**
     * Xác thực checksum khi ZaloPay redirect về return URL
     * Checksum = HMAC-SHA256(key2, app_id|apptransid|pmcid|bankcode|amount|discountamount|status)
     */
    verifyReturnChecksum({ apptransid, pmcid, bankcode, amount, discountamount, status, checksum }) {
        const raw      = `${ZLP.app_id}|${apptransid}|${pmcid}|${bankcode}|${amount}|${discountamount}|${status}`;
        const expected = crypto.createHmac('sha256', ZLP.key2).update(raw).digest('hex');
        return expected === checksum;
    }
}

module.exports = new ZaloPayService();
