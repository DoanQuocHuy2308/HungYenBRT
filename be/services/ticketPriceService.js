const db = require('../models');
const { Op } = require('sequelize');

class TicketPriceService {

    // Lấy tất cả giá vé, join với ticket_types và locations
    async getAll({ search, Id_Ticket_Type } = {}) {
        const where = {};
        if (Id_Ticket_Type) where.Id_Ticket_Type = Number(Id_Ticket_Type);

        const include = [
            {
                model: db.ticket_types,
                as: 'ticket_type',
                attributes: ['Id', 'Name', 'Duration_Day', 'requiresFace', 'Id_Category'],
                include: [{ model: db.ticket_categories, as: 'category', attributes: ['code', 'name'] }]
            },
            {
                model: db.locations,
                as: 'fromLocation',
                attributes: ['Id', 'Name', 'order_index']
            },
            {
                model: db.locations,
                as: 'toLocation',
                attributes: ['Id', 'Name', 'order_index']
            }
        ];

        const rows = await db.ticket_prices.findAll({ where, include, order: [['Id_Ticket_Type', 'ASC']] });

        if (!search) return rows;

        return rows.filter(r =>
            r.ticket_type?.Name?.toLowerCase().includes(search.toLowerCase()) ||
            r.fromLocation?.Name?.toLowerCase().includes(search.toLowerCase()) ||
            r.toLocation?.Name?.toLowerCase().includes(search.toLowerCase())
        );
    }

    async getById(id) {
        return await db.ticket_prices.findByPk(id, {
            include: [
                { model: db.ticket_types, as: 'ticket_type' },
                { model: db.locations, as: 'fromLocation' },
                { model: db.locations, as: 'toLocation' }
            ]
        });
    }

    // Thống kê
    async getStats() {
        const all = await db.ticket_prices.findAll();
        const prices = all.map(p => parseFloat(p.Price));
        const total = all.length;
        const minPrice = total ? Math.min(...prices) : 0;
        const maxPrice = total ? Math.max(...prices) : 0;
        const avgPrice = total ? prices.reduce((a, b) => a + b, 0) / total : 0;

        return { total, minPrice, maxPrice, avgPrice: Math.round(avgPrice) };
    }

    // Tạo mới – hỗ trợ location-based pricing cho TRIP
    async create({ Id_Ticket_Type, Price, From_Location_Id, To_Location_Id, is_active }) {
        if (!Id_Ticket_Type || Price == null) throw new Error('Cần cung cấp loại vé và mức giá');
        if (Price < 0) throw new Error('Mức giá không hợp lệ');

        const type = await db.ticket_types.findByPk(Id_Ticket_Type, {
            include: [{ model: db.ticket_categories, as: 'category' }]
        });
        if (!type) throw new Error('Loại vé không tồn tại');

        const isTrip = type.category?.code?.toUpperCase() === 'TRIP' || type.Id_Category === 1;

        if (isTrip) {
            if (!From_Location_Id || !To_Location_Id) {
                throw new Error('Vé lượt bắt buộc phải chọn điểm đi và điểm đến');
            }
            if (From_Location_Id === To_Location_Id) {
                throw new Error('Điểm đi và điểm đến không được trùng nhau');
            }
        }

        // Kiểm tra chặn trùng lặp cho cùng một cặp trạm
        const where = { Id_Ticket_Type };
        if (isTrip) {
            where.From_Location_Id = From_Location_Id;
            where.To_Location_Id = To_Location_Id;
        } else {
            // Với TIME/PROMO, thường chỉ có 1 mức giá mặc định
            where.From_Location_Id = null;
            where.To_Location_Id = null;
        }

        const existing = await db.ticket_prices.findOne({ where });
        if (existing) {
            throw new Error(`Mức giá cho loại vé ${type.Name} này đã tồn tại.`);
        }

        return await db.ticket_prices.create({ 
            Id_Ticket_Type, 
            Price, 
            From_Location_Id: isTrip ? From_Location_Id : null,
            To_Location_Id: isTrip ? To_Location_Id : null,
            is_active: is_active !== undefined ? is_active : true
        });
    }

    async update(id, { Price, Id_Ticket_Type, From_Location_Id, To_Location_Id, is_active }) {
        const record = await db.ticket_prices.findByPk(id);
        if (!record) return null;

        const updates = {};
        if (Price !== undefined) {
            if (Price < 0) throw new Error('Mức giá không hợp lệ');
            updates.Price = Price;
        }
        if (is_active !== undefined) updates.is_active = is_active;

        // Nếu thay đổi loại vé hoặc trạm, cần check lại trùng lặp
        if (Id_Ticket_Type !== undefined || From_Location_Id !== undefined || To_Location_Id !== undefined) {
            const finalTypeId = Id_Ticket_Type || record.Id_Ticket_Type;
            const finalFrom = From_Location_Id !== undefined ? From_Location_Id : record.From_Location_Id;
            const finalTo = To_Location_Id !== undefined ? To_Location_Id : record.To_Location_Id;

            const type = await db.ticket_types.findByPk(finalTypeId, {
                include: [{ model: db.ticket_categories, as: 'category' }]
            });
            
            const isTrip = type?.category?.code?.toUpperCase() === 'TRIP' || type?.Id_Category === 1;
            if (isTrip && (!finalFrom || !finalTo)) {
                throw new Error('Vé lượt bắt buộc phải có điểm đi và điểm đến');
            }

            const where = { 
                Id_Ticket_Type: finalTypeId,
                From_Location_Id: isTrip ? finalFrom : null,
                To_Location_Id: isTrip ? finalTo : null,
                Id: { [Op.ne]: id }
            };

            const dup = await db.ticket_prices.findOne({ where });
            if (dup) throw new Error('Cấu hình mức giá này đã tồn tại');

            updates.Id_Ticket_Type = finalTypeId;
            updates.From_Location_Id = isTrip ? finalFrom : null;
            updates.To_Location_Id = isTrip ? finalTo : null;
        }

        return await record.update(updates);
    }

    async delete(id) {
        const record = await db.ticket_prices.findByPk(id);
        if (!record) return false;
        await record.destroy();
        return true;
    }

    // Lấy danh sách loại vé (để hiển thị trong dropdown)
    async getTypes() {
        return await db.ticket_types.findAll({
            include: [{ model: db.ticket_categories, as: 'category' }],
            order: [['Id', 'ASC']]
        });
    }
}

module.exports = new TicketPriceService();
