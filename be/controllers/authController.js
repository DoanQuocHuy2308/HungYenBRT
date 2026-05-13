const AuthService = require('../services/authService');
const { ValidationError } = require('sequelize');

class AuthController {
    static async loginEmployee(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp username và password' });
            }

            const result = await AuthService.loginEmployee(username, password);
            if (!result.success) {
                return res.status(result.status).json({ success: false, message: result.message });
            }

            res.status(result.status).json({
                success: true,
                message: result.message,
                token: result.token,
                data: result.data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    }

    static async logout(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ success: false, message: 'Thiếu userId' });
            }
            const result = await AuthService.logout(userId);
            res.status(result.status).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    }

    static async loginCustomer(req, res) {
        try {
            const { cccd_number, password } = req.body;
            if (!cccd_number || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Số Căn Cước và Mật khẩu' });
            }

            const result = await AuthService.loginCustomer(cccd_number, password);
            if (!result.success) {
                return res.status(result.status).json({ success: false, message: result.message });
            }

            res.status(result.status).json({
                success: true,
                message: result.message,
                token: result.token,
                data: result.data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    }

    static async registerCustomer(req, res) {
        try {
            const {
                name, email, phone, birthday, sex, cccd_number, issue_date, address, id_Role, status, password
            } = req.body;

            const avatar = req.files && req.files['avatar'] ? `/uploads/${req.files['avatar'][0].filename}` : null;
            const cccd_front = req.files && req.files['cccd_front'] ? `/uploads/${req.files['cccd_front'][0].filename}` : req.body.cccd_front;
            const cccd_back = req.files && req.files['cccd_back'] ? `/uploads/${req.files['cccd_back'][0].filename}` : req.body.cccd_back;

            if (!name || !phone || !cccd_number || !password || !birthday || !sex || !address || !cccd_front || !cccd_back || !issue_date || !id_Role) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' });
            }

            const userData = { name, email, phone, birthday, sex, cccd_number, avatar, cccd_front, cccd_back, issue_date, address, id_Role, status, password };

            const result = await AuthService.registerCustomer(userData);
            if (!result.success) {
                return res.status(result.status).json({ success: false, message: result.message });
            }

            res.status(result.status).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                const messages = error.errors.map(e => e.message).join(', ');
                return res.status(400).json({ success: false, message: messages });
            }
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    }

    static async registerProxy(req, res) {
        // Sử dụng chung logic service với đăng ký khách hàng như yêu cầu
        return AuthController.registerCustomer(req, res);
    }

    static async registerEmployee(req, res) {
        try {
            const {
                name, email, phone, birthday, sex, cccd_number, issue_date, address, id_Role, status,
                username, password, shiftStart, shiftEnd, user_password
            } = req.body;

            const avatar = req.files && req.files['avatar'] ? `/uploads/${req.files['avatar'][0].filename}` : null;
            const cccd_front = req.files && req.files['cccd_front'] ? `/uploads/${req.files['cccd_front'][0].filename}` : req.body.cccd_front;
            const cccd_back = req.files && req.files['cccd_back'] ? `/uploads/${req.files['cccd_back'][0].filename}` : req.body.cccd_back;

            if (!name || !phone || !cccd_number || !birthday || !sex || !address || !cccd_front || !cccd_back || !issue_date || !id_Role || !username || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc cho nhân viên' });
            }

            const userData = { name, email, phone, birthday, sex, cccd_number, avatar, cccd_front, cccd_back, issue_date, address, id_Role, status, password: user_password || "123456" };
            const employeeData = { username, password, shiftStart, shiftEnd };

            const result = await AuthService.registerEmployee(userData, employeeData);
            if (!result.success) {
                return res.status(result.status).json({ success: false, message: result.message });
            }

            res.status(result.status).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                const messages = error.errors.map(e => e.message).join(', ');
                return res.status(400).json({ success: false, message: messages });
            }
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    }
}

module.exports = AuthController;
