const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Payment = sequelize.define('payments', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        PaymentMethod: {
            type: DataTypes.STRING,
            allowNull: false
        },
        TransactionId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    Payment.associate = (models) => {
        Payment.hasMany(models.tickets, { foreignKey: 'id_payment', as: 'tickets' });
    };

    return Payment;
};
