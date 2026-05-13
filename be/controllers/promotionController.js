const PromotionService = require('../services/promotionService');

class PromotionController {
    async getAll(req, res) {
        try {
            const { search, status } = req.query;
            const data = await PromotionService.getAll({ search, status });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu khuyến mãi' });
        }
    }

    async getByCode(req, res) {
        try {
            const data = await PromotionService.getByCode(req.params.code);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async getStats(req, res) {
        try {
            const data = await PromotionService.getStats();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê' });
        }
    }

    async create(req, res) {
        try {
            const { Code, Name, Description, DiscountAmount, DiscountPercent, StartDate, EndDate, isActive, ImageUrl } = req.body;
            if (!Code || !Name || !StartDate || !EndDate) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Code, Name, StartDate, EndDate' });
            }

            if (DiscountAmount == null && DiscountPercent == null) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập số tiền giảm hoặc % giảm' });
            }

            const existing = await PromotionService.getByCode(Code);
            if (existing) {
                return res.status(400).json({ success: false, message: 'Mã khuyến mãi đã tồn tại' });
            }

            const data = await PromotionService.create({ 
                Code, Name, Description, DiscountAmount, DiscountPercent,
                StartDate, EndDate, isActive, ImageUrl 
            });
            res.status(201).json({ success: true, message: 'Tạo mã khuyến mãi thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async update(req, res) {
        try {
            const data = await PromotionService.update(req.params.code, req.body);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy mã cần cập nhật' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const success = await PromotionService.delete(req.params.code);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy mã cần xóa' });
            }
            res.status(200).json({ success: true, message: 'Xóa mã khuyến mãi thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new PromotionController();
