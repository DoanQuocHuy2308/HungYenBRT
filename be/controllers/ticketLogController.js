const TicketLogService = require('../services/ticketLogService');

class TicketLogController {
    async getByTicket(req, res) {
        try {
            const data = await TicketLogService.getByTicket(req.params.ticketId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async adminGetAll(req, res) {
        try {
            const { location_id, status, scan_direction, date_from, date_to, page, limit } = req.query;
            const result = await TicketLogService.getAll({ location_id, status, scan_direction, date_from, date_to, page, limit });
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async adminGetStats(req, res) {
        try {
            const { date_from, date_to } = req.query;
            const data = await TicketLogService.getStats({ date_from, date_to });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new TicketLogController();
