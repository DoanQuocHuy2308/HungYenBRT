const DiscountTypeService = require('../services/discountTypeService');

class DiscountTypeController {
    async getAll(req, res) {
        try {
            const data = await DiscountTypeService.getAll();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu Loại giảm giá' });
        }
    }

    async getById(req, res) {
        try {
            const data = await DiscountTypeService.getById(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy loại giảm giá' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async create(req, res) {
        try {
            const { Name, Description, DiscountPercentage } = req.body;
            if (!Name || DiscountPercentage == null) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Tên (Name) và Phần trăm giảm giá (DiscountPercentage)' });
            }
            const data = await DiscountTypeService.create({ Name, Description, DiscountPercentage });
            res.status(201).json({ success: true, message: 'Tạo loại giảm giá thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async update(req, res) {
        try {
            const data = await DiscountTypeService.update(req.params.id, req.body);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy loại giảm giá cần cập nhật' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const success = await DiscountTypeService.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy loại giảm giá cần xóa' });
            }
            res.status(200).json({ success: true, message: 'Xóa loại giảm giá thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server (Có thể đang được sử dụng ở bảng rẽ nhánh)' });
        }
    }
}

module.exports = new DiscountTypeController();
