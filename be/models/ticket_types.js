const { DataTypes } = require('sequelize');

/**
 * ticket_types — Loại vé (do admin cấu hình)
 *
 * Logic theo Id_Category:
 *   TRIP  (1) → Duration_Day = 1, requiresFace = false
 *                Khi mua: bắt buộc chọn From_Location + To_Location trong bảng tickets
 *   TIME  (2) → Duration_Day = số ngày hiệu lực, requiresFace = true (bắt buộc)
 *                Đi toàn tuyến, không chọn điểm
 *   PROMO (3) → Tương tự TIME nhưng dành cho đối tượng ưu đãi (học sinh, người cao tuổi...)
 *                requiresFace = true (bắt buộc)
 */
module.exports = (sequelize) => {
    const TicketType = sequelize.define('ticket_types', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        Id_Category: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'FK → ticket_categories. (1: TRIP, 2: TIME, 3: PROMO)',
            field: 'id_category'
        },
        id_discount_type: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'FK → discount_types. Chỉ dùng với PROMO.'
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Tên loại vé (Ví dụ: Vé lượt, Vé ngày, Vé tháng...)',
            field: 'name'
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'description'
        },
        Duration_Day: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Thời hạn sử dụng: Lượt/Ngày=1, Tuần=7, Tháng=30, Năm=365',
            field: 'duration_day'
        },
        requiresFace: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Bắt buộc quét mặt? (TRIP và DAILY=false, WEEK/MONTH/YEAR=true)'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: false
    });

    TicketType.associate = (models) => {
        TicketType.belongsTo(models.ticket_categories, {
            foreignKey: 'Id_Category',
            as: 'category'
        });
        TicketType.belongsTo(models.discount_types, {
            foreignKey: 'id_discount_type',
            as: 'discount_type'
        });
        TicketType.hasMany(models.ticket_details, { foreignKey: 'Id_Ticket_Type' });
        TicketType.hasMany(models.ticket_prices, { foreignKey: 'Id_Ticket_Type' });
    };

    return TicketType;
};
