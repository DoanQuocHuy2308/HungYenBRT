const db = require('../models');
const User = db.users;
const Role = db.roles;
const Employee = db.employees;
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const faceRecognitionService = require('./faceRecognitionService');

const SAFE_ATTRIBUTES = ['id', 'name', 'phone', 'email', 'avatar', 'cccd_number', 'birthday', 'sex', 'address', 'id_Role', 'status', 'is_locked', 'is_face_registered', 'issue_date', 'created_at', 'cccd_front', 'cccd_back'];

class UserService {
    // Lấy danh sách khách hàng (id_Role = 3) có phân trang & tìm kiếm
    static async getAllCustomers({ search = '', page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const where = { id_Role: 3 }; // Chỉ lấy Khách Hàng
        if (search) {
            where[Op.and] = [{
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } },
                    { cccd_number: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            }];
        }
        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: SAFE_ATTRIBUTES,
            include: [{ model: Role, attributes: ['Id', 'Name'] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        return { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit), data: rows };
    }

    static async getAllUsers() {
        return await User.findAll({
            attributes: SAFE_ATTRIBUTES,
            include: [{ model: Role, attributes: ['Id', 'Name'] }],
            order: [['created_at', 'DESC']]
        });
    }

    static async getUserById(id) {
        return await User.findByPk(id, {
            attributes: SAFE_ATTRIBUTES,
            include: [{ model: Role, attributes: ['Id', 'Name'] }]
        });
    }

    static async getUserByCCCD(cccd) {
        return await User.findOne({
            where: { cccd_number: cccd },
            attributes: SAFE_ATTRIBUTES,
            include: [{ model: Role, attributes: ['Id', 'Name'] }]
        });
    }

    static async createUser(data) {
        if (!data.email || data.email.trim() === '') {
            data.email = null;
        }
        return await User.create(data);
    }

    static async updateUser(id, data) {
        const user = await User.findByPk(id);
        if (!user) return null;
        delete data.password; // Không cho thay đổi password qua đây
        delete data.cccd_number; // CCCD không được đổi sau khi KYC
        
        // Xử lý email rỗng
        if (data.email !== undefined && (data.email === null || data.email.trim() === '')) {
            data.email = null;
        }

        return await user.update(data);
    }

    static async updateProfile(id, { email, currentPassword, newPassword, avatarPath }) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('Không tìm thấy người dùng');

        const updateData = {};
        
        if (email !== undefined) {
            updateData.email = email.trim() === '' ? null : email;
        }
        
        if (avatarPath) {
            // Xóa ảnh avatar cũ khỏi disk nếu có
            if (user.avatar) {
                const oldFilePath = path.join(__dirname, '../', user.avatar.replace(/^\//, ''));
                if (fs.existsSync(oldFilePath)) {
                    try { fs.unlinkSync(oldFilePath); } catch (e) { /* bỏ qua nếu xóa lỗi */ }
                }
            }
            updateData.avatar = avatarPath;
        }

        if (newPassword) {
            if (!currentPassword) {
                throw new Error('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu');
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new Error('Mật khẩu hiện tại không đúng');
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(newPassword, salt);
        }

        await user.update(updateData);
        
        // Nếu có cập nhật Avatar, gọi service để trích xuất đặc trưng khuôn mặt (MTCNN + FaceNet)
        if (avatarPath) {
            // Không đợi bằng await để API không bị chậm
            faceRecognitionService.registerUserFace(id, avatarPath)
                .then(res => console.log(`[FaceRegistration] User ${id}:`, res))
                .catch(err => console.error(`[FaceRegistration] Lỗi:`, err));
        }

        // Trả về thông tin không có password
        const updatedUser = user.toJSON();
        delete updatedUser.password;
        return updatedUser;
    }

    // Khóa / Mở khóa tài khoản khách hàng
    static async toggleLock(id) {
        const user = await User.findByPk(id);
        if (!user) return null;
        const newStatus = !user.is_locked;
        await user.update({ is_locked: newStatus });
        return { id, is_locked: newStatus, name: user.name };
    }

    static async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) return null;
        await user.destroy();
        return true;
    }

    // Thống kê: tổng khách hàng, tổng nhân viên, ...
    static async getStats() {
        const totalCustomers = await User.count({ where: { id_Role: 3 } });
        const totalEmployees = await Employee.count();
        const faceRegistered = await User.count({ where: { id_Role: 3, is_face_registered: true } });
        const newThisMonth = await User.count({
            where: {
                id_Role: 3,
                created_at: { [Op.gte]: new Date(new Date().setDate(1)) }
            }
        });
        return { totalCustomers, totalEmployees, faceRegistered, newThisMonth };
    }
}

module.exports = UserService;
