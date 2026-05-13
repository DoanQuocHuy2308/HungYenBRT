const TicketTypeLocationService = require('../services/ticketTypeLocationService');

class TicketTypeLocationController {

    // GET /ticket-type-locations/types → Tất cả loại vé kèm category
    async getAllTypes(req, res) {
        try {
            const data = await TicketTypeLocationService.getAllTicketTypes();
            res.json({ success: true, data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // GET /ticket-type-locations/locations → Tất cả ga
    async getAllLocations(req, res) {
        try {
            const data = await TicketTypeLocationService.getAllLocations();
            res.json({ success: true, data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // GET /ticket-type-locations/:typeId → Lấy cấu hình ga của 1 loại vé
    async getTypeConfig(req, res) {
        try {
            const data = await TicketTypeLocationService.getTypeConfig(req.params.typeId);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy loại vé' });
            res.json({ success: true, data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // POST /ticket-type-locations/calculate-range → Tính khoảng ga
    async calculateRange(req, res) {
        try {
            const { fromId, toId } = req.body;
            if (!fromId || !toId) {
                return res.status(400).json({ success: false, message: 'Cần cung cấp fromId và toId' });
            }
            const data = await TicketTypeLocationService.calculateRange(fromId, toId);
            res.json({ success: true, data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // POST /ticket-type-locations/:typeId/save-trip → Lưu cấu hình TRIP
    async saveTripConfig(req, res) {
        try {
            const { fromId, toId } = req.body;
            if (!fromId || !toId) {
                return res.status(400).json({ success: false, message: 'Cần chọn ga bắt đầu và kết thúc' });
            }
            const data = await TicketTypeLocationService.saveTripConfig(req.params.typeId, fromId, toId);
            res.json({ success: true, ...data });
        } catch (err) {
            console.error(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }

    // GET /ticket-type-locations/:typeId/allowed → Các ga được phép cho loại vé
    async getAllowedLocations(req, res) {
        try {
            const data = await TicketTypeLocationService.getAllowedLocations(req.params.typeId);
            res.json({ success: true, data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new TicketTypeLocationController();
