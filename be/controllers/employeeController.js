const EmployeeService = require('../services/employeeService');
const AuthService = require('../services/authService');
const { ValidationError } = require('sequelize');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Chỉ cho phép upload ảnh!'));
}});

class EmployeeController {
    // GET /employees?search=&page=&limit=
    static async getAllEmployees(req, res) {
        try {
            const { search, page, limit } = req.query;
            const result = await EmployeeService.getAllEmployees({ search, page, limit });
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /employees/:id
    static async getEmployeeById(req, res) {
        try {
            const employee = await EmployeeService.getEmployeeById(req.params.id);
            if (!employee) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
            res.status(200).json({ success: true, data: employee });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // POST /employees — Tạo nhân viên mới (dùng authService.registerEmployee)
    static async createEmployee(req, res) {
        try {
            const {
                name, email, phone, birthday, sex, cccd_number, issue_date, address, id_Role,
                username, password, shiftStart, shiftEnd, user_password
            } = req.body;

            const avatar = req.files?.['avatar']?.[0] ? `/uploads/${req.files['avatar'][0].filename}` : null;
            const cccd_front = req.files?.['cccd_front']?.[0] ? `/uploads/${req.files['cccd_front'][0].filename}` : req.body.cccd_front;
            const cccd_back = req.files?.['cccd_back']?.[0] ? `/uploads/${req.files['cccd_back'][0].filename}` : req.body.cccd_back;

            if (!name || !phone || !cccd_number || !birthday || !sex || !address || !issue_date || !id_Role || !username || !password) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc cho nhân viên' });
            }
            if (!cccd_front || !cccd_back) {
                return res.status(400).json({ success: false, message: 'Cần upload ảnh CCCD 2 mặt' });
            }

            const userData = { name, email, phone, birthday, sex, cccd_number, avatar, cccd_front, cccd_back, issue_date, address, id_Role, password: user_password || '123456' };
            const employeeData = { username, password, shiftStart, shiftEnd };

            const result = await AuthService.registerEmployee(userData, employeeData);
            if (!result.success) return res.status(result.status).json({ success: false, message: result.message });

            res.status(201).json({ success: true, message: result.message, data: result.data });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ success: false, message: error.errors.map(e => e.message).join(', ') });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT /employees/:id — Cập nhật thông tin nhân viên
    static async updateEmployee(req, res) {
        try {
            let { userFields, employeeFields } = req.body;
            
            // Nếu gửi bằng FormData, các trường này có thể là chuỗi JSON
            if (typeof userFields === 'string') userFields = JSON.parse(userFields);
            if (typeof employeeFields === 'string') employeeFields = JSON.parse(employeeFields);
            
            userFields = userFields || {};
            employeeFields = employeeFields || {};

            if (req.files?.['avatar']?.[0]) {
                userFields.avatar = `/uploads/${req.files['avatar'][0].filename}`;
            }

            const updated = await EmployeeService.updateEmployee(req.params.id, { userFields, employeeFields });
            if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updated });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ success: false, message: error.errors.map(e => e.message).join(', ') });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PATCH /employees/:id/role — Cấp / thay đổi quyền
    static async changeRole(req, res) {
        try {
            const { roleId } = req.body;
            if (!roleId) return res.status(400).json({ success: false, message: 'Thiếu roleId' });
            const updated = await EmployeeService.changeRole(req.params.id, roleId);
            if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
            res.status(200).json({ success: true, message: 'Đã cập nhật quyền thành công', data: updated });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PATCH /employees/:id/toggle-lock — Khóa / Mở khóa tài khoản
    static async toggleLock(req, res) {
        try {
            const result = await EmployeeService.toggleLock(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
            const action = result.user?.is_locked ? 'Đã khóa' : 'Đã mở khóa';
            res.status(200).json({ success: true, message: `${action} tài khoản thành công`, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PATCH /employees/:id/reset-password — Đặt lại mật khẩu
    static async resetPassword(req, res) {
        try {
            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ success: false, message: 'Mật khẩu mới phải ít nhất 6 ký tự' });
            }
            const result = await EmployeeService.resetPassword(req.params.id, newPassword);
            if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
            res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PATCH /employees/:id/change-password — Nhân viên tự đổi mật khẩu
    static async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword || newPassword.length < 6) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ mật khẩu cũ và mật khẩu mới (ít nhất 6 ký tự)' });
            }
            const result = await EmployeeService.changePassword(req.params.id, oldPassword, newPassword);
            if (!result.success) return res.status(400).json(result);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // DELETE /employees/:id
    static async deleteEmployee(req, res) {
        try {
            const deleted = await EmployeeService.deleteEmployee(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
            res.status(200).json({ success: true, message: 'Đã xóa nhân viên thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /employees/stats
    static async getStats(req, res) {
        try {
            const stats = await EmployeeService.getStats();
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = EmployeeController;
