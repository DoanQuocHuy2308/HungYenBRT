const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DiscountFieldValue = sequelize.define('discount_field_values', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_Discount_Field: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_discountRegistration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        field_Value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    DiscountFieldValue.associate = (models) => {
        DiscountFieldValue.belongsTo(models.discount_fields, { foreignKey: 'id_Discount_Field' });
        DiscountFieldValue.belongsTo(models.discount_registrations, { foreignKey: 'id_discountRegistration' });
    };

    return DiscountFieldValue;
};
