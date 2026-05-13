const DiscountConfigService = require('../services/discountConfigService');

class DiscountConfigController {
    // Lấy tất cả cấu hình
    async getFullConfig(req, res) {
        try {
            const data = await DiscountConfigService.getAllTypesWithFields();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Lưu/Cập nhật loại ưu đãi
    async saveType(req, res) {
        try {
            const data = await DiscountConfigService.upsertType(req.body);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Xóa loại ưu đãi
    async deleteType(req, res) {
        try {
            await DiscountConfigService.deleteType(req.params.id);
            res.status(200).json({ success: true, message: 'Đã xóa thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Đồng bộ Fields
    async syncFields(req, res) {
        try {
            const { id_Discount_Type, fields } = req.body;
            if (!id_Discount_Type || !Array.isArray(fields)) {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
            }
            await DiscountConfigService.syncFields(id_Discount_Type, fields);
            res.status(200).json({ success: true, message: 'Đồng bộ cấu hình form thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new DiscountConfigController();
