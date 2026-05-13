const db = require('../models');
const { Op } = require('sequelize');

class LocationService {

    // Lấy tất cả trạm, sort theo order_index
    async getAll({ search, includeStats } = {}) {
        const where = {};
        if (search) {
            where[Op.or] = [
                { Name: { [Op.like]: `%${search}%` } },
                { station_code: { [Op.like]: `%${search}%` } },
                { Description: { [Op.like]: `%${search}%` } }
            ];
        }

        const locations = await db.locations.findAll({
            where,
            order: [['order_index', 'ASC'], ['Id', 'ASC']]
        });

        if (!includeStats) return locations;

        // Kèm thống kê mở rộng
        const total = locations.length;
        const hasGps = locations.filter(l => l.latitude && l.longitude).length;
        return {
            data: locations,
            stats: {
                total,
                hasGps,
                noGps: total - hasGps
            }
        };
    }

    async getById(id) {
        return await db.locations.findByPk(id);
    }

    // Tạo mới, tự generate order_index nếu không truyền
    async create(data) {
        const { Name, station_code, Description, latitude, longitude, order_index } = data;
        if (!Name) throw new Error('Tên trạm là bắt buộc');

        let finalOrder = order_index;
        if (finalOrder === undefined || finalOrder === null) {
            const maxOrder = await db.locations.max('order_index') || 0;
            finalOrder = maxOrder + 1;
        }

        return await db.locations.create({
            Name,
            station_code: station_code || null,
            Description: Description || null,
            latitude: latitude || null,
            longitude: longitude || null,
            order_index: finalOrder
        });
    }

    async update(id, data) {
        const location = await db.locations.findByPk(id);
        if (!location) return null;

        const allowed = ['Name', 'station_code', 'Description', 'latitude', 'longitude', 'order_index'];
        const updates = {};
        allowed.forEach(key => {
            if (data[key] !== undefined) updates[key] = data[key];
        });

        return await location.update(updates);
    }

    // Cập nhật chỉ tọa độ GPS
    async updateCoordinates(id, { latitude, longitude }) {
        const location = await db.locations.findByPk(id);
        if (!location) return null;
        return await location.update({ latitude, longitude });
    }

    // Đổi số thứ tự 2 trạm (swap order)
    async swapOrder(id1, id2) {
        const loc1 = await db.locations.findByPk(id1);
        const loc2 = await db.locations.findByPk(id2);
        if (!loc1 || !loc2) return false;

        const temp = loc1.order_index;
        await loc1.update({ order_index: loc2.order_index });
        await loc2.update({ order_index: temp });
        return true;
    }

    // Reorder hàng loạt: nhận array [{ id, order_index }]
    async reorder(items) {
        const updates = items.map(({ id, order_index }) =>
            db.locations.update({ order_index }, { where: { Id: id } })
        );
        await Promise.all(updates);
        return true;
    }

    async delete(id) {
        const location = await db.locations.findByPk(id);
        if (!location) return false;
        await location.destroy();
        return true;
    }

    // Thống kê tổng quan
    async getStats() {
        const total = await db.locations.count();
        const hasGps = await db.locations.count({
            where: {
                latitude: { [Op.not]: null },
                longitude: { [Op.not]: null }
            }
        });
        return {
            total,
            hasGps,
            noGps: total - hasGps
        };
    }
}

module.exports = new LocationService();
