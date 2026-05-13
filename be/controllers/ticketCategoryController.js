const TicketCategoryService = require('../services/ticketCategoryService');

class TicketCategoryController {

    async getAll(req, res) {
        try {
            const { search } = req.query;
            const data = await TicketCategoryService.getAll({ search });
            res.status(200).json({ success: true, data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async getById(req, res) {
        try {
            const data = await TicketCategoryService.getById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy kiểu vé' });
            res.status(200).json({ success: true, data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async getStats(req, res) {
        try {
            const data = await TicketCategoryService.getStats();
            res.status(200).json({ success: true, data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async create(req, res) {
        try {
            const { code, name, description, sort_order, requires_route, requires_kyc_default, is_active } = req.body;
            const data = await TicketCategoryService.create({ code, name, description, sort_order, requires_route, requires_kyc_default, is_active });
            res.status(201).json({ success: true, message: 'Tạo kiểu vé thành công', data });
        } catch (err) {
            console.error(err);
            res.status(400).json({ success: false, message: err.message || 'Lỗi server' });
        }
    }

    async update(req, res) {
        try {
            const data = await TicketCategoryService.update(req.params.id, req.body);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy kiểu vé' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
        } catch (err) {
            console.error(err);
            res.status(400).json({ success: false, message: err.message || 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const result = await TicketCategoryService.delete(req.params.id);
            if (!result.success) {
                if (result.reason === 'not_found')
                    return res.status(404).json({ success: false, message: 'Không tìm thấy kiểu vé' });
                if (result.reason === 'in_use')
                    return res.status(409).json({
                        success: false,
                        message: `Không thể xóa: kiểu vé đang được dùng bởi ${result.count} loại vé`
                    });
            }
            res.status(200).json({ success: true, message: 'Đã xóa kiểu vé' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async reorder(req, res) {
        try {
            const { items } = req.body;
            if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'items phải là mảng' });
            await TicketCategoryService.reorder(items);
            res.status(200).json({ success: true, message: 'Đã cập nhật thứ tự' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new TicketCategoryController();
