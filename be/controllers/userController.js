const UserService = require('../services/userService');
const { ValidationError } = require('sequelize');

class UserController {
    // GET /users/customers?search=&page=&limit=
    static async getAllCustomers(req, res) {
        try {
            const { search, page, limit } = req.query;
            const result = await UserService.getAllCustomers({ search, page, limit });
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /users — tất cả users (admin use)
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.status(200).json({ success: true, data: users });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /users/:id
    static async getUserById(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /users/by-cccd/:cccd
    static async getUserByCCCD(req, res) {
        try {
            const user = await UserService.getUserByCCCD(req.params.cccd);
            if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với số CCCD này' });
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // POST /users
    static async createUser(req, res) {
        try {
            const newUser = await UserService.createUser(req.body);
            res.status(201).json({ success: true, data: newUser });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ success: false, message: error.errors.map(e => e.message).join(', ') });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT /users/:id — cập nhật thông tin (trừ CCCD và password)
    static async updateUser(req, res) {
        try {
            const updated = await UserService.updateUser(req.params.id, req.body);
            if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updated });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ success: false, message: error.errors.map(e => e.message).join(', ') });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT /users/profile/:id — cập nhật thông tin cá nhân (Email, Mật khẩu, Avatar)
    static async updateProfile(req, res) {
        try {
            const { email, currentPassword, newPassword } = req.body;
            let avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

            const updated = await UserService.updateProfile(req.params.id, {
                email, currentPassword, newPassword, avatarPath
            });
            
            res.status(200).json({ success: true, message: 'Cập nhật thông tin thành công', data: updated });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // PATCH /users/:id/toggle-lock — Khóa / Mở khóa tài khoản khách hàng
    static async toggleLock(req, res) {
        try {
            const result = await UserService.toggleLock(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            const action = result.is_locked ? 'Đã khóa' : 'Đã mở khóa';
            res.status(200).json({ success: true, message: `${action} tài khoản ${result.name}`, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // DELETE /users/:id
    static async deleteUser(req, res) {
        try {
            const deleted = await UserService.deleteUser(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.status(200).json({ 
                success: true, 
                message: 'Đã xóa tài khoản và toàn bộ dữ liệu liên quan (vé, lịch sử quét, đăng ký giảm giá, ảnh CCCD) thành công' 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi xóa người dùng: ' + error.message });
        }
    }

    // GET /users/stats
    static async getStats(req, res) {
        try {
            const stats = await UserService.getStats();
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = UserController;
