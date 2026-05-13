const db = require('../models');
const Employee = db.employees;
const User = db.users;
const Role = db.roles;
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const USER_ATTRIBUTES = ['id', 'name', 'phone', 'email', 'avatar', 'cccd_front','cccd_back', 'cccd_number', 'birthday', 'sex', 'address', 'id_Role', 'status', 'is_locked', 'created_at'];

class EmployeeService {
    static async getAllEmployees({ search = '', page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;

        // Build query: search across employee.username AND user.name / user.phone / user.cccd_number
        const includeUser = {
            model: User,
            attributes: USER_ATTRIBUTES,
            include: [{ model: Role, attributes: ['Id', 'Name'] }],
            required: !!search, // INNER JOIN when searching so we only get employees with matching users
        };

        const whereEmployee = {};
        const whereUser = {};

        if (search) {
            // Match username on employee side OR name/phone/cccd on user side
            // We achieve this by doing two separate queries and merging, or by using a subquery.
            // Cleanest Sequelize approach: search user fields via include.where + fallback username search:
            whereUser[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { cccd_number: { [Op.like]: `%${search}%` } },
            ];
            includeUser.where = whereUser;
            includeUser.required = false; // LEFT JOIN so username-only match still shows
            whereEmployee[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                // Match employees whose user matches — Sequelize handles via the LEFT JOIN above
                db.sequelize.literal(`EXISTS (
                    SELECT 1 FROM users u2
                    WHERE u2.id = \`employees\`.\`Id_User\`
                    AND (
                        u2.name LIKE '%${search.replace(/'/g, "''")}%'
                        OR u2.phone LIKE '%${search.replace(/'/g, "''")}%'
                        OR u2.cccd_number LIKE '%${search.replace(/'/g, "''")}%'
                    )
                )`)
            ];
            // Remove user include where since we handle it in literal
            delete includeUser.where;
            includeUser.required = false;
        }

        const { count, rows } = await Employee.findAndCountAll({
            where: whereEmployee,
            include: [includeUser],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['Id', 'ASC']],
            distinct: true,
        });
        return { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit), data: rows };
    }

    static async getEmployeeById(id) {
        return await Employee.findByPk(id, {
            include: [{ model: User, attributes: USER_ATTRIBUTES, include: [{ model: Role, attributes: ['Id', 'Name'] }] }]
        });
    }

    static async createEmployee(data) {
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        return await Employee.create(data);
    }

    // Cập nhật thông tin User + Employee (tách rõ 2 luồng)
    static async updateEmployee(id, { userFields = {}, employeeFields = {} }) {
        const employee = await Employee.findByPk(id, { include: [{ model: User }] });
        if (!employee) return null;

        // Cập nhật thông tin User (tên, SĐT, email, ...)
        if (Object.keys(userFields).length > 0 && employee.user) {
            delete userFields.password; // Không cho update password qua đây
            await employee.user.update(userFields);
        }

        // Cập nhật thông tin Employee (ca làm, username, ...)
        if (Object.keys(employeeFields).length > 0) {
            delete employeeFields.password;
            await employee.update(employeeFields);
        }

        return await EmployeeService.getEmployeeById(id);
    }

    // Cấp / Thay đổi Role cho nhân viên (thay đổi id_Role bên bảng users)
    static async changeRole(id, newRoleId) {
        const employee = await Employee.findByPk(id, { include: [{ model: User }] });
        if (!employee || !employee.user) return null;
        await employee.user.update({ id_Role: newRoleId });
        return await EmployeeService.getEmployeeById(id);
    }

    // Khóa / Mở khóa tài khoản nhân viên (đặt is_locked hoặc dùng status)
    static async toggleLock(id) {
        const employee = await Employee.findByPk(id, { include: [{ model: User }] });
        if (!employee || !employee.user) return null;
        const currentStatus = employee.user.is_locked || false;
        await employee.user.update({ is_locked: !currentStatus });
        return await EmployeeService.getEmployeeById(id);
    }

    // Đặt lại mật khẩu nhân viên (Admin)
    static async resetPassword(id, newPassword) {
        const employee = await Employee.findByPk(id);
        if (!employee) return null;
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        await employee.update({ password: hashed });
        return { success: true, message: 'Đã đặt lại mật khẩu thành công' };
    }

    // Nhân viên tự đổi mật khẩu
    static async changePassword(id, oldPassword, newPassword) {
        const employee = await Employee.findByPk(id);
        if (!employee) return { success: false, message: 'Không tìm thấy nhân viên' };
        
        const isMatch = await bcrypt.compare(oldPassword, employee.password);
        if (!isMatch) return { success: false, message: 'Mật khẩu hiện tại không đúng' };

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        await employee.update({ password: hashed });
        return { success: true, message: 'Đổi mật khẩu thành công' };
    }

    // Xóa mềm (soft delete) — xoá bản ghi employee nhưng giữ user
    static async deleteEmployee(id) {
        const employee = await Employee.findByPk(id);
        if (!employee) return null;
        await employee.destroy();
        return true;
    }

    // Thống kê theo role
    static async getStats() {
        const total = await Employee.count();
        const byRole = await User.findAll({
            attributes: ['id_Role'],
            include: [
                { model: Employee, attributes: [], required: true },
                { model: Role, attributes: ['Name'] }
            ],
            group: ['id_Role', 'role.Id', 'role.Name'],
            raw: true
        });
        return { total, byRole };
    }
}

module.exports = EmployeeService;
