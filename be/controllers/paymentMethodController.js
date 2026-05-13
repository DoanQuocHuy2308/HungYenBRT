const PaymentMethodService = require('../services/paymentMethodService');

class PaymentMethodController {
    async getAll(req, res) {
        try {
            const data = await PaymentMethodService.getAll();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async getById(req, res) {
        try {
            const data = await PaymentMethodService.getById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy phương thức thanh toán' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async create(req, res) {
        try {
            const data = await PaymentMethodService.create(req.body);
            res.status(201).json({ success: true, message: 'Thêm phương thức thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async update(req, res) {
        try {
            const data = await PaymentMethodService.update(req.params.id, req.body);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy để cập nhật' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const success = await PaymentMethodService.delete(req.params.id);
            if (!success) return res.status(404).json({ success: false, message: 'Không tìm thấy để xóa' });
            res.status(200).json({ success: true, message: 'Xóa thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new PaymentMethodController();
