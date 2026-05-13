const db = require('../models');
const { Op } = require('sequelize');

class TicketCategoryService {

    async getAll({ search } = {}) {
        const rows = await db.ticket_categories.findAll({
            include: [{
                model: db.ticket_types,
                as: 'ticket_types',
                attributes: ['Id', 'Name', 'Duration_Day', 'requiresFace']
            }],
            order: [['sort_order', 'ASC']]
        });

        if (!search) return rows;
        const q = search.toLowerCase();
        return rows.filter(r =>
            r.name?.toLowerCase().includes(q) ||
            r.code?.toLowerCase().includes(q)
        );
    }

    async getById(id) {
        return await db.ticket_categories.findByPk(id, {
            include: [{
                model: db.ticket_types,
                as: 'ticket_types',
                attributes: ['Id', 'Name', 'Duration_Day', 'requiresFace']
            }]
        });
    }

    async getStats() {
        const cats = await db.ticket_categories.findAll({
            include: [{
                model: db.ticket_types,
                as: 'ticket_types',
                attributes: ['Id']
            }],
            order: [['sort_order', 'ASC']]
        });

        return cats.map(c => ({
            Id: c.Id,
            code: c.code,
            name: c.name,
            typeCount: c.ticket_types?.length ?? 0
        }));
    }

    async create({ code, name, description, sort_order, requires_route, requires_kyc_default, is_active }) {
        if (!code || !name) throw new Error('Mã kiểu vé (code) và tên (name) là bắt buộc');

        const codeUp = code.toUpperCase().trim();

        const dupCode = await db.ticket_categories.findOne({ where: { code: codeUp } });
        if (dupCode) throw new Error(`Mã kiểu vé "${codeUp}" đã tồn tại`);

        const dupName = await db.ticket_categories.findOne({ where: { name: name.trim() } });
        if (dupName) throw new Error(`Tên kiểu vé "${name.trim()}" đã tồn tại`);

        return await db.ticket_categories.create({
            code: codeUp,
            name: name.trim(),
            description: description?.trim() || null,
            sort_order: sort_order ?? 0,
            requires_route: !!requires_route,
            requires_kyc_default: !!requires_kyc_default,
            is_active: is_active !== undefined ? !!is_active : true
        });
    }

    async update(id, { name, description, sort_order, requires_route, requires_kyc_default, is_active }) {
        const record = await db.ticket_categories.findByPk(id);
        if (!record) return null;

        const updates = {};
        if (name !== undefined) {
            const dup = await db.ticket_categories.findOne({
                where: { name: name.trim(), Id: { [Op.ne]: id } }
            });
            if (dup) throw new Error(`Tên "${name.trim()}" đã được sử dụng`);
            updates.name = name.trim();
        }
        if (description !== undefined) updates.description = description?.trim() || null;
        if (sort_order !== undefined) updates.sort_order = sort_order;
        if (requires_route !== undefined) updates.requires_route = !!requires_route;
        if (requires_kyc_default !== undefined) updates.requires_kyc_default = !!requires_kyc_default;
        if (is_active !== undefined) updates.is_active = !!is_active;

        return await record.update(updates);
    }

    async delete(id) {
        const record = await db.ticket_categories.findByPk(id, {
            include: [{ model: db.ticket_types, as: 'ticket_types', attributes: ['Id'] }]
        });
        if (!record) return { success: false, reason: 'not_found' };

        if (record.ticket_types?.length > 0) {
            return {
                success: false,
                reason: 'in_use',
                count: record.ticket_types.length
            };
        }

        await record.destroy();
        return { success: true };
    }

    async reorder(items) {
        // items: [{ Id, sort_order }]
        for (const item of items) {
            await db.ticket_categories.update(
                { sort_order: item.sort_order },
                { where: { Id: item.Id } }
            );
        }
        return true;
    }
}

module.exports = new TicketCategoryService();
