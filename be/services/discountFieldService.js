const db = require('../models');

class DiscountFieldService {
    // Lấy tất cả các field yêu cầu của 1 loại giảm giá
    async getFieldsByDiscountType(id_Discount_Type) {
        return await db.discount_fields.findAll({
            where: { id_Discount_Type }
        });
    }

    async createField(data) {
        return await db.discount_fields.create(data);
    }

    async updateField(id, data) {
        const field = await db.discount_fields.findByPk(id);
        if (!field) return null;
        return await field.update(data);
    }

    async deleteField(id) {
        const field = await db.discount_fields.findByPk(id);
        if (!field) return false;
        await field.destroy();
        return true;
    }
}

module.exports = new DiscountFieldService();
