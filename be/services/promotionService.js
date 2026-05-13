const db = require('../models');
const { Op } = require('sequelize');

class PromotionService {
    async getAll({ search, status } = {}) {
        const where = {};
        if (search) {
            where[Op.or] = [
                { Code: { [Op.like]: `%${search}%` } },
                { Name: { [Op.like]: `%${search}%` } },
                { Description: { [Op.like]: `%${search}%` } }
            ];
        }

        const now = new Date();

        // Status based filtering logic
        if (status === 'active') {
            where.isActive = true;
            where.StartDate = { [Op.lte]: now };
            where.EndDate = { [Op.gte]: now };
        } else if (status === 'expired') {
            where[Op.or] = [
                { isActive: false },
                { EndDate: { [Op.lt]: now } }
            ];
        } else if (status === 'scheduled') {
            where.isActive = true;
            where.StartDate = { [Op.gt]: now };
        }

        return await db.promotions.findAll({
            where,
            order: [['created_at', 'DESC']]
        });
    }

    async getByCode(code) {
        return await db.promotions.findByPk(code);
    }

    async create(data) {
        return await db.promotions.create(data);
    }

    async update(code, data) {
        const promo = await db.promotions.findByPk(code);
        if (!promo) return null;
        return await promo.update(data);
    }

    async delete(code) {
        const promo = await db.promotions.findByPk(code);
        if (!promo) return false;
        await promo.destroy();
        return true;
    }

    async getStats() {
        const now = new Date();
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const total = await db.promotions.count();
        const active = await db.promotions.count({
            where: {
                isActive: true,
                StartDate: { [Op.lte]: now },
                EndDate: { [Op.gte]: now }
            }
        });

        const expiringSoon = await db.promotions.count({
            where: {
                isActive: true,
                EndDate: {
                    [Op.gte]: now,
                    [Op.lte]: next7Days
                }
            }
        });

        const scheduled = await db.promotions.count({
            where: {
                isActive: true,
                StartDate: { [Op.gt]: now }
            }
        });

        return {
            total,
            active,
            expiringSoon,
            scheduled
        };
    }
}

module.exports = new PromotionService();
