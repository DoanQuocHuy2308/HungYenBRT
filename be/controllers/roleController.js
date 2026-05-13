const RoleService = require('../services/roleService');

class RoleController {
    static async getAllRoles(req, res) {
        try {
            const roles = await RoleService.getAllRoles();
            res.status(200).json({ success: true, data: roles });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getRoleById(req, res) {
        try {
            const role = await RoleService.getRoleById(req.params.id);
            if (!role) {
                return res.status(404).json({ success: false, message: 'Role not found' });
            }
            res.status(200).json({ success: true, data: role });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async createRole(req, res) {
        try {
            const newRole = await RoleService.createRole(req.body);
            res.status(201).json({ success: true, data: newRole });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateRole(req, res) {
        try {
            const updatedRole = await RoleService.updateRole(req.params.id, req.body);
            if (!updatedRole) {
                return res.status(404).json({ success: false, message: 'Role not found' });
            }
            res.status(200).json({ success: true, data: updatedRole });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteRole(req, res) {
        try {
            const deleted = await RoleService.deleteRole(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Role not found' });
            }
            res.status(200).json({ success: true, message: 'Role deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = RoleController;
