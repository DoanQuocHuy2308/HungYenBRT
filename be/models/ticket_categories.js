const { DataTypes } = require('sequelize');

/**
 * ticket_categories — Kiểu vé (3 hàng cố định, không thay đổi)
 *   TRIP  → Vé Lượt:      chọn điểm đi + điểm đến
 *   TIME  → Vé Thời Gian: toàn tuyến, giới hạn thời gian, yêu cầu KYC
 *   PROMO → Vé Ưu Đãi:    toàn tuyến, đối tượng ưu đãi, yêu cầu KYC
 */
module.exports = (sequelize) => {
    const TicketCategory = sequelize.define('ticket_categories', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            comment: 'TRIP | TIME | PROMO'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        requires_route: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Nếu true: Bắt buộc chọn điểm đi/điểm đến (Thường dùng cho Vé Lượt)'
        },
        requires_kyc_default: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Cờ mặc định xem danh mục này có cần xác thực danh tính/khuôn mặt không'
        },
        sort_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'ticket_categories',
        timestamps: false
    });

    TicketCategory.associate = (models) => {
        TicketCategory.hasMany(models.ticket_types, {
            foreignKey: 'Id_Category',
            as: 'ticket_types'
        });
    };

    return TicketCategory;
};
