const db = require('../models');
const { Op } = require('sequelize');

class TicketTypeService {

    async getAll({ search, category } = {}) {
        const where = {};
        if (search) {
            where[Op.or] = [
                { Name: { [Op.like]: `%${search}%` } },
                { Description: { [Op.like]: `%${search}%` } }
            ];
        }
        // Lọc theo kiểu: trip | day | week | month | year | time | promo
        if (category === 'trip')  where.Id_Category = 1;
        if (category === 'time')  where.Id_Category = 2;
        if (category === 'promo') where.Id_Category = 3;
        // Lọc theo thời hạn trong TIME
        if (category === 'day')   { where.Id_Category = 2; where.Duration_Day = 1; }
        if (category === 'week')  { where.Id_Category = 2; where.Duration_Day = 7; }
        if (category === 'month') { where.Id_Category = 2; where.Duration_Day = { [Op.between]: [28, 31] }; }
        if (category === 'year')  { where.Id_Category = 2; where.Duration_Day = { [Op.between]: [360, 366] }; }

        return await db.ticket_types.findAll({
            where,
            include: [
                { model: db.ticket_categories, as: 'category', attributes: ['Id', 'code', 'name'] },
                { model: db.discount_types,    as: 'discount_type', attributes: ['Id', 'Name', 'DiscountPercentage', 'is_free'], required: false },
                { model: db.ticket_prices,     as: 'ticket_prices', attributes: ['Id', 'Price'] }
            ],
            order: [['Id_Category', 'ASC'], ['Duration_Day', 'ASC']]
        });
    }

    async getById(id) {
        return await db.ticket_types.findByPk(id, {
            include: [
                { model: db.ticket_categories, as: 'category' },
                { model: db.discount_types,    as: 'discount_type', required: false },
                { model: db.ticket_prices,     as: 'ticket_prices' }
            ]
        });
    }

    async getCategories() {
        return await db.ticket_categories.findAll({ order: [['sort_order', 'ASC']] });
    }

    async getStats() {
        const total = await db.ticket_types.count();
        const trip  = await db.ticket_types.count({ where: { Id_Category: 1 } });
        const time  = await db.ticket_types.count({ where: { Id_Category: 2 } });
        const promo = await db.ticket_types.count({ where: { Id_Category: 3 } });
        return { total, trip, time, promo };
    }

    /**
     * Tạo loại vé mới.
     * - Vé TRIP: không có giá mặc định (giá phụ thuộc điểm đi/đến)
     * - Vé TIME/PROMO: nếu truyền defaultPrice → upsert vào ticket_prices
     */
    async create({ Name, Description, Duration_Day, requiresFace, Id_Category, id_discount_type, defaultPrice, is_active }) {
        if (!Name) throw new Error('Tên loại vé là bắt buộc');
        if (!Id_Category) throw new Error('Kiểu vé (Id_Category) là bắt buộc');
        
        const cat = await db.ticket_categories.findByPk(Id_Category);
        if (!cat) throw new Error('Kiểu vé không hợp lệ');

        // Logic thời hạn mặt định
        let finalDuration = Duration_Day || 1;
        if (cat.code === 'TRIP') finalDuration = 1;

        const existing = await db.ticket_types.findOne({ where: { Name, Id_Category } });
        if (existing) throw new Error(`Loại vé "${Name}" đã tồn tại trong danh mục này`);

        // Logic kế thừa quy tắc từ Category
        // Nếu Category yêu cầu KYC mặc định, thì TicketType cũng sẽ yêu cầu Face
        const finalRequiresFace = cat.requires_kyc_default ? true : (requiresFace || false);
        
        const finalDiscountType = (cat.code === 'PROMO') ? (id_discount_type || null) : null;
        if (cat.code === 'PROMO' && !id_discount_type) {
            throw new Error('Vé Ưu Đãi phải chọn loại cấu hình ưu đãi tương ứng');
        }

        const ticketType = await db.ticket_types.create({
            Id_Category,
            id_discount_type: finalDiscountType,
            Name,
            Description: Description || null,
            Duration_Day: finalDuration,
            requiresFace: finalRequiresFace,
            is_active: is_active !== undefined ? is_active : true
        });

        // Vé TIME/PROMO: tạo giá mặc định nếu có truyền vào
        if (cat.code !== 'TRIP' && defaultPrice != null) {
            await db.ticket_prices.create({
                Id_Ticket_Type: ticketType.Id,
                Price: defaultPrice
            });
        }

        return this.getById(ticketType.Id);
    }

    /**
     * Cập nhật loại vé.
     */
    async update(id, { Name, Description, Duration_Day, requiresFace, Id_Category, id_discount_type, defaultPrice, is_active }) {
        const ticketType = await db.ticket_types.findByPk(id, {
            include: [{ model: db.ticket_categories, as: 'category' }]
        });
        if (!ticketType) return null;

        if (Name && Name !== ticketType.Name) {
            const dup = await db.ticket_types.findOne({ 
                where: { Name, Id_Category: Id_Category || ticketType.Id_Category, Id: { [Op.ne]: id } } 
            });
            if (dup) throw new Error(`Tên "${Name}" đã được sử dụng trong danh mục này`);
        }

        const updates = {};
        if (Name !== undefined) updates.Name = Name;
        if (Description !== undefined) updates.Description = Description;
        if (Duration_Day !== undefined) updates.Duration_Day = Duration_Day;
        if (is_active !== undefined) updates.is_active = is_active;

        let effectiveCat = ticketType.category;
        if (Id_Category !== undefined && Id_Category !== ticketType.Id_Category) {
            effectiveCat = await db.ticket_categories.findByPk(Id_Category);
            if (!effectiveCat) throw new Error('Kiểu vé không hợp lệ');
            updates.Id_Category = Id_Category;
            if (effectiveCat.code === 'TRIP') updates.Duration_Day = 1;
        }

        // Đồng bộ logic Face Verify
        if (effectiveCat.requires_kyc_default) {
            updates.requiresFace = true;
        } else if (requiresFace !== undefined) {
            updates.requiresFace = requiresFace;
        }

        if (id_discount_type !== undefined) {
            updates.id_discount_type = (effectiveCat.code === 'PROMO') ? (id_discount_type || null) : null;
        }

        await ticketType.update(updates);

        // Upsert giá mặc định cho TIME/PROMO
        if (effectiveCat.code !== 'TRIP' && defaultPrice !== undefined) {
            const existingPrice = await db.ticket_prices.findOne({ where: { Id_Ticket_Type: id } });
            if (existingPrice) {
                await existingPrice.update({ Price: defaultPrice });
            } else if (defaultPrice !== null) {
                await db.ticket_prices.create({ Id_Ticket_Type: id, Price: defaultPrice });
            }
        }

        return this.getById(id);
    }

    async delete(id) {
        const ticketType = await db.ticket_types.findByPk(id);
        if (!ticketType) return false;
        // Xóa giá trước (nếu có constraint)
        await db.ticket_prices.destroy({ where: { Id_Ticket_Type: id } });
        await ticketType.destroy();
        return true;
    }
}

module.exports = new TicketTypeService();
