const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DiscountField = sequelize.define('discount_fields', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_Discount_Type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        field_Name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        field_Type: {
            type: DataTypes.ENUM('text', 'image'),
            defaultValue: 'text',
            comment: 'Loại dữ liệu: text (nhập liệu) hoặc image (tải ảnh)'
        },
        is_Required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: false
    });

    DiscountField.associate = (models) => {
        DiscountField.belongsTo(models.discount_types, { foreignKey: 'id_Discount_Type' });
        DiscountField.hasMany(models.discount_field_values, { foreignKey: 'id_Discount_Field' });
    };

    return DiscountField;
};
