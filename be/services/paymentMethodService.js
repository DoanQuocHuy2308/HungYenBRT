const db = require('../models');

class PaymentMethodService {
    async getAll() {
        return await db.payment_methods.findAll({
            order: [['Id', 'ASC']]
        });
    }

    async getById(id) {
        return await db.payment_methods.findByPk(id);
    }

    async create(data) {
        return await db.payment_methods.create(data);
    }

    async update(id, data) {
        const item = await db.payment_methods.findByPk(id);
        if (!item) return null;
        return await item.update(data);
    }

    async delete(id) {
        const item = await db.payment_methods.findByPk(id);
        if (!item) return false;
        await item.destroy();
        return true;
    }
}

module.exports = new PaymentMethodService();
