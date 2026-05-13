const LocationService = require('../services/locationService');

class LocationController {

    async getAll(req, res) {
        try {
            const { search, stats } = req.query;
            const result = await LocationService.getAll({
                search: search || '',
                includeStats: stats === 'true'
            });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu trạm' });
        }
    }

    async getById(req, res) {
        try {
            const data = await LocationService.getById(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy trạm' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async getStats(req, res) {
        try {
            const data = await LocationService.getStats();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê' });
        }
    }

    async create(req, res) {
        try {
            const data = await LocationService.create(req.body);
            res.status(201).json({ success: true, message: 'Tạo trạm thành công', data });
        } catch (error) {
            console.error(error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
        }
    }

    async update(req, res) {
        try {
            const data = await LocationService.update(req.params.id, req.body);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy trạm cần cập nhật' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async updateCoordinates(req, res) {
        try {
            const { latitude, longitude } = req.body;
            const data = await LocationService.updateCoordinates(req.params.id, { latitude, longitude });
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy trạm' });
            }
            res.status(200).json({ success: true, message: 'Đã cập nhật tọa độ GPS', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async swapOrder(req, res) {
        try {
            const { id1, id2 } = req.body;
            if (!id1 || !id2) {
                return res.status(400).json({ success: false, message: 'Cần cung cấp id1 và id2' });
            }
            const ok = await LocationService.swapOrder(id1, id2);
            if (!ok) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy một trong hai trạm' });
            }
            res.status(200).json({ success: true, message: 'Đã đổi vị trí hai trạm' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async reorder(req, res) {
        try {
            const { items } = req.body; // [{ id, order_index }]
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, message: 'Dữ liệu reorder không hợp lệ' });
            }
            await LocationService.reorder(items);
            res.status(200).json({ success: true, message: 'Đã cập nhật thứ tự trạm' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const success = await LocationService.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy trạm cần xóa' });
            }
            res.status(200).json({ success: true, message: 'Xóa trạm thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server (Có thể trạm đang được sử dụng trong vé)' });
        }
    }
}

module.exports = new LocationController();
