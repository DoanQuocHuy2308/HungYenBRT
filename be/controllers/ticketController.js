const TicketService = require('../services/ticketService');
const fs = require('fs');
const path = require('path');

const saveBase64Image = (base64String, prefix) => {
    if (!base64String || !base64String.startsWith('data:image')) return null;
    try {
        const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return null;
        
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const filename = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
        const filepath = path.join(__dirname, '..', 'uploads', filename);
        
        fs.writeFileSync(filepath, buffer);
        return `/uploads/${filename}`;
    } catch (err) {
        console.error('Lỗi khi lưu ảnh base64:', err);
        return null;
    }
};

class TicketController {
    async purchase(req, res) {
        try {
            const { 
                Id_Ticket_Type, Id_User, Quantity, price,
                code_promotion, id_payment, id_payment_method, id_employee, IsFree,
                From_Location, To_Location, transaction_id
            } = req.body;

            if (!Id_Ticket_Type || !Id_User || price == null) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin mua vé' });
            }

            const order = await TicketService.purchaseTicket({
                Id_Ticket_Type, Id_User, Quantity, price,
                code_promotion, id_payment, id_payment_method, id_employee, IsFree,
                From_Location, To_Location, transaction_id
            });

            res.status(201).json({ 
                success: true, 
                message: 'Mua vé thành công! Vui lòng kiểm tra mã QR trong ví vé.', 
                data: order 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message || 'Lỗi server khi mua vé' });
        }
    }

    async purchaseTimeTicket(req, res) {
        try {
            const { 
                Id_Ticket_Type, userData, 
                id_payment_method, id_employee, transaction_id 
            } = req.body;

            if (!Id_Ticket_Type || !userData || !userData.cccd_number || !userData.phone) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin khách hàng hoặc loại vé' });
            }

            if (userData.avatar && userData.avatar.startsWith('data:image')) {
                userData.avatar = saveBase64Image(userData.avatar, 'avatar') || userData.avatar;
            }
            if (userData.cccd_front && userData.cccd_front.startsWith('data:image')) {
                userData.cccd_front = saveBase64Image(userData.cccd_front, 'cccd_front') || userData.cccd_front;
            }
            if (userData.cccd_back && userData.cccd_back.startsWith('data:image')) {
                userData.cccd_back = saveBase64Image(userData.cccd_back, 'cccd_back') || userData.cccd_back;
            }

            const order = await TicketService.purchaseTimeTicket({
                Id_Ticket_Type, userData,
                id_payment_method, id_employee, transaction_id
            });

            res.status(201).json({ 
                success: true, 
                message: 'Đăng ký vé tháng thành công!', 
                data: order 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message || 'Lỗi server khi đăng ký vé tháng' });
        }
    }

    async getMyOrders(req, res) {
        try {
            const data = await TicketService.getMyOrders(req.params.id_User);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async adminGetAll(req, res) {
        try {
            const { status, id_User, search } = req.query;
            const data = await TicketService.getAllOrders({ status, id_User, search });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server', details: error.message, stack: error.stack });
        }
    }

    async getDetail(req, res) {
        try {
            const result = await TicketService.getOrderDetail(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { status } = req.body;
            const data = await TicketService.setOrderStatus(req.params.id, status);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            res.status(200).json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công', data });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi cập nhật' });
        }
    }

    async deleteOrder(req, res) {
        try {
            const success = await TicketService.deleteOrder(req.params.id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }
            res.status(200).json({ success: true, message: 'Xóa đơn hàng thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi xóa', details: error.message });
        }
    }

    async updateTicketStatus(req, res) {
        try {
            const { status } = req.body;
            const data = await TicketService.setTicketStatus(req.params.id, status);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy vé con' });
            res.status(200).json({ success: true, message: 'Cập nhật trạng thái vé thành công', data });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi cập nhật' });
        }
    }

    async dashboard(req, res) {
        try {
            const data = await TicketService.getTicketStats();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async fullStats(req, res) {
        try {
            const { range, start, end } = req.query;
            const data = await TicketService.getFullStats(range || '7d', start, end);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    }

    async staffStats(req, res) {
        try {
            const { id } = req.params;
            const { timeRange } = req.query;
            const data = await TicketService.getStaffStats(id, timeRange || 'today');
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê: ' + error.message });
        }
    }
}

module.exports = new TicketController();
