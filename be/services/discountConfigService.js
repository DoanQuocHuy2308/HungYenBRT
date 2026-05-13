const db = require('../models');

class DiscountConfigService {
    // Lấy tất cả loại ưu đãi kèm các field cấu hình
    async getAllTypesWithFields() {
        return await db.discount_types.findAll({
            include: [{ 
                model: db.discount_fields,
                as: 'discount_fields'
            }],
            order: [['sort_order', 'ASC'], ['Id', 'ASC']]
        });
    }

    // Tạo mới hoặc cập nhật 1 loại ưu đãi
    async upsertType(data) {
        if (data.Id) {
            const type = await db.discount_types.findByPk(data.Id);
            if (!type) throw new Error('Không tìm thấy loại ưu đãi');
            return await type.update(data);
        }
        return await db.discount_types.create(data);
    }

    // Xóa loại ưu đãi
    async deleteType(id) {
        const type = await db.discount_types.findByPk(id);
        if (!type) throw new Error('Không tìm thấy bản ghi');
        return await type.destroy();
    }

    // Quản lý Fields cho 1 loại ưu đãi
    async syncFields(id_Discount_Type, fields) {
        const transaction = await db.sequelize.transaction();
        try {
            // Xóa các field cũ không còn trong danh sách gửi lên (nếu có id)
            const incomingIds = fields.filter(f => f.id).map(f => f.id);
            await db.discount_fields.destroy({
                where: {
                    id_Discount_Type,
                    id: { [db.Sequelize.Op.notIn]: incomingIds }
                },
                transaction
            });

            // Cập nhật hoặc tạo mới
            for (const f of fields) {
                if (f.id) {
                    await db.discount_fields.update(f, { 
                        where: { id: f.id, id_Discount_Type },
                        transaction 
                    });
                } else {
                    await db.discount_fields.create({
                        ...f,
                        id_Discount_Type
                    }, { transaction });
                }
            }

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new DiscountConfigService();
