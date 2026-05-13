const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PaymentMethod = sequelize.define('payment_methods', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        Name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true
    });

    PaymentMethod.associate = (models) => {
        PaymentMethod.hasMany(models.tickets, { foreignKey: 'id_payment_method', as: 'tickets' });
    };

    return PaymentMethod;
};
