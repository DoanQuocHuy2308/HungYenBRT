const { DataTypes } = require('sequelize');

/**
 * vouchers — Mã giảm giá định danh dành cho người dùng
 * 
 * Được sinh ra sau khi hồ sơ discount_registrations được duyệt.
 * Chỉ áp dụng cho danh mục Vé Thời Gian (TIME).
 */
module.exports = (sequelize) => {
    const Voucher = sequelize.define('vouchers', {
        Id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        Code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Mã giảm giá (ví dụ: SV2024-XXXX)'
        },
        Id_User: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'Chủ sở hữu voucher'
        },
        Id_Discount_Registration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'FK → discount_registrations. Toàn bộ thông tin tên/loại ưu đãi sẽ lấy từ đây.'
        },
        applicable_category_code: {
            type: DataTypes.STRING(20),
            defaultValue: 'TIME',
            allowNull: false,
            comment: 'Giới hạn áp dụng cho danh mục nào (Mặc định: TIME)'
        },
        Start_Date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        End_Date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Hết hạn theo niên khóa/giấy tờ (Lấy từ registration.expiry_date)'
        },
        Usage_Limit: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Số lần sử dụng tối đa. NULL = không giới hạn trong thời gian hiệu lực'
        },
        is_active: {   
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true,
        tableName: 'vouchers'
    });

    Voucher.associate = (models) => {
        Voucher.belongsTo(models.users, { foreignKey: 'Id_User', as: 'user' });
        Voucher.belongsTo(models.discount_registrations, { foreignKey: 'Id_Discount_Registration', as: 'registration' });
    };

    return Voucher;
};
