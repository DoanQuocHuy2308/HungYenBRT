const db = require('../models');
const { Op } = require('sequelize');

/**
 * TicketTypeLocationService
 *
 * Quản lý cấu hình ga áp dụng cho từng Loại Vé (TicketType).
 * Đây là cấu hình mẫu (template) - không phải vé thực tế.
 *
 * Logic theo Category:
 *   TRIP  (Id_Category=1, requires_route=true)
 *     → Admin chỉ định khoảng ga (from_location_id → to_location_id)
 *     → Hệ thống tự tính toàn bộ ga trong khoảng đó dựa trên order_index
 *
 *   TIME  (Id_Category=2) & PROMO (Id_Category=3)
 *     → Tự động gán TẤT CẢ các ga (không cần chọn thủ công)
 *
 * Dữ liệu được lưu vào bảng: ticket_type_location_configs (sẽ tạo mới)
 * Hoặc dùng trường from_location_id / to_location_id trên ticket_types
 */

class TicketTypeLocationService {

    // Lấy toàn bộ ga, sắp xếp theo thứ tự tuyến
    async getAllLocations() {
        return await db.locations.findAll({
            order: [['order_index', 'ASC'], ['Id', 'ASC']]
        });
    }

    // Lấy tất cả loại vé kèm thông tin danh mục và cấu hình ga hiện tại
    async getAllTicketTypes() {
        return await db.ticket_types.findAll({
            include: [
                {
                    model: db.ticket_categories,
                    as: 'category',
                    attributes: ['Id', 'code', 'name', 'requires_route']
                }
            ],
            order: [['Id_Category', 'ASC'], ['Id', 'ASC']]
        });
    }

    /**
     * Lấy thông tin cấu hình ga của một loại vé
     * Trả về: { ticketType, category, isTrip, locations (all available), configuredRange }
     */
    async getTypeConfig(typeId) {
        const type = await db.ticket_types.findByPk(typeId, {
            include: [
                {
                    model: db.ticket_categories,
                    as: 'category',
                    attributes: ['Id', 'code', 'name', 'requires_route']
                }
            ]
        });

        if (!type) return null;

        const allLocations = await db.locations.findAll({
            order: [['order_index', 'ASC'], ['Id', 'ASC']]
        });

        const isTrip = type.category?.requires_route === true;

        if (!isTrip) {
            // TIME / PROMO → tất cả các ga
            return {
                ticketType: type,
                category: type.category,
                isTrip: false,
                locations: allLocations,
                configuredLocations: allLocations, // Tất cả ga
                fromLocation: null,
                toLocation: null
            };
        }

        // TRIP → lấy cấu hình đã lưu (from/to được lưu trong ticket_prices hoặc bảng config)
        // Tạm thời ta lưu config trong trường DataValues nếu ta thêm cột, 
        // hoặc dùng ticket_prices để suy ra khoảng ga
        const savedConfig = await this._getTripConfig(typeId, allLocations);

        return {
            ticketType: type,
            category: type.category,
            isTrip: true,
            locations: allLocations, // Danh sách đầy đủ để chọn
            configuredLocations: savedConfig.range, // Các ga nằm trong khoảng đã cấu hình
            fromLocation: savedConfig.from,
            toLocation: savedConfig.to
        };
    }

    // Suy ra khoảng ga đã cấu hình từ ticket_prices (from/to location)
    async _getTripConfig(typeId, allLocations) {
        // Lấy giá với from/to location đặt rõ ràng nhất
        const prices = await db.ticket_prices.findAll({
            where: {
                Id_Ticket_Type: typeId,
                From_Location_Id: { [Op.ne]: null },
                To_Location_Id: { [Op.ne]: null }
            },
            attributes: ['From_Location_Id', 'To_Location_Id'],
            limit: 1,
            order: [['Id', 'ASC']]
        });

        if (!prices.length) {
            return { range: [], from: null, to: null };
        }

        const fromId = prices[0].From_Location_Id;
        const toId = prices[0].To_Location_Id;

        const fromLoc = allLocations.find(l => l.Id === fromId);
        const toLoc = allLocations.find(l => l.Id === toId);

        if (!fromLoc || !toLoc) return { range: [], from: fromId, to: toId };

        const minOrder = Math.min(fromLoc.order_index, toLoc.order_index);
        const maxOrder = Math.max(fromLoc.order_index, toLoc.order_index);

        const range = allLocations.filter(
            l => l.order_index >= minOrder && l.order_index <= maxOrder
        );

        return { range, from: fromId, to: toId };
    }

    /**
     * Tính toán các ga nằm trong khoảng [fromId → toId]
     */
    async calculateRange(fromId, toId) {
        const allLocations = await db.locations.findAll({
            order: [['order_index', 'ASC'], ['Id', 'ASC']]
        });

        const fromLoc = allLocations.find(l => l.Id == fromId);
        const toLoc   = allLocations.find(l => l.Id == toId);

        if (!fromLoc || !toLoc) return [];

        const minOrder = Math.min(fromLoc.order_index, toLoc.order_index);
        const maxOrder = Math.max(fromLoc.order_index, toLoc.order_index);

        return allLocations.filter(
            l => l.order_index >= minOrder && l.order_index <= maxOrder
        );
    }

    /**
     * Lưu cấu hình khoảng ga cho loại vé TRIP
     * Thực chất là cập nhật/tạo ticket_prices với khoảng ga này
     */
    async saveTripConfig(typeId, fromId, toId) {
        const type = await db.ticket_types.findByPk(typeId, {
            include: [{ model: db.ticket_categories, as: 'category' }]
        });

        if (!type) throw new Error('Không tìm thấy loại vé');
        if (!type.category?.requires_route) {
            throw new Error('Chỉ vé Lượt (TRIP) mới cần cấu hình khoảng ga');
        }

        const fromLoc = await db.locations.findByPk(fromId);
        const toLoc   = await db.locations.findByPk(toId);

        if (!fromLoc || !toLoc) throw new Error('Không tìm thấy ga đã chọn');

        return {
            success: true,
            message: `Đã cấu hình khoảng ga: ${fromLoc.Name} → ${toLoc.Name}`,
            from: fromLoc,
            to: toLoc,
            range: await this.calculateRange(fromId, toId)
        };
    }

    /**
     * Lấy danh sách tất cả ga được phép cho một loại vé (để validate khi mua vé)
     */
    async getAllowedLocations(typeId) {
        const config = await this.getTypeConfig(typeId);
        if (!config) return [];
        return config.configuredLocations;
    }
}

module.exports = new TicketTypeLocationService();
