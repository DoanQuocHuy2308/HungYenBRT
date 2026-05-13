const db = require('../models');
const { Op } = require('sequelize');

// Sinh mã voucher độc nhất: dạng "SV-AB12-X4K7"
function generateVoucherCode(prefix = 'UD') {
    const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${rand()}-${rand()}`;
}

class DiscountRegistrationService {
    // Admin: Lấy tất cả hồ sơ với bộ lọc
    async getAllRegistrations({ status, search } = {}) {
        const where = {};
        if (status && status !== 'all') {
            where.status = status;
        }

        const include = [
            { model: db.users, as: 'user', attributes: ['name', 'email', 'phone'] },
            { model: db.discount_types, as: 'discount_type', attributes: ['Name'] },
            { model: db.promotions, as: 'promotion', attributes: ['Code', 'Name'] }
        ];

        if (search) {
            include[0].where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        return await db.discount_registrations.findAll({
            where,
            include,
            order: [['registration_Date', 'DESC']]
        });
    }

    // Lấy chi tiết 1 hồ sơ kèm các giấy tờ (field values)
    async getRegistrationById(id) {
        return await db.discount_registrations.findByPk(id, {
            include: [
                { model: db.users, as: 'user' },
                { model: db.discount_types, as: 'discount_type' },
                {
                    model: db.discount_field_values,
                    as: 'field_values',
                    include: [{ model: db.discount_fields, as: 'discount_field' }]
                },
                { model: db.promotions, as: 'promotion' }
            ]
        });
    }

    // Lấy danh sách các đơn đang chờ duyệt (Rút gọn)
    async getPendingRegistrations() {
        return await this.getAllRegistrations({ status: 'pending' });
    }

    // Lấy danh sách đơn của 1 User cụ thể
    async getMyRegistrations(id_User) {
        return await db.discount_registrations.findAll({
            where: { id_User },
            include: [
                { model: db.discount_types, as: 'discount_type', attributes: ['Name'] },
                {
                    model: db.discount_field_values,
                    as: 'field_values',
                    include: [{ model: db.discount_fields, as: 'discount_field' }]
                }
            ],
            order: [['registration_Date', 'DESC']]
        });
    }

    // Nộp đơn đăng ký kèm các fieldValues
    async applyForDiscount(id_User, id_Discount_Type, fieldValues) {
        const transaction = await db.sequelize.transaction();
        try {
            const newReg = await db.discount_registrations.create({
                id_User,
                id_Discount_Type,
                status: 'pending',
                registration_Date: new Date()
            }, { transaction });

            const valuesWithRegId = fieldValues.map(fv => ({
                id_discountRegistration: newReg.id,
                id_Discount_Field: fv.id_Discount_Field,
                field_Value: fv.field_Value
            }));

            if (valuesWithRegId.length > 0) {
                await db.discount_field_values.bulkCreate(valuesWithRegId, { transaction });
            }

            await transaction.commit();
            return newReg;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Duyệt/Từ chối hồ sơ
    async updateStatus(id, updateData) {
        const transaction = await db.sequelize.transaction();
        try {
            const reg = await db.discount_registrations.findByPk(id, {
                include: [{ model: db.discount_types, as: 'discount_type' }],
                transaction
            });
            if (!reg) throw new Error('Không tìm thấy hồ sơ');

            const payload = {
                status: updateData.status,
                validation_Date: new Date()
            };

            if (updateData.status === 'approved') {
                payload.expiry_date = updateData.expiry_date;
                if (updateData.approved_by) payload.approved_by = updateData.approved_by;

                if (!reg.PromotionCode) {
                    // Sinh mã mới
                    let prefix = 'UD';
                    if (reg.discount_type?.Code) prefix = reg.discount_type.Code.substring(0, 3).toUpperCase();
                    else if (reg.discount_type?.Name) prefix = reg.discount_type.Name.substring(0, 2).toUpperCase();

                    let code = generateVoucherCode(prefix);
                    while (await db.discount_registrations.findOne({ where: { PromotionCode: code } })) {
                        code = generateVoucherCode(prefix);
                    }
                    payload.PromotionCode = code;

                    // Tạo bản ghi promotions để thỏa FK tickets.code_promotion → promotions.Code
                    await _upsertPromotionRecord(code, reg, updateData.expiry_date, transaction);
                } else {
                    payload.PromotionCode = reg.PromotionCode;
                    // Đảm bảo promotions record tồn tại cho mã cũ
                    const already = await db.promotions.findByPk(reg.PromotionCode, { transaction });
                    if (!already) {
                        await _upsertPromotionRecord(reg.PromotionCode, reg, updateData.expiry_date, transaction);
                    }
                }
            } else if (updateData.status === 'rejected') {
                payload.rejected_reason = updateData.rejected_reason;
            }

            await reg.update(payload, { transaction });
            await transaction.commit();
            return reg;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async delete(id) {
        const reg = await db.discount_registrations.findByPk(id);
        if (!reg) return false;
        await db.discount_field_values.destroy({ where: { id_discountRegistration: id } });
        await reg.destroy();
        return true;
    }
}

// ── Helper: Tạo / cập nhật bản ghi trong bảng promotions ──────────────────────
// Cần thiết vì tickets.code_promotion FK → promotions.Code
async function _upsertPromotionRecord(code, reg, expiryDate, transaction) {
    const dtype = reg.discount_type;
    const discountPercent = dtype?.DiscountPercentage ?? (dtype?.is_free ? 100 : 0);
    const name = dtype?.Name ? `[Ưu đãi] ${dtype.Name}` : 'Ưu đãi cá nhân';

    await db.promotions.upsert({
        Code: code,
        Name: name,
        Description: `Voucher cá nhân - phát sinh từ đăng ký ưu đãi #${reg.id}`,
        DiscountAmount: null,
        DiscountPercent: discountPercent,
        StartDate: reg.validation_Date || new Date(),
        EndDate: expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000),
        isActive: true,
    }, { transaction });
}

module.exports = new DiscountRegistrationService();
