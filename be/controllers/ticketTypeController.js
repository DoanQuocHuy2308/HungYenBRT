const TicketTypeService = require('../services/ticketTypeService');

class TicketTypeController {

    async getAll(req, res) {
        try {
            const { search, category } = req.query;
            const data = await TicketTypeService.getAll({ search: search || '', category });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu Loại vé' });
        }
    }

    async getById(req, res) {
        try {
            const data = await TicketTypeService.getById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy loại vé' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async getStats(req, res) {
        try {
            const data = await TicketTypeService.getStats();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê' });
        }
    }

    async getCategories(req, res) {
        try {
            const data = await TicketTypeService.getCategories();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách kiểu vé' });
        }
    }

    async getDiscountTypes(req, res) {
        try {
            const db = require('../models');
            const data = await db.discount_types.findAll({
                attributes: ['Id', 'Name', 'DiscountPercentage', 'is_free', 'requires_document', 'sort_order'],
                order: [['sort_order', 'ASC']]
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async create(req, res) {
        try {
            const { Name, Description, Duration_Day, requiresFace, Id_Category, id_discount_type, defaultPrice } = req.body;
            const data = await TicketTypeService.create({ Name, Description, Duration_Day, requiresFace, Id_Category, id_discount_type, defaultPrice });
            res.status(201).json({ success: true, message: 'Tạo loại vé thành công', data });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
        }
    }

    async update(req, res) {
        try {
            const data = await TicketTypeService.update(req.params.id, req.body);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy loại vé' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const success = await TicketTypeService.delete(req.params.id);
            if (!success) return res.status(404).json({ success: false, message: 'Không tìm thấy loại vé' });
            res.status(200).json({ success: true, message: 'Xóa loại vé thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server (Loại vé đang được sử dụng)' });
        }
    }
}

module.exports = new TicketTypeController();
