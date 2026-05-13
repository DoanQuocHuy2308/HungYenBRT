const { DataTypes } = require('sequelize');

/**
 * discount_types — Loại ưu đãi
 *
 * Ví dụ:
 *   Học sinh/Sinh viên: DiscountPercentage=50, is_free=false
 *   Người cao tuổi:    DiscountPercentage=100, is_free=true
 *   Người khuyết tật:  DiscountPercentage=100, is_free=true
 *
 * Logic áp giá khi mua vé PROMO:
 *   if (is_free)      → final_price = 0
 *   else              → final_price = base_price * (1 - DiscountPercentage / 100)
 *   if (max_discount_value != null) → giảm không quá max_discount_value VND
 */
module.exports = (sequelize) => {
    const DiscountType = sequelize.define('discount_types', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        DiscountPercentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Phần trăm giảm (0-100)'
        },
        is_free: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'true = miễn phí hoàn toàn (bỏ qua DiscountPercentage khi tính giá)'
        },
        max_discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Giá trị giảm tối đa (VND). NULL = không giới hạn'
        },
        requires_document: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Có yêu cầu nộp giấy tờ chứng minh không'
        },
        sort_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        timestamps: false
    });

    DiscountType.associate = (models) => {
        DiscountType.hasMany(models.discount_registrations, { foreignKey: 'id_Discount_Type' });
        DiscountType.hasMany(models.discount_fields, { foreignKey: 'id_Discount_Type' });
        DiscountType.hasMany(models.ticket_types, {
            foreignKey: 'id_discount_type',
            as: 'ticket_types'
        });
    };

    return DiscountType;
};
