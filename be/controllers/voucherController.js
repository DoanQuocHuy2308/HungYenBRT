const VoucherService = require('../services/voucherService');

class VoucherController {
    async getMyVouchers(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ success: false, message: 'Thiếu userId' });
            }
            const data = await VoucherService.getMyVouchers(userId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách voucher' });
        }
    }

    async validateVoucher(req, res) {
        try {
            const { code } = req.params;
            const { userId } = req.query;
            if (!code || !userId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã voucher hoặc userId' });
            }
            const data = await VoucherService.getVoucherByCodeAndUser(code, userId);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Voucher không tồn tại, đã hết hạn hoặc không thuộc về bạn' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi xác thực voucher' });
        }
    }

    // Sinh mã cho các hồ sơ đã duyệt nhưng chưa có mã
    async resyncCodes(req, res) {
        try {
            const count = await VoucherService.resyncMissingCodes();
            res.status(200).json({ success: true, message: `Đã sinh mã cho ${count} hồ sơ` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi khi resync mã voucher' });
        }
    }
}

module.exports = new VoucherController();
