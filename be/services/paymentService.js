const db = require('../models');

class PaymentService {
    async getAll() {
        return await db.payments.findAll({
            include: [{ 
                model: db.tickets, 
                as: 'tickets',
                attributes: ['Id', 'total_quantity', 'status'],
                include: [
                    { model: db.users, as: 'user', attributes: ['name', 'phone'] },
                    { model: db.employees, as: 'employee', attributes: ['username'] }
                ]
            }],
            order: [['created_at', 'DESC']]
        });
    }

    async getStats() {
        // Query to calculate Total Revenue and Transaction Count
        const totalStats = await db.payments.findOne({
            attributes: [
                [db.sequelize.fn('SUM', db.sequelize.col('Amount')), 'total_revenue'],
                [db.sequelize.fn('COUNT', db.sequelize.col('Id')), 'total_transactions']
            ],
            raw: true
        });

        // Query to group revenue by PaymentMethod (Cash vs Banking/QR)
        const methodStats = await db.payments.findAll({
            attributes: [
                'PaymentMethod',
                [db.sequelize.fn('SUM', db.sequelize.col('Amount')), 'revenue'],
                [db.sequelize.fn('COUNT', db.sequelize.col('Id')), 'count']
            ],
            group: ['PaymentMethod'],
            raw: true
        });

        return {
            totalRevenue: Number(totalStats.total_revenue) || 0,
            totalTransactions: Number(totalStats.total_transactions) || 0,
            paymentMethods: methodStats.map(m => ({
                method: m.PaymentMethod,
                revenue: Number(m.revenue) || 0,
                count: Number(m.count) || 0
            }))
        };
    }

    async getById(id) {
        return await db.payments.findByPk(id, {
            include: [{ model: db.tickets }]
        });
    }

    async create(data) {
        return await db.payments.create(data);
    }

    async update(id, data) {
        const payment = await db.payments.findByPk(id);
        if (!payment) return null;
        return await payment.update(data);
    }

    async delete(id) {
        const payment = await db.payments.findByPk(id);
        if (!payment) return false;
        await payment.destroy();
        return true;
    }
}

module.exports = new PaymentService();
