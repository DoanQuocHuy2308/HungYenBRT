const db = require('../models');
const { Op } = require('sequelize');

class TicketLogService {

    async getByTicket(ticketId) {
        return await db.ticket_logs.findAll({
            where: { Id_Ticket: ticketId },
            include: [
                { model: db.locations, as: 'location', attributes: ['Id', 'Name', 'Description'] }
            ],
            order: [['scan_time', 'ASC']]
        });
    }

    async getAll({ location_id, status, scan_direction, date_from, date_to, page = 1, limit = 50 } = {}) {
        const where = {};
        if (location_id) where.location_id = Number(location_id);
        if (status)      where.status = status;
        if (scan_direction) where.scan_direction = scan_direction;

        if (date_from || date_to) {
            where.scan_time = {};
            if (date_from) where.scan_time[Op.gte] = new Date(date_from);
            if (date_to) {
                const end = new Date(date_to);
                end.setHours(23, 59, 59, 999);
                where.scan_time[Op.lte] = end;
            }
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await db.ticket_logs.findAndCountAll({
            where,
            include: [
                {
                    model: db.locations,
                    as: 'location',
                    attributes: ['Id', 'Name']
                },
                {
                    model: db.ticket_details,
                    as: 'ticket',
                    attributes: ['Id', 'qr_token', 'status'],
                    required: false
                }
            ],
            order: [['scan_time', 'DESC']],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        return {
            total: count,
            page:  parseInt(page),
            limit: parseInt(limit),
            data:  rows
        };
    }

    async getStats({ date_from, date_to } = {}) {
        const where = {};
        if (date_from || date_to) {
            where.scan_time = {};
            if (date_from) where.scan_time[Op.gte] = new Date(date_from);
            if (date_to) {
                const end = new Date(date_to);
                end.setHours(23, 59, 59, 999);
                where.scan_time[Op.lte] = end;
            }
        }

        const [total, entry, exit_, check_, valid, invalid, surcharge] = await Promise.all([
            db.ticket_logs.count({ where }),
            db.ticket_logs.count({ where: { ...where, scan_direction: 'ENTRY' } }),
            db.ticket_logs.count({ where: { ...where, scan_direction: 'EXIT'  } }),
            db.ticket_logs.count({ where: { ...where, scan_direction: 'CHECK' } }),
            db.ticket_logs.count({ where: { ...where, status: 'valid' } }),
            db.ticket_logs.count({ where: { ...where, status: { [Op.ne]: 'valid' } } }),
            db.ticket_logs.sum('surcharge_amount', { where })
        ]);

        return {
            total,
            entry,
            exit:     exit_,
            check:    check_,
            valid,
            invalid,
            surcharge: Number(surcharge) || 0
        };
    }
}

module.exports = new TicketLogService();
