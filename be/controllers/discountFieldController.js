const DiscountFieldService = require('../services/discountFieldService');

class DiscountFieldController {
    async getFieldsByDiscountType(req, res) {
        try {
            const data = await DiscountFieldService.getFieldsByDiscountType(req.params.id_Discount_Type);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async createField(req, res) {
        try {
            const { id_Discount_Type, field_Name, is_Required } = req.body;
            if (!id_Discount_Type || !field_Name) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp id_Discount_Type và field_Name' });
            }
            const data = await DiscountFieldService.createField({ id_Discount_Type, field_Name, is_Required });
            res.status(201).json({ success: true, message: 'Tạo trường yêu cầu thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async updateField(req, res) {
        try {
            const data = await DiscountFieldService.updateField(req.params.id, req.body);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy trường cần cập nhật' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật trường thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async deleteField(req, res) {
        try {
            const success = await DiscountFieldService.deleteField(req.params.id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy trường yêu cầu cần xóa' });
            }
            res.status(200).json({ success: true, message: 'Xóa trường yêu cầu thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new DiscountFieldController();
