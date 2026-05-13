const db = require('../models');
const { Op } = require('sequelize');

function generateVoucherCode(prefix = 'UD') {
    const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${rand()}-${rand()}`;
}

class VoucherService {
    async getMyVouchers(Id_User) {
        const registrations = await db.discount_registrations.findAll({
            where: {
                id_User: Id_User,
                status: 'approved',
                PromotionCode: { [Op.ne]: null },
                expiry_date: { [Op.gte]: new Date() }
            },
            include: [
                {
                    model: db.discount_types,
                    as: 'discount_type',
                    attributes: ['Name', 'DiscountPercentage', 'is_free', 'max_discount_value']
                },
                {
                    model: db.promotions,
                    as: 'promotion'
                }
            ],
            order: [['validation_Date', 'DESC']]
        });

        return registrations.map(reg => ({
            Code: reg.PromotionCode,
            Start_Date: reg.validation_Date,
            End_Date: reg.expiry_date,
            is_active: true,
            registration: {
                discount_type: reg.discount_type
            },
            promotion: reg.promotion
        }));
    }

    async getVoucherByCodeAndUser(code, Id_User) {
        const reg = await db.discount_registrations.findOne({
            where: {
                id_User: Id_User,
                status: 'approved',
                PromotionCode: code,
                expiry_date: { [Op.gte]: new Date() }
            },
            include: [
                {
                    model: db.discount_types,
                    as: 'discount_type',
                    attributes: ['Name', 'DiscountPercentage', 'is_free', 'max_discount_value']
                },
                {
                    model: db.promotions,
                    as: 'promotion'
                }
            ]
        });

        if (!reg) return null;

        return {
            Code: reg.PromotionCode,
            Start_Date: reg.validation_Date,
            End_Date: reg.expiry_date,
            is_active: true,
            registration: {
                discount_type: reg.discount_type
            },
            promotion: reg.promotion
        };
    }

    // Sinh mã + tạo promotions record cho các hồ sơ đã duyệt nhưng chưa có mã
    async resyncMissingCodes() {
        const missing = await db.discount_registrations.findAll({
            where: {
                status: 'approved',
                [Op.or]: [{ PromotionCode: null }, { PromotionCode: '' }]
            },
            include: [{ model: db.discount_types, as: 'discount_type' }]
        });

        let count = 0;
        for (const reg of missing) {
            let prefix = 'UD';
            if (reg.discount_type?.Code) prefix = reg.discount_type.Code.substring(0, 3).toUpperCase();
            else if (reg.discount_type?.Name) prefix = reg.discount_type.Name.substring(0, 2).toUpperCase();

            let code = generateVoucherCode(prefix);
            while (await db.discount_registrations.findOne({ where: { PromotionCode: code } })) {
                code = generateVoucherCode(prefix);
            }
            await reg.update({ PromotionCode: code });
            // Tạo bản ghi trong promotions để FK hợp lệ
            await _upsertPromotionFromReg(code, reg);
            count++;
        }

        // Cũng fix các mã đã có nhưng chưa có promotions record
        const approvedWithCode = await db.discount_registrations.findAll({
            where: { status: 'approved', PromotionCode: { [Op.ne]: null } },
            include: [{ model: db.discount_types, as: 'discount_type' }]
        });
        for (const reg of approvedWithCode) {
            const already = await db.promotions.findByPk(reg.PromotionCode);
            if (!already) {
                await _upsertPromotionFromReg(reg.PromotionCode, reg);
                count++;
            }
        }

        return count;
    }
}

// Helper ngoài class (không cần transaction)
async function _upsertPromotionFromReg(code, reg) {
    const dtype = reg.discount_type;
    const discountPercent = dtype?.DiscountPercentage ?? (dtype?.is_free ? 100 : 0);
    const name = dtype?.Name ? `[Ưu đãi] ${dtype.Name}` : 'Ưu đãi cá nhân';
    await db.promotions.upsert({
        Code: code,
        Name: name,
        Description: `Voucher cá nhân #${reg.id}`,
        DiscountAmount: null,
        DiscountPercent: discountPercent,
        StartDate: reg.validation_Date || new Date(),
        EndDate: reg.expiry_date || new Date(Date.now() + 365 * 24 * 3600 * 1000),
        isActive: true,
    });
}

module.exports = new VoucherService();
