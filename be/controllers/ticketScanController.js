const TicketScanService = require('../services/ticketScanService');

class TicketScanController {
    generateQr(req, res) {
        try {
            const { ticketId } = req.params;
            if (!ticketId) {
                return res.status(400).json({ success: false, message: 'Thiếu ticketId' });
            }
            const payload = TicketScanService.generateQrPayload(ticketId);
            res.status(200).json({ success: true, data: payload });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi tạo mã QR' });
        }
    }

    async scan(req, res) {
        try {
            const { qrToken, locationId, direction } = req.body;
            if (!qrToken || !locationId) {
                return res.status(400).json({ success: false, message: 'Thiếu qrToken hoặc locationId' });
            }

            const faceImagePath = req.file ? `/uploads/${req.file.filename}` : null;
            const scanDirection = direction === 'EXIT' ? 'EXIT' : 'ENTRY';

            const result = await TicketScanService.scanTicket(
                qrToken,
                parseInt(locationId),
                faceImagePath,
                scanDirection
            );

            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi quét vé' });
        }
    }

    async lookup(req, res) {
        try {
            const { qrToken } = req.body;
            if (!qrToken) {
                return res.status(400).json({ success: false, message: 'Thiếu mã vé (qrToken)' });
            }
            const result = await TicketScanService.lookupTicket(qrToken);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi tra cứu vé' });
        }
    }

    async getAll(req, res) {
        try {
            const result = await TicketScanService.getAllTickets();
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách vé' });
        }
    }

    async restock(req, res) {
        try {
            const { ticketId, newLocationId, employeeId, paymentMethodId } = req.body;
            if (!ticketId || !newLocationId || !employeeId) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (ticketId, newLocationId, employeeId)' });
            }
            const result = await TicketScanService.processRestock(ticketId, parseInt(newLocationId), employeeId, paymentMethodId);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi xử lý bổ sung vé' });
        }
    }
}

module.exports = new TicketScanController();
