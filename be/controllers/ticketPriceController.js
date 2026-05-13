const TicketPriceService = require('../services/ticketPriceService');

class TicketPriceController {

    async getAll(req, res) {
        try {
            const { search, Id_Ticket_Type } = req.query;
            const data = await TicketPriceService.getAll({ search, Id_Ticket_Type });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu giá vé' });
        }
    }

    async getById(req, res) {
        try {
            const data = await TicketPriceService.getById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy mức giá' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async getStats(req, res) {
        try {
            const data = await TicketPriceService.getStats();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê' });
        }
    }

    async getTypes(req, res) {
        try {
            const data = await TicketPriceService.getTypes();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async create(req, res) {
        try {
            const { Id_Ticket_Type, Price, From_Location_Id, To_Location_Id, is_active } = req.body;
            const data = await TicketPriceService.create({ Id_Ticket_Type, Price, From_Location_Id, To_Location_Id, is_active });
            res.status(201).json({ success: true, message: 'Tạo giá vé thành công', data });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
        }
    }

    async update(req, res) {
        try {
            const data = await TicketPriceService.update(req.params.id, req.body);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy mức giá' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
        }
    }

    async bulkUpsert(req, res) {
        try {
            const { items } = req.body;
            if (!Array.isArray(items) || !items.length) {
                return res.status(400).json({ success: false, message: 'items phải là mảng không rỗng' });
            }
            const data = await TicketPriceService.bulkUpsert(items);
            res.status(200).json({ success: true, message: `Đã cập nhật ${data.length} mức giá`, data });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const success = await TicketPriceService.delete(req.params.id);
            if (!success) return res.status(404).json({ success: false, message: 'Không tìm thấy mức giá' });
            res.status(200).json({ success: true, message: 'Đã xóa mức giá' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new TicketPriceController();
