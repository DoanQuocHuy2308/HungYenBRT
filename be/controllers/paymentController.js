const PaymentService = require('../services/paymentService');

class PaymentController {
    async getStats(req, res) {
        try {
            const data = await PaymentService.getStats();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê thanh toán' });
        }
    }

    async getAll(req, res) {
        try {
            const data = await PaymentService.getAll();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu thanh toán' });
        }
    }

    async getById(req, res) {
        try {
            const data = await PaymentService.getById(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async create(req, res) {
        try {
            const { PaymentMethod, TransactionId, Amount } = req.body;
            if (!PaymentMethod || !TransactionId || Amount == null) {
                return res.status(400).json({ success: false, message: 'PaymentMethod, TransactionId, Amount là bắt buộc' });
            }
            const data = await PaymentService.create({ PaymentMethod, TransactionId, Amount });
            res.status(201).json({ success: true, message: 'Tạo giao dịch thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async update(req, res) {
        try {
            const data = await PaymentService.update(req.params.id, req.body);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch cần cập nhật' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const success = await PaymentService.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch cần xóa' });
            }
            res.status(200).json({ success: true, message: 'Xóa giao dịch thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server (Có thể vé đã được gắn với thanh toán này)' });
        }
    }
}

module.exports = new PaymentController();
