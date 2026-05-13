const db = require('../models');
const Role = db.roles;

class RoleService {
    // Lấy tất cả roles
    static async getAllRoles() {
        try {
            return await Role.findAll();
        } catch (error) {
            throw error;
        }
    }

    // Lấy role theo ID
    static async getRoleById(id) {
        try {
            return await Role.findByPk(id);
        } catch (error) {
            throw error;
        }
    }

    // Tạo mới role
    static async createRole(data) {
        try {
            return await Role.create({
                Name: data.Name,
                Description: data.Description
            });
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật role
    static async updateRole(id, data) {
        try {
            const role = await Role.findByPk(id);
            if (!role) {
                return null;
            }
            return await role.update({
                Name: data.Name !== undefined ? data.Name : role.Name,
                Description: data.Description !== undefined ? data.Description : role.Description
            });
        } catch (error) {
            throw error;
        }
    }

    // Xóa role
    static async deleteRole(id) {
        try {
            const role = await Role.findByPk(id);
            if (!role) {
                return null;
            }
            await role.destroy();
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RoleService;
