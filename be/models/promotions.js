const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Promotion = sequelize.define('promotions', {
        Code: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        DiscountAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        DiscountPercent: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        StartDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        EndDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        ImageUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    Promotion.associate = (models) => {
        Promotion.hasMany(models.tickets, { foreignKey: 'code_promotion' });
    };

    return Promotion;
};
