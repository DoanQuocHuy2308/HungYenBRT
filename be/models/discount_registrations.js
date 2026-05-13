const { DataTypes } = require('sequelize');

/**
 * discount_registrations — Hồ sơ đăng ký ưu đãi của hành khách
 *
 * Luồng:
 *   1. Hành khách nộp hồ sơ qua app → status = 'pending'
 *   2. Nhân viên/admin duyệt:
 *      - approved → set expiry_date (thường 1 năm), approved_by
 *      - rejected → set rejected_reason
 *   3. Khi mua vé PROMO: hệ thống kiểm tra registration đang approved & chưa hết hạn
 *      → áp dụng mức giảm của discount_type tương ứng
 */
module.exports = (sequelize) => {
    const DiscountRegistration = sequelize.define('discount_registrations', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_User: {
            type: DataTypes.UUID,
            allowNull: false
        },
        id_Discount_Type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired'),
            defaultValue: 'pending',
            comment: 'pending=chờ duyệt | approved=đã duyệt | rejected=từ chối | expired=hết hạn'
        },
        registration_Date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        validation_Date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Ngày duyệt hồ sơ'
        },
        expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Ngày hết hạn ưu đãi (sau khi được duyệt)'
        },
        rejected_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Lý do từ chối hồ sơ'
        },
        approved_by: {
            type: DataTypes.CHAR(36),
            allowNull: true,
            comment: 'UUID nhân viên đã duyệt hồ sơ'
        },
        PromotionCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Mã Promotion được gửi cho người dùng'
        }
    }, {
        timestamps: false
    });

    DiscountRegistration.associate = (models) => {
        DiscountRegistration.belongsTo(models.users, { foreignKey: 'id_User', as: 'user' });
        DiscountRegistration.belongsTo(models.discount_types, { foreignKey: 'id_Discount_Type', as: 'discount_type' });
        DiscountRegistration.hasMany(models.discount_field_values, { foreignKey: 'id_discountRegistration', as: 'field_values' });
        DiscountRegistration.belongsTo(models.promotions, { foreignKey: 'PromotionCode', targetKey: 'Code', as: 'promotion' });
    };

    return DiscountRegistration;
};
