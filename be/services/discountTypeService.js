const db = require('../models');

class DiscountTypeService {
    async getAll() {
        return await db.discount_types.findAll();
    }

    async getById(id) {
        return await db.discount_types.findByPk(id);
    }

    async create(data) {
        return await db.discount_types.create(data);
    }

    async update(id, data) {
        const discountType = await db.discount_types.findByPk(id);
        if (!discountType) return null;
        return await discountType.update(data);
    }

    async delete(id) {
        const discountType = await db.discount_types.findByPk(id);
        if (!discountType) return false;
        await discountType.destroy();
        return true;
    }
}

module.exports = new DiscountTypeService();
